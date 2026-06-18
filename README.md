# DenoGenesis

DenoGenesis is a Deno-powered teaser site for democratizing web development in
Oklahoma City and beyond. The frontend files are intentionally simple:
`public/index.html`, `public/main.css`, and `public/script.js` remain the source
of the visible site, while Deno provides the HTTP process around them.

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

Install the systemd service on the VPS:

```sh
sudo cp deploy/systemd/denogenesis.service /etc/systemd/system/denogenesis.service
sudo systemctl daemon-reload
sudo systemctl enable --now denogenesis.service
sudo systemctl status denogenesis.service
```

Read service logs:

```sh
journalctl -u denogenesis.service -f
```

Install the reverse proxy. The shipped config terminates HTTPS, so a certificate
must exist before `nginx -t` will pass. Prerequisites: DNS A/AAAA records for
`denogenesis.com` and `www.denogenesis.com` pointing at the VPS, and ports
80/443 open.

1. Obtain the first certificate (brief downtime while certbot binds port 80):

   ```sh
   sudo mkdir -p /var/www/certbot
   sudo systemctl stop nginx
   sudo certbot certonly --standalone \
     -d denogenesis.com -d www.denogenesis.com \
     --agree-tos -m pedro.dfedro@gmail.com --no-eff-email
   ```

2. Deploy the proxy config and start nginx:

   ```sh
   sudo cp deploy/nginx/denogenesis.com.conf /etc/nginx/sites-available/denogenesis.com
   sudo ln -sf /etc/nginx/sites-available/denogenesis.com /etc/nginx/sites-enabled/denogenesis.com
   sudo nginx -t
   sudo systemctl start nginx
   ```

3. Switch renewals to the zero-downtime webroot method (the deployed config
   serves `/.well-known/acme-challenge/` from `/var/www/certbot` over HTTP),
   then confirm auto-renewal works:

   ```sh
   sudo certbot certonly --webroot -w /var/www/certbot \
     -d denogenesis.com -d www.denogenesis.com
   sudo certbot renew --dry-run
   ```

HTTP is redirected to HTTPS, and the app emits `Strict-Transport-Security`
automatically once requests arrive with `X-Forwarded-Proto: https`.

## Check

```sh
deno task check
deno task fmt
deno task lint
deno task test
```

## Security

The app follows OWASP secure-defaults for a static site:

- A strict `Content-Security-Policy` allows only the origins the site uses
  (`cdnjs.cloudflare.com` for anime.js, Google Fonts) with no `unsafe-inline` or
  `unsafe-eval`. Adding an inline `<script>`/`<style>` or a new CDN requires
  updating the policy in `src/http.ts`.
- `Permissions-Policy`, `Referrer-Policy`, `X-Content-Type-Options: nosniff`,
  `X-Frame-Options: DENY`, `Cross-Origin-Opener-Policy`, and
  `Cross-Origin-Resource-Policy` are set on every response.
- Nginx terminates TLS (TLS 1.2/1.3, Mozilla "intermediate" ciphers, OCSP
  stapling) and 301-redirects all HTTP to HTTPS. `Strict-Transport-Security` is
  sent by the app only when the request arrives with `X-Forwarded-Proto: https`,
  so it activates automatically behind the HTTPS proxy.
- `serveDir` runs with `showDotfiles: false` and `showDirListing: false`, so
  dotfiles and directory indexes are never exposed from `public/`.
- An explicit path-traversal gate (`isPathWithinRoot` in `src/static.ts`, built
  on `@std/path`) decodes and resolves each request path and rejects anything
  that would escape `public/` — including `..` and percent-encoded variants —
  before `serveDir` runs.
- Nginx adds `server_tokens off`, a request-body cap, per-IP rate limiting, and
  rejects non-`GET`/`HEAD` methods at the edge.
- `POST` is permitted only on `/api/waitlist` (app) and a dedicated Nginx
  `location /api/` with a tighter rate limit and a `2k` body cap. Deno write
  access is scoped to the KV directory (`--allow-write=data`).
- The `start` task runs with `--allow-read=public` so the process can only read
  the served directory (module/config loading is runtime-privileged and
  unaffected). This is an OS-level backstop to the traversal gate. The scope is
  relative to `deno.json`, so it is independent of where the repo is deployed.

## Architecture

The server follows a small, composable shape:

- `main.ts` starts Deno and owns process-level concerns.
- `src/config.ts` reads environment configuration.
- `src/http.ts` defines request handlers, middleware (including the security
  headers and method guard), routing helpers, and response helpers.
- `src/static.ts` uses JSR `@std/http/file-server` `serveDir` to serve the
  `public/` directory directly via `fsRoot`.
- `src/waitlist.ts` stores founding-member signups in Deno KV and exposes the
  `/api/waitlist` join (`POST`) and count (`GET`) handlers.
- `src/app.ts` assembles the health route, waitlist route, static file route,
  security headers, method guard, and request logging.
- `deploy/systemd/denogenesis.service` runs the Deno app from
  `/home/sysadmin/.local/src/development/dg-website` as the `sysadmin` user.
- `deploy/nginx/denogenesis.com.conf` reverse proxies `denogenesis.com` and
  `www.denogenesis.com` to the Deno process at `127.0.0.1:8004`.

Public routes:

- `GET /healthz`
- `GET /` and any file under `public/` (e.g. `/index.html`, `/main.css`,
  `/script.js`, `/robots.txt`, `/sitemap.xml`), served directly from the
  `public/` directory.
- `GET /api/waitlist` — returns the current waitlist count as JSON.
- `POST /api/waitlist` — joins the waitlist with a JSON `{ "email": "..." }`
  body; returns `{ status, position, total }`.

`HEAD` is allowed for the read paths. `POST` is allowed only on `/api/waitlist`.
Other methods return `405`.

## Waitlist (Deno KV)

The waitlist persists to Deno KV (`src/waitlist.ts`). The store path defaults to
`./data/waitlist.db` and is overridable with `KV_PATH`. Positions are assigned
atomically with optimistic retry, so concurrent signups never collide, and joins
are idempotent per email. The KV data directory is git-ignored. The `start` task
grants `--allow-write=data` (and reads `public,data`) and enables the `kv`
unstable flag via `deno.json`.

## Content Metadata

- Audience: creators, local builders, and early DenoGenesis followers.
- Location signal: Oklahoma City, Oklahoma.
- GitHub status: github repo coming soon!
- Promotional link: https://pedromdominguez.com

## Agent Notes

See `AGENTS.md` for AI-agent maintenance rules. In short: keep functions
explicit, prefer composition over shared state, preserve the current frontend
assets unless a change is intentional, and remember that every file placed in
`public/` is served publicly.
