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
  step,
  onContinue,
  onGenerate,
  onEditTopic,
  onStartOver,
  generatedMeta,
}) {
  if (step === 'path' && generatedMeta) {
    return (
      <div className="learn-panel learn-panel--summary">
        <p className="learn-path-summary">
          Path for <strong>{generatedMeta.topic}</strong> · {generatedMeta.levelLabel} ·{' '}
          {generatedMeta.scopeLabel} · {generatedMeta.cardCount} cards
        </p>
        <button type="button" className="learn-secondary-btn" onClick={onStartOver}>
          New topic
        </button>
      </div>
    )
  }

  if (step === 'confirm') {
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

        <button type="button" className="learn-primary-btn" onClick={onGenerate}>
          Generate path
        </button>
      </div>
    )
  }

  return (
    <div className="learn-panel">
      <div className="empty-state learn-empty">
        <h2 className="empty-state-title">Learn a topic</h2>
        <p className="empty-state-body">
          Choose a topic and Curiosity Feed will build a short learning path.
        </p>
      </div>
      <label className="learn-topic-label">
        <span className="learn-legend">What do you want to learn?</span>
        <input
          type="text"
          className="learn-topic-input"
          placeholder='e.g. RBI monetary policy'
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
