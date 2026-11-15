import { beforeEach } from 'vitest'

class MemoryStorage {
  #data = new Map()
  get length() {
    return this.#data.size
  }
  key(i) {
    return [...this.#data.keys()][i] ?? null
  }
  getItem(key) {
    return this.#data.has(key) ? this.#data.get(key) : null
  }
  setItem(key, value) {
    this.#data.set(key, String(value))
  }
  removeItem(key) {
    this.#data.delete(key)
  }
  clear() {
    this.#data.clear()
  }
}

// Accessor properties (like browsers) so tests can simulate storage that throws on access.
for (const name of ['localStorage', 'sessionStorage']) {
  const store = new MemoryStorage()
  Object.defineProperty(globalThis, name, { configurable: true, get: () => store })
}

beforeEach(() => {
  globalThis.localStorage.clear()
  globalThis.sessionStorage.clear()
})
