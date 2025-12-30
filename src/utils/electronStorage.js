// Check if running in Electron
const isElectron = () => window.electronAPI?.isElectron

// Single source of truth - all data in one file
let dataCache = null
let saveTimeout = null

const electronStorage = {
  async initialize() {
    if (!isElectron()) {
      throw new Error('Electron API not available')
    }

    // Load data from file on startup
    dataCache = await window.electronAPI.storage.read()

    if (!dataCache) {
      // First run - create empty data structure
      dataCache = {
        version: '1.0',
        websites: [],
        categories: [],
        settings: {},
        timestamp: new Date().toISOString()
      }
      await this.save()
    }

    return dataCache
  },

  async save() {
    if (!isElectron()) {
      throw new Error('Electron API not available')
    }

    dataCache.timestamp = new Date().toISOString()
    // Serialize to remove Vue reactivity and ensure IPC compatibility
    const serializedData = JSON.parse(JSON.stringify(dataCache))
    await window.electronAPI.storage.write(serializedData)
  },

  // Debounced save - waits 500ms after last change
  debouncedSave() {
    if (saveTimeout) {
      clearTimeout(saveTimeout)
    }
    saveTimeout = setTimeout(async () => {
      try {
        await electronStorage.save()
        console.log('Data auto-saved')
      } catch (err) {
        console.error('Failed to save data:', err)
      }
    }, 500)
  },

  get(key) {
    if (!dataCache) {
      console.warn('Storage not initialized, returning null')
      return null
    }
    return dataCache[key] || null
  },

  set(key, value) {
    if (!dataCache) {
      throw new Error('Storage not initialized')
    }
    // Deep clone to remove Vue reactivity
    dataCache[key] = JSON.parse(JSON.stringify(value))
    // Use debounced save to prevent excessive writes
    this.debouncedSave()
  },

  clear() {
    dataCache = {
      version: '1.0',
      websites: [],
      categories: [],
      settings: {},
      timestamp: new Date().toISOString()
    }
    this.save()
  },

  // Get all keys
  keys() {
    if (!dataCache) {
      return []
    }
    return Object.keys(dataCache).filter(k => k !== 'version' && k !== 'timestamp')
  }
}

export default electronStorage
