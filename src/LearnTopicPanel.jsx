import {
  LEARN_LENGTHS,
  LEARN_LEVELS,
  LEARN_SCOPES,
} from './generateMockLearningPath.js'

function OptionGroup({ legend, options, value, onChange, name }) {
  return (
    <fieldset className="learn-fieldset">
      <legend className="learn-legend">{legend}</legend>
      <div className="learn-options">
        {options.map((opt) => {
          const id = `${name}-${opt.id}`
          const checked = value === opt.id
          return (
            <label key={opt.id} htmlFor={id} className={`learn-option${checked ? ' learn-option--active' : ''}`}>
              <input
                id={id}
                type="radio"
                name={name}
                checked={checked}
                onChange={() => onChange(opt.id)}
              />
              <span>{opt.label}</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

function SourceBadge({ label }) {
  if (!label) return null
  const isDemo = label === 'demo'
  return (
    <span className={`learn-source-badge${isDemo ? ' learn-source-badge--demo' : ''}`}>
      {isDemo ? 'Demo path' : 'Generated for you'}
    </span>
  )
}

export function LearnTopicPanel({
  topic,
  onTopicChange,
  level,
  onLevelChange,
  scope,
  onScopeChange,
  length,
  onLengthChange,
  focus,
  onFocusChange,
  uiState,
  onContinue,
  onGenerate,
  onEditTopic,
  onStartOver,
  activePathMeta,
  planResult,
  planError,
  onRetryPlan,
  onUseDemoFallback,
  onSelectNarrowing,
  onConfirmSinglePath,
  onLearnTrack,
  onBuildFullCourse,
  planningMessage,
  submitLocked,
}) {
  if (uiState === 'planning' || uiState === 'saving') {
    return (
      <div className="learn-panel learn-panel--status" aria-live="polite">
        <p className="learn-status-title">
          {uiState === 'saving' ? 'Saving your path…' : planningMessage || 'Assessing the scope…'}
        </p>
        <p className="learn-status-body">This usually takes a few seconds. No fake progress bars here.</p>
      </div>
    )
  }

  if (uiState === 'error') {
    return (
      <div className="learn-panel learn-panel--status">
        <p className="learn-status-title">Could not plan this topic</p>
        <p className="learn-status-body">{planError?.message ?? 'Something went wrong.'}</p>
        <div className="learn-action-row">
          <button type="button" className="learn-primary-btn" onClick={onRetryPlan}>
            Retry
          </button>
          {onUseDemoFallback ? (
            <button type="button" className="learn-secondary-btn" onClick={onUseDemoFallback}>
              Use demo path
            </button>
          ) : null}
          <button type="button" className="learn-secondary-btn" onClick={onEditTopic}>
            Edit topic
          </button>
        </div>
      </div>
    )
  }

  if (uiState === 'needs_clarification' && planResult?.clarification) {
    const { question, options } = planResult.clarification
    return (
      <div className="learn-panel">
        <p className="learn-scope-label">Needs clarification</p>
        <p className="learn-scope-explanation">{planResult.scopeExplanation}</p>
        <p className="learn-clarify-question">{question}</p>
        <div className="learn-narrow-grid">
          {options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className="learn-narrow-card"
              onClick={() => onSelectNarrowing(opt)}
            >
              <span className="learn-narrow-label">{opt.label}</span>
              <span className="learn-narrow-desc">{opt.description}</span>
            </button>
          ))}
        </div>
        <button type="button" className="learn-text-btn" onClick={onEditTopic}>
          Edit topic instead
        </button>
      </div>
    )
  }

  if (uiState === 'single_path_proposed' && planResult?.course) {
    const track = planResult.course.tracks[0]
    return (
      <div className="learn-panel">
        <p className="learn-scope-label">Single learning path</p>
        <p className="learn-scope-explanation">{planResult.scopeExplanation}</p>
        <h3 className="learn-course-title">{planResult.course.title}</h3>
        <p className="learn-course-overview">{planResult.course.overview}</p>
        <ol className="learn-lesson-outline">
          {track.lessons.map((lesson) => (
            <li key={lesson.id}>
              <strong>{lesson.title}</strong>
              <span>{lesson.objective}</span>
            </li>
          ))}
        </ol>
        <button
          type="button"
          className="learn-primary-btn"
          disabled={submitLocked}
          onClick={onConfirmSinglePath}
        >
          Start learning
        </button>
        <button type="button" className="learn-text-btn" onClick={onEditTopic}>
          Change topic
        </button>
      </div>
    )
  }

  if (uiState === 'multi_track_proposed' && planResult?.course) {
    const { course } = planResult
    return (
      <div className="learn-panel">
        <p className="learn-scope-label">Multi-track course</p>
        <p className="learn-scope-explanation">{planResult.scopeExplanation}</p>
        <h3 className="learn-course-title">{course.title}</h3>
        <p className="learn-course-overview">{course.overview}</p>
        <div className="learn-track-grid">
          {course.tracks.map((track) => (
            <article
              key={track.id}
              className={`learn-track-card${track.id === course.recommendedTrackId ? ' learn-track-card--recommended' : ''}`}
            >
              {track.id === course.recommendedTrackId ? (
                <span className="learn-track-rec">Recommended first</span>
              ) : null}
              <h4 className="learn-track-title">{track.title}</h4>
              <p className="learn-track-summary">{track.summary}</p>
              <p className="learn-track-meta">
                {track.lessons.length} lessons · ~{track.estimatedMinutes} min
              </p>
              <ul className="learn-track-lessons">
                {track.lessons.map((l) => (
                  <li key={l.id}>{l.title}</li>
                ))}
              </ul>
              <button
                type="button"
                className="learn-secondary-btn"
                disabled={submitLocked}
                onClick={() => onLearnTrack(track.id)}
              >
                Learn this track
              </button>
            </article>
          ))}
        </div>
        <button
          type="button"
          className="learn-primary-btn"
          disabled={submitLocked}
          onClick={onBuildFullCourse}
        >
          Build complete course
        </button>
        <button type="button" className="learn-text-btn" onClick={onEditTopic}>
          Change topic
        </button>
      </div>
    )
  }

  if (uiState === 'path' && activePathMeta) {
    return (
      <div className="learn-panel learn-panel--summary">
        <div>
          <SourceBadge label={activePathMeta.sourceLabel} />
          <p className="learn-path-summary">
            Path for <strong>{activePathMeta.topic}</strong> · {activePathMeta.levelLabel} ·{' '}
            {activePathMeta.scopeLabel}
            {activePathMeta.trackTitle ? ` · ${activePathMeta.trackTitle}` : ''} ·{' '}
            {activePathMeta.lessonCount} lessons
          </p>
        </div>
        <button type="button" className="learn-secondary-btn" onClick={onStartOver}>
          New topic
        </button>
      </div>
    )
  }

  if (uiState === 'confirm') {
    return (
      <div className="learn-panel">
        <p className="learn-topic-line">
          Topic: <strong>{topic}</strong>
        </p>
        <button type="button" className="learn-text-btn" onClick={onEditTopic}>
          Edit topic
        </button>

        <OptionGroup
          legend="Level"
          name="learn-level"
          options={LEARN_LEVELS}
          value={level}
          onChange={onLevelChange}
        />
        <OptionGroup
          legend="Scope"
          name="learn-scope"
          options={LEARN_SCOPES}
          value={scope}
          onChange={onScopeChange}
        />
        <OptionGroup
          legend="Length"
          name="learn-length"
          options={LEARN_LENGTHS}
          value={length}
          onChange={onLengthChange}
        />

        <label className="learn-focus-label">
          <span className="learn-legend">Anything specific?</span>
          <textarea
            className="learn-focus-input"
            rows={3}
            placeholder="Optional—e.g. focus on repo rate, Indus cities, Rajya Sabha…"
            value={focus}
            onChange={(e) => onFocusChange(e.target.value)}
          />
        </label>

        <button
          type="button"
          className="learn-primary-btn"
          disabled={submitLocked}
          onClick={onGenerate}
        >
          Assess topic
        </button>
      </div>
    )
  }

  return (
    <div className="learn-panel">
      <div className="empty-state learn-empty">
        <h2 className="empty-state-title">Learn a topic</h2>
        <p className="empty-state-body">
          Enter a topic and Curiosity Feed will assess scope, then design a learning sequence.
        </p>
      </div>
      <label className="learn-topic-label">
        <span className="learn-legend">What do you want to learn?</span>
        <input
          type="text"
          className="learn-topic-input"
          maxLength={150}
          placeholder="e.g. RBI monetary policy"
          value={topic}
          onChange={(e) => onTopicChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onContinue()
          }}
        />
      </label>
      <button
        type="button"
        className="learn-primary-btn"
        disabled={!topic.trim()}
        onClick={onContinue}
      >
        Continue
      </button>
    </div>
  )
}
