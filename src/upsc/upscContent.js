/**
 * Sample UPSC-mode content (PRD §6.3 current-affairs post, FR-UPSC-02).
 *
 * This is a hand-written SAMPLE edition so the UPSC feed can be built and tested before the
 * current-affairs intake exists (BUILD_PLAN M1.21). The "what happened" lines describe recurring
 * kinds of news, not a specific dated event, and the UI labels the edition "Sample edition".
 * Static facts are from the cited primary sources; no URLs are invented (PRD §5, §10.3).
 */

/** @typedef {'GS1' | 'GS2' | 'GS3' | 'GS4'} GsPaper */
/** @typedef {{ publisher: string, title: string }} UpscSource */
/**
 * @typedef {object} UpscPost
 * @property {string} id
 * @property {'current-affairs'} kind
 * @property {string} dateKey      local date the item belongs to (YYYY-MM-DD)
 * @property {GsPaper} gs
 * @property {string} gsArea       e.g. "Polity"
 * @property {string} head
 * @property {string} [what]       current affairs: what happened
 * @property {string} [background]
 * @property {string[]} [facts]    Prelims facts; `==x==` marks a highlighted phrase
 * @property {string} [why]        Mains angle
 * @property {string} [chapterId]  Learning Zone chapter for "Revise the basics" (FR-UPSC-12)
 * @property {UpscSource[]} sources
 * @property {number} minutes
 * @property {boolean} [sample]
 */

export const SAMPLE_EDITION_DATE = '2026-11-14'

/** @type {UpscPost[]} */
export const UPSC_SAMPLE_POSTS = [
  {
    id: 'upsc-governor-assent',
    kind: 'current-affairs',
    dateKey: SAMPLE_EDITION_DATE,
    gs: 'GS2',
    gsArea: 'Polity',
    head: 'Can a Governor just sit on a state bill?',
    what: 'States keep going to court over bills left pending with their Governors for months. Punjab, Tamil Nadu and Kerala have all taken this to the Supreme Court since 2023.',
    background:
      'Article 200 gives the Governor four options on a bill passed by the state legislature: give assent, withhold assent, return it for reconsideration, or reserve it for the President.',
    facts: [
      '==Art 200==: the Governor’s options on state bills',
      '==Art 201==: bills reserved for the President',
      'Money bills cannot be returned for reconsideration',
      'If the House passes a returned bill again, the Governor shall not withhold assent',
      '2023, State of Punjab case: the Supreme Court said a Governor cannot keep a bill pending indefinitely',
    ],
    chapterId: 'polity-governor',
    why: 'Centre–state relations, the Governor’s discretion versus the elected government, and whether the Constitution needs time limits. Use it in GS2 answers on federalism.',
    sources: [
      { publisher: 'Constitution of India', title: 'Articles 163, 200, 201' },
      { publisher: 'Supreme Court of India', title: 'State of Punjab v. Principal Secretary to the Governor of Punjab (2023)' },
    ],
    minutes: 2,
    sample: true,
  },
  {
    id: 'upsc-mpc-repo',
    kind: 'current-affairs',
    dateKey: SAMPLE_EDITION_DATE,
    gs: 'GS3',
    gsArea: 'Economy',
    head: 'Who actually decides the repo rate?',
    what: 'Every Monetary Policy Committee meeting ends with a repo rate decision that moves loan rates across the country.',
    background:
      'Since 2016, the repo rate is set by a six-member Monetary Policy Committee, not by the RBI Governor alone.',
    facts: [
      'Set up under ==Section 45ZB, RBI Act 1934== (amended 2016)',
      '6 members: 3 from the RBI including the Governor, 3 external members appointed by the Centre',
      'The Governor has a casting vote in a tie',
      'Inflation target: ==4% CPI==, with a band of 2–6%',
      'Meets at least four times a year',
    ],
    why: 'Links inflation, growth and monetary policy in GS3. Mains asks about inflation targeting and how independent the MPC really is.',
    sources: [
      { publisher: 'RBI Act, 1934', title: 'Sections 45ZA–45ZB' },
      { publisher: 'Reserve Bank of India', title: 'Monetary Policy Committee' },
    ],
    minutes: 2,
    sample: true,
  },
  {
    id: 'upsc-great-indian-bustard',
    kind: 'current-affairs',
    dateKey: SAMPLE_EDITION_DATE,
    gs: 'GS3',
    gsArea: 'Environment',
    head: 'Why power lines matter for the Great Indian Bustard',
    what: 'Protecting the Great Indian Bustard keeps returning to the news because of overhead power lines in its Thar desert habitat.',
    background:
      'The bustard is a heavy bird with poor forward vision. It flies into overhead power lines, many of them built for solar and wind projects in the Thar.',
    facts: [
      'IUCN status: ==Critically Endangered==',
      'Schedule I, Wildlife (Protection) Act 1972',
      'State bird of Rajasthan',
      'Main habitat: Desert National Park, Jaisalmer',
      '2024, M.K. Ranjitsinh case: the Supreme Court recognised a right against the adverse effects of climate change',
    ],
    why: 'Conservation versus clean energy is a classic GS3 trade-off. Use it for answers on biodiversity, renewable energy and environmental law.',
    sources: [
      { publisher: 'IUCN Red List', title: 'Ardeotis nigriceps' },
      { publisher: 'Supreme Court of India', title: 'M.K. Ranjitsinh v. Union of India (2024)' },
    ],
    minutes: 2,
    sample: true,
  },
  {
    id: 'upsc-western-disturbance',
    kind: 'current-affairs',
    dateKey: SAMPLE_EDITION_DATE,
    gs: 'GS1',
    gsArea: 'Geography',
    head: 'What a western disturbance is, and why wheat farmers care',
    what: 'Each winter, western disturbances bring rain and snow to north-west India and show up in weather news.',
    background:
      'A western disturbance is a low-pressure system that forms over the Mediterranean region and is carried east by the subtropical westerly jet stream.',
    facts: [
      'Origin: Mediterranean and west Asia',
      'Carried by the ==subtropical westerly jet==',
      'Winter rain in Punjab, Haryana, Delhi and western UP',
      'Snowfall in the western Himalayas',
      'Helps rabi crops, especially ==wheat==',
    ],
    chapterId: 'geography-climate',
    why: 'Links climatology in GS1 with agriculture in GS3. Mains angle: changing patterns of western disturbances and what that means for farming and Himalayan snow.',
    sources: [
      { publisher: 'India Meteorological Department', title: 'Glossary' },
    ],
    minutes: 2,
    sample: true,
  },
  {
    id: 'upsc-wto-appellate-body',
    kind: 'current-affairs',
    dateKey: SAMPLE_EDITION_DATE,
    gs: 'GS2',
    gsArea: 'International relations',
    head: 'Why the WTO’s top trade court has been empty since 2019',
    what: 'Trade disputes keep piling up at the WTO with no final court to hear appeals, and its reform comes up at every ministerial meeting.',
    background:
      'WTO disputes go to a panel first, and either side can appeal to the Appellate Body. Since December 2019 it has had too few members to hear any appeal, because new appointments have been blocked.',
    facts: [
      'WTO set up in ==1995== by the Marrakesh Agreement; headquarters in Geneva',
      'Appellate Body: 7 members, 3 hear each appeal',
      'Non-functional since ==December 2019==',
      'An appeal “into the void” leaves a panel ruling unenforced',
      'Some members use an interim appeal arbitration arrangement (MPIA); India has not joined it',
    ],
    why: 'Rules-based trade, India’s own disputes, and reform of global institutions. Use it in GS2 answers on international institutions and GS3 answers on trade.',
    sources: [
      { publisher: 'World Trade Organization', title: 'Dispute settlement: Appellate Body' },
      { publisher: 'World Trade Organization', title: 'Understanding on Rules and Procedures Governing the Settlement of Disputes' },
    ],
    minutes: 2,
    sample: true,
  },
]

/**
 * Editor-checked explainers that open instantly (FR-UPSC-03 "cached ones instant").
 * Live AI explainers for any topic arrive with BUILD_PLAN M1.23.
 */
export const UPSC_EXPLAINERS = {
  'upsc-governor-assent': {
    id: 'upsc-governor-assent',
    title: 'The Governor and state bills',
    gs: 'GS2',
    gsArea: 'Polity',
    oneLine:
      'Article 200 gives the Governor four choices on a state bill. The courts have said sitting on it forever is not one of them.',
    context:
      'Since 2023, several states have gone to the Supreme Court over bills their Governors held for months or years. The question each time: is the Governor bound by a deadline, and by the advice of the elected government?',
    staticLink:
      'Arts 153–162 set up the Governor’s office. Art 163: the Governor acts on the aid and advice of the council of ministers, except where the Constitution gives discretion. Art 200: options on bills. Art 201: bills reserved for the President. Art 361: the Governor’s personal immunity.',
    facts: [
      'Four options under Art 200: assent, withhold, return, reserve',
      'Money bills cannot be returned',
      'A bill passed again after return: the Governor shall not withhold assent',
      'Sarkaria Commission (1988): reserve bills for the President only in rare cases',
      'Punchhi Commission (2010): suggested a six-month limit for decisions on bills',
    ],
    argumentsFor: 'A check on bills that may be unconstitutional. Reserving a bill for the President can protect national interest.',
    argumentsAgainst:
      'An unelected office can stall an elected legislature. With no time limit, the power is open to misuse for political ends.',
    wayForward:
      'Time limits by convention or amendment, clear grounds for reserving bills, and more Centre–state dialogue through the Inter-State Council (Art 263).',
    mainsPrompt: 'Examine the Governor’s powers over assent to state bills. Should the Constitution set time limits?',
    sources: [
      { publisher: 'Constitution of India', title: 'Articles 163, 200, 201, 263' },
      { publisher: 'Supreme Court of India', title: 'State of Punjab v. Principal Secretary to the Governor of Punjab (2023)' },
      { publisher: 'Inter-State Council Secretariat', title: 'Reports of the Sarkaria (1988) and Punchhi (2010) Commissions' },
    ],
    reviewed: true,
  },
  'anti-defection-law': {
    id: 'anti-defection-law',
    title: 'The anti-defection law',
    gs: 'GS2',
    gsArea: 'Polity',
    oneLine: 'The Tenth Schedule lets a legislator be disqualified for switching parties, with a few exceptions.',
    context:
      'Floor-crossing in the 1960s to 80s brought down governments. “Aaya Ram, Gaya Ram” comes from a Haryana MLA who changed parties three times in one day in 1967.',
    staticLink:
      'The 52nd Amendment Act, 1985 added the Tenth Schedule. The 91st Amendment Act, 2003 removed the one-third “split” exception and capped the size of ministries.',
    facts: [
      'Grounds: giving up party membership, or voting or abstaining against the whip without permission',
      'An independent who joins a party after election is disqualified',
      'A nominated member may join a party within six months of taking their seat',
      'Merger exception: two-thirds of the legislature party must agree',
      'The Speaker or Chairman decides; Kihoto Hollohan (1992) made that decision open to judicial review',
    ],
    argumentsFor: 'Keeps governments stable and respects the mandate voters gave a party.',
    argumentsAgainst:
      'Curbs a legislator’s freedom to vote by conscience, strengthens party leaderships, and leaves decisions with a Speaker who may be partisan or slow.',
    wayForward:
      'In 2020 the Supreme Court asked Speakers to decide within three months and asked Parliament to consider an independent tribunal. The Dinesh Goswami Committee (1990) suggested decisions by the President or Governor on the Election Commission’s advice.',
    mainsPrompt: 'Has the anti-defection law achieved its purpose? Suggest reforms.',
    sources: [
      { publisher: 'Constitution of India', title: 'Tenth Schedule' },
      { publisher: 'Supreme Court of India', title: 'Kihoto Hollohan v. Zachillhu (1992)' },
      { publisher: 'Supreme Court of India', title: 'Keisham Meghachandra Singh v. Speaker, Manipur Legislative Assembly (2020)' },
    ],
    reviewed: true,
  },
}

