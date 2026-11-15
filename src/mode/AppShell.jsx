import { useCallback, useEffect, useState } from 'react'
import App from '../App.jsx'
import { UpscApp } from '../upsc/UpscApp.jsx'
import {
  UPSC_PATH,
  loadAppMode,
  loadOnboarded,
  resolveInitialMode,
  saveAppMode,
  saveOnboarded,
  saveUpscProfile,
  shouldShowOnboarding,
} from './appMode.js'
import { ModeOnboarding } from './ModeOnboarding.jsx'
import { ModeSwitchOverlay } from './ModeSwitchOverlay.jsx'
import { ModeToggle } from './ModeToggle.jsx'
import './mode.css'

const SUBTITLES = {
  upsc: 'Today’s current affairs · about 9 minutes',
  curious: 'Today’s 5 · picks up where you left off',
}

function currentPath() {
  return globalThis.location?.pathname ?? '/'
}

/**
 * Top-level shell: owns the mode (Curious or UPSC), first-run onboarding and the animated
 * switch between modes. Curious mode is the existing app; UPSC mode is `src/upsc/`.
 */
export function AppShell() {
  const [mode, setMode] = useState(() => resolveInitialMode(currentPath(), loadAppMode()))
  const [onboarding, setOnboarding] = useState(() => shouldShowOnboarding(currentPath(), loadOnboarded()))
  const [switchingTo, setSwitchingTo] = useState(null)

  const requestMode = useCallback(
    (next) => {
      if (switchingTo || (next === mode && !onboarding)) return
      setSwitchingTo(next)
    },
    [mode, onboarding, switchingTo],
  )

  const applyMode = useCallback((next) => {
    setMode(next)
    saveAppMode(next)
    setOnboarding(false)
    saveOnboarded()
    const target = next === 'upsc' ? UPSC_PATH : '/'
    if (currentPath() !== target) globalThis.history?.pushState({ mode: next }, '', target)
  }, [])

  // Browser back/forward between `/upsc` and Curious routes changes mode without animation.
  useEffect(() => {
    const onPop = () => {
      const next = resolveInitialMode(currentPath(), 'curious')
      setMode(next)
      saveAppMode(next)
    }
    globalThis.addEventListener?.('popstate', onPop)
    return () => globalThis.removeEventListener?.('popstate', onPop)
  }, [])

  const toggle = <ModeToggle mode={mode} onChange={requestMode} />

  let content
  if (onboarding) {
    content = (
      <ModeOnboarding
        onCurious={() => applyMode('curious')}
        onUpsc={(profile) => {
          saveUpscProfile(profile)
          requestMode('upsc')
        }}
      />
    )
  } else if (mode === 'upsc') {
    content = <UpscApp modeToggle={toggle} />
  } else {
    content = <App modeToggle={toggle} />
  }

  return (
    <div className={`shell shell--${onboarding ? 'onboarding' : mode}`}>
      {content}
      {switchingTo ? (
        <ModeSwitchOverlay
          to={switchingTo}
          subtitle={SUBTITLES[switchingTo]}
          onSwap={() => applyMode(switchingTo)}
          onDone={() => setSwitchingTo(null)}
        />
      ) : null}
    </div>
  )
}
