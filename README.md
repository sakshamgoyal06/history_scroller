# Curiosity Feed

A calm mobile PWA for general learning, one story at a time (React + Vite).

## Build log — Curiosity Feed v0.2 foundation

**Build name:** Curiosity Feed v0.2 foundation

### What changed

- Rebranded from a history-only feed to a **multi-domain learning app** (Curiosity Feed).
- Expanded the catalog from 20 history stories to **45 cards** across eight learning domains.
- Added **domain filters** (single-select chips) and **topic sub-filters** (multi-select era topics on legacy cards).
- Introduced **Learning Zones** — lightweight paths that filter the feed by curated card sets.
- Reworked **story detail** into scannable sections (Hook, setup, fact, why it matters, rabbit hole) with **Continue learning** suggestions.
- Kept the stack **frontend-only**: hardcoded data, `localStorage` for Saved/Known, hash + History API for story deep links, Workbox PWA shell.

### Domains in the feed

History · Economics · Geography · Civics · Technology · Current Affairs · Science · General Knowledge

### Card schema (normalized at load)

Each card supports:

| Field | Purpose |
|--------|---------|
| `domain` | Broad learning area (chip filters) |
| `format` | Story, Explainer, Timeline, Compare, Map, Institution |
| `hook` | Feed headline |
| `scene` | Short setup (“The setup”) |
| `coreFact` / `factBullets` | Main teaching content |
| `whyItMatters` | Present-day relevance |
| `rabbitHole` | Optional curiosity prompt |
| `sources` | Optional array (reserved; not rendered yet) |

Legacy fields (`story`, `relevance`, `category`) remain for backward compatibility with older saved payloads.

### Intentionally not in v0.2

- Live **AI-generated feed**
- **Backend** or CMS
- **Login** / accounts / sync
- Automated **video generation**
- Full structured **learning paths** with progress tracking

### Next step

**AI Content Studio** — an internal workflow to generate **draft** learning cards (domain, format, hooks, facts, sources) for human review before they enter the hardcoded catalog.

---

## Scripts

- `npm run dev` — local development with HMR
- `npm run build` — production build
- `npm run preview` — serve the production build locally
- `npm run lint` — Oxlint

## Testing

**PWA behavior** (web app manifest, service worker, offline shell) is only wired for production builds. Test it with:

```bash
npm run build && npm run preview
```

Use DevTools → **Application** to inspect the manifest and service worker. `npm run dev` is fine for UI and feed flows, but not for PWA verification.

**Quick smoke test (any mode):** open the app, try **Feed** vs **Learning Zones**, filter by domain, open a story, use **Continue learning**, toggle **Saved**, reload to confirm `localStorage` persistence.
