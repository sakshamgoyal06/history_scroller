/**
 * UPSC Learning Zone (PRD v2.1 P9b, FR-UPSC-08..11, D-12): Subject → Chapter. Each chapter is distilled
 * into our own UPSC-format highlight cards that cite public sources. No book or publisher is named.
 *
 * Two SAMPLE chapters are fully written so the deck UI can be built before the Studio pipeline (M1.25).
 * Facts come from the cited public sources; no video IDs or URLs are invented (PRD §5): a chapter's
 * video slot stays empty until an editor picks a credited, embeddable video (FR-UPSC-10).
 */

/** @typedef {{ type: string, title: string, body: string, cite: string }} HighlightCard */
/**
 * @typedef {object} Chapter
 * @property {string} id
 * @property {string} title
 * @property {string} [summary]          60-second text fallback for the video (FR-UPSC-10)
 * @property {{ title: string, credit: string, embedId: string } | null} [video]
 * @property {HighlightCard[]} [cards]   8–20 when published (FR-UPSC-09)
 */
/** @typedef {{ id: string, name: string, gs: string, chapters: Chapter[] }} Subject */

export const REVISION_INTERVAL_DAYS = [1, 3, 7, 21]

/** @type {Subject[]} */
export const SUBJECTS = [
  {
    id: 'polity',
    name: 'Polity',
    gs: 'GS2',
    chapters: [
      { id: 'polity-preamble', title: 'Preamble' },
      { id: 'polity-fundamental-rights', title: 'Fundamental Rights' },
      { id: 'polity-parliament', title: 'Parliament' },
      {
        id: 'polity-governor',
        title: 'Governor',
        video: null,
        summary:
          'The Governor is the constitutional head of a state, appointed by the President, who mostly acts on the state government’s advice. The flashpoints are discretion: reserving bills for the President, choosing a Chief Minister when no party has a majority, and reports to the Centre.',
        cards: [
          { type: 'Concept', title: 'Two hats', body: 'The Governor is the ==constitutional head of the state== and also the Centre’s link to it. Art 153 provides a Governor for each state; one person can hold the post for two or more states.', cite: 'Constitution of India, Art 153' },
          { type: 'Appointment', title: 'Chosen by the President', body: 'Appointed by the President by warrant under hand and seal (Art 155). Holds office during the ==pleasure of the President== (Art 156); the normal term is five years.', cite: 'Constitution of India, Arts 155–156' },
          { type: 'Qualifications', title: 'Only two in the text', body: 'A citizen of India who has completed ==35 years== of age (Art 157). Cannot be a member of Parliament or a state legislature, or hold an office of profit (Art 158).', cite: 'Constitution of India, Arts 157–158' },
          { type: 'Article', title: 'Aid and advice', body: 'Art 163: a council of ministers headed by the Chief Minister aids and advises the Governor, ==except where the Constitution allows discretion==. If a question arises whether a matter is discretionary, the Governor’s decision is final.', cite: 'Constitution of India, Art 163' },
          { type: 'Article', title: 'Four options on a bill', body: 'Under Art 200 the Governor can ==assent, withhold, return== (not a money bill) or ==reserve== it for the President. A bill passed again after being returned cannot be withheld.', cite: 'Constitution of India, Arts 200–201' },
          { type: 'Article', title: 'Ordinances', body: 'Art 213: when the legislature is not in session, the Governor can issue an ordinance. It must be laid before the legislature and lapses ==six weeks== after it reassembles.', cite: 'Constitution of India, Art 213' },
          { type: 'Common confusion', title: 'Governor vs President on bills', body: 'Both can give or withhold assent and return a non-money bill. Only the Governor has the extra option to ==reserve== a bill for someone else: the President.', cite: 'Constitution of India, Arts 111, 200' },
          { type: 'Asked like this', title: 'How Prelims tests it', body: 'Statement questions mix up who can do what: reserve a bill, issue an ordinance, report on the failure of constitutional machinery. Learn the Article next to each power.', cite: 'Constitution of India, Arts 200, 213, 356' },
        ],
      },
      { id: 'polity-chief-minister', title: 'Chief Minister' },
      { id: 'polity-state-legislature', title: 'State Legislature' },
      { id: 'polity-emergency', title: 'Emergency Provisions' },
    ],
  },
  {
    id: 'geography',
    name: 'Geography',
    gs: 'GS1',
    chapters: [
      { id: 'geography-location', title: 'India: Location' },
      { id: 'geography-physiography', title: 'Structure and Physiography' },
      { id: 'geography-drainage', title: 'Drainage System' },
      {
        id: 'geography-climate',
        title: 'Climate',
        video: null,
        summary:
          'India has a monsoon climate: winds reverse with the seasons. Latitude, the Himalayas and jet streams shape it. Western disturbances bring winter rain to the north-west, and the retreating monsoon brings the Tamil Nadu coast most of its rain.',
        cards: [
          { type: 'Concept', title: 'A monsoon climate', body: 'India’s climate is called ==monsoon type==: the defining feature is a seasonal reversal of winds, with a wet summer and a dry winter over most of the country.', cite: 'India Meteorological Department' },
          { type: 'Concept', title: 'Why the Himalayas matter', body: 'The Himalayas block cold winds from Central Asia in winter and hold back the monsoon winds in summer, so the north stays warmer and wetter than its latitude suggests.', cite: 'India Meteorological Department' },
          { type: 'Concept', title: 'Western disturbances', body: 'Winter rain in the north-west comes from low-pressure systems from the ==Mediterranean== region, carried in by the westerly jet. It is small in amount but valuable for rabi crops.', cite: 'India Meteorological Department, Glossary' },
          { type: 'Concept', title: 'Two jet streams', body: 'In winter a ==subtropical westerly jet== lies south of the Himalayas. In summer a ==tropical easterly jet== blows over the southern Peninsula.', cite: 'India Meteorological Department' },
          { type: 'Date', title: 'Onset and spread', body: 'The monsoon reaches Kerala around ==1 June== (give or take about a week) and normally covers the whole country by early to mid-July.', cite: 'India Meteorological Department, monsoon onset criteria' },
          { type: 'Term', title: 'Mango showers', body: 'Pre-monsoon showers in Kerala and coastal Karnataka that help mangoes ripen early. In Bengal and Assam the spring evening thunderstorms are called ==Kalbaisakhi==.', cite: 'India Meteorological Department' },
          { type: 'Common confusion', title: 'Tamil Nadu’s rainy season', body: 'The Tamil Nadu coast gets most of its rain in ==October–December==, from the northeast monsoon, not in June–September.', cite: 'India Meteorological Department' },
          { type: 'Term', title: 'Loo', body: 'Hot, dry, gusty winds that blow over the northern plains on May and June afternoons.', cite: 'India Meteorological Department' },
        ],
      },
      { id: 'geography-vegetation', title: 'Natural Vegetation' },
      { id: 'geography-soils', title: 'Soils' },
    ],
  },
  { id: 'modern-history', name: 'Modern History', gs: 'GS1', chapters: [] },
]

/** @returns {{ subject: Subject, chapter: Chapter } | null} */
export function findChapter(chapterId) {
  for (const subject of SUBJECTS) {
    const chapter = subject.chapters.find((c) => c.id === chapterId)
    if (chapter) return { subject, chapter }
  }
  return null
}

/** A chapter can be opened when it has its highlight deck. */
export function isChapterReady(chapter) {
  return Array.isArray(chapter?.cards) && chapter.cards.length > 0
}

/**
 * Publish rule for a chapter deck (FR-UPSC-09, FR-UPSC-10): 8–20 cards, every card cited,
 * and a text fallback for the video.
 * @returns {string[]} problems; empty when publishable
 */
export function chapterProblems(chapter) {
  const problems = []
  const cards = chapter?.cards ?? []
  if (cards.length < 8 || cards.length > 20) problems.push('cards: need 8–20')
  cards.forEach((c, i) => {
    if (!c.cite?.trim()) problems.push(`card ${i + 1}: no citation`)
    if (!c.title?.trim() || !c.body?.trim()) problems.push(`card ${i + 1}: empty`)
  })
  if (!chapter?.summary?.trim()) problems.push('summary: missing video fallback')
  return problems
}

/* ---------------- revision scheduling (FR-UPSC-11) ---------------- */

/** @param {string} dateKey YYYY-MM-DD @param {number} days */
export function addDays(dateKey, days) {
  const [y, m, d] = dateKey.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d + days))
  return dt.toISOString().slice(0, 10)
}

/**
 * When a chapter deck is finished, each card is due again 1, 3, 7 and 21 days later.
 * Returns the new revision state for that chapter's cards.
 * @param {Record<string, { step: number, due: string }>} state
 * @param {string} chapterId
 * @param {number} cardCount
 * @param {string} todayKey
 */
export function scheduleChapter(state, chapterId, cardCount, todayKey) {
  const next = { ...state }
  for (let i = 0; i < cardCount; i += 1) {
    const key = `${chapterId}#${i}`
    if (!next[key]) next[key] = { step: 0, due: addDays(todayKey, REVISION_INTERVAL_DAYS[0]) }
  }
  return next
}

/**
 * Records a revision answer. "Got it" moves to the next interval (retired after the last);
 * "Again" brings the card back tomorrow at the first step.
 */
export function gradeCard(state, cardKey, gotIt, todayKey) {
  const current = state[cardKey]
  if (!current) return state
  const next = { ...state }
  if (!gotIt) {
    next[cardKey] = { step: 0, due: addDays(todayKey, REVISION_INTERVAL_DAYS[0]) }
    return next
  }
  const step = current.step + 1
  if (step >= REVISION_INTERVAL_DAYS.length) delete next[cardKey]
  else next[cardKey] = { step, due: addDays(todayKey, REVISION_INTERVAL_DAYS[step]) }
  return next
}

/**
 * Cards due on or before today, oldest first, at most `limit`.
 * @returns {{ key: string, chapterId: string, index: number, card: HighlightCard, chapterTitle: string, subject: string }[]}
 */
export function dueCards(state, todayKey, limit = 3) {
  return Object.entries(state)
    .filter(([, v]) => v.due <= todayKey)
    .sort((a, b) => (a[1].due < b[1].due ? -1 : a[1].due > b[1].due ? 1 : a[0] < b[0] ? -1 : 1))
    .map(([key]) => {
      const [chapterId, idx] = key.split('#')
      const found = findChapter(chapterId)
      const card = found?.chapter.cards?.[Number(idx)]
      return card ? { key, chapterId, index: Number(idx), card, chapterTitle: found.chapter.title, subject: found.subject.name } : null
    })
    .filter(Boolean)
    .slice(0, limit)
}

/**
 * Sample revision state so a first-time user sees how due cards work (FR-UPSC-11). Marked as
 * examples in the UI.
 */
export function sampleRevisionState(todayKey) {
  return {
    'polity-governor#4': { step: 1, due: todayKey },
    'geography-climate#3': { step: 0, due: todayKey },
    'polity-governor#3': { step: 2, due: todayKey },
  }
}
