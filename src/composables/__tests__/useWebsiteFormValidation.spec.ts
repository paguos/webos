import { describe, it, expect } from 'vitest'
import { useWebsiteFormValidation } from '../useWebsiteFormValidation'
import type { ExtraLink } from '../../types'

describe('useWebsiteFormValidation', () => {
  const { validateBasicInfo, validateExtraLink } = useWebsiteFormValidation()

  describe('validateBasicInfo', () => {
    it('should validate correct name and URL', () => {
      const result = validateBasicInfo('GitHub', 'https://github.com')

      expect(result.isValid).toBe(true)
      expect(result.errors.name).toBe('')
      expect(result.errors.url).toBe('')
    })

    it('should fail validation for empty name', () => {
      const result = validateBasicInfo('', 'https://github.com')

      expect(result.isValid).toBe(false)
      expect(result.errors.name).toBe('Name is required (max 50 characters)')
      expect(result.errors.url).toBe('')
    })

    it('should fail validation for invalid URL', () => {
      const result = validateBasicInfo('GitHub', 'not a url')

      expect(result.isValid).toBe(false)
      expect(result.errors.name).toBe('')
      expect(result.errors.url).toBe('Please enter a valid URL')
    })

    it('should fail validation for both empty name and invalid URL', () => {
      const result = validateBasicInfo('', 'not a url')

      expect(result.isValid).toBe(false)
      expect(result.errors.name).toBe('Name is required (max 50 characters)')
      expect(result.errors.url).toBe('Please enter a valid URL')
    })

    it('should normalize URL without protocol', () => {
      const result = validateBasicInfo('GitHub', 'github.com')

      expect(result.isValid).toBe(true)
      expect(result.errors.url).toBe('')
    })
  })

  describe('validateExtraLink', () => {
    const existingLinks: ExtraLink[] = [
      { id: '1', name: 'Documentation', url: 'https://docs.example.com' },
      { id: '2', name: 'Issues', url: 'https://issues.example.com' }
    ]

    it('should validate correct link data', () => {
      const linkData = { name: 'API Reference', url: 'https://api.example.com' }
      const result = validateExtraLink(linkData, existingLinks, null)

      expect(result.isValid).toBe(true)
      expect(result.errors.name).toBe('')
      expect(result.errors.url).toBe('')
    })

    it('should fail validation for empty name', () => {
      const linkData = { name: '', url: 'https://api.example.com' }
      const result = validateExtraLink(linkData, existingLinks, null)

      expect(result.isValid).toBe(false)
      expect(result.errors.name).toBe('Name is required (max 30 characters)')
    })

    it('should fail validation for name exceeding max length', () => {
      const linkData = { name: 'a'.repeat(31), url: 'https://api.example.com' }
      const result = validateExtraLink(linkData, existingLinks, null)

      expect(result.isValid).toBe(false)
      expect(result.errors.name).toBe('Name is required (max 30 characters)')
    })

    it('should fail validation for invalid URL', () => {
      const linkData = { name: 'API', url: 'not a url' }
      const result = validateExtraLink(linkData, existingLinks, null)

      expect(result.isValid).toBe(false)
      expect(result.errors.url).toBe('Please enter a valid URL')
    })

    it('should fail validation for duplicate name (case-insensitive)', () => {
      const linkData = { name: 'documentation', url: 'https://new.example.com' }
      const result = validateExtraLink(linkData, existingLinks, null)

      expect(result.isValid).toBe(false)
      expect(result.errors.name).toBe('A link with this name already exists')
    })

    it('should allow duplicate name when editing the same link', () => {
      const linkData = { name: 'Documentation', url: 'https://new-docs.example.com' }
      const result = validateExtraLink(linkData, existingLinks, 0) // editing index 0

      expect(result.isValid).toBe(true)
      expect(result.errors.name).toBe('')
    })

    it('should fail validation when adding link exceeds maximum limit', () => {
      const manyLinks: ExtraLink[] = Array.from({ length: 10 }, (_, i) => ({
        id: `${i}`,
        name: `Link ${i}`,
        url: `https://link${i}.example.com`
      }))

      const linkData = { name: 'New Link', url: 'https://new.example.com' }
      const result = validateExtraLink(linkData, manyLinks, null)

      expect(result.isValid).toBe(false)
      expect(result.errors.name).toBe('Maximum 10 extra links allowed')
    })

    it('should allow editing when at maximum limit', () => {
      const manyLinks: ExtraLink[] = Array.from({ length: 10 }, (_, i) => ({
        id: `${i}`,
        name: `Link ${i}`,
        url: `https://link${i}.example.com`
      }))

      const linkData = { name: 'Updated Link', url: 'https://updated.example.com' }
      const result = validateExtraLink(linkData, manyLinks, 5) // editing existing link

      expect(result.isValid).toBe(true)
    })

    it('should trim whitespace from name', () => {
      const linkData = { name: '  API Reference  ', url: 'https://api.example.com' }
      const result = validateExtraLink(linkData, existingLinks, null)

      expect(result.isValid).toBe(true)
    })
  })
})
