import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getFaviconUrl, preloadFavicon } from '../favicon'

describe('favicon', () => {
  describe('getFaviconUrl', () => {
    it('should return default icon for null or undefined URL', () => {
      expect(getFaviconUrl(null)).toBe('/default-icon.svg')
      expect(getFaviconUrl(undefined)).toBe('/default-icon.svg')
      expect(getFaviconUrl('')).toBe('/default-icon.svg')
    })

    it('should generate favicon URL for valid URLs', () => {
      const url = getFaviconUrl('https://example.com')
      expect(url).toBe('https://www.google.com/s2/favicons?domain=example.com&sz=128')
    })

    it('should handle URLs with paths', () => {
      const url = getFaviconUrl('https://example.com/path/to/page')
      expect(url).toBe('https://www.google.com/s2/favicons?domain=example.com&sz=128')
    })

    it('should handle URLs with subdomains', () => {
      const url = getFaviconUrl('https://www.example.com')
      expect(url).toBe('https://www.google.com/s2/favicons?domain=www.example.com&sz=128')
    })

    it('should return default icon for URLs without protocol', () => {
      // getFaviconUrl doesn't normalize URLs, getDomain expects proper URLs
      const url = getFaviconUrl('example.com')
      expect(url).toBe('/default-icon.svg')
    })
  })

  describe('preloadFavicon', () => {
    beforeEach(() => {
      // Reset Image mock before each test
      vi.clearAllMocks()
    })

    it('should resolve with URL when image loads successfully', async () => {
      const faviconUrl = 'https://example.com/favicon.ico'

      // Mock Image constructor
      const mockImage = {
        onload: null as any,
        onerror: null as any,
        src: ''
      }

      global.Image = vi.fn(() => mockImage) as any

      const promise = preloadFavicon(faviconUrl)

      // Simulate successful load
      setTimeout(() => {
        if (mockImage.onload) mockImage.onload()
      }, 0)

      await expect(promise).resolves.toBe(faviconUrl)
    })

    it('should reject when image fails to load', async () => {
      const faviconUrl = 'https://example.com/nonexistent.ico'

      // Mock Image constructor
      const mockImage = {
        onload: null as any,
        onerror: null as any,
        src: ''
      }

      global.Image = vi.fn(() => mockImage) as any

      const promise = preloadFavicon(faviconUrl)

      // Simulate load error
      setTimeout(() => {
        if (mockImage.onerror) mockImage.onerror()
      }, 0)

      await expect(promise).rejects.toThrow('Failed to load favicon')
    })

    it('should set image src to the provided URL', () => {
      const faviconUrl = 'https://example.com/favicon.ico'

      // Mock Image constructor
      const mockImage = {
        onload: null as any,
        onerror: null as any,
        src: ''
      }

      global.Image = vi.fn(() => mockImage) as any

      preloadFavicon(faviconUrl)

      expect(mockImage.src).toBe(faviconUrl)
    })
  })
})
