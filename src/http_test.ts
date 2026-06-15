import { assert, assertEquals, assertFalse } from "@std/assert";
import { text, withMethods, withSecurityHeaders } from "./http.ts";

function get(headers: HeadersInit = {}): Request {
  return new Request("http://localhost/", { headers });
}

Deno.test("withSecurityHeaders sets the core OWASP headers", async () => {
  const handler = withSecurityHeaders(() => text("ok"));
  const response = await handler(get());
  await response.body?.cancel();

  assertEquals(response.headers.get("x-content-type-options"), "nosniff");
  assertEquals(response.headers.get("x-frame-options"), "DENY");
  assertEquals(
    response.headers.get("referrer-policy"),
    "strict-origin-when-cross-origin",
  );
  assertEquals(
    response.headers.get("cross-origin-opener-policy"),
    "same-origin",
  );
  assertEquals(
    response.headers.get("cross-origin-resource-policy"),
    "same-origin",
  );
});

Deno.test("Content-Security-Policy locks default-src to self without unsafe-inline", async () => {
  const handler = withSecurityHeaders(() => text("ok"));
  const response = await handler(get());
  await response.body?.cancel();

  const csp = response.headers.get("content-security-policy") ?? "";
  assert(csp.includes("default-src 'self'"));
  assert(csp.includes("frame-ancestors 'none'"));
  assert(csp.includes("object-src 'none'"));
  // Only the origins the site actually uses are allowed.
  assert(csp.includes("script-src 'self' https://cdnjs.cloudflare.com"));
  assert(csp.includes("font-src 'self' https://fonts.gstatic.com"));
  assertFalse(csp.includes("unsafe-inline"));
  assertFalse(csp.includes("unsafe-eval"));
});

Deno.test("HSTS is omitted over plain HTTP and set when forwarded over HTTPS", async () => {
  const handler = withSecurityHeaders(() => text("ok"));

  const overHttp = await handler(get());
  await overHttp.body?.cancel();
  assertEquals(overHttp.headers.get("strict-transport-security"), null);

  const overHttps = await handler(get({ "x-forwarded-proto": "https" }));
  await overHttps.body?.cancel();
  assert(
    overHttps.headers.get("strict-transport-security")?.includes("max-age="),
  );
});

Deno.test("withMethods rejects anything outside GET/HEAD", async () => {
  const handler = withMethods(["GET", "HEAD"])(() => text("ok"));
  const response = await handler(
    new Request("http://localhost/", { method: "POST" }),
  );
  await response.body?.cancel();

  assertEquals(response.status, 405);
  assertEquals(response.headers.get("allow"), "GET, HEAD");
});
