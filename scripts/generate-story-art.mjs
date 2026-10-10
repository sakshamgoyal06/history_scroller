import { createHash } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ids = [
  'alexandria',
  'roman-concrete',
  'silk-road',
  'black-death',
  'magna-carta',
  'gothic-cathedral',
  'printing-press',
  'constantinople-1453',
  'da-vinci-notebooks',
  'scientific-revolution',
  'enlightenment-salons',
  'haitian-revolution',
  'industrial-mills',
  'ww1-telegraph',
  'berlin-wall',
  'germ-theory',
  'ada-lovelace',
  'green-revolution',
  'jazz-migration',
  'un-declaration',
]

const outDir = join(process.cwd(), 'public', 'stories')
mkdirSync(outDir, { recursive: true })

function hash(id) {
  return createHash('sha256').update(id).digest()
}

for (const id of ids) {
  const h = hash(id)
  const a = (h[0] % 40) + 20
  const b = (h[1] % 50) + 30
  const c = (h[2] % 60) + 140
  const d = (h[3] % 30) + 10
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" role="img" aria-hidden="true">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f7f5f1"/>
      <stop offset="100%" stop-color="#efe8df"/>
    </linearGradient>
    <linearGradient id="glow" x1="0.5" y1="0" x2="0.5" y2="1">
      <stop offset="0%" stop-color="#c17f59" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#c17f59" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="800" height="450" fill="url(#bg)"/>
  <circle cx="${120 + d}" cy="${90 + a}" r="${80 + (h[4] % 40)}" fill="#c17f59" opacity="0.12"/>
  <circle cx="${620 - d}" cy="${320 - b}" r="${100 + (h[5] % 30)}" fill="#a56845" opacity="0.1"/>
  <path d="M ${80 + a} ${380 - c} Q ${400} ${120 + b} ${720 - a} ${360 - d}" fill="none" stroke="#c17f59" stroke-width="2" opacity="0.2"/>
  <rect x="${180 + b}" y="${140 + d}" width="${220 + (h[6] % 60)}" height="${140 + (h[7] % 40)}" rx="24" fill="#2c2825" opacity="0.06"/>
  <rect x="${420 + d}" y="${200 + a}" width="${160 + (h[8] % 50)}" height="${100 + (h[9] % 30)}" rx="18" fill="#c17f59" opacity="0.14"/>
  <rect width="800" height="450" fill="url(#glow)" opacity="0.55"/>
</svg>
`
  writeFileSync(join(outDir, `${id}.svg`), svg)
}

console.log(`Wrote ${ids.length} story art files to public/stories/`)
