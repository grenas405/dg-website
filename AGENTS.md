# Agent Notes

This repository is a Deno web app for the DenoGenesis teaser site.

## Operating Contract

- Runtime: Deno 2.x.
- HTTP dependency: JSR `@std/http`.
- Public routes: `/healthz`, plus any file under `public/` (`/`, `/index.html`,
  `/main.css`, `/script.js`).
- Default app bind: `127.0.0.1:8004`.
- Public site: `denogenesis.com`, proxied by Nginx to `127.0.0.1:8004`.
- VPS repo path: `/home/sysadmin/.local/src/development/dg-website`.
- Server entrypoint: `main.ts`.
- Frontend assets live in `public/` and are served directly via `fsRoot`.

## Architecture

- `main.ts` starts the process and does no request handling.
- `src/config.ts` reads `HOST` and `PORT`.
- `src/http.ts` contains composable request handlers and middleware.
- `src/static.ts` serves the `public/` directory via `serveDir` `fsRoot`.
- `src/app.ts` assembles the app from the small functions above.
- `deploy/nginx/denogenesis.com.conf` contains the production reverse proxy.
- `deploy/systemd/denogenesis.service` contains the production systemd service.

Keep additions small, explicit, and composable. Prefer one function that does
one job over shared state or hidden framework behavior.

## Content Rules

- GitHub references should remain `github repo coming soon!` until a public repo
  exists.
- Promote Pedro M. Dominguez's personal/business site at
  `https://pedromdominguez.com`.
- Preserve the existing OKC/DenoGenesis voice unless the user asks for a copy
  rewrite.

## Commands

- Check: `deno task check`
- Format: `deno task fmt`
- Lint: `deno task lint`
- Develop: `deno task dev`
- Start: `deno task start`
