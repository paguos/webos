import { FAVICON_SERVICES, DEFAULT_ICON_URL } from './constants'
import { getDomain, getOrigin } from './validators'

/**
 * Fetch favicon for a given URL with fallback chain
 * @param {string} url - The website URL
 * @returns {Promise<string>} URL to the favicon
 */
export async function fetchFavicon(url) {
  if (!url) return DEFAULT_ICON_URL

  const domain = getDomain(url)
  const origin = getOrigin(url)

  if (!domain) return DEFAULT_ICON_URL

  // Try services in order
  const sources = [
    FAVICON_SERVICES.google(domain),
    FAVICON_SERVICES.duckduckgo(domain),
    FAVICON_SERVICES.direct(origin)
  ]

  for (const source of sources) {
    try {
      const response = await fetch(source, {
        method: 'HEAD',
        mode: 'no-cors' // Avoid CORS issues
      })

      // With no-cors mode, we can't check response.ok, so just return the source
      // The browser will handle displaying it or showing broken image
      return source
    } catch (e) {
      // Continue to next source
      continue
    }
  }

  // All failed, return default
  return DEFAULT_ICON_URL
}

/**
 * Get favicon URL (synchronous version, just constructs the URL)
 * @param {string} url - The website URL
 * @returns {string} URL to the favicon
 */
export function getFaviconUrl(url) {
  if (!url) return DEFAULT_ICON_URL

  const domain = getDomain(url)
  if (!domain) return DEFAULT_ICON_URL

  // Use Google's service as default - it's most reliable
  return FAVICON_SERVICES.google(domain)
}

/**
 * Preload favicon image
 * @param {string} faviconUrl - The favicon URL to preload
 * @returns {Promise<string>} Resolves with URL if loaded, rejects if failed
 */
export function preloadFavicon(faviconUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => resolve(faviconUrl)
    img.onerror = () => reject(new Error('Failed to load favicon'))

    img.src = faviconUrl
  })
}

export default {
  fetchFavicon,
  getFaviconUrl,
  preloadFavicon
}
