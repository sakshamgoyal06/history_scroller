import { LEARNING_ZONES } from './zoneData.js'
import { loadZoneProgress } from './zoneProgress.js'

function zoneProgressSummary(zone) {
  const progress = loadZoneProgress()[zone.id]
  const done = Array.isArray(progress?.completedOrders) ? progress.completedOrders.length : 0
  return { done, total: zone.steps.length }
}

export function ZonesPanel({ onOpenZone }) {
  return (
    <div className="zones-panel">
      <p className="zones-intro">
        Ordered journeys with progress tracking. Resume in Focus mode or drip the next step into For You.
      </p>
      {LEARNING_ZONES.map((zone) => {
        const { done, total } = zoneProgressSummary(zone)
        return (
          <article key={zone.id} className="zone-card">
            <h2 className="zone-card-title">{zone.title}</h2>
            <p className="zone-card-desc">{zone.description}</p>
            <p className="zone-card-outcome">
              <strong>Outcome:</strong> {zone.outcome}
            </p>
            <p className="zone-card-meta">
              {total} steps · ~{zone.estimatedMinutes} min · {zone.domain}
            </p>
            <div
              className="zone-card-progress"
              role="progressbar"
              aria-valuenow={done}
              aria-valuemin={0}
              aria-valuemax={total}
              aria-label={`${done} of ${total} steps completed`}
            >
              <div className="zone-card-progress-fill" style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
            </div>
            <button type="button" className="zone-card-action" onClick={() => onOpenZone(zone.id)}>
              {done > 0 ? 'Resume zone' : 'Start zone'}
            </button>
          </article>
        )
      })}
    </div>
  )
}
