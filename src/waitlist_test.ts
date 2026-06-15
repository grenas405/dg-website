import { assert, assertEquals } from "@std/assert";
import {
  isValidEmail,
  joinWaitlist,
  normalizeEmail,
  waitlistRoutes,
  waitlistTotal,
} from "./waitlist.ts";

async function withKv(fn: (kv: Deno.Kv) => Promise<void>): Promise<void> {
  const kv = await Deno.openKv(":memory:");
  try {
    await fn(kv);
  } finally {
    kv.close();
  }
}

Deno.test("normalizeEmail trims and lowercases", () => {
  assertEquals(normalizeEmail("  Pedro@Example.COM "), "pedro@example.com");
});

Deno.test("isValidEmail accepts plausible addresses and rejects junk", () => {
  assert(isValidEmail("a@b.co"));
  assert(!isValidEmail("nope"));
  assert(!isValidEmail("no@domain"));
  assert(!isValidEmail("a b@c.com"));
  assert(!isValidEmail(""));
  assert(!isValidEmail("a@b." + "x".repeat(300)));
});

Deno.test("joinWaitlist assigns sequential positions and a total", async () => {
  await withKv(async (kv) => {
    const first = await joinWaitlist(kv, "one@example.com");
    const second = await joinWaitlist(kv, "two@example.com");

    assertEquals(first, { status: "added", position: 1, total: 1 });
    assertEquals(second, { status: "added", position: 2, total: 2 });
    assertEquals(await waitlistTotal(kv), 2);
  });
});

Deno.test("joinWaitlist is idempotent per email and keeps the position", async () => {
  await withKv(async (kv) => {
    await joinWaitlist(kv, "dup@example.com");
    const again = await joinWaitlist(kv, "  DUP@Example.com ");

    assertEquals(again.status, "existing");
    assertEquals(again.status === "existing" && again.position, 1);
    assertEquals(await waitlistTotal(kv), 1); // no double-count
  });
});

Deno.test("joinWaitlist rejects invalid email", async () => {
  await withKv(async (kv) => {
    assertEquals(await joinWaitlist(kv, "garbage"), { status: "invalid" });
    assertEquals(await waitlistTotal(kv), 0);
  });
});

Deno.test("concurrent joins never reuse a position", async () => {
  await withKv(async (kv) => {
    const emails = Array.from({ length: 25 }, (_, i) => `u${i}@example.com`);
    const results = await Promise.all(emails.map((e) => joinWaitlist(kv, e)));

    const positions = results.map((r) => r.status === "added" ? r.position : -1)
      .sort((a, b) => a - b);
    assertEquals(positions, emails.map((_, i) => i + 1));
    assertEquals(await waitlistTotal(kv), 25);
  });
});

Deno.test("POST /api/waitlist adds and returns 201 with position", async () => {
  await withKv(async (kv) => {
    const handler = waitlistRoutes(kv);
    const res = await handler(
      new Request("http://localhost/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: "new@example.com" }),
      }),
    );
    assertEquals(res.status, 201);
    const body = await res.json();
    assertEquals(body.status, "added");
    assertEquals(body.position, 1);
  });
});

Deno.test("GET /api/waitlist returns the count", async () => {
  await withKv(async (kv) => {
    await joinWaitlist(kv, "x@example.com");
    const handler = waitlistRoutes(kv);
    const res = await handler(new Request("http://localhost/api/waitlist"));
    assertEquals(res.status, 200);
    assertEquals((await res.json()).total, 1);
  });
});

Deno.test("honeypot submissions are accepted but not stored", async () => {
  await withKv(async (kv) => {
    const handler = waitlistRoutes(kv);
    const res = await handler(
      new Request("http://localhost/api/waitlist", {
        method: "POST",
        body: JSON.stringify({ email: "bot@example.com", company: "Acme" }),
      }),
    );
    assertEquals(res.status, 201);
    await res.body?.cancel();
    assertEquals(await waitlistTotal(kv), 0); // not persisted
  });
});

Deno.test("invalid JSON and bad email are rejected with 400", async () => {
  await withKv(async (kv) => {
    const handler = waitlistRoutes(kv);

    const badJson = await handler(
      new Request("http://localhost/api/waitlist", {
        method: "POST",
        body: "{not json",
      }),
    );
    assertEquals(badJson.status, 400);
    await badJson.body?.cancel();

    const badEmail = await handler(
      new Request("http://localhost/api/waitlist", {
        method: "POST",
        body: JSON.stringify({ email: "nope" }),
      }),
    );
    assertEquals(badEmail.status, 400);
    await badEmail.body?.cancel();
  });
});

Deno.test("PUT /api/waitlist is rejected with 405", async () => {
  await withKv(async (kv) => {
    const handler = waitlistRoutes(kv);
    const res = await handler(
      new Request("http://localhost/api/waitlist", { method: "PUT" }),
    );
    assertEquals(res.status, 405);
    await res.body?.cancel();
  });
});
