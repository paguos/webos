import { describe, it, expect, beforeEach, vi } from 'vitest'
import { storage } from '../storage'

describe('storage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('set and get', () => {
    it('should store and retrieve data', async () => {
      const testData = { foo: 'bar', number: 42 }
      await storage.set('test-key', testData)

      const retrieved = await storage.get('test-key')
      expect(retrieved).toEqual(testData)
    })

    it('should return null for non-existent keys', async () => {
      const result = await storage.get('nonexistent')
      expect(result).toBeNull()
    })

    it('should handle different data types', async () => {
      // String
      await storage.set('string', 'hello')
      expect(await storage.get('string')).toBe('hello')

      // Number
      await storage.set('number', 123)
      expect(await storage.get('number')).toBe(123)

      // Boolean
      await storage.set('boolean', true)
      expect(await storage.get('boolean')).toBe(true)

      // Array
      await storage.set('array', [1, 2, 3])
      expect(await storage.get('array')).toEqual([1, 2, 3])

      // Object
      await storage.set('object', { a: 1, b: 2 })
      expect(await storage.get('object')).toEqual({ a: 1, b: 2 })
    })

    it('should prefix keys with webOS_', async () => {
      await storage.set('test', 'value')

      // Check that the key is prefixed in localStorage
      const keys = Object.keys(localStorage)
      expect(keys.some(k => k.startsWith('webOS_test'))).toBe(true)
    })

    it('should wrap data with version and timestamp', async () => {
      await storage.set('test', 'value')

      const rawData = localStorage.getItem('webOS_test')
      expect(rawData).toBeTruthy()

      if (rawData) {
        const parsed = JSON.parse(rawData)
        expect(parsed).toHaveProperty('version')
        expect(parsed).toHaveProperty('data')
        expect(parsed).toHaveProperty('timestamp')
        expect(parsed.data).toBe('value')
      }
    })
  })

  describe('remove', () => {
    it('should remove stored data', async () => {
      await storage.set('test', 'value')
      expect(await storage.get('test')).toBe('value')

      await storage.remove('test')
      expect(await storage.get('test')).toBeNull()
    })

    it('should return true when removing existing key', async () => {
      await storage.set('test', 'value')
      const result = await storage.remove('test')
      expect(result).toBe(true)
    })

    it('should return true even when removing non-existent key', async () => {
      const result = await storage.remove('nonexistent')
      expect(result).toBe(true)
    })
  })

  describe('clear', () => {
    it('should clear all webOS data', async () => {
      await storage.set('key1', 'value1')
      await storage.set('key2', 'value2')
      await storage.set('key3', 'value3')

      await storage.clear()

      expect(await storage.get('key1')).toBeNull()
      expect(await storage.get('key2')).toBeNull()
      expect(await storage.get('key3')).toBeNull()
    })

    it('should only clear webOS prefixed keys', async () => {
      // Add webOS data
      await storage.set('test', 'value')

      // Add non-webOS data directly to localStorage
      localStorage.setItem('other-app-key', 'other-value')

      await storage.clear()

      // webOS data should be cleared
      expect(await storage.get('test')).toBeNull()

      // Other data should remain
      expect(localStorage.getItem('other-app-key')).toBe('other-value')
    })
  })

  describe('keys', () => {
    it('should return all webOS keys', async () => {
      await storage.set('key1', 'value1')
      await storage.set('key2', 'value2')
      await storage.set('key3', 'value3')

      const keys = await storage.keys()
      expect(keys).toContain('key1')
      expect(keys).toContain('key2')
      expect(keys).toContain('key3')
      expect(keys.length).toBe(3)
    })

    it('should not return non-webOS keys', async () => {
      await storage.set('webos-key', 'value')
      localStorage.setItem('other-key', 'value')

      const keys = await storage.keys()
      expect(keys).toContain('webos-key')
      expect(keys).not.toContain('other-key')
    })

    it('should return empty array when no keys exist', async () => {
      const keys = await storage.keys()
      expect(keys).toEqual([])
    })
  })

  describe('checkAvailability', () => {
    it('should return availability info', () => {
      const info = storage.checkAvailability()

      expect(info).toHaveProperty('available')
      expect(info.available).toBe(true)
      expect(info.type).toBe('localStorage')
    })

    it('should calculate storage usage', async () => {
      await storage.set('test', 'some data here')

      const info = storage.checkAvailability()

      expect(info).toHaveProperty('usedBytes')
      expect(info).toHaveProperty('usedKB')
      expect(info).toHaveProperty('usedMB')
      expect(info.usedBytes).toBeGreaterThan(0)
    })
  })
})
