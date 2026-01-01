import type { Website, Tag, Settings, TagWithCount, ConfirmDialogConfig } from '../types'

/**
 * Websites store state
 */
export interface WebsitesStoreState {
  websites: Website[]
  tags: Tag[]
  settings: Settings
  currentPage: number
}

/**
 * UI store state
 */
export interface UIStoreState {
  searchQuery: string
  isEditMode: boolean
  showWebsiteForm: boolean
  showSettingsModal: boolean
  showFolderModal: boolean
  showTagManager: boolean
  showConfirmDialog: boolean
  editingWebsite: Website | null
  editingTag: Tag | null
  activeFolderId: string | null
  confirmDialogConfig: ConfirmDialogConfig
}

/**
 * Websites grouped by page
 */
export type WebsitesByPage = Record<number, Website[]>
