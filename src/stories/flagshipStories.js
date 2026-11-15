/**
 * Rich narrative catalog entries (format: "narrative").
 * Legacy cards stay in HISTORY_CARDS / additionalLearningCards.js.
 *
 * Sources: authoritative URLs omitted below — links were not verified in this sprint.
 */

/** @typedef {'scene' | 'explanation' | 'turning-point'} StoryBeatType */

/**
 * @param {Record<string, unknown>} card
 * @returns {boolean}
 */
export function isNarrativeCard(card) {
  return card?.format === 'narrative'
}

export const RBI_MONETARY_POLICY_NARRATIVE = {
  id: 'rbi-monetary-policy-narrative',
  title: 'How the RBI decides monetary policy',
  curiosityQuestion: 'When the RBI moves the repo rate, what is it really trying to do?',
  deck:
    'A walk through inflation targets, the Monetary Policy Committee, and the long chain from a policy meeting to your loan EMI.',
  domain: 'Economics',
  topics: ['Reserve Bank of India', 'monetary policy', 'inflation', 'repo rate'],
  anchorYear: 2016,
  readingMinutes: 4,
  publishedAt: '2024-06-01',
  updatedAt: '2024-06-01',
  format: 'narrative',

  coldOpen: {
    heading: 'A Thursday that reaches your wallet—eventually',
    body:
      'Every few weeks, a committee in Mumbai publishes a short statement about interest rates and inflation. Headlines reduce it to “repo cut” or “rate hike.” Behind those words is a chain: banks’ borrowing costs, loan pricing, spending, demand, and finally the prices you notice at the shop. None of that moves in a single afternoon. Understanding the machinery helps you read the news without treating one meeting as a fortune teller for the economy.',
  },

  context: {
    heading: 'The world before inflation targeting',
    body:
      'For decades, India’s central bank juggled multiple goals—growth, stability, government borrowing costs—with less explicit inflation discipline. Global experience showed that when people expect prices to keep rising, those expectations get baked into wages and contracts, making inflation harder to reverse. In the mid-2010s, India adopted a formal inflation target and a committee structure to decide policy in the open, with minutes published later. The Reserve Bank of India still handles banking regulation and financial stability, but the recurring “policy rate” decision now sits inside a clearer inflation framework.',
  },

  centralQuestion:
    'How does a group of six people set one benchmark rate—and why should that rate influence inflation across a continent-sized economy?',

  storyBeats: [
    {
      heading: 'Inflation targeting in plain terms',
      body:
        'Inflation targeting does not mean the RBI picks every price tag. It means policymakers commit to keeping a broad measure of consumer inflation near a announced number over time, using the tools they actually control—mainly interest rates and liquidity—while explaining their outlook in public.',
      type: 'explanation',
    },
    {
      heading: 'Four percent, with room to breathe',
      body:
        'India’s target is 4 percent annual consumer inflation, measured by the Consumer Price Index. Policy is judged against a tolerance band of 2 percentage points on either side—so roughly 2 percent to 6 percent is the operational comfort zone. Breaches outside the band for extended periods trigger accountability mechanisms defined in law, including reports to explain why and how the bank will respond.',
      type: 'explanation',
    },
    {
      heading: 'Meet the Monetary Policy Committee',
      body:
        'The Monetary Policy Committee (MPC) is the body that votes on the policy repo rate. It meets on a fixed schedule—traditionally several times a year unless an emergency meeting is called. After each meeting, the RBI releases a resolution stating the rate decision, the vote count, and a narrative about growth and inflation risks.',
      type: 'scene',
    },
    {
      heading: 'Why six members—and who they are',
      body:
        'The MPC has six members. Three are senior RBI officials, including the Governor, who chairs the committee. Three are external members appointed by the central government, chosen for expertise rather than daily politics. The split is deliberate: insiders bring operational knowledge of banks and markets; outsiders bring independent scrutiny. Six is large enough for diversity of view but small enough to decide on schedule.',
      type: 'explanation',
    },
    {
      heading: 'One member, one vote',
      body:
        'Each member votes on the policy repo rate. The published resolution shows whether the decision was unanimous or split. Dissents are not scandal—they signal genuine uncertainty about data and the future. Markets watch both the rate change and the tone of the statement, because guidance about liquidity and the inflation outlook can matter as much as the quarter-point move itself.',
      type: 'turning-point',
    },
    {
      heading: 'The repo rate, simply',
      body:
        'The repo rate is the interest rate at which the RBI lends short-term money to commercial banks against government securities. Think of it as the price of overnight liquidity from the central bank. When the repo rate rises, marginal funding for banks tends to become costlier; when it falls, the opposite. It is a benchmark at the start of a long transmission chain—not a remote control for every loan already on your books.',
      type: 'explanation',
    },
    {
      heading: 'From committee room to bank counter',
      body:
        'After a policy change, banks reassess deposit rates and lending rates. New home loans and business credit often reprice faster than old fixed-rate contracts. Households may delay big purchases when EMIs rise, or feel slightly richer when rates fall. Firms scale investment and hiring with a lag. Aggregate demand shifts—more spending can push prices up; less spending can cool them. The RBI is trying to steer that demand side when inflation is driven by domestic spending pressures.',
      type: 'scene',
    },
    {
      heading: 'Transmission is slow and leaky',
      body:
        'Textbooks draw a straight line from repo to inflation. Real economies bend the line. Banks may not pass rate cuts fully if they are protecting margins or managing bad loans. Government borrowing can crowd out private credit. Global energy prices can raise transport costs even when domestic rates are unchanged. That is why policymakers talk about “monetary policy transmission” as an ongoing problem—not a solved equation.',
      type: 'explanation',
    },
    {
      heading: 'The growth–inflation trade-off',
      body:
        'Higher rates tend to dampen borrowing and spending, which can ease inflation but also slow job creation and investment. Lower rates can support growth but risk overheating if supply cannot keep up. The MPC does not choose “growth or inflation” once and for all; it balances risks as new data arrive—farm output, global oil, currency moves, and household expectations.',
      type: 'turning-point',
    },
    {
      heading: 'When rate cuts cannot fix the harvest',
      body:
        'Monetary policy works best on demand-side inflation—too much money chasing goods. Supply shocks are different: a poor monsoon, a spike in imported fuel, or supply-chain bottlenecks raise prices without consumers “overspending.” Raising rates aggressively in those moments may hurt growth without quickly fixing vegetable or fuel prices. That is why MPC statements distinguish between transient and persistent pressures, and why fiscal tools—taxes, subsidies, buffer stocks—enter the conversation for supply-side pain.',
      type: 'explanation',
    },
  ],

  consequences: {
    immediate: [
      'Banks and bond markets react the same day; loan rates for new borrowers adjust over weeks.',
      'The rupee and equity markets may move on both the rate decision and the statement’s tone.',
      'Households hear EMI chatter—though existing fixed-rate loans may not change at all.',
    ],
    longTerm: [
      'Inflation expectations anchor when the public believes the target is credible over years.',
      'Investment and savings patterns shift with the average cost of capital across cycles.',
      'Institutional trust in the MPC grows when decisions and minutes align with outcomes—or erodes when targets are missed persistently.',
    ],
  },

  complication: {
    heading: 'One lever, many moving parts',
    body:
      'The RBI can influence conditions under which credit is created; it cannot direct every bank branch, farm mandi, or global commodity market. Fiscal policy, trade flows, and productivity growth also shape inflation. Treating each MPC meeting as the sole author of your economic fate overstates central banking—and underestimates how long the real transmission takes.',
  },

  takeaway:
    'Remember this: the MPC votes on the repo rate to steer demand-side inflation toward a 4 percent target with a 2–6 percent tolerance band—but the path from that vote to prices runs through banks, borrowers, and time, and it weakens when inflation comes from supply shocks rather than excess demand.',

  relatedCardIds: ['inflation-basket', 'money-multiplier', 'opportunity-cost'],

  youtube: {
    id: '0jJKjgE3qfE',
    title: 'RBI monetary policy explained',
    channel: 'Educational explainer (YouTube)',
  },

  sources: [],
}

/** @type {typeof RBI_MONETARY_POLICY_NARRATIVE[]} */
export const FLAGSHIP_NARRATIVES = [RBI_MONETARY_POLICY_NARRATIVE]

/**
 * Attach legacy preview fields so saved cards and normalizeCard stay compatible.
 * @param {typeof RBI_MONETARY_POLICY_NARRATIVE} story
 */
export function narrativeToCatalogFields(story) {
  const coldBody = story.coldOpen?.body ?? ''
  return {
    ...story,
    hook: story.deck ?? '',
    scene: coldBody.slice(0, 280),
    coreFact: story.takeaway ?? '',
    whyItMatters: story.complication?.body ?? '',
    rabbitHole: story.centralQuestion ?? '',
    story: story.takeaway ?? coldBody,
    relevance: story.complication?.body ?? '',
    category: story.domain,
    year: story.anchorYear,
  }
}

export function allFlagshipCatalogEntries() {
  return FLAGSHIP_NARRATIVES.map(narrativeToCatalogFields)
}
