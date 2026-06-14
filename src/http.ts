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

export function withSecurityHeaders(next: Handler): Handler {
  return async (request) => {
    const response = await next(request);
    const headers = new Headers(response.headers);

    headers.set("referrer-policy", "strict-origin-when-cross-origin");
    headers.set("x-content-type-options", "nosniff");
    headers.set("x-frame-options", "DENY");

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
