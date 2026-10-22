export function SessionSummaryCard({ stats, onKeepExploring, onContinuePath, onReviewSaved, onFinish }) {
  const { exploredCount, domains, savedCount, deepDives } = stats
  return (
    <article className="reel-summary" aria-label="Session intermission">
      <h2 className="reel-summary-title">You explored {exploredCount} ideas</h2>
      {domains.length > 0 ? (
        <p className="reel-summary-domains">{domains.join(' · ')}</p>
      ) : null}
      <p className="reel-summary-stats">
        {savedCount} saved · {deepDives} opened more deeply
      </p>
      <div className="reel-summary-actions">
        <button type="button" className="reel-summary-btn" onClick={onKeepExploring}>
          Keep exploring
        </button>
        {onContinuePath ? (
          <button type="button" className="reel-summary-btn reel-summary-btn--ghost" onClick={onContinuePath}>
            Continue a path
          </button>
        ) : null}
        <button type="button" className="reel-summary-btn reel-summary-btn--ghost" onClick={onReviewSaved}>
          Review saved ideas
        </button>
        <button type="button" className="reel-summary-btn reel-summary-btn--ghost" onClick={onFinish}>
          Finish for now
        </button>
      </div>
    </article>
  )
}
