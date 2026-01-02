// Chrome Extension Storage Backend
// Uses chrome.storage.local API (~10MB quota)

const STORAGE_VERSION = '1.0'
const CHROME_STORAGE_KEY = 'webOS_data'

// Check if running in Chrome Extension
const isChromeExtension = () => {
  return typeof chrome !== 'undefined' &&
         chrome.storage &&
         chrome.storage.local
}

// Single data cache - matches electronStorage pattern
let dataCache = null
let saveTimeout = null

const chromeStorage = {
  async initialize() {
    if (!isChromeExtension()) {
      throw new Error('Chrome Storage API not available')
    }

    // Load data from chrome.storage.local
    return new Promise((resolve, reject) => {
      chrome.storage.local.get([CHROME_STORAGE_KEY], (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError)
          return
        }

        dataCache = result[CHROME_STORAGE_KEY] || {
          version: STORAGE_VERSION,
          websites: [],
          tags: [],
          settings: {},
          timestamp: new Date().toISOString()
        }

        resolve(dataCache)
      })
    })
  },

  async save() {
    if (!isChromeExtension()) {
      throw new Error('Chrome Storage API not available')
    }

    dataCache.timestamp = new Date().toISOString()

    return new Promise((resolve, reject) => {
      // Serialize to remove Vue reactivity
      const serializedData = JSON.parse(JSON.stringify(dataCache))

      chrome.storage.local.set({ [CHROME_STORAGE_KEY]: serializedData }, () => {
        if (chrome.runtime.lastError) {
          // Check for quota exceeded
          if (chrome.runtime.lastError.message.includes('QUOTA_BYTES')) {
            alert('Extension storage is full. Please delete some websites or export your data.')
          }
          reject(chrome.runtime.lastError)
        } else {
          resolve()
        }
      })
    })
  },

  // Debounced save - matches electronStorage pattern
  debouncedSave() {
    if (saveTimeout) {
      clearTimeout(saveTimeout)
    }
    saveTimeout = setTimeout(async () => {
      try {
        await chromeStorage.save()
        console.log('Data auto-saved to chrome.storage')
      } catch (err) {
        console.error('Failed to save data:', err)
      }
    }, 500)
  },

  get(key) {
    if (!dataCache) {
      console.warn('Chrome storage not initialized, returning null')
      return null
    }
    return dataCache[key] || null
  },

  set(key, value) {
    if (!dataCache) {
      throw new Error('Chrome storage not initialized')
    }
    // Deep clone to remove Vue reactivity
    dataCache[key] = JSON.parse(JSON.stringify(value))
    // Use debounced save
    this.debouncedSave()
  },

  clear() {
    dataCache = {
      version: STORAGE_VERSION,
      websites: [],
      tags: [],
      settings: {},
      timestamp: new Date().toISOString()
    }
    this.save()
  },

  keys() {
    if (!dataCache) {
      return []
    }
    return Object.keys(dataCache).filter(k => k !== 'version' && k !== 'timestamp')
  }
}

export default chromeStorage
