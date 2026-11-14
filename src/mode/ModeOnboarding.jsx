import { useState } from 'react'
import { DEFAULT_UPSC_PROFILE } from './appMode.js'

const CHOICES = {
  exam: ['UPSC CSE', 'State PSC'],
  attempt: ['2026', '2027', '2028'],
  language: ['English', 'हिन्दी'],
}
const LABELS = { exam: 'Exam', attempt: 'Attempt', language: 'Read in' }

/**
 * First-run mode choice (FR-ONB-01): at most two screens, skippable, no sign-up (FR-ACCT-02).
 * @param {{ onCurious: () => void, onUpsc: (profile: typeof DEFAULT_UPSC_PROFILE) => void }} props
 */
export function ModeOnboarding({ onCurious, onUpsc }) {
  const [step, setStep] = useState('choose')
  const [profile, setProfile] = useState({ ...DEFAULT_UPSC_PROFILE })

  if (step === 'upsc') {
    return (
      <div className="onb onb--study">
        <div className="onb-top">
          <span className="onb-step">2 of 2</span>
          <h1 className="onb-title onb-title--study">Set up study mode</h1>
          <p>Three taps. Change any of it later.</p>
        </div>
        <div className="onb-body">
          {Object.keys(CHOICES).map((key) => (
            <div className="onb-field" key={key} role="group" aria-label={LABELS[key]}>
              <span className="onb-label">{LABELS[key]}</span>
              <div className="onb-chips">
                {CHOICES[key].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className="onb-chip"
                    aria-pressed={profile[key] === value}
                    onClick={() => setProfile((p) => ({ ...p, [key]: value }))}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {profile.language !== 'English' ? (
            <p className="onb-note">Hindi posts are on the way. Until then the feed is in English.</p>
          ) : null}
          <p className="onb-note">Today’s current affairs publish by 9:00 AM IST.</p>
        </div>
        <div className="onb-actions">
          <button type="button" className="onb-back" onClick={() => setStep('choose')}>
            ← Back
          </button>
          <button type="button" className="onb-cta" onClick={() => onUpsc(profile)}>
            <span>Open today’s current affairs</span>
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="onb">
      <div className="onb-top">
        <span className="onb-step">1 of 2</span>
        <h1 className="onb-title">What do you want your scroll to be?</h1>
        <p>Pick one. You can switch any time from the top of the app.</p>
      </div>
      <div className="onb-split">
        <button type="button" className="onb-half onb-half--curious" onClick={onCurious}>
          <span className="onb-half-title">Just curious</span>
          <span className="onb-half-sample">Five good stories a day, then it ends. History, science, how things work.</span>
          <span className="onb-half-go">Start reading →</span>
        </button>
        <button type="button" className="onb-half onb-half--study" onClick={() => setStep('upsc')}>
          <span className="onb-half-title">Preparing for UPSC</span>
          <span className="onb-half-sample">
            Today’s current affairs in four short steps, and <mark className="study-mark">any topic explained UPSC-style</mark>.
          </span>
          <span className="onb-half-go">GS1–GS4 · Prelims facts · Mains angles →</span>
        </button>
      </div>
      <div className="onb-foot">
        <span>No sign-up needed to start</span>
        <button type="button" className="onb-skip" onClick={onCurious}>
          Skip
        </button>
      </div>
    </div>
  )
}
