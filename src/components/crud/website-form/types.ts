import type { ExtraLink } from '../../../types'

export interface WebsiteFormData {
  name: string
  url: string
  tagIds: string[]
  customIcon: string
  iconZoom: number
  iconOffsetX: number
  iconOffsetY: number
  iconBackgroundColor: string
  extraLinks: ExtraLink[]
}

export interface FormErrors {
  name: string
  url: string
}

export interface LinkFormData {
  name: string
  url: string
}

export interface LinkErrors {
  name: string
  url: string
}
