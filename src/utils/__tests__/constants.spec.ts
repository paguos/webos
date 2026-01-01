import { describe, it, expect } from 'vitest'
import {
  STORAGE_KEYS,
  GRID_SIZES,
  GRADIENT_PRESETS,
  DEFAULT_SETTINGS,
  TAG_COLORS,
  DEFAULT_ICON_URL,
  FAVICON_SERVICES
} from '../constants'

describe('constants', () => {
  describe('STORAGE_KEYS', () => {
    it('should have all required storage keys', () => {
      expect(STORAGE_KEYS.WEBSITES).toBe('websites')
      expect(STORAGE_KEYS.TAGS).toBe('tags')
      expect(STORAGE_KEYS.SETTINGS).toBe('settings')
      expect(STORAGE_KEYS.LAYOUT).toBe('layout')
    })
  })

  describe('GRID_SIZES', () => {
    it('should have small, medium, and large sizes', () => {
      expect(GRID_SIZES.small).toBeDefined()
      expect(GRID_SIZES.medium).toBeDefined()
      expect(GRID_SIZES.large).toBeDefined()
    })

    it('should have correct properties for each size', () => {
      const sizes = Object.values(GRID_SIZES)
      sizes.forEach(size => {
        expect(size).toHaveProperty('iconSize')
        expect(size).toHaveProperty('gap')
        expect(size).toHaveProperty('columns')
        expect(size).toHaveProperty('iconsPerPage')
      })
    })

    it('should have correct values for medium grid', () => {
      expect(GRID_SIZES.medium.iconSize).toBe(100)
      expect(GRID_SIZES.medium.gap).toBe(30)
      expect(GRID_SIZES.medium.columns).toBe(7)
      expect(GRID_SIZES.medium.iconsPerPage).toBe(35)
    })

    it('should have increasing icon sizes from small to large', () => {
      expect(GRID_SIZES.small.iconSize).toBeLessThan(GRID_SIZES.medium.iconSize)
      expect(GRID_SIZES.medium.iconSize).toBeLessThan(GRID_SIZES.large.iconSize)
    })
  })

  describe('GRADIENT_PRESETS', () => {
    it('should have at least 6 gradient presets', () => {
      expect(GRADIENT_PRESETS.length).toBeGreaterThanOrEqual(6)
    })

    it('should have correct structure for each preset', () => {
      GRADIENT_PRESETS.forEach(preset => {
        expect(preset).toHaveProperty('name')
        expect(preset).toHaveProperty('colors')
        expect(preset).toHaveProperty('angle')
        expect(preset.colors).toHaveLength(2)
        expect(typeof preset.name).toBe('string')
        expect(typeof preset.angle).toBe('number')
      })
    })

    it('should include Big Sur preset as first item', () => {
      expect(GRADIENT_PRESETS[0].name).toBe('Big Sur')
    })

    it('should have valid hex colors in presets', () => {
      GRADIENT_PRESETS.forEach(preset => {
        preset.colors.forEach(color => {
          expect(color).toMatch(/^#[0-9A-F]{6}$/i)
        })
      })
    })
  })

  describe('DEFAULT_SETTINGS', () => {
    it('should have all required settings', () => {
      expect(DEFAULT_SETTINGS).toHaveProperty('gridSize')
      expect(DEFAULT_SETTINGS).toHaveProperty('iconsPerPage')
      expect(DEFAULT_SETTINGS).toHaveProperty('background')
      expect(DEFAULT_SETTINGS).toHaveProperty('wallpaperUrl')
      expect(DEFAULT_SETTINGS).toHaveProperty('animations')
      expect(DEFAULT_SETTINGS).toHaveProperty('showLabels')
      expect(DEFAULT_SETTINGS).toHaveProperty('theme')
    })

    it('should have medium grid size as default', () => {
      expect(DEFAULT_SETTINGS.gridSize).toBe('medium')
    })

    it('should have correct icons per page for medium grid', () => {
      expect(DEFAULT_SETTINGS.iconsPerPage).toBe(35)
    })

    it('should have gradient as default background type', () => {
      expect(DEFAULT_SETTINGS.background.type).toBe('gradient')
    })

    it('should use Big Sur gradient as default', () => {
      expect(DEFAULT_SETTINGS.background.gradient.name).toBe('Big Sur')
    })

    it('should have animations enabled by default', () => {
      expect(DEFAULT_SETTINGS.animations).toBe(true)
    })

    it('should have showLabels enabled by default', () => {
      expect(DEFAULT_SETTINGS.showLabels).toBe(true)
    })

    it('should have auto theme as default', () => {
      expect(DEFAULT_SETTINGS.theme).toBe('auto')
    })
  })

  describe('TAG_COLORS', () => {
    it('should have at least 12 tag colors', () => {
      expect(TAG_COLORS.length).toBeGreaterThanOrEqual(12)
    })

    it('should have valid hex colors', () => {
      TAG_COLORS.forEach(color => {
        expect(color).toMatch(/^#[0-9A-F]{6}$/i)
      })
    })
  })

  describe('DEFAULT_ICON_URL', () => {
    it('should point to default icon SVG', () => {
      expect(DEFAULT_ICON_URL).toBe('/default-icon.svg')
    })
  })

  describe('FAVICON_SERVICES', () => {
    it('should have google, duckduckgo, and direct services', () => {
      expect(FAVICON_SERVICES).toHaveProperty('google')
      expect(FAVICON_SERVICES).toHaveProperty('duckduckgo')
      expect(FAVICON_SERVICES).toHaveProperty('direct')
    })

    it('should generate correct Google favicon URL', () => {
      const url = FAVICON_SERVICES.google('example.com')
      expect(url).toBe('https://www.google.com/s2/favicons?domain=example.com&sz=128')
    })

    it('should generate correct DuckDuckGo favicon URL', () => {
      const url = FAVICON_SERVICES.duckduckgo('example.com')
      expect(url).toBe('https://icons.duckduckgo.com/ip3/example.com.ico')
    })

    it('should generate correct direct favicon URL', () => {
      const url = FAVICON_SERVICES.direct('https://example.com')
      expect(url).toBe('https://example.com/favicon.ico')
    })
  })
})
