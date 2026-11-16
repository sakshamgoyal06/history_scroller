import { describe, expect, it, vi } from 'vitest'
import { STORAGE_KEYS, writeText } from '../storage/localStore.js'
import { authStorage, captureSignInFromUrl, getPendingSignIn, getUrlSignInError, hasStoredSession, isAuthRedirect, parseAuthHash, isValidEmail, normalizeEmail, sendSignInLink, signInErrorMessage } from './auth.js'

const fakeClient = (result = { error: null }) => ({ auth: { signInWithOtp: vi.fn(async () => result), signOut: vi.fn() } })

describe('email sign-in (M0.3, FR-ACCT-01)', () => {
  it('validates and normalizes emails', () => {
    expect(normalizeEmail('  Asha@Example.COM ')).toBe('asha@example.com')
    expect(isValidEmail('asha@example.com')).toBe(true)
    expect(isValidEmail('asha@example')).toBe(false)
    expect(isValidEmail('asha example.com')).toBe(false)
    expect(isValidEmail('')).toBe(false)
  })

  it('does not call Supabase for an invalid email', async () => {
    const client = fakeClient()
    expect(await sendSignInLink('nope', { client })).toEqual({ ok: false, message: 'Enter a valid email address.' })
    expect(client.auth.signInWithOtp).not.toHaveBeenCalled()
  })

  it('sends a link to the normalized email with the redirect', async () => {
    const client = fakeClient()
    expect(await sendSignInLink(' Asha@Example.com', { client, redirectTo: 'https://app.test/' })).toEqual({ ok: true })
    expect(client.auth.signInWithOtp).toHaveBeenCalledWith({
      email: 'asha@example.com',
      options: { shouldCreateUser: true, emailRedirectTo: 'https://app.test/' },
    })
  })

  it('turns Supabase errors into short copy', async () => {
    const client = fakeClient({ error: { status: 429, message: 'Email rate limit exceeded' } })
    expect(await sendSignInLink('a@b.co', { client })).toEqual({ ok: false, message: 'Too many sign-in emails. Try again in a few minutes.' })
    expect(signInErrorMessage({ message: 'Failed to fetch' })).toMatch(/offline/)
    expect(signInErrorMessage({ message: 'weird' })).toMatch(/couldn’t send/)
  })

  it('stores the session through localStore under one key', () => {
    expect(hasStoredSession()).toBe(false)
    authStorage.setItem(STORAGE_KEYS.auth, '{"access_token":"x"}')
    expect(hasStoredSession()).toBe(true)
    expect(authStorage.getItem(STORAGE_KEYS.auth)).toBe('{"access_token":"x"}')
    authStorage.removeItem(STORAGE_KEYS.auth)
    expect(hasStoredSession()).toBe(false)
    writeText(STORAGE_KEYS.auth, '')
  })

  it('recognises a return from the sign-in email', () => {
    expect(isAuthRedirect({ hash: '#access_token=abc&type=magiclink' })).toBe(true)
    expect(isAuthRedirect({ hash: '#error_description=Email+link+is+invalid' })).toBe(true)
    expect(isAuthRedirect({ hash: '#library' })).toBe(false)
  })
})

describe('returning from the sign-in email', () => {
  it('reads tokens or the error from the hash', () => {
    expect(parseAuthHash('#access_token=a&refresh_token=r&type=magiclink')).toEqual({ tokens: { access_token: 'a', refresh_token: 'r' } })
    expect(parseAuthHash('#error=access_denied&error_description=Email+link+is+invalid+or+has+expired')).toEqual({
      error: 'That sign-in link has expired or was already used. Ask for a new one.',
    })
    expect(parseAuthHash('#library')).toBeNull()
    expect(parseAuthHash('')).toBeNull()
  })

  it('removes the hash from the URL before the app routes, and keeps the error for the UI', () => {
    const replaceState = vi.fn()
    const win = {
      location: { hash: '#error_description=expired', pathname: '/upsc', search: '' },
      history: { state: null, replaceState },
    }
    captureSignInFromUrl(win)
    expect(replaceState).toHaveBeenCalledWith(null, '', '/upsc')
    expect(getUrlSignInError()).toMatch(/expired/)
    expect(getPendingSignIn()).toBeNull()
  })

  it('leaves ordinary URLs alone', () => {
    const replaceState = vi.fn()
    captureSignInFromUrl({ location: { hash: '#library', pathname: '/', search: '' }, history: { replaceState } })
    expect(replaceState).not.toHaveBeenCalled()
  })
})
