# Engineering review & production roadmap

_Review date: 2026-10-24 · Reviewed at: `4fc2ef5` (v0.7 "Learning Reel") · Reviewer: project lead_

This is a fresh-eyes review of the codebase as handed over, what was cleaned up during the
review, and what has to happen, in priority order, before this is a production system.

---

## 1. What the product is today

Curiosity Feed is a mobile-first learning PWA with four surfaces: a ranked vertical **For You**
reel, an **Explore** catalog (46 hand-written cards, 10 reel posts), curated **Learning Zones**
(5), and **Learn a Topic**, where OpenAI plans a 3–5 lesson path and writes each lesson from
live web research, with citations.

About 15 PRs of work, almost all by an AI coding agent, took it from a 20-card history scroller
(v0.1) to v0.7. The feature surface is broad for its age. The engineering foundations are not
there yet: until this review there were no tests, no CI, an outdated README and a 2,400-line
`App.jsx`.

### Architecture at a glance

```
Browser (React SPA + Workbox SW)                     Vercel functions
┌────────────────────────────────────┐   POST    ┌───────────────────────────────┐
│ App.jsx: all UI state + nav        │──────────▶│ /api/plan-learning-path       │──▶ OpenAI Responses
│ feed/ zones/ library/ learn        │           │ /api/generate-lesson          │──▶ (web_search + JSON schema)
│ localStorage: paths, lessons,      │◀──────────│ lib/: Zod contracts, repair,  │
│ saves, likes, progress, sessions   │   JSON    │ IDs, throttle, timeouts       │
└────────────────────────────────────┘           └───────────────────────────────┘
  catalog + reel content compiled into the JS bundle; no database, no auth
```

### What is good and worth keeping

- **API contracts are explicit.** Every request and response, and the model's own output, is a Zod schema.
  Model output is repaired (`normalizePlanShape`), re-IDed (`planIds`) and validated again
  before it reaches the client. Errors are mapped to safe codes with a `requestId`.
- **Prompting is grounded.** Lessons can only cite sources returned by the web search step,
  claims carry `sourceIds`, invented IDs are scrubbed, and thin lessons are rejected (`LESSON_THIN`).
- **There is a graceful no-key mode.** The demo generator means UI work never needs secrets.
- **Feature modules are reasonably separated** (`feed/`, `zones/`, `library/`), and storage is
  versioned per key.

---

## 2. Findings

Severity: **High** = user-visible breakage, data loss, or cost/security exposure.
**Medium** = latent bug or significant maintainability cost. **Low** = hygiene.

### Fixed during this review

| # | Sev | Finding | Fix |
|---|-----|---------|-----|
| 1 | High | A crafted `#feed/<id>` link (e.g. containing `"`) threw inside `querySelector` and **blanked the whole app**. Reproduced against `4fc2ef5`. | ID is `CSS.escape`d (`LearningReel.jsx`) |
| 2 | High | `generate-lesson` allowed 180 s research + 180 s writing = 360 s, **above Vercel's 300 s ceiling**, and `vercel.json` set no `maxDuration`. Slow lessons would be killed with no app-level error. | Shared 280 s budget, `maxDuration: 300`, client timeouts set just above the server's |
| 3 | High | Unguarded `localStorage.setItem` for paths, zones and the daily edition. Generated lessons are large, so a full quota threw mid-generation and **left lessons stuck "generating"**. | All writes guarded |
| 4 | Medium | `#zones` deep links and Back to `#zones` opened the **feed** (route not handled). Reproduced. | Route handled; routing extracted to `src/routing.js` with a pure, tested `parseHash` |
| 5 | Medium | Path-drip cards read `path.topic` / `path.title`, which path records don't have. **Every label read "Your path".** | Uses `course.title` / `preferences.topic` |
| 6 | Medium | All stored paths were re-parsed from `localStorage` **on every render**. This defeated the `activeStory` memo and re-ran the lesson-generation effect on every render. | Paths held in state, refreshed by `bumpPaths` |
| 7 | Medium | `normalizePlanShape` turned a requested length of 4 into 5. | Honors 3/4/5 |
| 8 | Medium | Throttle trusted the left-most `X-Forwarded-For` (spoofable off-Vercel), and its map grew without bound. | Platform IP headers first; stale keys pruned |
| 9 | Medium | 11 npm advisories (2 critical) and an unused `@vercel/node`. | Removed; `npm audit` → 0 |
| 10 | Medium | 9 React lint warnings (setState in effects, memo deps used as cache-busters, ref mutated after being passed to hooks). | All resolved; lint now fails on warnings |
| 11 | Low | `lessonToDisplayCard` mapped stored source IDs as if they were objects. | Handles both shapes |
| 12 | Low | No tests, no CI, README described v0.2 ("no backend, no AI"), template assets left in `src/assets`. | 59 tests, CI workflow, README rewritten, dead files removed |

Structural cleanup in the same pass:

- Catalog data and normalization moved out of `App.jsx` into `src/catalog.js` and `src/data/coreCards.js` (since moved to `src/catalog/`).
  Imported card objects are no longer mutated at module load. URL handling moved to `src/routing.js`.
  `App.jsx` went from 2,375 to about 1,935 lines.
- The initial route is resolved once in state initializers. Previously the app rendered the feed
  first and then corrected it from inside an effect.
- `vercel.json` adds baseline security headers and `Cache-Control: no-store` on `/api`.

### Open findings (not fixed: need a decision or a larger change)

| # | Sev | Finding | Recommendation |
|---|-----|---------|----------------|
| A | **High** | **The AI endpoints are unauthenticated and uncapped.** Anyone with the URL can call `/api/generate-lesson`, which makes 2 OpenAI calls including web search, at 12 requests/min per IP, per warm instance (the throttle is in memory). That is an open-ended bill. | P0-1 below |
| B | **High** | **All user data is on-device.** One cleared cache, a new phone, or Safari's 7-day eviction of storage for sites not visited recently loses every path and its paid-for lessons. | P0-3 |
| C | **High** | **A schema bump wipes data.** `loadAllPaths()` returns `[]` when `PATH_SCHEMA_VERSION` doesn't match. A future bump silently deletes every user's paths. | Add a migration step before any version bump |
| D | Medium | **The client drives lesson generation.** Closing the tab mid-request leaves a lesson "generating" for 4 minutes (the stale window). Prefetching lesson N+1 runs from the browser. | P1-1: server-side job |
| E | Medium | **Content ships in the JS bundle.** All card text (427 kB JS, 138 kB gzipped) loads up front, and `public/content/feed-index.json` is empty, so publishing any content needs a deploy. | P1-4 |
| F | Medium | **There is no observability.** No error tracking, no metrics, no record of OpenAI token cost per request. The `requestId`s are logged but nobody can search them. | P0-2 |
| G | Medium | **Render-phase side effects.** `LearningReel` writes session state inside `useMemo` (`startFeedSession`, `markSessionSummaryShown`), and `handleSave` / `handleKnown` fire toasts inside state updaters. Both double-fire under StrictMode. | Move into events/effects during the App split (P1-2) |
| H | Medium | **`App.jsx` is still the whole app.** About 40 `useState`s, hand-rolled routing, and the learn flow and generation orchestration all in one component. | P1-2 |
| I | Medium | **There is no content-safety layer.** User topics aren't moderated, and web-search text flows straight into the lesson writer, an indirect prompt-injection and misinformation risk. React escapes the output, so XSS risk is low. | P0-4 |
| J | Low | **There is no Content-Security-Policy.** YouTube embeds need a `frame-src` allowlist, so it has to be set deliberately and tested. | P1-6 |
| K | Low | **Saved cards store whole card objects**, which go stale and take space. (The unused `_returnFeed` state and the double caching of `feed-index.json` were fixed in the repo cleanup, see `docs/BUILD_PLAN.md` §1.) | Store IDs only, with a migration (`BUILD_PLAN.md` M0.9) |
| L | Low | **No type checking.** JSDoc types exist but nothing enforces them. | P1-3 |

---

## 3. Roadmap to production

This is ordered by risk, not by appeal. Nothing in P0 is optional for a public launch.

### P0: before any public traffic

1. **Lock down AI spend.**
   - Require an identity: anonymous device sessions are enough at first, accounts later. Add bot protection (e.g. Cloudflare Turnstile) on plan creation.
   - Move the throttle to a shared store (Upstash Redis / Vercel KV) and add per-user daily quotas: N plans and M lessons per day.
   - Set a hard monthly budget and alerts on the OpenAI project, and a kill-switch env flag that returns `MISSING_CONFIGURATION`.
   - _Exit criterion: one user or bot cannot spend more than $X/day, and total spend cannot pass the budget._
2. **Add observability.**
   - Error tracking (e.g. Sentry) on client and functions, tagged with `requestId`.
   - Structured logs, with token usage and latency from each OpenAI response, so we know cost per lesson.
   - An uptime check on `/api`.
   - _Exit: any user-reported error can be traced to a log line in under 5 minutes._
3. **Store data on the server.**
   - A Postgres database (Neon or Supabase) for users, paths and generated lessons. `localStorage` becomes a cache.
   - Cache generated lessons by plan and lesson so the same lesson is never paid for twice.
   - Write the migration path for `PATH_SCHEMA_VERSION` (finding C) and import existing `localStorage` paths on first sign-in.
4. **Content safety and trust.**
   - Run topics through the moderation endpoint.
   - Treat retrieved pages as untrusted in the research prompt, and keep the source allowlist and denylist in config.
   - Show sources on every lesson and card: `sources` exists on cards but is never rendered.
   - Add a "report an error" action, a privacy policy, terms, and an AI-content disclosure.
5. **Release hygiene.**
   - Branch protection on `main` with CI required.
   - Vercel preview deploys per PR, and separate staging and production environments and keys.
   - Dependabot is configured (`.github/dependabot.yml`); turn on its alerts in the repo settings.

### P1: make it sustainable to build on

1. **Generate lessons in the background.**
   - Run generation as a server job (Vercel Queues / Inngest / QStash) instead of a 5-minute HTTP request.
   - The client polls, or subscribes over SSE, for status. Prefetching the next lesson happens server-side.
   - This removes finding D and the 300 s ceiling.
2. **Split `App.jsx`.**
   - Use a real router (TanStack Router or React Router) for the hash routes.
   - Move logic into hooks: `useLibrary` (saved/known), `useLearnFlow` (plan state machine), `useLessonGeneration`.
   - Fix the render-phase side effects (finding G) along the way.
   - _Target: no component over about 400 lines._
3. **Types.**
   - Turn on `checkJs` and run `tsc --noEmit` in CI first.
   - Then migrate `lib/` and `api/` to TypeScript, and infer types from the Zod schemas.
4. **Content pipeline.**
   - Move the catalog and reel posts out of the bundle into versioned JSON (or a headless CMS) that the service worker caches.
   - Build the planned **AI Content Studio**: draft → human review → publish.
   - Fill in `feed-index.json` so content ships without a deploy.
5. **Test pyramid.**
   - Keep the unit layer that exists now.
   - Add component tests (Testing Library) for the learn flow and the reel.
   - Add Playwright end-to-end smoke tests in CI covering every route, offline mode and the demo path. The review smoke script is a starting point.
   - Add Lighthouse CI with a performance and accessibility budget.
6. **Hardening.**
   - Set a Content-Security-Policy (finding J).
   - Run an accessibility audit: reel keyboard and screen-reader navigation, reduced motion.
   - Precache images for offline use.

### P2: product scale

- **Accounts and sync** across devices, with a privacy-respecting analytics funnel (e.g. PostHog) on retention, lesson completion and generation success rate.
- **An evaluation harness for AI quality:**
  - a golden set of topics;
  - automated checks for structure, citation coverage and reading level;
  - an LLM judge plus human spot checks;
  - prompts and models versioned, with evals gating changes.
- **A provider abstraction**, so the model can be swapped or failed over.
- **Hindi and other Indian languages.** The product already has an India scope option.
- **Server-side ranking** once there is enough engagement data to beat the on-device heuristic.

---

## 4. Suggested first two sprints

| Sprint | Goal | Items |
|--------|------|-------|
| 1 | "Safe to share a link" | P0-1 (anonymous sessions, KV throttle, quotas, budget, kill switch), P0-2 (Sentry + usage logging), P0-5 (branch protection, previews, Dependabot) |
| 2 | "Nobody loses their work" | P0-3 (Postgres, lesson cache, migrations, import), P0-4 (moderation, sources UI, legal pages), start P1-1 (background generation) |

## 5. Working agreements going forward

- Every PR: CI green (lint with no warnings, tests, build). New logic comes with tests. User-visible changes come with a note in the PR.
- Model or prompt changes are reviewed like schema changes, with before and after samples on the golden topics once the eval harness exists.
- Bump storage versions only together with a migration and a test for it.
- No secrets in the client. `VITE_*` variables are public by definition.
