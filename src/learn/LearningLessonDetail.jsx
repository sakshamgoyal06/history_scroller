export function LearningLessonPlaceholder({ lesson, trackMeta, onRetry, errorMessage, phase }) {
  const title = lesson?.title ?? 'Lesson'
  return (
    <div className="learn-lesson-placeholder">
      <p className="learn-lesson-phase">
        {phase === 'research'
          ? 'Researching the web for checkable sources…'
          : phase === 'writing'
            ? 'Turning research into your story…'
            : phase === 'error'
              ? 'Generation paused'
              : 'Starting research…'}
      </p>
      <h2 className="learn-lesson-title">{title}</h2>
      {lesson?.objective ? <p className="learn-lesson-objective">{lesson.objective}</p> : null}
      {lesson?.whyThisComesNow ? (
        <p className="learn-lesson-why">
          <span className="learn-lesson-why-label">Why this comes now</span>
          {lesson.whyThisComesNow}
        </p>
      ) : null}
      {trackMeta ? (
        <p className="learn-lesson-place">
          Step {lesson.order} in {trackMeta.title}
        </p>
      ) : null}
      {errorMessage ? <p className="learn-lesson-error">{errorMessage}</p> : null}
      {phase === 'error' && onRetry ? (
        <button type="button" className="learn-primary-btn" onClick={onRetry}>
          Retry generation
        </button>
      ) : null}
    </div>
  )
}
