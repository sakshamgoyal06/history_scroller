import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

/** Topic-specific silhouettes — muted palette, low visual weight */
const THEME_ART = {
  alexandria: `
    <path d="M120 320 L200 180 L280 320 Z" fill="#c17f59" opacity="0.18"/>
    <rect x="185" y="200" width="30" height="120" fill="#2c2825" opacity="0.08"/>
    <ellipse cx="400" cy="290" rx="120" ry="28" fill="#a56845" opacity="0.12"/>
    <path d="M340 290 Q400 250 460 290" fill="none" stroke="#c17f59" stroke-width="3" opacity="0.25"/>
    <rect x="520" y="240" width="18" height="80" rx="2" fill="#c17f59" opacity="0.2"/>
    <rect x="545" y="255" width="18" height="65" rx="2" fill="#c17f59" opacity="0.16"/>
    <rect x="570" y="270" width="18" height="50" rx="2" fill="#c17f59" opacity="0.14"/>
  `,
  'roman-concrete': `
    <path d="M250 310 A150 150 0 0 1 550 310 L550 340 L250 340 Z" fill="#c17f59" opacity="0.2"/>
    <ellipse cx="400" cy="310" rx="150" ry="40" fill="none" stroke="#a56845" stroke-width="2" opacity="0.3"/>
    <circle cx="400" cy="200" r="55" fill="none" stroke="#2c2825" stroke-width="2" opacity="0.12"/>
    <rect x="385" y="200" width="30" height="110" fill="#2c2825" opacity="0.06"/>
  `,
  'silk-road': `
    <path d="M80 300 Q200 220 320 280 T560 260 T720 300" fill="none" stroke="#c17f59" stroke-width="3" opacity="0.28"/>
    <path d="M180 300 L200 270 L220 300 Z" fill="#a56845" opacity="0.22"/>
    <circle cx="360" cy="275" r="14" fill="#c17f59" opacity="0.2"/>
    <path d="M500 285 L530 265 L560 285 L530 305 Z" fill="#c17f59" opacity="0.16"/>
    <path d="M620 295 Q640 270 660 295" fill="none" stroke="#a56845" stroke-width="2" opacity="0.25"/>
  `,
  'black-death': `
    <circle cx="400" cy="230" r="90" fill="none" stroke="#a56845" stroke-width="2" opacity="0.2"/>
    <path d="M400 140 L400 320 M340 200 L460 260 M460 200 L340 260" stroke="#c17f59" stroke-width="2" opacity="0.18"/>
    <path d="M150 320 Q250 260 350 320" fill="none" stroke="#2c2825" stroke-width="2" opacity="0.1"/>
    <circle cx="580" cy="280" r="8" fill="#c17f59" opacity="0.25"/>
    <circle cx="610" cy="300" r="6" fill="#c17f59" opacity="0.2"/>
    <circle cx="640" cy="285" r="7" fill="#c17f59" opacity="0.22"/>
  `,
  'magna-carta': `
    <rect x="280" y="160" width="240" height="180" rx="8" fill="#fffcf8" stroke="#c17f59" stroke-width="2" opacity="0.35"/>
    <path d="M310 200 H490 M310 230 H460 M310 260 H480 M310 290 H420" stroke="#a56845" stroke-width="2" opacity="0.22"/>
    <circle cx="400" cy="320" r="28" fill="none" stroke="#c17f59" stroke-width="2" opacity="0.3"/>
    <path d="M385 320 L395 330 L420 305" fill="none" stroke="#c17f59" stroke-width="2" opacity="0.35"/>
  `,
  'gothic-cathedral': `
    <path d="M320 320 L400 120 L480 320 Z" fill="#c17f59" opacity="0.15"/>
    <path d="M350 320 L400 160 L450 320" fill="none" stroke="#a56845" stroke-width="2" opacity="0.28"/>
    <circle cx="400" cy="200" r="45" fill="none" stroke="#c17f59" stroke-width="2" opacity="0.22"/>
    <path d="M260 320 H540" stroke="#2c2825" stroke-width="3" opacity="0.08"/>
    <path d="M230 320 L250 260 L270 320 M530 320 L550 260 L570 320" fill="#c17f59" opacity="0.12"/>
  `,
  'printing-press': `
    <rect x="320" y="140" width="160" height="200" rx="6" fill="#2c2825" opacity="0.07"/>
    <rect x="340" y="160" width="120" height="80" fill="#c17f59" opacity="0.18"/>
    <rect x="360" y="260" width="80" height="60" fill="#a56845" opacity="0.15"/>
    <text x="355" y="210" font-family="Georgia,serif" font-size="42" fill="#c17f59" opacity="0.35">Aa</text>
    <rect x="520" y="280" width="40" height="8" fill="#c17f59" opacity="0.2"/>
    <rect x="520" y="295" width="40" height="8" fill="#c17f59" opacity="0.16"/>
  `,
  'constantinople-1453': `
    <path d="M180 320 H620" stroke="#2c2825" stroke-width="4" opacity="0.1"/>
    <rect x="220" y="220" width="360" height="100" fill="#c17f59" opacity="0.12"/>
    <path d="M220 220 L400 140 L580 220" fill="#a56845" opacity="0.14"/>
    <circle cx="400" cy="175" r="20" fill="none" stroke="#c17f59" stroke-width="2" opacity="0.25"/>
    <path d="M640 250 L680 230 L720 250 L680 270 Z" fill="#2c2825" opacity="0.1"/>
  `,
  'da-vinci-notebooks': `
    <circle cx="400" cy="240" r="100" fill="none" stroke="#c17f59" stroke-width="2" opacity="0.22"/>
    <rect x="340" y="180" width="120" height="120" fill="none" stroke="#a56845" stroke-width="2" opacity="0.2"/>
    <path d="M400 180 L400 300 M340 240 L460 240" stroke="#2c2825" stroke-width="1" opacity="0.12"/>
    <path d="M520 200 L560 220 L540 260 L500 240 Z" fill="#c17f59" opacity="0.15"/>
    <path d="M250 280 L290 260 L310 300 L270 320 Z" fill="none" stroke="#c17f59" stroke-width="2" opacity="0.2"/>
  `,
  'scientific-revolution': `
    <path d="M280 280 L360 160 L380 280 Z" fill="#c17f59" opacity="0.16"/>
    <rect x="355" y="160" width="10" height="130" fill="#a56845" opacity="0.2"/>
    <ellipse cx="520" cy="240" rx="70" ry="70" fill="none" stroke="#c17f59" stroke-width="2" opacity="0.22"/>
    <circle cx="520" cy="240" r="12" fill="#a56845" opacity="0.25"/>
    <path d="M520 240 L580 200" stroke="#c17f59" stroke-width="2" opacity="0.2"/>
  `,
  'enlightenment-salons': `
    <ellipse cx="400" cy="280" rx="160" ry="50" fill="#c17f59" opacity="0.1"/>
    <circle cx="320" cy="250" r="22" fill="#a56845" opacity="0.18"/>
    <circle cx="400" cy="235" r="22" fill="#c17f59" opacity="0.2"/>
    <circle cx="480" cy="250" r="22" fill="#a56845" opacity="0.18"/>
    <rect x="370" y="200" width="60" height="8" rx="4" fill="#2c2825" opacity="0.08"/>
    <path d="M350 180 Q400 150 450 180" fill="none" stroke="#c17f59" stroke-width="2" opacity="0.2"/>
  `,
  'haitian-revolution': `
    <path d="M400 320 L400 140" stroke="#2c2825" stroke-width="3" opacity="0.08"/>
    <path d="M400 160 L430 220 L400 280 L370 220 Z" fill="#c17f59" opacity="0.22"/>
    <circle cx="400" cy="150" r="18" fill="none" stroke="#a56845" stroke-width="2" opacity="0.3"/>
    <path d="M200 300 Q300 240 400 280 T600 260" fill="none" stroke="#c17f59" stroke-width="2" opacity="0.18"/>
  `,
  'industrial-mills': `
    <rect x="300" y="180" width="200" height="140" fill="#2c2825" opacity="0.07"/>
    <rect x="380" y="120" width="40" height="60" fill="#a56845" opacity="0.15"/>
    <circle cx="400" cy="250" r="35" fill="none" stroke="#c17f59" stroke-width="3" opacity="0.25"/>
    <path d="M400 215 L400 285 M365 250 L435 250" stroke="#c17f59" stroke-width="2" opacity="0.2"/>
    <path d="M520 200 Q540 160 560 200" fill="none" stroke="#2c2825" stroke-width="2" opacity="0.12"/>
  `,
  'ww1-telegraph': `
    <path d="M120 300 H680" stroke="#a56845" stroke-width="2" opacity="0.15"/>
    <path d="M200 300 L220 260 L240 300 Z" fill="#c17f59" opacity="0.12"/>
    <path d="M400 300 L420 250 L440 300 Z" fill="#c17f59" opacity="0.14"/>
    <path d="M560 300 L580 255 L600 300 Z" fill="#c17f59" opacity="0.12"/>
    <path d="M640 180 L640 280 M620 200 L660 200" stroke="#2c2825" stroke-width="2" opacity="0.15"/>
    <path d="M620 180 Q640 160 660 180" fill="none" stroke="#c17f59" stroke-width="2" opacity="0.22"/>
  `,
  'berlin-wall': `
    <rect x="360" y="160" width="80" height="160" fill="#2c2825" opacity="0.12"/>
    <path d="M360 200 H440 M360 240 H440 M360 280 H440" stroke="#fffcf8" stroke-width="2" opacity="0.15"/>
    <path d="M300 320 Q400 280 500 320" fill="none" stroke="#c17f59" stroke-width="3" opacity="0.25"/>
    <circle cx="280" cy="260" r="25" fill="#c17f59" opacity="0.1"/>
    <circle cx="520" cy="250" r="25" fill="#a56845" opacity="0.1"/>
  `,
  'germ-theory': `
    <path d="M480 180 L520 280 L440 280 Z" fill="none" stroke="#c17f59" stroke-width="2" opacity="0.25"/>
    <rect x="455" y="280" width="50" height="40" fill="#a56845" opacity="0.15"/>
    <circle cx="320" cy="250" r="40" fill="#c17f59" opacity="0.12"/>
    <circle cx="350" cy="230" r="15" fill="#a56845" opacity="0.18"/>
    <circle cx="300" cy="270" r="12" fill="#a56845" opacity="0.16"/>
    <path d="M250 300 H380" stroke="#2c2825" stroke-width="2" opacity="0.08"/>
  `,
  'ada-lovelace': `
    <rect x="280" y="200" width="80" height="100" rx="4" fill="#c17f59" opacity="0.14"/>
    <rect x="300" y="220" width="40" height="8" fill="#a56845" opacity="0.25"/>
    <rect x="300" y="240" width="40" height="8" fill="#a56845" opacity="0.2"/>
    <circle cx="480" cy="250" r="55" fill="none" stroke="#c17f59" stroke-width="2" opacity="0.22"/>
    <path d="M480 195 L480 305 M425 250 L535 250" stroke="#c17f59" stroke-width="2" opacity="0.18"/>
    <rect x="520" y="210" width="60" height="80" fill="#2c2825" opacity="0.06"/>
  `,
  'green-revolution': `
    <path d="M350 320 Q370 200 390 320 M390 320 Q410 180 430 320 M430 320 Q450 210 470 320" fill="none" stroke="#a56845" stroke-width="3" opacity="0.28"/>
    <ellipse cx="400" cy="320" rx="120" ry="20" fill="#c17f59" opacity="0.12"/>
    <circle cx="540" cy="260" r="30" fill="#c17f59" opacity="0.15"/>
    <path d="M540 230 L540 290 M515 260 L565 260" stroke="#a56845" stroke-width="2" opacity="0.2"/>
  `,
  'jazz-migration': `
    <path d="M180 300 H620" stroke="#2c2825" stroke-width="3" opacity="0.08"/>
    <rect x="220" y="260" width="120" height="40" rx="8" fill="#c17f59" opacity="0.14"/>
    <circle cx="280" cy="250" r="12" fill="#a56845" opacity="0.2"/>
    <path d="M420 320 Q440 220 460 320 Q480 240 500 320 Q520 260 540 320" fill="none" stroke="#c17f59" stroke-width="4" opacity="0.3"/>
    <ellipse cx="540" cy="270" rx="25" ry="35" fill="#a56845" opacity="0.12"/>
  `,
  'un-declaration': `
    <rect x="260" y="170" width="280" height="170" rx="6" fill="#fffcf8" stroke="#c17f59" stroke-width="2" opacity="0.3"/>
    <path d="M290 210 H510 M290 240 H480 M290 270 H500 M290 300 H430" stroke="#a56845" stroke-width="2" opacity="0.2"/>
    <path d="M400 130 Q420 110 440 130 Q460 150 440 170 Q420 190 400 170 Q380 150 400 130" fill="#c17f59" opacity="0.18"/>
    <circle cx="580" cy="220" r="35" fill="none" stroke="#c17f59" stroke-width="2" opacity="0.2"/>
  `,
}

function boostVisibility(svgFragment) {
  return svgFragment.replace(/opacity="(0\.\d+)"/g, (_, value) => {
    const original = Number.parseFloat(value)
    let boosted = original * 2.6
    if (original <= 0.12) boosted = Math.max(boosted, 0.26)
    boosted = Math.min(boosted, 0.78)
    return `opacity="${boosted.toFixed(2)}"`
  })
}

function wrap(id, inner) {
  const uid = id.replace(/[^a-z0-9]/gi, '')
  const art = boostVisibility(inner)
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" role="img" aria-hidden="true">
  <defs>
    <linearGradient id="bg-${uid}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f7f5f1"/>
      <stop offset="100%" stop-color="#efe8df"/>
    </linearGradient>
    <linearGradient id="scrim-${uid}" x1="0.5" y1="0" x2="0.5" y2="1">
      <stop offset="0%" stop-color="#f7f5f1" stop-opacity="0"/>
      <stop offset="82%" stop-color="#f7f5f1" stop-opacity="0"/>
      <stop offset="100%" stop-color="#fffcf8" stop-opacity="0.26"/>
    </linearGradient>
  </defs>
  <rect width="800" height="450" fill="url(#bg-${uid})"/>
  <g>${art}</g>
  <rect width="800" height="450" fill="url(#scrim-${uid})"/>
</svg>
`
}

const GENERIC_LEARNING_ART = `
  <circle cx="400" cy="215" r="72" fill="none" stroke="#c17f59" stroke-width="2" opacity="0.22"/>
  <path d="M160 310 Q400 250 640 310" fill="none" stroke="#a56845" stroke-width="3" opacity="0.2"/>
  <rect x="340" y="170" width="120" height="90" rx="8" fill="#c17f59" opacity="0.12"/>
  <path d="M360 200 H480 M360 225 H450 M360 250 H470" stroke="#2c2825" stroke-width="2" opacity="0.1"/>
`

const ADDITIONAL_CARD_IDS = [
  'opportunity-cost',
  'inflation-basket',
  'comparative-advantage',
  'money-multiplier',
  'rain-shadow',
  'plate-boundaries',
  'monsoon-pattern',
  'exclusive-economic-zone',
  'separation-of-powers',
  'jury-system',
  'census-count',
  'public-records-laws',
  'how-wifi-works',
  'qr-code-basics',
  'gps-satellite-timing',
  'encryption-at-rest',
  'supply-chain-safety-stock',
  'renewable-intermittency',
  'misinformation-correction',
  'photosynthesis-equation',
  'herd-immunity-threshold',
  'crispr-gene-edit',
  'metric-prefixes',
  'leap-year-rule',
  'time-zones-offset',
]

const outDir = join(process.cwd(), 'public', 'stories')
mkdirSync(outDir, { recursive: true })

let written = 0
for (const [id, art] of Object.entries(THEME_ART)) {
  writeFileSync(join(outDir, `${id}.svg`), wrap(id, art))
  written += 1
}
for (const id of ADDITIONAL_CARD_IDS) {
  writeFileSync(join(outDir, `${id}.svg`), wrap(id, GENERIC_LEARNING_ART))
  written += 1
}

console.log(`Wrote ${written} story art files.`)
