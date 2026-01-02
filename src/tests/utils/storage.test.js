import { describe, it, expect, beforeEach, vi } from 'vitest'
import { storage } from '../../utils/storage'

describe('storage.js', () => {
  beforeEach(() => {
    // Clear localStorage mock before each test
    localStorage.clear()
    localStorage.getItem.mockReset()
    localStorage.setItem.mockReset()
    localStorage.removeItem.mockReset()
  })

  describe('storage.get', () => {
    it('should return null for non-existent keys', async () => {
      localStorage.getItem.mockReturnValue(null)
      const result = await storage.get('nonexistent')
      expect(result).toBeNull()
    })

    it('should return stored data', async () => {
      const testData = { websites: [], categories: [] }
      localStorage.getItem.mockReturnValue(JSON.stringify({
        version: '1.0',
        data: testData,
        timestamp: new Date().toISOString()
      }))

      const result = await storage.get('websites')
      expect(result).toEqual(testData)
    })

    it('should handle legacy data without version wrapper', async () => {
      const testData = { name: 'Test' }
      localStorage.getItem.mockReturnValue(JSON.stringify(testData))

      const result = await storage.get('test')
      expect(result).toEqual(testData)
    })

    it('should handle JSON parse errors gracefully', async () => {
      localStorage.getItem.mockReturnValue('invalid json')

      const result = await storage.get('test')
      expect(result).toBeNull()
    })

    it('should use correct storage prefix', async () => {
      await storage.get('websites')
      expect(localStorage.getItem).toHaveBeenCalledWith('webOS_websites')
    })
  })

  describe('storage.set', () => {
    it('should store data with version and timestamp', async () => {
      const testData = { name: 'Test Website' }
      await storage.set('test', testData)

      expect(localStorage.setItem).toHaveBeenCalled()
      const callArgs = localStorage.setItem.mock.calls[0]
      expect(callArgs[0]).toBe('webOS_test')

      const storedData = JSON.parse(callArgs[1])
      expect(storedData.version).toBe('1.0')
      expect(storedData.data).toEqual(testData)
      expect(storedData.timestamp).toBeDefined()
    })

    it('should return true on success', async () => {
      const result = await storage.set('test', { data: 'test' })
      expect(result).toBe(true)
    })

    it('should handle quota exceeded errors', async () => {
      const quotaError = new Error('QuotaExceededError')
      quotaError.name = 'QuotaExceededError'
      localStorage.setItem.mockImplementation(() => {
        throw quotaError
      })

      // Mock window.alert to prevent actual alert during test
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

      const result = await storage.set('test', { data: 'test' })
      expect(result).toBe(false)
      expect(alertSpy).toHaveBeenCalled()

      alertSpy.mockRestore()
    })

    it('should return false on other errors', async () => {
      localStorage.setItem.mockImplementation(() => {
        throw new Error('Some other error')
      })

      const result = await storage.set('test', { data: 'test' })
      expect(result).toBe(false)
    })
  })

  describe('storage.remove', () => {
    it('should remove item from storage', async () => {
      await storage.remove('test')
      expect(localStorage.removeItem).toHaveBeenCalledWith('webOS_test')
    })

    it('should return true on success', async () => {
      const result = await storage.remove('test')
      expect(result).toBe(true)
    })

    it('should return false on error', async () => {
      localStorage.removeItem.mockImplementation(() => {
        throw new Error('Error')
      })

      const result = await storage.remove('test')
      expect(result).toBe(false)
    })
  })

  describe('storage.clear', () => {
    it('should clear all webOS keys', async () => {
      // Mock Object.keys to return some keys
      const mockKeys = ['webOS_websites', 'webOS_categories', 'other_app_key']
      Object.defineProperty(localStorage, 'length', { value: mockKeys.length, writable: true })
      const spy = vi.spyOn(Object, 'keys').mockReturnValue(mockKeys)

      await storage.clear()

      // Should only remove webOS_ prefixed keys
      expect(localStorage.removeItem).toHaveBeenCalledWith('webOS_websites')
      expect(localStorage.removeItem).toHaveBeenCalledWith('webOS_categories')
      expect(localStorage.removeItem).not.toHaveBeenCalledWith('other_app_key')

      spy.mockRestore()
    })

    it('should return true on success', async () => {
      const spy = vi.spyOn(Object, 'keys').mockReturnValue([])
      const result = await storage.clear()
      expect(result).toBe(true)
      spy.mockRestore()
    })
  })

  describe('storage.keys', () => {
    it('should return only webOS keys without prefix', async () => {
      const mockKeys = ['webOS_websites', 'webOS_categories', 'other_app_key', 'webOS_settings']
      const spy = vi.spyOn(Object, 'keys').mockReturnValue(mockKeys)

      const result = await storage.keys()

      expect(result).toEqual(['websites', 'categories', 'settings'])
      expect(result).not.toContain('other_app_key')

      spy.mockRestore()
    })

    it('should return empty array when no webOS keys exist', async () => {
      const spy = vi.spyOn(Object, 'keys').mockReturnValue(['other_app_key'])

      const result = await storage.keys()
      expect(result).toEqual([])

      spy.mockRestore()
    })

    it('should handle errors gracefully', async () => {
      const spy = vi.spyOn(Object, 'keys').mockImplementation(() => {
        throw new Error('Error')
      })

      const result = await storage.keys()
      expect(result).toEqual([])

      spy.mockRestore()
    })
  })

  describe('storage.checkAvailability', () => {
    it('should check storage availability for browser environment', () => {
      const result = storage.checkAvailability()

      expect(result.available).toBe(true)
      expect(result.type).toBe('localStorage')
      expect(result.usedBytes).toBeDefined()
      expect(result.usedKB).toBeDefined()
      expect(result.usedMB).toBeDefined()
    })

    it('should handle storage check errors', () => {
      const originalImpl = localStorage.setItem.getMockImplementation()
      localStorage.setItem.mockImplementation(() => {
        throw new Error('Storage unavailable')
      })

      const result = storage.checkAvailability()

      expect(result.available).toBe(false)
      expect(result.error).toBeDefined()

      // Restore original implementation
      if (originalImpl) {
        localStorage.setItem.mockImplementation(originalImpl)
      } else {
        localStorage.setItem.mockReset()
      }
    })
  })
})
