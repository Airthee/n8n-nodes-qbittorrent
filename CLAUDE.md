# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

n8n community node package (`n8n-nodes-qbittorrent`) exposing the qBittorrent WebUI API v2 as an n8n node. TypeScript compiled to CommonJS into `dist/`, which is the only published directory.

## Commands

```bash
npm run build      # rimraf dist && tsc && gulp build:icons  (gulp copies *.svg/*.png into dist)
npm run dev        # tsc --watch
npm test           # vitest (watch mode)
npm test -- --run  # single run (this is what CI does)
npx vitest run lib/qbittorrent-client/utils/sha512.test.ts   # one test file
npx vitest run -t "should login for the first request"        # one test by name
npm run lint       # eslint nodes package.json
npm run lintfix
npm run format     # prettier nodes --write
npm run release    # release-it (git tag + GitHub release + npm publish)
```

There is no vitest config file; vitest uses its defaults and picks up `**/*.test.ts`.

CI (`.github/workflows/ci.yml`) runs `lint`, `build` and `test` as three parallel jobs on Node 22, for pushes to `master` and for pull requests.

Note that `npm run lint` and `npm run format` only cover `nodes/` and `package.json` — `lib/`, `helpers/` and `credentials/` are compiled and tested but not linted by those scripts.

### Local testing against a real n8n

`npm run build`, then `npm link` here and `npm link n8n-nodes-qbittorrent` from `~/.n8n/custom`, then `npx n8n`. Restart n8n after each rebuild. See the Development section of `README.md`.

## Architecture

Three layers, deliberately separated so the API client is testable without n8n:

1. **`lib/qbittorrent-client/`** — framework-agnostic qBittorrent API client. It never imports `n8n-workflow`. All HTTP goes through the injected `IRequestHelper` (`interfaces/request-helper.interface.ts`), which n8n satisfies with `this.helpers.httpRequest`, and tests satisfy with `__tests__/utils/mock-http-helper.ts`. This is the layer with unit tests.
2. **`nodes/QBittorrent/`** — the n8n node. `QBittorrent.node.ts` holds the `INodeTypeDescription` and the execute loop; `operations/index.ts` and `fields/index.ts` are the UI property arrays; `QBittorrent.actions.ts` maps operation names to client calls.
3. **`credentials/QBittorrentApi.credentials.ts`** + **`helpers/qbittorrent-client-instanciate.ts`** — credential definition and the shared client factory used by `preAuthentication`.

### Operation dispatch

`operations/index.ts` declares each operation's `value` (e.g. `getTorrentsList`), and `QBittorrent.actions.ts` exports a function with **exactly that name**. `execute()` looks up `actions[operation]` by string and throws `NodeOperationError` if it isn't a function. Adding an operation therefore means touching four places, all keyed on the same string:

1. `lib/qbittorrent-client/qbittorrent-client.ts` — the API method.
2. `nodes/QBittorrent/operations/index.ts` — the option entry, scoped by `displayOptions.show.resource`.
3. `nodes/QBittorrent/fields/index.ts` — any parameters, scoped by `displayOptions.show.{operation,resource}`.
4. `nodes/QBittorrent/QBittorrent.actions.ts` — the exported function `(executeContext, itemIndex, client)` reading params via `getNodeParameter` and delegating to the client.

Every action has the same three-argument signature even when it ignores the first two; keep that shape so the dispatch stays uniform. The `logs` resource exists in the resource dropdown but has no operations yet.

Two eslint rules from `eslint-plugin-n8n-nodes-base` bite here: option lists must be **alphabetically sorted by `name`**, and displayName/description wording is checked (`npm run lint` will tell you).

### Client conventions

`QBittorrentClient` funnels requests through three private helpers — `getJson` (GET + query string), `postForm` (POST + `application/x-www-form-urlencoded`), and `doRequest` (adds `returnFullResponse: true`). Prefer `getJson`/`postForm` over hand-rolling `RequestOptions`; `addTorrent` is the exception because it posts `multipart/form-data`.

**Session handling**: `buildHeaders` lazily logs in via `POST /api/v2/auth/login` on the first authenticated call and caches the `set-cookie` value on the instance. `doRequest` retries once, re-fetching the cookie, when the response is `403`/`'Forbidden'` — so an expired session self-heals. Do not add cookie logic in the action layer.

**Version routing**: qBittorrent 5.0 renamed `torrents/pause`→`torrents/stop` and `torrents/resume`→`torrents/start`. `isApiV5OrNewer()` reads `GET /api/v2/app/version` once per client and caches the major version, defaulting to 5 on any parse or request failure. 5.x is the supported target; the 4.x fallback is best-effort and may be dropped. If a future qBittorrent release renames more routes, extend this method rather than branching in the actions.

### Client caching across executions

`QBittorrent.getClientInstance` keeps a **single static client** on the class, keyed by a SHA-512 of `url-username-password`. Changing credentials swaps the instance; the same credentials reuse it (and therefore reuse its cookie and cached version). This is process-wide state — keep that in mind when adding per-execution state to `QBittorrentClient`, since it will leak across workflow runs.

## Style

Prettier with tabs, single quotes, 100 columns, trailing commas (`.prettierrc.js`). TypeScript is `strict` with `noUnusedLocals` and `noImplicitReturns`.

## Language

This is an open source project — anyone should be able to use it and contribute. **All content must be written in English**: code (identifiers, strings), comments, documentation, commit messages, branch names, pull requests, issues, and any user-facing text. Write in English even when the conversation with the user is in another language.

## Agent conventions

`.claude/skills/` holds the project skills: `pr-feedback` (working through PR review threads) and `gh-comment` (posting anything to GitHub). `.claude/rules/` holds cross-cutting rules generalized from review feedback; each one is imported from this file with an `@.claude/rules/<topic>.md` line.

Every GitHub comment posted by the agent — review thread reply, PR or issue comment, automated message — starts with `(Claude) ` on its first line, so a reader can tell agent output from a human's. The prefix is a marker: never translated, never reworded, present even on a one-line reply.
