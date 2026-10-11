# Curiosity Feed

A calm mobile PWA for general learning, one story at a time (React + Vite).

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

**Quick smoke test (any mode):** open the app, filter categories, toggle Saved, open a story, Save / “I knew this”, go Back, reload to confirm `localStorage` persistence.
