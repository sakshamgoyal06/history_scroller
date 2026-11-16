import { useCallback, useMemo, useRef, useState } from 'react'
import { STORAGE_KEYS, readJson, writeJson } from '../storage/localStore.js'
import { Wordmark } from '../mode/ModeToggle.jsx'
import { AccountSection } from '../account/AccountSection.jsx'
import { ASK_SUGGESTIONS, SOURCE_ALLOW_LIST, answerQuestion } from './groundedAnswer.js'
import { SUBJECTS, dueCards, findChapter, gradeCard, isChapterReady, sampleRevisionState, scheduleChapter } from './learningZone.js'
import { SAMPLE_EDITION_DATE, UPSC_EXPLAINERS, UPSC_SAMPLE_POSTS } from './upscContent.js'
import { GS_PAPERS, POST_STEPS, buildUpscFeed, gsCounts, revisionSlots, splitHighlights } from './upscFeed.js'
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
  const post = UPSC_SAMPLE_POSTS.find((p) => p.id === id)
  if (UPSC_EXPLAINERS[id]) return { ...UPSC_EXPLAINERS[id], chapterId: post?.chapterId }
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
    chapterId: post.chapterId,
  }
}

function Explainer({ explainer, saved, onSave, onRevise }) {
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
        {explainer.chapterId ? (
          <section>
            <ReviseLink chapterId={explainer.chapterId} onOpen={onRevise} />
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

function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function loadRevision() {
  const stored = readJson(STORAGE_KEYS.upscRevision, null)
  if (stored && typeof stored === 'object') return { state: stored, sample: false }
  return { state: sampleRevisionState(todayKey()), sample: true }
}

function loadChapterProgress() {
  const stored = readJson(STORAGE_KEYS.upscChapterProgress, {})
  return stored && typeof stored === 'object' ? stored : {}
}

function ReviseLink({ chapterId, onOpen }) {
  const found = findChapter(chapterId)
  if (!found || !isChapterReady(found.chapter)) return null
  return (
    <button type="button" className="u-revise" onClick={(e) => { e.stopPropagation(); onOpen(chapterId) }}>
      <span className="u-kicker">Revise the basics</span>
      <b>
        {found.subject.name} · {found.chapter.title}
      </b>
      <span className="u-mono">{found.chapter.cards.length} highlight cards + video →</span>
    </button>
  )
}

function UpscPost({ post, index, total, step, onStep, saved, onSave, onExplain, onRevise }) {
  const k = step ?? 0
  const advance = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const dir = e.clientX - rect.left < rect.width * 0.35 ? -1 : 1
    onStep(Math.max(0, Math.min(POST_STEPS.length - 1, k + dir)))
  }
  const onKey = (e) => {
    if (e.target !== e.currentTarget) return
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
            {post.chapterId ? <ReviseLink chapterId={post.chapterId} onOpen={onRevise} /> : null}
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

function RevisionCard({ due, index, total, sample, onGrade, onOpenChapter }) {
  const [open, setOpen] = useState(false)
  return (
    <section className="u-post u-rev" aria-label={`Revision card ${index + 1} of ${total}`}>
      <div className="u-post-top">
        <span className="gs-flag gs-flag--ink">Revision · due today</span>
        <span className="u-mono">
          {index + 1} / {total}
          {sample ? ' · example' : ''}
        </span>
      </div>
      <p className="u-mono u-rev-from">
        From {due.subject} · {due.chapterTitle}
      </p>
      <h2 className="u-head u-rev-q">{due.card.title}</h2>
      {open ? (
        <>
          <div className="u-rev-a">
            <p>
              <Marked text={due.card.body} />
            </p>
            <p className="u-rev-cite">{due.card.cite}</p>
          </div>
          <div className="u-rev-grade">
            <button type="button" className="u-btn-line" onClick={() => onGrade(due.key, false)}>
              Again tomorrow
            </button>
            <button type="button" className="u-btn" onClick={() => onGrade(due.key, true)}>
              <span>Got it</span>
            </button>
          </div>
        </>
      ) : (
        <button type="button" className="u-btn u-rev-show" onClick={() => setOpen(true)}>
          <span>Recall it, then show the card</span>
          <span aria-hidden="true">↓</span>
        </button>
      )}
      <button type="button" className="u-link u-rev-ch" onClick={() => onOpenChapter(due.chapterId)}>
        Open the chapter →
      </button>
    </section>
  )
}

function CaughtUp({ counts, onLearn, onAsk }) {
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
          <button type="button" className="u-row" onClick={onLearn}>
            <b>Learning Zone</b>
            <small>Revise a chapter: highlight cards and a video</small>
          </button>
        </li>
        <li>
          <button type="button" className="u-row" onClick={onAsk}>
            <b>Ask about anything</b>
            <small>Answered only from authentic sources, every line cited</small>
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

function LearnHome({ dueCount, progress, savedCount, onDue, onChapter }) {
  return (
    <div className="u-pad">
      <h1 className="u-screen-title">Learning Zone</h1>
      {dueCount ? (
        <button type="button" className="u-due" onClick={onDue}>
          <span>
            <b>
              {dueCount} revision card{dueCount === 1 ? '' : 's'} due
            </b>
            <span className="u-mono">About a minute, at the end of today’s feed</span>
          </span>
          <span className="u-due-go">Start</span>
        </button>
      ) : null}
      {SUBJECTS.map((subject) => (
        <div key={subject.id} className="u-subject">
          <div className="u-subject-head">
            <Flag gs={subject.gs}>{subject.gs}</Flag>
            <h2>{subject.name}</h2>
          </div>
          {subject.chapters.length === 0 ? (
            <p className="u-mono">Chapters are being written.</p>
          ) : (
            <ol className="u-chapters">
              {subject.chapters.map((ch, i) => {
                const ready = isChapterReady(ch)
                const p = progress[ch.id]
                return (
                  <li key={ch.id}>
                    <button
                      type="button"
                      className={`u-row u-ch-row${ready ? ' is-ready' : ''}`}
                      disabled={!ready}
                      onClick={() => onChapter(ch.id)}
                    >
                      <span className="u-mono u-ch-n">{i + 1}</span>
                      <b>{ch.title}</b>
                      <small>
                        {!ready
                          ? 'Highlight cards coming'
                          : p?.done
                            ? 'Revised · comes back in your feed'
                            : `${ch.cards.length} highlight cards + video`}
                      </small>
                    </button>
                  </li>
                )
              })}
            </ol>
          )}
        </div>
      ))}
      <ul className="u-rows">
        <li>
          <div className="u-row">
            <b>Saved</b>
            <small>{savedCount ? `${savedCount} posts, explainers and cards` : 'Save posts and explainers from Today'}</small>
          </div>
        </li>
      </ul>
      <p className="u-mono">Each chapter is distilled into our own UPSC-format cards. Every card cites a public source.</p>
      <AccountSection variant="upsc" />
    </div>
  )
}

function ChapterView({ chapterId, onStart, onExplain }) {
  const { subject, chapter } = findChapter(chapterId)
  const news = UPSC_SAMPLE_POSTS.filter((p) => p.chapterId === chapterId)
  return (
    <div className="u-pad">
      <div className="u-book-top">
        <Flag gs={subject.gs}>
          {subject.gs} · {subject.name}
        </Flag>
        <h1 className="u-screen-title">{chapter.title}</h1>
      </div>
      <div className="u-video" role="img" aria-label="Explainer video">
        {chapter.video ? (
          <div>
            <b>{chapter.video.title}</b>
            <span className="u-mono">{chapter.video.credit}</span>
          </div>
        ) : (
          <div>
            <b>Explainer video</b>
            <span className="u-mono">An editor is choosing a credited video for this chapter.</span>
          </div>
        )}
      </div>
      <details className="u-fallback" open={!chapter.video}>
        <summary>The chapter in 60 seconds</summary>
        <p>{chapter.summary}</p>
      </details>
      <button type="button" className="u-btn" onClick={onStart}>
        <span>Revise {chapter.cards.length} highlight cards</span>
        <span aria-hidden="true">→</span>
      </button>
      {news.length ? (
        <div>
          <span className="u-kicker">In the news</span>
          <ul className="u-rows">
            {news.map((p) => (
              <li key={p.id}>
                <button type="button" className="u-row" onClick={() => onExplain(p.id)}>
                  <b>{p.head}</b>
                  <small>Today · {p.gs}</small>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

function Deck({ chapterId, index, onIndex, onFinish, saved, onSave }) {
  const { subject, chapter } = findChapter(chapterId)
  const cards = chapter.cards
  if (index >= cards.length) {
    return (
      <div className="u-pad">
        <div className="u-stamp">
          Chapter
          <br />
          <mark className="study-mark">revised.</mark>
        </div>
        <p className="u-mono">
          {subject.name} · {chapter.title} · {cards.length} cards
        </p>
        <ul className="u-rows">
          <li>
            <div className="u-row">
              <b>Comes back for revision</b>
              <small>Tomorrow, then after 3, 7 and 21 days, as cards at the end of your feed</small>
            </div>
          </li>
        </ul>
        <button type="button" className="u-btn" onClick={onFinish}>
          <span>Back to the Learning Zone</span>
          <span aria-hidden="true">→</span>
        </button>
      </div>
    )
  }
  const card = cards[index]
  const key = `card:${chapterId}#${index}`
  const tap = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    onIndex(Math.max(0, index + (e.clientX - rect.left < rect.width * 0.35 ? -1 : 1)))
  }
  return (
    <div className="u-deck-wrap">
      <div className="u-deck-segs" aria-hidden="true">
        {cards.map((c, j) => (
          <i key={c.title} className={j <= index ? 'on' : ''} />
        ))}
      </div>
      <div
        className="u-deck"
        role="group"
        aria-label={`Card ${index + 1} of ${cards.length}`}
        tabIndex={0}
        onClick={tap}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') onIndex(index + 1)
          if (e.key === 'ArrowLeft') onIndex(Math.max(0, index - 1))
        }}
      >
        <span className="u-deck-type">{card.type}</span>
        <h2 className="u-head">{card.title}</h2>
        <p className="u-deck-body">
          <Marked text={card.body} />
        </p>
        <p className="u-deck-cite">Source: {card.cite}</p>
        <span className="u-hint">
          {index + 1} / {cards.length} · tap right for the next card, left to go back
        </span>
      </div>
      <div className="u-deck-actions">
        <button type="button" className="u-btn-line" aria-pressed={saved.has(key)} onClick={() => onSave(key)}>
          {saved.has(key) ? 'Marked' : 'Mark as tricky'}
        </button>
        <button type="button" className="u-btn" onClick={() => onIndex(index + 1)}>
          <span>{index === cards.length - 1 ? 'Finish chapter' : 'Next card'}</span>
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  )
}

function Cites({ nums, onJump }) {
  return nums.map((n) => (
    <button key={n} type="button" className="u-cite" aria-label={`Source ${n}`} onClick={() => onJump(n)}>
      {n}
    </button>
  ))
}

function AnswerView({ result, question, onExplain, onChapter, onAsk }) {
  const ref = useRef(null)
  const [flash, setFlash] = useState(0)
  const jump = (n) => {
    ref.current?.querySelector(`#ask-src-${n}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    setFlash(n)
    setTimeout(() => setFlash(0), 900)
  }
  if (result.kind === 'covered') {
    const found = findChapter(result.chapterId)
    return (
      <div className="u-pad">
        <span className="u-kicker">Already covered</span>
        <h1 className="u-screen-title u-q">{question}</h1>
        <p className="u-plain">Reviewed content already answers this, so we open it instead of writing a new answer.</p>
        <ul className="u-rows">
          <li>
            <button type="button" className="u-row" onClick={() => onExplain(result.explainerId)}>
              <b>{UPSC_EXPLAINERS[result.explainerId]?.title}</b>
              <small>Explainer · editor-checked</small>
            </button>
          </li>
          {found ? (
            <li>
              <button type="button" className="u-row" onClick={() => onChapter(result.chapterId)}>
                <b>
                  {found.subject.name} · {found.chapter.title}
                </b>
                <small>{found.chapter.cards.length} highlight cards + video</small>
              </button>
            </li>
          ) : null}
        </ul>
      </div>
    )
  }
  if (result.kind === 'no-source') {
    return (
      <div className="u-pad">
        <span className="u-kicker">No authentic source found</span>
        <h1 className="u-screen-title u-q">{question}</h1>
        <p className="u-plain">
          We couldn’t find this in the sources we trust (Constitution, NCERT, PIB, PRS, courts, official data), so we
          won’t guess. Opinions and recommendations aren’t something those sources answer.
        </p>
        <p className="u-mono">Try asking about a topic, a law, an event or a concept.</p>
        <ul className="u-rows">
          <li>
            <button type="button" className="u-row" onClick={() => onAsk(ASK_SUGGESTIONS[0])}>
              <b>{ASK_SUGGESTIONS[0]}</b>
              <small>Has authentic sources</small>
            </button>
          </li>
        </ul>
      </div>
    )
  }
  const { answer, dropped } = result
  return (
    <div className="u-explainer" ref={ref}>
      <div className="u-exp-top">
        <Flag gs={answer.gs}>
          {answer.gs} · {answer.gsArea}
        </Flag>
        <h1>{answer.title}</h1>
        <span className="u-mono">AI-written from {answer.sources.length} authentic sources · every sentence cited</span>
      </div>
      <div className="u-exp">
        {answer.sections.map((section) => (
          <section key={section.heading}>
            <h3>{section.heading}</h3>
            {section.list ? (
              <ul className="u-facts">
                {section.sentences.map((s) => (
                  <li key={s.text}>
                    <span>
                      {s.text}
                      <Cites nums={s.cites} onJump={jump} />
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={section.heading === 'In one line' ? 'u-oneline' : undefined}>
                {section.sentences.map((s) => (
                  <span key={s.text}>
                    {s.text}
                    <Cites nums={s.cites} onJump={jump} />{' '}
                  </span>
                ))}
              </p>
            )}
          </section>
        ))}
        <section>
          <h3>Sources · what each one says</h3>
          <ol className="u-cited">
            {answer.sources.map((s, i) => (
              <li key={s.title} id={`ask-src-${i + 1}`} className={flash === i + 1 ? 'is-flash' : undefined}>
                <span className="u-cn">{i + 1}</span>
                <div>
                  <b>{s.title}</b>
                  <span className="u-mono">{s.publisher}</span>
                  <p>{s.says}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
        {dropped ? (
          <p className="u-mono">
            {dropped} sentence{dropped === 1 ? ' was' : 's were'} left out because no source supported{' '}
            {dropped === 1 ? 'it' : 'them'}.
          </p>
        ) : null}
      </div>
    </div>
  )
}

function Ask({ onAsk }) {
  const [text, setText] = useState('')
  return (
    <div className="u-pad">
      <h1 className="u-screen-title">Ask about anything.</h1>
      <form
        className="u-ask"
        onSubmit={(e) => {
          e.preventDefault()
          if (text.trim()) onAsk(text.trim())
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
      <div className="u-allow">
        <span className="u-kicker">Answers only from</span>
        <div className="u-allow-list">
          {SOURCE_ALLOW_LIST.map((a) => (
            <span key={a}>{a}</span>
          ))}
        </div>
        <p className="u-mono">
          Never from coaching notes, blogs, Telegram PDFs or other AI. Every sentence is cited; if nothing authentic is
          found, we say so.
        </p>
      </div>
      <div>
        <span className="u-kicker">Try</span>
        <ul className="u-rows">
          {ASK_SUGGESTIONS.map((q) => (
            <li key={q}>
              <button type="button" className="u-row" onClick={() => onAsk(q)}>
                <b>{q}</b>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <p className="u-mono">Live answers for any question are being built next. For now Ask answers a few sample questions.</p>
    </div>
  )
}

const TABS = [
  ['today', 'Today'],
  ['learn', 'Learn'],
  ['ask', 'Ask'],
]

/**
 * UPSC mode (PRD v2.1 P9): Today (national + international current affairs, then due revision cards),
 * Learn (Learning Zone: subject → chapter → video + highlight deck) and Ask (grounded, cited answers).
 * Runs on sample content until the intake (M1.21), decks pipeline (M1.25) and retrieval (M1.23) exist.
 */
export function UpscApp({ modeToggle }) {
  const [tab, setTab] = useState('today')
  // Pages over a tab: { kind: 'explainer', id } | { kind: 'chapter', id } | { kind: 'deck', id } | { kind: 'answer', q }
  const [page, setPage] = useState(null)
  const [stack, setStack] = useState([])
  const [gs, setGs] = useState('All')
  const [steps, setSteps] = useState({})
  const [saved, setSaved] = useState(loadSaved)
  const [revision, setRevision] = useState(loadRevision)
  const [progress, setProgress] = useState(loadChapterProgress)
  const [deckIndex, setDeckIndex] = useState(0)
  const mainRef = useRef(null)

  const dateKey = SAMPLE_EDITION_DATE
  const today = todayKey()
  const feed = useMemo(() => buildUpscFeed(UPSC_SAMPLE_POSTS, { dateKey, gs }), [dateKey, gs])
  const counts = useMemo(() => gsCounts(UPSC_SAMPLE_POSTS, dateKey), [dateKey])
  const allDue = useMemo(() => dueCards(revision.state, today, 20), [revision, today])
  const due = allDue.slice(0, revisionSlots(feed.length, allDue.length, gs))

  const toTop = () => mainRef.current?.scrollTo?.({ top: 0 })

  const toggleSave = useCallback((id) => {
    setSaved((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      writeJson(STORAGE_KEYS.upscSaved, [...next])
      return next
    })
  }, [])

  const open = useCallback(
    (next) => {
      setStack((s) => [...s, page])
      setPage(next)
      if (next.kind === 'deck') setDeckIndex(0)
      toTop()
    },
    [page],
  )
  const back = () => {
    setStack((s) => {
      const copy = [...s]
      const prev = copy.pop() ?? null
      setPage(prev)
      return copy
    })
    toTop()
  }
  const goTab = (next) => {
    setPage(null)
    setStack([])
    setTab(next)
    toTop()
  }

  const grade = (key, gotIt) => {
    setRevision((r) => {
      const state = gradeCard(r.state, key, gotIt, today)
      writeJson(STORAGE_KEYS.upscRevision, state)
      return { state, sample: false }
    })
  }

  const finishChapter = (chapterId) => {
    const { chapter } = findChapter(chapterId)
    setRevision((r) => {
      const base = r.sample ? {} : r.state
      const state = scheduleChapter(base, chapterId, chapter.cards.length, today)
      writeJson(STORAGE_KEYS.upscRevision, state)
      return { state, sample: false }
    })
    setProgress((p) => {
      const next = { ...p, [chapterId]: { done: true, at: today } }
      writeJson(STORAGE_KEYS.upscChapterProgress, next)
      return next
    })
  }

  const showDue = () => {
    goTab('today')
    setGs('All')
    requestAnimationFrame(() => {
      const el = mainRef.current?.querySelector('.u-rev')
      if (el && mainRef.current) mainRef.current.scrollTop = el.offsetTop - mainRef.current.offsetTop
    })
  }

  const openExplainer = (id) => open({ kind: 'explainer', id })
  const openChapter = (id) => open({ kind: 'chapter', id })

  let body
  if (page?.kind === 'explainer') {
    const explainer = explainerFor(page.id)
    const saveKey = UPSC_EXPLAINERS[page.id] ? `exp:${page.id}` : page.id
    body = explainer ? (
      <Explainer explainer={explainer} saved={saved.has(saveKey)} onSave={() => toggleSave(saveKey)} onRevise={openChapter} />
    ) : null
  } else if (page?.kind === 'chapter') {
    body = <ChapterView chapterId={page.id} onStart={() => open({ kind: 'deck', id: page.id })} onExplain={openExplainer} />
  } else if (page?.kind === 'deck') {
    body = (
      <Deck
        chapterId={page.id}
        index={deckIndex}
        onIndex={(i) => {
          const total = findChapter(page.id).chapter.cards.length
          if (i >= total && deckIndex < total) finishChapter(page.id)
          setDeckIndex(Math.min(i, total))
        }}
        onFinish={() => goTab('learn')}
        saved={saved}
        onSave={toggleSave}
      />
    )
  } else if (page?.kind === 'answer') {
    body = (
      <AnswerView
        result={answerQuestion(page.q)}
        question={page.q}
        onExplain={openExplainer}
        onChapter={openChapter}
        onAsk={(q) => open({ kind: 'answer', q })}
      />
    )
  } else if (tab === 'today') {
    let caIndex = 0
    body = (
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
        {feed.map((post) => (
          <UpscPost
            key={post.id}
            post={post}
            index={caIndex++}
            total={feed.length}
            step={steps[post.id]}
            onStep={(k) => setSteps((s) => ({ ...s, [post.id]: k }))}
            saved={saved.has(post.id)}
            onSave={() => toggleSave(post.id)}
            onExplain={() => openExplainer(post.id)}
            onRevise={openChapter}
          />
        ))}
        {due.map((d, i) => (
          <RevisionCard key={d.key} due={d} index={i} total={due.length} sample={revision.sample} onGrade={grade} onOpenChapter={openChapter} />
        ))}
        <CaughtUp counts={counts} onLearn={() => goTab('learn')} onAsk={() => goTab('ask')} />
      </>
    )
  } else if (tab === 'learn') {
    body = <LearnHome dueCount={allDue.length} progress={progress} savedCount={saved.size} onDue={showDue} onChapter={openChapter} />
  } else {
    body = <Ask onAsk={(q) => open({ kind: 'answer', q })} />
  }

  const backLabel = stack.length && stack[stack.length - 1] ? 'Back' : TABS.find((t) => t[0] === tab)[1]

  return (
    <div className="upsc">
      <header className="u-header">
        <Wordmark mode="upsc" />
        {modeToggle}
      </header>

      {page ? (
        <div className="u-back">
          <button type="button" onClick={back}>
            ← {backLabel}
          </button>
        </div>
      ) : tab === 'today' ? (
        <>
          <div className="u-dayline">
            <b>National + international</b>
            <span className="u-mono">Sample edition · ~10 min</span>
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

      <main className={`u-main${!page && tab === 'today' ? ' u-main--feed' : ''}`} ref={mainRef}>
        {body}
      </main>

      <nav className="u-tabs" aria-label="Sections">
        {TABS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`u-tab${tab === id && !page ? ' is-on' : ''}`}
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
