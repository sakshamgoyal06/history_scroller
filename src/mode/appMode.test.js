import { beforeEach, describe, expect, it } from 'vitest'
import {
  loadAppMode,
  loadOnboarded,
  loadUpscProfile,
  resolveInitialMode,
  saveAppMode,
  saveOnboarded,
  saveUpscProfile,
  shouldShowOnboarding,
} from './appMode.js'
import { STORAGE_KEYS } from '../storage/localStore.js'

describe('app mode storage', () => {
  beforeEach(() => localStorage.clear())

  it('defaults to curious and round-trips a saved mode', () => {
    expect(loadAppMode()).toBe('curious')
    saveAppMode('upsc')
    expect(loadAppMode()).toBe('upsc')
  })

  it('ignores invalid stored values', () => {
    localStorage.setItem(STORAGE_KEYS.appMode, JSON.stringify('exam'))
    expect(loadAppMode()).toBe('curious')
    expect(saveAppMode(/** @type {any} */ ('exam'))).toBe(false)
  })

  it('remembers that onboarding is done', () => {
    expect(loadOnboarded()).toBe(false)
    saveOnboarded()
    expect(loadOnboarded()).toBe(true)
  })

  it('merges a stored UPSC profile with defaults', () => {
    expect(loadUpscProfile().exam).toBe('UPSC CSE')
    saveUpscProfile({ exam: 'State PSC', attempt: '2028', language: 'English' })
    expect(loadUpscProfile()).toMatchObject({ exam: 'State PSC', attempt: '2028' })
  })
})

describe('resolveInitialMode', () => {
  it('opens UPSC mode on /upsc whatever was saved', () => {
    expect(resolveInitialMode('/upsc', 'curious')).toBe('upsc')
    expect(resolveInitialMode('/upsc/', 'curious')).toBe('upsc')
  })

  it('uses the saved mode on the root', () => {
    expect(resolveInitialMode('/', 'upsc')).toBe('upsc')
    expect(resolveInitialMode('', 'curious')).toBe('curious')
  })

  it('keeps Curious deep links in Curious mode', () => {
    expect(resolveInitialMode('/story/black-death', 'upsc')).toBe('curious')
  })
})

describe('shouldShowOnboarding', () => {
  it('shows only on a first plain open', () => {
    expect(shouldShowOnboarding('/', false)).toBe(true)
    expect(shouldShowOnboarding('/', true)).toBe(false)
    expect(shouldShowOnboarding('/story/x', false)).toBe(false)
  })
})
