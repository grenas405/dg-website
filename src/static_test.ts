import { assert, assertFalse } from "@std/assert";
import { isPathWithinRoot } from "./static.ts";

const ROOT = "/srv/dg-website/public";

Deno.test("isPathWithinRoot allows paths inside the root", () => {
  assert(isPathWithinRoot(ROOT, "/"));
  assert(isPathWithinRoot(ROOT, "/index.html"));
  assert(isPathWithinRoot(ROOT, "/assets/main.css"));
  assert(isPathWithinRoot(ROOT, "/a/b/../b/c.js")); // resolves back inside
});

Deno.test("isPathWithinRoot rejects dot-dot traversal", () => {
  assertFalse(isPathWithinRoot(ROOT, "/../main.ts"));
  assertFalse(isPathWithinRoot(ROOT, "/../../etc/passwd"));
  assertFalse(isPathWithinRoot(ROOT, "/a/../../secret"));
});

Deno.test("isPathWithinRoot rejects percent-encoded traversal", () => {
  assertFalse(isPathWithinRoot(ROOT, "/%2e%2e/main.ts"));
  assertFalse(isPathWithinRoot(ROOT, "/%2e%2e%2f%2e%2e%2fetc/passwd"));
  assertFalse(isPathWithinRoot(ROOT, "/..%2fmain.ts"));
});

Deno.test("isPathWithinRoot rejects NUL bytes and malformed encoding", () => {
  assertFalse(isPathWithinRoot(ROOT, "/index.html%00.png"));
  assertFalse(isPathWithinRoot(ROOT, "/%ZZ"));
});

Deno.test("isPathWithinRoot does not treat a sibling prefix as inside", () => {
  // /srv/dg-website/public-secret must not count as within /srv/.../public
  assertFalse(isPathWithinRoot(ROOT, "/../public-secret/data"));
});
