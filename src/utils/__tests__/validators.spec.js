import { describe, it, expect } from 'vitest'
import {
  isValidUrl,
  normalizeUrl,
  getDomain,
  getOrigin,
  isValidName,
  isValidHexColor
} from '../validators'

describe('validators', () => {
  describe('isValidUrl', () => {
    it('should return true for valid HTTP URLs', () => {
      expect(isValidUrl('http://example.com')).toBe(true)
      expect(isValidUrl('http://www.example.com')).toBe(true)
      expect(isValidUrl('http://example.com/path')).toBe(true)
    })

    it('should return true for valid HTTPS URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true)
      expect(isValidUrl('https://www.example.com')).toBe(true)
      expect(isValidUrl('https://example.com/path?query=1')).toBe(true)
    })

    it('should return false for invalid URLs', () => {
      expect(isValidUrl('not a url')).toBe(false)
      expect(isValidUrl('example.com')).toBe(false)
      expect(isValidUrl('')).toBe(false)
      expect(isValidUrl(null)).toBe(false)
      expect(isValidUrl(undefined)).toBe(false)
    })

    it('should return false for non-HTTP/HTTPS protocols', () => {
      expect(isValidUrl('ftp://example.com')).toBe(false)
      expect(isValidUrl('file:///path/to/file')).toBe(false)
    })

    it('should return false for non-string input', () => {
      expect(isValidUrl(123)).toBe(false)
      expect(isValidUrl({})).toBe(false)
      expect(isValidUrl([])).toBe(false)
    })
  })

  describe('normalizeUrl', () => {
    it('should add https:// to URLs without protocol', () => {
      expect(normalizeUrl('example.com')).toBe('https://example.com/')
      expect(normalizeUrl('www.example.com')).toBe('https://www.example.com/')
    })

    it('should not modify URLs that already have protocol', () => {
      expect(normalizeUrl('https://example.com')).toBe('https://example.com/')
      expect(normalizeUrl('http://example.com')).toBe('http://example.com/')
    })

    it('should trim whitespace', () => {
      expect(normalizeUrl('  example.com  ')).toBe('https://example.com/')
      expect(normalizeUrl('  https://example.com  ')).toBe('https://example.com/')
    })

    it('should handle empty or null input', () => {
      expect(normalizeUrl('')).toBe('')
      expect(normalizeUrl(null)).toBe('')
      expect(normalizeUrl(undefined)).toBe('')
    })

    it('should preserve query parameters and paths', () => {
      expect(normalizeUrl('example.com/path?query=1')).toBe('https://example.com/path?query=1')
    })
  })

  describe('getDomain', () => {
    it('should extract domain from valid URLs', () => {
      expect(getDomain('https://example.com')).toBe('example.com')
      expect(getDomain('https://www.example.com')).toBe('www.example.com')
      expect(getDomain('http://subdomain.example.com')).toBe('subdomain.example.com')
    })

    it('should extract domain from URLs with paths and query strings', () => {
      expect(getDomain('https://example.com/path')).toBe('example.com')
      expect(getDomain('https://example.com/path?query=1')).toBe('example.com')
    })

    it('should return empty string for invalid URLs', () => {
      expect(getDomain('not a url')).toBe('')
      expect(getDomain('')).toBe('')
      expect(getDomain(null)).toBe('')
    })
  })

  describe('getOrigin', () => {
    it('should extract origin from valid URLs', () => {
      expect(getOrigin('https://example.com')).toBe('https://example.com')
      expect(getOrigin('http://example.com')).toBe('http://example.com')
    })

    it('should include port in origin if specified', () => {
      expect(getOrigin('https://example.com:8080')).toBe('https://example.com:8080')
      expect(getOrigin('http://localhost:3000')).toBe('http://localhost:3000')
    })

    it('should exclude path and query from origin', () => {
      expect(getOrigin('https://example.com/path')).toBe('https://example.com')
      expect(getOrigin('https://example.com/path?query=1')).toBe('https://example.com')
    })

    it('should return empty string for invalid URLs', () => {
      expect(getOrigin('not a url')).toBe('')
      expect(getOrigin('')).toBe('')
      expect(getOrigin(null)).toBe('')
    })
  })

  describe('isValidName', () => {
    it('should return true for valid names', () => {
      expect(isValidName('Google')).toBe(true)
      expect(isValidName('My Website')).toBe(true)
      expect(isValidName('A')).toBe(true)
    })

    it('should return true for names up to 50 characters', () => {
      const name50 = 'a'.repeat(50)
      expect(isValidName(name50)).toBe(true)
    })

    it('should return false for empty or whitespace-only names', () => {
      expect(isValidName('')).toBeFalsy()
      expect(isValidName('   ')).toBeFalsy()
    })

    it('should return false for names longer than 50 characters', () => {
      const name51 = 'a'.repeat(51)
      expect(isValidName(name51)).toBe(false)
    })

    it('should return false for non-string input', () => {
      expect(isValidName(null)).toBeFalsy()
      expect(isValidName(undefined)).toBeFalsy()
      expect(isValidName(123)).toBeFalsy()
      expect(isValidName({})).toBeFalsy()
    })

    it('should trim names before checking length', () => {
      expect(isValidName('  Google  ')).toBe(true)
    })
  })

  describe('isValidHexColor', () => {
    it('should return true for valid hex colors', () => {
      expect(isValidHexColor('#000000')).toBe(true)
      expect(isValidHexColor('#FFFFFF')).toBe(true)
      expect(isValidHexColor('#123456')).toBe(true)
      expect(isValidHexColor('#abcdef')).toBe(true)
      expect(isValidHexColor('#ABCDEF')).toBe(true)
    })

    it('should return false for invalid hex colors', () => {
      expect(isValidHexColor('000000')).toBe(false) // Missing #
      expect(isValidHexColor('#00000')).toBe(false) // Too short
      expect(isValidHexColor('#0000000')).toBe(false) // Too long
      expect(isValidHexColor('#GGGGGG')).toBe(false) // Invalid characters
      expect(isValidHexColor('')).toBe(false)
      expect(isValidHexColor(null)).toBe(false)
    })

    it('should return false for 3-character hex colors', () => {
      expect(isValidHexColor('#000')).toBe(false)
      expect(isValidHexColor('#FFF')).toBe(false)
    })
  })
})
