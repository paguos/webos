import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useWebsitesStore } from '../websitesStore.ts'
import type { Website, Tag } from '../../types'

// Mock storage
vi.mock('../../utils/storage.ts', () => ({
  default: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue(true),
    clear: vi.fn()
  }
}))

describe('websitesStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with empty data when storage is empty', async () => {
      const store = useWebsitesStore()
      await store.initializeData()

      // Should load sample data
      expect(store.websites.length).toBeGreaterThan(0)
      expect(store.tags.length).toBeGreaterThan(0)
    })

    it('should have default settings', () => {
      const store = useWebsitesStore()
      expect(store.settings).toHaveProperty('gridSize')
      expect(store.settings).toHaveProperty('animations')
      expect(store.settings.gridSize).toBe('medium')
    })
  })

  describe('addWebsite', () => {
    it('should add a website with correct structure', () => {
      const store = useWebsitesStore()
      const website = store.addWebsite('Test Site', 'https://test.com')

      expect(website).toHaveProperty('id')
      expect(website.name).toBe('Test Site')
      expect(website.url).toBe('https://test.com/')
      expect(website.position).toEqual({ page: 0, order: 0 })
      expect(website.metadata).toHaveProperty('createdAt')
      expect(website.metadata.visitCount).toBe(0)
    })

    it('should normalize URLs when adding', () => {
      const store = useWebsitesStore()
      const website = store.addWebsite('Test', 'test.com')

      expect(website.url).toBe('https://test.com/')
    })

    it('should add website to specified page and order', () => {
      const store = useWebsitesStore()
      const website = store.addWebsite('Test', 'https://test.com', [], 2, 5)

      expect(website.position.page).toBe(2)
      expect(website.position.order).toBe(5)
    })

    it('should trim whitespace from name', () => {
      const store = useWebsitesStore()
      const website = store.addWebsite('  Test Site  ', 'https://test.com')

      expect(website.name).toBe('Test Site')
    })

    it('should initialize with default values', () => {
      const store = useWebsitesStore()
      const website = store.addWebsite('Test', 'https://test.com')

      expect(website.tagIds).toEqual([])
      expect(website.customIcon).toBeNull()
      expect(website.iconZoom).toBe(1)
      expect(website.iconBackgroundColor).toBe('transparent')
      expect(website.extraLinks).toEqual([])
    })
  })

  describe('updateWebsite', () => {
    it('should update website properties', () => {
      const store = useWebsitesStore()
      const website = store.addWebsite('Original', 'https://original.com')

      const updated = store.updateWebsite(website.id, {
        name: 'Updated',
        url: 'https://updated.com'
      })

      expect(updated).toBe(true)
      const found = store.websites.find(w => w.id === website.id)
      expect(found?.name).toBe('Updated')
      expect(found?.url).toBe('https://updated.com/')
    })

    it('should update favicon when URL changes', () => {
      const store = useWebsitesStore()
      const website = store.addWebsite('Test', 'https://test.com')
      const originalFavicon = website.favicon

      store.updateWebsite(website.id, { url: 'https://newsite.com' })

      const updated = store.websites.find(w => w.id === website.id)
      expect(updated?.favicon).not.toBe(originalFavicon)
    })

    it('should return false for non-existent website', () => {
      const store = useWebsitesStore()
      const result = store.updateWebsite('nonexistent-id', { name: 'Test' })

      expect(result).toBe(false)
    })

    it('should update metadata timestamp', () => {
      const store = useWebsitesStore()
      const website = store.addWebsite('Test', 'https://test.com')
      const originalUpdatedAt = website.metadata.updatedAt

      // Wait a bit to ensure timestamp changes
      setTimeout(() => {
        store.updateWebsite(website.id, { name: 'Updated' })
        const updated = store.websites.find(w => w.id === website.id)
        expect(updated?.metadata.updatedAt).not.toBe(originalUpdatedAt)
      }, 10)
    })

    it('should normalize extra link URLs', () => {
      const store = useWebsitesStore()
      const website = store.addWebsite('Test', 'https://test.com')

      store.updateWebsite(website.id, {
        extraLinks: [
          { id: '1', name: 'Link 1', url: 'link1.com' },
          { id: '2', name: 'Link 2', url: 'https://link2.com' }
        ]
      })

      const updated = store.websites.find(w => w.id === website.id)
      expect(updated?.extraLinks[0].url).toBe('https://link1.com/')
      expect(updated?.extraLinks[1].url).toBe('https://link2.com/')
    })
  })

  describe('deleteWebsite', () => {
    it('should delete a website', () => {
      const store = useWebsitesStore()
      const website = store.addWebsite('Test', 'https://test.com')
      const initialCount = store.websites.length

      const result = store.deleteWebsite(website.id)

      expect(result).toBe(true)
      expect(store.websites.length).toBe(initialCount - 1)
      expect(store.websites.find(w => w.id === website.id)).toBeUndefined()
    })

    it('should return false for non-existent website', () => {
      const store = useWebsitesStore()
      const result = store.deleteWebsite('nonexistent-id')

      expect(result).toBe(false)
    })
  })

  describe('visitWebsite', () => {
    it('should increment visit count', () => {
      const store = useWebsitesStore()
      const website = store.addWebsite('Test', 'https://test.com')

      expect(website.metadata.visitCount).toBe(0)
      store.visitWebsite(website.id)

      const visited = store.websites.find(w => w.id === website.id)
      expect(visited?.metadata.visitCount).toBe(1)
    })

    it('should update lastVisited timestamp', () => {
      const store = useWebsitesStore()
      const website = store.addWebsite('Test', 'https://test.com')

      expect(website.metadata.lastVisited).toBeNull()
      store.visitWebsite(website.id)

      const visited = store.websites.find(w => w.id === website.id)
      expect(visited?.metadata.lastVisited).toBeTruthy()
    })

    it('should handle non-existent website gracefully', () => {
      const store = useWebsitesStore()
      expect(() => store.visitWebsite('nonexistent-id')).not.toThrow()
    })
  })

  describe('tag management', () => {
    it('should add a tag', () => {
      const store = useWebsitesStore()
      const tag = store.addTag('Work', '#FF0000')

      expect(tag).toHaveProperty('id')
      expect(tag.name).toBe('Work')
      expect(tag.color).toBe('#FF0000')
      expect(tag.metadata).toHaveProperty('createdAt')
      expect(store.tags.find(t => t.id === tag.id)).toBeTruthy()
    })

    it('should trim tag name', () => {
      const store = useWebsitesStore()
      const tag = store.addTag('  Work  ', '#FF0000')

      expect(tag.name).toBe('Work')
    })

    it('should update a tag', () => {
      const store = useWebsitesStore()
      const tag = store.addTag('Work', '#FF0000')

      const result = store.updateTag(tag.id, { name: 'Personal', color: '#00FF00' })

      expect(result).toBe(true)
      const updated = store.tags.find(t => t.id === tag.id)
      expect(updated?.name).toBe('Personal')
      expect(updated?.color).toBe('#00FF00')
    })

    it('should return false when updating non-existent tag', () => {
      const store = useWebsitesStore()
      const result = store.updateTag('nonexistent-id', { name: 'Test' })

      expect(result).toBe(false)
    })

    it('should delete a tag', () => {
      const store = useWebsitesStore()
      const tag = store.addTag('Work', '#FF0000')
      const initialCount = store.tags.length

      const result = store.deleteTag(tag.id)

      expect(result).toBe(true)
      expect(store.tags.length).toBe(initialCount - 1)
      expect(store.tags.find(t => t.id === tag.id)).toBeUndefined()
    })

    it('should remove tag from websites when deleted', () => {
      const store = useWebsitesStore()
      const tag = store.addTag('Work', '#FF0000')
      const website = store.addWebsite('Test', 'https://test.com', [tag.id])

      expect(website.tagIds).toContain(tag.id)

      store.deleteTag(tag.id)

      const updated = store.websites.find(w => w.id === website.id)
      expect(updated?.tagIds).not.toContain(tag.id)
    })
  })

  describe('computed properties', () => {
    it('should sort websites by page and order', () => {
      const store = useWebsitesStore()
      store.addWebsite('C', 'https://c.com', [], 0, 2)
      store.addWebsite('A', 'https://a.com', [], 0, 0)
      store.addWebsite('B', 'https://b.com', [], 0, 1)

      const sorted = store.sortedWebsites
      expect(sorted[0].name).toBe('A')
      expect(sorted[1].name).toBe('B')
      expect(sorted[2].name).toBe('C')
    })

    it('should group websites by page', () => {
      const store = useWebsitesStore()
      store.addWebsite('Page0-1', 'https://p01.com', [], 0, 0)
      store.addWebsite('Page0-2', 'https://p02.com', [], 0, 1)
      store.addWebsite('Page1-1', 'https://p11.com', [], 1, 0)

      const byPage = store.websitesByPage
      expect(Object.keys(byPage)).toContain('0')
      expect(Object.keys(byPage)).toContain('1')
      expect(byPage[0].length).toBe(2)
      expect(byPage[1].length).toBe(1)
    })

    it('should get current page websites', () => {
      const store = useWebsitesStore()
      store.addWebsite('Page0', 'https://p0.com', [], 0, 0)
      store.addWebsite('Page1', 'https://p1.com', [], 1, 0)

      store.setCurrentPage(0)
      expect(store.currentPageWebsites.length).toBe(1)
      expect(store.currentPageWebsites[0].name).toBe('Page0')

      store.setCurrentPage(1)
      expect(store.currentPageWebsites.length).toBe(1)
      expect(store.currentPageWebsites[0].name).toBe('Page1')
    })

    it('should calculate total pages', () => {
      const store = useWebsitesStore()
      expect(store.totalPages).toBe(1) // At least 1 page

      store.addWebsite('Page0', 'https://p0.com', [], 0, 0)
      expect(store.totalPages).toBe(1)

      store.addWebsite('Page2', 'https://p2.com', [], 2, 0)
      expect(store.totalPages).toBe(3) // Pages 0, 1, 2
    })

    it('should count tags usage', () => {
      const store = useWebsitesStore()
      const tag = store.addTag('Work', '#FF0000')

      store.addWebsite('Site1', 'https://s1.com', [tag.id])
      store.addWebsite('Site2', 'https://s2.com', [tag.id])
      store.addWebsite('Site3', 'https://s3.com', [])

      const tagsWithCount = store.tagsWithCount
      const workTag = tagsWithCount.find(t => t.id === tag.id)
      expect(workTag?.count).toBe(2)
    })
  })

  describe('position management', () => {
    it('should update website positions', () => {
      const store = useWebsitesStore()
      const w1 = store.addWebsite('A', 'https://a.com', [], 0, 0)
      const w2 = store.addWebsite('B', 'https://b.com', [], 0, 1)

      store.updateWebsitePositions([
        { id: w1.id, page: 0, order: 1 },
        { id: w2.id, page: 0, order: 0 }
      ])

      const updated1 = store.websites.find(w => w.id === w1.id)
      const updated2 = store.websites.find(w => w.id === w2.id)

      expect(updated1?.position.order).toBe(1)
      expect(updated2?.position.order).toBe(0)
    })
  })

  describe('settings management', () => {
    it('should update settings', async () => {
      const store = useWebsitesStore()
      await store.updateSettings({ gridSize: 'large' })

      expect(store.settings.gridSize).toBe('large')
    })
  })

  describe('import/export', () => {
    it('should export data with correct structure', () => {
      const store = useWebsitesStore()
      store.addWebsite('Test', 'https://test.com')
      store.addTag('Work', '#FF0000')

      const exported = store.exportData()

      expect(exported).toHaveProperty('websites')
      expect(exported).toHaveProperty('tags')
      expect(exported).toHaveProperty('settings')
      expect(exported).toHaveProperty('version')
      expect(exported).toHaveProperty('timestamp')
      expect(exported.version).toBe('1.0')
    })

    it('should import data', async () => {
      const store = useWebsitesStore()
      const importData = {
        websites: [
          {
            id: '1',
            name: 'Imported',
            url: 'https://imported.com',
            favicon: '',
            tagIds: [],
            customIcon: null,
            iconZoom: 1,
            iconBackgroundColor: 'transparent',
            extraLinks: [],
            position: { page: 0, order: 0 },
            metadata: {
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              visitCount: 0,
              lastVisited: null
            }
          }
        ],
        tags: [],
        settings: store.settings,
        version: '1.0',
        timestamp: new Date().toISOString()
      }

      await store.importData(importData)

      expect(store.websites.length).toBe(1)
      expect(store.websites[0].name).toBe('Imported')
    })

    it('should throw error for invalid import data', async () => {
      const store = useWebsitesStore()

      await expect(store.importData({} as any)).rejects.toThrow('Invalid import data')
    })
  })

  describe('clearAllData', () => {
    it('should clear all data', () => {
      const store = useWebsitesStore()
      store.addWebsite('Test', 'https://test.com')
      store.addTag('Work', '#FF0000')

      store.clearAllData()

      expect(store.websites).toEqual([])
      expect(store.tags).toEqual([])
      expect(store.currentPage).toBe(0)
    })
  })
})
