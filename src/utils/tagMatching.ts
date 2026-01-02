import type { Tag } from '../types'

/**
 * Result of parsing a tag query
 */
export interface TagQueryResult {
  /** The matched tag object, or null if no match */
  tag: Tag | null
  /** Additional search text after the tag name */
  additionalText: string
}

/**
 * Finds the longest matching tag at the start of a query string
 * Handles both "work github" and "workgithub" patterns
 *
 * @param query - The search query after "tag:" prefix
 * @param tags - Array of available tags
 * @returns The matched tag and any additional search text
 *
 * @example
 * const result = findMatchingTag('work github', tags)
 * // Returns: { tag: { name: 'work', ... }, additionalText: 'github' }
 */
export function findMatchingTag(query: string, tags: Tag[]): TagQueryResult {
  const queryLower = query.toLowerCase().trim()

  if (!queryLower) {
    return { tag: null, additionalText: '' }
  }

  // Find the longest matching tag at the start of the text
  let matchedTag: Tag | null = null
  let maxLength = 0

  for (const tag of tags) {
    const tagNameLower = tag.name.toLowerCase()

    // Check if the query starts with this tag name
    if (queryLower.startsWith(tagNameLower)) {
      // Keep the longest match
      if (tagNameLower.length > maxLength) {
        matchedTag = tag
        maxLength = tagNameLower.length
      }
    }
  }

  if (!matchedTag) {
    return { tag: null, additionalText: '' }
  }

  // Extract additional search text after the matched tag name
  const additionalText = query.slice(maxLength).trim()

  return {
    tag: matchedTag,
    additionalText
  }
}

/**
 * Parses a tag query string (without "tag:" prefix)
 * Returns the tag filter text for filtering tag suggestions
 *
 * @param query - The full search query
 * @returns The text after "tag:" or empty string
 *
 * @example
 * parseTagQuery('tag:work github')
 * // Returns: 'work github'
 */
export function parseTagQuery(query: string): string {
  const trimmed = query.trim()
  if (!trimmed.toLowerCase().startsWith('tag:')) {
    return ''
  }
  return trimmed.slice(4).trim()
}

/**
 * Checks if a query is a tag query (starts with "tag:")
 *
 * @param query - The search query to check
 * @returns True if query starts with "tag:"
 */
export function isTagQuery(query: string): boolean {
  return query.toLowerCase().trim().startsWith('tag:')
}

/**
 * Filters tags based on a search text
 *
 * @param tags - Array of tags to filter
 * @param searchText - Text to search for in tag names
 * @returns Filtered array of tags
 */
export function filterTags(tags: Tag[], searchText: string): Tag[] {
  if (!searchText) {
    return tags
  }

  const searchLower = searchText.toLowerCase()
  return tags.filter(tag =>
    tag.name.toLowerCase().includes(searchLower)
  )
}
