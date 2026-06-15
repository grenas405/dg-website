import { serveDir } from "@std/http/file-server";
import { resolve, SEPARATOR } from "@std/path";
import { type Handler, notFound } from "./http.ts";

/**
 * Resolve a request pathname against `root` and confirm it cannot escape it.
 *
 * `serveDir` already rejects traversal, but a security boundary should not be
 * single-trusted to a dependency: this is an explicit, auditable gate using
 * `@std/path`. Percent-encoding is decoded first so encoded attempts (e.g.
 * `%2e%2e`) are caught, `..` segments are collapsed by `resolve`, and the
 * result must still live under the resolved root.
 *
 * Returns `false` for any path that escapes the root, contains a NUL byte, or
 * carries malformed percent-encoding.
 */
export function isPathWithinRoot(root: string, requestPath: string): boolean {
  let decoded: string;
  try {
    decoded = decodeURIComponent(requestPath);
  } catch {
    return false;
  }

  if (decoded.includes("\0")) {
    return false;
  }

  const rootResolved = resolve(root);
  // Treat the URL path as relative to the root, then let `resolve` collapse any
  // `.`/`..` segments. An escaping path resolves to somewhere outside the root.
  const target = resolve(rootResolved, `.${decoded}`);

  return target === rootResolved ||
    target.startsWith(rootResolved + SEPARATOR);
}

export function servePublicFiles(siteRoot: URL): Handler {
  const fsRoot = resolve(decodeURIComponent(siteRoot.pathname));

  return (request) => {
    const pathname = new URL(request.url).pathname;

    if (!isPathWithinRoot(fsRoot, pathname)) {
      return notFound();
    }

    return serveDir(request, {
      fsRoot,
      quiet: true,
      // Explicit hardening: never serve dotfiles (e.g. .env, .git) and never
      // expose a browsable directory index now that public/ is the boundary.
      showDotfiles: false,
      showDirListing: false,
    });
  };
}
