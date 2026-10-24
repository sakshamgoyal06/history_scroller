# Curiosity Feed — Product Requirements Document

| | |
|---|---|
| **Status** | v1.0, approved direction for MVP build |
| **Owner** | Product lead |
| **Last updated** | 2026-10-24 |
| **Code baseline** | `main` @ `5f9ea5a` (v0.7 + engineering review) |
| **Companion docs** | [`ENGINEERING_REVIEW.md`](ENGINEERING_REVIEW.md): technical state, known issues, P0/P1/P2 engineering roadmap |

> **How to use this document.** This PRD is the source of truth for *why* we're building Curiosity Feed,
> *who* it is for, *what* the MVP and later phases contain, and *how* we take it to market. Requirement IDs
> (`FR-FEED-03`, `NFR-04`, `M-02`, …) are stable, so cite them in issues, PRs and future chats ("implement FR-RECALL-01").
> Assumptions are tagged `[A#]` and must be validated before we bet on them. Decisions are recorded in §16.
> When something here changes, update the doc in the same PR and add a line to the changelog (§18).

---

## Table of contents

1. [TL;DR](#1-tldr)
2. [Why: problem, insight, why now](#2-why-problem-insight-why-now)
3. [Who: target users](#3-who-target-users)
4. [Vision, mission and positioning](#4-vision-mission-and-positioning)
5. [Product principles](#5-product-principles)
6. [What: the product](#6-what-the-product)
7. [MVP definition](#7-mvp-definition)
8. [Functional requirements](#8-functional-requirements)
9. [Non-functional requirements](#9-non-functional-requirements)
10. [Content strategy and editorial policy](#10-content-strategy-and-editorial-policy)
11. [How: system and AI approach](#11-how-system-and-ai-approach)
12. [Go-to-market strategy](#12-go-to-market-strategy)
13. [Business model and unit economics](#13-business-model-and-unit-economics)
14. [Success metrics](#14-success-metrics)
15. [Roadmap: MVP to eventual product](#15-roadmap-mvp-to-eventual-product)
16. [Decisions, assumptions and open questions](#16-decisions-assumptions-and-open-questions)
17. [Risks and mitigations](#17-risks-and-mitigations)
18. [Appendix](#18-appendix)

---

## 1. TL;DR

**Curiosity Feed is the short-video-style feed that makes you smarter.** Its story-first posts cover history, economics, polity,
geography, science and current affairs, and are built for people in India who learn on their phones in the gaps of the day.
Every post is sourced, each one opens into a deeper story, and any topic can become a personal AI-built learning path.
Spaced recall makes the learning stick.

- **Beachhead:** students and early-career adults preparing for, or adjacent to, **competitive exams** (UPSC / State PSC,
  banking, SSC, CUET/CLAT GK sections), plus **curious young professionals** who want to "know more about the world".
  Our eight domains already mirror the general-studies syllabus.
- **Wedge:** *"Your daily current affairs + GS in 10 minutes, in a feed you actually want to open."*
- **Differentiators:**
  1. A calm, finite feed, not an infinite slot machine.
  2. Sources on everything.
  3. Depth on demand: post → story → personal path.
  4. India-first context with global comparisons.
- **MVP goal:** prove that people come back. Target ≥ 25% of activated users return in week 4 and complete ≥ 3 deep dives per
  week. Launch is invite-only on Android Chrome (PWA) with about 300 curated cards, a daily 5-card edition, AI paths with
  quotas, and accounts with sync.
- **Business model:** freemium. The feed and daily edition stay free forever. **Plus** (about ₹99–149/month `[A5]`) unlocks
  unlimited AI paths, recall decks, offline packs and exam-mode mocks.

---

## 2. Why: problem, insight, why now

### 2.1 The problem

1. **Phones are where attention goes, and most of it leaves nothing behind.** Short-video feeds are the default way to fill a
   spare minute. Users often report "wasted time" afterward `[A1]`. The format is compelling; the content mostly isn't.
2. **Learning products are built for desks.** MOOCs, textbooks, coaching PDFs and long YouTube lectures need a dedicated
   block of time and willpower. Most people don't sit down to study general knowledge; they only have gaps.
3. **General-knowledge prep is fragmented and dull.** Aspirants juggle newspapers, monthly current-affairs PDFs, Telegram
   channels and coaching notes. That content is long, repetitive, poorly sourced and easy to forget `[A2]`.
4. **AI answers are fast but shallow and hard to trust.** Chatbots answer anything, but they don't sequence learning,
   cite reliably by default, or help you remember.

### 2.2 The insight

> People will happily scroll *learning* content if it feels as good as entertainment, respects their time, and leaves them
> visibly smarter. The unit that does this is a **story with a hook**: one surprising fact, the setup, why it matters
> now, and a rabbit hole.

Prototype evidence: the v0.1–v0.7 builds converged on this card anatomy (hook → setup → fact → why it matters → rabbit hole)
and on a full-screen reel. Usability with real users is still unvalidated `[A3]`.

### 2.3 Why now

- **LLMs with web search** make sourced, sequenced, level-appropriate lessons cheap to produce on demand. The v0.7 pipeline
  already does plan → research → write → cite.
- **Mobile-first India:** large numbers of young, phone-first learners, with growing comfort paying small UPI subscriptions
  for edtech and content `[A4]`.
- **Short-form fatigue:** a growing "intentional tech" sentiment opens space for a feed that is finite and good for you.

### 2.4 Why us

The product already exists as a working v0.7 with the hard parts prototyped:
- the feed, ranking and deep-dive stories;
- AI paths with citations;
- zones;
- a calm visual identity.

We can move from prototype to MVP in weeks, not quarters.

---

## 3. Who: target users

### 3.1 Primary persona: "The Aspirant" (beachhead)

| | |
|---|---|
| **Profile** | 19–28, a graduate or final-year student, preparing for UPSC / State PSC / banking / SSC, or keeping that option open. Tier 1–3 cities, Android phone, budget-conscious. |
| **Context** | Studies in long blocks, but phone time fills commutes, breaks and the time before sleep. Already reads current affairs daily. |
| **Jobs to be done** | "Keep up with current affairs without reading 3 newspapers." "Revise static GK in small doses." "Remember what I read last month." "Understand *why* something matters, not just the fact." |
| **Pains** | Information overload, monthly PDFs that never get finished, forgetting, low-trust sources, guilt about scrolling. |
| **Gains we offer** | 10-minute daily edition, sourced cards, spaced recall, syllabus-tagged paths, exam-style questions. |
| **Willingness to pay** | Low but real for clear exam value: already pays for test series and courses `[A5]`. |

### 3.2 Secondary persona: "The Curious Professional"

| | |
|---|---|
| **Profile** | 23–35, working in tech, finance, consulting or media. Reads newsletters and listens to explainers. |
| **Jobs to be done** | "Understand the news properly: RBI rate moves, elections, wars." "Have interesting things to say." "Replace doomscrolling with something I don't regret." |
| **Gains we offer** | Story Mode, "Why it matters now", AI paths on any topic ("explain semiconductors to me in 5 lessons"), sharing. |
| **Willingness to pay** | Higher; pays for content subscriptions `[A5]`. |

### 3.3 Tertiary (later): "The Lifelong Learner" and educators

Retirees, parents learning alongside children, school teachers who want ready-made discussion hooks. They are the
B2B2C entry point for schools in Phase 3.

### 3.4 Anti-personas: who we are *not* building for (yet)

- **Exam-only grinders** who want only MCQ drills and mock tests: there are many test-series apps. We add recall and
  exam-mode, but we are not a test series.
- **Children under 13:** this needs a separate safety and compliance model.
- **Deep academic study** (university coursework): we link out to it; we don't replace it.

---

## 4. Vision, mission and positioning

**Vision (5 years):** *The place a billion phone-first people go to get smarter in the gaps of the day.*

**Mission:** Turn idle scrolling into lasting understanding through sourced stories, personal learning paths and
memory that sticks.

**Positioning statement:**
> For phone-first learners in India who want to understand the world (and ace general-knowledge exams),
> **Curiosity Feed** is a learning feed that turns minutes of scrolling into sourced, memorable knowledge.
> Unlike short-video apps, it is finite and good for you. Unlike coaching PDFs and chatbots, it is engaging, cited, sequenced and
> built to help you remember.

**Tagline candidates** (to test in GTM): "Scroll smarter." · "10 minutes. Know more." · "Curiosity, sourced."

**Brand personality:** calm, clever, trustworthy, warm. A well-read friend, not a lecturer and not a hype channel.

---

## 5. Product principles

Use these to settle design arguments. They are ordered, so when two conflict, the higher one wins.

1. **Trust beats speed.** Every factual post shows its sources. When unsure, we say so (`uncertainties`). We never fabricate
   URLs, quotes or video IDs.
2. **Finite by design.** Sessions have a natural end: the session summary, the daily edition is done, "you're caught up". We optimize for
   learning per minute, not minutes.
3. **Depth on demand.** Every surface offers one tap deeper: post → story → path. Nothing is a dead end.
4. **Remember, don't just consume.** Anything worth learning gets a recall hook.
5. **India-first, world-aware.** Default context is Indian (institutions, examples, ₹), with global comparisons.
6. **Calm craft.** No streak shaming, no dark patterns, no autoplay audio, and reduced motion is respected.
7. **Works on a ₹10k phone on a patchy network.** The design is offline-tolerant, light and fast.

---

## 6. What: the product

### 6.1 Product pillars

| Pillar | User promise | Today (v0.7) | Target |
|--------|-------------|--------------|--------|
| **P1 · Feed** ("For You") | A short, beautiful, ranked stream of learning posts | Reel of 10 prototype posts + catalog cards; on-device ranking | Daily-refreshed feed from a content backend, personalized by interests and syllabus |
| **P2 · Daily Edition** | "Today in 5 cards": current affairs + one static GK pick | Selector over the static catalog | Editorially produced daily edition with news hooks, published every morning |
| **P3 · Stories** (go deeper) | A 3–6 minute story with sources | Story detail + Story Mode (1 flagship narrative) | Every card has a story view; narrative format standard |
| **P4 · Paths** (Learn a Topic) | Any topic → a sequenced, sourced 3–5 lesson path | Working AI pipeline, data stored only in the browser, no quotas | Accounts, quotas, server-side generation, cached lessons, syllabus-aware |
| **P5 · Zones** | Curated multi-step tracks (e.g. "Indian Economy Basics") | 5 zones, focus/drip modes | 30+ zones mapped to syllabus areas |
| **P6 · Recall** *(new)* | "Remember what you learned" | — | Spaced-repetition questions from cards you read; 2-minute daily recall |
| **P7 · Library** | Everything you saved, liked, finished | Saved/liked/recent/paths | Synced across devices; notes; exportable revision sheets |
| **P8 · Exam mode** *(later)* | "Prepare for my exam" | — | Syllabus tagging, previous-year-style questions, weak-area paths |

### 6.2 Core loop

```
     ┌──────────── Trigger: morning notification / habit ────────────┐
     ▼                                                                │
 Daily Edition (5 cards) ──▶ For You feed ──▶ Go deeper (story) ──▶ Save / Path
     │                                                     │            │
     └──── Recall (2 min, next day) ◀── cards you read ◀───┘            │
                         │                                              │
                         └──▶ Progress & "you're caught up" ◀───────────┘
```

**Habit:** open → finish the edition (about 5 min) → optionally scroll and go deeper → next day, recall questions on yesterday's cards.

### 6.3 Content formats

| Format | Where | Shape |
|--------|-------|-------|
| **Slide post** | Feed | 3–6 slides: hook → context → fact → why it matters → takeaway |
| **Video post** | Feed | Curated YouTube embed (licensed/embeddable) + caption; later original short video |
| **Card** | Explore, Library | Hook, setup, core fact/bullets, why it matters, rabbit hole, sources |
| **Story** | Deep dive | Narrative: cold open, context, 5–12 story beats, complication, takeaway, sources |
| **Path lesson** | Paths | AI-generated story with verified claims ↔ sources, misconceptions, uncertainties |
| **Recall item** *(new)* | Recall | Q/A or MCQ generated from a card, linked back to it |

### 6.4 Domains and taxonomy

The domains are History · Economics · Geography · Civics (Polity) · Technology · Current Affairs · Science · General Knowledge.

Every content item also carries:
- **topics** (free tags);
- **era/decade** where relevant;
- **region** (India / World / both);
- **level** (beginner / curious / deep);
- **syllabus tags** *(new, MVP)*: a mapping to a GS taxonomy, e.g. `GS1.history.modern`, `GS2.polity.parliament`, `GS3.economy.monetary`.

The taxonomy is our own, so we never reproduce exam bodies' copyrighted material.

---

## 7. MVP definition

### 7.1 MVP hypothesis

> If phone-first aspirants and curious young adults get a **daily 5-card edition plus a calm, sourced feed with next-day recall**,
> at least 25% of activated users will still be using it in week 4, and they will rate it as more useful than their
> current current-affairs source.

### 7.2 MVP scope

**In scope (must ship):**

| # | Capability | Pillar | Requirements |
|---|------------|--------|--------------|
| 1 | Accounts (phone OTP or Google), cross-device sync of saves, progress and paths | Platform | FR-ACCT-01..05 |
| 2 | Onboarding: pick goal (exam / curiosity), interests, region default | Platform | FR-ONB-01..04 |
| 3 | Daily Edition: 5 editor-approved cards every morning (≥2 current affairs) | P2 | FR-ED-01..05 |
| 4 | For You feed served from a content backend (no deploy to publish) | P1 | FR-FEED-01..07 |
| 5 | Story view with visible sources for every card | P3 | FR-STORY-01..04 |
| 6 | AI Paths with quotas, server-side generation, cached lessons | P4 | FR-PATH-01..08 |
| 7 | Recall v1: 3–5 questions/day from cards read in the last 7 days | P6 | FR-RECALL-01..05 |
| 8 | Library synced; Zones (≥10) | P5, P7 | FR-LIB-01..03, FR-ZONE-01..03 |
| 9 | Morning push notification (opt-in) + share-as-image card | Growth | FR-GROW-01..04 |
| 10 | Report-an-error on every item + corrections workflow | Trust | FR-TRUST-01..04 |
| 11 | Internal **Content Studio**: AI-drafted cards → editor review → publish | Ops | FR-CMS-01..06 |
| 12 | Engineering P0 from `ENGINEERING_REVIEW.md` (spend controls, observability, persistence, safety, release hygiene) | Platform | NFR-01..12 |

**Content at launch:**
- ≥ 300 published cards across all 8 domains, with ≥ 60 current-affairs cards from the prior 30 days.
- ≥ 10 zones.
- 30 days of daily editions published back-to-back before public beta.

**Out of scope for MVP** (explicitly deferred):
- Native iOS/Android apps (we ship as a PWA, installable on Android).
- Hindi and other languages: this is Phase 2, but the UI must be i18n-ready (NFR-10).
- Exam mode, mock tests, previous-year questions (Phase 2–3).
- Original video production; we use curated embeddable videos only.
- Social features (follows, comments, leaderboards).
- Payments. Plus is announced with a waitlist; billing comes in Phase 2.
- B2B / schools.

### 7.3 MVP launch criteria (exit gates)

| Gate | Criterion |
|------|-----------|
| Quality | 0 open P0/P1 bugs; crash-free sessions ≥ 99.5%; LCP ≤ 2.5 s on a mid-tier Android over 4G (p75) |
| Trust | 100% of published cards have ≥ 1 source; correction SLA defined and staffed |
| Safety & cost | Per-user AI quotas enforced server-side; monthly OpenAI budget alarm + kill switch tested |
| Content | 300 cards, 10 zones, 30 consecutive editions shipped on time |
| Data | Analytics events for every metric in §14 verified in staging |
| Legal | Privacy policy, terms, AI-content disclosure, DPDP Act consent flow reviewed `[A9]` |

---

## 8. Functional requirements

Priority: **M** = must (MVP), **S** = should (MVP if time allows), **L** = later.

### 8.1 Accounts and onboarding

| ID | Pri | Requirement | Acceptance criteria |
|----|-----|-------------|---------------------|
| FR-ACCT-01 | M | Sign in with phone OTP or Google | New user signs in in < 60 s; OTP retry and rate limit enforced |
| FR-ACCT-02 | M | Use the app before signing in (guest mode); prompt at first save, path or recall | Guest data migrates to the account on sign-in, with nothing lost |
| FR-ACCT-03 | M | Sync saved, known, likes, progress, paths and recall state across devices | Change on device A visible on device B within 10 s of the next open |
| FR-ACCT-04 | M | Import existing on-device data (v0.7 storage keys) on first sign-in | All v0.7 `localStorage` paths and saves appear in the account |
| FR-ACCT-05 | M | Delete account and export data | Delete completes within 30 days; export as JSON on request (DPDP) |
| FR-ONB-01 | M | Onboarding asks for a goal: *Exam prep* (which exam) or *Stay curious* | ≤ 3 screens; skippable |
| FR-ONB-02 | M | Pick ≥ 3 interests from the domains | Seeds ranking on the first session |
| FR-ONB-03 | M | Region default (India / World / Both) | Sets the default `geographicScope` for paths and feed weighting |
| FR-ONB-04 | S | Notification opt-in with a chosen time | Default 8:00 local; asked after the first finished edition, not at install |

### 8.2 Feed (P1)

| ID | Pri | Requirement | Acceptance criteria |
|----|-----|-------------|---------------------|
| FR-FEED-01 | M | Feed is served from the content backend; publishing needs no deploy | Editor publishes → item eligible in the feed within 5 min |
| FR-FEED-02 | M | Ranking uses interests, goal, likes/saves/known, "not interested", recency and diversity | No more than 2 consecutive posts from the same domain when alternatives exist |
| FR-FEED-03 | M | Finite session: summary after N posts and "You're caught up" when the fresh pool runs out | Summary shows posts seen, domains covered, saves |
| FR-FEED-04 | M | Actions: like, save, "I knew this", not interested, share, go deeper | Each action is logged as an analytics event and affects ranking next session |
| FR-FEED-05 | M | Offline: the last fetched feed and edition are readable offline | Airplane-mode test passes for the cached edition + 20 posts |
| FR-FEED-06 | S | Path/zone "drip": next lesson of an enabled path appears in the feed | Max 1 drip per 5 posts |
| FR-FEED-07 | M | Deep links to any post or story work and are shareable | Shared link opens the item for a signed-out user |

### 8.3 Daily Edition (P2)

| ID | Pri | Requirement | Acceptance criteria |
|----|-----|-------------|---------------------|
| FR-ED-01 | M | Each day has an edition of 5 editor-approved cards | Published by 06:30 IST, 7 days a week |
| FR-ED-02 | M | ≥ 2 current-affairs cards from the last 72 h, each with a "why it matters for you/your exam" line | Editorial checklist enforced in Content Studio |
| FR-ED-03 | M | Progress indicator (x/5) and a completion state | Completion recorded; feeds the recall pool |
| FR-ED-04 | S | Archive of past editions (last 30 days) | Browsable from the Library |
| FR-ED-05 | L | Monthly current-affairs compilation (auto-generated from editions) | Export as a revision sheet (Plus) |

### 8.4 Stories (P3)

| ID | Pri | Requirement | Acceptance criteria |
|----|-----|-------------|---------------------|
| FR-STORY-01 | M | Every card opens into a story or explainer view | No dead-end cards |
| FR-STORY-02 | M | Sources are visible on every story (title, publisher, link) | 100% coverage; links open in a new tab |
| FR-STORY-03 | M | "Continue learning" recommends a next item (same domain, unseen first) | Always shows a recommendation |
| FR-STORY-04 | S | Story/Explainer toggle on narrative cards (exists in v0.7) | Preference persists |

### 8.5 AI Paths (P4)

| ID | Pri | Requirement | Acceptance criteria |
|----|-----|-------------|---------------------|
| FR-PATH-01 | M | Topic + optional focus, level, region, length 3/4/5 → plan; broad topics → multi-track; ambiguous → narrowing options | Behavior matches the v0.7 planner contract (`lib/learningPathSchemas.js`) |
| FR-PATH-02 | M | Lessons generate server-side as background jobs; the client polls or streams status | Closing the app doesn't lose a generation; p95 lesson ready ≤ 90 s `[A7]` |
| FR-PATH-03 | M | Every lesson has ≥ 2 verified claims linked to real sources, plus misconceptions and takeaway | Lessons failing the checks are regenerated or flagged, never shown thin |
| FR-PATH-04 | M | Quotas: Free = 2 new paths/week; Plus = 20/week `[A6]`; enforced server-side | Over-quota shows an upsell/waitlist, never a broken state |
| FR-PATH-05 | M | Lesson cache: identical (topic, level, region, lesson) requests reuse generated content | Cache hit rate tracked (target ≥ 30% by month 3) |
| FR-PATH-06 | M | Topic moderation: unsafe/disallowed topics get a polite refusal | Moderation runs before planning; refusals logged |
| FR-PATH-07 | S | Recall items auto-generated per lesson | ≥ 3 items per lesson |
| FR-PATH-08 | S | Share a path (read-only link) | Recipient can open and "start this path" |

### 8.6 Recall (P6, new)

| ID | Pri | Requirement | Acceptance criteria |
|----|-----|-------------|---------------------|
| FR-RECALL-01 | M | Generate 2–3 recall items (MCQ or reveal-answer) per card at publish time; editor-approved | Each item links to its source card |
| FR-RECALL-02 | M | Daily recall session: 3–5 items from cards read 1, 3 and 7 days ago (simple spaced schedule) | Session ≤ 2 min; appears after the edition |
| FR-RECALL-03 | M | Answer feedback with a link back to the card | Wrong answers rescheduled sooner |
| FR-RECALL-04 | S | "Memory strength" per domain in the Library | Visible progress without streak shaming |
| FR-RECALL-05 | L | Full spaced-repetition algorithm (e.g. FSRS-style) | Phase 2 |

### 8.7 Zones and Library

| ID | Pri | Requirement | Acceptance criteria |
|----|-----|-------------|---------------------|
| FR-ZONE-01 | M | ≥ 10 curated zones, each 5–10 steps, with syllabus tags | Managed in Content Studio |
| FR-ZONE-02 | M | Zone progress synced; focus mode and drip-to-feed (exists in v0.7) | Progress survives reinstall |
| FR-ZONE-03 | S | Zone completion state + a recall pack | — |
| FR-LIB-01 | M | Library: saved, liked, paths, recent, edition archive | Synced |
| FR-LIB-02 | S | Personal notes on any card | Synced, searchable |
| FR-LIB-03 | L | Export revision sheet (PDF) from saved items | Plus |

### 8.8 Growth

| ID | Pri | Requirement | Acceptance criteria |
|----|-----|-------------|---------------------|
| FR-GROW-01 | M | Share any card as a branded image (story/WhatsApp format) + deep link | Image renders client-side under 1 s |
| FR-GROW-02 | M | Morning edition push notification (opt-in) | Web Push on Android; delivery rate tracked |
| FR-GROW-03 | S | Referral: invite link → both get 1 week of Plus once Plus exists | Attribution recorded |
| FR-GROW-04 | M | Public SEO pages for every published card (read-only, no account needed) | Indexed, with a canonical URL and Open Graph image |

### 8.9 Trust and safety

| ID | Pri | Requirement | Acceptance criteria |
|----|-----|-------------|---------------------|
| FR-TRUST-01 | M | "Report an error" on every card, story and lesson | Report reaches the editor queue with the item ID |
| FR-TRUST-02 | M | Corrections: an edited item shows "Updated on <date>: <what changed>" | Visible changelog per item |
| FR-TRUST-03 | M | AI-generated content is labelled ("AI-written, sources checked automatically") vs editor-reviewed | Label is always visible on path lessons |
| FR-TRUST-04 | M | Political and contested topics follow the neutrality guidelines in §10.4 | Checklist in Content Studio for Polity/Current Affairs |

### 8.10 Content Studio (internal)

| ID | Pri | Requirement | Acceptance criteria |
|----|-----|-------------|---------------------|
| FR-CMS-01 | M | Editors create cards from a prompt or URL; AI drafts the hook/setup/fact/why/rabbit hole + sources + recall items | Draft in < 60 s |
| FR-CMS-02 | M | Review workflow: draft → in review → approved → scheduled → published; two-person rule for Current Affairs | Audit trail per item |
| FR-CMS-03 | M | Source checker: every claim must map to a source; dead links flagged | Publishing blocked without sources |
| FR-CMS-04 | M | Edition builder: pick 5 cards, preview, schedule | Scheduled publish works without an engineer |
| FR-CMS-05 | M | Artwork: template-generated art (as `scripts/generate-story-art.mjs` does today) or upload | Every card has art |
| FR-CMS-06 | S | Content analytics: completion, saves, error reports per item | Weekly content review uses it |

---

## 9. Non-functional requirements

| ID | Area | Requirement |
|----|------|-------------|
| NFR-01 | Cost control | Per-user and global AI spend limits, a kill switch, alerts at 50/80/100% of budget (Eng P0-1) |
| NFR-02 | Observability | Client and server error tracking with `requestId`; token usage and cost logged per request (Eng P0-2) |
| NFR-03 | Persistence | Server-side database is the source of truth; storage migrations are tested; no silent data loss (Eng P0-3) |
| NFR-04 | Performance | p75 LCP ≤ 2.5 s and INP ≤ 200 ms on a mid-tier Android over 4G; initial JS ≤ 200 kB gzip (content moves out of the bundle) |
| NFR-05 | Offline | Edition + recent feed + saved items readable offline; actions queue and sync |
| NFR-06 | Availability | 99.5% monthly for read paths; AI generation degrades gracefully (queue, retry, cached results) |
| NFR-07 | Security | Auth on all write/AI endpoints; CSP; OWASP ASVS L1 baseline; secrets only server-side |
| NFR-08 | Privacy | DPDP Act-aligned consent, data minimization, deletion/export; analytics without third-party ad trackers `[A9]` |
| NFR-09 | Accessibility | WCAG 2.2 AA; full keyboard and screen-reader support for the feed; reduced-motion respected |
| NFR-10 | i18n | All UI strings externalized; content model supports per-language variants (Hindi in Phase 2) |
| NFR-11 | Quality gates | CI must pass (lint, tests, build); E2E smoke on core flows before release |
| NFR-12 | AI quality | Eval suite on a golden topic set gates prompt/model changes (§11.4) |

---

## 10. Content strategy and editorial policy

### 10.1 Content mix

| Type | Share of feed | Source | Review |
|------|---------------|--------|--------|
| Current affairs (last 30 days) | ~35% | AI draft from news + official releases (PIB, RBI, ministries, courts) | Two-person editor review |
| Static GS (history, polity, geography, economy, science) | ~50% | AI draft from textbooks/official/encyclopedic sources | One editor review |
| Curiosity / "wow" (GK, science oddities) | ~15% | AI draft + editor pick | One editor review |
| User AI paths | Personal, not in the public feed | Automated checks only | Labelled AI-written |

### 10.2 Production pipeline

```
Signal (news, syllabus gap, trending query) → AI draft in Content Studio → source check (auto)
  → editor edit + approve → (2nd editor for Current Affairs) → schedule → publish → metrics
  → error reports / corrections → content refresh
```

**Throughput target:** 5 edition cards/day plus ~10 feed cards/day = about 450 cards/month. With AI drafting, about 2 FTE editors `[A8]`.

### 10.3 Source policy

- **Preferred:** primary and official sources (government releases, RBI, court judgments, census/NSO, parliamentary records),
  universities, museums and established publishers.
- **Not acceptable as sole source:** blogs, social media, coaching notes, AI output.
- Every published claim maps to ≥ 1 source. Contested claims need ≥ 2 independent sources or are marked as uncertain.

### 10.4 Neutrality on polity and current affairs

- Describe positions, not endorse them. Attribute claims ("the government says…", "critics argue…").
- No party-political framing in hooks. No ranking of politicians or parties.
- When an election-related card goes out, a second editor checks it against this policy.

### 10.5 Corrections policy

- **Fix SLA:** factual errors within 24 h of a valid report (4 h for current affairs in the edition).
- **Visible "Updated" note** with the change (FR-TRUST-02).
- **Monthly corrections log** reviewed with the content team.

### 10.6 Video policy

Curated, embeddable YouTube videos only, from reputable channels, with creator credit. No downloading or re-hosting.
Original short video is evaluated in Phase 3.

---

## 11. How: system and AI approach

This section describes the target state. The current state and the gap are in `ENGINEERING_REVIEW.md`.

### 11.1 Target architecture

```
PWA (React) ──HTTPS──▶ API (Vercel functions)
                         │
                         ├─▶ Postgres: users, progress, saves, paths, lessons, recall state, content
                         ├─▶ KV/Redis: rate limits, quotas, sessions
                         ├─▶ Job queue: lesson generation, recall generation, card drafting
                         ├─▶ LLM provider(s) via an abstraction (OpenAI today) + moderation
                         └─▶ Object storage/CDN: art, share images, content JSON

Content Studio (internal web app) ──▶ same API (editor roles)
Analytics (privacy-respecting product analytics) · Error tracking · Uptime
```

### 11.2 Key data entities

- **User:** id, auth identities, goal, exam, interests, region, notification prefs, plan (free/plus), quotas.
- **ContentItem:** id, type (card/post/story/recall), domain, topics, syllabus tags, region, level, body (versioned), sources, art, status, publishedAt, corrections[].
- **Edition:** date, ordered item ids, status.
- **Zone:** id, title, steps (ordered item ids), syllabus tags.
- **Path:** id, owner, request (topic/level/region/length), plan, tracks, lessons (status, content, sources), share token.
- **Progress / Events:** user × item (seen, explored, saved, known, liked, not interested, completed).
- **RecallItem / RecallState:** item link, question, options, answer; per user: due date, interval, ease, history.

### 11.3 Ranking (MVP)

The MVP ranker is a heuristic and runs server-side or at the edge, extending the v0.7 `rankFeedItems`:
- **Score:** interest affinity, goal/syllabus match, freshness (current affairs), novelty (unseen), and quality (completion rate).
- **Penalties:** "not interested", over-seen domains.
- **Diversity:** no 3-in-a-row by domain or format.
- **Edition items** are pinned first.

ML ranking waits until there are about 100k weekly sessions.

### 11.4 AI quality system

| Layer | What it does |
|-------|--------------|
| Grounding | Research step with web search; writer may only cite retrieved sources; invented IDs are scrubbed (exists in v0.7) |
| Structural validation | Zod schemas, minimum claims/beats, length bounds (exists in v0.7) |
| Safety | Topic moderation before planning; retrieved text treated as untrusted; neutrality rules in prompts |
| Evals | Golden set of about 100 topics × levels × regions. Automated checks cover schema validity, citation coverage, reading level, banned patterns and duplicate titles; plus LLM-as-judge for accuracy and engagement, and 20 human spot checks per release |
| Versioning | Prompts and models are versioned. Every lesson stores the prompt and model version, so regressions can be traced |
| Cost | Cache identical requests; cheaper models for planning and recall, stronger ones for writing (to evaluate) |

### 11.5 Analytics event taxonomy (minimum)

The minimum events are:
- `app_open`, `onboarding_complete`;
- `edition_card_view` / `edition_complete`;
- `feed_post_view` (≥2 s at ≥70% visible) and `feed_go_deeper`;
- `story_complete` (scrolled to the end or ≥ 60% dwell);
- `save`, `like`, `known`, `not_interested`, `share`;
- `path_requested`, `path_planned`, `lesson_ready`, `lesson_complete`;
- `recall_session_start`, `recall_answer {correct}`;
- `report_error`;
- `paywall_view` / `waitlist_join`.

Every event carries user id (or anon id), item id, domain, and source surface.

---

## 12. Go-to-market strategy

### 12.1 Beachhead and positioning

**Beachhead:** general-studies aspirants (UPSC/State PSC first, then banking/SSC GK) plus curious college students in India.

**Why this beachhead:**
1. The need to keep up with current affairs is daily and acute, so a natural habit already exists.
2. These users already consume (and pay for) GS content.
3. They gather in dense, reachable communities: Telegram, YouTube, Instagram, college groups.
4. Our domains map almost exactly to their syllabus.

**Message by persona:**

| Persona | Core message | Proof point |
|---------|-------------|-------------|
| Aspirant | "Your daily current affairs + GS revision in 10 minutes, and you'll actually remember it." | Daily Edition + Recall + sources |
| Curious professional | "Scroll smarter. Understand the news, not just the headline." | Story Mode, Why it matters, AI paths |

### 12.2 Launch phases

| Phase | Audience | Size | Goal | Exit criteria |
|-------|----------|------|------|---------------|
| **0. Design partners** | 20–30 aspirants and professionals, interviewed weekly | 30 | Validate edition + recall value; fix comprehension issues | ≥ 60% use it ≥ 4 days/week for 2 weeks `[A3]` |
| **1. Private alpha** | Invite-only, from partner communities | 500 | Retention signal, content cadence stress test | W4 retention ≥ 20%; editions 30/30 on time |
| **2. Closed beta** | Waitlist + referrals + 3–5 creator partners | 5,000 | Channel testing, Plus waitlist conversion | W4 ≥ 25%; ≥ 8% of WAU join the Plus waitlist |
| **3. Public beta** | Open PWA, SEO pages live | 50,000 | Growth loops, Plus billing launch | CAC and payback inside targets (§13) |

### 12.3 Channels

| Channel | Tactic | Why it fits | Primary metric |
|---------|--------|-------------|----------------|
| **Instagram Reels / YouTube Shorts** | Post our best cards as 20-second shorts with "full story + sources in the app" | Same format as the product; content is our ad | Profile visits → installs |
| **Telegram / WhatsApp communities** | Daily edition as a shareable image + link; partner with channel admins | Where aspirants already get current affairs | Link opens → sign-ups |
| **Creator partnerships** | 3–5 GS/current-affairs educators co-brand zones ("Zone by X") | Borrowed trust + distribution | Attributed sign-ups, W4 retention |
| **SEO** | Public card pages ("What is the repo rate?") with Open Graph images | Evergreen GS queries; each card is a landing page | Organic sessions → sign-ups |
| **Campus ambassadors** | Student ambassadors in 20 colleges; "curiosity quiz" events | Dense networks, low cost | Referral sign-ups per ambassador |
| **Referral loop** | Share card → recipient lands on the card → "get tomorrow's edition" | Built-in virality | K-factor |

**Not doing at MVP:** paid performance marketing at scale (only small tests to measure CAC) and app-store ads (we're a PWA).

### 12.4 Launch narrative and PR

**Story:** "An Indian startup built a short-video-style feed where every post cites its sources."

**Angles:**
- Intentional technology and screen-time guilt.
- AI done responsibly: citations, corrections.
- India-first learning.

**Timing:** launch the public beta around a high-attention moment, e.g. the Union Budget or results season, with an "explained in 5 cards" edition.

### 12.5 Partnerships (Phase 2+)

- Newsrooms and explainers: licensed summaries or co-branded editions.
- Coaching institutes: white-label recall decks.
- Colleges: GK clubs.
- Telcos and OEMs: preload or bundle (Phase 3).

---

## 13. Business model and unit economics

### 13.1 Pricing (hypotheses to test)

| Tier | Price `[A5]` | Includes |
|------|-------------|----------|
| **Free** | ₹0 | Daily edition, full feed, stories with sources, 3 zones, 2 AI paths/week, basic recall (3 items/day) |
| **Plus** | ₹99–149/month or ₹799–999/year | Unlimited zones, 20 AI paths/week, full spaced recall, offline packs, monthly compilations/revision sheets, exam mode (Phase 2) |
| **Institutions** *(Phase 3)* | Per-seat | Classroom zones, teacher dashboard, progress reports |

**Principle:** the free tier must be genuinely valuable, because the feed is the growth engine. We gate *heavy, costly or exam-specific* features, not the core loop.

**Billing:** UPI autopay + cards via a payment gateway (Phase 2). Play Billing applies only if we ship a native/TWA app.

### 13.2 Cost model (per active user, monthly, illustrative)

| Cost | Driver | Assumption to validate |
|------|--------|------------------------|
| AI for paths | (paths/user/month × lessons/path × cost/lesson) × (1 − cache hit rate) | Cost per lesson measured once usage logging lands (NFR-02) `[A7]` |
| AI for content production | Cards/month × drafting cost, amortized over all users | Small per user at scale |
| Infra | DB + functions + CDN | Low at MVP scale |
| Editorial | ~2 FTE editors | Largest fixed cost early `[A8]` |

**Targets:**
- Variable cost per free MAU ≤ ₹3/month.
- Gross margin on Plus ≥ 70%.
- CAC payback ≤ 6 months on Plus.
- Free-to-paid conversion 2–4% of MAU by month 12 `[A5]`.

The numbers are placeholders until we have real usage. Revisit after the closed beta.

---

## 14. Success metrics

### 14.1 North Star

**Weekly Curious Learners (WCL):** users who, in a week, complete ≥ 3 learning actions (an edition completed, a story
completed, a lesson completed or a recall session done) on ≥ 2 different days.

This measures habitual learning, not time spent, which keeps us honest with Principle 2.

### 14.2 Metric tree

| ID | Metric | Definition | MVP target |
|----|--------|-----------|------------|
| M-01 | Activation | % of new users who finish their first edition or story within 24 h | ≥ 50% |
| M-02 | W1 / W4 retention | % of activated users active in week 1 / week 4 | ≥ 45% / ≥ 25% |
| M-03 | Edition completion | % of edition opens that reach 5/5 | ≥ 60% |
| M-04 | Go-deeper rate | Stories opened / feed posts viewed | ≥ 12% |
| M-05 | Recall participation | % of WAU doing ≥ 1 recall session/week | ≥ 35% |
| M-06 | Recall accuracy lift | Accuracy on day-7 items vs day-1 items for the same users | Positive and trending up |
| M-07 | Path success | Lessons ready ÷ lessons requested; lesson completion rate | ≥ 97%; ≥ 40% |
| M-08 | Share rate | Shares per 100 WAU per week | ≥ 10 |
| M-09 | Plus intent | Waitlist joins (beta) → paid conversion (Phase 2) | ≥ 8% of WAU (waitlist) |

### 14.3 Guardrails

These must not regress:
- **Error reports** per 1,000 items viewed ≤ 2; median correction time ≤ 24 h.
- **AI cost per WAU** within budget (§13.2).
- **Healthy sessions:** median session length 4–15 min. A rising share of 60+ minute sessions is a warning sign, not a win.
- **Notification opt-outs** ≤ 5%/month.
- **Crash-free sessions** ≥ 99.5%.

### 14.4 Qualitative

- Monthly user interviews (≥ 8).
- **"Learned something" score:** a one-tap prompt at session end, aiming for ≥ 70% "yes".
- **Sean Ellis "very disappointed" test**, aiming for ≥ 40% by public beta.

---

## 15. Roadmap: MVP to eventual product

### Phase 0: Foundation (weeks 0–4)

Engineering P0 from `ENGINEERING_REVIEW.md`:
- spend controls, quotas, kill switch;
- observability;
- Postgres + accounts + sync + v0.7 data import;
- moderation;
- CI/branch protection/previews.

Also:
- Content Studio v1 (FR-CMS-01..04);
- analytics events (§11.5);
- design-partner interviews start.

### Phase 1: MVP / Private alpha (weeks 5–10)

- Onboarding, Daily Edition, backend-served feed.
- Sources UI, report-an-error and corrections.
- Recall v1.
- Background lesson generation + cache.
- Zones ×10, share images, push notifications, public SEO card pages.
- Content: 300 cards and 30 back-to-back editions.

Launch criteria per §7.3.

### Phase 2: Closed beta → Plus (months 3–6)

- **Plus billing** (UPI autopay) and quotas by plan.
- **Hindi UI + Hindi editions** (pilot), using the i18n groundwork in NFR-10.
- **Exam mode v1:** syllabus dashboard, weak-area paths, exam-style practice questions written by us (no copyrighted previous-year question banks).
- **Full spaced repetition**, notes and revision-sheet export.
- **Creator zones**, referral program, and a monthly current-affairs compilation.

### Phase 3: Public beta and scale (months 6–12)

- **Native apps:** TWA/Android first, then iOS, if PWA limits block growth (push on iOS, installs).
- **More languages:** Tamil, Telugu, Bengali, Marathi.
- **Original short video:** AI-assisted narration plus editorial review.
- **Institutions tier** for colleges and coaching institutes: dashboards and classroom zones.
- **Personalization v2:** learned ranking, adaptive difficulty.
- **Community-lite:** "discuss" on cards with moderation, if research supports it.

### Eventual product (12+ months)

- A **personal knowledge graph:** what you know, what you've forgotten, and what to learn next.
- An **AI tutor mode** inside any story ("ask about this card"), grounded on the card's sources.
- **Audio editions** for commutes.
- **Global expansion** using the same model with local context packs.

---

## 16. Decisions, assumptions and open questions

### 16.1 Decision log

| # | Date | Decision | Rationale |
|---|------|----------|-----------|
| D-01 | 2026-10-24 | Beachhead = Indian GS aspirants + curious young adults | Daily current-affairs habit, syllabus fit, reachable communities |
| D-02 | 2026-10-24 | Ship MVP as a PWA (Android-first), not native | Existing PWA, fastest iteration, no store friction; revisit in Phase 3 |
| D-03 | 2026-10-24 | Editor-reviewed public content; AI-only content stays personal (paths) and is labelled | Trust is principle #1; public errors are costly |
| D-04 | 2026-10-24 | North Star = Weekly Curious Learners, not time spent | Aligns incentives with "finite by design" |
| D-05 | 2026-10-24 | Freemium; the core feed is free forever; gate heavy/costly/exam features | Feed is the growth engine; AI paths carry real cost |
| D-06 | 2026-10-24 | Recall is an MVP feature | Memory is the main differentiator vs feeds and chatbots |

### 16.2 Assumptions to validate

| ID | Assumption | How we validate | By |
|----|-----------|-----------------|----|
| A1 | Target users feel short-video time is "wasted" and want a better alternative | Design-partner interviews; landing-page message test | Phase 0 |
| A2 | Aspirants find current GS/current-affairs sources fragmented and forgettable | Interviews; survey in partner communities (n ≥ 200) | Phase 0 |
| A3 | The card/reel format produces understanding, not just engagement | Comprehension tests (pre/post) with design partners; M-06 | Phase 0–1 |
| A4 | Target users will pay small UPI subscriptions for learning | Waitlist with price shown; fake-door test | Phase 2 |
| A5 | Plus at ₹99–149/month converts 2–4% of MAU | Price tests in beta | Phase 2 |
| A6 | 2 free paths/week covers most free users' needs | Quota-hit rate in alpha | Phase 1 |
| A7 | Lesson generation can hit p95 ≤ 90 s at acceptable cost | Measure via NFR-02 logging; model/caching experiments | Phase 0–1 |
| A8 | ~2 editors can sustain 450 high-quality cards/month with AI drafting | Content Studio throughput in alpha | Phase 1 |
| A9 | Our consent/privacy approach satisfies India's DPDP Act requirements | Legal review | Before alpha |

### 16.3 Open questions

1. Which exam do we tag first: UPSC CSE only, or also State PSC/banking from day one? *Owner: Product. Proposal: UPSC-style GS taxonomy first; it covers most others.*
2. In-house editors vs a freelance editor network? *Owner: Content.*
3. Do we keep the name "Curiosity Feed"? Check trademark and domain availability; the repo is still named `history_scroller`. *Owner: Product/Legal.*
4. LLM provider strategy: single (OpenAI) vs multi-provider for cost and latency. *Owner: Eng.*
5. Do we show ads ever? *Proposal: no ads at MVP; revisit only for the free tier, and never inside the learning flow.*
6. Minimum age: 13+ or 18+? *Owner: Legal; affects consent flows.*

---

## 17. Risks and mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Factual errors damage trust (especially current affairs or polity) | Med | High | Two-person review, sources required, fast corrections, AI content labelled (§10) |
| AI cost runaway or abuse | Med | High | Quotas, KV rate limits, budget alarms, kill switch, caching (NFR-01) |
| Content treadmill: editorial can't keep the daily cadence | Med | High | Content Studio AI drafting, 7-day buffer of evergreen cards, editor rota (A8) |
| "Just another current-affairs app" | High | Med | Lead with format + recall + sources; creator zones; calm brand |
| Low retention after novelty | Med | High | Daily edition habit, recall, notifications at the user's chosen time; measure M-02 early |
| PWA limits (iOS push, install discoverability) | Med | Med | Android-first; TWA/native in Phase 3 if data shows the need |
| Copyright (news text, exam questions, videos) | Low–Med | High | Write original summaries with attribution; no copying of question banks; embeddable videos only |
| Political sensitivity / misinformation accusations | Med | High | Neutrality policy (§10.4), attribution, corrections log, second-editor check |
| Regulatory (DPDP Act, AI content norms) | Med | Med | Legal review before alpha (A9); data minimization; deletion/export |
| Single LLM provider dependency | Med | Med | Provider abstraction + evals so models can be swapped (§11.4) |

---

## 18. Appendix

### 18.1 Mapping: today's code → PRD pillars

| Pillar | Existing code | Gap to MVP |
|--------|--------------|------------|
| Feed | `src/feed/LearningReel.jsx`, `rankFeedItems.js`, `feedRepository.js`, `prototypeFeedItems.js` | Backend-served content, server-side ranking signals, "caught up" state |
| Daily Edition | `src/dailyEdition.js`, `src/DailyEdition.jsx` | Editorial editions instead of selection from a static catalog; archive |
| Stories | `src/RichStoryDetail.jsx`, `src/flagshipStories.js`, story detail in `App.jsx` | Sources UI, story view for every card |
| Paths | `api/*`, `lib/*`, `src/LearnTopicPanel.jsx`, `src/learningPathStorage.js` | Auth, quotas, background jobs, cache, moderation, server persistence |
| Zones | `src/zones/*` | 10+ zones in the CMS, syllabus tags, synced progress |
| Library | `src/library/LibraryPanel.jsx` | Sync, edition archive, notes |
| Recall | — | New |
| Content Studio | `scripts/generate-story-art.mjs` (art only) | New internal app |
| Accounts | — | New |

### 18.2 Glossary

- **Card:** the atomic learning unit (hook, setup, fact, why it matters, rabbit hole, sources).
- **Post:** a feed rendering of a card: slides or video.
- **Story:** the long-form narrative view of a card.
- **Edition:** the daily set of 5 editor-approved cards.
- **Path:** a user-requested, AI-generated sequence of 3–5 lessons (possibly multi-track).
- **Zone:** an editor-curated sequence of cards.
- **Recall item:** a question generated from a card for spaced review.
- **Drip:** inserting the next step of a path or zone into the feed.
- **GS:** general studies (exam syllabus area covering history, polity, geography, economy, science and current affairs).
- **WCL:** Weekly Curious Learners, the North Star (§14.1).

### 18.3 Changelog

| Date | Version | Change |
|------|---------|--------|
| 2026-10-24 | 1.0 | First PRD: vision, personas, MVP, requirements, GTM, metrics, roadmap |
