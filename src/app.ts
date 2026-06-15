import {
  compose,
  firstOf,
  type Handler,
  route,
  text,
  withMethods,
  withRequestLog,
  withSecurityHeaders,
} from "./http.ts";
import { servePublicFiles } from "./static.ts";
import { waitlistRoutes } from "./waitlist.ts";

export function health(): Response {
  return text("ok\n");
}

export function createApp(siteRoot: URL, kv: Deno.Kv): Handler {
  const routes = firstOf(
    // healthz and static assets stay read-only; the waitlist route owns POST.
    route("/healthz", compose(() => health(), withMethods(["GET", "HEAD"]))),
    route("/api/waitlist", waitlistRoutes(kv)),
    servePublicFiles(siteRoot),
  );

  return compose(
    routes,
    withRequestLog(),
    withSecurityHeaders,
    withMethods(["GET", "HEAD", "POST"]),
  );
}
