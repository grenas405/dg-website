import { serveDir } from "@std/http/file-server";
import type { Handler } from "./http.ts";

export function servePublicFiles(siteRoot: URL): Handler {
  const fsRoot = decodeURIComponent(siteRoot.pathname);

  return (request) =>
    serveDir(request, {
      fsRoot,
      quiet: true,
      // Explicit hardening: never serve dotfiles (e.g. .env, .git) and never
      // expose a browsable directory index now that public/ is the boundary.
      showDotfiles: false,
      showDirListing: false,
    });
}
