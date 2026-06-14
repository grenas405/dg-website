# DenoGenesis

DenoGenesis is a Deno-powered teaser site for democratizing web development in
Oklahoma City and beyond. The frontend files are intentionally simple:
`index.html`, `main.css`, and `script.js` remain the source of the visible site,
while Deno provides the HTTP process around them.

Pedro M. Dominguez is the developer and architect behind the project. Personal
and business work is available at https://pedromdominguez.com.

## Run

```sh
deno task dev
```

The dev task starts the app with file watching on `http://127.0.0.1:8004/`.

```sh
deno task start
```

Set `HOST` or `PORT` to override the default bind address:

```sh
HOST=0.0.0.0 PORT=8080 deno task start
```

For production, keep the Deno process on loopback and let Nginx handle public
traffic for `denogenesis.com`:

```sh
deno task start
```

Install the reverse proxy:

```sh
sudo cp deploy/nginx/denogenesis.com.conf /etc/nginx/sites-available/denogenesis.com
sudo ln -s /etc/nginx/sites-available/denogenesis.com /etc/nginx/sites-enabled/denogenesis.com
sudo nginx -t
sudo systemctl reload nginx
```

## Check

```sh
deno task check
deno task fmt
deno task lint
```

## Architecture

The server follows a small, composable shape:

- `main.ts` starts Deno and owns process-level concerns.
- `src/config.ts` reads environment configuration.
- `src/http.ts` defines request handlers, middleware, routing helpers, and
  response helpers.
- `src/static.ts` uses JSR `@std/http/file-server` to serve an explicit
  allowlist of public files.
- `src/app.ts` assembles the health route, static file route, security headers,
  method guard, and request logging.
- `deploy/nginx/denogenesis.com.conf` reverse proxies `denogenesis.com` and
  `www.denogenesis.com` to the Deno process at `127.0.0.1:8004`.

Public routes:

- `GET /`
- `GET /index.html`
- `GET /main.css`
- `GET /script.js`
- `GET /healthz`

`HEAD` is allowed for the same paths. Other methods return `405`.

## Content Metadata

- Audience: creators, local builders, and early DenoGenesis followers.
- Location signal: Oklahoma City, Oklahoma.
- GitHub status: github repo coming soon!
- Promotional link: https://pedromdominguez.com

## Agent Notes

See `AGENTS.md` for AI-agent maintenance rules. In short: keep functions
explicit, prefer composition over shared state, preserve the current frontend
assets unless a change is intentional, and do not expose new files publicly
without adding them to the static allowlist.
