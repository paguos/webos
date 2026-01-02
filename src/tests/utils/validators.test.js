import { describe, it, expect } from 'vitest'
import {
  isValidUrl,
  normalizeUrl,
  getDomain,
  getOrigin,
  isValidName,
  isValidHexColor
} from '../../utils/validators'

describe('validators.js', () => {
  describe('isValidUrl', () => {
    it('should return true for valid http URLs', () => {
      expect(isValidUrl('http://example.com')).toBe(true)
      expect(isValidUrl('http://www.example.com')).toBe(true)
      expect(isValidUrl('http://example.com/path')).toBe(true)
    })

    it('should return true for valid https URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true)
      expect(isValidUrl('https://www.example.com')).toBe(true)
      expect(isValidUrl('https://example.com/path?query=1')).toBe(true)
    })

    it('should return false for URLs without protocol', () => {
      expect(isValidUrl('example.com')).toBe(false)
      expect(isValidUrl('www.example.com')).toBe(false)
    })

    it('should return false for invalid URLs', () => {
      expect(isValidUrl('')).toBe(false)
      expect(isValidUrl('not a url')).toBe(false)
      expect(isValidUrl('ftp://example.com')).toBe(false)
    })

    it('should reject javascript: URLs for security', () => {
      expect(isValidUrl('javascript:alert(1)')).toBe(false)
    })

    it('should reject data: URLs for security', () => {
      expect(isValidUrl('data:text/html,<script>alert(1)</script>')).toBe(false)
    })

    it('should handle null and undefined', () => {
      expect(isValidUrl(null)).toBe(false)
      expect(isValidUrl(undefined)).toBe(false)
    })
  })

  describe('normalizeUrl', () => {
    it('should add https:// to URLs without protocol', () => {
      expect(normalizeUrl('example.com')).toBe('https://example.com')
      expect(normalizeUrl('www.example.com')).toBe('https://www.example.com')
    })

    it('should not modify URLs that already have protocol', () => {
      expect(normalizeUrl('http://example.com')).toBe('http://example.com')
      expect(normalizeUrl('https://example.com')).toBe('https://example.com')
    })

    it('should handle URLs with paths and query strings', () => {
      expect(normalizeUrl('example.com/path?query=1')).toBe('https://example.com/path?query=1')
    })

    it('should trim whitespace', () => {
      expect(normalizeUrl('  example.com  ')).toBe('https://example.com')
    })

    it('should handle empty strings', () => {
      expect(normalizeUrl('')).toBe('https://')
    })
  })

  describe('getDomain', () => {
    it('should extract domain from URLs', () => {
      expect(getDomain('https://example.com')).toBe('example.com')
      expect(getDomain('https://www.example.com')).toBe('www.example.com')
      expect(getDomain('http://subdomain.example.com/path')).toBe('subdomain.example.com')
    })

    it('should handle URLs with ports', () => {
      expect(getDomain('https://example.com:3000')).toBe('example.com:3000')
    })

    it('should return empty string for invalid URLs', () => {
      expect(getDomain('not a url')).toBe('')
      expect(getDomain('')).toBe('')
    })

    it('should handle null and undefined', () => {
      expect(getDomain(null)).toBe('')
      expect(getDomain(undefined)).toBe('')
    })
  })

  describe('getOrigin', () => {
    it('should extract origin from URLs', () => {
      expect(getOrigin('https://example.com')).toBe('https://example.com')
      expect(getOrigin('https://example.com/path')).toBe('https://example.com')
      expect(getOrigin('http://example.com:3000/path')).toBe('http://example.com:3000')
    })

    it('should preserve protocol', () => {
      expect(getOrigin('http://example.com')).toBe('http://example.com')
      expect(getOrigin('https://example.com')).toBe('https://example.com')
    })

    it('should return empty string for invalid URLs', () => {
      expect(getOrigin('not a url')).toBe('')
      expect(getOrigin('')).toBe('')
    })

    it('should handle null and undefined', () => {
      expect(getOrigin(null)).toBe('')
      expect(getOrigin(undefined)).toBe('')
    })
  })

  describe('isValidName', () => {
    it('should return true for valid names (1-50 characters)', () => {
      expect(isValidName('A')).toBe(true)
      expect(isValidName('Valid Name')).toBe(true)
      expect(isValidName('a'.repeat(50))).toBe(true)
    })

    it('should return false for empty names', () => {
      expect(isValidName('')).toBe(false)
      expect(isValidName('   ')).toBe(false)
    })

    it('should return false for names over 50 characters', () => {
      expect(isValidName('a'.repeat(51))).toBe(false)
    })

    it('should trim whitespace before validation', () => {
      expect(isValidName('  Valid  ')).toBe(true)
    })

    it('should handle null and undefined', () => {
      expect(isValidName(null)).toBe(false)
      expect(isValidName(undefined)).toBe(false)
    })
  })

  describe('isValidHexColor', () => {
    it('should return true for valid 3-digit hex colors', () => {
      expect(isValidHexColor('#fff')).toBe(true)
      expect(isValidHexColor('#000')).toBe(true)
      expect(isValidHexColor('#abc')).toBe(true)
    })

    it('should return true for valid 6-digit hex colors', () => {
      expect(isValidHexColor('#ffffff')).toBe(true)
      expect(isValidHexColor('#000000')).toBe(true)
      expect(isValidHexColor('#abcdef')).toBe(true)
    })

    it('should handle uppercase hex colors', () => {
      expect(isValidHexColor('#FFF')).toBe(true)
      expect(isValidHexColor('#FFFFFF')).toBe(true)
      expect(isValidHexColor('#ABCDEF')).toBe(true)
    })

    it('should return false for invalid hex colors', () => {
      expect(isValidHexColor('fff')).toBe(false) // Missing #
      expect(isValidHexColor('#ff')).toBe(false) // Too short
      expect(isValidHexColor('#ffff')).toBe(false) // Invalid length
      expect(isValidHexColor('#gggggg')).toBe(false) // Invalid characters
    })

    it('should return false for empty strings', () => {
      expect(isValidHexColor('')).toBe(false)
    })

    it('should handle null and undefined', () => {
      expect(isValidHexColor(null)).toBe(false)
      expect(isValidHexColor(undefined)).toBe(false)
    })
  })
})
