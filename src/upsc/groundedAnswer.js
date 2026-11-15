/**
 * Ask anything, grounded (FR-UPSC-04a/b, PRD §10.3a): answers come only from allow-listed authentic sources,
 * every factual sentence carries a citation, unsupported sentences are dropped, and when nothing authentic
 * is found the answer says so.
 *
 * Live retrieval arrives with BUILD_PLAN M1.23 (needs M0.1 quotas). Until then the app answers from a small
 * set of reviewed SAMPLE answers and returns "no authentic source" for everything else, which is the
 * honest behaviour the live system must also have.
 */

export const SOURCE_ALLOW_LIST = [
  'Constitution of India & India Code',
  'NCERT',
  'PIB',
  'PRS Legislative Research',
  'RBI',
  'Supreme Court & High Courts',
  'Economic Survey & Budget',
  'UN, WTO, World Bank, IMF',
]

/**
 * @typedef {{ text: string, cites: number[] }} Sentence
 * @typedef {{ heading: string, list?: boolean, sentences: Sentence[] }} AnswerSection
 * @typedef {{ title: string, publisher: string, says: string }} AnswerSource
 * @typedef {{ id: string, title: string, gs: string, gsArea: string, sections: AnswerSection[], sources: AnswerSource[] }} Answer
 */

/** @type {Record<string, Answer>} */
export const SAMPLE_ANSWERS = {
  'anti-defection-law': {
    id: 'anti-defection-law',
    title: 'The anti-defection law',
    gs: 'GS2',
    gsArea: 'Polity',
    sources: [
      { title: 'Constitution of India, Tenth Schedule', publisher: 'India Code', says: 'Paragraph 2: grounds for disqualification on defection. Paragraph 4: merger exception.' },
      { title: 'Constitution (Fifty-second Amendment) Act, 1985', publisher: 'India Code', says: 'Inserted the Tenth Schedule.' },
      { title: 'Constitution (Ninety-first Amendment) Act, 2003', publisher: 'India Code', says: 'Omitted paragraph 3 (split) of the Tenth Schedule.' },
      { title: 'Kihoto Hollohan v. Zachillhu (1992)', publisher: 'Supreme Court of India', says: 'Decisions of the presiding officer under the Tenth Schedule are open to judicial review.' },
      { title: 'Keisham Meghachandra Singh v. Speaker, Manipur Legislative Assembly (2020)', publisher: 'Supreme Court of India', says: 'Disqualification petitions should be decided within three months, barring extraordinary circumstances.' },
    ],
    sections: [
      { heading: 'In one line', sentences: [{ text: 'The Tenth Schedule disqualifies a legislator who gives up party membership or defies the party whip, with a merger exception.', cites: [1] }] },
      {
        heading: 'Context',
        sentences: [
          { text: 'Floor-crossing in the 1960s to 80s often brought down state governments.', cites: [] },
          { text: 'The 52nd Amendment Act, 1985 added the Tenth Schedule to the Constitution.', cites: [2] },
        ],
      },
      { heading: 'Static linkage', sentences: [{ text: 'The 91st Amendment Act, 2003 removed the one-third “split” exception.', cites: [3] }] },
      {
        heading: 'Prelims facts',
        list: true,
        sentences: [
          { text: 'Voluntarily giving up party membership, or voting or abstaining against the whip without permission, are grounds for disqualification.', cites: [1] },
          { text: 'An independent member who joins a party after election is disqualified.', cites: [1] },
          { text: 'A merger is protected if two-thirds of the legislature party agree to it.', cites: [1] },
          { text: 'The Speaker or Chairman decides, and that decision is open to judicial review.', cites: [1, 4] },
        ],
      },
      { heading: 'Way forward', sentences: [{ text: 'The Supreme Court has said disqualification petitions should be decided within three months.', cites: [5] }] },
    ],
  },
}

/** Questions the app already answers with reviewed content: open that instead of writing a new answer. */
export const COVERED_TOPICS = [
  { match: ['governor', 'state bill'], explainerId: 'upsc-governor-assent', chapterId: 'polity-governor' },
]

const SAMPLE_MATCHES = [{ match: ['anti-defection', 'anti defection', 'tenth schedule', 'defection'], answerId: 'anti-defection-law' }]

/**
 * Keeps only sentences that cite a real source and drops the rest (FR-UPSC-04a). A citation that points at
 * a source the answer doesn't have counts as no citation.
 * @param {Answer} answer
 * @returns {{ answer: Answer, dropped: number }}
 */
export function enforceCitations(answer) {
  let dropped = 0
  const valid = (n) => Number.isInteger(n) && n >= 1 && n <= answer.sources.length
  const sections = answer.sections
    .map((section) => {
      const sentences = section.sentences.filter((s) => {
        const ok = s.cites.length > 0 && s.cites.every(valid)
        if (!ok) dropped += 1
        return ok
      })
      return { ...section, sentences }
    })
    .filter((section) => section.sentences.length > 0)
  return { answer: { ...answer, sections }, dropped }
}

/**
 * Routes a question to a grounded answer, to reviewed content that already covers it, or to "no source".
 * @param {string} question
 * @returns {{ kind: 'answer', answer: Answer, dropped: number } | { kind: 'covered', explainerId: string, chapterId: string } | { kind: 'no-source' }}
 */
export function answerQuestion(question) {
  const q = String(question ?? '').toLowerCase()
  if (!q.trim()) return { kind: 'no-source' }
  const covered = COVERED_TOPICS.find((t) => t.match.every((m) => q.includes(m)))
  if (covered) return { kind: 'covered', explainerId: covered.explainerId, chapterId: covered.chapterId }
  const hit = SAMPLE_MATCHES.find((t) => t.match.some((m) => q.includes(m)))
  if (hit) return { kind: 'answer', ...enforceCitations(SAMPLE_ANSWERS[hit.answerId]) }
  return { kind: 'no-source' }
}

export const ASK_SUGGESTIONS = [
  'Explain the anti-defection law',
  'What powers does a Governor have over state bills?',
  'Who is the best Polity teacher on YouTube?',
]
