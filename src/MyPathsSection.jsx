import { listPathSummaries } from './learningPathStorage.js'

function formatDate(ms) {
  if (!ms) return ''
  try {
    return new Date(ms).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}

export function MyPathsSection({ onResume, onDelete, refreshKey }) {
  const summaries = listPathSummaries()

  if (summaries.length === 0) {
    return (
      <section className="learn-my-paths" aria-labelledby="my-paths-heading">
        <h2 id="my-paths-heading" className="learn-section-title">
          My Paths
        </h2>
        <p className="learn-my-paths-empty">Saved learning paths will appear here.</p>
      </section>
    )
  }

  void refreshKey

  return (
    <section className="learn-my-paths" aria-labelledby="my-paths-heading">
      <h2 id="my-paths-heading" className="learn-section-title">
        My Paths
      </h2>
      <ul className="learn-my-paths-list">
        {summaries.map((item) => (
          <li key={item.id} className="learn-my-paths-item">
            <div className="learn-my-paths-main">
              <p className="learn-my-paths-title">{item.title}</p>
              <p className="learn-my-paths-meta">
                {item.sourceLabel === 'demo' ? 'Demo path' : 'Generated for you'} ·{' '}
                {item.trackCount} {item.trackCount === 1 ? 'track' : 'tracks'} · {item.total}{' '}
                lessons · {item.completed}/{item.total} done
              </p>
              <p className="learn-my-paths-date">Updated {formatDate(item.updatedAt)}</p>
            </div>
            <div className="learn-my-paths-actions">
              <button type="button" className="learn-secondary-btn" onClick={() => onResume(item.id)}>
                Resume
              </button>
              <button
                type="button"
                className="learn-text-btn learn-my-paths-delete"
                onClick={() => onDelete(item.id, item.title)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
