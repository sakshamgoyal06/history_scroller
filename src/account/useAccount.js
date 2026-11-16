import { useCallback, useEffect, useState } from 'react'
import { getAuthClient, getPendingSignIn, hasStoredSession, sendSignInLink, signOut } from './auth.js'

/**
 * Account state for the UI: 'guest' until a session exists. Guests never load supabase-js unless they
 * ask for a link or arrive from one.
 * @returns {{ status: 'loading'|'guest'|'signed-in', email: string|null, sendLink: (email: string) => Promise<{ok: boolean, message?: string}>, signOut: () => Promise<void> }}
 */
export function useAccount() {
  const needsClient = hasStoredSession() || Boolean(getPendingSignIn())
  const [state, setState] = useState(() => ({ status: needsClient ? 'loading' : 'guest', email: null }))

  useEffect(() => {
    if (!needsClient) return undefined
    let unsub = () => {}
    let alive = true
    Promise.resolve(getPendingSignIn())
      .then(() => getAuthClient())
      .then((client) => {
        if (!alive) return
        const apply = (session) =>
          setState(session ? { status: 'signed-in', email: session.user?.email ?? null } : { status: 'guest', email: null })
        client.auth.getSession().then(({ data }) => alive && apply(data.session))
        const { data } = client.auth.onAuthStateChange((_event, session) => alive && apply(session))
        unsub = () => data.subscription.unsubscribe()
      })
      .catch(() => alive && setState({ status: 'guest', email: null }))
    return () => {
      alive = false
      unsub()
    }
  }, [needsClient])

  const sendLink = useCallback(
    (email) => sendSignInLink(email, { redirectTo: window.location.origin + window.location.pathname }),
    [],
  )
  const doSignOut = useCallback(async () => {
    await signOut()
    setState({ status: 'guest', email: null })
  }, [])

  return { ...state, sendLink, signOut: doSignOut }
}
