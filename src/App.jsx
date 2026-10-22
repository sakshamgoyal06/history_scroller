import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ADDITIONAL_LEARNING_CARDS } from './additionalLearningCards.js'
import {
  decadeTimelinePercent,
  formatDecadeKeyLabel,
  timelineFieldsForCard,
  uniqueDecadeKeysFromCards,
} from './cardTimeline.js'
import { LEARN_LEVELS, LEARN_SCOPES } from './generateMockLearningPath.js'
import { LearnPathChapters } from './LearnPathChapters.jsx'
import { LearnTopicPanel } from './LearnTopicPanel.jsx'
import { LearningLessonPlaceholder } from './LearningLessonDetail.jsx'
import { MyPathsSection } from './MyPathsSection.jsx'
import { buildDemoPathRecord } from './mockLearningPathAdapter.js'
import {
  generateLesson,
  isForceMockMode,
  isMissingConfigError,
  planLearningPath,
} from './learningPathApi.js'
import {
  createPathRecordFromPlan,
  deletePath,
  getPathById,
  loadActivePathId,
  loadAllPaths,
  markLessonComplete,
  mergeSourcesIntoCatalog,
  setActivePathId,
  touchPathOpened,
  updateLessonInPath,
  upsertPath,
} from './learningPathStorage.js'
import { lessonToDisplayCard, plannedLessonsForActiveTrack } from './lessonToCard.js'
import {
  getLocalDateKey,
  isDailyEditionVisible,
  markEditionCardExplored,
  selectDailyEdition,
} from './dailyEdition.js'
import { allFlagshipCatalogEntries, isNarrativeCard } from './flagshipStories.js'
import { RichStoryDetail } from './RichStoryDetail.jsx'
import { StoryArt, StoryVideo } from './StoryPreviewCard.jsx'
import { PrimaryNavigation } from './components/PrimaryNavigation.jsx'
import { ExplorePanel } from './feed/ExplorePanel.jsx'
import { LearningReel } from './feed/LearningReel.jsx'
import { feedItemFromCatalogCard } from './feed/cardAdapter.js'
import { loadFeedItems } from './feed/feedRepository.js'
import { loadDetailModePreference, saveDetailModePreference } from './feed/feedStorage.js'
import { STORY_YOUTUBE } from './feed/storyYoutube.js'
import { buildPathDripFeedItems } from './feed/pathDrip.js'
import { LibraryPanel } from './library/LibraryPanel.jsx'
import { getZoneById } from './zones/zoneData.js'
import { buildZoneDripFeedItems } from './zones/zoneDripFeed.js'
import { markZoneStepComplete } from './zones/zoneProgress.js'
import { ZoneDetail } from './zones/ZoneDetail.jsx'
import { ZonesPanel } from './zones/ZonesPanel.jsx'
import { setPathDripEnabled, loadPathDripEnabled } from './zones/zoneProgress.js'
import './App.css'

const STORAGE_SAVED = 'history-feed-saved'
const STORAGE_KNOWN = 'history-feed-known'

const FEED_HISTORY_STATE = { view: 'feed', mode: 'forYou' }

function feedItemIdFromLocation() {
  const match = /^#feed\/([^/#?]+)/.exec(window.location.hash)
  return match ? decodeURIComponent(match[1]) : null
}

function zoneIdFromLocation() {
  const match = /^#zone\/([^/#?]+)/.exec(window.location.hash)
  return match ? decodeURIComponent(match[1]) : null
}

function shortPathIdFromLocation() {
  const match = /^#path\/([^/#?]+)/.exec(window.location.hash)
  return match ? decodeURIComponent(match[1]) : null
}

function feedUrl(feedItemId) {
  const base = `${window.location.pathname}${window.location.search}`
  return feedItemId ? `${base}#feed/${encodeURIComponent(feedItemId)}` : base
}

function zoneUrl(zoneId) {
  return `${window.location.pathname}${window.location.search}#zone/${encodeURIComponent(zoneId)}`
}

function shortPathUrl(pathId) {
  return `${window.location.pathname}${window.location.search}#path/${encodeURIComponent(pathId)}`
}

function feedHistoryState(mode = 'forYou', feedItemId = null) {
  return { view: 'feed', mode, feedItemId }
}

function zoneHistoryState(zoneId) {
  return { view: 'zone', zoneId }
}

function storyHistoryState(id, returnFeed = null) {
  return returnFeed ? { view: 'story', id, returnFeed } : { view: 'story', id }
}

function storyUrl(id) {
  return `${window.location.pathname}${window.location.search}#story/${id}`
}

function storyIdFromLocation() {
  const match = /^#story\/([^/#?]+)/.exec(window.location.hash)
  return match?.[1] ?? null
}

function learnHomeUrl() {
  return `${window.location.pathname}${window.location.search}#learn`
}

function learnPathUrl(pathId) {
  return `${window.location.pathname}${window.location.search}#learn/path/${encodeURIComponent(pathId)}`
}

function learnPathIdFromLocation() {
  const match = /^#learn\/path\/([^/#?]+)/.exec(window.location.hash)
  return match ? decodeURIComponent(match[1]) : null
}

function learnHomeHistoryState() {
  return { view: 'learnHome' }
}

function learnPathHistoryState(pathId) {
  return { view: 'learnPath', pathId }
}

/** Catalog cards: legacy `category`, `story`, `relevance` plus normalized learning fields. */
const HISTORY_CARDS = [
  {
    id: 'alexandria',
    title: 'The Library of Alexandria',
    category: 'Ancient World',
    hook: 'A legend of lost knowledge that still shapes how we fund science today.',
    scene:
      'For centuries, Alexandria was a port where scholars copied scrolls and argued over astronomy, medicine, and philosophy.',
    factBullets: [
      'The library was an institution tied to royal patronage—not one building we can fully reconstruct from digs.',
      'Scrolls came from Greek, Hebrew, Persian, and Indian traditions through translation and trade.',
      'Ancient sources disagree on fires and wars that damaged collections; archaeology gives only fragments.',
      'The myth survived the ruins and helped later cultures treat shared knowledge as a public good.',
    ],
    whyItMatters:
      'Open-access archives and digital backups still ask who pays so one disaster cannot erase collective memory.',
    rabbitHole:
      'Which surviving ancient library—not Alexandria—actually left the largest trace on texts you can read today?',
    story:
      'The Library of Alexandria was less a single building than a evolving institution tied to Ptolemaic Egypt and later Roman rule. Scholars copied scrolls, debated astronomy, and translated texts from Hebrew, Persian, and Indian traditions. Ancient writers disagree on when fires and conflict destroyed collections—Caesar’s siege, Aurelian’s revolts, and later religious transitions all appear in the record. Archaeology offers only fragments, yet the library’s myth shaped how later cultures imagined knowledge as a public good worth protecting. Medieval monasteries, Islamic houses of wisdom, and modern universities all echo that ideal. The story persists because it names a fear we still feel: that one accident can erase centuries of collective memory and leave humanity starting over in the dark.',
    relevance:
      'Debates over open access, climate archives, and digital preservation replay the same question: who pays to keep humanity’s memory safe?',
  },
  {
    id: 'roman-concrete',
    title: 'Roman Concrete That Outlasted Empire',
    category: 'Ancient World',
    hook: 'Engineers today are reverse-engineering a recipe the Romans never wrote down.',
    scene:
      'Harbor breakwaters and the Pantheon dome still stand while much modern Portland cement cracks within decades.',
    story:
      'Roman concrete structures such as the Pantheon dome and harbor breakwaters have endured for two millennia while modern Portland cement often cracks within decades. Recent studies suggest volcanic ash pozzolana and seawater triggered long-term crystal growth that heals micro-fractures—a process engineers now try to mimic in green cements. Romans treated building as empirical craft passed through guilds rather than published formulas, so the “recipe” lived in practice, not textbooks. That gap explains why Renaissance builders admired ruins without reproducing them. The contrast highlights how infrastructure knowledge can vanish even when the buildings remain standing. Today’s search for durable low-carbon materials turns back to those ash-rich mixes, proving that sustainability sometimes means recovering old chemistry rather than inventing entirely new compounds from scratch every generation.',
    relevance:
      'Climate policy pushes low-carbon cement; Roman methods offer models that pair longevity with lower emissions.',
    rabbitHole:
      'Why did medieval Europeans quarry Roman ruins for lime instead of copying their mortar chemistry?',
  },
  {
    id: 'silk-road',
    title: 'The Silk Road Was Never One Road',
    category: 'Ancient World',
    hook: 'Caravans, ships, and credit networks linked continents long before “globalization” became a buzzword.',
    scene:
      'Oasis cities and ocean ports tied steppe, desert, and maritime lanes into overlapping trade circuits across Afro-Eurasia.',
    story:
      'Historians now speak of Silk Roads in the plural: shifting routes across steppes, deserts, and Indian Ocean ports that moved silk, spices, silver, Buddhism, Islam, and plague alike. No single emperor controlled the whole network; instead, oasis cities, nomadic confederations, and merchant families negotiated passage. Paper and printing traveled west while glass and grapes moved east. Disease followed the same paths—the Black Death’s speed reflects how connected Afro-Eurasia already was in the fourteenth century. Romantic images of camel caravans capture one slice, but maritime lanes often carried higher volume with lower cost per bolt of cloth. Understanding the network as many overlapping circuits helps explain why trade wars, sanctions, and chokepoints like the Strait of Malacca still dominate headlines: logistics is geopolitics with a ledger.',
    relevance:
      'Supply-chain resilience and “friend-shoring” are modern names for ancient routing dilemmas around trust, distance, and tolls.',
    rabbitHole:
      'How did Sogdian merchants act as bankers across languages without a shared central bank?',
  },
  {
    id: 'black-death',
    title: 'When the Black Death Rewired Europe',
    category: 'Medieval',
    hook: 'A pandemic did not just kill—it reshaped wages, faith, and the map of power.',
    scene:
      'In the mid-1300s, plague moved along trade routes and hit crowded towns and farms across Eurasia within a few years.',
    factBullets: [
      'Estimates suggest roughly a third of Europe’s people died in the first wave; regions varied widely.',
      'Fewer workers meant higher wages and weaker serf obligations in many places.',
      'Cities saw guilds and councils gain leverage as elites competed for mobile taxpayers.',
      'Art, sermons, and riots reflected both fear and anger at institutions that could not stop the dying.',
    ],
    whyItMatters:
      'Sudden death still reshapes labor markets and trust in institutions—historians call it shock that accelerates trends already underway.',
    rabbitHole:
      'Did plague-driven wage gains in England truly begin the long decline of serfdom, or did law change first?',
    story:
      'The plague that swept Eurasia in the mid-fourteenth century killed perhaps a third of Europe’s population within a few years. Labor scarcity suddenly gave surviving peasants leverage: wages rose, serfdom weakened, and landlords struggled to enforce old dues. In cities, guilds and councils gained voice as elites competed for taxpayers who could flee. Religious fervor spiked—flagellants, scapegoating of minorities, and vivid art of death—yet institutional Christianity also faced awkward questions about why prayers failed. The demographic shock accelerated shifts already underway, including the spread of gunpowder weapons and the appeal of printed texts after Gutenberg. Historians debate how much the plague “caused” versus “accelerated,” but the pattern is familiar: mass mortality rearranges who must be paid, who can organize, and which stories societies tell to make sense of sudden loss.',
    relevance:
      'Post-COVID labor shortages and housing debates echo medieval negotiations over who owes whom a living.',
  },
  {
    id: 'magna-carta',
    title: 'Magna Carta’s Messy Birth',
    category: 'Medieval',
    hook: 'A peace treaty born from baronial rage became a symbol lawyers far away would later reinvent.',
    scene:
      'In 1215 rebellious English barons forced King John to seal concessions at Runnymede—mostly feudal fines, not abstract liberty.',
    story:
      'King John sealed Magna Carta in 1215 not to proclaim universal rights but to buy time from rebellious barons furious over taxes and failed wars in France. Most clauses concern feudal fines, fish weirs, and widow remarriage—not abstract liberty. The document was annulled within weeks, reissued in edited forms, and largely forgotten until seventeenth-century English lawyers mined it during fights with Stuart kings. American revolutionaries and civil-rights advocates later quoted those reinterpretations more than the original text. The gap between medieval grievance list and modern myth shows how societies retro-fit founding stories when they need limits on power. Magna Carta matters today less as a precise law than as evidence that forcing rulers to sign concessions can seed centuries of argument about whether anyone, including executives, stands above agreed rules.',
    relevance:
      'Executive orders, emergency powers, and court challenges still circle the question Magna Carta raised: who checks the checker?',
    rabbitHole:
      'Which Magna Carta clause stayed on English statute books the longest without being repealed?',
  },
  {
    id: 'gothic-cathedral',
    title: 'Gothic Cathedrals as Public Works',
    category: 'Medieval',
    hook: 'Stone lace and stained glass were also Europe’s largest crowd-funded infrastructure projects.',
    scene:
      'For generations, cathedral cities raised pointed arches and bright choirs with guild gifts, indulgence sales, and skilled migrant labor.',
    story:
      'Building a Gothic cathedral could span generations, employing quarrymen, glassmakers, and sculptors whose names rarely survived. Cities competed for taller naves and brighter choirs, using pointed arches and flying buttresses to redirect weight outward, freeing walls for enormous windows. Funding mixed bishoprics, guild donations, indulgence sales, and local pride—everyone saw the skyline rise. Laborers learned on site, spreading techniques region to region like an open-source codebase. Accidents, wars, and funding gaps left many churches half-finished for centuries, reminding us that even “timeless” monuments are incremental. The spiritual goal was to lift eyes toward transcendence, but the economic effect was equally real: steady wages, pilgrimage traffic, and craft specialization. Modern megaprojects—from stadiums to transit hubs—reuse that blend of civic identity, debt, and the promise that future visitors will admire what present taxpayers endure.',
    relevance:
      'Infrastructure bills still sell bridges and parks as shared heritage, not just steel and concrete.',
    rabbitHole:
      'How did medieval builders calculate load without modern structural math—and where did they fail?',
  },
  {
    id: 'printing-press',
    title: 'Gutenberg’s Press and the Info Explosion',
    category: 'Renaissance',
    hook: 'Movable type did not create literacy overnight, but it changed who could argue in public.',
    scene:
      'Around 1450 in Mainz, craftsmen combined metal type, oil ink, and a screw press to print pages in quantity.',
    factBullets: [
      'Early profits came from Bibles and indulgence forms, then pamphlets and maps spread in weeks, not months.',
      'Rulers and churches used print for propaganda—and quickly added censorship and licensing.',
      'Literacy rose slowly; the bigger shift was many competing voices entering public debate.',
      'Historians compare print to the internet because copying got cheap and elites lost control of the narrative.',
    ],
    whyItMatters:
      'Every cheap-copy medium since—from radio to social feeds—reopens fights over rumor, authorship, and amplification.',
    rabbitHole:
      'Which technology—print or postal networks—spread Reformation ideas faster across Germany?',
    story:
      'Johannes Gutenberg’s mid-fifteenth-century press combined oil-based ink, adjustable metal type, and a modified wine press to reproduce texts faster than scribes could copy them. Bibles and indulgence forms paid early bills, yet the real shift was pamphlets, maps, and scientific diagrams reaching merchants, students, and reformers within weeks. Catholic and Protestant leaders alike harnessed print for propaganda while censorship and licensing followed almost immediately—every information revolution triggers a counter-revolution in control. Literacy rates climbed slowly; the deeper change was the volume of competing voices. Empires used printed atlases to claim territory; alchemists shared recipes; women readers entered new literary markets. Historians compare the press to the internet not because effects were identical, but because both collapsed copying costs and forced elites to share narrative power with strangers they could not fully monitor or silence.',
    relevance:
      'Social feeds and AI-generated text replay Gutenberg-era fights over authorship, rumor, and who gets amplified.',
  },
  {
    id: 'constantinople-1453',
    title: 'The Fall of Constantinople, 1453',
    category: 'Renaissance',
    hook: 'Cannons breached ancient walls—and rerouted minds, maps, and migration.',
    scene:
      'Ottoman bronze guns punched through Constantinople’s Theodosian walls during a seven-week siege in 1453.',
    story:
      'Ottoman forces under Mehmed II captured Constantinople after a seven-week siege that showcased enormous bronze guns punching holes through Theodosian walls once deemed impregnable. The city’s fall ended the Eastern Roman Empire, yet Greek scholars had already been fleeing west with manuscripts that fed Italian humanism. Ottoman sultans preserved many churches as mosques while rebuilding the urban economy, positioning the city as a hub between Europe, Asia, and Africa. Christian Europe interpreted the loss as apocalyptic, spurring exploration to find new trade routes and allies. Russian rulers later claimed Moscow as a “third Rome,” weaving religion into geopolitics for centuries. The event shows how a single siege can symbolize epoch change even while daily life—markets, families, neighborhoods—continues under new flags. Borders on maps redraw faster than identities in streets.',
    relevance:
      'Wars that seize capitals still send refugee scholars, art, and code repositories across borders within days.',
    rabbitHole:
      'How many Greek scholars actually reached Italy before 1453 versus after—and does it matter for Renaissance timing?',
  },
  {
    id: 'da-vinci-notebooks',
    title: 'Leonardo’s Notebooks as R&D Labs',
    category: 'Renaissance',
    hook: 'Sketches of wings and waterways reveal a mind treating art and engineering as one discipline.',
    scene:
      'Mirror writing, anatomy studies, and machine sketches filled Leonardo’s notebooks while patrons funded court spectacles and siege designs.',
    story:
      'Leonardo da Vinci filled thousands of pages with mirror writing, anatomy studies, hydraulic gears, and theatrical machines for court spectacles. Patronage from Milan and Florence funded experiments without modern patents; secrecy protected competitive advantage in siege engines and pageantry alike. Many designs—helicopter precursors, diving suits—were never built at scale, yet they document systematic observation: dissections informed painting muscles, while painting taught him how light reveals form. After his death, scattered notebooks escaped publication for centuries, so innovations died with the pages. That loss underscores how progress depends on circulation, not genius alone. Renaissance workshops functioned like startups: iterate quickly, demo for investors, pivot when wars shifted budgets. Leonardo’s blend of visualization and measurement anticipates today’s design thinking, reminding us that breakthroughs often start as marginal doodles someone almost threw away.',
    relevance:
      'Lab notebooks, Git commits, and design figma files are modern heirs to Leonardo’s marginalia—if anyone archives them.',
    rabbitHole:
      'Which of Leonardo’s built machines actually worked under test, not just on paper?',
  },
  {
    id: 'scientific-revolution',
    title: 'The Scientific Revolution’s Quiet Radicalism',
    category: 'Enlightenment',
    hook: 'Measuring planets and pumping air out of jars challenged who got to declare truth.',
    scene:
      'Telescopes, elliptical orbits, and vacuum pumps let observers test claims against measurement—not only ancient authority.',
    story:
      'From Copernicus to Newton, sixteenth- and seventeenth-century thinkers proposed that mathematics and experiment could describe nature more reliably than ancient authority alone. Galileo’s telescopes, Kepler’s ellipses, and Boyle’s vacuum pumps were tools, but also political acts: they implied that any careful observer might check claims. Institutions like the Royal Society formalized peer critique—letters, demonstrations, replicated trials—long before modern journals. Church and state sometimes punished heterodox views, yet merchants funding navigation and mining wanted accurate tables regardless of theology. The revolution was uneven; alchemy and astrology lingered beside calculus. Still, the shift toward testable hypotheses seeded technologies from precision clocks to industrial chemistry. Enlightenment philosophes exported the story as triumph over superstition, simplifying messy debates. What endured was a method: show your work, invite falsification, and treat nature as something humans can model without exhausting its mystery.',
    relevance:
      'Climate models and vaccine trials inherit the same social contract: trust requires transparent methods others can rerun.',
    rabbitHole:
      'Did Newton’s alchemy manuscripts change how historians date the “scientific” Newton we teach in schools?',
  },
  {
    id: 'enlightenment-salons',
    title: 'Salons Where Ideas Went Viral',
    category: 'Enlightenment',
    hook: 'Before Twitter threads, hosted conversations spread reform across European cities.',
    scene:
      'In eighteenth-century Paris and London, hostesses seated writers, diplomats, and financiers in private parlors to debate reform.',
    story:
      'In eighteenth-century Paris and London, salons gathered writers, financiers, diplomats, and aristocrats in private parlors to debate commerce, education, and legal reform. Hostesses such as Madame Geoffrin curated seating so rivals might actually listen, turning status into a platform. Encyclopedists circulated proofs before publication; music and theater provided cover for political barbs censorship would otherwise ban. Salons were exclusive—race, gender, and class limits meant most people never entered—yet ideas leaked through pamphlets and correspondence networks that functioned like slow-motion feeds. Monarchs sometimes patronized the same thinkers they later imprisoned when revolutions erupted. The format shows how intellectual change often rides social infrastructure: who invites whom, who pays printing costs, who translates across languages. Public sphere theory grew from these imperfect rooms, reminding us that “open discourse” has always depended on gatekeepers willing to open doors at all.',
    relevance:
      'Podcasts, Substacks, and invite-only group chats reproduce salon dynamics—with similar exclusion risks.',
    rabbitHole:
      'Which Enlightenment policy change first traced directly to a salon introduction rather than a published book?',
  },
  {
    id: 'haitian-revolution',
    title: 'Haiti’s Revolution Rewrote Freedom',
    category: 'Enlightenment',
    hook: 'Enslaved rebels defeated empires and forced the Atlantic world to confront its own slogans.',
    scene:
      'On Saint-Domingue’s sugar plantations, uprisings from 1791 onward defeated French, British, and Spanish forces by 1804.',
    story:
      'The Haitian Revolution (1791–1804) began with uprisings on sugar plantations and ended with an independent Black republic defeating French, British, and Spanish forces. Leaders like Toussaint Louverture and Jean-Jacques Dessalines navigated alliances, constitutions, and brutal counterinsurgency while Europe debated liberty in Paris. Victory terrified slaveholding nations, prompting embargoes, debt imposed on Haiti for recognition, and silencing in textbooks for generations. Yet the event proved Enlightenment rhetoric could not be contained to white property owners; colonized people repurposed the same language as a weapon. Independence came at catastrophic cost—war, famine, and later authoritarian rule—but it permanently shifted fear and strategy in the Americas, including Napoleon’s sale of Louisiana. Haiti’s story challenges narratives that treat 1776 or 1789 as freedom’s finish line. It remains a case study in how international finance and racism punish victories that threaten profitable atrocities.',
    relevance:
      'Reparations debates and debt relief for Haiti connect directly to nineteenth-century punishment for successful emancipation.',
    rabbitHole:
      'How much did fear of Haiti’s example shape the timing of abolition in British colonies versus moral campaigns alone?',
  },
  {
    id: 'industrial-mills',
    title: 'Mill Towns and the Clock of Industry',
    category: 'Modern Era',
    hook: 'Factory bells synchronized bodies before smartphones synchronized attention.',
    scene:
      'Steam-powered textile mills drew workers into company towns where bells, piece rates, and shift work replaced craft autonomy.',
    story:
      'Britain’s Industrial Revolution concentrated workers in textile mills where steam power and division of labor boosted output while shortening craft autonomy. Company towns supplied housing tied to wages; child labor and sixteen-hour shifts drew reformers who photographed injuries and pushed early factory acts. Unions formed slowly amid criminalization of “combinations,” yet strikes spread along rail lines carrying news faster than magistrates could respond. Pollution darkened rivers; urban populations exploded without sewers, feeding cholera cycles later solved by public health engineering. Owners argued markets would self-correct; critics replied that bargaining power was never equal when hunger waited outside the gate. The era forged modern GDP growth curves and modern inequality debates simultaneously. Understanding mills clarifies why labor law, zoning, and environmental regulation exist: they respond to real harms when production scales faster than community guardrails.',
    relevance:
      'Warehouse algorithms and gig-worker ratings extend clock discipline into pockets via apps instead of bell towers.',
    rabbitHole:
      'Which single factory reform law measurably cut child injury rates first—and how was it enforced?',
  },
  {
    id: 'ww1-telegraph',
    title: 'World War I as a Wired War',
    category: 'Modern Era',
    hook: 'Telegraphs and railways turned strategy into a race against timetables—and tragedy.',
    scene:
      'Mobilization plans tied army deployments to railway schedules while telegraph cables compressed diplomatic decision cycles.',
    story:
      'World War I linked mobilization plans to railway schedules so tightly that diplomatic delays could not slow mechanical deployment once set in motion. Telegraph cables carried orders across continents within minutes, compressing decision cycles while misread messages still sent millions marching. Trench stalemate emerged partly because defense benefited from barbed wire, machine guns, and rapid artillery correction via phone lines. Propaganda offices used mass print and early film to sustain morale; poets and nurses documented psychological wounds medicine barely understood. Empires collapsed—Ottoman, Austro-Hungarian, Russian—redrawing maps through treaties drawn far from affected villages. Chemical weapons, colonial troop levies, and blockade starvation showed total war consuming civilians as resources. The conflict’s technology story warns that connectivity accelerates both coordination and catastrophe when leaders treat mobilization scripts as destiny rather than choice.',
    relevance:
      'Cyber commands and instant satellite imagery update WWI’s lesson: speed without pause breeds escalation traps.',
    rabbitHole:
      'Did the July Crisis unfold faster because telegraphs removed sleep gaps diplomats once relied on?',
  },
  {
    id: 'berlin-wall',
    title: 'Berlin Wall as Cold War Interface',
    category: 'Modern Era',
    hook: 'Concrete split a city—and became the screen onto which rivals projected their stories.',
    scene:
      'East Berlin sealed crossing points overnight in August 1961, splitting streets, families, and even ghosted subway stations.',
    story:
      'East Germany sealed Berlin overnight in August 1961 to stop mass emigration westward, turning streets into death strips guarded by towers and dogs. The wall was less a military fortification than a migration dam: it trapped people inside a system losing legitimacy through comparison. Western media turned graffiti-covered segments into symbols of creative freedom; Eastern propaganda called it an antifascist barrier. Families split; subway lines ghosted through sealed stations. Over decades, micro-protests—church groups, punk bands, environmental circles—eroded trust in the regime until 1989 checkpoints opened amid confusion and celebration. Pieces of the wall now sit in museums worldwide, sometimes romanticizing collapse while forgetting economic shocks that followed reunification. The episode teaches that borders are information tools: they signal who may leave, who must stay, and which version of history counts on each side of the concrete.',
    relevance:
      'Border walls and visa regimes still manage inequality of movement more than military invasion risk.',
    rabbitHole:
      'How much did satellite TV and VHS tapes undermine East German loyalty before the wall physically fell?',
  },
  {
    id: 'germ-theory',
    title: 'Germ Theory and the Invisible Enemy',
    category: 'Science & Invention',
    hook: 'Handwashing went from ridicule to hospital policy once microbes became visible enough to believe.',
    scene:
      'In 1840s Vienna, Ignaz Semmelweis cut maternity deaths with chlorine handwashing while many physicians dismissed the practice.',
    story:
      'Ignaz Semmelweis noticed maternity wards with doctor-led autopsies had higher death rates than midwife wards; chlorine handwashing cut fatalities dramatically in 1840s Vienna. Contemporaries mocked him—without a accepted mechanism, the practice seemed superstitious. Pasteur and Koch later linked specific bacteria to disease, giving public health a target: sewage separation, pasteurized milk, vaccination campaigns. Cities rebuilt water systems; surgeons adopted antiseptic routines that made complex operations survivable. Germ theory also justified coercive measures—from quarantines to residential redlining labeled “hygiene”—showing how science interfaces with power. Acceptance took decades because it required retraining professions whose status rested on old humoral models. The arc from Semmelweis’s ostracism to COVID-era hand-sanitizer stations illustrates how evidence alone rarely changes behavior without institutions, storytelling, and peer pressure aligned behind inconvenient truths.',
    relevance:
      'Misinformation fights during pandemics replay nineteenth-century battles over who counts as an credible expert voice.',
    rabbitHole:
      'Why did germ theory spread faster in colonial army hospitals than in European civilian clinics at first?',
  },
  {
    id: 'ada-lovelace',
    title: 'Ada Lovelace Imagined Software',
    category: 'Science & Invention',
    hook: 'Before computers existed, she described machines that could compose music—not just crunch numbers.',
    scene:
      'In the 1840s Ada Lovelace annotated Charles Babbage’s Analytical Engine and described instructions separate from the hardware itself.',
    story:
      'Ada Lovelace, working with Charles Babbage’s Analytical Engine designs in the 1840s, wrote notes envisioning a device manipulating symbols beyond arithmetic—music, logic, potentially any rule-based pattern. She distinguished the machine’s hardware from the instructions fed into it, an early sketch of what later generations called software. Babbage never built the full engine; Lovelace’s ideas circulated quietly among mathematicians until twentieth-century programmers rediscovered them during debates over women’s roles in computing. Her social world mixed Romantic poetry and industrial ambition—Byron’s daughter meeting factory precision. Historians caution against mythmaking: Lovelace was one voice in a broader conversation, and some technical claims remain disputed. Still, her emphasis on creativity within computation foreshadowed modern coding culture where art and engineering share repositories. Remembering her clarifies that imagination often precedes hardware by a century.',
    relevance:
      'Prompt engineering and generative AI reopen Lovelace’s question: where does instruction end and authorship begin?',
    rabbitHole:
      'Which part of Lovelace’s “Note G” do historians still argue was originally Babbage’s idea versus hers?',
  },
  {
    id: 'green-revolution',
    title: 'The Green Revolution’s Double Harvest',
    category: 'Science & Invention',
    hook: 'High-yield wheat fed millions—and reshaped politics of water, seed, and debt.',
    scene:
      'Dwarf wheat and rice varieties paired with fertilizer and irrigation doubled yields across Mexico, India, and the Philippines in the 1960s–70s.',
    story:
      'In the 1960s and 70s, researchers led by Norman Borlaug bred dwarf wheat and rice varieties that responded heavily to fertilizer, dramatically raising yields in Mexico, India, and the Philippines. Famines eased; governments celebrated self-sufficiency. Yet the package required irrigation, pesticides, and credit for inputs—benefiting large farmers first and deepening groundwater stress where pumps ran unchecked. Seed sovereignty debates erupted when proprietary strains replaced locally adapted landraces farmers once saved each season. The revolution prevented starvation for many while tying food security to fossil-fuel-based inputs now vulnerable to climate shocks. Critics note distribution, not production alone, causes hunger; supporters point to lives saved before social safety nets caught up. The story is a template for tech fixes with uneven dividends: breakthrough biology plus institutions determine whether abundance becomes justice or new dependency chains exported through trade agreements.',
    relevance:
      'CRISPR crops and vertical farms repeat the question: who owns the seed when the climate turns hostile?',
    rabbitHole:
      'Did Indian Punjab’s water table collapse begin during Green Revolution expansion or earlier canal policies?',
  },
  {
    id: 'jazz-migration',
    title: 'Jazz and the Great Migration',
    category: 'Culture & Society',
    domain: 'History',
    hook: 'Sound carried stories north when Jim Crow blocked so many other paths.',
    scene:
      'Between the 1910s and 1970s, Black musicians carried blues and brass traditions into northern cities, clubs, and recording studios.',
    story:
      'Between the 1910s and 1970s, millions of African Americans left the rural South for northern and western cities, carrying musical traditions that fused blues, ragtime, brass bands, and Caribbean rhythms into jazz. Chicago, Kansas City, and New York clubs became laboratories where improvisation met recording technology, spreading Louis Armstrong and Duke Ellington to radios worldwide. Migration was economic and political escape—from sharecropping contracts to factory wages—yet redlining and violence met arrivals in new forms. Jazz became both entertainment and subtle commentary: swing for dance floors, bebop for virtuosos asserting intellectual freedom. Critics debated authenticity while audiences crossed color lines in segregated rooms. The genre influenced classical composers, film scores, and later hip-hop sampling ethics. Cultural history here shows movement of people reshapes art faster than any single genius narrative; infrastructure—clubs, labels, trains—matters as much as melody.',
    relevance:
      'Global streaming playlists still trace diaspora paths jazz pioneered, raising who profits from roots music today.',
    rabbitHole:
      'Which 1920s recording technology change did more for jazz diffusion: radio or the electric microphone?',
  },
  {
    id: 'un-declaration',
    title: 'Writing Universal Human Rights in 1948',
    category: 'Culture & Society',
    hook: 'Forty-eight nations signed aspirations—not enforceable law—and changed the vocabulary of justice.',
    scene:
      'In 1948 UN committees drafted thirty articles on dignity and rights that member states endorsed without binding courts attached.',
    story:
      'The Universal Declaration of Human Rights emerged from United Nations committees chaired by Eleanor Roosevelt alongside diplomats from Chile, China, Lebanon, and others drafting articles on dignity, speech, asylum, and education. It was not a treaty with courts attached; superpowers still held empires and segregated citizens at home. Yet the text gave activists a shared lexicon to challenge apartheid, gender discrimination, and torture with phrases governments themselves had endorsed on paper. Cold War rivals each claimed to fulfill rights while accusing opponents of violations—a propaganda game that nonetheless legitimized monitoring NGOs. Later covenants tried to add teeth through reporting mechanisms, though enforcement remains uneven. The declaration’s power is rhetorical and legal scaffolding: courts cite it; movements wave it. Studying its birth reveals how compromise language—“free and equal”—can become a weapon for the marginalized when archives prove hypocrisy.',
    relevance:
      'Digital privacy charters and AI ethics frameworks copy the UDHR playbook: declare norms before enforcement exists.',
    rabbitHole:
      'Which UDHR article provoked the most delegate walkouts during drafting—and what compromise survived?',
  },
  ...ADDITIONAL_LEARNING_CARDS,
  ...allFlagshipCatalogEntries(),
]

const LEARNING_DOMAINS = [
  'History',
  'Economics',
  'Geography',
  'Civics',
  'Technology',
  'Current Affairs',
  'Science',
  'General Knowledge',
]

const CATEGORY_TO_DOMAIN = {
  'Ancient World': 'History',
  Medieval: 'History',
  Renaissance: 'History',
  Enlightenment: 'History',
  'Modern Era': 'History',
  'Science & Invention': 'Science',
  'Culture & Society': 'Civics',
}

const CARD_DOMAIN_BY_ID = {
  'silk-road': 'Geography',
  'roman-concrete': 'Technology',
  'industrial-mills': 'Economics',
  'green-revolution': 'Economics',
  'ada-lovelace': 'Technology',
  'un-declaration': 'Civics',
}

const CARD_FORMAT_BY_ID = {
  'silk-road': 'Map',
  'magna-carta': 'Institution',
  'gothic-cathedral': 'Institution',
  'un-declaration': 'Institution',
  'constantinople-1453': 'Timeline',
}

function firstSentence(text) {
  const trimmed = String(text ?? '').trim()
  if (!trimmed) return ''
  const match = /^([\s\S]+?[.!?])(?:\s|$)/u.exec(trimmed)
  return match ? match[1] : trimmed.slice(0, 220)
}

/** @param {Record<string, unknown>} card */
function normalizeCard(card) {
  const domain =
    card.domain ??
    CARD_DOMAIN_BY_ID[card.id] ??
    CATEGORY_TO_DOMAIN[card.category] ??
    'History'
  const format = card.format ?? CARD_FORMAT_BY_ID[card.id] ?? 'Story'
  const factBullets = Array.isArray(card.factBullets)
    ? card.factBullets.filter((line) => typeof line === 'string' && line.trim())
    : []
  const coreFact =
    card.coreFact ??
    (factBullets.length > 0 ? factBullets.join(' ') : (card.story ?? ''))
  const whyItMatters = card.whyItMatters ?? card.relevance ?? ''
  const hook =
    card.format === 'narrative' ? (card.deck ?? card.hook ?? '') : (card.hook ?? '')
  const scene =
    card.scene ??
    (card.format === 'narrative' && card.coldOpen?.body
      ? firstSentence(card.coldOpen.body)
      : firstSentence(coreFact))
  const sources = Array.isArray(card.sources) ? card.sources : []

  const timeline = timelineFieldsForCard(card)

  return {
    ...card,
    domain,
    format,
    hook,
    scene,
    coreFact,
    factBullets,
    whyItMatters,
    sources,
    story: coreFact,
    relevance: whyItMatters,
    ...(timeline ?? {}),
  }
}

function detailFactBullets(card) {
  if (card.factBullets?.length) return card.factBullets
  const text = (card.coreFact ?? card.story ?? '').trim()
  if (!text) return []
  if (text.length <= 260) return [text]
  const sentences =
    text.match(/[^.!?]+[.!?]+(?:\s|$)/gu)?.map((s) => s.trim()).filter(Boolean) ??
    []
  if (sentences.length > 1) return sentences.slice(0, 6)
  return [text]
}

function StoryDetailHero({ card, badges }) {
  return (
    <div className="story-detail-hero">
      <StoryArt image={card.image} title={card.title} variant="detail" />
      <div className="story-detail-hero-body">
        <div className="story-card-labels">
          <span className="category">{card.domain ?? card.category}</span>
          {card.decadeLabel ? (
            <span className="decade-tag">{card.decadeLabel}</span>
          ) : null}
          {card.format ? <span className="format-label">{card.format}</span> : null}
        </div>
        <h2 className="story-detail-title">{card.title}</h2>
        {badges}
      </div>
    </div>
  )
}

function StoryDetailSections({ card }) {
  const facts = detailFactBullets(card)
  const setup = card.scene?.trim()
  const hook = card.hook?.trim()
  const why = (card.whyItMatters ?? card.relevance)?.trim()
  const rabbit = card.rabbitHole?.trim()

  return (
    <div className="story-detail-sections">
      {hook ? (
        <section className="story-section">
          <h3 className="story-section-label">Hook</h3>
          <p className="story-section-body story-section-body--hook">{hook}</p>
        </section>
      ) : null}
      {setup ? (
        <section className="story-section">
          <h3 className="story-section-label">The setup</h3>
          <p className="story-section-body">{setup}</p>
        </section>
      ) : null}
      {facts.length > 0 ? (
        <section className="story-section">
          <h3 className="story-section-label">The fact</h3>
          {facts.length === 1 ? (
            <p className="story-section-body">{facts[0]}</p>
          ) : (
            <ul className="story-fact-list">
              {facts.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
      {why ? (
        <section className="story-section story-section--matters">
          <h3 className="story-section-label">Why it matters</h3>
          <p className="story-section-body">{why}</p>
        </section>
      ) : null}
      {rabbit ? (
        <section className="story-section story-section--rabbit">
          <h3 className="story-section-label">Rabbit hole</h3>
          <p className="story-section-body story-section-body--rabbit">{rabbit}</p>
          <StoryVideo youtubeId={card.youtubeId} title={card.title} />
        </section>
      ) : null}
    </div>
  )
}

for (const card of HISTORY_CARDS) {
  card.image = `/stories/${card.id}.svg`
  card.youtubeId = STORY_YOUTUBE[card.id] ?? card.youtube?.id ?? null
  Object.assign(card, normalizeCard(card))
}

function findLessonCardAcrossPaths(id, pathCards, paths) {
  const fromActive = pathCards?.find((c) => c.id === id)
  if (fromActive) return fromActive
  for (const pathRecord of paths) {
    for (const track of pathRecord.course?.tracks ?? []) {
      const lesson = track.lessons.find((l) => l.id === id)
      if (lesson) {
        return lessonToDisplayCard({
          pathRecord,
          trackId: track.id,
          lesson,
          trackTitle: track.title,
          trackLessonCount: track.lessons.length,
        })
      }
    }
  }
  return null
}

function cardByIdFromPools(id, pathCards, paths) {
  const catalog = HISTORY_CARDS.find((c) => c.id === id)
  if (catalog) return catalog
  return findLessonCardAcrossPaths(id, pathCards, paths)
}

function uiStateFromPlan(plan) {
  if (plan.scopeDecision === 'needs_narrowing') return 'needs_clarification'
  if (plan.scopeDecision === 'multi_track') return 'multi_track_proposed'
  return 'single_path_proposed'
}

/** Legacy era/topic labels on original catalog cards (list-panel filter). */
const TOPIC_LIST = [
  ...new Set(
    HISTORY_CARDS.map((c) => c.category).filter((topic) => typeof topic === 'string' && topic),
  ),
].sort((a, b) => a.localeCompare(b))

const CARD_BY_ID = new Map(HISTORY_CARDS.map((c) => [c.id, c]))

function recommendNextCard(currentId, knownIds) {
  const idx = HISTORY_CARDS.findIndex((c) => c.id === currentId)
  if (idx < 0) return null
  const current = HISTORY_CARDS[idx]
  const domain = current.domain

  for (let step = 1; step <= HISTORY_CARDS.length; step += 1) {
    const candidate = HISTORY_CARDS[(idx + step) % HISTORY_CARDS.length]
    if (candidate.domain === domain && !knownIds.has(candidate.id)) {
      return candidate
    }
  }
  for (let step = 1; step <= HISTORY_CARDS.length; step += 1) {
    const candidate = HISTORY_CARDS[(idx + step) % HISTORY_CARDS.length]
    if (candidate.id !== currentId) return candidate
  }
  return null
}

function TimelineFilter({ decades, selectedDecades, onToggleDecade, onClear }) {
  if (decades.length === 0) return null

  return (
    <div className="timeline-filter" aria-label="Filter by decade">
      <div className="timeline-filter-head">
        <span className="timeline-filter-title">Timeline</span>
        {selectedDecades.size > 0 ? (
          <button type="button" className="timeline-filter-clear" onClick={onClear}>
            Clear
          </button>
        ) : null}
      </div>
      <div className="timeline-track-wrap">
        <div className="timeline-track" aria-hidden="true">
          <div className="timeline-track-glow" />
          {decades.map((key) => (
            <span
              key={`tick-${key}`}
              className="timeline-track-tick"
              style={{ left: `${decadeTimelinePercent(key)}%` }}
            />
          ))}
        </div>
        <div className="timeline-decades-scroll">
          <nav className="timeline-decades">
            <button
              type="button"
              className={`timeline-decade-chip${selectedDecades.size === 0 ? ' active' : ''}`}
              onClick={onClear}
            >
              All eras
            </button>
            {decades.map((key) => {
              const active = selectedDecades.has(key)
              return (
                <button
                  key={key}
                  type="button"
                  className={`timeline-decade-chip${active ? ' active' : ''}`}
                  style={{ '--timeline-pos': `${decadeTimelinePercent(key)}%` }}
                  onClick={() => onToggleDecade(key)}
                  aria-pressed={active}
                >
                  {formatDecadeKeyLabel(key)}
                </button>
              )
            })}
          </nav>
        </div>
      </div>
      <p className="timeline-filter-hint">
        Tap a decade to filter the feed—science cards use discovery or invention dates.
      </p>
    </div>
  )
}

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function App() {
  const [selectedDomain, setSelectedDomain] = useState(null)
  const [selectedTopics, setSelectedTopics] = useState(() => new Set())
  const [selectedDecades, setSelectedDecades] = useState(() => new Set())
  const [showSavedOnly, setShowSavedOnly] = useState(false)
  const [filterListOpen, setFilterListOpen] = useState(false)
  const [homePanel, setHomePanel] = useState('feed')
  const [learnTopic, setLearnTopic] = useState('')
  const [learnLevel, setLearnLevel] = useState('curious')
  const [learnScope, setLearnScope] = useState('both')
  const [learnLength, setLearnLength] = useState(5)
  const [learnFocus, setLearnFocus] = useState('')
  const [learnUiState, setLearnUiState] = useState('home')
  const [planResult, setPlanResult] = useState(null)
  const [planError, setPlanError] = useState(null)
  const [planningMessage, setPlanningMessage] = useState('')
  const [pathsVersion, setPathsVersion] = useState(0)
  const planSubmitLock = useRef(false)
  const [planSubmitLocked, setPlanSubmitLocked] = useState(false)
  const lessonGenLock = useRef(new Set())
  const [activePathRecord, setActivePathRecord] = useState(() => {
    const id = loadActivePathId()
    return id ? getPathById(id) : null
  })
  const [lessonGenPhase, setLessonGenPhase] = useState(null)
  const [activeZoneId, setActiveZoneId] = useState(null)
  const [activeZoneViewId, setActiveZoneViewId] = useState(() => zoneIdFromLocation())
  const [feedMode, setFeedMode] = useState('forYou')
  const [feedItems, setFeedItems] = useState([])
  const [feedRankKey, setFeedRankKey] = useState(0)
  const [deepLinkFeedItemId, setDeepLinkFeedItemId] = useState(() => feedItemIdFromLocation())
  const [slideIndexByFeedId, setSlideIndexByFeedId] = useState({})
  const [_returnFeed, setReturnFeed] = useState(null)
  const [offline, setOffline] = useState(() => !navigator.onLine)
  const [detailMode, setDetailMode] = useState(() => loadDetailModePreference())
  const [pathDripIds, setPathDripIds] = useState(() => loadPathDripEnabled())
  const [savedCards, setSavedCards] = useState(() =>
    loadJson(STORAGE_SAVED, []),
  )
  const [knownIds, setKnownIds] = useState(() => new Set(loadJson(STORAGE_KNOWN, [])))
  const [activeStoryId, setActiveStoryId] = useState(() => {
    const id = storyIdFromLocation()
    if (!id) return null
    if (HISTORY_CARDS.some((c) => c.id === id)) return id
    if (findLessonCardAcrossPaths(id, [], loadAllPaths())) return id
    return null
  })

  void pathsVersion
  const storedPaths = loadAllPaths()

  const generatedPathCards = useMemo(() => {
    if (!activePathRecord) return []
    return plannedLessonsForActiveTrack(activePathRecord)
  }, [activePathRecord])
  const [toast, setToast] = useState('')
  const toastTimer = useRef(null)

  const activeStory = useMemo(() => {
    const raw = cardByIdFromPools(activeStoryId, generatedPathCards, storedPaths)
    return raw ? normalizeCard(raw) : null
  }, [activeStoryId, generatedPathCards, storedPaths])

  const recommendedNext = useMemo(() => {
    if (!activeStoryId) return null
    const pathIdx = generatedPathCards.findIndex((c) => c.id === activeStoryId)
    if (pathIdx >= 0) {
      return generatedPathCards[pathIdx + 1] ?? null
    }
    return recommendNextCard(activeStoryId, knownIds)
  }, [activeStoryId, knownIds, generatedPathCards])

  const isGeneratedStory = useMemo(() => {
    if (!activeStoryId) return false
    return generatedPathCards.some((c) => c.id === activeStoryId)
  }, [activeStoryId, generatedPathCards])

  const savedIds = useMemo(
    () => new Set(savedCards.map((c) => c.id)),
    [savedCards],
  )

  const savedCardsLive = useMemo(() => {
    const byId = new Map(HISTORY_CARDS.map((c) => [c.id, c]))
    return savedCards.map((s) => normalizeCard(byId.get(s.id) ?? s))
  }, [savedCards])

  const activeZone = useMemo(
    () => (activeZoneId ? getZoneById(activeZoneId) : null),
    [activeZoneId],
  )

  const catalogFeedExtras = useMemo(
    () => HISTORY_CARDS.map((c) => feedItemFromCatalogCard(c)).filter(Boolean),
    [],
  )

  useEffect(() => {
    let cancelled = false
    void loadFeedItems(catalogFeedExtras).then(({ items }) => {
      if (cancelled) return
      setFeedItems(items)
    })
    return () => {
      cancelled = true
    }
  }, [catalogFeedExtras])

  useEffect(() => {
    const onOnline = () => setOffline(false)
    const onOffline = () => setOffline(true)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  const zoneDripItems = useMemo(
    () => buildZoneDripFeedItems(feedItems),
    [feedItems, feedRankKey],
  )

  const pathDripItems = useMemo(
    () => buildPathDripFeedItems(feedItems),
    [feedItems, pathsVersion, pathDripIds],
  )

  const filteredCards = useMemo(() => {
    let pool = showSavedOnly ? savedCardsLive : HISTORY_CARDS
    if (activeZone) {
      const allowed = new Set(activeZone.steps.map((s) => s.cardId))
      pool = pool.filter((c) => allowed.has(c.id))
    }
    if (selectedDomain) {
      pool = pool.filter((c) => c.domain === selectedDomain)
    }
    if (selectedTopics.size > 0) {
      pool = pool.filter((c) => c.category && selectedTopics.has(c.category))
    }
    if (selectedDecades.size > 0) {
      pool = pool.filter((c) => c.decadeKey && selectedDecades.has(c.decadeKey))
    }
    return pool
  }, [showSavedOnly, savedCardsLive, selectedDomain, selectedTopics, selectedDecades, activeZone])

  const catalogDecades = useMemo(
    () => uniqueDecadeKeysFromCards(HISTORY_CARDS),
    [],
  )

  const allDomainsSelected = selectedDomain === null
  const activeFilterCount =
    (selectedDomain ? 1 : 0) + selectedTopics.size + selectedDecades.size

  const toggleSavedView = useCallback(() => {
    setShowSavedOnly((on) => !on)
    setFilterListOpen(false)
  }, [])

  const selectAllDomains = useCallback(() => {
    setSelectedDomain(null)
    setActiveZoneId(null)
  }, [])

  const clearActiveZone = useCallback(() => {
    setActiveZoneId(null)
  }, [])

  const openZoneDetail = useCallback((zoneId) => {
    setActiveZoneViewId(zoneId)
    setHomePanel('zones')
    window.history.pushState(zoneHistoryState(zoneId), '', zoneUrl(zoneId))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const pickDomain = useCallback((domain) => {
    setSelectedDomain((prev) => (prev === domain ? null : domain))
  }, [])

  const toggleTopic = useCallback((topic) => {
    setSelectedTopics((prev) => {
      const next = new Set(prev)
      if (next.has(topic)) next.delete(topic)
      else next.add(topic)
      return next
    })
  }, [])

  const clearTopicFilters = useCallback(() => {
    setSelectedTopics(new Set())
  }, [])

  const clearDecadeFilters = useCallback(() => {
    setSelectedDecades(new Set())
  }, [])

  const toggleDecade = useCallback((decadeKey) => {
    setSelectedDecades((prev) => {
      const next = new Set(prev)
      if (next.has(decadeKey)) next.delete(decadeKey)
      else next.add(decadeKey)
      return next
    })
  }, [])

  const clearAllFilters = useCallback(() => {
    setSelectedDomain(null)
    setSelectedTopics(new Set())
    setSelectedDecades(new Set())
  }, [])

  const leaveSavedView = useCallback(() => {
    setShowSavedOnly(false)
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_SAVED, JSON.stringify(savedCards))
  }, [savedCards])

  useEffect(() => {
    localStorage.setItem(STORAGE_KNOWN, JSON.stringify([...knownIds]))
  }, [knownIds])

  useEffect(() => {
    const applyHistoryState = (state) => {
      if (state?.view === 'story' && state.id) {
        setActiveStoryId(state.id)
        if (state.returnFeed) {
          setHomePanel('feed')
          setFeedMode('forYou')
          setReturnFeed(state.returnFeed)
          setDeepLinkFeedItemId(state.returnFeed.feedItemId)
          setSlideIndexByFeedId((prev) => ({
            ...prev,
            [state.returnFeed.feedItemId]: state.returnFeed.slideIndex ?? 0,
          }))
        }
        return
      }
      if (state?.view === 'zone' && state.zoneId) {
        setActiveStoryId(null)
        setHomePanel('zones')
        setActiveZoneViewId(state.zoneId)
        return
      }
      if (state?.view === 'feed') {
        setActiveStoryId(null)
        setHomePanel('feed')
        setFeedMode(state.mode ?? 'forYou')
        if (state.feedItemId) setDeepLinkFeedItemId(state.feedItemId)
        setReturnFeed(null)
        return
      }
      if (state?.view === 'learnPath' && state.pathId) {
        setActiveStoryId(null)
        setHomePanel('learn')
        setLearnUiState('path')
        const path = getPathById(state.pathId)
        if (path) {
          setActivePathRecord(path)
          setActivePathId(path.id)
        }
        return
      }
      if (state?.view === 'learnHome') {
        setActiveStoryId(null)
        setHomePanel('learn')
        setLearnUiState('home')
        return
      }
      if (state?.view === 'library') {
        setActiveStoryId(null)
        setHomePanel('library')
        return
      }
      setActiveStoryId(null)
      setHomePanel('feed')
      setFeedMode('forYou')
    }

    const deepLinkId = storyIdFromLocation()
    const deepLinkPathId = learnPathIdFromLocation() ?? shortPathIdFromLocation()
    const deepLinkFeedId = feedItemIdFromLocation()
    const deepLinkZoneId = zoneIdFromLocation()
    const deepLinkKnown =
      deepLinkId &&
      (HISTORY_CARDS.some((c) => c.id === deepLinkId) ||
        Boolean(findLessonCardAcrossPaths(deepLinkId, [], loadAllPaths())))

    if (deepLinkKnown) {
      window.history.replaceState(storyHistoryState(deepLinkId), '', storyUrl(deepLinkId))
      setActiveStoryId(deepLinkId)
    } else if (deepLinkFeedId) {
      window.history.replaceState(
        feedHistoryState('forYou', deepLinkFeedId),
        '',
        feedUrl(deepLinkFeedId),
      )
      setHomePanel('feed')
      setFeedMode('forYou')
      setDeepLinkFeedItemId(deepLinkFeedId)
    } else if (deepLinkZoneId && getZoneById(deepLinkZoneId)) {
      window.history.replaceState(zoneHistoryState(deepLinkZoneId), '', zoneUrl(deepLinkZoneId))
      setHomePanel('zones')
      setActiveZoneViewId(deepLinkZoneId)
    } else if (deepLinkPathId && getPathById(deepLinkPathId)) {
      window.history.replaceState(
        learnPathHistoryState(deepLinkPathId),
        '',
        learnPathUrl(deepLinkPathId),
      )
      setHomePanel('learn')
      setLearnUiState('path')
      const path = getPathById(deepLinkPathId)
      setActivePathRecord(path)
      setActivePathId(path.id)
    } else if (window.location.hash.startsWith('#learn')) {
      window.history.replaceState(learnHomeHistoryState(), '', learnHomeUrl())
      setHomePanel('learn')
      setLearnUiState('home')
    } else if (window.location.hash === '#library') {
      window.history.replaceState({ view: 'library' }, '', `${window.location.pathname}${window.location.search}#library`)
      setHomePanel('library')
    } else {
      window.history.replaceState(FEED_HISTORY_STATE, '', feedUrl())
      setHomePanel('feed')
      setFeedMode('forYou')
    }

    const onPopState = (event) => {
      applyHistoryState(event.state)
      window.scrollTo(0, 0)
    }

    const onHashChange = () => {
      const feedId = feedItemIdFromLocation()
      if (feedId) {
        setHomePanel('feed')
        setFeedMode('forYou')
        setDeepLinkFeedItemId(feedId)
        setActiveStoryId(null)
        return
      }
      const zoneId = zoneIdFromLocation()
      if (zoneId && getZoneById(zoneId)) {
        setHomePanel('zones')
        setActiveZoneViewId(zoneId)
        setActiveStoryId(null)
      }
    }

    window.addEventListener('popstate', onPopState)
    window.addEventListener('hashchange', onHashChange)
    return () => {
      window.removeEventListener('popstate', onPopState)
      window.removeEventListener('hashchange', onHashChange)
    }
  }, [])

  const showToast = useCallback((message) => {
    setToast(message)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 2200)
  }, [])

  const handleSave = useCallback(
    (card) => {
      setSavedCards((prev) => {
        if (prev.some((c) => c.id === card.id)) {
          showToast('Removed from saved')
          return prev.filter((c) => c.id !== card.id)
        }
        showToast('Saved for later')
        return [...prev, card]
      })
    },
    [showToast],
  )

  const feedStatus = useMemo(() => {
    const parts = []
    if (showSavedOnly) parts.push('Saved')
    if (activeZone) parts.push(`Zone: ${activeZone.title}`)
    parts.push(
      `${filteredCards.length} ${filteredCards.length === 1 ? 'story' : 'stories'}`,
    )
    if (activeFilterCount > 0) {
      parts.push(
        `${activeFilterCount} ${activeFilterCount === 1 ? 'filter' : 'filters'}`,
      )
    }
    return parts.join(' · ')
  }, [showSavedOnly, activeZone, filteredCards.length, activeFilterCount])

  const emptyState = useMemo(() => {
    if (showSavedOnly && savedCards.length === 0) {
      return {
        title: 'No saved stories yet',
        body: 'Tap Save on any story in the feed to keep it here for later.',
        action: { label: 'Browse feed', onClick: leaveSavedView },
      }
    }
    if (showSavedOnly && activeFilterCount > 0) {
      return {
        title: 'No matches in saved',
        body: 'None of your saved stories match the domains or topics you picked.',
        action: { label: 'Clear filters', onClick: clearAllFilters },
      }
    }
    if (activeFilterCount > 0) {
      return {
        title: 'No stories for these filters',
        body: 'Try fewer domains, topics, or timeline decades—or reset to see the full feed.',
        action: { label: 'Show all', onClick: clearAllFilters },
      }
    }
    return {
      title: 'Nothing to show',
      body: 'Check back soon for new stories.',
      action: null,
    }
  }, [
    showSavedOnly,
    savedCards.length,
    activeFilterCount,
    clearAllFilters,
    leaveSavedView,
  ])

  const handleKnown = useCallback(
    (card) => {
      setKnownIds((prev) => {
        const next = new Set(prev)
        if (next.has(card.id)) {
          next.delete(card.id)
          showToast('Marked as new again')
        } else {
          next.add(card.id)
          showToast('Nice — marked as known')
        }
        return next
      })
    },
    [showToast],
  )

  const openFeedItemById = useCallback(
    (feedItemId) => {
      setHomePanel('feed')
      setFeedMode('forYou')
      setDeepLinkFeedItemId(feedItemId)
      setActiveStoryId(null)
      window.history.pushState(feedHistoryState('forYou', feedItemId), '', feedUrl(feedItemId))
    },
    [],
  )

  const openStoryFromFeed = useCallback(
    (feedItem, slideIndex = 0) => {
      const ret = { feedItemId: feedItem.id, slideIndex }
      setReturnFeed(ret)
      setSlideIndexByFeedId((prev) => ({ ...prev, [feedItem.id]: slideIndex }))
      setFilterListOpen(false)
      setActiveStoryId(feedItem.parentCardId)
      setHomePanel('feed')
      const pathCard = findLessonCardAcrossPaths(
        feedItem.parentCardId,
        generatedPathCards,
        loadAllPaths(),
      )
      if (pathCard?.pathId) {
        const path = touchPathOpened(pathCard.pathId) ?? getPathById(pathCard.pathId)
        if (path) {
          setActivePathRecord(path)
          setActivePathId(path.id)
        }
      }
      window.history.pushState(
        storyHistoryState(feedItem.parentCardId, ret),
        '',
        storyUrl(feedItem.parentCardId),
      )
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [generatedPathCards],
  )

  const openStory = useCallback((id) => {
    setFilterListOpen(false)
    setReturnFeed(null)
    setActiveStoryId(id)
    const pathCard = findLessonCardAcrossPaths(id, generatedPathCards, loadAllPaths())
    if (pathCard?.pathId) {
      const path = touchPathOpened(pathCard.pathId) ?? getPathById(pathCard.pathId)
      if (path) {
        setActivePathRecord(path)
        setActivePathId(path.id)
        setHomePanel('learn')
        setLearnUiState('path')
      }
    }
    const dateKey = getLocalDateKey()
    const { picks } = selectDailyEdition(HISTORY_CARDS, dateKey)
    const editionIds = new Set(
      Object.values(picks)
        .filter(Boolean)
        .map((p) => p.id),
    )
    if (editionIds.has(id)) {
      markEditionCardExplored(dateKey, id)
      window.dispatchEvent(new Event('daily-edition-progress'))
    }
    const current = window.history.state
    if (current?.view !== 'story' || current?.id !== id) {
      window.history.pushState(storyHistoryState(id), '', storyUrl(id))
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [generatedPathCards])

  const closeStory = useCallback(() => {
    if (window.history.state?.view === 'story') {
      window.history.back()
      return
    }
    setActiveStoryId(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleSurprise = useCallback(() => {
    const pool = filteredCards
    if (pool.length === 0) return
    const unknown = pool.filter((c) => !knownIds.has(c.id))
    const pickFrom = unknown.length > 0 ? unknown : pool
    const card = pickFrom[Math.floor(Math.random() * pickFrom.length)]
    openStory(card.id)
    showToast(`Surprise: ${card.title}`)
  }, [filteredCards, knownIds, showToast, openStory])

  const bumpPaths = useCallback(() => setPathsVersion((v) => v + 1), [])

  const resetLearnFlow = useCallback(() => {
    setLearnUiState('home')
    setPlanResult(null)
    setPlanError(null)
    setLearnTopic('')
    setLearnFocus('')
    setLearnLevel('curious')
    setLearnScope('both')
    setLearnLength(5)
    setActivePathRecord(null)
    setActivePathId(null)
    window.history.pushState(learnHomeHistoryState(), '', learnHomeUrl())
  }, [])

  const markActiveLessonComplete = useCallback(() => {
    if (!activeStory?.isGeneratedPath || !activeStory.trackId || !activePathRecord) return
    const next = markLessonComplete(activePathRecord, activeStory.trackId, activeStory.id)
    setActivePathRecord(next)
    bumpPaths()
  }, [activeStory, activePathRecord, bumpPaths])

  const openPathScreen = useCallback(
    (pathId) => {
      const path = touchPathOpened(pathId) ?? getPathById(pathId)
      if (!path) return
      setActivePathId(path.id)
      setActivePathRecord(path)
      setLearnUiState('path')
      setHomePanel('learn')
      setPlanResult(null)
      setActiveStoryId(null)
      window.history.pushState(learnPathHistoryState(path.id), '', shortPathUrl(path.id))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [],
  )

  const exitLearnPathToHome = useCallback(() => {
    setLearnUiState('home')
    setActiveStoryId(null)
    window.history.pushState(learnHomeHistoryState(), '', learnHomeUrl())
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const backToPathScreen = useCallback(() => {
    markActiveLessonComplete()
    setActiveStoryId(null)
    setLearnUiState('path')
    setHomePanel('learn')
    const pathId = activePathRecord?.id ?? loadActivePathId()
    if (pathId) {
      const path = touchPathOpened(pathId) ?? getPathById(pathId)
      if (path) {
        setActivePathRecord(path)
        setActivePathId(path.id)
      }
      window.history.pushState(learnPathHistoryState(pathId), '', learnPathUrl(pathId))
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [activePathRecord, markActiveLessonComplete])

  const openNextPathChapter = useCallback(
    (nextId) => {
      markActiveLessonComplete()
      openStory(nextId)
    },
    [markActiveLessonComplete, openStory],
  )

  const handleDetailBack = useCallback(() => {
    if (activeStory?.isGeneratedPath) {
      const cards = generatedPathCards.length
        ? generatedPathCards
        : plannedLessonsForActiveTrack(
            activePathRecord ?? getPathById(loadActivePathId() ?? ''),
          )
      const idx = cards.findIndex((c) => c.id === activeStory.id)
      if (idx > 0) {
        markActiveLessonComplete()
        if (window.history.state?.view === 'story') {
          window.history.back()
        } else {
          openStory(cards[idx - 1].id)
        }
        return
      }
      backToPathScreen()
      return
    }
    closeStory()
  }, [
    activeStory,
    generatedPathCards,
    activePathRecord,
    markActiveLessonComplete,
    openStory,
    backToPathScreen,
    closeStory,
  ])

  const continueLearnTopic = useCallback(() => {
    if (!learnTopic.trim()) return
    setLearnUiState('confirm')
  }, [learnTopic])

  const runPlanRequest = useCallback(
    async ({ topicOverride, focusOverride } = {}) => {
      if (planSubmitLock.current) return
      const topic = (topicOverride ?? learnTopic).trim().slice(0, 150)
      if (!topic) return

      planSubmitLock.current = true
      setPlanSubmitLocked(true)
      setPlanError(null)
      setLearnUiState('planning')
      setPlanningMessage('Assessing the scope…')

      if (isForceMockMode()) {
        setPlanningMessage('Designing the learning sequence…')
        const demo = buildDemoPathRecord({
          topic,
          level: learnLevel,
          scope: learnScope,
          length: learnLength,
          focus: focusOverride ?? learnFocus,
        })
        upsertPath(demo)
        setActivePathId(demo.id)
        setActivePathRecord(demo)
        bumpPaths()
        setLearnUiState('path')
        setHomePanel('learn')
        window.history.pushState(learnPathHistoryState(demo.id), '', learnPathUrl(demo.id))
        planSubmitLock.current = false
        setPlanSubmitLocked(false)
        showToast('Demo path ready')
        return
      }

      setPlanningMessage('Designing the learning sequence…')
      const result = await planLearningPath({
        topic,
        focus: (focusOverride ?? learnFocus).trim().slice(0, 300),
        level: learnLevel,
        geographicScope: learnScope,
        requestedLength: learnLength === 3 ? 3 : 5,
        buildMode: 'single_track',
      })

      planSubmitLock.current = false
      setPlanSubmitLocked(false)

      if (!result.ok) {
        setPlanError({
          message: result.error,
          code: result.code,
          requestId: result.requestId,
          retryable: result.retryable,
          missingConfig: isMissingConfigError(result),
        })
        setLearnUiState('error')
        return
      }

      if (result.data.inputStatus === 'unsupported') {
        setPlanError({
          message: result.data.scopeExplanation || 'This topic is not supported for learning paths.',
          code: 'UNSUPPORTED',
          retryable: false,
        })
        setLearnUiState('error')
        return
      }

      setPlanResult(result.data)
      setLearnUiState(uiStateFromPlan(result.data))
    },
    [learnTopic, learnLevel, learnScope, learnLength, learnFocus, bumpPaths, showToast],
  )

  const handleAssessTopic = useCallback(() => {
    void runPlanRequest()
  }, [runPlanRequest])

  const handleRetryPlan = useCallback(() => {
    void runPlanRequest()
  }, [runPlanRequest])

  const handleUseDemoFallback = useCallback(() => {
    const topic = learnTopic.trim()
    if (!topic) return
    setLearnUiState('saving')
    const demo = buildDemoPathRecord({
      topic,
      level: learnLevel,
      scope: learnScope,
      length: learnLength,
      focus: learnFocus,
    })
    upsertPath(demo)
    setActivePathId(demo.id)
    setActivePathRecord(demo)
    bumpPaths()
    setLearnUiState('path')
    setHomePanel('learn')
    window.history.pushState(learnPathHistoryState(demo.id), '', learnPathUrl(demo.id))
    showToast('Demo path ready (not live AI)')
  }, [learnTopic, learnLevel, learnScope, learnLength, learnFocus, bumpPaths, showToast])

  const persistPlanChoice = useCallback(
    ({ buildMode, activeTrackId, sourceLabel = 'generated', isDemo = false }) => {
      if (!planResult?.course) return
      setLearnUiState('saving')
      const record = createPathRecordFromPlan({
        plan: planResult,
        preferences: {
          topic: learnTopic.trim(),
          level: learnLevel,
          scope: learnScope,
          length: learnLength,
          focus: learnFocus.trim(),
        },
        buildMode,
        activeTrackId,
        sourceLabel,
        isDemo,
      })
      const saved = upsertPath(record)
      setActivePathId(saved.id)
      setActivePathRecord(saved)
      bumpPaths()
      setLearnUiState('path')
      setHomePanel('learn')
      window.history.pushState(learnPathHistoryState(saved.id), '', learnPathUrl(saved.id))
      window.scrollTo({ top: 0, behavior: 'smooth' })
      showToast('Learning path saved · generating lesson 1…')
      const firstTrack = saved.course?.tracks?.find((t) => t.id === activeTrackId)
      const firstLesson = firstTrack?.lessons?.slice().sort((a, b) => a.order - b.order)[0]
      if (firstLesson && !isDemo) {
        const card = lessonToDisplayCard({
          pathRecord: saved,
          trackId: firstTrack.id,
          lesson: firstLesson,
          trackTitle: firstTrack.title,
          trackLessonCount: firstTrack.lessons.length,
        })
        queueMicrotask(() => {
          void generateLessonForStoryRef.current?.(card, { prefetch: true })
        })
      }
    },
    [planResult, learnTopic, learnLevel, learnScope, learnLength, learnFocus, bumpPaths, showToast],
  )

  const handleConfirmSinglePath = useCallback(() => {
    const trackId = planResult?.course?.tracks?.[0]?.id
    if (!trackId) return
    persistPlanChoice({ buildMode: 'single_track', activeTrackId: trackId })
  }, [planResult, persistPlanChoice])

  const handleLearnTrack = useCallback(
    (trackId) => {
      persistPlanChoice({ buildMode: 'single_track', activeTrackId: trackId })
    },
    [persistPlanChoice],
  )

  const handleBuildFullCourse = useCallback(() => {
    const trackId =
      planResult?.course?.recommendedTrackId ?? planResult?.course?.tracks?.[0]?.id ?? null
    if (!trackId) return
    persistPlanChoice({ buildMode: 'full_course', activeTrackId: trackId })
  }, [planResult, persistPlanChoice])

  const handleSelectNarrowing = useCallback(
    (option) => {
      setLearnTopic(option.refinedTopic)
      setLearnFocus((prev) => {
        const trimmed = prev.trim()
        return trimmed ? `${trimmed}; ${option.label}` : option.label
      })
      void runPlanRequest({ topicOverride: option.refinedTopic })
    },
    [runPlanRequest],
  )

  const handleResumePath = useCallback(
    (pathId) => {
      openPathScreen(pathId)
    },
    [openPathScreen],
  )

  const handleDeletePath = useCallback(
    (pathId, title) => {
      const ok = window.confirm(`Delete “${title}”? This cannot be undone.`)
      if (!ok) return
      deletePath(pathId)
      bumpPaths()
      if (activePathRecord?.id === pathId) {
        setActivePathRecord(null)
        setLearnUiState('home')
      }
      showToast('Path deleted')
    },
    [activePathRecord, bumpPaths, showToast],
  )

  const handleSwitchTrack = useCallback(
    (trackId) => {
      if (!activePathRecord) return
      const next = upsertPath({ ...activePathRecord, activeTrackId: trackId })
      setActivePathRecord(next)
      bumpPaths()
    },
    [activePathRecord, bumpPaths],
  )

  const learnActivePathMeta = useMemo(() => {
    if (!activePathRecord?.course) return null
    const levelLabel =
      LEARN_LEVELS.find((l) => l.id === activePathRecord.preferences?.level)?.label ??
      activePathRecord.course.level
    const scopeLabel =
      LEARN_SCOPES.find((s) => s.id === activePathRecord.preferences?.scope)?.label ??
      activePathRecord.course.geographicScope
    const track = activePathRecord.course.tracks.find(
      (t) => t.id === activePathRecord.activeTrackId,
    )
    return {
      topic: activePathRecord.course.title,
      levelLabel,
      scopeLabel,
      trackTitle: track?.title ?? null,
      lessonCount: track?.lessons?.length ?? 0,
      sourceLabel: activePathRecord.sourceLabel,
      buildMode: activePathRecord.buildMode,
      tracks: activePathRecord.course.tracks,
      activeTrackId: activePathRecord.activeTrackId,
    }
  }, [activePathRecord])

  const generateLessonForStoryRef = useRef(null)

  const generateLessonForStory = useCallback(
    async (storyCard, { prefetch = false } = {}) => {
      if (!storyCard?.pathId || !storyCard?.trackId) return
      const lockKey = storyCard.id
      if (lessonGenLock.current.has(lockKey)) return
      lessonGenLock.current.add(lockKey)

      let path = getPathById(storyCard.pathId) ?? activePathRecord
      if (!path) {
        lessonGenLock.current.delete(lockKey)
        return
      }

      const track = path.course?.tracks?.find((t) => t.id === storyCard.trackId)
      const lesson = track?.lessons?.find((l) => l.id === storyCard.id)
      if (!lesson || lesson.generationStatus === 'ready') {
        lessonGenLock.current.delete(lockKey)
        return
      }
      if (lesson.generationStatus === 'generating') {
        const started = lesson.generationStartedAt ?? 0
        const stale = Date.now() - started > 4 * 60 * 1000
        if (!stale) {
          lessonGenLock.current.delete(lockKey)
          return
        }
      }

      if (path.isDemo) {
        lessonGenLock.current.delete(lockKey)
        return
      }

      path = updateLessonInPath(path, storyCard.trackId, storyCard.id, {
        generationStatus: 'generating',
        generationError: null,
        generationStartedAt: Date.now(),
      })
      setActivePathRecord(path)
      bumpPaths()
      if (!prefetch) setLessonGenPhase('research')

      const priorLessonTitles = track.lessons
        .filter((l) => l.order < lesson.order)
        .map((l) => l.title)

      const result = await generateLesson({
        pathId: path.id,
        trackId: track.id,
        lessonId: lesson.id,
        courseTitle: path.course.title,
        level: path.course.level,
        geographicScope: path.course.geographicScope,
        trackTitle: track.title,
        lesson,
        priorLessonTitles,
      })

      if (!result.ok) {
        path = updateLessonInPath(getPathById(path.id) ?? path, track.id, lesson.id, {
          generationStatus: 'error',
          generationError: result.error,
        })
        setActivePathRecord(path)
        bumpPaths()
        if (!prefetch) setLessonGenPhase('error')
        lessonGenLock.current.delete(lockKey)
        return
      }

      const { presentation, lessonCore, sources } = result.data
      const catalog = mergeSourcesIntoCatalog(path, sources)
      path = updateLessonInPath(getPathById(path.id) ?? path, track.id, lesson.id, {
        generationStatus: 'ready',
        generatedAt: Date.now(),
        presentation,
        lessonCore,
        sources: sources.map((s) => s.id),
        generationError: null,
      })
      path = upsertPath({ ...path, sourceCatalog: catalog })
      setActivePathRecord(path)
      bumpPaths()
      if (!prefetch) setLessonGenPhase(null)
      lessonGenLock.current.delete(lockKey)

      const nextLesson = track.lessons.find((l) => l.order === lesson.order + 1)
      if (nextLesson?.generationStatus === 'planned') {
        const nextCard = lessonToDisplayCard({
          pathRecord: path,
          trackId: track.id,
          lesson: nextLesson,
          trackTitle: track.title,
          trackLessonCount: track.lessons.length,
        })
        void generateLessonForStoryRef.current?.(nextCard, { prefetch: true })
      }
    },
    [activePathRecord, bumpPaths],
  )

  useEffect(() => {
    generateLessonForStoryRef.current = generateLessonForStory
  }, [generateLessonForStory])

  useEffect(() => {
    if (!activeStory?.isGeneratedPath) return
    if (activeStory.generationStatus === 'ready') {
      setLessonGenPhase(null)
      return
    }
    if (activeStory.generationStatus === 'error') {
      setLessonGenPhase('error')
      return
    }
    void generateLessonForStory(activeStory)
  }, [activeStory, generateLessonForStory])

  const inDetail = activeStoryId !== null

  const showDailyEdition = useMemo(
    () =>
      isDailyEditionVisible({
        showSavedOnly,
        activeZone,
        activeFilterCount,
        homePanel,
        feedMode,
      }),
    [showSavedOnly, activeZone, activeFilterCount, homePanel, feedMode],
  )

  const handlePrimaryNav = useCallback(
    (panel) => {
      setHomePanel(panel)
      setFilterListOpen(false)
      if (panel === 'feed') {
        window.history.pushState(feedHistoryState(feedMode), '', feedUrl(deepLinkFeedItemId))
      } else if (panel === 'learn') {
        if (learnUiState === 'planning' || learnUiState === 'saving') return
        setLearnUiState('home')
        window.history.pushState(learnHomeHistoryState(), '', learnHomeUrl())
      } else if (panel === 'zones') {
        setActiveZoneViewId(null)
        window.history.pushState({ view: 'zones' }, '', `${window.location.pathname}${window.location.search}#zones`)
      } else if (panel === 'library') {
        window.history.pushState({ view: 'library' }, '', `${window.location.pathname}${window.location.search}#library`)
      }
    },
    [feedMode, deepLinkFeedItemId, learnUiState],
  )

  const togglePathDrip = useCallback((pathId, enabled) => {
    setPathDripEnabled(pathId, enabled)
    setPathDripIds(loadPathDripEnabled())
    setFeedRankKey((k) => k + 1)
    showToast(enabled ? 'Next lesson will drip into For You' : 'Removed from For You')
  }, [showToast])

  const openZoneStep = useCallback(
    (zone, step, mode) => {
      const feedMatch =
        feedItems.find((f) => f.id === step.feedItemId || f.parentCardId === step.cardId) ??
        null
      if (mode === 'focus' && feedMatch) {
        openStoryFromFeed(feedMatch, 0)
        markZoneStepComplete(zone.id, step.order)
        return
      }
      if (feedMatch) openStoryFromFeed(feedMatch, 0)
      else openStory(step.cardId)
    },
    [feedItems, openStory, openStoryFromFeed],
  )

  const narrativeRelated = useMemo(() => {
    if (!activeStory || !isNarrativeCard(activeStory)) return []
    const ids = Array.isArray(activeStory.relatedCardIds) ? activeStory.relatedCardIds : []
    return ids.map((id) => CARD_BY_ID.get(id)).filter(Boolean)
  }, [activeStory])

  const activePathLessonRaw = useMemo(() => {
    if (!activeStory?.isGeneratedPath || !activePathRecord) return null
    const track = activePathRecord.course?.tracks?.find((t) => t.id === activeStory.trackId)
    return track?.lessons?.find((l) => l.id === activeStory.id) ?? null
  }, [activeStory, activePathRecord])

  const activePathTrackMeta = useMemo(() => {
    if (!activeStory?.trackId || !activePathRecord?.course) return null
    return activePathRecord.course.tracks.find((t) => t.id === activeStory.trackId) ?? null
  }, [activeStory, activePathRecord])

  const showExploreChrome =
    !inDetail && homePanel === 'feed' && feedMode === 'explore'

  return (
    <div
      className={`app${inDetail ? ' app--detail' : ''}${homePanel === 'feed' && feedMode === 'forYou' && !inDetail ? ' app--reel' : ''}${!inDetail ? ' app--with-bottom-nav' : ''}`}
    >
      <header className="top-bar">
        <div className="brand">
          {inDetail ? (
            <button type="button" className="back-btn" onClick={handleDetailBack}>
              ← Back
            </button>
          ) : homePanel === 'learn' && learnUiState === 'path' ? (
            <button type="button" className="back-btn" onClick={exitLearnPathToHome}>
              ← Back
            </button>
          ) : null}
          <h1 className={inDetail ? 'brand-title--detail' : ''}>
            {inDetail
              ? (activeStory?.title ?? activeStory?.curiosityQuestion ?? 'Story')
              : homePanel === 'library'
                ? 'Library'
                : activeZone && homePanel === 'feed'
                  ? activeZone.title
                  : homePanel === 'zones'
                    ? 'Learning Zones'
                    : homePanel === 'learn' && learnUiState === 'path' && learnActivePathMeta
                      ? learnActivePathMeta.topic
                      : homePanel === 'learn'
                        ? 'Learn a Topic'
                        : homePanel === 'feed' && feedMode === 'forYou'
                          ? 'For You'
                          : 'Curiosity Feed'}
          </h1>
          {!inDetail && showExploreChrome && (
            <div className="header-actions">
              <button
                type="button"
                className={`filter-icon-btn${filterListOpen ? ' active' : ''}${selectedTopics.size > 0 ? ' has-filters' : ''}`}
                onClick={() => setFilterListOpen((o) => !o)}
                aria-expanded={filterListOpen}
                aria-controls="category-filter-list"
                aria-label={
                  selectedTopics.size > 0
                    ? `Filter topics, ${selectedTopics.size} selected`
                    : 'Filter topics'
                }
              >
                <svg
                  className="filter-icon"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    d="M4 6h16M7 12h10M10 18h4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.35"
                    strokeLinecap="round"
                  />
                </svg>
                {selectedTopics.size > 0 && (
                  <span className="filter-icon-badge">{selectedTopics.size}</span>
                )}
              </button>
              <button
                type="button"
                className={`saved-toggle${showSavedOnly ? ' active' : ''}`}
                onClick={toggleSavedView}
                aria-pressed={showSavedOnly}
                aria-label={showSavedOnly ? 'Show all stories' : 'Show saved only'}
              >
                Saved
              </button>
            </div>
          )}
        </div>

        {!inDetail && homePanel === 'feed' ? (
          <nav className="feed-subnav" aria-label="Feed mode">
            <button
              type="button"
              className={`feed-subnav-btn${feedMode === 'forYou' ? ' active' : ''}`}
              aria-current={feedMode === 'forYou' ? 'page' : undefined}
              onClick={() => {
                setFeedMode('forYou')
                window.history.replaceState(feedHistoryState('forYou', deepLinkFeedItemId), '', feedUrl(deepLinkFeedItemId))
              }}
            >
              For You
            </button>
            <button
              type="button"
              className={`feed-subnav-btn${feedMode === 'explore' ? ' active' : ''}`}
              aria-current={feedMode === 'explore' ? 'page' : undefined}
              onClick={() => {
                setFeedMode('explore')
                window.history.replaceState(feedHistoryState('explore'), '', feedUrl())
              }}
            >
              Explore
            </button>
          </nav>
        ) : null}

        {!inDetail && (
          <>
            {showExploreChrome ? (
              <>
                <div className="filters-scroll" aria-label="Domain filters">
                  <nav className="filters">
                    <button
                      type="button"
                      className={`filter-chip${allDomainsSelected ? ' active' : ''}`}
                      onClick={selectAllDomains}
                    >
                      All
                    </button>
                    {LEARNING_DOMAINS.map((domain) => (
                      <button
                        key={domain}
                        type="button"
                        className={`filter-chip${selectedDomain === domain ? ' active' : ''}`}
                        onClick={() => pickDomain(domain)}
                      >
                        {domain}
                      </button>
                    ))}
                  </nav>
                </div>

                <TimelineFilter
                  decades={catalogDecades}
                  selectedDecades={selectedDecades}
                  onToggleDecade={toggleDecade}
                  onClear={clearDecadeFilters}
                />

                {filterListOpen && (
                  <div
                    id="category-filter-list"
                    className="filter-list-panel"
                    role="group"
                    aria-label="Multi-select topics"
                  >
                    <div className="filter-list-head">
                      <span className="filter-list-title">Topics</span>
                      {selectedTopics.size > 0 && (
                        <button
                          type="button"
                          className="filter-list-clear"
                          onClick={clearTopicFilters}
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <p className="filter-list-hint">
                      Pick one domain above, then multi-select era topics here to narrow
                      further.
                    </p>
                    <ul className="filter-list">
                      {TOPIC_LIST.map((topic) => (
                        <li key={topic}>
                          <label className="filter-list-item">
                            <input
                              type="checkbox"
                              checked={selectedTopics.has(topic)}
                              onChange={() => toggleTopic(topic)}
                            />
                            <span>{topic}</span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : null}
          </>
        )}
      </header>

      {!inDetail && homePanel === 'feed' && feedMode === 'explore' && (
        <div className="feed-toolbar">
          <p className="feed-status" aria-live="polite">
            {feedStatus}
          </p>
          <div className="feed-toolbar-actions">
            {activeZone ? (
              <button type="button" className="zone-clear-link" onClick={clearActiveZone}>
                Leave zone
              </button>
            ) : null}
            <button
              type="button"
              className="surprise-link"
              onClick={handleSurprise}
            >
              Surprise me
            </button>
          </div>
        </div>
      )}

      <main
        className={`feed${homePanel === 'zones' && !inDetail ? ' feed--zones' : ''}${homePanel === 'learn' && !inDetail ? ' feed--learn' : ''}`}
      >
        {!inDetail && homePanel === 'learn' && learnUiState !== 'path' ? (
          <>
            <div className="learn-home-create">
              <LearnTopicPanel
                topic={learnTopic}
                onTopicChange={setLearnTopic}
                level={learnLevel}
                onLevelChange={setLearnLevel}
                scope={learnScope}
                onScopeChange={setLearnScope}
                length={learnLength}
                onLengthChange={setLearnLength}
                focus={learnFocus}
                onFocusChange={setLearnFocus}
                uiState={learnUiState === 'home' ? 'start' : learnUiState}
                onContinue={continueLearnTopic}
                onGenerate={handleAssessTopic}
                onEditTopic={() => {
                  setLearnUiState('home')
                  setPlanResult(null)
                  setPlanError(null)
                }}
                planResult={planResult}
                planError={planError}
                onRetryPlan={handleRetryPlan}
                onUseDemoFallback={handleUseDemoFallback}
                onSelectNarrowing={handleSelectNarrowing}
                onConfirmSinglePath={handleConfirmSinglePath}
                onLearnTrack={handleLearnTrack}
                onBuildFullCourse={handleBuildFullCourse}
                planningMessage={planningMessage}
                submitLocked={planSubmitLocked}
              />
            </div>
            <MyPathsSection
              refreshKey={pathsVersion}
              onOpenPath={handleResumePath}
              onDelete={handleDeletePath}
            />
          </>
        ) : !inDetail && homePanel === 'learn' && learnUiState === 'path' ? (
          <>
            {learnActivePathMeta?.buildMode === 'full_course' &&
            learnActivePathMeta.tracks?.length > 1 ? (
              <div className="learn-track-switch">
                <span className="learn-legend">Track</span>
                <div className="learn-options">
                  {learnActivePathMeta.tracks.map((track) => (
                    <button
                      key={track.id}
                      type="button"
                      className={`learn-option${learnActivePathMeta.activeTrackId === track.id ? ' learn-option--active' : ''}`}
                      onClick={() => handleSwitchTrack(track.id)}
                    >
                      {track.title}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            <LearnPathChapters
              pathMeta={learnActivePathMeta}
              cards={generatedPathCards}
              completedLessonIds={activePathRecord?.completedLessonIds}
              onOpenChapter={openStory}
              onNewTopic={resetLearnFlow}
              pathDripEnabled={
                activePathRecord?.id
                  ? pathDripIds.includes(activePathRecord.id)
                  : false
              }
              onTogglePathDrip={(enabled) => {
                if (activePathRecord?.id) togglePathDrip(activePathRecord.id, enabled)
              }}
            />
          </>
        ) : !inDetail && homePanel === 'library' ? (
          <LibraryPanel
            feedItems={feedItems}
            savedCardsLive={savedCardsLive}
            catalogById={CARD_BY_ID}
            onOpenFeedItem={openFeedItemById}
            onOpenStory={openStory}
            onOpenPath={openPathScreen}
            onUnsave={(card) => handleSave(card)}
            onRefreshLikes={() => setFeedRankKey((k) => k + 1)}
          />
        ) : !inDetail && homePanel === 'zones' && activeZoneViewId ? (
          <ZoneDetail
            zoneId={activeZoneViewId}
            onBack={() => {
              setActiveZoneViewId(null)
              window.history.pushState({ view: 'zones' }, '', `${window.location.pathname}${window.location.search}#zones`)
            }}
            onOpenStep={openZoneStep}
            onContinueInFeed={(zoneId) => {
              setHomePanel('feed')
              setFeedMode('forYou')
              window.history.pushState(feedHistoryState('forYou'), '', feedUrl())
              void zoneId
            }}
          />
        ) : !inDetail && homePanel === 'zones' ? (
          <ZonesPanel onOpenZone={openZoneDetail} />
        ) : !inDetail && homePanel === 'feed' && feedMode === 'forYou' ? (
          <LearningReel
            items={feedItems}
            dripItems={[...zoneDripItems, ...pathDripItems]}
            catalogCardById={CARD_BY_ID}
            savedCardIds={savedIds}
            knownCardIds={knownIds}
            onToggleSave={handleSave}
            onKnown={handleKnown}
            onGoDeeper={openStoryFromFeed}
            onToast={showToast}
            onPreferenceRefresh={() => setFeedRankKey((k) => k + 1)}
            initialFeedItemId={deepLinkFeedItemId}
            onActiveFeedItemChange={(id) => {
              setDeepLinkFeedItemId(id)
              window.history.replaceState(
                feedHistoryState('forYou', id),
                '',
                feedUrl(id),
              )
            }}
            slideIndexByFeedId={slideIndexByFeedId}
            onSlideIndexChange={(feedId, idx) =>
              setSlideIndexByFeedId((prev) => ({ ...prev, [feedId]: idx }))
            }
            offline={offline}
            onOpenLibrary={() => handlePrimaryNav('library')}
            onContinuePath={() => {
              const id = loadActivePathId()
              if (id) openPathScreen(id)
            }}
          />
        ) : !inDetail && homePanel === 'feed' && feedMode === 'explore' ? (
          <ExplorePanel
            catalog={HISTORY_CARDS}
            filteredCards={filteredCards}
            showDailyEdition={showDailyEdition}
            knownIds={knownIds}
            savedIds={savedIds}
            onOpenStory={openStory}
            emptyState={emptyState}
          />
        ) : inDetail && !activeStory ? (
          <div className="empty-state">
            <h2 className="empty-state-title">Story not found</h2>
            <p className="empty-state-body">It may have been removed from the catalog.</p>
            <button type="button" className="empty-state-action" onClick={closeStory}>
              Back to feed
            </button>
          </div>
        ) : inDetail && activeStory ? (
          <article
            className={`card card--detail${isNarrativeCard(activeStory) ? ' card--detail-narrative' : ''}`}
          >
            {isGeneratedStory && activeStory.generationStatus !== 'ready' ? (
              <div className="card-inner card-inner--detail">
                <LearningLessonPlaceholder
                  lesson={activePathLessonRaw}
                  trackMeta={activePathTrackMeta}
                  phase={lessonGenPhase ?? 'preparing'}
                  errorMessage={activePathLessonRaw?.generationError ?? undefined}
                  onRetry={() => void generateLessonForStory(activeStory)}
                />
              </div>
            ) : (
              <>
                {!isGeneratedStory && isNarrativeCard(activeStory) ? (
                  <div className="detail-mode-toggle" role="group" aria-label="Detail mode">
                    <button
                      type="button"
                      className={`detail-mode-btn${detailMode === 'story' ? ' active' : ''}`}
                      aria-pressed={detailMode === 'story'}
                      onClick={() => {
                        setDetailMode('story')
                        saveDetailModePreference('story')
                      }}
                    >
                      Story
                    </button>
                    <button
                      type="button"
                      className={`detail-mode-btn${detailMode === 'explainer' ? ' active' : ''}`}
                      aria-pressed={detailMode === 'explainer'}
                      onClick={() => {
                        setDetailMode('explainer')
                        saveDetailModePreference('explainer')
                      }}
                    >
                      Explainer
                    </button>
                  </div>
                ) : null}
                {isNarrativeCard(activeStory) && detailMode === 'story' ? (
                  <div className="card-inner card-inner--detail card-inner--rich">
                    <RichStoryDetail
                      card={activeStory}
                      badges={
                        (savedIds.has(activeStory.id) || knownIds.has(activeStory.id)) && (
                          <div className="story-card-tags">
                            {savedIds.has(activeStory.id) && (
                              <span className="meta-badge meta-badge--saved">Saved</span>
                            )}
                            {knownIds.has(activeStory.id) && (
                              <span className="meta-badge">Known</span>
                            )}
                          </div>
                        )
                      }
                      relatedCards={
                        narrativeRelated.length > 0 ? narrativeRelated : null
                      }
                      onOpenRelated={openStory}
                      onReadComplete={isGeneratedStory ? markActiveLessonComplete : undefined}
                    />
                  </div>
                ) : (
                  <>
                    <StoryDetailHero
                      card={activeStory}
                      badges={
                        (savedIds.has(activeStory.id) || knownIds.has(activeStory.id)) && (
                          <div className="story-card-tags">
                            {savedIds.has(activeStory.id) && (
                              <span className="meta-badge meta-badge--saved">Saved</span>
                            )}
                            {knownIds.has(activeStory.id) && (
                              <span className="meta-badge">Known</span>
                            )}
                          </div>
                        )
                      }
                    />
                    <div className="card-inner card-inner--detail">
                      <StoryDetailSections card={activeStory} />
                    </div>
                    {recommendedNext ? (
                      <div className="story-next">
                        <h3 className="story-section-label">Continue learning</h3>
                        <button
                          type="button"
                          className="story-next-card"
                          onClick={() =>
                            isGeneratedStory
                              ? openNextPathChapter(recommendedNext.id)
                              : openStory(recommendedNext.id)
                          }
                        >
                          <span className="story-next-title">{recommendedNext.title}</span>
                          <span className="story-next-meta">
                            {recommendedNext.domain}
                            {recommendedNext.format ? ` · ${recommendedNext.format}` : ''}
                          </span>
                        </button>
                      </div>
                    ) : null}
                  </>
                )}
              </>
            )}
            {isNarrativeCard(activeStory) &&
            detailMode === 'story' &&
            !narrativeRelated.length &&
            recommendedNext ? (
              <div className="story-next">
                <h3 className="story-section-label">Continue learning</h3>
                <button
                  type="button"
                  className="story-next-card"
                  onClick={() =>
                    isGeneratedStory
                      ? openNextPathChapter(recommendedNext.id)
                      : openStory(recommendedNext.id)
                  }
                >
                  <span className="story-next-title">{recommendedNext.title}</span>
                  <span className="story-next-meta">
                    {recommendedNext.domain}
                    {recommendedNext.format ? ` · ${recommendedNext.format}` : ''}
                  </span>
                </button>
              </div>
            ) : null}
            <div className="card-actions">
              {!isGeneratedStory ? (
                <>
                  <button
                    type="button"
                    className={`action-btn action-btn--known${knownIds.has(activeStory.id) ? ' known-active' : ''}`}
                    onClick={() => handleKnown(activeStory)}
                  >
                    I knew this
                  </button>
                  <button
                    type="button"
                    className={`action-btn action-btn--save${savedIds.has(activeStory.id) ? ' saved' : ''}`}
                    onClick={() => handleSave(activeStory)}
                    aria-pressed={savedIds.has(activeStory.id)}
                  >
                    {savedIds.has(activeStory.id) ? 'Saved ✓' : 'Save'}
                  </button>
                  <button
                    type="button"
                    className="action-btn action-btn--surprise"
                    onClick={handleSurprise}
                  >
                    Surprise me
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="action-btn action-btn--save"
                  onClick={backToPathScreen}
                >
                  Back to path
                </button>
              )}
            </div>
          </article>
        ) : null}
      </main>

      {!inDetail ? (
        <PrimaryNavigation active={homePanel} onChange={handlePrimaryNav} variant="bottom" />
      ) : null}

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  )
}

export default App
