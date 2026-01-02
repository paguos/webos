import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUIStore } from '../../stores/uiStore'

describe('uiStore', () => {
  beforeEach(() => {
    // Create a fresh pinia instance for each test
    setActivePinia(createPinia())
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const store = useUIStore()

      expect(store.searchQuery).toBe('')
      expect(store.isEditMode).toBe(false)
      expect(store.showWebsiteForm).toBe(false)
      expect(store.showSettingsModal).toBe(false)
      expect(store.showTagManager).toBe(false)
      expect(store.showConfirmDialog).toBe(false)
      expect(store.editingWebsite).toBeNull()
      expect(store.editingTag).toBeNull()
      expect(store.confirmDialogConfig).toBeNull()
    })
  })

  describe('search functionality', () => {
    it('should update search query', () => {
      const store = useUIStore()

      store.setSearchQuery('test query')
      expect(store.searchQuery).toBe('test query')
    })

    it('should clear search query', () => {
      const store = useUIStore()

      store.setSearchQuery('test query')
      store.clearSearch()
      expect(store.searchQuery).toBe('')
    })
  })

  describe('edit mode', () => {
    it('should enter edit mode', () => {
      const store = useUIStore()

      store.enterEditMode()
      expect(store.isEditMode).toBe(true)
    })

    it('should exit edit mode', () => {
      const store = useUIStore()

      store.enterEditMode()
      store.exitEditMode()
      expect(store.isEditMode).toBe(false)
    })

    it('should toggle edit mode', () => {
      const store = useUIStore()

      expect(store.isEditMode).toBe(false)
      store.toggleEditMode()
      expect(store.isEditMode).toBe(true)
      store.toggleEditMode()
      expect(store.isEditMode).toBe(false)
    })
  })

  describe('website form modal', () => {
    it('should open website form without editing', () => {
      const store = useUIStore()

      store.openWebsiteForm()
      expect(store.showWebsiteForm).toBe(true)
      expect(store.editingWebsite).toBeNull()
    })

    it('should open website form with editing', () => {
      const store = useUIStore()
      const website = { id: '1', name: 'Test' }

      store.openWebsiteForm(website)
      expect(store.showWebsiteForm).toBe(true)
      expect(store.editingWebsite).toEqual(website)
    })

    it('should close website form and clear editing state', () => {
      const store = useUIStore()
      const website = { id: '1', name: 'Test' }

      store.openWebsiteForm(website)
      store.closeWebsiteForm()

      expect(store.showWebsiteForm).toBe(false)
      expect(store.editingWebsite).toBeNull()
    })
  })

  describe('settings modal', () => {
    it('should open settings modal', () => {
      const store = useUIStore()

      store.openSettingsModal()
      expect(store.showSettingsModal).toBe(true)
    })

    it('should close settings modal', () => {
      const store = useUIStore()

      store.openSettingsModal()
      store.closeSettingsModal()
      expect(store.showSettingsModal).toBe(false)
    })
  })

  describe('tag manager modal', () => {
    it('should open tag manager without editing', () => {
      const store = useUIStore()

      store.openTagManager()
      expect(store.showTagManager).toBe(true)
      expect(store.editingTag).toBeNull()
    })

    it('should open tag manager with editing', () => {
      const store = useUIStore()
      const tag = { id: '1', name: 'Work' }

      store.openTagManager(tag)
      expect(store.showTagManager).toBe(true)
      expect(store.editingTag).toEqual(tag)
    })

    it('should close tag manager and clear editing state', () => {
      const store = useUIStore()
      const tag = { id: '1', name: 'Work' }

      store.openTagManager(tag)
      store.closeTagManager()

      expect(store.showTagManager).toBe(false)
      expect(store.editingTag).toBeNull()
    })
  })

  describe('confirm dialog', () => {
    it('should open confirm dialog with config', () => {
      const store = useUIStore()
      const config = {
        title: 'Delete Item',
        message: 'Are you sure?',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        onConfirm: () => {}
      }

      store.openConfirmDialog(config)

      expect(store.showConfirmDialog).toBe(true)
      expect(store.confirmDialogConfig).toEqual(config)
    })

    it('should close confirm dialog and clear config', () => {
      const store = useUIStore()
      const config = {
        title: 'Delete Item',
        message: 'Are you sure?',
        onConfirm: () => {}
      }

      store.openConfirmDialog(config)
      store.closeConfirmDialog()

      expect(store.showConfirmDialog).toBe(false)
      expect(store.confirmDialogConfig).toBeNull()
    })
  })

  describe('close all modals', () => {
    it('should close all modals at once', () => {
      const store = useUIStore()

      // Open all modals
      store.openWebsiteForm({ id: '1' })
      store.openSettingsModal()
      store.openTagManager({ id: '1' })
      store.openConfirmDialog({ message: 'Test' })

      // Close all
      store.closeAllModals()

      expect(store.showWebsiteForm).toBe(false)
      expect(store.showSettingsModal).toBe(false)
      expect(store.showTagManager).toBe(false)
      expect(store.showConfirmDialog).toBe(false)
      expect(store.editingWebsite).toBeNull()
      expect(store.editingTag).toBeNull()
      expect(store.confirmDialogConfig).toBeNull()
    })
  })
})
