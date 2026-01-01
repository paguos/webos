import { vi } from 'vitest'

// Create a functioning localStorage mock
class LocalStorageMock {
  constructor() {
    this._store = {}
  }

  getItem(key) {
    return this._store[key] || null
  }

  setItem(key, value) {
    this._store[key] = String(value)
    // Also set as property so Object.keys() works
    this[key] = String(value)
  }

  removeItem(key) {
    delete this._store[key]
    delete this[key]
  }

  clear() {
    // Remove all properties
    Object.keys(this._store).forEach(key => {
      delete this[key]
    })
    this._store = {}
  }

  get length() {
    return Object.keys(this._store).length
  }

  key(index) {
    const keys = Object.keys(this._store)
    return keys[index] || null
  }
}

global.localStorage = new LocalStorageMock()

// Reset localStorage before each test
beforeEach(() => {
  global.localStorage.clear()
})
