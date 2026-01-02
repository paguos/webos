import type { StorageData } from '../types'
import electronStorage from './electronStorage'
import chromeStorage from './chromeStorage'
import { StorageFullError } from './errors'

// Declare chrome global for TypeScript
declare global {
  interface Window {
    chrome?: {
      storage?: {
        local?: any
      }
    }
  }
  const chrome: any
}

const STORAGE_PREFIX = 'webOS_'
const STORAGE_VERSION = '1.0'

// Storage backend interface
interface StorageBackend {
  get<T = any>(key: string): T | null
  set<T = any>(key: string, value: T): boolean
  remove(key: string): boolean
  clear(): boolean
  keys(): string[]
}

// Storage availability info
interface StorageAvailability {
  available: boolean
  type?: string
  unlimited?: boolean
  quota?: string
  usedBytes?: number
  usedKB?: string
  usedMB?: string
  error?: string
}

// Detect environment
const isElectron = (): boolean => !!(window as any).electronAPI?.isElectron
const isChromeExtension = (): boolean => {
  return typeof chrome !== 'undefined' &&
         chrome.storage &&
         chrome.storage.local
}

// Initialize storage on load
let initialized = false

async function ensureInitialized(): Promise<void> {
  if (!initialized) {
    if (isElectron()) {
      await electronStorage.initialize()
    } else if (isChromeExtension()) {
      await chromeStorage.initialize()
    }
    initialized = true
  }
}

// LocalStorage backend (browser)
const localStorageBackend: StorageBackend = {
  get<T = any>(key: string): T | null {
    try {
      const item = localStorage.getItem(STORAGE_PREFIX + key)
      if (!item) return null

      const parsed: StorageData<T> = JSON.parse(item)

      // Check version for potential migrations
      if (parsed.version && parsed.version !== STORAGE_VERSION) {
        console.warn(`Storage version mismatch for key: ${key}`)
      }

      return parsed.data !== undefined ? parsed.data : (parsed as any)
    } catch (e) {
      console.error(`Storage get error for key "${key}":`, e)
      return null
    }
  },

  set<T = any>(key: string, value: T): boolean {
    try {
      const dataToStore: StorageData<T> = {
        version: STORAGE_VERSION,
        data: value,
        timestamp: new Date().toISOString()
      }

      localStorage.setItem(
        STORAGE_PREFIX + key,
        JSON.stringify(dataToStore)
      )
      return true
    } catch (e: any) {
      if (e.name === 'QuotaExceededError') {
        console.error('localStorage quota exceeded')
        throw new StorageFullError(e)
      } else {
        console.error(`Storage set error for key "${key}":`, e)
        throw e
      }
    }
  },

  remove(key: string): boolean {
    try {
      localStorage.removeItem(STORAGE_PREFIX + key)
      return true
    } catch (e) {
      console.error(`Storage remove error for key "${key}":`, e)
      return false
    }
  },

  clear(): boolean {
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

  keys(): string[] {
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

// Select storage backend based on environment
const storageBackend: StorageBackend = isElectron()
  ? electronStorage
  : isChromeExtension()
    ? chromeStorage
    : localStorageBackend

export const storage = {
  /**
   * Get an item from storage
   * @param key - The key to retrieve
   * @returns The parsed value or null if not found
   */
  async get<T = any>(key: string): Promise<T | null> {
    await ensureInitialized()
    return storageBackend.get<T>(key)
  },

  /**
   * Set an item in storage
   * @param key - The key to store
   * @param value - The value to store
   * @returns True if successful, false otherwise
   */
  async set<T = any>(key: string, value: T): Promise<boolean> {
    await ensureInitialized()
    return storageBackend.set<T>(key, value)
  },

  /**
   * Remove an item from storage
   * @param key - The key to remove
   * @returns True if successful
   */
  async remove(key: string): Promise<boolean> {
    await ensureInitialized()
    return storageBackend.remove(key)
  },

  /**
   * Clear all webOS data from storage
   * @returns True if successful
   */
  async clear(): Promise<boolean> {
    await ensureInitialized()
    return storageBackend.clear()
  },

  /**
   * Get all webOS keys from storage
   * @returns Array of keys
   */
  async keys(): Promise<string[]> {
    await ensureInitialized()
    return storageBackend.keys()
  },

  /**
   * Check if storage is available (only for localStorage)
   * @returns Storage availability info
   */
  checkAvailability(): StorageAvailability {
    if (isElectron()) {
      return {
        available: true,
        type: 'electron-file-system',
        unlimited: true
      }
    }

    if (isChromeExtension()) {
      return {
        available: true,
        type: 'chrome-storage-local',
        quota: '~10MB',
        unlimited: false
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
    } catch (e: any) {
      return {
        available: false,
        error: e.message
      }
    }
  }
}

export default storage
