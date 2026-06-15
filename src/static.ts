import { serveDir } from "@std/http/file-server";
import type { Handler } from "./http.ts";

export function servePublicFiles(siteRoot: URL): Handler {
  const fsRoot = decodeURIComponent(siteRoot.pathname);

  return (request) =>
    serveDir(request, {
      fsRoot,
      quiet: true,
    });
}
