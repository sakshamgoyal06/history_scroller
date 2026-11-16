import { useState } from 'react'
import { getUrlSignInError } from './auth.js'
import { useAccount } from './useAccount.js'
import './account.css'

/**
 * Inline sign-in (no pop-up, DESIGN.md): guest by default, email link to keep saves across devices.
 * Sync arrives with M0.4, so the copy says saves stay on this device until then.
 */
export function AccountSection({ variant = 'curious' }) {
  const account = useAccount()
  const [email, setEmail] = useState('')
  const [phase, setPhase] = useState(() => (getUrlSignInError() ? 'error' : 'idle')) // idle | sending | sent | error
  const [message, setMessage] = useState(() => getUrlSignInError() ?? '')

  const cls = `account account--${variant}`

  if (account.status === 'loading') {
    return (
      <section className={cls} aria-label="Account">
        <p className="account-note">Checking sign-in…</p>
      </section>
    )
  }

  if (account.status === 'signed-in') {
    return (
      <section className={cls} aria-label="Account">
        <h2 className="account-title">Account</h2>
        <p className="account-line">
          Signed in as <b>{account.email}</b>
        </p>
        <p className="account-note">Your saves stay on this device for now. Syncing across devices comes next.</p>
        <button type="button" className="account-link" onClick={() => account.signOut()}>
          Sign out
        </button>
      </section>
    )
  }

  if (phase === 'sent') {
    return (
      <section className={cls} aria-label="Account" aria-live="polite">
        <h2 className="account-title">Check your email</h2>
        <p className="account-line">
          We sent a sign-in link to <b>{email.trim()}</b>. Open it on this device.
        </p>
        <button type="button" className="account-link" onClick={() => setPhase('idle')}>
          Use a different email
        </button>
      </section>
    )
  }

  const submit = async (e) => {
    e.preventDefault()
    setPhase('sending')
    const res = await account.sendLink(email)
    if (res.ok) setPhase('sent')
    else {
      setMessage(res.message)
      setPhase('error')
    }
  }

  return (
    <section className={cls} aria-label="Account">
      <h2 className="account-title">Keep your saves</h2>
      <p className="account-note">You can use everything without an account. Sign in to keep saves across devices.</p>
      <form className="account-form" onSubmit={submit} noValidate>
        <label className="visually-hidden" htmlFor={`account-email-${variant}`}>
          Email
        </label>
        <input
          id={`account-email-${variant}`}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (phase === 'error') setPhase('idle')
          }}
          aria-invalid={phase === 'error'}
          aria-describedby={phase === 'error' ? `account-err-${variant}` : undefined}
        />
        <button type="submit" className="account-btn" disabled={phase === 'sending' || !email.trim()}>
          {phase === 'sending' ? 'Sending…' : 'Email me a link'}
        </button>
      </form>
      {phase === 'error' ? (
        <p className="account-error" id={`account-err-${variant}`} role="alert">
          {message}
        </p>
      ) : null}
      <p className="account-fine">No password. We only use your email to sign you in.</p>
    </section>
  )
}
