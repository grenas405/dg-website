# Agent Notes

This repository is a Deno web app for the DenoGenesis teaser site.

## Operating Contract

- Runtime: Deno 2.x.
- HTTP dependency: JSR `@std/http`.
- Public routes: `/`, `/index.html`, `/main.css`, `/script.js`, and `/healthz`.
- Server entrypoint: `main.ts`.
- Frontend assets remain at the repo root because they predate the Deno wrapper.

## Architecture

- `main.ts` starts the process and does no request handling.
- `src/config.ts` reads `HOST` and `PORT`.
- `src/http.ts` contains composable request handlers and middleware.
- `src/static.ts` maps public paths to an explicit asset allowlist.
- `src/app.ts` assembles the app from the small functions above.

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
