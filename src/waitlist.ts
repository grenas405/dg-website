import { z } from "zod";

import { type Handler, json, methodNotAllowed } from "./http.ts";

export type WaitlistEntry = {
  email: string;
  position: number;
  joinedAt: string;
};

export type JoinResult =
  | { status: "added"; position: number; total: number }
  | { status: "existing"; position: number; total: number }
  | { status: "invalid" };

// Deliberately permissive single-line check: reject obviously malformed input
// without trying to fully validate RFC 5322 (impractical and lossy).
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const MAX_EMAIL_LENGTH = 254;
// Assigning a unique sequential position requires serializing on the shared
// counter, so a burst of concurrent joins contends on it. The retry budget
// must comfortably exceed expected concurrency; backoff+jitter spreads the
// contenders so they resolve well within it.
const MAX_ATTEMPTS = 64;
const BACKOFF_CAP_MS = 40;

const EMAIL_KEY_PREFIX = "waitlist";
const TOTAL_KEY = ["waitlist_total"];

// POST /api/waitlist body. Both fields default to "" so an absent field and an
// empty one behave identically (email falls through to invalid_email, and the
// honeypot still catches bots that omit the email entirely). Wrong types are
// rejected as invalid_request; unknown extra keys are ignored.
export const joinPayloadSchema = z.object({
  email: z.string().default(""),
  company: z.string().default(""),
});

function backoffDelay(attempt: number): Promise<void> {
  const base = Math.min(2 ** attempt, BACKOFF_CAP_MS);
  const ms = Math.random() * base;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return email.length > 0 && email.length <= MAX_EMAIL_LENGTH &&
    EMAIL_PATTERN.test(email);
}

export async function waitlistTotal(kv: Deno.Kv): Promise<number> {
  const total = await kv.get<Deno.KvU64>(TOTAL_KEY);
  return Number(total.value?.value ?? 0n);
}

/**
 * Add an email to the waitlist, assigning the next sequential position.
 *
 * The position counter and the per-email record are updated together in a
 * single atomic transaction guarded by version checks, so concurrent joins
 * never collide or reuse a position. On a lost race the read is retried.
 */
export async function joinWaitlist(
  kv: Deno.Kv,
  rawEmail: string,
): Promise<JoinResult> {
  const email = normalizeEmail(rawEmail);
  if (!isValidEmail(email)) return { status: "invalid" };

  const emailKey = [EMAIL_KEY_PREFIX, email];

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const [entry, total] = await kv.getMany<[WaitlistEntry, Deno.KvU64]>([
      emailKey,
      TOTAL_KEY,
    ]);

    const currentTotal = Number(total.value?.value ?? 0n);

    if (entry.value) {
      return {
        status: "existing",
        position: entry.value.position,
        total: currentTotal,
      };
    }

    const position = currentTotal + 1;
    const record: WaitlistEntry = {
      email,
      position,
      joinedAt: new Date().toISOString(),
    };

    const result = await kv.atomic()
      .check(entry) // the email is still absent
      .check(total) // the counter is unchanged since we read it
      .set(emailKey, record)
      .sum(TOTAL_KEY, 1n)
      .commit();

    if (result.ok) {
      return { status: "added", position, total: position };
    }
    // Lost the race against a concurrent join; back off, then re-read and retry.
    await backoffDelay(attempt);
  }

  throw new Error("joinWaitlist: exceeded retry budget under contention");
}

export function waitlistRoutes(kv: Deno.Kv): Handler {
  return async (request) => {
    // GET/HEAD return the live count for social proof on the landing page.
    if (request.method === "GET" || request.method === "HEAD") {
      return json({ total: await waitlistTotal(kv) });
    }

    if (request.method !== "POST") {
      return methodNotAllowed(["GET", "HEAD", "POST"]);
    }

    const body = await request.json().catch(() => undefined);
    const parsed = joinPayloadSchema.safeParse(body);
    if (!parsed.success) {
      return json({ error: "invalid_request" }, { status: 400 });
    }
    const { email, company } = parsed.data;

    // Honeypot: real users never see or fill the "company" field. If a bot
    // does, return a success-shaped response without touching the store.
    if (company.trim() !== "") {
      return json({ status: "added" }, { status: 201 });
    }

    const result = await joinWaitlist(kv, email);

    if (result.status === "invalid") {
      return json({ error: "invalid_email" }, { status: 400 });
    }

    return json(
      { status: result.status, position: result.position, total: result.total },
      { status: result.status === "added" ? 201 : 200 },
    );
  };
}
