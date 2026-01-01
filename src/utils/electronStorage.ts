// Electron API types
interface ElectronAPI {
  isElectron: boolean
  storage: {
    read: () => Promise<any>
    write: (data: any) => Promise<void>
  }
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

// Check if running in Electron
const isElectron = (): boolean => !!(window.electronAPI?.isElectron)

// Data cache structure
interface DataCache {
  version: string
  websites?: any[]
  categories?: any[]
  settings?: any
  timestamp: string
  [key: string]: any
}

// Single source of truth - all data in one file
let dataCache: DataCache | null = null
let saveTimeout: NodeJS.Timeout | null = null

const electronStorage = {
  async initialize(): Promise<DataCache> {
    if (!isElectron()) {
      throw new Error('Electron API not available')
    }

    // Load data from file on startup
    dataCache = await window.electronAPI!.storage.read()

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

  async save(): Promise<void> {
    if (!isElectron()) {
      throw new Error('Electron API not available')
    }

    if (!dataCache) {
      throw new Error('Storage not initialized')
    }

    dataCache.timestamp = new Date().toISOString()
    // Serialize to remove Vue reactivity and ensure IPC compatibility
    const serializedData = JSON.parse(JSON.stringify(dataCache))
    await window.electronAPI!.storage.write(serializedData)
  },

  // Debounced save - waits 500ms after last change
  debouncedSave(): void {
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

  get<T = any>(key: string): T | null {
    if (!dataCache) {
      console.warn('Storage not initialized, returning null')
      return null
    }
    return dataCache[key] || null
  },

  set<T = any>(key: string, value: T): boolean {
    if (!dataCache) {
      throw new Error('Storage not initialized')
    }
    // Deep clone to remove Vue reactivity
    dataCache[key] = JSON.parse(JSON.stringify(value))
    // Use debounced save to prevent excessive writes
    this.debouncedSave()
    return true
  },

  remove(key: string): boolean {
    if (!dataCache) {
      throw new Error('Storage not initialized')
    }
    delete dataCache[key]
    this.debouncedSave()
    return true
  },

  clear(): boolean {
    dataCache = {
      version: '1.0',
      websites: [],
      categories: [],
      settings: {},
      timestamp: new Date().toISOString()
    }
    this.save()
    return true
  },

  // Get all keys
  keys(): string[] {
    if (!dataCache) {
      return []
    }
    return Object.keys(dataCache).filter(k => k !== 'version' && k !== 'timestamp')
  }
}

export default electronStorage
