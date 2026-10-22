/** @typedef {object} ZoneStep
 * @property {string} id
 * @property {number} order
 * @property {string} cardId
 * @property {string} [feedItemId]
 * @property {string} title
 * @property {string} objective
 */

/** @typedef {object} LearningZone
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} outcome
 * @property {number} estimatedMinutes
 * @property {string} domain
 * @property {ZoneStep[]} steps
 */

/** @type {LearningZone[]} */
export const LEARNING_ZONES = [
  {
    id: 'indian-economy-basics',
    title: 'Indian Economy Basics',
    description:
      'Prices, trade, farming revolutions, and credit—entry points tied to how India’s economy shows up in the catalog today.',
    outcome: 'Connect RBI policy, inflation, trade, and supply chains to everyday economic headlines.',
    estimatedMinutes: 35,
    domain: 'Economics',
    steps: [
      { id: 'ieb-1', order: 1, cardId: 'rbi-monetary-policy-narrative', feedItemId: 'feed-card-rbi-monetary-policy-narrative', title: 'How RBI frames inflation', objective: 'Read the inflation target band in plain language.' },
      { id: 'ieb-2', order: 2, cardId: 'green-revolution', feedItemId: 'feed-card-green-revolution', title: 'Green Revolution legacies', objective: 'See yield gains alongside water and soil tradeoffs.' },
      { id: 'ieb-3', order: 3, cardId: 'inflation-basket', feedItemId: 'feed-card-inflation-basket', title: 'What the CPI basket captures', objective: 'Link household budgets to index design.' },
      { id: 'ieb-4', order: 4, cardId: 'opportunity-cost', feedItemId: 'feed-card-opportunity-cost', title: 'Opportunity cost refresher', objective: 'Apply trade-offs to policy choices.' },
      { id: 'ieb-5', order: 5, cardId: 'comparative-advantage', feedItemId: 'feed-proto-comparative-advantage', title: 'Comparative advantage', objective: 'Explain why nations specialize.' },
      { id: 'ieb-6', order: 6, cardId: 'money-multiplier', feedItemId: 'feed-proto-money-multiplier', title: 'Money multiplier chain', objective: 'Follow deposits through the banking system.' },
      { id: 'ieb-7', order: 7, cardId: 'supply-chain-safety-stock', feedItemId: 'feed-card-supply-chain-safety-stock', title: 'Safety stock in supply chains', objective: 'Connect buffers to shortages you have seen.' },
    ],
  },
  {
    id: 'roman-empire',
    title: 'Roman Empire',
    description:
      'Engineering, cities, and frontiers—stories from Rome’s world and its long afterlife in memory.',
    outcome: 'Trace how Roman infrastructure and memory shaped later empires and cities.',
    estimatedMinutes: 28,
    domain: 'History',
    steps: [
      { id: 're-1', order: 1, cardId: 'roman-concrete', feedItemId: 'feed-proto-roman-concrete', title: 'Concrete that outlasted empire', objective: 'Compare Roman mixes to modern cement.' },
      { id: 're-2', order: 2, cardId: 'alexandria', feedItemId: 'feed-card-alexandria', title: 'Library of Alexandria', objective: 'Separate myth from institutional history.' },
      { id: 're-3', order: 3, cardId: 'constantinople-1453', feedItemId: 'feed-card-constantinople-1453', title: 'Fall of Constantinople', objective: 'Place 1453 in Mediterranean power shifts.' },
      { id: 're-4', order: 4, cardId: 'silk-road', feedItemId: 'feed-card-silk-road', title: 'Silk Roads plural', objective: 'Map routes beyond a single caravan trail.' },
      { id: 're-5', order: 5, cardId: 'gothic-cathedral', feedItemId: 'feed-card-gothic-cathedral', title: 'Cathedrals as public works', objective: 'See medieval infrastructure financing.' },
    ],
  },
  {
    id: 'how-governments-work',
    title: 'How Governments Work',
    description:
      'Institutions, rights language, courts, and counting citizens—how modern states organize power on paper and in practice.',
    outcome: 'Follow how separation of powers, courts, and records shape accountability.',
    estimatedMinutes: 30,
    domain: 'Civics',
    steps: [
      { id: 'hgw-1', order: 1, cardId: 'separation-of-powers', feedItemId: 'feed-card-separation-of-powers', title: 'Separation of powers', objective: 'Identify checks between branches.' },
      { id: 'hgw-2', order: 2, cardId: 'jury-system', feedItemId: 'feed-card-jury-system', title: 'Jury trials', objective: 'Contrast jury role with judge-led systems.' },
      { id: 'hgw-3', order: 3, cardId: 'census-count', feedItemId: 'feed-card-census-count', title: 'Census mechanics', objective: 'See how counts drive representation.' },
      { id: 'hgw-4', order: 4, cardId: 'public-records-laws', feedItemId: 'feed-card-public-records-laws', title: 'Public records access', objective: 'Link transparency laws to reporting.' },
      { id: 'hgw-5', order: 5, cardId: 'un-declaration', feedItemId: 'feed-card-un-declaration', title: 'UN Declaration language', objective: 'Place 1948 rights text in context.' },
      { id: 'hgw-6', order: 6, cardId: 'magna-carta', feedItemId: 'feed-card-magna-carta', title: 'Magna Carta myths', objective: 'Separate medieval treaty from modern symbol.' },
    ],
  },
  {
    id: 'world-geography-essentials',
    title: 'World Geography Essentials',
    description:
      'Climate patterns, plates, oceans, and routes—physical and political geography in bite-sized stories.',
    outcome: 'Read maps and headlines with plate, climate, and ocean-zone context.',
    estimatedMinutes: 26,
    domain: 'Geography',
    steps: [
      { id: 'wge-1', order: 1, cardId: 'rain-shadow', feedItemId: 'feed-card-rain-shadow', title: 'Rain shadows', objective: 'Predict wet and dry sides of ranges.' },
      { id: 'wge-2', order: 2, cardId: 'plate-boundaries', feedItemId: 'feed-proto-plate-boundaries', title: 'Plate boundaries', objective: 'Match boundary types to hazards.' },
      { id: 'wge-3', order: 3, cardId: 'monsoon-pattern', feedItemId: 'feed-proto-monsoon', title: 'Monsoon engine', objective: 'Connect winds to planting seasons.' },
      { id: 'wge-4', order: 4, cardId: 'exclusive-economic-zone', feedItemId: 'feed-card-exclusive-economic-zone', title: 'Exclusive economic zones', objective: 'See where coastal rights begin.' },
      { id: 'wge-5', order: 5, cardId: 'silk-road', feedItemId: 'feed-card-silk-road', title: 'Routes across Afro-Eurasia', objective: 'Compare land and sea corridors.' },
    ],
  },
  {
    id: 'technology-basics',
    title: 'Technology Basics',
    description:
      'Networks, codes, clocks in orbit, and encryption—how everyday tech actually works under the hood.',
    outcome: 'Explain Wi‑Fi, QR codes, GPS timing, and encryption in plain language.',
    estimatedMinutes: 32,
    domain: 'Technology',
    steps: [
      { id: 'tb-1', order: 1, cardId: 'how-wifi-works', feedItemId: 'feed-proto-wifi', title: 'How Wi‑Fi shares airtime', objective: 'Diagnose congestion vs backhaul issues.' },
      { id: 'tb-2', order: 2, cardId: 'qr-code-basics', feedItemId: 'feed-card-qr-code-basics', title: 'QR code structure', objective: 'See error correction in action.' },
      { id: 'tb-3', order: 3, cardId: 'gps-satellite-timing', feedItemId: 'feed-card-gps-satellite-timing', title: 'GPS needs atomic clocks', objective: 'Link timing to location fixes.' },
      { id: 'tb-4', order: 4, cardId: 'encryption-at-rest', feedItemId: 'feed-card-encryption-at-rest', title: 'Encryption at rest', objective: 'Separate keys from ciphertext.' },
      { id: 'tb-5', order: 5, cardId: 'ada-lovelace', feedItemId: 'feed-card-ada-lovelace', title: 'Ada Lovelace’s insight', objective: 'Connect notes to modern programs.' },
      { id: 'tb-6', order: 6, cardId: 'printing-press', feedItemId: 'feed-proto-printing-press', title: 'Printing press ripple', objective: 'Track info speed before the internet.' },
    ],
  },
]

export function getZoneById(zoneId) {
  return LEARNING_ZONES.find((z) => z.id === zoneId) ?? null
}
