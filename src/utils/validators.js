/**
 * Validate if a string is a valid URL
 * @param {string} url - The URL to validate
 * @returns {boolean} True if valid, false otherwise
 */
export function isValidUrl(url) {
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
 * @param {string} url - The URL to normalize
 * @returns {string} Normalized URL
 */
export function normalizeUrl(url) {
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
 * @param {string} url - The URL to extract domain from
 * @returns {string} Domain name or empty string
 */
export function getDomain(url) {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname
  } catch (e) {
    return ''
  }
}

/**
 * Extract origin from URL
 * @param {string} url - The URL to extract origin from
 * @returns {string} Origin (protocol + hostname + port) or empty string
 */
export function getOrigin(url) {
  try {
    const urlObj = new URL(url)
    return urlObj.origin
  } catch (e) {
    return ''
  }
}

/**
 * Validate website name
 * @param {string} name - The name to validate
 * @returns {boolean} True if valid, false otherwise
 */
export function isValidName(name) {
  return name && typeof name === 'string' && name.trim().length > 0 && name.trim().length <= 50
}

/**
 * Validate hex color
 * @param {string} color - The color to validate
 * @returns {boolean} True if valid hex color, false otherwise
 */
export function isValidHexColor(color) {
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
