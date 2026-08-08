<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# What 뜨읏 (Tteut) is

뜨읏 is a Korean web app built on one idea: a dictionary explains a word's
meaning, but a person's *lived experience* of that word ("살아낸 뜻") is
different and worth capturing. For a given word, the app shows the dictionary
definition alongside meanings other people have actually written from their
own lives, and lets visitors add their own.

Full product vision: [README.md](./README.md). Product decisions and their
reasoning: [docs/adr/](./docs/adr/) (ADR-PROD-*). Current focus / next steps:
[docs/strategy.md](./docs/strategy.md).

## Glossary

Domain terms used throughout the code and ADRs — grep for the Korean term,
not a translation, when searching the codebase.

| Term | Meaning |
|---|---|
| 뜻 / 사전적 의미 | Dictionary definition, fetched live from 국립국어원 표준국어대사전 (stdict) API. Not stored. |
| 살아낸 뜻 / lived meaning | A user-submitted, personal definition of a word. Stored in `tt_lived_meanings`, this is the app's core content. |
| 관련어 / semantic edges | Words whose lived meanings share vocabulary, shown as "related words" on a word page. Computed by a text-overlap heuristic, **not** an LLM call — see `src/lib/semanticEdgeGenerator.ts`. |
| 검색 수요 / search demand | Tracking of which words visitors look up, especially ones with no lived meaning yet, used to prioritize what content to seed next (ADR-PROD-011). |
| 씨앗 / seed | The admin curation workflow at `/seed` (UI) backed by `/api/admin/lived-meanings` (API): reviewing pending anonymous submissions and manually adding lived meanings. |

## Architecture

- **Framework**: Next.js 16 App Router, deployed as a Cloudflare Worker via
  `@opennextjs/cloudflare` (not Vercel). Local `next dev` and the deployed
  Worker behave slightly differently — the Cloudflare bindings (`env.DB`
  etc.) only exist through `getCloudflareContext()`.
- **Database**: Cloudflare D1 (SQLite), binding name `DB`. Schema lives in
  `migrations/*.sql`, applied in filename order — that's the source of truth
  for the data model, not any doc.
- **AI usage**: none at runtime, despite the name "semantic edges" —
  related-word computation is a plain text-overlap heuristic (see Glossary).
  An earlier Anthropic-backed "refine my sentence" endpoint existed but was
  never wired up to any UI; it was removed as dead code, along with two
  other orphaned routes from a pre-redesign flow (`/api/lived`,
  `/api/transform`) — see git history if reviving any of them.
- **Auth**: Google OAuth, gated by a single hardcoded `ADMIN_EMAIL` env var —
  there is no multi-user account system. It exists only to protect `/seed`.
  Session is a signed JWT in an httpOnly cookie (`src/lib/session.ts`).
  `src/middleware.ts` redirects unauthenticated visits to the `/seed`
  **page**, but does not cover `/api/*` — API routes must call
  `requireAdminSession()` themselves. Per Next.js's own guidance, don't rely
  on middleware alone for authorization; every `/api/admin/*` route
  re-checks the session.
  **Do not rename this file to `proxy.ts`**: Next.js 16 renamed the
  `middleware` file convention to `proxy`, and the top-of-file warning in
  this doc says to heed deprecation notices — but `proxy.ts` forces the
  Node.js runtime with no way to opt back into Edge, and the deployed
  `@opennextjs/cloudflare` adapter (currently 1.19.4) cannot build a
  Node.js-runtime proxy (`ERROR Node.js middleware is not currently
  supported`). Revisit this once OpenNext adds support.
- **Notifications**: A Discord webhook (`src/lib/notify.ts`) fires on two
  events — a word searched with no lived meaning yet, and a new anonymous
  submission — so the maintainer can react without polling the DB.

## Directory map

```
src/app/
  page.tsx, HomeClient.tsx          Home: search box + discovery/demand/recent lists
  word/[slug]/page.tsx, WordClient.tsx  Word page: dictionary + lived meanings + related words
  seed/page.tsx                     Admin curation UI (auth-gated by src/middleware.ts)
  auth/google/, auth/callback/, auth/logout/   Google OAuth flow for the admin
  api/submit/                       Public: anonymous meaning submission
  api/admin/lived-meanings/         Admin-only: curate lived meanings + review pending submissions
  api/admin/semantic-edges/generate/  Admin-only: recomputes tt_semantic_edges from scratch
src/lib/
  dictionary.ts             stdict API client (사전적 의미)
  hanjaLookup.ts             Hanja (漢字) breakdown for dictionary entries
  livedMeaningsStore.ts      D1 access for tt_lived_meanings
  semanticEdgeGenerator.ts   Pure heuristic: computes related-word candidates
  semanticEdgesStore.ts      D1 access for tt_semantic_edges
  session.ts, notify.ts, config.ts
migrations/                  D1 schema, source of truth for the data model
docs/adr/                    ADR-PROD-*: product decisions and their reasoning
docs/strategy.md             Living doc: current focus, next steps, open questions
```

## Data model (D1, see `migrations/*.sql` for exact columns)

| Table | Purpose |
|---|---|
| `tt_lived_meanings` | Published lived meanings, shown on word pages. Written by admin approval or directly via `/api/admin/lived-meanings`. |
| `tt_user_meanings` | Anonymous submissions (`/api/submit`), status `pending`/`approved`/`rejected`. Admin reviews these via `/api/admin/lived-meanings` (`PATCH`); approving copies the row into `tt_lived_meanings`. |
| `tt_semantic_edges` | Cached "related words" per word, regenerated wholesale by `POST /api/admin/semantic-edges/generate` (admin-only). Not updated incrementally. |
| `tt_search_demands` | One row per normalized search term, incremented on every word-page visit; used to surface "지금 찾고 있는 뜻" on the home page. |

A word can have dictionary meaning, lived meaning, both, or neither — the
"demand type" branching for that (`DICTIONARY_EMPTY` / `FULFILLED` /
`BOTH_EMPTY` / `LIVED_MEANING_EMPTY`) lives in `getDemandType()` in
`src/app/word/[slug]/page.tsx`.

## Environment variables

None of these are typed as required at build time — missing ones fail soft
(feature silently disabled) rather than crashing. See `.env.local.example`.

| Variable | Used by | Effect if missing |
|---|---|---|
| `STDICT_API_KEY`, `STDICT_CERT_KEY_NO` | `src/lib/dictionary.ts` | Dictionary lookups return `null` (word treated as dictionary-not-found) |
| `SESSION_SECRET` | `src/lib/session.ts` | Session creation/verification throws |
| `ADMIN_EMAIL` | `src/middleware.ts`, auth callback, `/api/admin/*` routes | No email will ever match; `/seed` and `/api/admin/*` become unreachable |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` | `/auth/google`, `/auth/callback` | OAuth flow returns a config error instead of redirecting |
| `DISCORD_WEBHOOK_URL` | `src/lib/notify.ts` | Notifications are skipped silently |
| `NEXT_PUBLIC_SITE_URL` | `src/lib/config.ts` | Falls back to the production URL — wrong for local metadata/canonical links |

In production these are Cloudflare Worker vars/secrets (see `wrangler.toml`
and `wrangler secret put`), not `.env` files.

## Common commands

```
npm run dev            # next dev, local Node runtime (no Cloudflare bindings)
npm run lint
npm run build:worker   # opennextjs-cloudflare build
npm run preview        # wrangler dev, runs the built Worker locally
npm run deploy         # build:worker + wrangler deploy
```

D1 migrations are applied via `wrangler d1 migrations apply <db-name>`, not
an npm script — check `wrangler.toml` for the database name/id.
