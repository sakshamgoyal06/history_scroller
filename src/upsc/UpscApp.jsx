import { useCallback, useMemo, useRef, useState } from 'react'
import { STORAGE_KEYS, readJson, writeJson } from '../storage/localStore.js'
import { Wordmark } from '../mode/ModeToggle.jsx'
import { ASK_SUGGESTIONS, SAMPLE_EDITION_DATE, UPSC_EXPLAINERS, UPSC_SAMPLE_POSTS } from './upscContent.js'
import { GS_PAPERS, POST_STEPS, buildUpscFeed, gsCounts, splitHighlights } from './upscFeed.js'
import './upsc.css'

const GS_FILTERS = ['All', ...GS_PAPERS]

function Marked({ text }) {
  return splitHighlights(text).map((seg, i) =>
    seg.mark ? (
      <mark key={i} className="study-mark">
        {seg.text}
      </mark>
    ) : (
      <span key={i}>{seg.text}</span>
    ),
  )
}

function Flag({ gs, children }) {
  return <span className={`gs-flag gs-flag--${gs.toLowerCase()}`}>{children}</span>
}

function sourcesLine(sources) {
  return sources.map((s) => `${s.publisher}, ${s.title}`).join(' · ')
}

function loadSaved() {
  const ids = readJson(STORAGE_KEYS.upscSaved, [])
  return new Set(Array.isArray(ids) ? ids : [])
}

/** Explainer content: editor-checked when cached, otherwise built from the post's own fields. */
function explainerFor(id) {
  if (UPSC_EXPLAINERS[id]) return UPSC_EXPLAINERS[id]
  const post = UPSC_SAMPLE_POSTS.find((p) => p.id === id)
  if (!post) return null
  return {
    id,
    title: post.head,
    gs: post.gs,
    gsArea: post.gsArea,
    oneLine: post.background,
    context: post.what,
    facts: post.facts ?? [],
    mainsAngle: post.why,
    sources: post.sources,
    reviewed: true,
    fromPost: true,
  }
}

function UpscPost({ post, index, total, step, onStep, saved, onSave, onExplain }) {
  const k = step ?? 0
  const advance = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const dir = e.clientX - rect.left < rect.width * 0.35 ? -1 : 1
    onStep(Math.max(0, Math.min(POST_STEPS.length - 1, k + dir)))
  }
  const onKey = (e) => {
    if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onStep(Math.min(POST_STEPS.length - 1, k + 1))
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      onStep(Math.max(0, k - 1))
    }
  }

  return (
    <section className="u-post" aria-label={`Item ${index + 1} of ${total}: ${post.head}`}>
      <div className="u-post-top">
        <Flag gs={post.gs}>
          {post.gs} · {post.gsArea}
        </Flag>
        <span className="u-mono">
          {index + 1} / {total} · {post.minutes} min
        </span>
      </div>
      <h2 className="u-head">{post.head}</h2>
      <div className="u-steps" role="tablist" aria-label="Post sections">
        {POST_STEPS.map((label, j) => (
          <button
            key={label}
            type="button"
            role="tab"
            aria-selected={j === k}
            className={`u-step${j < k ? ' is-done' : ''}${j === k ? ' is-on' : ''}`}
            onClick={() => onStep(j)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="u-body" role="tabpanel" tabIndex={0} onClick={advance} onKeyDown={onKey}>
        {k === 0 ? <p>{post.what}</p> : null}
        {k === 1 ? <p>{post.background}</p> : null}
        {k === 2 ? (
          <>
            <span className="u-kicker">For Prelims</span>
            <ul className="u-facts">
              {post.facts.map((f) => (
                <li key={f}>
                  <span>
                    <Marked text={f} />
                  </span>
                </li>
              ))}
            </ul>
          </>
        ) : null}
        {k === 3 ? (
          <>
            <span className="u-kicker">For Mains</span>
            <p>{post.why}</p>
          </>
        ) : null}
        <span className="u-hint">{k < 3 ? `Tap for ${POST_STEPS[k + 1].toLowerCase()}` : 'Scroll for the next item'}</span>
      </div>
      <div className="u-foot">
        <button type="button" className="u-btn" onClick={onExplain}>
          <span>Explain it UPSC-style</span>
          <span aria-hidden="true">→</span>
        </button>
        <button type="button" className="u-btn-line" aria-pressed={saved} onClick={onSave}>
          {saved ? 'Saved' : `Save to ${post.gs}`}
        </button>
        <p className="u-src">Sources: {sourcesLine(post.sources)}</p>
      </div>
    </section>
  )
}

function InterestingPost({ post }) {
  return (
    <section className="u-post" aria-label={post.head}>
      <div className="u-post-top">
        <span className="gs-flag gs-flag--neutral">Good to know · {post.gs}</span>
        <span className="u-mono">{post.minutes} min</span>
      </div>
      <h2 className="u-head">{post.head}</h2>
      <div className="u-body u-body--static">
        {post.body.map((b) => (
          <p key={b}>{b}</p>
        ))}
      </div>
      <div className="u-foot">
        <p className="u-src">Sources: {sourcesLine(post.sources)}</p>
      </div>
    </section>
  )
}

function CaughtUp({ counts, onAsk, onLibrary }) {
  return (
    <section className="u-post u-end" aria-label="Caught up">
      <span className="u-mono">Sample edition</span>
      <div className="u-stamp">
        Caught up
        <br />
        <mark className="study-mark">on today.</mark>
      </div>
      <div className="u-tally">
        {GS_PAPERS.map((g) => (
          <div key={g} className={`u-tally-${g.toLowerCase()}`}>
            <b>{counts[g]}</b>
            {g}
          </div>
        ))}
      </div>
      <ul className="u-rows">
        <li>
          <button type="button" className="u-row" onClick={onAsk}>
            <b>Ask about anything</b>
            <small>Any topic, event or question, explained UPSC-style</small>
          </button>
        </li>
        <li>
          <button type="button" className="u-row" onClick={onLibrary}>
            <b>Your GS shelves</b>
            <small>Everything you saved, by paper</small>
          </button>
        </li>
        <li>
          <div className="u-row">
            <b>Weekly quiz</b>
            <small>Add-on, comes later</small>
          </div>
        </li>
      </ul>
      <p className="u-mono u-end-next">Next edition: tomorrow, 9:00 AM IST</p>
    </section>
  )
}

function Explainer({ explainer, saved, onSave }) {
  const ref = useRef(null)
  const sections = [
    ['ex-context', 'Context', true],
    ['ex-static', 'Static link', !!explainer.staticLink],
    ['ex-facts', 'Prelims facts', explainer.facts.length > 0],
    ['ex-debate', 'Debate', !!explainer.argumentsFor],
    ['ex-way', 'Way forward', !!explainer.wayForward],
    ['ex-mains', 'Mains', true],
    ['ex-sources', 'Sources', true],
  ].filter((s) => s[2])
  const jump = (id) => {
    const el = ref.current?.querySelector(`#${id}`)
    el?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }

  return (
    <div className="u-explainer" ref={ref}>
      <div className="u-exp-top">
        <Flag gs={explainer.gs}>
          {explainer.gs} · {explainer.gsArea}
        </Flag>
        <h1>{explainer.title}</h1>
        <div className="u-exp-meta">
          <span className="u-mono">
            {explainer.reviewed ? 'Editor-checked · opens instantly' : 'AI-written · sources checked automatically'}
          </span>
          <button type="button" className="u-btn-line u-btn-line--small" aria-pressed={saved} onClick={onSave}>
            {saved ? 'Saved' : `Save to ${explainer.gs}`}
          </button>
        </div>
      </div>
      <nav className="u-exp-index" aria-label="Sections">
        {sections.map(([id, label]) => (
          <button key={id} type="button" onClick={() => jump(id)}>
            {label}
          </button>
        ))}
      </nav>
      <div className="u-exp">
        <section>
          <p className="u-oneline">{explainer.oneLine}</p>
        </section>
        <section id="ex-context">
          <h3>Context</h3>
          <p>{explainer.context}</p>
        </section>
        {explainer.staticLink ? (
          <section id="ex-static">
            <h3>Static linkage · constitutional basis</h3>
            <p>{explainer.staticLink}</p>
          </section>
        ) : null}
        {explainer.facts.length ? (
          <section id="ex-facts">
            <h3>Prelims facts</h3>
            <ul className="u-facts">
              {explainer.facts.map((f) => (
                <li key={f}>
                  <span>
                    <Marked text={f} />
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        {explainer.argumentsFor ? (
          <section id="ex-debate">
            <h3>Arguments</h3>
            <div className="u-debate">
              <div>
                <b>For</b>
                <p>{explainer.argumentsFor}</p>
              </div>
              <div>
                <b>Against</b>
                <p>{explainer.argumentsAgainst}</p>
              </div>
            </div>
          </section>
        ) : null}
        {explainer.wayForward ? (
          <section id="ex-way">
            <h3>Way forward</h3>
            <p>{explainer.wayForward}</p>
          </section>
        ) : null}
        <section id="ex-mains">
          <h3>Mains angle{explainer.mainsPrompt ? ' · practice prompt' : ''}</h3>
          {explainer.mainsPrompt ? <p className="u-mains">{explainer.mainsPrompt}</p> : <p>{explainer.mainsAngle}</p>}
        </section>
        <section id="ex-sources">
          <h3>Sources</h3>
          <ul className="u-sources">
            {explainer.sources.map((s) => (
              <li key={`${s.publisher}-${s.title}`}>
                <b>{s.publisher}</b>
                {s.title}
              </li>
            ))}
          </ul>
        </section>
        {explainer.fromPost ? (
          <p className="u-mono">The full explainer for this item (static linkage, both sides, way forward) arrives with live explainers.</p>
        ) : null}
      </div>
    </div>
  )
}

function Ask({ onOpen }) {
  const [text, setText] = useState('')
  const [asked, setAsked] = useState('')
  return (
    <div className="u-pad">
      <h1 className="u-screen-title">Ask about anything.</h1>
      <form
        className="u-ask"
        onSubmit={(e) => {
          e.preventDefault()
          setAsked(text.trim())
        }}
      >
        <label className="visually-hidden" htmlFor="upsc-ask">
          Topic, event or question
        </label>
        <textarea
          id="upsc-ask"
          rows={3}
          value={text}
          placeholder="A topic, a news event, or a question you saw in a paper"
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" className="u-btn" disabled={!text.trim()}>
          <span>Explain UPSC-style</span>
          <span aria-hidden="true">→</span>
        </button>
      </form>
      {asked ? (
        <div className="u-note" role="status">
          Live explainers for any question are being built next, with fair-use limits. For now, open one of the
          editor-checked explainers below.
        </div>
      ) : null}
      <div>
        <span className="u-kicker">Ready now</span>
        <ul className="u-rows">
          {ASK_SUGGESTIONS.map((s) => (
            <li key={s.explainerId}>
              <button type="button" className="u-row" onClick={() => onOpen(s.explainerId)}>
                <b>{s.label}</b>
                <small>Editor-checked · opens instantly</small>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function Library({ saved, onOpenExplainer }) {
  const posts = UPSC_SAMPLE_POSTS.filter((p) => saved.has(p.id))
  const explainers = Object.values(UPSC_EXPLAINERS).filter((e) => saved.has(`exp:${e.id}`))
  return (
    <div className="u-pad">
      <h1 className="u-screen-title">Your GS shelves</h1>
      {GS_PAPERS.map((g) => {
        const items = posts.filter((p) => p.gs === g)
        return (
          <div key={g} className="u-shelf">
            <Flag gs={g}>
              {g} · {items.length} saved
            </Flag>
            {items.length ? (
              <ul className="u-rows">
                {items.map((p) => (
                  <li key={p.id}>
                    <button type="button" className="u-row" onClick={() => onOpenExplainer(p.id)}>
                      <b>{p.head}</b>
                      <small>{p.gsArea}</small>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        )
      })}
      <div className="u-shelf">
        <span className="u-kicker">Explainers · {explainers.length} saved</span>
        {explainers.length ? (
          <ul className="u-rows">
            {explainers.map((e) => (
              <li key={e.id}>
                <button type="button" className="u-row" onClick={() => onOpenExplainer(e.id)}>
                  <b>{e.title}</b>
                  <small>
                    {e.gs} · {e.gsArea}
                  </small>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      {posts.length + explainers.length === 0 ? (
        <p className="u-note">Tap “Save to GS2” (or any paper) on a post or explainer and it lands on that shelf.</p>
      ) : null}
      <p className="u-mono">Saved on this phone. Sign in, coming soon, keeps them on every device.</p>
    </div>
  )
}

/**
 * UPSC mode (PRD P9): Today's current affairs, Ask, GS Library. BUILD_PLAN M1.22/M1.23 UI on
 * the sample edition until the intake (M1.21) and live explainers (M1.23) exist.
 */
export function UpscApp({ modeToggle }) {
  const [tab, setTab] = useState('today')
  const [explainerId, setExplainerId] = useState(null)
  const [returnTab, setReturnTab] = useState('today')
  const [gs, setGs] = useState('All')
  const [steps, setSteps] = useState({})
  const [saved, setSaved] = useState(loadSaved)
  const mainRef = useRef(null)

  const dateKey = SAMPLE_EDITION_DATE
  const feed = useMemo(() => buildUpscFeed(UPSC_SAMPLE_POSTS, { dateKey, gs }), [dateKey, gs])
  const counts = useMemo(() => gsCounts(UPSC_SAMPLE_POSTS, dateKey), [dateKey])
  const caTotal = feed.filter((p) => p.kind === 'current-affairs').length

  const toggleSave = useCallback((id) => {
    setSaved((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      writeJson(STORAGE_KEYS.upscSaved, [...next])
      return next
    })
  }, [])

  const openExplainer = useCallback(
    (id) => {
      setReturnTab(tab)
      setExplainerId(id)
      mainRef.current?.scrollTo?.({ top: 0 })
    },
    [tab],
  )
  const goTab = (next) => {
    setExplainerId(null)
    setTab(next)
    mainRef.current?.scrollTo?.({ top: 0 })
  }

  const explainer = explainerId ? explainerFor(explainerId) : null
  const saveKey = explainer ? (UPSC_EXPLAINERS[explainer.id] ? `exp:${explainer.id}` : explainer.id) : null

  return (
    <div className="upsc">
      <header className="u-header">
        <Wordmark mode="upsc" />
        {modeToggle}
      </header>

      {explainer ? (
        <div className="u-back">
          <button type="button" onClick={() => setExplainerId(null)}>
            ← {returnTab === 'ask' ? 'Ask' : returnTab === 'library' ? 'Library' : 'Today'}
          </button>
        </div>
      ) : tab === 'today' ? (
        <>
          <div className="u-dayline">
            <b>Today’s current affairs</b>
            <span className="u-mono">Sample edition · ~9 min</span>
          </div>
          <div className="u-gsbar" role="group" aria-label="Filter by GS paper">
            {GS_FILTERS.map((g) => (
              <button
                key={g}
                type="button"
                className={`u-gsf u-gsf--${g.toLowerCase()}`}
                aria-pressed={gs === g}
                onClick={() => setGs(g)}
              >
                {g !== 'All' ? <i aria-hidden="true" /> : null}
                {g} {counts[g] ?? 0}
              </button>
            ))}
          </div>
        </>
      ) : null}

      <main className={`u-main${!explainer && tab === 'today' ? ' u-main--feed' : ''}`} ref={mainRef}>
        {explainer ? (
          <Explainer explainer={explainer} saved={saved.has(saveKey)} onSave={() => toggleSave(saveKey)} />
        ) : tab === 'today' ? (
          <>
            {feed.length === 0 ? (
              <section className="u-post">
                <p className="u-empty">
                  Nothing tagged {gs} today.{' '}
                  <button type="button" className="u-link" onClick={() => setGs('All')}>
                    Show all
                  </button>
                </p>
              </section>
            ) : null}
            {(() => {
              let caIndex = 0
              return feed.map((post) =>
                post.kind === 'interesting' ? (
                  <InterestingPost key={post.id} post={post} />
                ) : (
                  <UpscPost
                    key={post.id}
                    post={post}
                    index={caIndex++}
                    total={caTotal}
                    step={steps[post.id]}
                    onStep={(k) => setSteps((s) => ({ ...s, [post.id]: k }))}
                    saved={saved.has(post.id)}
                    onSave={() => toggleSave(post.id)}
                    onExplain={() => openExplainer(post.id)}
                  />
                ),
              )
            })()}
            <CaughtUp counts={counts} onAsk={() => goTab('ask')} onLibrary={() => goTab('library')} />
          </>
        ) : tab === 'ask' ? (
          <Ask onOpen={openExplainer} />
        ) : (
          <Library saved={saved} onOpenExplainer={openExplainer} />
        )}
      </main>

      <nav className="u-tabs" aria-label="Sections">
        {[
          ['today', 'Today'],
          ['ask', 'Ask'],
          ['library', 'Library'],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`u-tab${tab === id && !explainer ? ' is-on' : ''}`}
            aria-current={tab === id ? 'page' : undefined}
            onClick={() => goTab(id)}
          >
            {label}
          </button>
        ))}
      </nav>
    </div>
  )
}
