import { serveFile } from "@std/http/file-server";
import { type Handler, notFound } from "./http.ts";

const PUBLIC_FILES = new Map<string, string>([
  ["/", "index.html"],
  ["/index.html", "index.html"],
  ["/main.css", "main.css"],
  ["/script.js", "script.js"],
]);

export function publicFileFor(pathname: string): string | undefined {
  return PUBLIC_FILES.get(pathname);
}

export function siteFilePath(siteRoot: URL, fileName: string): string {
  return decodeURIComponent(new URL(fileName, siteRoot).pathname);
}

export function servePublicFiles(siteRoot: URL): Handler {
  return (request) => {
    const pathname = new URL(request.url).pathname;
    const fileName = publicFileFor(pathname);

    if (fileName === undefined) {
      return notFound();
    }

    return serveFile(request, siteFilePath(siteRoot, fileName));
  };
}
