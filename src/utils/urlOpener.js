/**
 * Opens a URL in the appropriate way based on the runtime environment
 * @param {string} url - The URL to open
 * @param {boolean} inNewTab - Whether to open in a new tab (extension only, defaults to false)
 */
export function openUrl(url, inNewTab = false) {
  // Electron: Open in system default browser
  if (window.electronAPI?.shell?.openExternal) {
    window.electronAPI.shell.openExternal(url)
    return
  }

  // Chrome Extension: Replace current tab by default (new tab page UX)
  if (typeof chrome !== 'undefined' && chrome.tabs) {
    if (inNewTab) {
      chrome.tabs.create({ url })
    } else {
      // Replace current tab (new tab page)
      chrome.tabs.update({ url })
    }
    return
  }

  // Web: Standard window.open
  window.open(url, '_blank')
}

/**
 * Check if running in Chrome Extension context
 */
export function isChromeExtension() {
  return typeof chrome !== 'undefined' &&
         chrome.tabs &&
         chrome.storage
}

/**
 * Check if running in Electron
 */
export function isElectron() {
  return window.electronAPI?.isElectron
}

/**
 * Get current runtime environment
 */
export function getRuntimeEnvironment() {
  if (isElectron()) return 'electron'
  if (isChromeExtension()) return 'extension'
  return 'web'
}
