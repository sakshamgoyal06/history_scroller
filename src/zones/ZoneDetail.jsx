import { useState } from 'react'
import { getZoneById } from './zoneData.js'
import {
  loadZoneDripEnabled,
  loadZoneProgress,
  markZoneStepComplete,
  resetZoneProgress,
  setZoneDripEnabled,
} from './zoneProgress.js'

function stepState(step, progress) {
  const done = new Set(progress?.completedOrders ?? [])
  if (done.has(step.order)) return 'completed'
  const nextOrder = (progress?.lastStep ?? 0) + 1
  if (step.order === nextOrder || (done.size === 0 && step.order === 1)) return 'current'
  if (step.order <= (progress?.lastStep ?? 0) + 1) return 'current'
  return 'upcoming'
}

export function ZoneDetail({
  zoneId,
  onBack,
  onOpenStep,
  onContinueInFeed,
  focusStepOrder,
}) {
  const zone = getZoneById(zoneId)
  const [progress, setProgress] = useState(() => loadZoneProgress())
  const [dripMap, setDripMap] = useState(() => loadZoneDripEnabled())
  const [confirmReset, setConfirmReset] = useState(false)

  if (!zone) {
    return (
      <div className="empty-state">
        <h2 className="empty-state-title">Zone not found</h2>
        <button type="button" className="empty-state-action" onClick={onBack}>
          Back to zones
        </button>
      </div>
    )
  }

  const zProgress = progress[zone.id]
  const dripOn = Boolean(dripMap[zone.id])

  const completeStep = (order) => {
    markZoneStepComplete(zone.id, order)
    setProgress(loadZoneProgress())
  }

  return (
    <div className="zone-detail">
      <button type="button" className="back-btn zone-detail-back" onClick={onBack}>
        ← Zones
      </button>
      <h2 className="zone-detail-title">{zone.title}</h2>
      <p className="zone-detail-desc">{zone.description}</p>
      <p className="zone-detail-outcome">{zone.outcome}</p>
      <p className="zone-detail-meta">~{zone.estimatedMinutes} min · {zone.steps.length} steps</p>

      <div className="zone-mode-toggle">
        <label className="zone-drip-label">
          <input
            type="checkbox"
            checked={dripOn}
            onChange={(e) => {
              setZoneDripEnabled(zone.id, e.target.checked)
              setDripMap(loadZoneDripEnabled())
            }}
          />
          Drip next step into For You feed
        </label>
      </div>

      <ol className="zone-steps">
        {zone.steps.map((step) => {
          const state = stepState(step, zProgress)
          return (
            <li key={step.id} className={`zone-step zone-step--${state}`}>
              <div className="zone-step-head">
                <span className="zone-step-order">{step.order}</span>
                <div>
                  <p className="zone-step-title">{step.title}</p>
                  <p className="zone-step-objective">{step.objective}</p>
                </div>
              </div>
              {state === 'current' || focusStepOrder === step.order ? (
                <div className="zone-step-actions">
                  <button
                    type="button"
                    className="zone-card-action"
                    onClick={() => onOpenStep(zone, step, 'focus')}
                  >
                    {state === 'completed' ? 'Review' : 'Start step'}
                  </button>
                </div>
              ) : null}
            </li>
          )
        })}
      </ol>

      <div className="zone-detail-actions">
        <button
          type="button"
          className="zone-card-action"
          onClick={() => {
            const next = zone.steps.find((s) => stepState(s, zProgress) === 'current') ?? zone.steps[0]
            onOpenStep(zone, next, 'focus')
          }}
        >
          Resume focus mode
        </button>
        {!confirmReset ? (
          <button type="button" className="learn-text-btn" onClick={() => setConfirmReset(true)}>
            Start again
          </button>
        ) : (
          <div className="zone-reset-confirm">
            <p>Reset progress for this zone?</p>
            <button
              type="button"
              className="zone-card-action"
              onClick={() => {
                resetZoneProgress(zone.id)
                setProgress(loadZoneProgress())
                setConfirmReset(false)
              }}
            >
              Confirm reset
            </button>
            <button type="button" className="learn-text-btn" onClick={() => setConfirmReset(false)}>
              Cancel
            </button>
          </div>
        )}
      </div>

      {focusStepOrder ? (
        <div className="zone-focus-bar">
          <p>Focus mode · Step {focusStepOrder}</p>
          <button type="button" className="learn-text-btn" onClick={() => onContinueInFeed(zone.id)}>
            Continue in feed
          </button>
          <button
            type="button"
            className="learn-text-btn"
            onClick={() => {
              completeStep(focusStepOrder)
              onBack()
            }}
          >
            Return to zone
          </button>
        </div>
      ) : null}
    </div>
  )
}
