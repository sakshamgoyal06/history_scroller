// Writes supabase/seed.sql from the app's bundled content. `supabase db reset` applies it after the migrations.
import { writeFileSync } from 'node:fs'
import { buildSeedSql } from './seedSql.js'

const { sql, counts } = buildSeedSql()
writeFileSync(new URL('../supabase/seed.sql', import.meta.url), sql)
console.log('supabase/seed.sql written:', counts)
