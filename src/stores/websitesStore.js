import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import storage from '../utils/storage'
import { STORAGE_KEYS, DEFAULT_SETTINGS } from '../utils/constants'
import { getFaviconUrl } from '../utils/favicon'
import { normalizeUrl } from '../utils/validators'

export const useWebsitesStore = defineStore('websites', () => {
  // State
  const websites = ref([])
  const categories = ref([])
  const settings = ref(DEFAULT_SETTINGS)
  const currentPage = ref(0)

  // Computed
  const sortedWebsites = computed(() => {
    return [...websites.value].sort((a, b) => {
      if (a.position.page !== b.position.page) {
        return a.position.page - b.position.page
      }
      return a.position.order - b.position.order
    })
  })

  const websitesByPage = computed(() => {
    const pages = {}
    sortedWebsites.value.forEach(website => {
      const page = website.position.page
      if (!pages[page]) {
        pages[page] = []
      }
      pages[page].push(website)
    })
    return pages
  })

  const currentPageWebsites = computed(() => {
    return websitesByPage.value[currentPage.value] || []
  })

  const totalPages = computed(() => {
    return Math.max(...sortedWebsites.value.map(w => w.position.page), 0) + 1
  })

  const categoriesWithCount = computed(() => {
    return categories.value.map(cat => ({
      ...cat,
      count: websites.value.filter(w => w.categoryId === cat.id).length
    }))
  })

  // Actions
  function initializeData() {
    // Load from localStorage or use default data
    const storedWebsites = storage.get(STORAGE_KEYS.WEBSITES)
    const storedCategories = storage.get(STORAGE_KEYS.CATEGORIES)
    const storedSettings = storage.get(STORAGE_KEYS.SETTINGS)

    if (storedWebsites && Array.isArray(storedWebsites)) {
      websites.value = storedWebsites
    } else {
      // Load sample data for first time users
      loadSampleData()
    }

    if (storedCategories && Array.isArray(storedCategories)) {
      categories.value = storedCategories
    } else {
      loadSampleCategories()
    }

    if (storedSettings) {
      settings.value = { ...DEFAULT_SETTINGS, ...storedSettings }
    }
  }

  function loadSampleData() {
    const sampleWebsites = [
      { name: 'Google', url: 'https://google.com', categoryId: null, page: 0, order: 0 },
      { name: 'GitHub', url: 'https://github.com', categoryId: null, page: 0, order: 1 },
      { name: 'YouTube', url: 'https://youtube.com', categoryId: null, page: 0, order: 2 },
      { name: 'Twitter', url: 'https://twitter.com', categoryId: null, page: 0, order: 3 },
      { name: 'Reddit', url: 'https://reddit.com', categoryId: null, page: 0, order: 4 },
      { name: 'Stack Overflow', url: 'https://stackoverflow.com', categoryId: null, page: 0, order: 5 },
      { name: 'LinkedIn', url: 'https://linkedin.com', categoryId: null, page: 0, order: 6 },
      { name: 'Medium', url: 'https://medium.com', categoryId: null, page: 0, order: 7 },
    ]

    sampleWebsites.forEach(site => {
      addWebsite(site.name, site.url, site.categoryId, site.page, site.order)
    })
  }

  function loadSampleCategories() {
    const sampleCategories = [
      { name: 'Work', color: '#667eea' },
      { name: 'Social', color: '#FF6B6B' },
      { name: 'Entertainment', color: '#4ECDC4' }
    ]

    sampleCategories.forEach((cat, index) => {
      addCategory(cat.name, cat.color, 0, 100 + index)
    })
  }

  function addWebsite(name, url, categoryId = null, page = 0, order = null) {
    const normalizedUrl = normalizeUrl(url)
    const favicon = getFaviconUrl(normalizedUrl)

    // If order not specified, put at end of page
    if (order === null) {
      const pageWebsites = websites.value.filter(w => w.position.page === page)
      order = pageWebsites.length
    }

    const website = {
      id: uuidv4(),
      name: name.trim(),
      url: normalizedUrl,
      favicon,
      categoryId,
      customIcon: null,
      iconZoom: 1,
      iconBackgroundColor: 'transparent',
      position: { page, order },
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        visitCount: 0,
        lastVisited: null
      }
    }

    websites.value.push(website)
    saveWebsites()
    return website
  }

  function updateWebsite(id, updates) {
    const index = websites.value.findIndex(w => w.id === id)
    if (index === -1) return false

    // If URL is being updated, update favicon too
    if (updates.url) {
      updates.url = normalizeUrl(updates.url)
      updates.favicon = getFaviconUrl(updates.url)
    }

    websites.value[index] = {
      ...websites.value[index],
      ...updates,
      metadata: {
        ...websites.value[index].metadata,
        updatedAt: new Date().toISOString()
      }
    }

    saveWebsites()
    return true
  }

  function deleteWebsite(id) {
    const index = websites.value.findIndex(w => w.id === id)
    if (index === -1) return false

    websites.value.splice(index, 1)
    saveWebsites()
    return true
  }

  function visitWebsite(id) {
    const website = websites.value.find(w => w.id === id)
    if (!website) return

    website.metadata.visitCount++
    website.metadata.lastVisited = new Date().toISOString()
    saveWebsites()
  }

  function addCategory(name, color, page = 0, order = null) {
    if (order === null) {
      const pageItems = [...websites.value, ...categories.value].filter(
        item => item.position.page === page
      )
      order = pageItems.length
    }

    const category = {
      id: uuidv4(),
      name: name.trim(),
      color,
      icon: 'folder',
      position: { page, order },
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }

    categories.value.push(category)
    saveCategories()
    return category
  }

  function updateCategory(id, updates) {
    const index = categories.value.findIndex(c => c.id === id)
    if (index === -1) return false

    categories.value[index] = {
      ...categories.value[index],
      ...updates,
      metadata: {
        ...categories.value[index].metadata,
        updatedAt: new Date().toISOString()
      }
    }

    saveCategories()
    return true
  }

  function deleteCategory(id) {
    const index = categories.value.findIndex(c => c.id === id)
    if (index === -1) return false

    // Remove category from websites
    websites.value.forEach(website => {
      if (website.categoryId === id) {
        website.categoryId = null
      }
    })

    categories.value.splice(index, 1)
    saveCategories()
    saveWebsites()
    return true
  }

  function updateWebsitePositions(newPositions) {
    // newPositions is an array of { id, page, order }
    newPositions.forEach(pos => {
      const website = websites.value.find(w => w.id === pos.id)
      if (website) {
        website.position = { page: pos.page, order: pos.order }
      }
    })
    saveWebsites()
  }

  function setCurrentPage(page) {
    currentPage.value = page
  }

  function updateSettings(newSettings) {
    settings.value = { ...settings.value, ...newSettings }
    storage.set(STORAGE_KEYS.SETTINGS, settings.value)
  }

  function exportData() {
    return {
      websites: websites.value,
      categories: categories.value,
      settings: settings.value,
      version: '1.0',
      exportedAt: new Date().toISOString()
    }
  }

  function importData(data) {
    if (!data || !data.websites) {
      throw new Error('Invalid import data')
    }

    websites.value = data.websites || []
    categories.value = data.categories || []
    settings.value = data.settings || DEFAULT_SETTINGS

    saveWebsites()
    saveCategories()
    storage.set(STORAGE_KEYS.SETTINGS, settings.value)
  }

  function clearAllData() {
    websites.value = []
    categories.value = []
    settings.value = DEFAULT_SETTINGS
    currentPage.value = 0

    storage.clear()
  }

  function saveWebsites() {
    storage.set(STORAGE_KEYS.WEBSITES, websites.value)
  }

  function saveCategories() {
    storage.set(STORAGE_KEYS.CATEGORIES, categories.value)
  }

  return {
    // State
    websites,
    categories,
    settings,
    currentPage,

    // Computed
    sortedWebsites,
    websitesByPage,
    currentPageWebsites,
    totalPages,
    categoriesWithCount,

    // Actions
    initializeData,
    addWebsite,
    updateWebsite,
    deleteWebsite,
    visitWebsite,
    addCategory,
    updateCategory,
    deleteCategory,
    updateWebsitePositions,
    setCurrentPage,
    updateSettings,
    exportData,
    importData,
    clearAllData
  }
})
