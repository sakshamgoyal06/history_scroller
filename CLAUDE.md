# Curiosity Feed: notes for Claude

## Source-of-truth docs (read before planning work)
- `docs/PRD.md`: vision, personas, MVP scope, requirements (stable IDs like `FR-FEED-03`, `NFR-04`, `M-02`),
  GTM, metrics, roadmap, decision log. When work implements or changes a requirement, cite its ID in the
  commit/PR and update the PRD (including its changelog) in the same PR.
- `docs/ENGINEERING_REVIEW.md`: current technical state, open findings, and engineering P0/P1/P2.

## Working rules
- Run `npm run check` (lint with warnings as errors, Vitest, build) before pushing; CI runs the same.
- New logic comes with tests (`*.test.js` next to the code; `test/setup.js` provides a localStorage shim).
- Never put secrets in client code; `VITE_*` env vars are public.
- Bump storage/schema versions only together with a migration and a test.
- Content must stay sourced: no fabricated URLs, quotes or video IDs (PRD §5, §10).
