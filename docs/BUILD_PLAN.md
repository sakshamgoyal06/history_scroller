# Build plan & checklist: v0.7 → MVP → Plus

| | |
|---|---|
| **Status** | Active. Milestone **M0 (Foundations)** is next |
| **Last updated** | 2026-10-24 |
| **Drives** | [`PRD.md`](PRD.md) (what and why) · [`ENGINEERING_REVIEW.md`](ENGINEERING_REVIEW.md) (technical findings) |

> **How to use this plan**
> - Work top to bottom within a milestone. Tasks state their dependencies (`needs:`), so independent tasks can run in parallel.
> - Every task has a stable ID (`M0.3`, `M1.12`). Name branches and PRs after it, e.g. `m0-3-accounts`, and
>   cite the PRD requirement IDs it implements.
> - **Tick the box in the same PR that completes the task**, and add a line to the progress log (§8).
>   If scope changes, edit the task here, and the PRD too if a requirement changed.
> - A task is only done when it meets the **Definition of Done** (§2) and its own *done when* line.
> - Items marked **🟡 decision** need a product or owner decision first. They're collected in §7.

---

## 1. Baseline: where we start

**State of `main` after the cleanup PRs (#17 and the cleanup that follows it):**

- **Product:** v0.7 feature set:
  - the For You reel and Explore;
  - Today's Edition (a selector over the static catalog);
  - Story Mode;
  - 5 Zones;
  - Library;
  - Learn a Topic with live AI (OpenAI plan → research → write, with citations) and an offline demo generator.
- **Code layout:** `src/` is organized by PRD area:

  | Folder | PRD area |
  |--------|----------|
  | `catalog/` | catalog data, timeline |
  | `feed/` | P1 Feed |
  | `edition/` | P2 Daily Edition |
  | `stories/` | P3 Stories |
  | `learn/` | P4 Paths |
  | `zones/` | P5 Zones |
  | `library/` | P7 Library |
  | `storage/` | all persisted keys |

  Backend lives in `api/` (2 Vercel functions) and `lib/` (schemas, prompts, helpers).
- **Quality bar in place:**
  - 64 Vitest tests;
  - CI (lint with warnings as errors, tests, build, prod audit) and Dependabot;
  - all browser storage behind `src/storage/localStore.js`, with key values pinned by a test.
- **Removed in the cleanup:**
  - duplicated storage helpers and key definitions;
  - dead functions and state, and 14 unused CSS rules;
  - duplicated JSX;
  - the content file being precached (it would have blocked publishing without a deploy);
  - in-app `#hash` links being ignored.
- **Known gaps carried into this plan:**
  - Engineering open findings A–L (`ENGINEERING_REVIEW.md` §2).
  - Everything the PRD marks as new: accounts, content backend, Content Studio, Recall, onboarding, editorial edition, quotas, analytics.

---

## 2. Definition of Done (applies to every task)

- [ ] `npm run check` passes locally and CI is green.
- [ ] New logic has tests next to the code (`*.test.js`); bug fixes include a test that fails without the fix.
- [ ] User-facing flows touched are checked in the browser at phone width; no console errors.
- [ ] New persisted data uses `STORAGE_KEYS` (client) or a DB migration (server). Any shape change ships with a migration and a test.
- [ ] Analytics events from PRD §11.5 are emitted for any flow the task adds (once M0.6 lands).
- [ ] No secrets in client code. New env vars are documented in the README and `.env.example`.
- [ ] PRD/plan updated if behavior or scope changed. The PR cites the task ID + PRD IDs.

---

## 3. Target stack (proposed: confirm in §7 before M0 starts)

Chosen to be serverless, cheap at low scale, and quick to build on the current Vercel + React setup.

| Concern | Proposal | Alternatives | Used by |
|---------|----------|--------------|---------|
| Database + auth | **Supabase** (Postgres + Auth with phone OTP & Google + row-level security) | Neon + Auth.js; Firebase | M0.2, M0.3 |
| SMS OTP (India) | Supabase phone auth via an Indian SMS provider (e.g. MSG91) with DLT registration | Google sign-in only at alpha | M0.3 |
| Rate limits / quotas | **Upstash Redis** (`@upstash/ratelimit`) | Vercel KV; Postgres counters | M0.1 |
| Background jobs | **Inngest** (durable steps, retries, fits Vercel) | Upstash QStash; Vercel Queues | M1.8 |
| Error tracking | **Sentry** (browser + functions) | Highlight; Axiom | M0.5 |
| Product analytics | **PostHog** (EU/US cloud; no ad trackers) | Plausible + custom events | M0.6 |
| Logs | Vercel logs + structured JSON with `requestId` | Axiom | M0.5 |
| E2E tests | **Playwright** in CI against `vite preview` | — | M0.8 |
| Content Studio | Same repo, `/studio` route behind an editor role | Separate app | M1.1 |
| Push | Web Push (VAPID) via a service-worker handler | OneSignal | M1.14 |

---

## 4. Milestone M0: Foundations (weeks 0–4)

**Goal:** it's safe to put real users on it: costs are capped, errors are visible, data is durable, and the code is ready for features.
**Exit:** every M0 box is ticked, and the PRD §7.3 rows for *Safety & cost* and *Data* pass in staging.

### M0-A · Safety, cost and observability (Eng P0-1, P0-2 · PRD NFR-01, NFR-02)

- [ ] **M0.1 Spend controls on `/api/*`**
  - **Covers:** NFR-01, FR-PATH-04 · **needs:** M0.3 for per-user limits (per-IP ships first)
  - **Work:**
    - Replace the in-memory throttle (`lib/serverUtils.js`) with Upstash rate limits per IP and per user.
    - Add a daily quota per user (free: 2 plans/week, lesson cap per path).
    - Add a global monthly budget counter and alerts.
    - Add a kill-switch env var (`LEARN_AI_DISABLED=true` makes the endpoints return 503 `MISSING_CONFIGURATION`).
    - Set a hard budget on the OpenAI project.
  - **Done when:** load tests show the per-IP and per-user limits hold across cold starts; flipping the kill switch disables AI within one deploy; over-quota returns a typed error the UI renders as an upsell or waitlist state.
- [ ] **M0.5 Error tracking + structured logs**
  - **Covers:** NFR-02
  - **Work:**
    - Sentry in the browser and the functions, with `requestId` as a tag.
    - One JSON log line per OpenAI call: model, prompt version, input/output tokens, latency, cost estimate.
    - An uptime check on the deployment.
  - **Done when:** an error forced in staging shows up in Sentry with the request ID, and a daily cost-per-lesson query exists.
- [ ] **M0.7 Topic moderation + untrusted retrieval**
  - **Covers:** FR-PATH-06, Eng finding I
  - **Work:**
    - Call the moderation endpoint before planning, and refuse politely.
    - In the research prompt, mark retrieved text as untrusted data.
    - Move a source allowlist/denylist into config.
  - **Done when:** tests cover the refusal path; a red-team list of 20 bad topics is refused.

### M0-B · Data, accounts, persistence (Eng P0-3 · PRD FR-ACCT-*)

- [ ] **M0.2 Database schema v1 + migrations**
  - **Covers:** NFR-03, PRD §11.2 · **needs:** 🟡 D-STACK
  - **Work:**
    - Tables: `users`, `profiles` (goal, exam, interests, region), `content_items` (versioned body, sources, status, syllabus tags), `editions`, `zones`, `paths`, `lessons`, `user_item_events`, `recall_items`, `recall_state`.
    - Row-level security policies.
    - Checked-in migrations and a seed script that loads the current 46 cards, 10 prototype posts and 5 zones from `src/catalog/data` and `src/feed/prototypeFeedItems.js`.
  - **Done when:** `npm run db:migrate` + `db:seed` reproduce staging from scratch; RLS tests show user A can't read user B's rows.
- [ ] **M0.3 Accounts: guest → sign-in**
  - **Covers:** FR-ACCT-01, FR-ACCT-02 · **needs:** M0.2
  - **Work:**
    - Guest mode by default; prompt to sign in at the first save, path or recall.
    - Phone OTP and Google.
    - Session handling in the client; auth required on `/api/*` writes.
  - **Done when:** an E2E test covers guest → save → sign in → data still present.
- [ ] **M0.4 Sync + v0.7 import**
  - **Covers:** FR-ACCT-03, FR-ACCT-04, finding C · **needs:** M0.3
  - **Work:**
    - On first sign-in, read every `STORAGE_KEYS` entry and upload it: saved, known, likes, zone progress and paths. Paths are capped by size and deduped.
    - After that the server is the source of truth and `localStorage` is a cache.
    - Write a migration framework for `PATH_SCHEMA_VERSION` (never silently drop data).
  - **Done when:** a fixture dump of v0.7 storage imports losslessly in a test; a second device sees the data.
- [ ] **M0.9 Saved cards store IDs, not full objects**
  - **Covers:** finding K · **needs:** M0.4 (do it within the import)
  - **Done when:** a migration converts `history-feed-saved` objects to IDs, the Library still renders, and a test covers it.
- [ ] **M0.10 Account deletion + export**
  - **Covers:** FR-ACCT-05, NFR-08 · **needs:** M0.3
  - **Done when:** delete removes the user's rows (job + audit log) and export returns JSON.

### M0-C · Codebase readiness (Eng P1-2, P1-3, P1-5)

- [ ] **M0.11 Split `App.jsx`** (finding H)
  - **Covers:** finding H
  - **Work:**
    - Introduce a router (TanStack Router or React Router in hash mode) on top of `src/routing.js`.
    - Extract hooks: `useLibrary` (saved/known), `useLearnFlow` (plan state machine), `useLessonGeneration`, `useToast`.
    - Move the story detail into `stories/StoryDetail.jsx`.
  - **Done when:** `App.jsx` is ≤ 400 lines, every route still deep-links, and existing tests plus the E2E suite pass.
- [ ] **M0.12 Remove render-phase side effects** (finding G)
  - **Covers:** finding G · **needs:** M0.11
  - **Work:** feed-session writes move out of `useMemo` in `LearningReel`, and toasts move out of state updaters.
  - **Done when:** StrictMode shows no double toasts or session writes (tested).
- [ ] **M0.13 Type checking**
  - **Covers:** finding L
  - **Work:** add `jsconfig`/`tsconfig` with `checkJs`, and run `tsc --noEmit` in CI. Fix or annotate errors in `lib/` and `api/` first.
  - **Done when:** CI fails on type errors in `lib/` and `api/`.
- [ ] **M0.8 E2E smoke suite in CI**
  - **Covers:** NFR-11
  - **Work:** Playwright against `vite preview` covering:
    - every route and deep link (including malformed ones);
    - save/reload persistence;
    - Continue learning;
    - the demo path → "Add to my feed" drip;
    - offline edition.
  - **Done when:** it runs in CI under 3 min and fails on console errors.

### M0-D · Analytics and release hygiene (Eng P0-5 · PRD §11.5, §14)

- [ ] **M0.6 Analytics events**
  - **Covers:** PRD §11.5 · **needs:** 🟡 D-STACK
  - **Work:** a thin `track(event, props)` wrapper with PostHog behind consent; emit every event in PRD §11.5 for the existing flows.
  - **Done when:** each event is verified in the staging dashboard and the M-01..M-04 funnels are built.
- [ ] **M0.14 Environments + branch protection**
  - **Covers:** NFR-11
  - **Work:**
    - Vercel staging and production with separate keys.
    - Preview deploys per PR.
    - Branch protection on `main` requiring CI (owner action).
    - Dependabot alerts on.
  - **Done when:** a PR can't merge red, and staging uses a different OpenAI key and DB than production.
- [ ] **M0.15 Legal baseline** 🟡 legal
  - **Covers:** PRD §7.3 Legal, A9
  - **Work:** privacy policy, terms, AI-content disclosure, DPDP consent copy, and a minimum-age decision (PRD open question 6).
  - **Done when:** pages are live and consent is recorded before analytics fires.

---

## 5. Milestone M1: MVP / private alpha (weeks 5–10)

**Goal:** the full MVP from PRD §7.2 in front of 500 invited users.
**Exit:** every launch gate in PRD §7.3 passes.

### M1-A · Content backend and Content Studio (PRD FR-CMS-*, FR-FEED-01)

- [ ] **M1.1 Studio shell + roles**
  - **Covers:** FR-CMS-02 · **needs:** M0.2, M0.3
  - **Work:** a `/studio` route for users with the `editor` role; item list with filters (status, domain, syllabus tag); audit trail.
  - **Done when:** non-editors get 403 server-side.
- [ ] **M1.2 AI-drafted cards**
  - **Covers:** FR-CMS-01, FR-CMS-03 · **needs:** M1.1, M0.1
  - **Work:**
    - A prompt or URL produces a card (hook, setup, fact bullets, why it matters, rabbit hole), sources and 2–3 recall items, reusing the research → write pipeline in `lib/openaiLesson.js` with a card schema.
    - A source checker flags unsupported claims and dead links, and publishing is blocked without sources.
  - **Done when:** a draft takes under 60 s; a test shows publishing is blocked when sources are missing.
- [ ] **M1.3 Review workflow**
  - **Covers:** FR-CMS-02, FR-TRUST-04
  - **Work:** draft → in review → approved → scheduled → published. Two-person approval for Current Affairs and Polity, plus a neutrality checklist (PRD §10.4).
  - **Done when:** state transitions are enforced server-side and tested.
- [ ] **M1.4 Content API + feed from the backend**
  - **Covers:** FR-FEED-01 · **needs:** M0.2
  - **Work:**
    - Endpoints to list published items, editions and zones, cached at the edge.
    - The client loads from the API, falling back to cached and then bundled content.
    - Move catalog text out of the JS bundle.
  - **Done when:** a published item appears in the feed within 5 minutes without a deploy, and initial JS is ≤ 200 kB gzipped (NFR-04).
- [ ] **M1.5 Edition builder**
  - **Covers:** FR-CMS-04, FR-ED-01 · **needs:** M1.3
  - **Work:** pick 5 cards, preview at phone width, schedule for 06:30 IST.
  - **Done when:** a scheduled edition publishes with no engineer involved.
- [ ] **M1.6 Art pipeline**
  - **Covers:** FR-CMS-05
  - **Work:** wrap `scripts/generate-story-art.mjs` as a Studio action, or allow upload. Store art in object storage behind a CDN.
  - **Done when:** every published card has art.
- [ ] **M1.7 Content production**
  - **Covers:** PRD §7.2 content · 🟡 editors
  - **Work:** 300 cards across 8 domains (≥ 60 current affairs), 10 zones with syllabus tags, and 30 editions published back-to-back before alpha.
  - **Done when:** the Studio dashboard shows the counts and editions are 30/30 on time.

### M1-B · Learner experience (PRD P1–P7)

- [ ] **M1.9 Onboarding**
  - **Covers:** FR-ONB-01..04 · **needs:** M0.3
  - **Work:** goal (exam/curious + which exam), ≥ 3 interests, region default; notification opt-in asked after the first finished edition.
  - **Done when:** it's 3 screens or fewer and skippable, and the choices seed ranking and the path defaults.
- [ ] **M1.10 Daily Edition v2**
  - **Covers:** FR-ED-01..04 · **needs:** M1.4, M1.5
  - **Work:**
    - Replace `edition/dailyEdition.js` selection with the editorial edition from the API.
    - x/5 progress, a completion state, and an archive of the last 30 days in the Library.
  - **Done when:** the edition opens offline after one online load (FR-FEED-05).
- [ ] **M1.11 Feed v2: ranking and finite sessions**
  - **Covers:** FR-FEED-02..05 · **needs:** M1.4, M1.9
  - **Work:**
    - Pin edition items first.
    - Add goal and syllabus match plus freshness to `rankFeedItems`.
    - Show a "You're caught up" state; keep the session summary.
  - **Done when:** the diversity rule is tested and the caught-up state is reachable.
- [ ] **M1.12 Sources and trust UI**
  - **Covers:** FR-STORY-01..02, FR-TRUST-01..03
  - **Work:**
    - Sources on every story and lesson.
    - A "Report an error" sheet that sends reports to the Studio queue.
    - "Updated on …" correction notes.
    - AI-written labels on path lessons.
  - **Done when:** 100% of published items render sources (test over the seed), and a report reaches the Studio.
- [ ] **M1.8 Background lesson generation + cache**
  - **Covers:** FR-PATH-02, FR-PATH-05, finding D · **needs:** M0.1, M0.2, 🟡 D-STACK
  - **Work:**
    - Move plan → lessons into Inngest jobs; the client polls the lesson status.
    - Prefetch the next lesson server-side.
    - Cache lessons by a key of (normalized topic, level, region, lesson brief hash).
    - Remove the client-driven chain in `App.jsx`.
  - **Done when:** closing the tab mid-generation still yields a ready lesson; p95 time-to-ready is reported; cache hit rate is tracked.
- [ ] **M1.13 Recall v1**
  - **Covers:** FR-RECALL-01..03 · **needs:** M1.2, M0.2
  - **Work:**
    - Recall items come from the Studio (editor-approved) and from path lessons (FR-PATH-07).
    - A daily session of 3–5 items from cards read 1, 3 and 7 days ago.
    - Wrong answers are rescheduled sooner, and every item links back to its card.
  - **Done when:** scheduling logic is unit-tested and the session takes 2 minutes or less in the E2E.
- [ ] **M1.15 Zones v2 + Library sync**
  - **Covers:** FR-ZONE-01..02, FR-LIB-01 · **needs:** M1.4, M0.4
  - **Done when:** zones come from the API, and progress and the Library sync across devices.

### M1-C · Growth hooks (PRD FR-GROW-*)

- [ ] **M1.14 Morning push**
  - **Covers:** FR-GROW-02 · **needs:** M1.9, M1.10
  - **Work:** Web Push (VAPID), sent at the user's chosen time when the edition is ready.
  - **Done when:** the delivery rate is tracked and opt-out takes one tap.
- [ ] **M1.16 Share as image + deep link**
  - **Covers:** FR-GROW-01, FR-FEED-07
  - **Work:** client-side canvas render in story/WhatsApp format, with a link that opens for signed-out users.
  - **Done when:** the image renders in under 1 s on a mid-tier phone.
- [ ] **M1.17 Public SEO card pages**
  - **Covers:** FR-GROW-04 · **needs:** M1.4
  - **Work:** pre-rendered or edge-rendered `/c/<slug>` pages with Open Graph images and canonical URLs.
  - **Done when:** the pages are indexable (Lighthouse SEO ≥ 90) and a sitemap is generated.

### M1-D · Launch readiness

- [ ] **M1.18 Performance and accessibility pass**
  - **Covers:** NFR-04, NFR-09
  - **Work:** Lighthouse CI budget; WCAG 2.2 AA audit of the reel, edition and recall (keyboard, screen reader, reduced motion); CSP (finding J).
  - **Done when:** p75 LCP ≤ 2.5 s on a mid-tier Android over 4G, and no critical accessibility issues.
- [ ] **M1.19 AI eval harness v1**
  - **Covers:** NFR-12, PRD §11.4
  - **Work:**
    - A golden set of about 100 topics.
    - Automated checks: schema, citation coverage, reading level, duplicate titles.
    - An LLM-judge score.
    - Prompt and model versions stored on each lesson.
  - **Done when:** CI (nightly or on demand) blocks prompt changes that drop the score.
- [ ] **M1.20 Alpha ops**
  - **Covers:** PRD §12.2 phase 1
  - **Work:** an invite-code gate, a feedback form, an on-call rota for content errors (24 h correction SLA), and a weekly metrics review (M-01..M-08).
  - **Done when:** 500 invites are sent and the dashboard is live.

---

## 6. Milestones M2–M3 (outline; plan in detail at M1 exit)

**M2: Closed beta → Plus (months 3–6), PRD Phase 2**
- [ ] **M2.1** Plus billing: UPI autopay and cards through a payment gateway, plus plan-aware quotas (FR-PATH-04). 🟡 pricing (A5)
- [ ] **M2.2** Hindi UI + Hindi edition pilot. Externalize strings first (NFR-10).
- [ ] **M2.3** Exam mode v1: syllabus dashboard, weak-area paths, original practice questions (PRD P8).
- [ ] **M2.4** Full spaced repetition (FR-RECALL-05), notes (FR-LIB-02), revision-sheet export (FR-LIB-03, FR-ED-05).
- [ ] **M2.5** Creator zones + referral program (FR-GROW-03).
- [ ] **M2.6** Path sharing (FR-PATH-08).

**M3: Public beta and scale (months 6–12), PRD Phase 3**
- [ ] **M3.1** TWA/Android app, then iOS, if PWA limits block growth.
- [ ] **M3.2** More languages.
- [ ] **M3.3** Institutions tier.
- [ ] **M3.4** Learned ranking.
- [ ] **M3.5** Original short video.
- [ ] **M3.6** LLM provider abstraction + failover.

---

## 7. Decisions needed before / during M0

| ID | Decision | Proposal | Needed by | Owner | Status |
|----|----------|----------|-----------|-------|--------|
| D-STACK | Confirm the §3 stack (Supabase, Upstash, Inngest, Sentry, PostHog) | As proposed | M0.1 / M0.2 start | Eng lead + owner | ⬜ open |
| D-AUTH | Phone OTP at alpha, or Google-only first (cheaper, no DLT setup) | Google + email magic link at alpha, phone OTP by beta | M0.3 | Product | ⬜ open |
| D-EXAM | First syllabus taxonomy (PRD open question 1) | UPSC-style GS tags | M0.2 (schema), M1.7 | Product | ⬜ open |
| D-EDIT | Editors: in-house vs freelance; who staffs the 24 h correction SLA | 1 in-house lead + 2 freelancers | M1.7 | Product/Content | ⬜ open |
| D-NAME | Keep "Curiosity Feed"? Rename the repo `history_scroller`? | Trademark/domain check, then rename | Before alpha invites | Owner | ⬜ open |
| D-AGE | Minimum age 13+ or 18+ | 18+ at alpha (simpler consent), revisit | M0.15 | Legal | ⬜ open |
| D-BUDGET | Monthly AI budget for alpha | Set from M0.5 cost-per-lesson data | M0.1 | Owner | ⬜ open |

---

## 8. Progress log

Add one line per merged PR that ticks a box.

| Date | Task(s) | PR | Notes |
|------|---------|----|-------|
| 2026-10-24 | Baseline: tests, CI, bug fixes, review | #17 | Engineering review findings 1–12 fixed |
| 2026-10-24 | Baseline: PRD, cleanup, src/ restructure, this plan | — | See §1 |

---

## 9. Dependency overview

```
D-STACK ──▶ M0.2 DB ──▶ M0.3 Accounts ──▶ M0.4 Sync/import ──▶ M0.9, M1.15
   │            │             │
   │            │             ├──▶ M0.1 per-user quotas ──▶ M1.2 AI drafts, M1.8 jobs
   │            │             └──▶ M1.9 Onboarding ──▶ M1.11 Feed v2, M1.14 Push
   │            └──▶ M1.1 Studio ──▶ M1.3 Review ──▶ M1.5 Edition builder ──▶ M1.10 Edition v2
   │                      └──▶ M1.2 ──▶ M1.13 Recall
   └──▶ M0.6 Analytics (any time; before alpha)
M0.11 App split ──▶ M0.12 ──▶ (every M1-B task is easier after this)
M0.2 DB ──▶ M1.4 Content API ──▶ M1.10, M1.11, M1.15, M1.17
```

**Suggested M0 sequencing for one or two engineers:**

| Week | Work |
|------|------|
| 1 | D-STACK decided; M0.5 and M0.14 (fast wins); start M0.11 |
| 2 | M0.2 and M0.1 (per-IP limits); M0.11 done |
| 3 | M0.3, M0.12, M0.7 |
| 4 | M0.4, M0.9, M0.10, M0.6, M0.8, M0.13; M0.15 runs in parallel (legal) |
