import { isValidUrl, isValidName, normalizeUrl } from '../utils/validators'
import type { FormErrors, LinkFormData, LinkErrors } from '../components/crud/website-form/types'
import type { ExtraLink } from '../types'

/**
 * Composable for website form validation logic
 */
export function useWebsiteFormValidation() {
  /**
   * Validate basic website info (name and URL)
   */
  function validateBasicInfo(name: string, url: string): { isValid: boolean; errors: FormErrors } {
    const errors: FormErrors = {
      name: '',
      url: ''
    }

    let isValid = true

    if (!isValidName(name)) {
      errors.name = 'Name is required (max 50 characters)'
      isValid = false
    }

    if (!isValidUrl(normalizeUrl(url))) {
      errors.url = 'Please enter a valid URL'
      isValid = false
    }

    return { isValid, errors }
  }

  /**
   * Validate extra link data
   */
  function validateExtraLink(
    linkData: LinkFormData,
    existingLinks: ExtraLink[],
    editingIndex: number | null
  ): { isValid: boolean; errors: LinkErrors } {
    const errors: LinkErrors = {
      name: '',
      url: ''
    }

    let isValid = true

    // Validate name
    if (!linkData.name.trim() || linkData.name.trim().length > 30) {
      errors.name = 'Name is required (max 30 characters)'
      isValid = false
    }

    // Validate URL
    if (!isValidUrl(normalizeUrl(linkData.url))) {
      errors.url = 'Please enter a valid URL'
      isValid = false
    }

    // Check for duplicate names (case-insensitive)
    const duplicateIndex = existingLinks.findIndex(
      (link, idx) =>
        link.name.toLowerCase() === linkData.name.trim().toLowerCase() &&
        idx !== editingIndex
    )
    if (duplicateIndex !== -1) {
      errors.name = 'A link with this name already exists'
      isValid = false
    }

    // Check maximum limit (only when adding new link)
    if (editingIndex === null && existingLinks.length >= 10) {
      errors.name = 'Maximum 10 extra links allowed'
      isValid = false
    }

    return { isValid, errors }
  }

  return {
    validateBasicInfo,
    validateExtraLink
  }
}
