import electronStorage from './electronStorage'

const STORAGE_PREFIX = 'browserOS_'
const STORAGE_VERSION = '1.0'

// Detect environment
const isElectron = () => window.electronAPI?.isElectron

// Initialize storage on load
let initialized = false

async function ensureInitialized() {
  if (!initialized && isElectron()) {
    await electronStorage.initialize()
    initialized = true
  }
}

// LocalStorage backend (browser)
const localStorageBackend = {
  get(key) {
    try {
      const item = localStorage.getItem(STORAGE_PREFIX + key)
      if (!item) return null

      const parsed = JSON.parse(item)

      // Check version for potential migrations
      if (parsed.version && parsed.version !== STORAGE_VERSION) {
        console.warn(`Storage version mismatch for key: ${key}`)
      }

      return parsed.data !== undefined ? parsed.data : parsed
    } catch (e) {
      console.error(`Storage get error for key "${key}":`, e)
      return null
    }
  },

  set(key, value) {
    try {
      const dataToStore = {
        version: STORAGE_VERSION,
        data: value,
        timestamp: new Date().toISOString()
      }

      localStorage.setItem(
        STORAGE_PREFIX + key,
        JSON.stringify(dataToStore)
      )
      return true
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        console.error('localStorage quota exceeded')
        alert('Storage is full. Please delete some websites or export your data.')
      } else {
        console.error(`Storage set error for key "${key}":`, e)
      }
      return false
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(STORAGE_PREFIX + key)
      return true
    } catch (e) {
      console.error(`Storage remove error for key "${key}":`, e)
      return false
    }
  },

  clear() {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(STORAGE_PREFIX)) {
          localStorage.removeItem(key)
        }
      })
      return true
    } catch (e) {
      console.error('Storage clear error:', e)
      return false
    }
  },

  keys() {
    try {
      const keys = Object.keys(localStorage)
      return keys
        .filter(key => key.startsWith(STORAGE_PREFIX))
        .map(key => key.replace(STORAGE_PREFIX, ''))
    } catch (e) {
      console.error('Storage keys error:', e)
      return []
    }
  }
}

// Use Electron storage if available, fallback to localStorage
const storageBackend = isElectron() ? electronStorage : localStorageBackend

export const storage = {
  /**
   * Get an item from storage
   * @param {string} key - The key to retrieve
   * @returns {Promise<any>} The parsed value or null if not found
   */
  async get(key) {
    await ensureInitialized()
    return storageBackend.get(key)
  },

  /**
   * Set an item in storage
   * @param {string} key - The key to store
   * @param {any} value - The value to store
   * @returns {Promise<boolean>} True if successful, false otherwise
   */
  async set(key, value) {
    await ensureInitialized()
    return storageBackend.set(key, value)
  },

  /**
   * Remove an item from storage
   * @param {string} key - The key to remove
   * @returns {Promise<boolean>} True if successful
   */
  async remove(key) {
    await ensureInitialized()
    return storageBackend.remove(key)
  },

  /**
   * Clear all browserOS data from storage
   * @returns {Promise<boolean>} True if successful
   */
  async clear() {
    await ensureInitialized()
    return storageBackend.clear()
  },

  /**
   * Get all browserOS keys from storage
   * @returns {Promise<string[]>} Array of keys
   */
  async keys() {
    await ensureInitialized()
    return storageBackend.keys()
  },

  /**
   * Check if storage is available (only for localStorage)
   * @returns {Object} Storage availability info
   */
  checkAvailability() {
    if (isElectron()) {
      return {
        available: true,
        type: 'electron-file-system',
        unlimited: true
      }
    }

    try {
      const testKey = STORAGE_PREFIX + '__test__'
      localStorage.setItem(testKey, 'test')
      localStorage.removeItem(testKey)

      // Try to estimate remaining space
      let used = 0
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(STORAGE_PREFIX)) {
          const item = localStorage.getItem(key)
          used += item ? item.length : 0
        }
      })

      return {
        available: true,
        type: 'localStorage',
        usedBytes: used,
        usedKB: (used / 1024).toFixed(2),
        usedMB: (used / 1024 / 1024).toFixed(2)
      }
    } catch (e) {
      return {
        available: false,
        error: e.message
      }
    }
  }
}

export default storage
