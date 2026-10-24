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

globalThis.localStorage = new MemoryStorage()

beforeEach(() => {
  globalThis.localStorage.clear()
})
