/**
 * UPSC Learning Zone (PRD v2.1 P9b, FR-UPSC-08..11, D-12): Subject → Chapter. Each chapter is distilled
 * into our own UPSC-format highlight cards that cite public sources. No book or publisher is named.
 *
 * Five chapters are fully written so the deck UI can be built before the Studio pipeline (M1.25).
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
      {
        id: 'polity-preamble',
        title: 'Preamble',
        video: null,
        summary:
          'The Preamble says where the Constitution’s authority comes from (the people of India), what kind of state India is (sovereign, socialist, secular, democratic republic) and what it aims for (justice, liberty, equality, fraternity). It was amended once, in 1976.',
        cards: [
          { type: 'Concept', title: 'Authority from the people', body: 'The Preamble opens with ==“We, the people of India”==: the Constitution’s authority comes from the people, who adopt it and give it to themselves.', cite: 'Constitution of India, Preamble' },
          { type: 'Concept', title: 'Five words for the state', body: 'India is declared a ==sovereign, socialist, secular, democratic republic==. “Socialist” and “secular” were inserted in 1976.', cite: 'Constitution of India, Preamble; Constitution (Forty-second Amendment) Act, 1976' },
          { type: 'Concept', title: 'Four objectives', body: 'Justice (social, economic and political), liberty (of thought, expression, belief, faith and worship), equality (of status and opportunity) and ==fraternity==, assuring the dignity of the individual and the unity and integrity of the nation.', cite: 'Constitution of India, Preamble' },
          { type: 'Date', title: 'Adopted, then in force', body: 'The Constituent Assembly adopted the Constitution on ==26 November 1949==. Most of it came into force on ==26 January 1950==; some provisions applied at once.', cite: 'Constitution of India, Preamble and Art 394' },
          { type: 'Common confusion', title: 'Is the Preamble part of the Constitution?', body: 'In the Berubari reference (1960) the Supreme Court said it was not. In ==Kesavananda Bharati (1973)== it held that the Preamble is part of the Constitution.', cite: 'Supreme Court of India: In re Berubari Union (1960); Kesavananda Bharati v. State of Kerala (1973)' },
          { type: 'Article', title: 'Can it be amended?', body: 'Yes, under Art 368, but not so as to destroy the ==basic structure==. It has been amended once, by the 42nd Amendment, 1976.', cite: 'Kesavananda Bharati v. State of Kerala (1973); Constitution (Forty-second Amendment) Act, 1976' },
          { type: 'Term', title: 'Republic', body: 'The head of state is ==elected, not hereditary==: the President is chosen by an electoral college of elected members of Parliament and the state assemblies.', cite: 'Constitution of India, Arts 54–55' },
          { type: 'Asked like this', title: 'How Prelims tests it', body: 'Expect “which words were added by the 42nd Amendment”: ==socialist, secular and integrity== (“unity of the nation” became “unity and integrity of the nation”).', cite: 'Constitution (Forty-second Amendment) Act, 1976' },
        ],
      },
      {
        id: 'polity-fundamental-rights',
        title: 'Fundamental Rights',
        video: null,
        summary:
          'Part III (Articles 12 to 35) lists rights that courts enforce against the state. They fall into six groups, from equality to constitutional remedies. Some belong only to citizens, and Articles 20 and 21 stay enforceable even during an emergency.',
        cards: [
          { type: 'Concept', title: 'Part III, enforceable', body: 'Fundamental Rights are in ==Part III, Articles 12–35==. Laws that take them away are void to that extent (Art 13), and Art 32 lets anyone go straight to the Supreme Court to enforce them.', cite: 'Constitution of India, Arts 12–13, 32' },
          { type: 'Concept', title: 'Six groups', body: 'Equality (Arts 14–18), freedom (19–22), against exploitation (23–24), freedom of religion (25–28), cultural and educational (29–30), and ==constitutional remedies (32)==. Property stopped being a Fundamental Right in 1978 and is now Art 300A.', cite: 'Constitution of India, Part III; Constitution (Forty-fourth Amendment) Act, 1978' },
          { type: 'Article', title: 'Six freedoms in Art 19', body: 'Speech and expression; assembling peacefully without arms; forming associations or unions; moving freely and residing anywhere in India; any profession or trade. The state can impose ==reasonable restrictions== on each.', cite: 'Constitution of India, Art 19' },
          { type: 'Article', title: 'Life and personal liberty', body: 'Art 21: no person shall be deprived of life or personal liberty except by procedure established by law. In ==Maneka Gandhi (1978)== the Court held that procedure must be fair, just and reasonable.', cite: 'Constitution of India, Art 21; Maneka Gandhi v. Union of India (1978)' },
          { type: 'Article', title: 'Five writs', body: 'To enforce rights, courts issue ==habeas corpus, mandamus, prohibition, certiorari and quo warranto==. The Supreme Court does so under Art 32; High Courts under Art 226, which also covers other legal rights.', cite: 'Constitution of India, Arts 32, 226' },
          { type: 'Common confusion', title: 'Citizens only, or everyone?', body: 'Arts ==15, 16, 19, 29 and 30== are for citizens only. Rights such as equality before law (Art 14) and life and liberty (Art 21) are available to any person, including foreigners.', cite: 'Constitution of India, Arts 14–16, 19, 21, 29–30' },
          { type: 'Article', title: 'During an emergency', body: 'Art 19 is suspended automatically when an emergency is declared on grounds of war or external aggression (Art 358). Since the 44th Amendment, ==Arts 20 and 21 cannot be suspended== (Art 359).', cite: 'Constitution of India, Arts 358–359' },
          { type: 'Date', title: 'Right to education', body: 'Art 21A, inserted by the ==86th Amendment (2002)==, makes free and compulsory education for children aged 6 to 14 a Fundamental Right.', cite: 'Constitution of India, Art 21A; Constitution (Eighty-sixth Amendment) Act, 2002' },
        ],
      },
      {
        id: 'polity-parliament',
        title: 'Parliament',
        video: null,
        summary:
          'Parliament is the President plus two Houses: the Rajya Sabha, a permanent body, and the Lok Sabha, elected for five years. The Lok Sabha controls money bills, deadlocks on ordinary bills go to a joint sitting, and constitutional amendments need each House separately.',
        cards: [
          { type: 'Article', title: 'Three parts', body: 'Art 79: Parliament consists of the ==President== and two Houses, the Council of States (Rajya Sabha) and the House of the People (Lok Sabha).', cite: 'Constitution of India, Art 79' },
          { type: 'Article', title: 'Rajya Sabha', body: 'At most ==250 members==: up to 238 representatives of states and union territories, and 12 nominated by the President. It is not dissolved; one-third of members retire every second year.', cite: 'Constitution of India, Arts 80, 83(1)' },
          { type: 'Article', title: 'Lok Sabha', body: 'Up to ==530 members from states and 20 from union territories==, directly elected. Its term is five years unless dissolved earlier; during an emergency Parliament can extend it by law, one year at a time.', cite: 'Constitution of India, Arts 81, 83(2)' },
          { type: 'Qualifications', title: 'Minimum age', body: 'A citizen of India, at least ==25 years== old for the Lok Sabha and ==30 years== for the Rajya Sabha, with other qualifications Parliament may set by law.', cite: 'Constitution of India, Art 84' },
          { type: 'Article', title: 'Money bills', body: 'A money bill can be introduced ==only in the Lok Sabha==. The Rajya Sabha can only recommend changes and must return it within 14 days. The Speaker’s certificate decides whether a bill is a money bill.', cite: 'Constitution of India, Arts 109–110' },
          { type: 'Article', title: 'Joint sitting', body: 'If the Houses disagree on an ordinary bill, the President can call a joint sitting, presided over by the Speaker. There is ==no joint sitting for a money bill or a constitutional amendment==.', cite: 'Constitution of India, Arts 108, 368' },
          { type: 'Article', title: 'Six-month rule', body: 'The President must summon each House so that ==no more than six months== pass between the last sitting of one session and the first sitting of the next.', cite: 'Constitution of India, Art 85' },
          { type: 'Common confusion', title: 'Who presides?', body: 'The Lok Sabha ==elects its Speaker== (Art 93). The Rajya Sabha’s Chairman is the ==Vice-President==, ex officio (Arts 64, 89), who is not a member of the House.', cite: 'Constitution of India, Arts 64, 89, 93' },
        ],
      },
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
