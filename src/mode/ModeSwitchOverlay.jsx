import { useEffect, useLayoutEffect, useRef } from 'react'

const NARROW = "'wdth' 60, 'wght' 880"
const WIDE = "'wdth' 145, 'wght' 260"
const FULL = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'

function prefersReducedMotion() {
  try {
    return globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  } catch {
    return false
  }
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * The switch between modes (docs/DESIGN.md §4). Into study: a highlighter stroke sweeps across,
 * fills the screen while "Study mode" condenses, the UPSC feed is swapped in underneath, and the
 * yellow wipes up. Back to Curious: a mist circle grows from the toggle and fades.
 * Reduced motion: a short crossfade with the mode name.
 *
 * @param {{ to: 'curious' | 'upsc', subtitle?: string, onSwap: () => void, onDone: () => void }} props
 */
export function ModeSwitchOverlay({ to, subtitle, onSwap, onDone }) {
  const rootRef = useRef(null)
  const fillRef = useRef(null)
  const labelRef = useRef(null)
  const titleRef = useRef(null)
  const subRef = useRef(null)
  const callbacks = useRef({ onSwap, onDone })
  useLayoutEffect(() => {
    callbacks.current = { onSwap, onDone }
  })

  useEffect(() => {
    let cancelled = false
    const root = rootRef.current
    const fill = fillRef.current
    const title = titleRef.current
    const label = labelRef.current
    const sub = subRef.current
    const anims = []
    const toStudy = to === 'upsc'
    const swap = () => !cancelled && callbacks.current.onSwap()
    const done = () => !cancelled && callbacks.current.onDone()

    async function run() {
      if (prefersReducedMotion() || typeof fill?.animate !== 'function') {
        if (title) title.style.fontVariationSettings = toStudy ? NARROW : WIDE
        if (root?.animate) anims.push(root.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 100, fill: 'forwards' }))
        await wait(110)
        swap()
        await wait(120)
        if (root?.animate) {
          const out = root.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 100, fill: 'forwards' })
          anims.push(out)
          await out.finished.catch(() => {})
        }
        done()
        return
      }

      let first
      if (toStudy) {
        first = fill.animate(
          [
            { clipPath: 'polygon(0% 47%, 0% 45%, 0% 57%, 0% 59%)' },
            { clipPath: 'polygon(0% 47%, 100% 39%, 100% 53%, 0% 61%)', offset: 0.5 },
            { clipPath: FULL },
          ],
          { duration: 520, easing: 'cubic-bezier(.65,0,.25,1)', fill: 'forwards' },
        )
        anims.push(
          title.animate(
            [
              { fontVariationSettings: WIDE, opacity: 0, transform: 'translateY(10px)' },
              { opacity: 1, offset: 0.25 },
              { fontVariationSettings: NARROW, opacity: 1, transform: 'translateY(0)' },
            ],
            { duration: 620, delay: 180, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' },
          ),
        )
      } else {
        first = fill.animate([{ clipPath: 'circle(0% at 82% 6%)' }, { clipPath: 'circle(150% at 82% 6%)' }], {
          duration: 440,
          easing: 'cubic-bezier(.33,0,.2,1)',
          fill: 'forwards',
        })
        anims.push(
          title.animate(
            [{ fontVariationSettings: NARROW, opacity: 0 }, { opacity: 1, offset: 0.3 }, { fontVariationSettings: WIDE, opacity: 1 }],
            { duration: 560, delay: 120, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' },
          ),
        )
      }
      anims.push(first, sub.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: 320, fill: 'forwards' }))
      await first.finished.catch(() => {})
      swap()
      if (toStudy) {
        try {
          globalThis.navigator?.vibrate?.(12)
        } catch {
          /* vibration is optional */
        }
      }
      await wait(toStudy ? 220 : 160)
      if (cancelled) return
      let out
      if (toStudy) {
        out = fill.animate([{ clipPath: FULL }, { clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)' }], {
          duration: 320,
          easing: 'cubic-bezier(.7,0,.3,1)',
          fill: 'forwards',
        })
        anims.push(
          label.animate([{ transform: 'translateY(0)', opacity: 1 }, { transform: 'translateY(-60px)', opacity: 0 }], {
            duration: 260,
            easing: 'ease-in',
            fill: 'forwards',
          }),
        )
      } else {
        out = root.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, easing: 'ease-out', fill: 'forwards' })
      }
      anims.push(out)
      await out.finished.catch(() => {})
      done()
    }

    run()
    return () => {
      cancelled = true
      anims.forEach((a) => a?.cancel?.())
    }
  }, [to])

  const toStudy = to === 'upsc'
  return (
    <div ref={rootRef} className={`mode-switch mode-switch--${to}`} aria-live="polite">
      <div ref={fillRef} className="mode-switch-fill" />
      <div ref={labelRef} className="mode-switch-label">
        <span ref={titleRef} className="mode-switch-title">
          {toStudy ? 'Study mode' : 'Curious mode'}
        </span>
        <span ref={subRef} className="mode-switch-sub">
          {subtitle}
        </span>
      </div>
    </div>
  )
}
