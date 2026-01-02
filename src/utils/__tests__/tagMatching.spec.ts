import { describe, it, expect } from 'vitest'
import {
  findMatchingTag,
  parseTagQuery,
  isTagQuery,
  filterTags
} from '../tagMatching'
import type { Tag } from '../../types'

describe('tagMatching', () => {
  const sampleTags: Tag[] = [
    { id: '1', name: 'work', color: '#FF0000', metadata: { createdAt: '2024-01-01', updatedAt: '2024-01-01' } },
    { id: '2', name: 'personal', color: '#00FF00', metadata: { createdAt: '2024-01-01', updatedAt: '2024-01-01' } },
    { id: '3', name: 'dev', color: '#0000FF', metadata: { createdAt: '2024-01-01', updatedAt: '2024-01-01' } },
    { id: '4', name: 'development', color: '#FFFF00', metadata: { createdAt: '2024-01-01', updatedAt: '2024-01-01' } }
  ]

  describe('findMatchingTag', () => {
    it('should find exact tag match', () => {
      const result = findMatchingTag('work', sampleTags)

      expect(result.tag).toEqual(sampleTags[0])
      expect(result.additionalText).toBe('')
    })

    it('should find tag with additional text', () => {
      const result = findMatchingTag('work github', sampleTags)

      expect(result.tag).toEqual(sampleTags[0])
      expect(result.additionalText).toBe('github')
    })

    it('should find longest matching tag', () => {
      const result = findMatchingTag('development tools', sampleTags)

      expect(result.tag).toEqual(sampleTags[3]) // 'development', not 'dev'
      expect(result.additionalText).toBe('tools')
    })

    it('should return null for no match', () => {
      const result = findMatchingTag('nonexistent', sampleTags)

      expect(result.tag).toBeNull()
      expect(result.additionalText).toBe('')
    })

    it('should return null for empty query', () => {
      const result = findMatchingTag('', sampleTags)

      expect(result.tag).toBeNull()
      expect(result.additionalText).toBe('')
    })

    it('should handle case insensitive matching', () => {
      const result = findMatchingTag('WORK github', sampleTags)

      expect(result.tag).toEqual(sampleTags[0])
      expect(result.additionalText).toBe('github')
    })

    it('should handle tag without space before additional text', () => {
      const result = findMatchingTag('workgithub', sampleTags)

      expect(result.tag).toEqual(sampleTags[0])
      expect(result.additionalText).toBe('github')
    })

    it('should trim whitespace from additional text', () => {
      const result = findMatchingTag('work   github  ', sampleTags)

      expect(result.tag).toEqual(sampleTags[0])
      expect(result.additionalText).toBe('github')
    })

    it('should prefer longer tag names', () => {
      const result = findMatchingTag('dev', sampleTags)

      expect(result.tag).toEqual(sampleTags[2]) // 'dev', not 'development'
      expect(result.additionalText).toBe('')
    })

    it('should handle empty tags array', () => {
      const result = findMatchingTag('work', [])

      expect(result.tag).toBeNull()
      expect(result.additionalText).toBe('')
    })
  })

  describe('parseTagQuery', () => {
    it('should extract text after "tag:" prefix', () => {
      const result = parseTagQuery('tag:work github')

      expect(result).toBe('work github')
    })

    it('should handle case insensitive prefix', () => {
      const result = parseTagQuery('TAG:work')

      expect(result).toBe('work')
    })

    it('should return empty string for non-tag query', () => {
      const result = parseTagQuery('regular search')

      expect(result).toBe('')
    })

    it('should handle empty string', () => {
      const result = parseTagQuery('')

      expect(result).toBe('')
    })

    it('should handle only "tag:" prefix', () => {
      const result = parseTagQuery('tag:')

      expect(result).toBe('')
    })

    it('should trim whitespace', () => {
      const result = parseTagQuery('  tag:  work  ')

      expect(result).toBe('work')
    })
  })

  describe('isTagQuery', () => {
    it('should return true for tag query', () => {
      expect(isTagQuery('tag:work')).toBe(true)
    })

    it('should return true for tag query with additional text', () => {
      expect(isTagQuery('tag:work github')).toBe(true)
    })

    it('should return true for case insensitive prefix', () => {
      expect(isTagQuery('TAG:work')).toBe(true)
      expect(isTagQuery('TaG:work')).toBe(true)
    })

    it('should return false for non-tag query', () => {
      expect(isTagQuery('regular search')).toBe(false)
    })

    it('should return false for empty string', () => {
      expect(isTagQuery('')).toBe(false)
    })

    it('should return true for just "tag:"', () => {
      expect(isTagQuery('tag:')).toBe(true)
    })

    it('should handle whitespace', () => {
      expect(isTagQuery('  tag:work  ')).toBe(true)
    })
  })

  describe('filterTags', () => {
    it('should filter tags by name', () => {
      const result = filterTags(sampleTags, 'dev')

      expect(result).toHaveLength(2)
      expect(result).toContainEqual(sampleTags[2]) // 'dev'
      expect(result).toContainEqual(sampleTags[3]) // 'development'
    })

    it('should return all tags for empty search', () => {
      const result = filterTags(sampleTags, '')

      expect(result).toEqual(sampleTags)
    })

    it('should be case insensitive', () => {
      const result = filterTags(sampleTags, 'WORK')

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual(sampleTags[0])
    })

    it('should return empty array for no matches', () => {
      const result = filterTags(sampleTags, 'nonexistent')

      expect(result).toEqual([])
    })

    it('should handle partial matches', () => {
      const result = filterTags(sampleTags, 'pers')

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual(sampleTags[1]) // 'personal'
    })

    it('should handle empty tags array', () => {
      const result = filterTags([], 'work')

      expect(result).toEqual([])
    })

    it('should filter multiple matches', () => {
      const result = filterTags(sampleTags, 'dev')

      expect(result).toHaveLength(2)
    })
  })
})
