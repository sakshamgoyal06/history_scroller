/**
 * Email-link sign-in on Supabase Auth (BUILD_PLAN M0.3, FR-ACCT-01/02; D-AUTH: email link first).
 *
 * The app works signed out (guest) and offers sign-in only where it helps: keeping saves across devices.
 * The project URL and publishable key are public by design (row-level security protects data, see
 * docs/DATABASE.md); env vars override them for other environments. The service-role key never ships.
 */
import { STORAGE_KEYS, readText, removeKey, writeText } from '../storage/localStore.js'

export const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || 'https://ijjtwurgkmxwwakkvfep.supabase.co'
export const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_8HcPc1g1kd_fXHOeEwgfoQ_2BMEzjdH'

/** supabase-js session storage routed through localStore (CLAUDE.md: all browser storage goes there). */
export const authStorage = {
  getItem: (key) => readText(key),
  setItem: (key, value) => writeText(key, value),
  removeItem: (key) => removeKey(key),
}

let clientPromise = null

/** Loads supabase-js on first use so guests never download it. Tests pass their own client. */
export function getAuthClient() {
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) =>
      createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
        auth: { storageKey: STORAGE_KEYS.auth, storage: authStorage, persistSession: true, detectSessionInUrl: false },
      }),
    )
  }
  return clientPromise
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function normalizeEmail(raw) {
  return String(raw ?? '').trim().toLowerCase()
}

export function isValidEmail(raw) {
  const email = normalizeEmail(raw)
  return email.length <= 254 && EMAIL_RE.test(email)
}

/** Maps Supabase Auth errors to short, honest copy. */
export function signInErrorMessage(error) {
  const status = error?.status
  const msg = String(error?.message ?? '').toLowerCase()
  if (status === 429 || msg.includes('rate limit')) return 'Too many sign-in emails. Try again in a few minutes.'
  if (msg.includes('fetch') || msg.includes('network')) return 'You look offline. Check your connection and try again.'
  return 'We couldn’t send the email. Try again.'
}

/**
 * Sends a one-time sign-in link. New emails get an account; existing ones sign in.
 * @returns {Promise<{ ok: true } | { ok: false, message: string }>}
 */
export async function sendSignInLink(rawEmail, { client, redirectTo } = {}) {
  if (!isValidEmail(rawEmail)) return { ok: false, message: 'Enter a valid email address.' }
  const auth = (client ?? (await getAuthClient())).auth
  const { error } = await auth.signInWithOtp({
    email: normalizeEmail(rawEmail),
    options: { shouldCreateUser: true, emailRedirectTo: redirectTo },
  })
  return error ? { ok: false, message: signInErrorMessage(error) } : { ok: true }
}

export async function signOut({ client } = {}) {
  const auth = (client ?? (await getAuthClient())).auth
  await auth.signOut()
}

/** True when this device holds a stored session, so the client is only loaded for people who signed in. */
export function hasStoredSession() {
  return Boolean(readText(STORAGE_KEYS.auth))
}

/** True when the page was opened from a sign-in email (implicit flow puts the token in the hash). */
export function isAuthRedirect(location = globalThis.location) {
  const hash = location?.hash ?? ''
  return hash.includes('access_token=') || hash.includes('error_description=')
}

/**
 * Reads the sign-in result from a link's URL hash. Pure, so it can be tested.
 * @returns {null | { tokens: { access_token: string, refresh_token: string } } | { error: string }}
 */
export function parseAuthHash(hash) {
  if (!hash || hash.length < 2) return null
  const params = new URLSearchParams(hash.replace(/^#/, ''))
  if (params.get('error_description')) {
    return { error: 'That sign-in link has expired or was already used. Ask for a new one.' }
  }
  const access_token = params.get('access_token')
  const refresh_token = params.get('refresh_token')
  return access_token && refresh_token ? { tokens: { access_token, refresh_token } } : null
}

let pendingSignIn = null
let urlSignInError = null

/**
 * Call once before the app renders: takes the tokens out of the URL (so the app's hash routing never
 * sees them and they don't stay in history) and finishes sign-in in the background.
 */
export function captureSignInFromUrl(win = globalThis.window) {
  if (!win?.location || !isAuthRedirect(win.location)) return
  const result = parseAuthHash(win.location.hash)
  win.history.replaceState(win.history.state, '', win.location.pathname + win.location.search)
  if (!result) return
  if ('error' in result) {
    urlSignInError = result.error
    return
  }
  pendingSignIn = getAuthClient()
    .then((client) => client.auth.setSession(result.tokens))
    .then(({ error }) => {
      if (error) urlSignInError = 'We couldn’t finish signing you in. Ask for a new link.'
      return !error
    })
    .catch(() => false)
}

/** The in-flight sign-in from a link, if any. */
export function getPendingSignIn() {
  return pendingSignIn
}

/** A message to show if the link the user opened didn't work. */
export function getUrlSignInError() {
  return urlSignInError
}
