// App constants

export const STORAGE_KEYS = {
  WEBSITES: 'websites',
  CATEGORIES: 'categories',
  SETTINGS: 'settings',
  LAYOUT: 'layout'
}

export const GRID_SIZES = {
  small: {
    iconSize: 80,
    gap: 20,
    columns: 9,
    iconsPerPage: 45
  },
  medium: {
    iconSize: 100,
    gap: 30,
    columns: 7,
    iconsPerPage: 35
  },
  large: {
    iconSize: 120,
    gap: 40,
    columns: 5,
    iconsPerPage: 25
  }
}

export const GRADIENT_PRESETS = [
  {
    name: 'Big Sur',
    colors: ['#667eea', '#764ba2'],
    angle: 135
  },
  {
    name: 'Catalina',
    colors: ['#ee9ca7', '#ffdde1'],
    angle: 135
  },
  {
    name: 'Monterey',
    colors: ['#0093E9', '#80D0C7'],
    angle: 135
  },
  {
    name: 'Ventura',
    colors: ['#FF6B6B', '#FFE66D'],
    angle: 135
  },
  {
    name: 'Ocean',
    colors: ['#2E3192', '#1BFFFF'],
    angle: 135
  },
  {
    name: 'Sunset',
    colors: ['#FF512F', '#F09819'],
    angle: 135
  }
]

export const DEFAULT_SETTINGS = {
  gridSize: 'medium',
  iconsPerPage: 35,
  background: {
    type: 'gradient',
    gradient: GRADIENT_PRESETS[0]
  },
  wallpaperUrl: '',
  animations: true,
  showLabels: true,
  theme: 'auto'
}

export const CATEGORY_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
  '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
  '#F8B739', '#52B788', '#E76F51', '#2A9D8F'
]

export const DEFAULT_ICON_URL = '/default-icon.svg'

export const FAVICON_SERVICES = {
  google: (domain) => `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
  duckduckgo: (domain) => `https://icons.duckduckgo.com/ip3/${domain}.ico`,
  direct: (origin) => `${origin}/favicon.ico`
}
