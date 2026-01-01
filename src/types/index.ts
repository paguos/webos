// Core type definitions for webOS

/**
 * Website metadata information
 */
export interface WebsiteMetadata {
  createdAt: string
  updatedAt: string
  visitCount: number
  lastVisited: string | null
}

/**
 * Position of a website in the grid
 */
export interface Position {
  page: number
  order: number
}

/**
 * Extra link attached to a website
 */
export interface ExtraLink {
  id: string
  name: string
  url: string
}

/**
 * Website/bookmark entry
 */
export interface Website {
  id: string
  name: string
  url: string
  favicon: string
  tagIds: string[]
  customIcon: string | null
  iconZoom: number
  iconBackgroundColor: string
  extraLinks: ExtraLink[]
  position: Position
  metadata: WebsiteMetadata
}

/**
 * Tag metadata information
 */
export interface TagMetadata {
  createdAt: string
  updatedAt: string
}

/**
 * Tag for categorizing websites
 */
export interface Tag {
  id: string
  name: string
  color: string
  metadata: TagMetadata
}

/**
 * Tag with usage count
 */
export interface TagWithCount extends Tag {
  count: number
}

/**
 * Gradient preset configuration
 */
export interface GradientPreset {
  name: string
  colors: [string, string]
  angle: number
}

/**
 * Background settings
 */
export interface BackgroundSettings {
  type: 'gradient' | 'wallpaper'
  gradient: GradientPreset
}

/**
 * Grid size option
 */
export type GridSizeOption = 'small' | 'medium' | 'large'

/**
 * Theme option
 */
export type ThemeOption = 'auto' | 'light' | 'dark'

/**
 * Grid size configuration
 */
export interface GridSizeConfig {
  iconSize: number
  gap: number
  columns: number
  iconsPerPage: number
}

/**
 * Application settings
 */
export interface Settings {
  gridSize: GridSizeOption
  iconsPerPage: number
  background: BackgroundSettings
  wallpaperUrl: string
  animations: boolean
  showLabels: boolean
  theme: ThemeOption
}

/**
 * Storage data wrapper with versioning
 */
export interface StorageData<T = any> {
  version: string
  data: T
  timestamp: string
}

/**
 * Storage keys
 */
export interface StorageKeys {
  WEBSITES: string
  TAGS: string
  SETTINGS: string
  LAYOUT: string
}

/**
 * Confirm dialog configuration
 */
export interface ConfirmDialogConfig {
  title: string
  message: string
  confirmText: string
  cancelText: string
  onConfirm: (() => void) | null
}

/**
 * Export data format
 */
export interface ExportData {
  version: string
  timestamp: string
  websites: Website[]
  tags: Tag[]
  settings: Settings
}

/**
 * Favicon service function type
 */
export type FaviconServiceFunction = (domain: string) => string

/**
 * Favicon services configuration
 */
export interface FaviconServices {
  google: FaviconServiceFunction
  duckduckgo: FaviconServiceFunction
  direct: (origin: string) => string
}

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean
  error?: string
}
