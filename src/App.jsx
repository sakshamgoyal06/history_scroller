import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

const STORAGE_SAVED = 'history-feed-saved'
const STORAGE_KNOWN = 'history-feed-known'

const HISTORY_CARDS = [
  {
    id: 'alexandria',
    title: 'The Library of Alexandria',
    category: 'Ancient World',
    hook: 'A legend of lost knowledge that still shapes how we fund science today.',
    story:
      'The Library of Alexandria was less a single building than a evolving institution tied to Ptolemaic Egypt and later Roman rule. Scholars copied scrolls, debated astronomy, and translated texts from Hebrew, Persian, and Indian traditions. Ancient writers disagree on when fires and conflict destroyed collections—Caesar’s siege, Aurelian’s revolts, and later religious transitions all appear in the record. Archaeology offers only fragments, yet the library’s myth shaped how later cultures imagined knowledge as a public good worth protecting. Medieval monasteries, Islamic houses of wisdom, and modern universities all echo that ideal. The story persists because it names a fear we still feel: that one accident can erase centuries of collective memory and leave humanity starting over in the dark.',
    relevance:
      'Debates over open access, climate archives, and digital preservation replay the same question: who pays to keep humanity’s memory safe?',
    rabbitHole:
      'Which surviving ancient library—not Alexandria—actually left the largest trace on texts you can read today?',
  },
  {
    id: 'roman-concrete',
    title: 'Roman Concrete That Outlasted Empire',
    category: 'Ancient World',
    hook: 'Engineers today are reverse-engineering a recipe the Romans never wrote down.',
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
    story:
      'The plague that swept Eurasia in the mid-fourteenth century killed perhaps a third of Europe’s population within a few years. Labor scarcity suddenly gave surviving peasants leverage: wages rose, serfdom weakened, and landlords struggled to enforce old dues. In cities, guilds and councils gained voice as elites competed for taxpayers who could flee. Religious fervor spiked—flagellants, scapegoating of minorities, and vivid art of death—yet institutional Christianity also faced awkward questions about why prayers failed. The demographic shock accelerated shifts already underway, including the spread of gunpowder weapons and the appeal of printed texts after Gutenberg. Historians debate how much the plague “caused” versus “accelerated,” but the pattern is familiar: mass mortality rearranges who must be paid, who can organize, and which stories societies tell to make sense of sudden loss.',
    relevance:
      'Post-COVID labor shortages and housing debates echo medieval negotiations over who owes whom a living.',
    rabbitHole:
      'Did plague-driven wage gains in England truly begin the long decline of serfdom, or did law change first?',
  },
  {
    id: 'magna-carta',
    title: 'Magna Carta’s Messy Birth',
    category: 'Medieval',
    hook: 'A peace treaty born from baronial rage became a symbol lawyers far away would later reinvent.',
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
    story:
      'Johannes Gutenberg’s mid-fifteenth-century press combined oil-based ink, adjustable metal type, and a modified wine press to reproduce texts faster than scribes could copy them. Bibles and indulgence forms paid early bills, yet the real shift was pamphlets, maps, and scientific diagrams reaching merchants, students, and reformers within weeks. Catholic and Protestant leaders alike harnessed print for propaganda while censorship and licensing followed almost immediately—every information revolution triggers a counter-revolution in control. Literacy rates climbed slowly; the deeper change was the volume of competing voices. Empires used printed atlases to claim territory; alchemists shared recipes; women readers entered new literary markets. Historians compare the press to the internet not because effects were identical, but because both collapsed copying costs and forced elites to share narrative power with strangers they could not fully monitor or silence.',
    relevance:
      'Social feeds and AI-generated text replay Gutenberg-era fights over authorship, rumor, and who gets amplified.',
    rabbitHole:
      'Which technology—print or postal networks—spread Reformation ideas faster across Germany?',
  },
  {
    id: 'constantinople-1453',
    title: 'The Fall of Constantinople, 1453',
    category: 'Renaissance',
    hook: 'Cannons breached ancient walls—and rerouted minds, maps, and migration.',
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
    hook: 'Sound carried stories north when Jim Crow blocked so many other paths.',
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
    story:
      'The Universal Declaration of Human Rights emerged from United Nations committees chaired by Eleanor Roosevelt alongside diplomats from Chile, China, Lebanon, and others drafting articles on dignity, speech, asylum, and education. It was not a treaty with courts attached; superpowers still held empires and segregated citizens at home. Yet the text gave activists a shared lexicon to challenge apartheid, gender discrimination, and torture with phrases governments themselves had endorsed on paper. Cold War rivals each claimed to fulfill rights while accusing opponents of violations—a propaganda game that nonetheless legitimized monitoring NGOs. Later covenants tried to add teeth through reporting mechanisms, though enforcement remains uneven. The declaration’s power is rhetorical and legal scaffolding: courts cite it; movements wave it. Studying its birth reveals how compromise language—“free and equal”—can become a weapon for the marginalized when archives prove hypocrisy.',
    relevance:
      'Digital privacy charters and AI ethics frameworks copy the UDHR playbook: declare norms before enforcement exists.',
    rabbitHole:
      'Which UDHR article provoked the most delegate walkouts during drafting—and what compromise survived?',
  },
]

const CATEGORY_LIST = [...new Set(HISTORY_CARDS.map((c) => c.category))]

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function App() {
  const [selectedCategories, setSelectedCategories] = useState(() => new Set())
  const [showSavedOnly, setShowSavedOnly] = useState(false)
  const [filterListOpen, setFilterListOpen] = useState(false)
  const [savedCards, setSavedCards] = useState(() =>
    loadJson(STORAGE_SAVED, []),
  )
  const [knownIds, setKnownIds] = useState(() => new Set(loadJson(STORAGE_KNOWN, [])))
  const [toast, setToast] = useState('')
  const cardRefs = useRef({})
  const toastTimer = useRef(null)

  const savedIds = useMemo(
    () => new Set(savedCards.map((c) => c.id)),
    [savedCards],
  )

  const savedCardsLive = useMemo(() => {
    const byId = new Map(HISTORY_CARDS.map((c) => [c.id, c]))
    return savedCards.map((s) => byId.get(s.id) ?? s)
  }, [savedCards])

  const filteredCards = useMemo(() => {
    let pool = showSavedOnly ? savedCardsLive : HISTORY_CARDS
    if (selectedCategories.size > 0) {
      pool = pool.filter((c) => selectedCategories.has(c.category))
    }
    return pool
  }, [showSavedOnly, savedCardsLive, selectedCategories])

  const allCategoriesSelected = selectedCategories.size === 0

  const toggleSavedView = useCallback(() => {
    setShowSavedOnly((on) => !on)
    setFilterListOpen(false)
  }, [])

  const selectAllCategories = useCallback(() => {
    setSelectedCategories(new Set())
    setShowSavedOnly(false)
  }, [])

  const toggleCategory = useCallback((category) => {
    setShowSavedOnly(false)
    setSelectedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(category)) next.delete(category)
      else next.add(category)
      return next
    })
  }, [])

  const toggleCategoryFromList = useCallback((category) => {
    toggleCategory(category)
  }, [toggleCategory])

  const clearCategoryFilters = useCallback(() => {
    setSelectedCategories(new Set())
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_SAVED, JSON.stringify(savedCards))
  }, [savedCards])

  useEffect(() => {
    localStorage.setItem(STORAGE_KNOWN, JSON.stringify([...knownIds]))
  }, [knownIds])

  const showToast = useCallback((message) => {
    setToast(message)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 2200)
  }, [])

  const handleSave = useCallback(
    (card) => {
      setSavedCards((prev) => {
        if (prev.some((c) => c.id === card.id)) {
          showToast('Already in your saved stack')
          return prev
        }
        showToast('Saved for later')
        return [...prev, card]
      })
    },
    [showToast],
  )

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

  const handleSurprise = useCallback(() => {
    const pool = filteredCards
    if (pool.length === 0) return
    const unknown = pool.filter((c) => !knownIds.has(c.id))
    const pickFrom = unknown.length > 0 ? unknown : pool
    const card = pickFrom[Math.floor(Math.random() * pickFrom.length)]
    const el = cardRefs.current[card.id]
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    showToast(`Surprise: ${card.title}`)
  }, [filteredCards, knownIds, showToast])

  return (
    <div className="app">
      <header className="top-bar">
        <div className="brand">
          <h1>{showSavedOnly ? 'Saved' : 'History Feed'}</h1>
          <button
            type="button"
            className={`saved-toggle${showSavedOnly ? ' active' : ''}`}
            onClick={toggleSavedView}
            aria-pressed={showSavedOnly}
          >
            {savedCards.length} saved
          </button>
        </div>

        <div className="filter-toolbar">
          <div className="filters-scroll" aria-label="Category filters">
            <nav className="filters">
              <button
                type="button"
                className={`filter-chip${!showSavedOnly && allCategoriesSelected ? ' active' : ''}`}
                onClick={selectAllCategories}
              >
                All
              </button>
              {CATEGORY_LIST.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`filter-chip${selectedCategories.has(cat) ? ' active' : ''}`}
                  onClick={() => toggleCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </nav>
          </div>
          <button
            type="button"
            className={`filter-list-toggle${filterListOpen ? ' active' : ''}`}
            onClick={() => setFilterListOpen((o) => !o)}
            aria-expanded={filterListOpen}
            aria-controls="category-filter-list"
          >
            List
          </button>
        </div>

        {filterListOpen && (
          <div
            id="category-filter-list"
            className="filter-list-panel"
            role="group"
            aria-label="Multi-select categories"
          >
            <div className="filter-list-head">
              <span className="filter-list-title">Categories</span>
              {selectedCategories.size > 0 && (
                <button
                  type="button"
                  className="filter-list-clear"
                  onClick={clearCategoryFilters}
                >
                  Clear
                </button>
              )}
            </div>
            <ul className="filter-list">
              {CATEGORY_LIST.map((cat) => (
                <li key={cat}>
                  <label className="filter-list-item">
                    <input
                      type="checkbox"
                      checked={selectedCategories.has(cat)}
                      onChange={() => toggleCategoryFromList(cat)}
                    />
                    <span>{cat}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>

      <main className="feed">
        {filteredCards.length === 0 ? (
          <p className="empty-state">
            {showSavedOnly
              ? savedCards.length === 0
                ? 'Nothing saved yet. Tap Save on a story to collect it here.'
                : 'No saved stories match these filters.'
              : selectedCategories.size > 0
                ? 'No stories match the selected categories.'
                : 'No stories to show.'}
          </p>
        ) : (
          filteredCards.map((card) => (
            <article
              key={card.id}
              id={`card-${card.id}`}
              ref={(node) => {
                if (node) cardRefs.current[card.id] = node
              }}
              className={`card${knownIds.has(card.id) ? ' known' : ''}`}
            >
              <div className="card-inner">
                <div className="card-meta">
                  <span className="category">{card.category}</span>
                  {knownIds.has(card.id) && (
                    <span className="known-badge">Known</span>
                  )}
                </div>
                <h2 className="card-title">{card.title}</h2>
                <p className="hook">{card.hook}</p>
                <p className="story">{card.story}</p>
                <div className="card-asides">
                  <div className="aside">
                    <span className="aside-label">Why it matters today</span>
                    <p className="aside-text">{card.relevance}</p>
                  </div>
                  <div className="aside">
                    <span className="aside-label">Rabbit hole</span>
                    <p className="aside-text">{card.rabbitHole}</p>
                  </div>
                </div>
              </div>
              <div className="card-actions">
                <button
                  type="button"
                  className={`action-btn action-btn--known${knownIds.has(card.id) ? ' known-active' : ''}`}
                  onClick={() => handleKnown(card)}
                >
                  I knew this
                </button>
                <button
                  type="button"
                  className={`action-btn action-btn--save${savedIds.has(card.id) ? ' saved' : ''}`}
                  onClick={() => handleSave(card)}
                >
                  {savedIds.has(card.id) ? 'Saved' : 'Save'}
                </button>
                <button
                  type="button"
                  className="action-btn action-btn--surprise"
                  onClick={handleSurprise}
                >
                  Surprise me
                </button>
              </div>
            </article>
          ))
        )}
      </main>

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  )
}

export default App
