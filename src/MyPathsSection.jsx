import { listPathSummaries } from './learningPathStorage.js'

function formatDate(ms) {
  if (!ms) return ''
  try {
    return new Date(ms).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}

export function MyPathsSection({ onOpenPath, onDelete, refreshKey }) {
  const summaries = listPathSummaries()

  void refreshKey

  if (summaries.length === 0) {
    return (
      <section className="learn-my-paths" aria-labelledby="my-paths-heading">
        <h2 id="my-paths-heading" className="learn-section-title">
          Your learning paths
        </h2>
        <p className="learn-my-paths-empty">Saved paths will show up here after you create one.</p>
      </section>
    )
  }

  return (
    <section className="learn-my-paths" aria-labelledby="my-paths-heading">
      <h2 id="my-paths-heading" className="learn-section-title">
        Your learning paths
      </h2>
      <ul className="learn-my-paths-list">
        {summaries.map((item) => {
          const progressPct =
            item.total > 0 ? Math.round((item.completed / item.total) * 100) : 0
          return (
            <li key={item.id}>
              <button
                type="button"
                className="learn-path-card"
                onClick={() => onOpenPath(item.id)}
              >
                <div className="learn-path-card-main">
                  <p className="learn-path-card-title">{item.title}</p>
                  <p className="learn-path-card-meta">
                    {item.sourceLabel === 'demo' ? 'Demo' : 'Generated'} · {item.completed}/
                    {item.total} chapters read · Opened {formatDate(item.lastOpenedAt)}
                  </p>
                  <div
                    className="learn-path-card-progress"
                    role="progressbar"
                    aria-valuenow={progressPct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${item.completed} of ${item.total} chapters read`}
                  >
                    <div
                      className="learn-path-card-progress-fill"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
                <span className="learn-path-card-chevron" aria-hidden="true">
                  →
                </span>
              </button>
              <button
                type="button"
                className="learn-text-btn learn-my-paths-delete"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(item.id, item.title)
                }}
              >
                Delete
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
