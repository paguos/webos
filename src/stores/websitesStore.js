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
  const tags = ref([])
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

  const tagsWithCount = computed(() => {
    return tags.value.map(tag => ({
      ...tag,
      count: websites.value.filter(w => w.tagIds && w.tagIds.includes(tag.id)).length
    }))
  })

  // Actions
  async function initializeData() {
    // Load from storage or use default data
    const storedWebsites = await storage.get(STORAGE_KEYS.WEBSITES)
    const storedTags = await storage.get(STORAGE_KEYS.TAGS)
    const storedSettings = await storage.get(STORAGE_KEYS.SETTINGS)

    if (storedWebsites && Array.isArray(storedWebsites)) {
      websites.value = storedWebsites
    } else {
      // Load sample data for first time users
      loadSampleData()
    }

    if (storedTags && Array.isArray(storedTags)) {
      tags.value = storedTags
    } else {
      loadSampleTags()
    }

    if (storedSettings) {
      settings.value = { ...DEFAULT_SETTINGS, ...storedSettings }
    }
  }

  function loadSampleData() {
    const sampleWebsites = [
      { name: 'Google', url: 'https://google.com', tagIds: [], page: 0, order: 0 },
      { name: 'GitHub', url: 'https://github.com', tagIds: [], page: 0, order: 1 },
      { name: 'YouTube', url: 'https://youtube.com', tagIds: [], page: 0, order: 2 },
      { name: 'Twitter', url: 'https://twitter.com', tagIds: [], page: 0, order: 3 },
      { name: 'Reddit', url: 'https://reddit.com', tagIds: [], page: 0, order: 4 },
      { name: 'Stack Overflow', url: 'https://stackoverflow.com', tagIds: [], page: 0, order: 5 },
      { name: 'LinkedIn', url: 'https://linkedin.com', tagIds: [], page: 0, order: 6 },
      { name: 'Medium', url: 'https://medium.com', tagIds: [], page: 0, order: 7 },
    ]

    sampleWebsites.forEach(site => {
      addWebsite(site.name, site.url, site.tagIds, site.page, site.order)
    })
  }

  function loadSampleTags() {
    const sampleTags = [
      { name: 'Work', color: '#667eea' },
      { name: 'Personal', color: '#FF6B6B' },
      { name: 'Shopping', color: '#4ECDC4' },
      { name: 'Social', color: '#FFA07A' },
      { name: 'Entertainment', color: '#98D8C8' }
    ]

    sampleTags.forEach(tag => {
      addTag(tag.name, tag.color)
    })
  }

  function addWebsite(name, url, tagIds = [], page = 0, order = null) {
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
      tagIds: Array.isArray(tagIds) ? tagIds : [],
      customIcon: null,
      iconZoom: 1,
      iconBackgroundColor: 'transparent',
      extraLinks: [],
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

    // Ensure tagIds is an array if provided
    if (updates.tagIds !== undefined) {
      updates.tagIds = Array.isArray(updates.tagIds) ? updates.tagIds : []
    }

    // Ensure extraLinks is an array and normalize URLs
    if (updates.extraLinks !== undefined) {
      updates.extraLinks = Array.isArray(updates.extraLinks) ? updates.extraLinks : []
      // Normalize URLs in extra links
      updates.extraLinks = updates.extraLinks.map(link => ({
        ...link,
        url: normalizeUrl(link.url)
      }))
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

  function addTag(name, color) {
    const tag = {
      id: uuidv4(),
      name: name.trim(),
      color,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }

    tags.value.push(tag)
    saveTags()
    return tag
  }

  function updateTag(id, updates) {
    const index = tags.value.findIndex(t => t.id === id)
    if (index === -1) return false

    tags.value[index] = {
      ...tags.value[index],
      ...updates,
      metadata: {
        ...tags.value[index].metadata,
        updatedAt: new Date().toISOString()
      }
    }

    saveTags()
    return true
  }

  function deleteTag(id) {
    const index = tags.value.findIndex(t => t.id === id)
    if (index === -1) return false

    // Remove tag from all websites
    websites.value.forEach(website => {
      if (website.tagIds && website.tagIds.includes(id)) {
        website.tagIds = website.tagIds.filter(tagId => tagId !== id)
      }
    })

    tags.value.splice(index, 1)
    saveTags()
    saveWebsites()
    return true
  }

  async function saveTags() {
    await storage.set(STORAGE_KEYS.TAGS, tags.value)
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

  async function updateSettings(newSettings) {
    settings.value = { ...settings.value, ...newSettings }
    await storage.set(STORAGE_KEYS.SETTINGS, settings.value)
  }

  function exportData() {
    return {
      websites: websites.value,
      tags: tags.value,
      settings: settings.value,
      version: '1.0',
      exportedAt: new Date().toISOString()
    }
  }

  async function importData(data) {
    if (!data || !data.websites) {
      throw new Error('Invalid import data')
    }

    websites.value = data.websites || []
    tags.value = data.tags || []
    settings.value = data.settings || DEFAULT_SETTINGS

    await saveWebsites()
    await saveTags()
    await storage.set(STORAGE_KEYS.SETTINGS, settings.value)
  }

  function clearAllData() {
    websites.value = []
    tags.value = []
    settings.value = DEFAULT_SETTINGS
    currentPage.value = 0

    storage.clear()
  }

  async function saveWebsites() {
    await storage.set(STORAGE_KEYS.WEBSITES, websites.value)
  }

  return {
    // State
    websites,
    tags,
    settings,
    currentPage,

    // Computed
    sortedWebsites,
    websitesByPage,
    currentPageWebsites,
    totalPages,
    tagsWithCount,

    // Actions
    initializeData,
    addWebsite,
    updateWebsite,
    deleteWebsite,
    visitWebsite,
    addTag,
    updateTag,
    deleteTag,
    updateWebsitePositions,
    setCurrentPage,
    updateSettings,
    exportData,
    importData,
    clearAllData
  }
})
