# Curiosity Feed — Product Requirements Document

| | |
|---|---|
| **Status** | v2.0 draft: new direction (Curious mode + UPSC mode), pending owner review |
| **Owner** | Product lead |
| **Last updated** | 2026-11-14 |
| **Code baseline** | v0.7 + engineering review + repo cleanup (see `BUILD_PLAN.md` §1) |
| **Companion docs** | [`BUILD_PLAN.md`](BUILD_PLAN.md): milestone plan and checklist that implements this PRD · [`ENGINEERING_REVIEW.md`](ENGINEERING_REVIEW.md): technical state, known issues, P0/P1/P2 engineering roadmap |

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

**Curiosity Feed is the app you open instead of Instagram.** It keeps the swipe-able, full-screen feel of short video,
but every post teaches you something real. Each post is sourced, opens into a deeper story, and any topic or question
can become a personal AI-built explainer. Sessions end on purpose, and a light next-day recall makes the best things stick.

It comes in **two modes on one engine**, picked at onboarding and switchable any time:

| | **Curious mode** (general) | **UPSC mode** |
|---|---|---|
| **For** | Young adults who want to cut Instagram time and are curious about the world | UPSC (and State PSC) aspirants who scroll in their breaks and feel guilty about it |
| **Feed** | Evergreen stories with hooks: history, science, economics, how things work | **Mostly current affairs** (~80%), made easy to digest, plus ~20% "interesting things you'd want to know" |
| **Go deeper** | Story view and AI paths on any topic | **"Explain it UPSC-style"**: any topic, event or question → background, static linkage, GS paper, Prelims facts, Mains angles, sources |
| **Add-ons** | Light recall | Recall, then quizzes and Prelims-style practice (add-ons, not the core) |

- **Wedge, Curious mode:** *"Swap one scroll a day. Leave knowing something you didn't."*
- **Wedge, UPSC mode:** *"Today's current affairs, explained simply, in the scroll you were going to do anyway. Ask about
  anything, get it UPSC-style."*
- **Differentiators:**
  1. A feed as easy to open as Instagram, but finite: you finish, you don't drift.
  2. Easy to digest: one idea per slide, plain language, "why it matters" on every post.
  3. Depth on demand: post → story → ask anything (UPSC-style in UPSC mode).
  4. Sources on everything, and a calm, no-guilt design.
- **MVP goal:** prove people swap to it. Target ≥ 25% of activated users still opening it in week 4 on ≥ 3 days a week,
  in each mode. Launch is invite-only on Android (installable PWA) with a daily current-affairs feed for UPSC mode,
  about 300 evergreen cards, AI explainers with quotas, light recall, and accounts with sync.
- **Business model:** freemium. Both feeds stay free. **Plus** (about ₹99–149/month `[A5]`) unlocks more AI explainers,
  quizzes and practice, monthly current-affairs compilations, offline packs and audio. UPSC mode is the likelier payer.

> **Direction change, 2026-11-14 (D-07, D-10).** v1.0 of this PRD made Indian GS exam aspirants the whole beachhead,
> with a 5-card edition, syllabus tags and exam mode at the centre. v2.0 makes Curiosity a general "swap your scroll"
> app first, with **UPSC mode** as a dedicated second mode: a current-affairs-first feed plus "explain it UPSC-style" on
> any topic. Quizzes and tests are add-ons in both.

---

## 2. Why: problem, insight, why now

### 2.1 The problem

1. **Short-video feeds take the spare minutes of the day and leave nothing behind.** Many young people say they want to
   use Instagram less, and feel worse after long sessions `[A1]`. Willpower and screen-time limits alone rarely stick.
2. **"Just delete the app" leaves a gap.** The urge to pick up the phone in a queue, on a commute or in bed doesn't go
   away. People need something to reach for that feels as easy, not a lecture.
3. **Learning products are built for desks.** Courses, books and long videos need a dedicated block of time and
   motivation. Most curiosity happens in two-minute gaps.
4. **AI answers are fast but forgettable.** Chatbots answer anything, but they don't surprise you, tell a story, or
   help you remember.

### 2.2 The insight

> People don't need to stop scrolling; they need a better thing to scroll. If the swipe feels as good as entertainment,
> each post is a real story with a hook, and the session ends before it turns into regret, they'll reach for it in the
> moments Instagram used to take.

The unit that does this is a **story with a hook**: one surprising fact, the setup, why it matters, and a rabbit hole.
The v0.1–v0.7 builds converged on this anatomy and on a full-screen reel. Whether real users swap to it is still
unvalidated `[A3]`.

### 2.3 Why now

- **Short-form fatigue:** "digital detox", app timers and "dopamine" talk are mainstream among young adults, which
  opens space for a feed that is finite and good for you.
- **LLMs with web search** make sourced, well-told explainers cheap to draft, so a small team can keep a large evergreen
  library fresh. The v0.7 pipeline already does plan → research → write → cite.
- **Mobile-first India:** a very large, young, phone-first audience, with growing comfort with small UPI payments `[A4]`.

### 2.4 Why us

A working v0.7 already has the hard parts prototyped: the reel, ranking and deep-dive stories, AI paths with citations,
zones, and a calm visual identity. We can get it in front of real users in weeks.

---

## 3. Who: target users

### 3.1 Primary persona: "The Recovering Scroller"

| | |
|---|---|
| **Profile** | 18–30, college student or early-career, Android phone, India (tier 1–2 cities first). Spends 1–3 h a day on Instagram/YouTube Shorts and wishes it were less. |
| **Context** | Picks up the phone in gaps: commute, queues, breaks, before sleep. Has tried app timers or deleting the app; it came back. |
| **Jobs to be done** | "Give me something to open instead of Instagram." "Make my spare minutes feel worth it." "Tell me something interesting I can bring up later." |
| **Pains** | Guilt after scrolling, feeling scattered, learning apps that feel like homework, content that is shallow or untrustworthy. |
| **Gains we offer** | A feed that's as easy to open, real stories, a clear end to each session, and a visible record of what you've learned. |
| **Willingness to pay** | Low at first; earned through habit. Small UPI subscriptions are plausible later `[A5]`. |

### 3.2 Primary persona, UPSC mode: "The Aspirant"

| | |
|---|---|
| **Profile** | 20–30, preparing for UPSC CSE (or a State PSC), often full-time. Tier 1–3 cities, Android phone, budget-conscious. Many prepare in Hindi `[A10]`. |
| **Context** | Studies in long blocks, but picks up the phone in breaks, on commutes and before sleep, and often ends up on Instagram, then feels guilty. Already follows daily current affairs from newspapers, coaching sites and Telegram PDFs. |
| **Jobs to be done** | "Keep up with current affairs without reading three sources." "Understand an issue well enough to write about it." "Look up any topic or event and get it the way UPSC wants it." "Make my breaks count." |
| **Pains** | Too much to read, long and dull current-affairs PDFs, not knowing what matters for the exam, forgetting, low-trust sources, scroll guilt. |
| **Gains we offer** | A current-affairs feed that's easy to digest, the static background linked to each news item, "explain it UPSC-style" on anything, recall, and later quizzes. |
| **Willingness to pay** | Low but real for clear exam value: already pays for test series and courses `[A5]`. |

### 3.3 Secondary persona: "The Curious Professional"

| | |
|---|---|
| **Profile** | 23–35, working in tech, finance, consulting or media. Reads newsletters and listens to explainer podcasts. |
| **Jobs to be done** | "Understand how things actually work." "Have interesting things to say." "Replace doomscrolling with something I don't regret." |
| **Gains we offer** | Story Mode, "Why it matters", AI paths on any topic ("explain semiconductors to me in 5 lessons"), sharing. |
| **Willingness to pay** | Higher; already pays for content subscriptions `[A5]`. |

### 3.4 Later: other exams, lifelong learners and families

Banking/SSC aspirants (UPSC mode's current affairs carry over), retirees, and parents learning alongside teenagers.
Not targeted at MVP.

### 3.5 Anti-personas: who we are *not* building for

- **Test-only grinders** who want only MCQ drills and mock tests: quizzes are an add-on here, not a test series.
- **Complete-syllabus seekers:** UPSC mode covers current affairs and whatever static topics users ask about; it does
  not replace standard books or a full course.
- **Children under 13:** this needs a separate safety and compliance model.
- **People wanting deep study** (coursework, certifications): we link out; we don't replace it.

---

## 4. Vision, mission and positioning

**Vision (5 years):** *The thing a billion people reach for in a spare minute, and are glad they did.*

**Mission:** Turn the scroll habit into curiosity that sticks, through great stories, personal learning paths and
sessions that end on purpose.

**Positioning statement:**
> For young, phone-first people who want to spend less time on Instagram, **Curiosity Feed** is a learning feed that
> feels as easy to open as short video but leaves you knowing something new. Unlike Instagram, it's finite and good for
> you. Unlike courses and chatbots, it's a story you want to swipe, not homework.
>
> **UPSC mode:** for aspirants who lose their breaks to reels, Curiosity is the current-affairs feed you'd actually
> open, and a tutor that explains any topic UPSC-style. Unlike PDFs and Telegram dumps, it's short, sourced and easy to
> digest. Unlike coaching apps, it fits in the scroll you were already going to do.

**Tagline candidates** (to test in GTM): "Scroll smarter." · "Swap a scroll." · "Two minutes. One good story." ·
"Curiosity, sourced."

**Brand personality:** calm, clever, warm, a little playful. A well-read friend, not a lecturer and not a hype channel.

---

## 5. Product principles

Use these to settle design arguments. They are ordered, so when two conflict, the higher one wins.

1. **Trust beats speed.** Every factual post shows its sources. When unsure, we say so (`uncertainties`). We never
   fabricate URLs, quotes or video IDs.
2. **Finite by design.** Sessions have a natural end: the session summary, "Today's 5" is done, "you're caught up". We
   optimize for "glad I opened it", not minutes.
3. **As easy as the habit it replaces.** Opening the app to the first post takes one tap and under 2 seconds. No
   sign-up wall, no setup before the first story.
4. **Easy to digest.** One idea per slide, plain words, no jargon without a gloss. In Curious mode, if a post doesn't
   earn a "huh", it doesn't ship; in UPSC mode, if an aspirant can't explain the news item after reading it, it's rewritten.
5. **Depth on demand.** Every surface offers one tap deeper: post → story → path. Nothing is a dead end.
6. **Calm craft.** No streak shaming, no dark patterns, no autoplay audio, and reduced motion is respected.
7. **India-first, world-aware.** Examples and context lean Indian, with global stories and comparisons.
8. **Works on a ₹10k phone on a patchy network.** Light, fast and offline-tolerant.

---

## 6. What: the product

### 6.1 Product pillars

| Pillar | User promise | Today (v0.7) | Target |
|--------|-------------|--------------|--------|
| **P1 · Feed** ("For You") | A short, beautiful, ranked stream of stories | Reel of 10 prototype posts + catalog cards; on-device ranking | Feed from a content backend, personalized by interests, with a clear end |
| **P2 · Today's 5** | Five hand-picked posts each day: the quick, complete session | Selector over the static catalog | Editor-picked mix scheduled a week ahead; one "in the news" story when there's a good one |
| **P3 · Stories** (go deeper) | A 3–6 minute story with sources | Story detail + Story Mode (1 flagship narrative) | Every card has a story view; narrative format standard |
| **P4 · Paths** (Learn a Topic) | Any topic → a sequenced, sourced 3–5 lesson path | Working AI pipeline, data stored only in the browser, no quotas | Accounts, quotas, server-side generation, cached lessons |
| **P5 · Zones** | Curated themed series (e.g. "How money works", "Weird science") | 5 zones, focus/drip modes | 15+ zones, each a binge-able series |
| **P6 · Recall** *(new, light)* | "Remember the best things you saw" | — | 3 quick "remember this?" cards the next day; optional, never nagging |
| **P7 · Library** | Everything you saved, liked, finished | Saved/liked/recent/paths | Synced across devices; "things I've learned" timeline |
| **P8 · Swap tools** *(later)* | "Help me reach for this instead of Instagram" | — | Home-screen placement prompt, widget, Android app that offers a card when you open a chosen app |
| **P9 · UPSC mode** *(new)* | "Current affairs made easy, and anything explained UPSC-style" | — | Current-affairs-first feed published daily; "Explain it UPSC-style" on any topic, event or question; GS paper tags; later quizzes and practice |

**How UPSC mode reuses the engine:** it is the same feed, story view, paths pipeline, recall and Library, with a
different content pool and ranking weights (current affairs pinned and fresh first), a UPSC lesson template for paths,
and GS tags on content. It is not a separate app.

### 6.2 Core loop

```
     ┌──── Trigger: the urge to scroll (queue, commute, bed) / optional nudge ────┐
     ▼                                                                             │
 Open app ──▶ Today's 5 or For You feed ──▶ Go deeper (story) ──▶ Save / Path       │
     │                                             │                │              │
     │                                             ▼                ▼              │
     └──▶ Session end: "you're done, here's what you learned" ◀─────┘              │
                         │                                                         │
                         └──▶ Next day: 3 "remember this?" cards ──────────────────┘
```

**Habit:** feel the urge → open Curiosity instead → a 3–8 minute session that ends on its own → occasionally go deeper →
next day, a quick recall of yesterday's best stories.

**UPSC mode loop:**

```
 Break / urge to scroll ──▶ Today's current affairs (feed, ~10–15 posts, ~80% news)
        │                         │
        │                         ├──▶ Tap "Explain it UPSC-style" on a post ──▶ background, static link, GS paper,
        │                         │                                              Prelims facts, Mains angles, sources
        │                         └──▶ "You're caught up on today" (+ a couple of interesting cards)
        │
        └──▶ Ask anything: type a topic, event or question ──▶ UPSC-style explainer ──▶ save to Library
                                             │
                     next day: recall on yesterday's news ◀──┘   (later: weekly quiz, Prelims practice)
```

### 6.3 Content formats

| Format | Where | Shape |
|--------|-------|-------|
| **Slide post** | Feed | 3–6 slides: hook → context → fact → why it matters → takeaway |
| **Video post** | Feed | Curated YouTube embed (licensed/embeddable) + caption; later original short video |
| **Card** | Explore, Library | Hook, setup, core fact/bullets, why it matters, rabbit hole, sources |
| **Story** | Deep dive | Narrative: cold open, context, 5–12 story beats, complication, takeaway, sources |
| **Path lesson** | Paths | AI-generated story with verified claims ↔ sources, misconceptions, uncertainties |
| **Recall card** *(new)* | Recall | "Remember this?" question with a reveal, linked back to the story |
| **Current-affairs post** *(UPSC mode)* | UPSC feed | 4–6 slides: what happened → background → key facts (Prelims) → why it matters / issues (Mains) → GS tag + sources |
| **UPSC explainer** *(UPSC mode)* | Ask anything / go deeper | Context, static linkage, constitutional/legal basis where relevant, key facts and data, arguments for and against, way forward, likely Prelims facts and Mains question angles, sources |

### 6.4 Domains and taxonomy

The domains are History · Science · Economics · Geography · Technology · Polity & Society · Environment · Current
Affairs · General Knowledge (oddities, "how things work").

Every content item also carries:
- **mode pool**: `curious`, `upsc` or both (an interesting evergreen card can serve both feeds);
- **topics** (free tags);
- **event date** for current affairs, and era/decade where relevant;
- **region** (India / World / both);
- **level** (light / curious / deep);
- **hook strength** *(editor-rated 1–3)*, used in ranking and to pick Today's 5;
- **GS tags** *(UPSC pool)*: our own mapping such as `GS2.polity.parliament`, `GS3.environment.biodiversity`. The
  taxonomy is our own, so we never reproduce exam bodies' copyrighted material.

---

## 7. MVP definition

### 7.1 MVP hypothesis

> If curious young adults who want to cut their Instagram time get a **finite, story-first feed that is as easy to open,
> with Today's 5 and light next-day recall**, at least 25% of activated users will still use it in week 4 on ≥ 3 days a
> week, and most design partners will report spending less time on Instagram.
>
> **UPSC mode:** if aspirants get **today's current affairs as an easy, sourced feed plus "explain it UPSC-style" on
> anything**, at least 30% will use it on ≥ 4 days a week in week 4, and most will rate it as easier to keep up with
> than their current current-affairs source.

### 7.2 MVP scope

**In scope (must ship):**

| # | Capability | Pillar | Requirements |
|---|------------|--------|--------------|
| 1 | Accounts (phone OTP or Google), cross-device sync of saves, progress and paths; guest-first | Platform | FR-ACCT-01..05 |
| 2 | Onboarding: pick a mode (Curious / UPSC), interests and region; mode switch in settings | Platform | FR-ONB-01..04 |
| 3 | Today's 5: five editor-picked posts every day, scheduled ahead | P2 | FR-ED-01..05 |
| 4 | For You feed served from a content backend (no deploy to publish), finite sessions | P1 | FR-FEED-01..07 |
| 5 | Story view with visible sources for every card | P3 | FR-STORY-01..04 |
| 6 | AI Paths with quotas, server-side generation, cached lessons | P4 | FR-PATH-01..08 |
| 7 | Recall v1 (light): 3 cards/day from stories seen in the last 7 days | P6 | FR-RECALL-01..05 |
| 8 | Library synced; Zones (≥ 15) | P5, P7 | FR-LIB-01..03, FR-ZONE-01..03 |
| 9 | Install-to-home-screen prompt, optional nudge at a chosen time, share-as-image | Growth | FR-GROW-01..05 |
| 10 | Report-an-error on every item + corrections workflow | Trust | FR-TRUST-01..04 |
| 11 | Internal **Content Studio**: AI-drafted cards → editor review → publish | Ops | FR-CMS-01..06 |
| 12 | Engineering P0 from `ENGINEERING_REVIEW.md` (spend controls, observability, persistence, safety, release hygiene) | Platform | NFR-01..12 |
| 13 | **UPSC mode:** daily current-affairs feed (~80% news, ~20% interesting cards), "Explain it UPSC-style" on any post or typed question, GS tags | P9 | FR-UPSC-01..07 |
| 14 | **Current-affairs pipeline** in Content Studio: pull from primary sources, AI-draft posts, review, publish by 09:00 IST | Ops | FR-CMS-07..08 |

**Content at launch:**
- Curious mode: ≥ 300 published cards across all domains, ≥ 80% evergreen; ≥ 15 zones; a 14-day buffer of scheduled
  Today's 5 before alpha, and never less than 7 days after.
- UPSC mode: 30 consecutive days of current-affairs feeds (≥ 8 posts/day) published on time before alpha, so new users
  see a month of back-catalogue; ≥ 60 evergreen "interesting" cards tagged for the UPSC pool.

**Out of scope for MVP** (explicitly deferred):
- Native iOS/Android apps and the app-intercept "swap" feature (we ship as a PWA; swap tools are Phase 2).
- Hindi and other languages: Phase 2, but the UI must be i18n-ready (NFR-10). Hindi matters early for UPSC mode `[A10]`.
- Quizzes, Prelims practice, mock tests and answer-writing feedback (add-ons, Phase 2).
- Full syllabus coverage of static GS: we explain what users ask for and what the news touches.
- Original video production; we use curated embeddable videos only.
- Social features (follows, comments, leaderboards).
- Payments. Plus is announced with a waitlist; billing comes in Phase 2.

### 7.3 MVP launch criteria (exit gates)

| Gate | Criterion |
|------|-----------|
| Quality | 0 open P0/P1 bugs; crash-free sessions ≥ 99.5%; LCP ≤ 2.5 s on a mid-tier Android over 4G (p75); first post visible ≤ 2 s from a home-screen tap |
| Trust | 100% of published cards have ≥ 1 source; correction SLA defined and staffed |
| Safety & cost | Per-user AI quotas enforced server-side; monthly OpenAI budget alarm + kill switch tested |
| Content | 300 cards, 15 zones, 14-day Today's 5 buffer; UPSC current affairs 30/30 days on time |
| UPSC accuracy | Blind review of 50 random current-affairs posts and 30 UPSC explainers finds no factual error that would cost a Prelims mark |
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
| FR-ONB-01 | M | Onboarding asks for a mode: *Curious* or *UPSC* (+ State PSC); switchable in settings | ≤ 3 screens; skippable (defaults to Curious) |
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

### 8.3 Today's 5 (P2, Curious mode)

| ID | Pri | Requirement | Acceptance criteria |
|----|-----|-------------|---------------------|
| FR-ED-01 | M | Each day has a Today's 5 of editor-picked cards, scheduled ahead | Buffer ≥ 7 days; never missing |
| FR-ED-02 | M | Mix rule: varied domains, at least one hook-strength-3 card, at most one "in the news" story | Checklist enforced in the edition builder |
| FR-ED-03 | M | Progress indicator (x/5) and a completion state | Completion recorded; feeds the recall pool |
| FR-ED-04 | S | Archive of past editions (last 30 days) | Browsable from the Library |
| FR-ED-05 | L | "What I learned this month" recap | Shareable image |

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
| FR-ZONE-01 | M | ≥ 15 curated zones, each 5–10 steps | Managed in Content Studio |
| FR-ZONE-02 | M | Zone progress synced; focus mode and drip-to-feed (exists in v0.7) | Progress survives reinstall |
| FR-ZONE-03 | S | Zone completion state + a recall pack | — |
| FR-LIB-01 | M | Library: saved, liked, paths, recent, edition archive | Synced |
| FR-LIB-02 | S | Personal notes on any card | Synced, searchable |
| FR-LIB-03 | L | Export revision sheet (PDF) from saved items | Plus |

### 8.8 Growth

| ID | Pri | Requirement | Acceptance criteria |
|----|-----|-------------|---------------------|
| FR-GROW-01 | M | Share any card as a branded image (story/WhatsApp format) + deep link | Image renders client-side under 1 s |
| FR-GROW-02 | S | Optional nudge at a time the user picks (e.g. "your usual scroll time"); UPSC mode: "today's current affairs are ready" | Web Push on Android; opt-in only; delivery and opt-out tracked |
| FR-GROW-05 | M | Install-to-home-screen prompt after the first finished session, suggesting the slot where Instagram sits | Install rate tracked (M-09) |
| FR-GROW-03 | S | Referral: invite link → both get 1 week of Plus once Plus exists | Attribution recorded |
| FR-GROW-04 | M | Public SEO pages for every published card (read-only, no account needed) | Indexed, with a canonical URL and Open Graph image |

### 8.9 Trust and safety

| ID | Pri | Requirement | Acceptance criteria |
|----|-----|-------------|---------------------|
| FR-TRUST-01 | M | "Report an error" on every card, story and lesson | Report reaches the editor queue with the item ID |
| FR-TRUST-02 | M | Corrections: an edited item shows "Updated on <date>: <what changed>" | Visible changelog per item |
| FR-TRUST-03 | M | AI-generated content is labelled ("AI-written, sources checked automatically") vs editor-reviewed | Label is always visible on path lessons |
| FR-TRUST-04 | M | Political and contested topics follow the neutrality guidelines in §10.4 | Checklist in Content Studio for polity and current affairs |

### 8.10 Content Studio (internal)

| ID | Pri | Requirement | Acceptance criteria |
|----|-----|-------------|---------------------|
| FR-CMS-01 | M | Editors create cards from a prompt or URL; AI drafts the hook/setup/fact/why/rabbit hole + sources + recall items | Draft in < 60 s |
| FR-CMS-02 | M | Review workflow: draft → in review → approved → scheduled → published; second check for polity and election items | Audit trail per item |
| FR-CMS-03 | M | Source checker: every claim must map to a source; dead links flagged | Publishing blocked without sources |
| FR-CMS-04 | M | Edition builder: pick 5 cards, preview, schedule | Scheduled publish works without an engineer |
| FR-CMS-05 | M | Artwork: template-generated art (as `scripts/generate-story-art.mjs` does today) or upload | Every card has art |
| FR-CMS-06 | S | Content analytics: completion, saves, error reports per item | Weekly content review uses it |
| FR-CMS-07 | M | Current-affairs intake: daily fetch from primary sources (PIB, PRS, RBI, courts, ministries) + selected news; AI shortlists exam-relevant items and drafts posts in the UPSC template | Draft queue ready by 07:00 IST |
| FR-CMS-08 | M | UPSC publishing: GS tags, static-linkage field, scheduled daily publish | Feed live by 09:00 IST (M-13) |

### 8.11 UPSC mode (P9)

| ID | Pri | Requirement | Acceptance criteria |
|----|-----|-------------|---------------------|
| FR-UPSC-01 | M | UPSC feed: today's current affairs first (~80%), then interesting cards (~20%); "caught up on today" end state | Ranking pins today's items; mix checked weekly |
| FR-UPSC-02 | M | Every current-affairs post has: what happened, background, key facts, why it matters, GS tag, sources | Studio blocks publish if a field is empty |
| FR-UPSC-03 | M | "Explain it UPSC-style" button on every UPSC post opens a full explainer | Explainer ready ≤ 30 s (cached ones instant) |
| FR-UPSC-04 | M | "Ask anything": type any topic, event or question and get a UPSC-style explainer (context, static linkage, constitutional/legal basis where relevant, facts and data, arguments both sides, way forward, Prelims facts, Mains angles, sources) | Uses the paths pipeline with a UPSC template; quota-limited (FR-PATH-04); labelled AI-written |
| FR-UPSC-05 | M | Browse past days and filter by GS paper | Last 30 days at launch |
| FR-UPSC-06 | S | Save explainers and posts to a GS-wise Library | Synced |
| FR-UPSC-07 | L | Add-ons: daily/weekly quiz on the feed, Prelims-style practice, monthly compilation | Phase 2 (Plus) |

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
| NFR-10 | i18n | All UI strings externalized; content model supports per-language variants (Hindi in Phase 2, UPSC mode first) |
| NFR-11 | Quality gates | CI must pass (lint, tests, build); E2E smoke on core flows before release |
| NFR-12 | AI quality | Eval suite on a golden topic set gates prompt/model changes (§11.4) |

---

## 10. Content strategy and editorial policy

### 10.1 Content mix

| Type | Share of feed | Source | Review |
|------|---------------|--------|--------|
| Evergreen stories (history, science, economics, geography, technology, society) | ~65% | AI draft from encyclopedic, academic, museum and official sources | One editor review |
| "Wow" and how-things-work (oddities, nature, everyday science) | ~20% | AI draft + editor pick | One editor review |
| In the news (the story behind something people are talking about) | ~15% | AI draft from reporting + primary sources; weekly cadence, not daily | One editor review; second check for politics |
| User AI paths | Personal, not in the public feed | Automated checks only | Labelled AI-written |

**The bar for every card is the hook.** Editors rate hook strength (1–3); a card rated 1 is rewritten or cut.

**UPSC mode feed:**

| Type | Share of UPSC feed | Source | Review |
|------|--------------------|--------|--------|
| Current affairs (last 1–7 days) | ~80% | AI draft from primary sources (PIB, PRS, RBI, ministries, Supreme Court/HC orders, Gazette, international bodies) and reporting | Editor review; second check for polity and anything contested |
| Interesting things to know (evergreen, GS-relevant) | ~20% | Shared pool with Curious mode, tagged for UPSC | One editor review |
| "Explain it UPSC-style" answers | Personal, on demand | AI with web research, UPSC template, sources required | Automated checks; labelled AI-written; popular ones promoted to reviewed content |

**Daily current-affairs cadence:** pick 8–15 items a day that matter for the exam (not every headline), publish by
09:00 IST. Each post links the news to its static background and GS paper, and says plainly what to remember.

### 10.2 Production pipeline

```
Idea (curiosity backlog, reader questions, trending topic, zone gap) → AI draft in Content Studio → source check (auto)
  → editor edit + hook rating + approve → schedule (Today's 5 a week ahead, or feed pool) → publish → metrics
  → error reports / corrections → refresh or retire low performers
```

**Current-affairs pipeline (UPSC mode):**

```
06:00 fetch: PIB releases, PRS, RBI, court orders, selected news feeds → AI shortlists exam-relevant items
  → AI drafts posts (UPSC template, sources attached) → source check (auto: every fact maps to a source)
  → editor reviews and publishes by 09:00 IST → corrections through the day
```

**Throughput target:** Curious mode about 5 Today's 5 slots + ~5 feed cards/day, scheduled ahead. UPSC mode 8–15
current-affairs posts/day on a daily deadline. With AI drafting, this is about 2 editors, one of whom knows UPSC well
`[A8]`. The daily current-affairs deadline is the hardest operational commitment in this PRD.

### 10.3 Source policy

- **Preferred:** primary and official sources, universities, museums, peer-reviewed work and established publishers.
- **Not acceptable as sole source:** blogs, social media, AI output.
- Every published claim maps to ≥ 1 source. Contested claims need ≥ 2 independent sources or are marked as uncertain.

### 10.4 Neutrality on politics

- Curious mode mostly avoids live political controversy; it's for curiosity, not argument.
- UPSC mode must cover polity and governance news. Describe positions, don't endorse them, and attribute claims ("the
  government says…", "critics argue…"). UPSC explainers give arguments on both sides, as the exam expects.
- No party-political framing in hooks. A second editor checks anything election-related before it goes out.

### 10.5 Corrections policy

- **Fix SLA:** factual errors within 24 h of a valid report; 4 h for today's current affairs.
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

- **User:** id, auth identities, mode (curious/upsc), exam, interests, region, notification prefs, plan (free/plus), quotas.
- **ContentItem:** id, type (card/post/story/recall), mode pool, domain, topics, GS tags, event date, region, level, body (versioned), sources, art, status, publishedAt, corrections[].
- **Edition:** date, ordered item ids, status.
- **Zone:** id, title, steps (ordered item ids).
- **Path:** id, owner, request (topic/level/region/length), plan, tracks, lessons (status, content, sources), share token.
- **Progress / Events:** user × item (seen, explored, saved, known, liked, not interested, completed).
- **RecallItem / RecallState:** item link, question, options, answer; per user: due date, interval, ease, history.

### 11.3 Ranking (MVP)

The MVP ranker is a heuristic and runs server-side or at the edge, extending the v0.7 `rankFeedItems`:
- **Score:** interest affinity, mode, freshness (today's current affairs first in UPSC mode), hook strength, novelty (unseen), and quality (completion rate).
- **Penalties:** "not interested", over-seen domains.
- **Diversity:** no 3-in-a-row by domain or format.
- **Today's 5** (Curious) or **today's current affairs** (UPSC) are pinned first.

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
- `mode_selected {mode}`, `upsc_caught_up`, `upsc_explainer_requested` / `upsc_explainer_rated {helpful}`;
- `install_prompt_shown` / `app_installed`;
- `report_error`;
- `paywall_view` / `waitlist_join`.

Every event carries user id (or anon id), item id, domain, and source surface.

---

## 12. Go-to-market strategy

### 12.1 Beachhead and positioning

**Beachhead:** college students and early-career young adults in Indian tier 1–2 cities who already want to cut their
Instagram time.

**Why this beachhead:**
1. The urge to scroll is daily, so the habit slot already exists; we only have to win the swap.
2. "I spend too much time on reels" is a common, sayable feeling, which makes the message simple.
3. They gather in dense, reachable places: campuses, college groups, Instagram and YouTube themselves.
4. The v0.7 content and reel format already speak to this audience.

**Message by persona:**

| Persona | Core message | Proof point |
|---------|-------------|-------------|
| Recovering Scroller | "Swap a scroll. Same swipe, but you leave knowing something." | Finite sessions, great hooks, "what you learned" summary |
| Curious professional | "Understand how the world works, two minutes at a time." | Story Mode, Why it matters, AI paths |
| Aspirant (UPSC mode) | "Today's current affairs, easy to digest, in the break you'd spend on reels. Ask about anything, get it UPSC-style." | Daily feed by 09:00, static linkage, GS tags, sources, explainers |

**UPSC mode beachhead:** UPSC CSE aspirants first (State PSC aspirants share most current affairs). They gather in dense
Telegram channels, YouTube and Instagram pages, libraries and coaching hubs (e.g. Delhi's Old Rajinder Nagar and
Mukherjee Nagar), so they are reachable cheaply. The bar is high: they compare everything with Drishti, Vision,
Insights and The Hindu, so accuracy and "easier to digest" must be visible from the first post.

### 12.2 Launch phases

| Phase | Audience | Size | Goal | Exit criteria |
|-------|----------|------|------|---------------|
| **0. Design partners** | 20–30 people who want to use Instagram less, plus 15–20 UPSC aspirants; weekly check-ins plus screen-time screenshots | 50 | Validate the swap, the content, and the current-affairs format | ≥ 50% open it ≥ 4 days/week for 2 weeks; ≥ half report less Instagram time `[A3]`; aspirants rate it easier than their current CA source |
| **1. Private alpha** | Invite-only, from campuses and partners' friends | 500 | Retention signal, content stress test | W4 retention ≥ 20% |
| **2. Closed beta** | Waitlist + referrals + creator partners + "21-day swap" challenge | 5,000 | Channel testing, Plus waitlist | W4 ≥ 25%; ≥ 5% of WAU join the Plus waitlist |
| **3. Public beta** | Open PWA/Android app, SEO pages live | 50,000 | Growth loops, Plus billing | CAC and payback inside targets (§13) |

### 12.3 Channels

| Channel | Tactic | Why it fits | Primary metric |
|---------|--------|-------------|----------------|
| **Instagram Reels / YouTube Shorts** | Post our best cards as 20-second shorts: "the full story is in the app, and it ends when you're done" | Meet the habit where it lives; the content is the ad | Profile visits → installs |
| **"21-day swap" challenge** | Public challenge: open Curiosity instead of Instagram once a day; share your screen-time before/after | Turns the goal into something social and shareable | Challenge sign-ups → W4 retention |
| **Campus ambassadors** | Student ambassadors in 20 colleges; "curiosity quiz" nights | Dense networks, low cost | Referral sign-ups per ambassador |
| **Creator partnerships** | 3–5 explainer/science/history creators co-brand zones ("Zone by X") | Borrowed trust + distribution | Attributed sign-ups, W4 retention |
| **SEO** | Public card pages ("Why do we have leap years?") with Open Graph images | Evergreen curiosity queries; each card is a landing page | Organic sessions → sign-ups |
| **Referral loop** | Share card → recipient lands on the story → "get Today's 5" | Built-in virality | K-factor |
| **Telegram / WhatsApp (UPSC)** | Daily current-affairs post as a shareable image + link; partner with channel admins | Where aspirants already get current affairs | Link opens → sign-ups |
| **UPSC educators (UPSC)** | 2–3 educators review a week of posts publicly or co-brand explainers | Borrowed trust in a trust-sensitive market | Attributed sign-ups, W4 retention |
| **Libraries and coaching hubs (UPSC)** | QR posters and a free "current affairs in your break" trial in study libraries | Dense, physical, cheap | Scans → sign-ups |

**Not doing at MVP:** paid performance marketing at scale (only small tests to measure CAC) and app-store ads.

### 12.4 Launch narrative and PR

**Story:** "An Indian startup built the app you open instead of Instagram, and it tells you when to stop."

**Angles:** screen-time guilt and intentional technology; AI done responsibly (citations, corrections); a feed with an end.

**Timing:** launch the public beta around New Year resolutions or a "digital detox" moment.

### 12.5 Partnerships (Phase 2+)

- Museums, science communicators and publishers: co-branded zones.
- Colleges: curiosity clubs and orientation-week challenges.
- Digital-wellbeing apps: "instead of blocking, swap" integrations.
- Telcos and OEMs: preload or bundle (Phase 3).

---

## 13. Business model and unit economics

### 13.1 Pricing (hypotheses to test, not before Phase 2)

| Tier | Price `[A5]` | Includes |
|------|-------------|----------|
| **Free** | ₹0 | Both feeds, Today's 5, stories with sources, all zones, 2 AI paths + 5 UPSC explainers/week, light recall |
| **Plus** | ~₹99–149/month or ₹799–999/year | More paths and explainers, quizzes and Prelims-style practice, monthly current-affairs compilation, offline packs, audio, full recall |

**Principle:** the free product must win the swap on its own, because the feed is the growth engine. We charge for
*costly or power-user* features, never for the core loop.

**Billing:** UPI autopay + cards via a payment gateway (Phase 2). Play Billing applies once we ship the Android app.

**Honest note:** general curiosity apps monetize less well than exam prep, so UPSC mode is the likelier source of
revenue. If Curious-mode conversion stays under 1%, the fallback is sponsorship of clearly labelled zones (e.g. a
museum), never ads inside the feed.

### 13.2 Cost model (per active user, monthly, illustrative)

| Cost | Driver | Assumption to validate |
|------|--------|------------------------|
| AI for paths | (paths/user/month × lessons/path × cost/lesson) × (1 − cache hit rate) | Cost per lesson measured once usage logging lands (NFR-02) `[A7]` |
| AI for content production | Cards/month × drafting cost, amortized over all users | Small per user at scale |
| Infra | DB + server + CDN | Low at MVP scale |
| AI for UPSC explainers | Explainers/user/month × cost each × (1 − cache hit rate); popular topics cache well | Measured via NFR-02 `[A7]` |
| Editorial | ~2 editors (one UPSC-focused) | Largest fixed cost early `[A8]` |

**Targets:** variable cost per free MAU ≤ ₹3/month; gross margin on Plus ≥ 70%; free-to-paid 1–3% of MAU by month 12
(higher expected in UPSC mode) `[A5]`.

---

## 14. Success metrics

### 14.1 North Star

**Weekly Swappers (WS):** users who open the app on ≥ 3 different days in a week and finish at least one session
(Today's 5, a session summary, a story or a recall set) on each of those days.

This measures a habit that can stand in for scrolling, not time spent, which keeps us honest with Principle 2.

### 14.2 Metric tree

| ID | Metric | Definition | MVP target |
|----|--------|-----------|------------|
| M-01 | Activation | % of new users who finish their first session within 24 h | ≥ 60% |
| M-02 | W1 / W4 retention | % of activated users active in week 1 / week 4 | ≥ 45% / ≥ 25% |
| M-03 | Today's 5 completion | % of Today's 5 opens that reach 5/5 | ≥ 60% |
| M-04 | Go-deeper rate | Stories opened / feed posts viewed | ≥ 12% |
| M-05 | Recall participation | % of WAU doing ≥ 1 recall set/week | ≥ 25% |
| M-06 | "Huh" rate | % of posts that get like, save, share or go-deeper | ≥ 15% |
| M-07 | Path success | Lessons ready ÷ lessons requested; lesson completion rate | ≥ 97%; ≥ 40% |
| M-08 | Share rate | Shares per 100 WAU per week | ≥ 10 |
| M-09 | Home-screen installs | % of activated users who add it to the home screen | ≥ 40% |
| M-10 | Instagram time change | Self-reported (screen-time screenshot) change in design partners and challenge users | Majority report a decrease |
| M-11 | UPSC daily catch-up | % of UPSC-mode WAU who reach "caught up on today" on ≥ 4 days/week | ≥ 40% |
| M-12 | UPSC explainer use | Explainers requested per UPSC-mode WAU per week; % rated helpful | ≥ 2; ≥ 80% helpful |
| M-13 | On-time current affairs | Days the UPSC feed is published by 09:00 IST | 100% |

All retention metrics are reported per mode.

### 14.3 Guardrails

These must not regress:
- **Error reports** per 1,000 items viewed ≤ 2; median correction time ≤ 24 h.
- **AI cost per WAU** within budget (§13.2).
- **Healthy sessions:** median session 3–10 min. A rising share of 45+ minute sessions means we became the thing we're replacing.
- **Nudge opt-outs** ≤ 5%/month.
- **Crash-free sessions** ≥ 99.5%.

### 14.4 Qualitative

- Weekly design-partner check-ins in Phase 0, then monthly interviews (≥ 8).
- **"Glad I opened it" score:** a one-tap prompt at session end, aiming for ≥ 75% "yes".
- **Sean Ellis "very disappointed" test**, aiming for ≥ 40% by public beta.

---

## 15. Roadmap: MVP to eventual product

### Phase 0: Foundation + design partners (weeks 0–4)

- Engineering P0 from `ENGINEERING_REVIEW.md`: spend controls, quotas, kill switch; observability; Postgres +
  accounts + sync + v0.7 data import; moderation; CI/branch protection.
- Content Studio v1 (FR-CMS-01..04) and the first 150 cards with strong hooks.
- Current-affairs pipeline v0 (FR-CMS-07) and "Explain it UPSC-style" prompt template on the existing paths pipeline.
- Analytics events (§11.5).
- Design partners use the current app with new content, so we learn about the swap and the CA format before building more.

### Phase 1: MVP / Private alpha (weeks 5–10)

- Onboarding, Today's 5, backend-served feed with finite sessions.
- Sources UI, report-an-error and corrections.
- Light recall v1, background lesson generation + cache.
- Zones ×15, share images, install prompt, optional nudge, public SEO card pages.
- Content: 300 cards and a 14-day Today's 5 buffer.
- UPSC mode: mode switch, daily current-affairs feed, "Explain it UPSC-style" on posts and typed questions, GS tags,
  30 days of back-catalogue.

Launch criteria per §7.3.

### Phase 2: Closed beta → swap tools and Plus (months 3–6)

- **Android app (TWA) with swap tools:** home-screen widget with today's story; opt-in "offer a story when I open a
  chosen app" (using Android accessibility/usage access, after a privacy review).
- **Plus billing** (UPI autopay) and quotas by plan.
- **UPSC add-ons:** daily/weekly quizzes on the feed, Prelims-style practice questions written by us (no copyrighted
  previous-year banks), monthly current-affairs compilation, GS-wise Library view.
- **Hindi UI + Hindi content pilot**, UPSC mode first, using the i18n groundwork in NFR-10.
- **Audio stories** for commutes; notes; "what I've learned" timeline.
- **Creator zones**, referral program, "21-day swap" challenge in-app.

### Phase 3: Public beta and scale (months 6–12)

- iOS, if data supports it.
- More languages: Tamil, Telugu, Bengali, Marathi.
- More exam modes: State PSC specific, then banking/SSC GK, reusing the current-affairs pipeline.
- UPSC answer-writing practice with AI feedback, if research supports it.
- Original short video: AI-assisted narration plus editorial review.
- Personalization v2: learned ranking, adaptive depth.
- Community-lite: "discuss" on cards with moderation, if research supports it.

### Eventual product (12+ months)

- A **personal knowledge map**: what you've learned, and what to explore next.
- **"Ask about this story"**, grounded on the card's sources.
- **Global expansion** with local context packs.

---

## 16. Decisions, assumptions and open questions

### 16.1 Decision log

| # | Date | Decision | Rationale |
|---|------|----------|-----------|
| D-01 | 2026-10-24 | ~~Beachhead = Indian GS aspirants + curious young adults~~ Superseded by D-07 | — |
| D-02 | 2026-10-24 | Ship MVP as a PWA (Android-first), not native | Existing PWA, fastest iteration; Android app in Phase 2 for swap tools |
| D-03 | 2026-10-24 | Editor-reviewed public content; AI-only content stays personal (paths) and is labelled | Trust is principle #1; public errors are costly |
| D-04 | 2026-10-24 | ~~North Star = Weekly Curious Learners~~ Replaced by Weekly Swappers (D-08) | — |
| D-05 | 2026-10-24 | Freemium; the core feed is free forever | Feed is the growth engine; AI paths carry real cost |
| D-06 | 2026-10-24 | Recall is an MVP feature, kept light and optional (amended 2026-11-14) | Memory sets us apart, but must not feel like homework |
| D-07 | 2026-11-14 | The product is a general "swap your scroll" curiosity app (Curious mode) | Matches the original goal: replace the Instagram habit |
| D-08 | 2026-11-14 | North Star = Weekly Swappers (§14.1), reported per mode | Measures the replacement habit directly |
| D-09 | 2026-11-14 | Curious mode has no daily news edition; Today's 5 is evergreen-first and scheduled a week ahead | No daily deadline for the general feed |
| D-10 | 2026-11-14 | Add **UPSC mode** on the same engine: current-affairs-first feed (~80%) + "Explain it UPSC-style" on anything; quizzes and tests are add-ons | Aspirants need current affairs made easy and on-demand explanations; owner's call (Saksham) |

### 16.2 Assumptions to validate

| ID | Assumption | How we validate | By |
|----|-----------|-----------------|----|
| A1 | Target users want to spend less time on Instagram and will try an alternative | Design-partner recruiting; landing-page message test | Phase 0 |
| A2 | Curiosity alone (no exam or work reason) brings people back ≥ 3 days a week | Design-partner usage over 2 weeks; W4 in alpha | Phase 0–1 |
| A3 | Using Curiosity actually reduces Instagram time, rather than adding to screen time | Screen-time screenshots before/after (M-10) | Phase 0–1 |
| A4 | Target users will pay small UPI subscriptions for extras | Waitlist with price shown; fake-door test | Phase 2 |
| A5 | Plus at ~₹99/month converts 1–3% of MAU | Price tests in beta | Phase 2 |
| A6 | 2 free paths/week covers most free users' needs | Quota-hit rate in alpha | Phase 1 |
| A7 | Lesson generation can hit p95 ≤ 90 s at acceptable cost | Measure via NFR-02 logging; model/caching experiments | Phase 0–1 |
| A8 | One editor can sustain ~300 strong cards/month with AI drafting | Content Studio throughput in Phase 0 | Phase 0–1 |
| A9 | Our consent/privacy approach satisfies India's DPDP Act requirements | Legal review | Before alpha |
| A10 | Enough aspirants are comfortable in English for an English-first UPSC mode | Design-partner recruiting; language question at onboarding | Phase 0 |
| A11 | AI-drafted, editor-reviewed current affairs can match established CA sources on accuracy, by 09:00 every day | Blind accuracy review (§7.3) and 30/30 on-time days | Phase 0–1 |
| A12 | Aspirants trust AI "UPSC-style" explainers when sources are shown | Helpfulness ratings (M-12); error reports | Phase 1 |

### 16.3 Open questions

1. Do we keep the name "Curiosity Feed"? Check trademark and domain availability; the repo is still named `history_scroller`. *Owner: Product/Legal.*
2. In-house editor vs a freelance writer network? *Owner: Content.*
3. LLM provider strategy: single (OpenAI) vs multi-provider for cost and latency. *Owner: Eng.*
4. Do we show ads ever? *Proposal: no ads in the feed, ever; labelled sponsored zones at most.*
5. Minimum age: 13+ or 18+? *Owner: Legal; affects consent flows.*
6. How far do swap tools go on Android (widget only, or offering a story when Instagram opens)? *Owner: Product; decide after Phase 0 data and a privacy review.*
7. **Launch order:** both modes in the alpha, or one first? Running both doubles content work. *Proposal: build the
   shared engine once, start design partners in both, and let the Phase 0 numbers decide which mode leads the alpha.*
8. Who reviews current affairs daily: Saksham, a hired UPSC-background editor, or a freelance network? *Owner: Content.*

---

## 17. Risks and mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Curiosity is a "nice to have" and loses to Instagram after the novelty fades | High | High | Hook-first content bar, finite sessions, swap tools, test with design partners before building more (A2) |
| Users add Curiosity on top of Instagram instead of replacing it | Med | Med | Measure M-10; swap tools in Phase 2; message around swapping, not adding |
| Content treadmill: not enough great stories | Med | High | Evergreen library, 14-day buffer, AI drafting, retire weak cards using M-06 |
| Factual errors damage trust | Med | High | Sources required, editor review, fast corrections, AI content labelled (§10) |
| AI cost runaway or abuse | Med | High | Quotas, shared rate limits, budget alarms, kill switch, caching (NFR-01) |
| UPSC current affairs: an error or a missed day loses aspirants' trust fast | Med | High | Primary sources only, auto source check, editor review, 4 h correction SLA, a person accountable for 09:00 every day (M-13) |
| "Just another current-affairs app" next to Drishti, Vision, Insights and Telegram | High | Med | Lead with the format (easy, swipeable, in your break) and "explain anything UPSC-style", not with volume |
| Two modes split a small team's focus | Med | High | One engine, shared evergreen pool, mode-specific content only where needed; open question 7 |
| Weak monetization for a general audience | High | Med | Keep costs low; Plus for costly features; labelled sponsored zones as a fallback |
| PWA limits (iOS push, install discoverability, no swap tools) | Med | Med | Android-first; TWA app in Phase 2 |
| Copyright (text, images, videos) | Low–Med | High | Original writing with attribution; embeddable videos only |
| Regulatory (DPDP Act, AI content norms, accessibility-permission use on Android) | Med | Med | Legal review before alpha (A9); data minimization; privacy review before swap tools |
| Single LLM provider dependency | Med | Med | Provider abstraction + evals so models can be swapped (§11.4) |

---

## 18. Appendix

### 18.1 Mapping: today's code → PRD pillars

| Pillar | Existing code | Gap to MVP |
|--------|--------------|------------|
| Feed | `src/feed/` (`LearningReel.jsx`, `rankFeedItems.js`, `feedRepository.js`, `prototypeFeedItems.js`) | Backend-served content, server-side ranking signals, "caught up" state |
| Today's 5 | `src/edition/` | Editor-scheduled picks instead of selection from a static catalog |
| UPSC mode | `src/learn/` (paths pipeline), `lib/openaiLesson.js` | New: mode switch, CA feed, UPSC explainer template, CA intake in Studio |
| Stories | `src/stories/`, story detail in `App.jsx` | Sources UI, story view for every card |
| Paths | `api/*`, `lib/*`, `src/learn/` | Auth, quotas, background jobs, cache, moderation, server persistence |
| Zones | `src/zones/*` | 15+ zones in the CMS, synced progress |
| Library | `src/library/LibraryPanel.jsx` | Sync, edition archive, notes |
| Recall | — | New |
| Content Studio | `scripts/generate-story-art.mjs` (art only) | New internal app |
| Accounts | — | New |

### 18.2 Glossary

- **Card:** the atomic learning unit (hook, setup, fact, why it matters, rabbit hole, sources).
- **Post:** a feed rendering of a card: slides or video.
- **Story:** the long-form narrative view of a card.
- **Today's 5:** the daily set of 5 editor-picked cards in Curious mode.
- **Mode:** Curious (general) or UPSC; same engine, different content pool and ranking.
- **UPSC explainer:** an AI-generated, sourced answer to any topic or question in UPSC format.
- **Path:** a user-requested, AI-generated sequence of 3–5 lessons (possibly multi-track).
- **Zone:** an editor-curated sequence of cards.
- **Recall item:** a question generated from a card for spaced review.
- **Drip:** inserting the next step of a path or zone into the feed.
- **GS:** general studies (exam syllabus area covering history, polity, geography, economy, science and current affairs).
- **WS:** Weekly Swappers, the North Star (§14.1).
- **CA:** current affairs.

### 18.3 Changelog

| Date | Version | Change |
|------|---------|--------|
| 2026-10-24 | 1.0 | First PRD: vision, personas, MVP, requirements, GTM, metrics, roadmap |
| 2026-10-24 | 1.0.1 | Linked `BUILD_PLAN.md`; baseline commit updated after the repo cleanup (no requirement changes) |
| 2026-11-14 | 2.0 | New direction: general "swap your scroll" curiosity app plus UPSC mode (current-affairs-first feed, "Explain it UPSC-style"); exam mode and syllabus-first scope removed; North Star → Weekly Swappers; D-07..D-10 |
