export type Handler = (request: Request) => Response | Promise<Response>;
export type Middleware = (next: Handler) => Handler;

export function compose(base: Handler, ...middleware: Middleware[]): Handler {
  return middleware.reduceRight((next, wrap) => wrap(next), base);
}

export function firstOf(...handlers: Handler[]): Handler {
  return async (request) => {
    for (const handler of handlers) {
      const response = await handler(request);

      if (response.status !== 404) {
        return response;
      }
    }

    return notFound();
  };
}

export function route(pathname: string, handler: Handler): Handler {
  return (request) => {
    const requestPath = new URL(request.url).pathname;

    if (requestPath !== pathname) {
      return notFound();
    }

    return handler(request);
  };
}

export function text(body: string, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);

  if (!headers.has("content-type")) {
    headers.set("content-type", "text/plain; charset=utf-8");
  }

  return new Response(body, {
    ...init,
    headers,
  });
}

export function notFound(): Response {
  return text("Not found\n", { status: 404 });
}

export function methodNotAllowed(allowed: readonly string[]): Response {
  return text("Method not allowed\n", {
    status: 405,
    headers: {
      allow: allowed.join(", "),
    },
  });
}

export function withMethods(allowed: readonly string[]): Middleware {
  return (next) => (request) => {
    if (!allowed.includes(request.method)) {
      return methodNotAllowed(allowed);
    }

    return next(request);
  };
}

// Content-Security-Policy scoped to exactly what the site loads: anime.js from
// cdnjs, Google Fonts CSS/font files, and a data: SVG used as a CSS texture.
// No 'unsafe-inline' because the markup has no inline scripts, styles, or
// handlers — keep it that way or this policy will block the offending asset.
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data:",
  "script-src 'self' https://cdnjs.cloudflare.com",
  "style-src 'self' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "connect-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

// Deny every powerful browser feature the teaser site does not use.
const PERMISSIONS_POLICY = [
  "accelerometer=()",
  "autoplay=()",
  "camera=()",
  "display-capture=()",
  "encrypted-media=()",
  "geolocation=()",
  "gyroscope=()",
  "magnetometer=()",
  "microphone=()",
  "midi=()",
  "payment=()",
  "usb=()",
].join(", ");

const HSTS_VALUE = "max-age=31536000; includeSubDomains";

export function withSecurityHeaders(next: Handler): Handler {
  return async (request) => {
    const response = await next(request);
    const headers = new Headers(response.headers);

    headers.set("content-security-policy", CONTENT_SECURITY_POLICY);
    headers.set("permissions-policy", PERMISSIONS_POLICY);
    headers.set("referrer-policy", "strict-origin-when-cross-origin");
    headers.set("x-content-type-options", "nosniff");
    headers.set("x-frame-options", "DENY");
    headers.set("cross-origin-opener-policy", "same-origin");
    headers.set("cross-origin-resource-policy", "same-origin");

    // HSTS is only meaningful — and only honored — over HTTPS. Nginx terminates
    // TLS and forwards the original scheme, so set it only when the edge served
    // the request over HTTPS to avoid pinning HSTS during plain-HTTP testing.
    if (request.headers.get("x-forwarded-proto") === "https") {
      headers.set("strict-transport-security", HSTS_VALUE);
    }

    return new Response(response.body, {
      headers,
      status: response.status,
      statusText: response.statusText,
    });
  };
}

export function withRequestLog(
  log: (message: string) => void = console.log,
): Middleware {
  return (next) => async (request) => {
    const started = performance.now();
    const response = await next(request);
    const elapsed = (performance.now() - started).toFixed(1);
    const path = new URL(request.url).pathname;

    log(`${request.method} ${path} -> ${response.status} ${elapsed}ms`);

    return response;
  };
}
