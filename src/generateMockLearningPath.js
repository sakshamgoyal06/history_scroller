/**
 * Mock learning-path generator for the "Learn a Topic" MVP.
 * Replace this module with a real AI API call (same input/output shape) in v0.4+.
 */

const LEVEL_LABEL = {
  beginner: 'Beginner',
  curious: 'Curious',
  deep: 'Deep Dive',
}

function slugTopic(topic) {
  return String(topic ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function scopeHint(scope) {
  if (scope === 'india') return 'Focus on India where it helps ground the idea.'
  if (scope === 'global') return 'Keep examples international and comparative.'
  return 'Mix India-specific examples with wider global parallels.'
}

function levelHint(level) {
  if (level === 'beginner') return 'Plain language, minimal jargon.'
  if (level === 'deep') return 'More nuance, institutions, and trade-offs.'
  return 'Balanced depth—curious reader pace.'
}

function withFocus(text, focus) {
  const trimmed = String(focus ?? '').trim()
  if (!trimmed) return text
  return `${text} (Your focus: ${trimmed})`
}

/** @typedef {{ order: number, title: string, domain: string, format: string, hook: string, scene: string, coreFact: string, whyItMatters: string, rabbitHole: string, youtubeQuery: string, youtubeId?: string | null }} MockPathCard */

/** @param {string} key */
function matchTopicKey(key) {
  if (/rbi|monetary policy|repo rate|interest rate policy/.test(key)) return 'rbi-monetary-policy'
  if (/river|civilization|civilisation|indus|nile|mesopotamia|cradles/.test(key)) {
    return 'rivers-civilizations'
  }
  if (/parliament|bill|legislation|lawmaking|lok sabha|rajya sabha/.test(key)) {
    return 'parliament-bill'
  }
  return null
}

/** @returns {MockPathCard[]} */
function rbiMonetaryPolicyCards({ level, scope, focus }) {
  const indiaHeavy = scope !== 'global'
  /** @type {MockPathCard[]} */
  const all = [
    {
      order: 1,
      title: 'What “Monetary Policy” Actually Means',
      domain: 'Economics',
      format: 'Explainer',
      hook: withFocus(
        'Before RBI meetings make headlines, it helps to know what toolkits central banks even control.',
        focus,
      ),
      scene:
        'Central banks steer short-term borrowing conditions and liquidity—not every price in the economy directly.',
      coreFact:
        `${levelHint(level)} Monetary policy is how a central bank influences money, credit, and interest rates to keep inflation stable and support growth. In India, the Reserve Bank of India (RBI) sets the policy repo rate and uses liquidity tools so banks can lend or pull back. ${scopeHint(scope)} It works alongside fiscal policy (government spending and taxes), which Parliament controls.`,
      whyItMatters:
        'Home-loan EMIs, business credit, and rupee stability all react—slowly—to these levers.',
      rabbitHole: 'Why do central banks target inflation bands instead of zero inflation?',
      youtubeQuery: 'RBI monetary policy explained India',
      youtubeId: '0jJKjgE3qfE',
    },
    {
      order: 2,
      title: 'The Repo Rate in One Mechanism',
      domain: 'Economics',
      format: 'Explainer',
      hook: 'One rate name shows up in every RBI press conference—here is what it moves.',
      scene:
        'Banks borrow overnight from the RBI against government securities; the repo rate is the price of that borrowing.',
      coreFact:
        `When RBI raises the repo rate, banks' marginal funding cost tends to rise, so new loans often price higher; cuts can pass through to borrowers with a lag. Transmission depends on competition, deposit rates, and government borrowing crowding out credit. ${indiaHeavy ? 'Indian banks also watch liquidity windows like the standing deposit facility and open-market operations.' : 'Most major central banks have an analogous policy rate corridor.'}`,
      whyItMatters:
        'News headlines scream “rate hike,” but your wallet feels it through transmission—not the headline alone.',
      rabbitHole: 'What is the difference between repo rate and MCLR/EBLR loan pricing?',
      youtubeQuery: 'repo rate transmission India banks',
      youtubeId: 'gd8B-zrMSYk',
    },
    {
      order: 3,
      title: 'Inflation Targeting and the MPC',
      domain: 'Economics',
      format: 'Institution',
      hook: 'India formalized an inflation target—and a committee vote—only in the 2010s.',
      scene:
        'The Monetary Policy Committee meets on a schedule, publishes a resolution, and explains its inflation outlook.',
      coreFact:
        `${level === 'deep' ? 'Since 2016, flexible inflation targeting anchors policy to a consumer-price band with RBI accountability to government.' : 'RBI’s Monetary Policy Committee votes on the policy rate, publishing minutes that markets parse for future moves.'} ${scopeHint(scope)} Supply shocks—food, fuel, global commodities—can push CPI even when demand is weak, forcing hard choices between growth and price stability.`,
      whyItMatters:
        'Vegetable prices and fuel bills feed the same index that can trigger rate decisions.',
      rabbitHole: 'How do core vs headline inflation debates show up in MPC minutes?',
      youtubeQuery: 'India Monetary Policy Committee inflation targeting',
      youtubeId: 'IVfjJia42gI',
    },
    {
      order: 4,
      title: 'Liquidity: Beyond the Headline Rate',
      domain: 'Economics',
      format: 'Explainer',
      hook: 'Sometimes RBI keeps rates steady but still changes how much cash banks can lend.',
      scene:
        'Open-market operations, CRR tweaks, and special windows inject or drain banking-system liquidity.',
      coreFact:
        'Even unchanged repo rates can coincide with tighter liquidity if government balances swell or credit demand spikes. RBI may conduct variable-rate repos, buy/sell G-Secs, or adjust the cash reserve ratio so the policy rate actually binds in the interbank market. Global parallels include Fed balance-sheet tools and ECB longer-term refinancing operations.',
      whyItMatters:
        'Small businesses feel liquidity crunches before policy statements change wording.',
      rabbitHole: 'Why did durable liquidity surpluses appear in Indian banking after 2020?',
      youtubeQuery: 'RBI liquidity management open market operations',
      youtubeId: 'gd8B-zrMSYk',
    },
    {
      order: 5,
      title: 'Rupee, Capital Flows, and Policy Trade-offs',
      domain: 'Current Affairs',
      format: 'Explainer',
      hook: 'RBI watches the exchange rate even when it does not “target” a number.',
      scene:
        'Foreign portfolio flows, oil imports, and diaspora remittances all nudge rupee demand and supply.',
      coreFact:
        `${scope !== 'india' ? 'Emerging-market central banks often face the trilemma: open capital account, managed currency, and independent monetary policy—pick two in practice.' : 'RBI intervenes in forex markets to smooth volatility while keeping inflation as the nominal anchor.'} Rate differentials vs the US Fed, geopolitical risk, and trade deficits feed into rupee moves that feed back into imported inflation.`,
      whyItMatters:
        'Studying abroad, imported gadgets, and inflation all connect to the same balance-of-payments story.',
      rabbitHole: 'When does RBI use forex reserves aggressively vs letting the rupee adjust?',
      youtubeQuery: 'RBI forex intervention rupee volatility',
      youtubeId: '75zwHAzz_f8',
    },
  ]
  return all
}

/** @returns {MockPathCard[]} */
function riversCivilizationsCards({ level, scope, focus }) {
  /** @type {MockPathCard[]} */
  const all = [
    {
      order: 1,
      title: 'Why Rivers Anchor Early Cities',
      domain: 'Geography',
      format: 'Map',
      hook: withFocus(
        'Civilizations did not randomly sit beside water—rivers were infrastructure before roads existed.',
        focus,
      ),
      scene:
        'Floodplains offered soil, transport, and fishing; seasonal floods could fertilize—or destroy—fields.',
      coreFact:
        `${levelHint(level)} Permanent settlements need reliable water, surplus food, and ways to move goods. River valleys bundled all three: alluvial soil for grains, waterways for trade, and clay or stone for building. ${scopeHint(scope)} The Indus, Nile, Tigris-Euphrates, and Yellow River basins each supported urban networks with distinct crops and crafts.`,
      whyItMatters:
        'Modern dam debates replay ancient questions: who controls water timing and surplus?',
      rabbitHole: 'Which river civilizations relied more on flood recession agriculture than perennial irrigation?',
      youtubeQuery: 'river valley civilizations geography',
      youtubeId: 'vn3e37VWc0k',
    },
    {
      order: 2,
      title: 'Indus and the Grid of Harappan Towns',
      domain: 'History',
      format: 'Story',
      hook: 'Standardized bricks and drains suggest planning—not accidental sprawl.',
      scene:
        'Sites like Mohenjo-daro paired citadels with lower towns and elaborate drainage.',
      coreFact:
        'Harappan cities show uniform weights, fired bricks, and public bathing structures across a wide arc in present-day India and Pakistan. Trade linked coastal and inland nodes; writing remains undeciphered, so economics is inferred from artifacts. Collapse debates include river course shifts and monsoon weakening—not a single invasion story.',
      whyItMatters:
        'Urban planning and sanitation standards are older than classical Greece in South Asia.',
      rabbitHole: 'What evidence links Ghaggar-Hakra channel changes to site abandonment?',
      youtubeQuery: 'Indus Valley Civilization urban planning',
      youtubeId: 'mi9sMazNPxM',
    },
    {
      order: 3,
      title: 'Nile Rhythm and Pharaonic Statecraft',
      domain: 'History',
      format: 'Timeline',
      hook: 'Egypt’s state calendar literally followed the flood.',
      scene:
        'Annual inundation deposited silt; basin irrigation organized labor and taxation.',
      coreFact:
        `${level === 'deep' ? 'Centralized granaries, corvée labor, and priestly calendars turned flood predictability into political legitimacy.' : 'The Nile’s predictable flood let rulers tax harvests and fund monuments, armies, and temples.'} ${scope === 'india' ? 'Compare with monsoon-driven agriculture in the subcontinent—timing uncertainty shaped different institutions.' : 'Contrast with Tigris unpredictability, which encouraged canal engineering and early law codes.'}`,
      whyItMatters:
        'Food storage and prediction still underpin state capacity during climate shocks.',
      rabbitHole: 'How did the Aswan High Dam change the old flood-agriculture social contract?',
      youtubeQuery: 'Nile flood ancient Egypt agriculture',
      youtubeId: 'Z3Wvw6BivVI',
    },
    {
      order: 4,
      title: 'Mesopotamia: Canals, Cities, and Code',
      domain: 'History',
      format: 'Institution',
      hook: 'When rivers shift, engineering and law become survival tech.',
      scene:
        'City-states along the Tigris and Euphrates competed to dig canals and manage salinity.',
      coreFact:
        'Southern Mesopotamia needed irrigation to offset low rainfall; silted canals demanded collective upkeep. Cuneiform tablets record loans, field boundaries, and temple economies—early paperwork for river-fed surplus. Hammurabi-style codes partly standardize obligations when water disputes threatened order.',
      whyItMatters:
        'International water treaties today echo intra-basin fights over canal maintenance.',
      rabbitHole: 'Why did Babylon’s power shift when upstream deforestation altered silt loads?',
      youtubeQuery: 'Mesopotamia irrigation civilization',
      youtubeId: 'sohXPx_XZ6Y',
    },
    {
      order: 5,
      title: 'When Rivers Move, Empires Recalculate',
      domain: 'Geography',
      format: 'Explainer',
      hook: 'Climate and avulsion can erase ports that maps still label as strategic.',
      scene:
        'Silt, tectonics, and human diversion reroute channels; coastlines and trade nodes follow.',
      coreFact:
        `${scopeHint(scope)} Satellite imagery now shows abandoned channels under fields—ghost rivers that explain vanished harbors. Modern India faces similar trade-offs: embankments stop floods but can raise upstream risk; interlinking projects spark federal river-basin politics. ${levelHint(level)}`,
      whyItMatters:
        'Infrastructure bets assume river geography is stable; geology says otherwise.',
      rabbitHole: 'Which present-day cities sit on medieval river ports now miles inland?',
      youtubeQuery: 'river avulsion geography civilization',
      youtubeId: 'DoKTTHd-XEQ',
    },
  ]
  return all
}

/** @returns {MockPathCard[]} */
function parliamentBillCards({ level, scope, focus }) {
  /** @type {MockPathCard[]} */
  const all = [
    {
      order: 1,
      title: 'From Idea to Bill',
      domain: 'Civics',
      format: 'Institution',
      hook: withFocus(
        'A law starts as a proposal long before cameras show a vote tally.',
        focus,
      ),
      scene:
        'Ministries draft text; cabinet approves introduction; a bill is numbered and circulated.',
      coreFact:
        `${levelHint(level)} In India’s Parliament, most government bills enter with ministry backing after inter-ministerial consultation. Private member bills exist but rarely pass without government support. ${scope === 'global' ? 'Compare with US bill referral to committees or UK white papers preceding legislation.' : 'The bill’s statement of objects explains intent—your first plain-language guide to purpose.'}`,
      whyItMatters:
        'Policy fights often end before debate if drafting or cabinet clearance stalls.',
      rabbitHole: 'What is the difference between a bill and an act in everyday news language?',
      youtubeQuery: 'how a bill becomes law India Parliament',
      youtubeId: '66f4-NKEYz4',
    },
    {
      order: 2,
      title: 'Lok Sabha vs Rajya Sabha Roles',
      domain: 'Civics',
      format: 'Institution',
      hook: 'Two houses, two calendars—bicameralism slows some changes on purpose.',
      scene:
        'Money bills follow special routes; ordinary bills can ping-pong between houses.',
      coreFact:
        `${scope !== 'global' ? 'Lok Sabha reflects population; Rajya Sabha represents states and expertise, with staggered six-year terms.' : 'Upper chambers worldwide delay or revise rushed legislation—India’s Rajya Sabha can return non-money bills with amendments.'} Joint sessions resolve deadlocks in limited cases; not every disagreement triggers one.`,
      whyItMatters:
        'State interests and federal balance show up in Rajya Sabha numbers and committee work.',
      rabbitHole: 'Which types of bills require both houses to pass identical text?',
      youtubeQuery: 'Lok Sabha Rajya Sabha lawmaking India',
      youtubeId: 'HuFR5XBYLfU',
    },
    {
      order: 3,
      title: 'Committee Scrutiny Behind Closed Doors',
      domain: 'Civics',
      format: 'Explainer',
      hook: 'Many substantive edits happen in committees—not on the live TV feed.',
      scene:
        'Department-related standing committees examine bills, call witnesses, and publish reports.',
      coreFact:
        `${level === 'deep' ? 'Committees can recommend amendments, highlight constitutional tension, or defer for redraft—shaping floor debate even when media ignores them.' : 'Committee reports give MPs a shared fact base before partisan speeches on the floor.'} ${scopeHint(scope)}`,
      whyItMatters:
        'Better laws often come from boring markup sessions you never see trending.',
      rabbitHole: 'How do select committees differ from joint committees on specific bills?',
      youtubeQuery: 'Parliament standing committee bill scrutiny India',
      youtubeId: 'oySykZoKBqs',
    },
    {
      order: 4,
      title: 'Debate, Amendments, and the Vote',
      domain: 'Civics',
      format: 'Timeline',
      hook: 'Passage is a sequence: introduction, discussion, clauses, voting.',
      scene:
        'MPs move amendments clause by clause; the speaker or chair enforces time and rules.',
      coreFact:
        'Voice votes, division lobbies, or electronic voting record outcomes. Anti-defection law binds most MPs to party whips on confidence and certain votes, shaping how much individual conscience matters. Once both houses agree (subject to money-bill rules), the bill awaits presidential assent.',
      whyItMatters:
        'Whip notices and pairing arrangements explain sudden walkouts or unanimous shows.',
      rabbitHole: 'When can the President withhold assent or return a bill for reconsideration?',
      youtubeQuery: 'Indian Parliament voting process bill passage',
      youtubeId: 'oySykZoKBqs',
    },
    {
      order: 5,
      title: 'After Assent: Law on the Books',
      domain: 'Civics',
      format: 'Institution',
      hook: 'Signing day is not the end—rules, budgets, and courts finish the story.',
      scene:
        'Gazette notification publishes the act; ministries issue rules; agencies allocate staff and funds.',
      coreFact:
        `${scopeHint(scope)} Implementation lag can dwarf debate: statutory bodies need appointments, states may need conforming legislation, and courts may stay enforcement via challenges. ${level === 'beginner' ? 'Citizens interact with rules and notifications, not the act’s preamble.' : 'Delegated legislation and subordinate rules often determine fines, forms, and timelines.'}`,
      whyItMatters:
        'A passed bill still fails if enforcement machinery or federal coordination is missing.',
      rabbitHole: 'What is judicial review’s timeline for testing a fresh act’s constitutionality?',
      youtubeQuery: 'Indian act implementation delegated legislation',
      youtubeId: '66f4-NKEYz4',
    },
  ]
  return all
}

/** @param {{ topic: string, level: string, scope: string, length: number, focus: string }} params */
function genericPathCards({ topic, level, scope, length, focus }) {
  const label = String(topic).trim() || 'your topic'
  const templates = [
    {
      order: 1,
      title: `The Big Picture on ${label}`,
      domain: 'General Knowledge',
      format: 'Explainer',
      hook: withFocus(`Most arguments about ${label} start mid-sentence—this card names the whole board first.`, focus),
      scene: `${label} sits at the intersection of facts people repeat, incentives that reward certain behavior, and institutions that set the rules.`,
      coreFact: `${levelHint(level)} ${scopeHint(scope)} At the widest zoom, ${label} is not one headline or one hero figure—it is a network of actors, constraints, and measurable outcomes. Beginners often hunt for a single definition; practitioners watch how the pieces reinforce or fight each other. (${LEVEL_LABEL[level] ?? 'Curious'} path.)`,
      whyItMatters: 'Without the wide view, every later detail feels like a surprise instead of a pattern.',
      rabbitHole: `What is the most common “too simple” story people tell about ${label}?`,
      youtubeQuery: `${label} explained`,
    },
    {
      order: 2,
      title: `Core Concepts Behind ${label}`,
      domain: 'General Knowledge',
      format: 'Explainer',
      hook: 'Shared vocabulary is what turns shouting into diagnosis.',
      scene: `Experts discussing ${label} usually assume you know a handful of nouns—who decides, what gets counted, and where the system’s edges are.`,
      coreFact: `A workable starter map for ${label} includes three layers: the main actors (people, firms, agencies, communities), the metrics they optimize (prices, votes, error rates, growth), and the boundaries of the system (laws, geography, technology limits). ${scopeHint(scope)} When two people disagree about ${label}, the argument is often really about which layer they are staring at.`,
      whyItMatters: 'Once terms align, you can compare evidence instead of talking past each other.',
      rabbitHole: `Which official report or textbook chapter defines ${label} most clearly for your scope?`,
      youtubeQuery: `${label} basics`,
    },
    {
      order: 3,
      title: `How ${label} Works in Practice`,
      domain: 'General Knowledge',
      format: 'Story',
      hook: 'Mechanisms beat slogans—follow one decision all the way through.',
      scene: `Picture one concrete moment: a budget line item, a lab result, a court filing, or a product launch tied to ${label}.`,
      coreFact: `Walk the chain: inputs (information, money, materials, authority) → process (rules, habits, technology, negotiation) → outputs (prices, permissions, published results, visible behavior). ${scopeHint(scope)} Delays are normal—effects of ${label} often show up weeks or years after the triggering choice, which is why early indicators matter.`,
      whyItMatters: 'Failures in policy and engineering usually trace to a broken link in this chain, not to “bad intentions” alone.',
      rabbitHole: 'Which measurable indicator would convince you the mechanism is working—not merely being talked about?',
      youtubeQuery: `${label} how it works`,
    },
    {
      order: 4,
      title: `Why ${label} Matters Now`,
      domain: 'Current Affairs',
      format: 'Explainer',
      hook: 'Stakes show up in paychecks, rights, health, and habitats—not only in textbooks.',
      scene: `Today's debates about ${label} land in ordinary choices: what costs more, who gets heard, which risks get exported to the future.`,
      coreFact: `${level === 'deep' ? `Deep view: ${label} distributes gains and pains unevenly—some groups capture upside early while others absorb delay, pollution, or debt. Institutions can amplify or dampen that skew.` : `Everyday view: ${label} connects to at least one personal tradeoff (time, money, safety) and one collective tradeoff (fairness, stability, environment).`} ${scopeHint(scope)}`,
      whyItMatters: 'Motivation carries you through harder cards later in the path.',
      rabbitHole: `Which recent headline about ${label} would you test against this model?`,
      youtubeQuery: `${label} importance`,
    },
    {
      order: 5,
      title: `Missteps and Rabbit Holes on ${label}`,
      domain: 'General Knowledge',
      format: 'Explainer',
      hook: 'Strong learners know the shortcuts that look like mastery.',
      scene: `Popular explainers on ${label} often shrink a messy system into one villain, one chart, or one turning point.`,
      coreFact: `A durable frame treats ${label} as overlapping systems: multiple actors, feedback loops, and data that can lag reality. Compare one primary source (report, dataset, statute) with a polished summary—note what the summary smooths away. That gap is where misconceptions hide.`,
      whyItMatters: 'Avoiding traps saves time when you dive into specialized zones in the feed.',
      rabbitHole: `What open question do specialists still argue about within ${label}?`,
      youtubeQuery: `${label} misconceptions`,
    },
  ]
  return templates.slice(0, length)
}

/**
 * @param {{ topic: string, level?: string, scope?: string, length?: number, focus?: string }} input
 * @returns {MockPathCard[]}
 */
export function generateMockLearningPath(input) {
  const topic = String(input.topic ?? '').trim()
  const level = input.level ?? 'curious'
  const scope = input.scope ?? 'both'
  const length = input.length === 3 ? 3 : 5
  const focus = input.focus ?? ''

  const key = matchTopicKey(slugTopic(topic))
  let cards
  switch (key) {
    case 'rbi-monetary-policy':
      cards = rbiMonetaryPolicyCards({ level, scope, focus })
      break
    case 'rivers-civilizations':
      cards = riversCivilizationsCards({ level, scope, focus })
      break
    case 'parliament-bill':
      cards = parliamentBillCards({ level, scope, focus })
      break
    default:
      cards = genericPathCards({ topic, level, scope, length, focus })
      return cards
  }

  const sliced = cards.slice(0, length).map((card, idx) => ({ ...card, order: idx + 1 }))
  if (focus.trim()) {
    return sliced.map((card, idx) =>
      idx === 0 ? card : { ...card, hook: withFocus(card.hook, focus) },
    )
  }
  return sliced
}

export const LEARN_LEVELS = [
  { id: 'beginner', label: 'Beginner' },
  { id: 'curious', label: 'Curious' },
  { id: 'deep', label: 'Deep Dive' },
]

export const LEARN_SCOPES = [
  { id: 'india', label: 'India' },
  { id: 'global', label: 'Global' },
  { id: 'both', label: 'Both' },
]

export const LEARN_LENGTHS = [
  { id: 3, label: '3 cards' },
  { id: 5, label: '5 cards' },
]
