import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { PGlite } from '@electric-sql/pglite'
import { beforeAll, describe, expect, it } from 'vitest'
import { buildSeedSql } from '../scripts/seedSql.js'

/**
 * Runs the Supabase migrations in an in-memory Postgres (PGlite) with a minimal stand-in for Supabase's
 * `auth` schema and roles, then checks constraints and row-level security (BUILD_PLAN M0.2, NFR-03).
 */
const MIGRATIONS = join(import.meta.dirname, '..', 'supabase', 'migrations')

const SUPABASE_SHIM = `
  create role anon nologin;
  create role authenticated nologin;
  create schema auth;
  create table auth.users (id uuid primary key);
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema auth to anon, authenticated;
  grant execute on function auth.uid() to anon, authenticated;
  -- Like Supabase: new tables in public are fully granted to anon and authenticated by default.
  alter default privileges in schema public grant all on tables to anon, authenticated;
`

const A = '00000000-0000-0000-0000-00000000000a'
const B = '00000000-0000-0000-0000-00000000000b'

let db

/** Runs `fn` as a signed-in user (or anon when id is null), then returns to the superuser. */
async function as(id, fn) {
  await db.exec(id ? `set role authenticated; set request.jwt.claim.sub = '${id}';` : `set role anon; set request.jwt.claim.sub = '';`)
  try {
    return await fn()
  } finally {
    await db.exec('reset role; reset request.jwt.claim.sub;')
  }
}

beforeAll(async () => {
  db = new PGlite()
  await db.exec(SUPABASE_SHIM)
  for (const file of readdirSync(MIGRATIONS).filter((f) => f.endsWith('.sql')).sort()) {
    await db.exec(readFileSync(join(MIGRATIONS, file), 'utf8'))
  }
  await db.exec(`insert into auth.users (id) values ('${A}'), ('${B}')`)
}, 30_000)

describe('schema v1 (M0.2)', () => {
  it('creates a profile for every new account', async () => {
    const { rows } = await db.query('select id, mode, plan from public.profiles order by id')
    expect(rows).toEqual([
      { id: A, mode: 'curious', plan: 'free' },
      { id: B, mode: 'curious', plan: 'free' },
    ])
  })

  it('refuses to publish content without a source (PRD §5, §10.3a)', async () => {
    await expect(
      db.query(`insert into public.content_items (id, type, body, status, published_at) values ('x', 'card', '{}', 'published', now())`),
    ).rejects.toThrow(/published_needs_sources/)
    await db.query(
      `insert into public.content_items (id, type, body, sources, status, published_at)
       values ('ok', 'ca_post', '{}', '[{"publisher":"PIB","title":"t"}]', 'published', now()), ('wip', 'card', '{}', '[]', 'draft', null)`,
    )
  })

  it('refuses a published chapter with fewer than 8 cards (FR-UPSC-09)', async () => {
    await db.query(`insert into public.subjects (id, name, gs) values ('polity', 'Polity', 'GS2')`)
    await expect(
      db.query(`insert into public.chapters (id, subject_id, title, summary, card_ids, status) values ('c', 'polity', 'C', 's', '{a,b}', 'published')`),
    ).rejects.toThrow(/published_chapter_complete/)
  })

  it('shows only published content to anyone', async () => {
    const rows = await as(null, async () => (await db.query('select id from public.content_items')).rows)
    expect(rows.map((r) => r.id)).toEqual(['ok'])
  })

  it('does not let users write content', async () => {
    await expect(
      as(A, () => db.query(`insert into public.content_items (id, type, body) values ('y', 'card', '{}')`)),
    ).rejects.toThrow(/permission denied/)
  })
})

describe('row-level security: user A cannot see or change user B (NFR-03)', () => {
  beforeAll(async () => {
    await as(A, () => db.query(`insert into public.saved_items (user_id, item_id) values ($1, 'ok')`, [A]))
    await as(B, () => db.query(`insert into public.saved_items (user_id, item_id) values ($1, 'wip')`, [B]))
    await as(A, () =>
      db.query(`insert into public.recall_state (user_id, recall_key, due) values ($1, 'polity-governor#0', '2026-11-16')`, [A]),
    )
  })

  it('each user reads only their own saves, profile and revision state', async () => {
    const saved = await as(A, async () => (await db.query('select user_id, item_id from public.saved_items')).rows)
    expect(saved).toEqual([{ user_id: A, item_id: 'ok' }])
    const profiles = await as(B, async () => (await db.query('select id from public.profiles')).rows)
    expect(profiles).toEqual([{ id: B }])
    const recall = await as(B, async () => (await db.query('select * from public.recall_state')).rows)
    expect(recall).toEqual([])
  })

  it('a user cannot insert rows for someone else', async () => {
    await expect(
      as(A, () => db.query(`insert into public.saved_items (user_id, item_id) values ($1, 'ok')`, [B])),
    ).rejects.toThrow(/row-level security/)
  })

  it("updates and deletes on someone else's rows touch nothing", async () => {
    const res = await as(A, () => db.query(`delete from public.saved_items where user_id = $1`, [B]))
    expect(res.affectedRows).toBe(0)
    const upd = await as(A, () => db.query(`update public.profiles set mode = 'upsc' where id = $1`, [B]))
    expect(upd.affectedRows).toBe(0)
  })

  it('users can change their own preferences but not their plan', async () => {
    const ok = await as(A, () => db.query(`update public.profiles set mode = 'upsc', exam = 'UPSC CSE' where id = $1`, [A]))
    expect(ok.affectedRows).toBe(1)
    await expect(as(A, () => db.query(`update public.profiles set plan = 'plus' where id = $1`, [A]))).rejects.toThrow(
      /permission denied/,
    )
  })

  it('signed-out visitors see no private rows', async () => {
    await expect(as(null, () => db.query('select * from public.saved_items'))).rejects.toThrow(/permission denied/)
  })
})

describe('seed (M0.2)', () => {
  it('supabase/seed.sql is up to date with the bundled content (run `npm run db:seed:build`)', () => {
    const onDisk = readFileSync(join(MIGRATIONS, '..', 'seed.sql'), 'utf8')
    expect(onDisk).toBe(buildSeedSql().sql)
  })

  it('applies cleanly and publishes only sourced content', async () => {
    await db.exec(buildSeedSql().sql)
    const { rows } = await db.query(
      `select count(*)::int as n from public.content_items where status = 'published' and jsonb_array_length(sources) = 0`,
    )
    expect(rows[0].n).toBe(0)
    const chapters = await as(null, async () => (await db.query('select id from public.chapters order by id')).rows)
    expect(chapters.map((c) => c.id)).toContain('polity-governor')
  })

  it('can be applied twice without errors', async () => {
    await db.exec(buildSeedSql().sql)
  })
})
