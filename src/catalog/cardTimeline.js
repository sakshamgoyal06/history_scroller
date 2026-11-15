/**
 * Canonical anchor years for catalog cards (event, discovery, or formalization).
 * BCE years are negative; CE years are positive.
 */
export const CARD_YEAR_BY_ID = {
  alexandria: -280,
  'roman-concrete': 120,
  'silk-road': -200,
  'black-death': 1348,
  'magna-carta': 1215,
  'gothic-cathedral': 1240,
  'printing-press': 1450,
  'constantinople-1453': 1453,
  'da-vinci-notebooks': 1505,
  'scientific-revolution': 1687,
  'enlightenment-salons': 1750,
  'haitian-revolution': 1791,
  'industrial-mills': 1840,
  'ww1-telegraph': 1914,
  'berlin-wall': 1961,
  'germ-theory': 1861,
  'ada-lovelace': 1843,
  'green-revolution': 1965,
  'jazz-migration': 1920,
  'un-declaration': 1948,
  'opportunity-cost': 1912,
  'inflation-basket': 1921,
  'comparative-advantage': 1817,
  'money-multiplier': 1929,
  'rain-shadow': 1850,
  'plate-boundaries': 1965,
  'monsoon-pattern': 1686,
  'exclusive-economic-zone': 1982,
  'separation-of-powers': 1748,
  'jury-system': 1215,
  'census-count': 1790,
  'public-records-laws': 1966,
  'how-wifi-works': 1997,
  'qr-code-basics': 1994,
  'gps-satellite-timing': 1978,
  'encryption-at-rest': 2001,
  'supply-chain-safety-stock': 1970,
  'renewable-intermittency': 2010,
  'misinformation-correction': 2016,
  'photosynthesis-equation': 1779,
  'herd-immunity-threshold': 1923,
  'crispr-gene-edit': 2012,
  'metric-prefixes': 1795,
  'leap-year-rule': 1582,
  'time-zones-offset': 1884,
  'rbi-monetary-policy-narrative': 2016,
}

/** @param {number} year */
export function decadeStartFromYear(year) {
  const y = Number(year)
  if (!Number.isFinite(y) || y === 0) return 0
  if (y < 0) {
    const abs = Math.abs(y)
    const startAbs = Math.floor(abs / 10) * 10
    return -startAbs
  }
  return Math.floor(y / 10) * 10
}

/** @param {number} decadeStart */
export function decadeKeyFromStart(decadeStart) {
  const d = Number(decadeStart)
  if (d < 0) return `bce-${Math.abs(d)}`
  return `ce-${d}`
}

/** @param {string} key */
export function formatDecadeKeyLabel(key) {
  if (key.startsWith('bce-')) {
    return `${key.slice(4)}s BCE`
  }
  if (key.startsWith('ce-')) {
    return `${key.slice(3)}s`
  }
  return key
}

/** @param {number} year */
/** Sort decade keys oldest → newest */
export function compareDecadeKeys(a, b) {
  const parse = (key) => {
    if (key.startsWith('bce-')) return -Number(key.slice(4))
    if (key.startsWith('ce-')) return Number(key.slice(3))
    return 0
  }
  return parse(a) - parse(b)
}

/**
 * @param {Record<string, unknown>} card
 * @returns {{ year: number, decadeStart: number, decadeKey: string, decadeLabel: string } | null}
 */
export function timelineFieldsForCard(card) {
  const raw =
    typeof card.year === 'number'
      ? card.year
      : CARD_YEAR_BY_ID[card.id]
  if (typeof raw !== 'number' || !Number.isFinite(raw)) return null
  const decadeStart = decadeStartFromYear(raw)
  const decadeKey = decadeKeyFromStart(decadeStart)
  return {
    year: raw,
    decadeStart,
    decadeKey,
    decadeLabel: formatDecadeKeyLabel(decadeKey),
  }
}

/** @param {Array<{ decadeKey?: string }>} cards */
export function uniqueDecadeKeysFromCards(cards) {
  const keys = new Set()
  for (const card of cards) {
    if (card.decadeKey) keys.add(card.decadeKey)
  }
  return [...keys].sort(compareDecadeKeys)
}

/** Position on 0–100 scale for timeline UI (log-ish stretch for ancient → modern) */
export function decadeTimelinePercent(decadeKey) {
  const parse = (key) => {
    if (key.startsWith('bce-')) return -Number(key.slice(4))
    if (key.startsWith('ce-')) return Number(key.slice(3))
    return 0
  }
  const value = parse(decadeKey)
  const min = -300
  const max = 2020
  const clamped = Math.min(max, Math.max(min, value))
  return ((clamped - min) / (max - min)) * 100
}
