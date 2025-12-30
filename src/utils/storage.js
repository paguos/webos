const STORAGE_PREFIX = 'browserOS_'
const STORAGE_VERSION = '1.0'

export const storage = {
  /**
   * Get an item from localStorage
   * @param {string} key - The key to retrieve
   * @returns {any} The parsed value or null if not found
   */
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

  /**
   * Set an item in localStorage
   * @param {string} key - The key to store
   * @param {any} value - The value to store
   * @returns {boolean} True if successful, false otherwise
   */
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
        // Could emit an event here for the UI to show an error
        alert('Storage is full. Please delete some websites or export your data.')
      } else {
        console.error(`Storage set error for key "${key}":`, e)
      }
      return false
    }
  },

  /**
   * Remove an item from localStorage
   * @param {string} key - The key to remove
   */
  remove(key) {
    try {
      localStorage.removeItem(STORAGE_PREFIX + key)
      return true
    } catch (e) {
      console.error(`Storage remove error for key "${key}":`, e)
      return false
    }
  },

  /**
   * Clear all browserOS data from localStorage
   */
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

  /**
   * Get all browserOS keys from localStorage
   * @returns {string[]} Array of keys without prefix
   */
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
  },

  /**
   * Check if storage is available and has space
   * @returns {Object} Storage availability info
   */
  checkAvailability() {
    try {
      const testKey = STORAGE_PREFIX + '__test__'
      localStorage.setItem(testKey, 'test')
      localStorage.removeItem(testKey)

      // Try to estimate remaining space
      let used = 0
      this.keys().forEach(key => {
        const item = localStorage.getItem(STORAGE_PREFIX + key)
        used += item ? item.length : 0
      })

      // localStorage typically has ~5-10MB limit
      const estimated = {
        available: true,
        usedBytes: used,
        usedKB: (used / 1024).toFixed(2),
        usedMB: (used / 1024 / 1024).toFixed(2)
      }

      return estimated
    } catch (e) {
      return {
        available: false,
        error: e.message
      }
    }
  }
}

export default storage
