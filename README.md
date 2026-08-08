# 뜨읏 (Tteut)

> 사전은 뜻을 설명하고, 삶은 뜻을 만듭니다.

뜨읏은 단어의 사전적 의미 옆에, 사람들이 실제 삶에서 그 단어를 어떻게
이해하고 살아냈는지 — "살아낸 뜻" — 를 기록하고 나누는 플랫폼입니다.
사용자는 단어를 검색해 사전적 정의와 다른 사람들의 살아낸 뜻을 함께 보고,
자신의 뜻을 직접 남길 수 있습니다.

제품 비전과 전략의 전체 서술은 [docs/vision.md](./docs/vision.md)에,
개별 제품 결정과 그 근거는 [docs/adr/](./docs/adr/)에 있습니다. 코드
구조와 아키텍처, 특히 AI 에이전트가 작업 전에 알아야 할 내용은
[AGENTS.md](./AGENTS.md)를 참고하세요.

## Tech stack

- **Framework**: Next.js 16 (App Router), React 19
- **Runtime/Hosting**: Cloudflare Workers, via `@opennextjs/cloudflare`
- **Database**: Cloudflare D1 (SQLite)
- **External APIs**: 국립국어원 표준국어대사전(stdict) for dictionary
  definitions, Google OAuth for admin login, Discord webhook for
  notifications
- **Styling**: Tailwind CSS

## Getting started

```bash
npm install
cp .env.local.example .env.local   # fill in the values you need (see below)
npm run dev
```

Local `next dev` runs on the Node runtime and does **not** have Cloudflare
bindings (D1, secrets) available — pages that read `env.DB` will fail
locally unless run through `npm run preview` (which runs the built Worker
under `wrangler dev`, with local D1 emulation).

Required/optional environment variables are documented in
[AGENTS.md](./AGENTS.md#environment-variables).

### Database

Schema is managed as D1 migrations in [`migrations/`](./migrations):

```bash
npx wrangler d1 migrations apply <database-name> --local   # local dev DB
npx wrangler d1 migrations apply <database-name>            # production
```

`<database-name>` is the `database_name` in [`wrangler.toml`](./wrangler.toml).

## Project structure

```
src/app/    Next.js App Router pages, layouts, and API routes
src/lib/    Server-side modules: D1 access, external API clients, auth
migrations/ D1 schema (source of truth for the data model)
docs/adr/   Product decisions (ADR-PROD-*) and their reasoning
docs/       strategy.md (current focus), vision.md (full product vision)
```

See [AGENTS.md](./AGENTS.md) for the full directory map, data model, and
glossary of domain terms (뜻, 살아낸 뜻, 관련어, 검색 수요, 씨앗).

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Local dev server (Node runtime) |
| `npm run lint` | ESLint |
| `npm run build` | Next.js production build |
| `npm run build:worker` | Build the Cloudflare Worker bundle |
| `npm run preview` | Run the built Worker locally via `wrangler dev` |
| `npm run deploy` | Build the Worker and deploy to Cloudflare |

## Deployment

```bash
npm run deploy
```

Deploys to the Cloudflare Worker configured in `wrangler.toml`. Worker
secrets/vars (`ADMIN_EMAIL`, `GOOGLE_REDIRECT_URI`, etc.) are managed via
`wrangler.toml` `[vars]` and `wrangler secret put`, not `.env` files.

## Philosophy

> 뜻은 찾는 것이 아니라 살아내며 만들어지는 것이다.

For the full vision, problem statement, and growth strategy, see
[docs/vision.md](./docs/vision.md).
