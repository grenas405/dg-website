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

export function health(): Response {
  return text("ok\n");
}

export function createApp(siteRoot: URL): Handler {
  const routes = firstOf(
    route("/healthz", () => health()),
    servePublicFiles(siteRoot),
  );

  return compose(
    routes,
    withRequestLog(),
    withSecurityHeaders,
    withMethods(["GET", "HEAD"]),
  );
}
