/**
 * App mode: Curious (general feed) or UPSC ("Study"). PRD v2.0 §1, FR-ONB-01.
 * Stored on the device until accounts sync it (FR-ACCT-03).
 */
import { STORAGE_KEYS, readJson, writeJson } from '../storage/localStore.js'

/** @typedef {'curious' | 'upsc'} AppMode */

export const APP_MODES = /** @type {const} */ (['curious', 'upsc'])
export const UPSC_PATH = '/upsc'

/** @param {unknown} value @returns {value is AppMode} */
export function isAppMode(value) {
  return value === 'curious' || value === 'upsc'
}

/** @returns {AppMode} */
export function loadAppMode() {
  const stored = readJson(STORAGE_KEYS.appMode, 'curious')
  return isAppMode(stored) ? stored : 'curious'
}

/** @param {AppMode} mode */
export function saveAppMode(mode) {
  if (!isAppMode(mode)) return false
  return writeJson(STORAGE_KEYS.appMode, mode)
}

/** @returns {boolean} */
export function loadOnboarded() {
  return readJson(STORAGE_KEYS.onboarding, null)?.done === true
}

export function saveOnboarded() {
  return writeJson(STORAGE_KEYS.onboarding, { done: true, at: new Date().toISOString() })
}

/**
 * Which mode to open with. `/upsc` always opens UPSC mode; any other deep link
 * (a story, a zone, a path) belongs to Curious mode; the bare root uses the saved mode.
 * @param {string} pathname
 * @param {AppMode} savedMode
 * @returns {AppMode}
 */
export function resolveInitialMode(pathname, savedMode) {
  const path = (pathname || '/').replace(/\/+$/, '') || '/'
  if (path === UPSC_PATH || path.startsWith(`${UPSC_PATH}/`)) return 'upsc'
  if (path === '/') return isAppMode(savedMode) ? savedMode : 'curious'
  return 'curious'
}

/**
 * First-run onboarding shows only on a plain open of the app, never over a shared link.
 * @param {string} pathname
 * @param {boolean} onboarded
 */
export function shouldShowOnboarding(pathname, onboarded) {
  if (onboarded) return false
  const path = (pathname || '/').replace(/\/+$/, '') || '/'
  return path === '/'
}

export const DEFAULT_UPSC_PROFILE = { exam: 'UPSC CSE', attempt: '2027', language: 'English' }

export function loadUpscProfile() {
  const stored = readJson(STORAGE_KEYS.upscProfile, null)
  return stored && typeof stored === 'object' ? { ...DEFAULT_UPSC_PROFILE, ...stored } : { ...DEFAULT_UPSC_PROFILE }
}

/** @param {typeof DEFAULT_UPSC_PROFILE} profile */
export function saveUpscProfile(profile) {
  return writeJson(STORAGE_KEYS.upscProfile, profile)
}
