/**
 * Validate if a string is a valid URL
 * @param url - The URL to validate
 * @returns True if valid, false otherwise
 */
export function isValidUrl(url: unknown): boolean {
  if (!url || typeof url !== 'string') return false

  try {
    const urlObj = new URL(url)
    // Must be http or https protocol
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch (e) {
    return false
  }
}

/**
 * Normalize a URL by adding protocol if missing
 * @param url - The URL to normalize
 * @returns Normalized URL
 */
export function normalizeUrl(url: string | null | undefined): string {
  if (!url) return ''

  let normalized = url.trim()

  // Add https:// if no protocol specified
  if (!normalized.match(/^https?:\/\//i)) {
    normalized = 'https://' + normalized
  }

  try {
    const urlObj = new URL(normalized)
    return urlObj.href
  } catch (e) {
    return normalized
  }
}

/**
 * Extract domain from URL
 * @param url - The URL to extract domain from
 * @returns Domain name or empty string
 */
export function getDomain(url: string | null | undefined): string {
  try {
    if (!url) return ''
    const urlObj = new URL(url)
    return urlObj.hostname
  } catch (e) {
    return ''
  }
}

/**
 * Extract origin from URL
 * @param url - The URL to extract origin from
 * @returns Origin (protocol + hostname + port) or empty string
 */
export function getOrigin(url: string | null | undefined): string {
  try {
    if (!url) return ''
    const urlObj = new URL(url)
    return urlObj.origin
  } catch (e) {
    return ''
  }
}

/**
 * Validate website name
 * @param name - The name to validate
 * @returns True if valid, false otherwise
 */
export function isValidName(name: unknown): boolean {
  if (!name || typeof name !== 'string') return false
  const trimmed = name.trim()
  return trimmed.length > 0 && trimmed.length <= 50
}

/**
 * Validate hex color
 * @param color - The color to validate
 * @returns True if valid hex color, false otherwise
 */
export function isValidHexColor(color: unknown): boolean {
  if (typeof color !== 'string') return false
  return /^#[0-9A-F]{6}$/i.test(color)
}

export default {
  isValidUrl,
  normalizeUrl,
  getDomain,
  getOrigin,
  isValidName,
  isValidHexColor
}
