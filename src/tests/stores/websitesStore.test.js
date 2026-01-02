import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useWebsitesStore } from '../../stores/websitesStore'

// Mock the storage module
vi.mock('../../utils/storage', () => ({
  default: {
    get: vi.fn(),
    set: vi.fn(),
    clear: vi.fn()
  }
}))

// Mock uuid with a counter to ensure unique IDs
let uuidCounter = 0
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'test-uuid-' + (++uuidCounter))
}))

describe('websitesStore', () => {
  beforeEach(() => {
    // Create a fresh pinia instance for each test
    setActivePinia(createPinia())
    vi.clearAllMocks()
    // Reset uuid counter for each test
    uuidCounter = 0
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const store = useWebsitesStore()

      expect(store.websites).toEqual([])
      expect(store.tags).toEqual([])
      expect(store.currentPage).toBe(1)
      expect(store.settings).toBeDefined()
      expect(store.settings.gridSize).toBe('medium')
    })
  })

  describe('computed properties', () => {
    it('should compute sortedWebsites by position', () => {
      const store = useWebsitesStore()

      store.websites = [
        { id: '1', name: 'Site 1', position: { page: 1, order: 2 } },
        { id: '2', name: 'Site 2', position: { page: 1, order: 1 } },
        { id: '3', name: 'Site 3', position: { page: 2, order: 1 } }
      ]

      const sorted = store.sortedWebsites
      expect(sorted[0].id).toBe('2') // Page 1, order 1
      expect(sorted[1].id).toBe('1') // Page 1, order 2
      expect(sorted[2].id).toBe('3') // Page 2, order 1
    })

    it('should compute totalPages based on grid size', () => {
      const store = useWebsitesStore()

      // Medium grid size has 35 items per page
      store.websites = new Array(40).fill(null).map((_, i) => ({
        id: `${i}`,
        name: `Site ${i}`,
        position: { page: 1, order: i }
      }))

      expect(store.totalPages).toBe(2) // 40 websites / 35 per page = 2 pages
    })

    it('should compute currentPageWebsites', () => {
      const store = useWebsitesStore()

      store.websites = [
        { id: '1', name: 'Site 1', position: { page: 1, order: 1 } },
        { id: '2', name: 'Site 2', position: { page: 1, order: 2 } },
        { id: '3', name: 'Site 3', position: { page: 2, order: 1 } }
      ]

      store.currentPage = 1
      expect(store.currentPageWebsites.length).toBe(2)

      store.currentPage = 2
      expect(store.currentPageWebsites.length).toBe(1)
    })

    it('should compute tagsWithCount', () => {
      const store = useWebsitesStore()

      store.tags = [
        { id: '1', name: 'Work', color: '#ff0000' },
        { id: '2', name: 'Personal', color: '#00ff00' }
      ]

      store.websites = [
        { id: '1', tagIds: ['1'] },
        { id: '2', tagIds: ['1'] },
        { id: '3', tagIds: ['2'] }
      ]

      const tagsWithCount = store.tagsWithCount
      expect(tagsWithCount[0].count).toBe(2) // Work tag
      expect(tagsWithCount[1].count).toBe(1) // Personal tag
    })
  })

  describe('addWebsite', () => {
    it('should add a new website with correct structure', () => {
      const store = useWebsitesStore()

      store.addWebsite('Test Site', 'https://example.com', [], 1, 0)

      expect(store.websites.length).toBe(1)
      const website = store.websites[0]

      expect(website.name).toBe('Test Site')
      expect(website.url).toBe('https://example.com')
      expect(website.tagIds).toEqual([])
      expect(website.position).toEqual({ page: 1, order: 0 })
      expect(website.favicon).toBeDefined()
      expect(website.metadata).toBeDefined()
      expect(website.metadata.createdAt).toBeDefined()
      expect(website.metadata.visitCount).toBe(0)
    })

    it('should normalize URLs when adding', () => {
      const store = useWebsitesStore()

      store.addWebsite('Test', 'example.com', [], 1, 0)

      expect(store.websites[0].url).toBe('https://example.com')
    })

    it('should assign unique IDs', () => {
      const store = useWebsitesStore()

      store.addWebsite('Site 1', 'https://example.com', [], 1, 0)
      store.addWebsite('Site 2', 'https://example2.com', [], 1, 1)

      expect(store.websites[0].id).not.toBe(store.websites[1].id)
    })
  })

  describe('updateWebsite', () => {
    it('should update existing website', () => {
      const store = useWebsitesStore()

      store.addWebsite('Old Name', 'https://example.com', [], 1, 0)
      const websiteId = store.websites[0].id

      const success = store.updateWebsite(websiteId, {
        name: 'New Name',
        url: 'https://newurl.com'
      })

      expect(success).toBe(true)
      expect(store.websites[0].name).toBe('New Name')
      expect(store.websites[0].url).toBe('https://newurl.com')
      expect(store.websites[0].metadata.updatedAt).toBeDefined()
    })

    it('should return false for non-existent website', () => {
      const store = useWebsitesStore()

      const success = store.updateWebsite('non-existent-id', { name: 'Test' })
      expect(success).toBe(false)
    })

    it('should normalize URLs when updating', () => {
      const store = useWebsitesStore()

      store.addWebsite('Test', 'https://example.com', [], 1, 0)
      const websiteId = store.websites[0].id

      store.updateWebsite(websiteId, { url: 'newurl.com' })

      expect(store.websites[0].url).toBe('https://newurl.com')
    })
  })

  describe('deleteWebsite', () => {
    it('should delete website by ID', () => {
      const store = useWebsitesStore()

      store.addWebsite('Test', 'https://example.com', [], 1, 0)
      const websiteId = store.websites[0].id

      const success = store.deleteWebsite(websiteId)

      expect(success).toBe(true)
      expect(store.websites.length).toBe(0)
    })

    it('should return false for non-existent website', () => {
      const store = useWebsitesStore()

      const success = store.deleteWebsite('non-existent-id')
      expect(success).toBe(false)
    })
  })

  describe('visitWebsite', () => {
    it('should increment visit count', () => {
      const store = useWebsitesStore()

      store.addWebsite('Test', 'https://example.com', [], 1, 0)
      const websiteId = store.websites[0].id

      store.visitWebsite(websiteId)

      expect(store.websites[0].metadata.visitCount).toBe(1)
      expect(store.websites[0].metadata.lastVisited).toBeDefined()
    })

    it('should update lastVisited timestamp', () => {
      const store = useWebsitesStore()

      store.addWebsite('Test', 'https://example.com', [], 1, 0)
      const websiteId = store.websites[0].id

      const before = new Date()
      store.visitWebsite(websiteId)
      const lastVisited = new Date(store.websites[0].metadata.lastVisited)

      expect(lastVisited >= before).toBe(true)
    })
  })

  describe('tag management', () => {
    it('should add a new tag', () => {
      const store = useWebsitesStore()

      store.addTag('Work', '#ff0000')

      expect(store.tags.length).toBe(1)
      expect(store.tags[0].name).toBe('Work')
      expect(store.tags[0].color).toBe('#ff0000')
      expect(store.tags[0].id).toBeDefined()
    })

    it('should update existing tag', () => {
      const store = useWebsitesStore()

      store.addTag('Work', '#ff0000')
      const tagId = store.tags[0].id

      const success = store.updateTag(tagId, { name: 'Business', color: '#00ff00' })

      expect(success).toBe(true)
      expect(store.tags[0].name).toBe('Business')
      expect(store.tags[0].color).toBe('#00ff00')
    })

    it('should delete tag and remove from websites', () => {
      const store = useWebsitesStore()

      store.addTag('Work', '#ff0000')
      const tagId = store.tags[0].id

      store.addWebsite('Test', 'https://example.com', [tagId], 1, 0)

      store.deleteTag(tagId)

      expect(store.tags.length).toBe(0)
      expect(store.websites[0].tagIds).toEqual([])
    })
  })

  describe('pagination', () => {
    it('should change page', () => {
      const store = useWebsitesStore()

      store.goToPage(3)
      expect(store.currentPage).toBe(3)
    })

    it('should navigate to next page', () => {
      const store = useWebsitesStore()

      // Create enough websites for multiple pages (need more than 35 for medium grid)
      for (let i = 0; i < 40; i++) {
        store.addWebsite(`Site ${i}`, `https://example${i}.com`, [], 1, i)
      }

      store.currentPage = 1
      store.nextPage()
      expect(store.currentPage).toBe(2)
    })

    it('should not go beyond total pages', () => {
      const store = useWebsitesStore()

      // Create websites for 2 pages
      for (let i = 0; i < 40; i++) {
        store.addWebsite(`Site ${i}`, `https://example${i}.com`, [], 1, i)
      }

      // totalPages should be 2 now (40 websites / 35 per page)
      store.currentPage = 2
      store.nextPage()
      // Should not go beyond page 2
      expect(store.currentPage).toBe(2)
    })

    it('should navigate to previous page', () => {
      const store = useWebsitesStore()

      store.currentPage = 3
      store.previousPage()
      expect(store.currentPage).toBe(2)
    })

    it('should not go below page 1', () => {
      const store = useWebsitesStore()

      store.currentPage = 1
      store.previousPage()
      expect(store.currentPage).toBe(1)
    })
  })

  describe('updateWebsitePositions', () => {
    it('should update positions for multiple websites', () => {
      const store = useWebsitesStore()

      store.addWebsite('Site 1', 'https://example1.com', [], 1, 0)
      store.addWebsite('Site 2', 'https://example2.com', [], 1, 1)
      store.addWebsite('Site 3', 'https://example3.com', [], 1, 2)

      const reorderedWebsites = [
        store.websites[2], // Site 3 -> position 0
        store.websites[0], // Site 1 -> position 1
        store.websites[1]  // Site 2 -> position 2
      ]

      store.updateWebsitePositions(reorderedWebsites)

      expect(store.websites[2].position.order).toBe(0)
      expect(store.websites[0].position.order).toBe(1)
      expect(store.websites[1].position.order).toBe(2)
    })
  })

  describe('settings', () => {
    it('should update grid size', () => {
      const store = useWebsitesStore()

      store.updateSettings({ gridSize: 'large' })
      expect(store.settings.gridSize).toBe('large')
    })

    it('should update gradient', () => {
      const store = useWebsitesStore()

      store.updateSettings({ gradient: 'monterey' })
      expect(store.settings.gradient).toBe('monterey')
    })
  })

  describe('data export/import', () => {
    it('should export all data', () => {
      const store = useWebsitesStore()

      store.addWebsite('Test', 'https://example.com', [], 1, 0)
      store.addTag('Work', '#ff0000')

      const exported = store.exportData()

      expect(exported.websites).toHaveLength(1)
      expect(exported.tags).toHaveLength(1)
      expect(exported.settings).toBeDefined()
      expect(exported.version).toBe('1.0')
      expect(exported.timestamp).toBeDefined()
    })

    it('should import valid data', async () => {
      const store = useWebsitesStore()

      const importData = {
        websites: [
          { id: '1', name: 'Test', url: 'https://example.com', tagIds: [], position: { page: 1, order: 0 } }
        ],
        tags: [
          { id: '1', name: 'Work', color: '#ff0000' }
        ],
        settings: { gridSize: 'large' }
      }

      await store.importData(importData)

      expect(store.websites).toHaveLength(1)
      expect(store.tags).toHaveLength(1)
      expect(store.settings.gridSize).toBe('large')
    })

    it('should throw error for invalid import data', async () => {
      const store = useWebsitesStore()

      await expect(store.importData(null)).rejects.toThrow('Invalid import data')
      await expect(store.importData({})).rejects.toThrow('Invalid import data')
    })
  })

  describe('clearAllData', () => {
    it('should clear all data', async () => {
      const store = useWebsitesStore()

      store.addWebsite('Test', 'https://example.com', [], 1, 0)
      store.addTag('Work', '#ff0000')

      await store.clearAllData()

      expect(store.websites).toEqual([])
      expect(store.tags).toEqual([])
      expect(store.currentPage).toBe(1)
    })
  })
})
