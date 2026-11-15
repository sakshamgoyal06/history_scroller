# Database (Supabase)

Schema v1 for BUILD_PLAN M0.2 (PRD §11.2, NFR-03). Stack decided in D-STACK (2026-11-15): Supabase Postgres + Auth.

## Files
- `supabase/migrations/*.sql`: schema, constraints and row-level security. Never edit a migration that has run
  on a real database; add a new one.
- `supabase/seed.sql`: generated from the content bundled in the app by `npm run db:seed:build`
  (`scripts/seedSql.js`). A test fails if it is out of date.
- `test/dbSchema.test.js`: runs the migrations and seed in an in-memory Postgres (PGlite) with a small stand-in
  for Supabase's `auth` schema, then checks constraints and that user A cannot read or change user B's rows.

## Rules the schema enforces
- **Sourced or not published** (PRD §5, §10.3a): a `content_items` row cannot be `published` with an empty
  `sources` array. Catalog cards and reel posts have no per-item sources yet, so the seed loads them as `review`.
- **Learning Zone** (FR-UPSC-09, D-12): a published chapter needs a summary and 8–20 cards. Subjects and chapters
  carry no book or publisher names.
- **Content is read-only to users.** Anyone can read published content; only the service role (Studio, seed) writes.
- **Private rows** (saves, events, revision state, chapter progress, paths, lessons, profile) are visible and
  editable only by their owner. Users can edit their profile preferences but not `plan`.
- A profile row is created for every new account by a trigger on `auth.users`.

## Live project
- Supabase project `curiosity` (ref `ijjtwurgkmxwwakkvfep`, Mumbai `ap-south-1`), created 2026-11-15 in the owner's
  org. API URL: `https://ijjtwurgkmxwwakkvfep.supabase.co`.
- Both migrations applied. Seeded so far: Learning Zone subjects, chapters and the cited chapter decks (the only
  rows that publish). Catalog cards, reel posts and the UPSC sample edition (all `review`) load with the full seed.
- Supabase security advisor: no findings after the second migration. Checked as `anon`: sees only published
  content and chapters, no access to saves; users can't write content or change `plan`.

## Setting up a project
1. Create a Supabase project (region: Mumbai, `ap-south-1`, for Indian users).
2. `npx supabase link --project-ref <ref>` then `npm run db:migrate` (applies the migrations).
3. Load content: `npx supabase db reset --linked` on a fresh project, or run `supabase/seed.sql` in the SQL editor.
4. Put the project URL and anon key in Vercel as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (public by design;
   RLS protects the data). The service-role key is server-only and never goes in a `VITE_*` variable.
