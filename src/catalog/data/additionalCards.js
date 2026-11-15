/** Additional catalog entries (v0.2 expansion). Merged into HISTORY_CARDS in App.jsx. */
export const ADDITIONAL_LEARNING_CARDS = [
  // Economics (4)
  {
    id: 'opportunity-cost',
    title: 'Opportunity Cost in Plain Terms',
    domain: 'Economics',
    format: 'Explainer',
    hook: 'Every “yes” to one option is a quiet “no” to another—and economists gave that tradeoff a name.',
    scene: 'You can spend an hour studying, working, or resting—but not all three at once.',
    coreFact:
      'Opportunity cost is the value of the next-best alternative you give up when you choose something. It is not always money: time, attention, and risk count too. Businesses use it when comparing projects; governments use it when budgeting public land or staff hours. The idea clarifies why “free” choices still have costs somewhere in the system.',
    whyItMatters:
      'Budget headlines and product roadmaps hide tradeoffs; naming opportunity cost makes debates about priorities more precise.',
    rabbitHole: 'Why did early economists tie opportunity cost to forgone utility rather than only forgone cash?',
  },
  {
    id: 'inflation-basket',
    title: 'How an Inflation “Basket” Works',
    domain: 'Economics',
    format: 'Explainer',
    hook: 'Inflation numbers come from a shopping list—not from every price in the economy at once.',
    scene: 'Statisticians track a sample of goods and services that typical households buy over time.',
    coreFact:
      'Consumer price indexes weight items like housing, food, transport, and medical care according to survey data. When the basket’s total cost rises compared with a base year, reported inflation goes up. Method tweaks—which items enter, how quality changes are adjusted—can shift the index slightly even when lived experience feels different.',
    whyItMatters:
      'Wage clauses, bond yields, and benefit adjustments often peg to these indexes, so their design affects millions of contracts.',
    rabbitHole: 'How do statistical agencies treat products that improve rapidly, like smartphones, without double-counting quality?',
  },
  {
    id: 'comparative-advantage',
    title: 'Comparative Advantage Without Jargon',
    domain: 'Economics',
    format: 'Explainer',
    hook: 'Countries still trade when one could make everything “cheaper”—because relative efficiency matters.',
    scene: 'Two regions can each focus on what they sacrifice least to produce, then swap the rest.',
    coreFact:
      'Comparative advantage says gains from trade come from differences in opportunity costs, not from being best at everything. Even if one place is more productive across the board, both sides can benefit by specializing where their relative efficiency is highest and trading for the rest. The model assumes trade is voluntary and costs of transport stay manageable.',
    whyItMatters:
      'Supply chains and tariff debates often confuse “who is fastest” with “who gives up less”—this idea separates the two.',
    rabbitHole: 'What assumptions break comparative advantage when supply chains face sudden embargoes or bottlenecks?',
  },
  {
    id: 'money-multiplier',
    title: 'Why Banks Lend More Than Their Vault Cash',
    domain: 'Economics',
    format: 'Explainer',
    hook: 'A deposit can ripple through the banking system under rules set by regulators—not by unlimited magic.',
    scene: 'When you deposit money, the bank keeps a required fraction in reserve and lends the rest.',
    coreFact:
      'Fractional reserve banking means institutions hold only part of deposits as central-bank reserves and allocate the remainder to loans or securities, within capital and liquidity rules. Repaid loans can become new deposits elsewhere, so the money supply can grow through lending activity. Central banks influence the pace through reserve requirements, interest rates, and supervision.',
    whyItMatters:
      'Credit availability, housing markets, and crisis responses all connect to how tightly this lending loop is supervised.',
    rabbitHole: 'How did post-2008 reforms change the link between reserves and lending compared with textbook multiplier stories?',
  },
  // Geography (4)
  {
    id: 'rain-shadow',
    title: 'Rain Shadows and Dry Leeward Slopes',
    domain: 'Geography',
    format: 'Explainer',
    hook: 'One side of a mountain range can be lush while the other looks like a desert—for predictable reasons.',
    scene: 'Moist air climbs a range, cools, drops rain, and descends warmer and drier on the far side.',
    coreFact:
      'Rain-shadow deserts form when prevailing winds push air upslope. Water vapor condenses and falls as precipitation on the windward side. Leeward air compresses and heats, raising its capacity to hold moisture without raining. Examples appear worldwide wherever tall barriers sit across dominant wind flows.',
    whyItMatters:
      'Farm planning, wildfire risk, and city water sources often depend on which side of a range a community occupies.',
    rabbitHole: 'Which coast ranges create the sharpest rain-shadow contrast relative to their height?',
  },
  {
    id: 'plate-boundaries',
    title: 'Three Ways Plates Meet',
    domain: 'Geography',
    format: 'Map',
    hook: 'Earth’s surface is a slow puzzle of moving plates—and their edges explain quakes and volcanoes.',
    scene: 'Geologists map divergent, convergent, and transform boundaries where plates slide, collide, or pull apart.',
    coreFact:
      'At divergent boundaries, plates separate and magma can create new crust, as along mid-ocean ridges. Convergent boundaries squeeze crust, building mountains and trenches. Transform boundaries slide past each other, storing stress released in earthquakes. Hot spots can punch through plates away from edges, forming island chains.',
    whyItMatters:
      'Building codes, tsunami planning, and mineral deposits all trace back to which boundary type lies nearby.',
    rabbitHole: 'Why do some subduction zones produce more explosive volcanoes than others?',
  },
  {
    id: 'monsoon-pattern',
    title: 'What Drives a Monsoon',
    domain: 'Geography',
    format: 'Explainer',
    hook: 'Monsoons are seasonal wind reversals—not just “a lot of rain in summer.”',
    scene: 'Land heats faster than ocean, shifting pressure and pulling moisture-laden air inland for months.',
    coreFact:
      'Monsoon systems arise from differential heating between continents and surrounding seas. Warm land lowers pressure, drawing in humid maritime air that rises, cools, and produces seasonal rains. Winter often reverses the flow, bringing drier conditions. Agriculture across South Asia, West Africa, and parts of the Americas paces planting to these rhythms.',
    whyItMatters:
      'Food prices and hydropower output swing with monsoon timing, even for countries far from the farms affected.',
    rabbitHole: 'How do El Niño events shift monsoon onset dates in measurable ways?',
  },
  {
    id: 'exclusive-economic-zone',
    title: 'Coastal Waters and EEZs',
    domain: 'Geography',
    format: 'Institution',
    hook: 'Nations claim more than their beaches—they claim bands of ocean under international rules.',
    scene: 'From shore outward, zones define who manages fish, seabed resources, and shipping rights.',
    coreFact:
      'Under the UN Convention on the Law of the Sea framework, an Exclusive Economic Zone generally extends up to 200 nautical miles from a baseline coast. Coastal states hold rights to explore and manage living and non-living resources in the water column and seabed, while other nations retain navigation and overflight freedoms. Overlaps and straits create negotiated exceptions.',
    whyItMatters:
      'Fishing quotas, offshore wind leases, and submarine cable routes all intersect these mapped zones.',
    rabbitHole: 'How are EEZ boundaries drawn when coasts face each other across less than 400 nautical miles?',
  },
  // Civics (4)
  {
    id: 'separation-of-powers',
    title: 'Separating Powers in Modern States',
    domain: 'Civics',
    format: 'Institution',
    hook: 'Many constitutions split government into branches so no single office holds every lever.',
    scene: 'Legislatures write rules, executives carry them out, and courts interpret disputes—ideally with checks between them.',
    coreFact:
      'Separation of powers distributes lawmaking, enforcement, and adjudication across institutions. Checks such as veto power, judicial review, or legislative oversight aim to limit overreach. Designs vary: parliamentary systems fuse executive and legislative majorities more tightly than presidential ones. The goal is procedural balance, not guaranteed agreement.',
    whyItMatters:
      'Court cases, emergency orders, and budget fights make more sense when you know which branch owns which step.',
    rabbitHole: 'Which democracies blend parliamentary and presidential features, and why?',
  },
  {
    id: 'jury-system',
    title: 'What Juries Are For',
    domain: 'Civics',
    format: 'Institution',
    hook: 'Randomly chosen citizens still decide facts in many courtrooms—a practice with ancient roots.',
    scene: 'Eligible residents receive summons, hear evidence under judge guidance, and return verdicts in serious trials.',
    coreFact:
      'Trial juries apply law to facts in criminal and some civil cases. Judges instruct on legal standards; jurors deliberate privately. Rules on unanimity, jury size, and eligible offenses differ by jurisdiction. Supporters cite community legitimacy; critics note complexity bias and representation challenges. Many countries use bench trials instead for some matters.',
    whyItMatters:
      'News about high-profile trials often skips procedural rules that actually constrain what jurors may consider.',
    rabbitHole: 'How do continental European systems handle fact-finding without lay juries in most cases?',
  },
  {
    id: 'census-count',
    title: 'Why Countries Run Censuses',
    domain: 'Civics',
    format: 'Institution',
    hook: 'A national head count redraws maps, budgets, and research baselines for a decade or more.',
    scene: 'Household forms and field enumerators collect age, housing, and location data on a set census day or period.',
    coreFact:
      'Censuses provide denominators for representation formulas, equalization payments, and urban planning. Statisticians publish anonymized tabulations while guarding individual privacy through suppression rules. Undercounts in remote or mobile populations can skew funding unless corrected with follow-up surveys. Many nations now blend traditional forms with administrative records.',
    whyItMatters:
      'School seat projections, transit grants, and public-health rates often start from census blocks.',
    rabbitHole: 'What statistical techniques fix undercount bias without revealing private responses?',
  },
  {
    id: 'public-records-laws',
    title: 'Public Records and Transparency Laws',
    domain: 'Civics',
    format: 'Explainer',
    hook: 'Many governments must release documents on request—within written exceptions.',
    scene: 'Citizens, journalists, and researchers file forms asking for emails, contracts, or inspection reports.',
    coreFact:
      'Freedom-of-information statutes set timelines for agencies to respond and list exemptions such as active law-enforcement investigations, personal privacy, or national-security classifications. Fees may cover copying costs. Appeals bodies or courts resolve disputes when agencies withhold material. Scope varies: some regimes cover all public bodies; others exclude courts or legislators.',
    whyItMatters:
      'Environmental spills, procurement scandals, and safety audits often surface first through records requests, not press releases.',
    rabbitHole: 'How do “sunshine” laws differ for local municipalities versus national ministries?',
  },
  // Technology (4)
  {
    id: 'how-wifi-works',
    title: 'Wi‑Fi Is a Radio Link, Not the Internet',
    domain: 'Technology',
    format: 'Explainer',
    hook: 'Your router speaks radio to your phone; the wider internet usually rides on cables or fiber beyond it.',
    scene: 'Data packets hop from device to access point, then through a modem and ISP network toward servers.',
    coreFact:
      'Wi‑Fi uses standardized radio protocols in unlicensed bands to link devices to a local router. The router forwards frames to a modem or gateway that connects to an internet service provider. Speed drops with distance, walls, and interference from neighbors’ networks. Security relies on encryption protocols configured on the access point.',
    whyItMatters:
      'Home slowdowns often come from local wireless congestion, not from “the whole internet” failing.',
    rabbitHole: 'Why did Wi‑Fi move from 2.4 GHz toward 5 GHz and 6 GHz bands for capacity?',
  },
  {
    id: 'qr-code-basics',
    title: 'How QR Codes Pack Data',
    domain: 'Technology',
    format: 'Explainer',
    hook: 'Those square barcodes are readable even when partly damaged—by design.',
    scene: 'Cameras scan black-and-white modules; error correction rebuilds missing pieces into URLs or text.',
    coreFact:
      'QR codes store bits in a grid with finder patterns for orientation. Reed–Solomon error correction adds redundant data so smudged labels still decode. Payloads can be URLs, payment tokens, or Wi‑Fi join credentials. The standard defines version sizes and masking patterns to balance density and scan reliability.',
    whyItMatters:
      'Ticketing, menus, and device pairing exploded after smartphones shipped cameras that decode QR natively.',
    rabbitHole: 'How much data can the largest QR versions hold compared with traditional UPC barcodes?',
  },
  {
    id: 'gps-satellite-timing',
    title: 'GPS Needs Atomic Clocks in Space',
    domain: 'Technology',
    format: 'Explainer',
    hook: 'Navigation satellites are flying clocks; your phone measures tiny time differences to find you.',
    scene: 'Each satellite broadcasts a timestamp; receivers compare signals to triangulate position.',
    coreFact:
      'Global navigation systems place precise atomic clocks on satellites orbiting Earth. A receiver calculates distance to each satellite from how long signals take to arrive, then intersects those ranges to estimate location. Relativistic effects slightly shift satellite clocks relative to ground, so corrections are built into the system. Urban canyons and indoors weaken accuracy without supplemental sensors.',
    whyItMatters:
      'Shipping, aviation, and synchronized power grids depend on timing signals derived from the same satellite networks.',
    rabbitHole: 'How do dual-frequency GPS signals reduce ionospheric error compared with single-frequency fixes?',
  },
  {
    id: 'encryption-at-rest',
    title: 'Encrypting Data at Rest',
    domain: 'Technology',
    format: 'Explainer',
    hook: 'Locked phones scramble stored files so disks alone do not reveal contents.',
    scene: 'A key derived from your passcode or secure chip protects files even if hardware is stolen.',
    coreFact:
      'Encryption at rest transforms data into ciphertext on storage media using secret keys. Full-disk and file-level approaches differ in granularity. Hardware security modules or trusted platform modules can guard keys separately from the main processor. Without the key, forensic access sees pseudorandom bytes, though poorly implemented systems may leak keys through software bugs.',
    whyItMatters:
      'Lost laptops and recycled drives make at-rest encryption a baseline control for organizations handling personal data.',
    rabbitHole: 'What is the difference between symmetric keys used for bulk encryption and asymmetric keys used for key exchange?',
  },
  // Current Affairs–style evergreen (3)
  {
    id: 'supply-chain-safety-stock',
    title: 'Safety Stock vs Just-in-Time',
    domain: 'Current Affairs',
    format: 'Explainer',
    hook: 'Lean inventories save money until a shock proves expensive—planners weigh both sides constantly.',
    scene: 'Factories and retailers choose how much buffer to keep when demand or shipping wobbles.',
    coreFact:
      'Just-in-time systems minimize warehouse costs by syncing deliveries closely with production schedules. Safety stock adds extra inventory to absorb supplier delays or demand spikes. Carrying buffer ties up cash and storage; skipping it raises outage risk when ports, weather, or component shortages disrupt flows. Many firms blend strategies by item criticality.',
    whyItMatters:
      'Empty shelves during global disruptions revived public debate about resilience versus efficiency in supply networks.',
    rabbitHole: 'Which industries legally require minimum stockpiles regardless of corporate JIT preferences?',
  },
  {
    id: 'renewable-intermittency',
    title: 'Why Renewables Need Flexible Backup',
    domain: 'Current Affairs',
    format: 'Explainer',
    hook: 'Solar and wind output swing with weather—grids must balance supply and demand every second.',
    scene: 'Operators combine forecasts, storage, transmission, and dispatchable plants to keep frequency stable.',
    coreFact:
      'Variable renewable generation rises and falls with sun and wind, not with customer clicks. Grid operators use weather models, geographic diversity, hydro storage, batteries, and fast-ramping plants to match load. Interconnecting regions trades surpluses for deficits. Long-duration storage and demand response programs remain active engineering and policy topics worldwide.',
    whyItMatters:
      'Electricity price spikes and blackout prevention strategies increasingly mention flexibility, not only total megawatts installed.',
    rabbitHole: 'How do negative wholesale power prices appear when renewable output exceeds local demand?',
  },
  {
    id: 'misinformation-correction',
    title: 'How Fact-Checks Are Structured',
    domain: 'Current Affairs',
    format: 'Explainer',
    hook: 'Professional fact-checking follows repeatable steps—even when headlines feel instantaneous.',
    scene: 'Teams locate original sources, contact experts, and publish ratings with evidence links.',
    coreFact:
      'Fact-check organizations typically trace claims to primary documents, datasets, or dated media. Reviewers document methodology, disclose uncertainties, and classify verdicts using transparent rubrics. Corrections policies address errors publicly. Studies show corrections spread more slowly than original false claims, so repeat exposure and context labels are active research areas—not partisan tricks by themselves.',
    whyItMatters:
      'Platforms and classrooms alike borrow fact-check formats to teach source verification skills.',
    rabbitHole: 'What does academic research say about “backfire effects” when corrections challenge deeply held beliefs?',
  },
  // Science (3)
  {
    id: 'photosynthesis-equation',
    title: 'Photosynthesis in One Mechanism',
    domain: 'Science',
    format: 'Explainer',
    hook: 'Plants turn light into stored chemical energy using a process you can summarize in a single equation.',
    scene: 'Chloroplasts capture photons, split water, and fix carbon dioxide into sugars.',
    coreFact:
      'Photosynthesis converts light energy, carbon dioxide, and water into glucose and oxygen. Light-dependent reactions in thylakoid membranes generate ATP and NADPH; Calvin-cycle enzymes in the stroma assemble carbon skeletons. Efficiency varies by species and conditions; only part of incoming light becomes biomass. The oxygen we breathe is a by-product of water splitting.',
    whyItMatters:
      'Crop yields, forest carbon storage, and algae biofuel research all hinge on tuning or mimicking this pathway.',
    rabbitHole: 'Why do C4 and CAM plants add extra steps compared with classic C3 photosynthesis?',
  },
  {
    id: 'herd-immunity-threshold',
    title: 'Herd Immunity as a Threshold Idea',
    domain: 'Science',
    format: 'Explainer',
    hook: 'When enough people are immune, pathogens struggle to find new hosts—mathematically and practically.',
    scene: 'Each infection generates a reproduction number depending on contacts and susceptibility.',
    coreFact:
      'Herd immunity describes the share of immune individuals needed to shrink epidemic growth on average. The threshold rises with contagiousness: more transmissible agents need higher coverage. Immunity may come from vaccination or prior infection, and waning immunity lowers effective coverage over time. Public-health teams model thresholds; they are guides, not magic off-switches.',
    whyItMatters:
      'Vaccine schedule debates and school outbreak policies reference these models when setting coverage goals.',
    rabbitHole: 'How does heterogeneous mixing—some people contacting many others—change simple herd-immunity formulas?',
  },
  {
    id: 'crispr-gene-edit',
    title: 'CRISPR as Molecular Scissors',
    domain: 'Science',
    format: 'Explainer',
    hook: 'Bacteria borrowed from yogurt science became a tool to snip DNA at chosen addresses.',
    scene: 'Guide RNA matches a target sequence; Cas enzymes cut DNA so cells repair or insert new code.',
    coreFact:
      'CRISPR systems use programmable RNA to direct nucleases like Cas9 to specific genomic sequences. Double-strand breaks trigger repair pathways that can disable genes or insert templates. Labs apply the tool in agriculture, medicine research, and diagnostics under varying regulatory oversight. Off-target cuts and delivery into tissues remain active safety engineering problems.',
    whyItMatters:
      'Clinical trials and crop breeding headlines often mention CRISPR without explaining the cut-and-repair loop.',
    rabbitHole: 'What do base editors and prime editors change compared with classic CRISPR cutting?',
  },
  // General Knowledge (3)
  {
    id: 'metric-prefixes',
    title: 'Reading Metric Prefixes',
    domain: 'General Knowledge',
    format: 'Explainer',
    hook: 'Kilo-, mega-, giga- are not random—they are standardized powers of ten.',
    scene: 'Prefixes scale units so writers can express tiny or huge quantities with the same base measure.',
    coreFact:
      'The International System of Units attaches prefixes to meters, grams, seconds, and derived units. Kilo means ×10³; mega ×10⁶; giga ×10⁹; milli ×10⁻³; micro ×10⁻⁶. Consistent prefixes reduce conversion errors in science, computing, and medicine. Some fields retain non-SI units historically, but SI prefixes appear worldwide on packaging and datasheets.',
    whyItMatters:
      'Misreading mega- as milli- has caused real engineering and dosage mistakes—prefix literacy is a safety skill.',
    rabbitHole: 'Why did SI adopt k for kilo while computer science sometimes uses K for 1024 in binary contexts?',
  },
  {
    id: 'leap-year-rule',
    title: 'Why Leap Years Exist',
    domain: 'General Knowledge',
    format: 'Explainer',
    hook: 'Earth’s year is not exactly 365 days—calendars add a day occasionally to stay aligned with seasons.',
    scene: 'Without correction, solstice dates would drift through the months over centuries.',
    coreFact:
      'A tropical year is about 365.2422 days. The Gregorian calendar adds February 29 in years divisible by 4, except centuries unless divisible by 400. That pattern keeps equinoxes roughly stable for civic and agricultural scheduling. Older Julian calendars drifted faster because they ignored century exceptions.',
    whyItMatters:
      'Software timers, payroll cycles, and sports schedules all embed leap-day rules that broke systems when ignored.',
    rabbitHole: 'How do lunar calendars handle drift differently from solar calendars like the Gregorian one?',
  },
  {
    id: 'time-zones-offset',
    title: 'Time Zones as Offsets, Not Physics',
    domain: 'General Knowledge',
    format: 'Explainer',
    hook: 'Clocks change at political borders—time zones follow agreements, not pure longitude math alone.',
    scene: 'Countries pick standard offsets from Coordinated Universal Time, sometimes splitting regions for convenience.',
    coreFact:
      'The globe divides into roughly 24 standard zones, each about 15 degrees of longitude wide in theory. Actual borders zigzag to keep nations or economic regions on one clock. Daylight-saving shifts add seasonal offsets in some jurisdictions. Aviation and computing store instants in UTC, converting for display.',
    whyItMatters:
      'Meeting invites and transaction timestamps confuse people when offsets and DST rules differ by country.',
    rabbitHole: 'Why do some countries abolish daylight saving while neighbors keep it?',
  },
]
