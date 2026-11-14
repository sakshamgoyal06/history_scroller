/** Header segmented control for Curious / Study (docs/DESIGN.md §3 "No pop-ups"). */
export function ModeToggle({ mode, onChange }) {
  return (
    <div className="mode-toggle" role="group" aria-label="Mode">
      <button type="button" aria-pressed={mode === 'curious'} onClick={() => onChange('curious')}>
        Curious
      </button>
      <button type="button" aria-pressed={mode === 'upsc'} onClick={() => onChange('upsc')}>
        Study
      </button>
    </div>
  )
}

export function Wordmark({ mode }) {
  if (mode === 'upsc') {
    return (
      <span className="wordmark wordmark--study">
        curiosity <span className="wordmark-tag">STUDY</span>
      </span>
    )
  }
  return (
    <span className="wordmark wordmark--curious">
      curiosity<span className="wordmark-dot" aria-hidden="true" />
    </span>
  )
}
