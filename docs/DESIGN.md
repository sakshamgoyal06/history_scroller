# Curiosity design: two modes

Status: v1.2 draft, 2026-11-15. Implements the experience in PRD v2.1 (§6, §8.1, §8.11, §10.3a) and D-12.
Clickable prototype: [`docs/design/two-mode-prototype.html`](design/two-mode-prototype.html) (open in a browser).

## 1. The idea

One app, two moods on one engine.

- **Curious mode** is what you open instead of Instagram: calm, light, five good stories (Today's 5), then it ends.
- **UPSC mode** ("Study") is the same habit with the exam switched on, in three parts (PRD v2.1, D-11):
  1. **Today:** national and international current affairs in four short steps, ending with 2–3 revision cards due today.
  2. **Learn (Learning Zone):** subject → chapter; each chapter is distilled into one explainer video plus a deck
     of 8–20 highlight cards in our own UPSC format, each citing a public source. No book or publisher is named (D-12).
  3. **Ask:** any topic or question, answered only from authentic sources, every sentence cited, or "no authentic
     source found".

What changes between the modes is pace, density and tone. The switch between them is the one moment in the app that
gets real animation, so entering study mode feels like a decision.

## 2. Brand system

### Colour

| Token | Light | Dark | Use |
|---|---|---|---|
| `mist` | `#EAF0EC` | `#0F1C1E` | Curious ground |
| `mist-surface` | `#F7FAF7` | `#16282B` | Curious raised surfaces |
| `c-ink` | `#13272A` | `#E3ECE8` | Curious text |
| `kingfisher` | `#0B7A83` | `#5CC2C9` | Curious actions, progress |
| `marigold` | `#E59A2F` | `#F0B455` | The "huh" spark. At most once per screen |
| `paper` | `#FBFBF8` | `#111317` | Study ground |
| `u-ink` | `#0E1116` | `#F2F2EE` | Study text |
| `hl` (highlighter) | `#FFE34A` | `#FFE34A` | Key facts, active state, study switch. Text on it is always `#0E1116` |
| `u-btn` / `u-btn-fg` | ink / highlighter | highlighter / ink | Study primary button |
| `gs1`–`gs4` | `#C8650F` `#2A55C9` `#17824B` `#B12F6E` | `#F0954A` `#86A2FF` `#4CC985` `#F070AE` | GS paper flags |

Why:
- **Curious = a monsoon morning.** Cool mist and slate ink are quiet enough for 11 pm in bed. Kingfisher teal is the
  action colour. Marigold is rationed so it keeps meaning "this is the interesting bit".
- **Study = how aspirants already study.** Newspaper and notebook paper, black ink, a yellow highlighter on the line
  that matters, coloured sticky flags per GS paper. Energy comes from saturation and contrast, not gradients.
- **Refused defaults.** The current app is warm cream + serif + terracotta, which is also the most common
  AI-generated look. No purple/blue gradients, no gradients at all, no emoji markers.

### Type

| Role | Face | Curious | Study |
|---|---|---|---|
| Display | Anybody (variable, `wdth` 50–150) | wide, light (`wdth` 118–140, `wght` 330–420) | condensed, heavy (`wdth` 58–66, `wght` 820–900) |
| Body | Mukta (Ek Type, Latin + Devanagari) | 18 px slide text | 16–18 px |
| Labels | IBM Plex Mono | kickers, dates | GS tags, sources, timings |

One typeface carries both moods: entering study mode literally tightens the type. Mukta covers Devanagari, which the
Hindi UPSC edition needs (`[A10]`).

### Shape and layout rules
- A post is the whole screen (vertical scroll-snap); slides advance by tapping the right 65% of the post.
- Lists are rows separated by rules, not card grids. Only two things look like objects: the Curious story plate and
  the GS flag, because both carry meaning.
- Curious corners are soft (22 px plates, pill buttons). Study corners are tight (4–6 px), like stationery.
- Tabs are words, not icons: Curious = Today · Explore · Library; Study = Today · Learn · Ask (down from four tabs;
  in Curious, Zones and Learn merge into Explore; in Study, saved items live at the bottom of Learn).
- Citations are visible objects: a small ink chip with the source number after each sentence; tapping it jumps to
  that source and flashes it in highlighter yellow.

## 3. Flows

```
First open ──▶ Choose a mode (1 of 2) ──┬─▶ Pick 3 interests (2 of 2) ──▶ Curious · Today's 5
   (Skip = Curious, no sign-up)          └─▶ Exam setup (2 of 2) ──▶ [study switch] ──▶ UPSC · Today

Curious · Today's 5 ──▶ post (hook → context → reveal → why it matters → takeaway)
   ├─▶ Go deeper ──▶ story page (sources, "Continue learning")
   └─▶ after 5: "That's today's 5" (what you learned, tomorrow's 3 recall cards) ──▶ Explore / Library

UPSC · Today ──▶ GS filter (All · GS1–GS4) ──▶ CA post, national + international
   │               (What happened → Background → Key facts → Why it matters)
   ├─▶ "Revise the basics" (on Why it matters) ──▶ the linked Learning Zone chapter
   ├─▶ Explain it UPSC-style ──▶ explainer page (one line, context, static linkage, Prelims facts,
   │                              arguments, way forward, Mains prompt, sources)
   ├─▶ 2–3 revision cards due today (question → Show answer → Again tomorrow / Got it)
   └─▶ "Caught up on today" (tally by GS paper, Learning Zone, Ask, later: weekly quiz)
UPSC · Learn ──▶ "N revision cards due" ──▶ Subject (GS flag) ──▶ Chapter list (% revised)
   └─▶ Chapter: explainer video (+ 60-second text fallback) ──▶ "Revise 8 highlight cards"
         └─▶ deck: tap right/left; card types Concept · Article · Date · Term · Common confusion · Asked like this;
             every card cites a public source (Constitution, IMD, …) ──▶ "Chapter revised" ──▶ due again in 1, 3, 7, 21 days
UPSC · Ask ──▶ question + visible source allow-list ──▶ one of:
   ├─▶ cited answer: sections, a citation chip on every sentence, "Sources · what each one says", count of dropped
   │   unsupported sentences
   ├─▶ already covered: opens the reviewed explainer and chapter instead of writing a new answer
   └─▶ "No authentic source found": says why, suggests a question that has sources
```

Screen-to-requirement map:

| Screen | Requirements |
|---|---|
| Choose a mode, interests, exam setup | FR-ONB-01, FR-ONB-02, FR-ACCT-02 (no sign-up wall) |
| Curious Today's 5 + end page | FR-ED-01..03, FR-FEED-03, FR-FEED-04 |
| Story page | FR-STORY-01..03 |
| Explore (path from a topic, series) | FR-PATH-01, FR-ZONE-01 |
| UPSC Today, GS filter, revision cards, caught up | FR-UPSC-01, FR-UPSC-02, FR-UPSC-05, FR-UPSC-11 |
| Revise the basics link | FR-UPSC-12 |
| Explain it UPSC-style | FR-UPSC-03, FR-TRUST-03 |
| Learning Zone: subjects, chapters | FR-UPSC-08 |
| Chapter: video + highlight deck | FR-UPSC-09, FR-UPSC-10, FR-UPSC-11 |
| Ask anything (cited / covered / no source) | FR-UPSC-04, FR-UPSC-04a, FR-UPSC-04b, FR-PATH-04 (quota line) |
| Saved (in Learn) | FR-UPSC-06 |

### No pop-ups
- Mode is a segmented control in the header, never a modal.
- Sign-in is an inline row in Library and at first save (FR-ACCT-02).
- Explainers, stories and Ask results are full pages with a back link, so they can be deep-linked (FR-FEED-07).
- Session ends are the last page of the feed, not a dialog.

## 4. Motion: the switch

| Time | Into study (≈1.0 s) | Back to Curious (≈0.8 s) |
|---|---|---|
| 0–260 ms | Highlighter stroke swipes left → right at a slight angle | Mist circle grows from the toggle |
| 260–520 ms | Stroke fills the screen; "STUDY MODE" condenses wide/light → narrow/heavy | "CURIOUS MODE" relaxes narrow/heavy → wide/light |
| 520 ms | UPSC Today renders underneath; 12 ms vibration on Android | Today's 5 renders underneath, resumed |
| 720–1040 ms | Yellow wipes upward off-screen, label lifts with it | Mist fades out |
| Reduced motion | 200 ms crossfade with the mode name; no sweep, morph or vibration | same |

Implementation notes: `clip-path` polygon/circle animations and `font-variation-settings` via the Web Animations API;
render the target screen at the fill midpoint so there is no flash. Everything else in the app uses short
(150–250 ms) ease-out transitions only.

## 5. Content rules the design depends on
- Highlight cards distil the chapter's information in our own UPSC-format wording and cite public sources; no book or
  publisher is named anywhere, and no passages, tables or figures are copied (PRD D-12, §10.3a). The Learning Zone
  footer says so: "Each chapter is distilled into our own UPSC-format cards. Every card cites a public source."
- The chapter video is curated and credited; until an editor picks one, the slot says so honestly (no placeholder titles); the fallback summary is always there because embeds fail on patchy networks.
- Ask shows its allow-list before you type, so the "no source found" state is expected rather than a failure.

## 6. Open questions
- Name of the mode in UI: "Study" in the toggle vs "UPSC mode" in onboarding. Prototype uses both; test with aspirants.
- Hindi: Mukta covers it, but Study headlines in condensed Anybody need a Devanagari display pairing (candidate: Mukta 800).
- Launch order (D-MODE) does not change the design; a single-mode launch hides the toggle.
