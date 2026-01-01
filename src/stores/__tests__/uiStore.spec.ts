import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUIStore } from '../uiStore.ts'
import type { Website, Tag } from '../../types'

describe('uiStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('initialization', () => {
    it('should initialize with default values', () => {
      const store = useUIStore()

      expect(store.searchQuery).toBe('')
      expect(store.isEditMode).toBe(false)
      expect(store.showWebsiteForm).toBe(false)
      expect(store.showSettingsModal).toBe(false)
      expect(store.showTagManager).toBe(false)
      expect(store.showConfirmDialog).toBe(false)
      expect(store.editingWebsite).toBeNull()
      expect(store.editingTag).toBeNull()
    })
  })

  describe('search functionality', () => {
    it('should set search query', () => {
      const store = useUIStore()

      store.setSearchQuery('test query')
      expect(store.searchQuery).toBe('test query')
    })

    it('should clear search query', () => {
      const store = useUIStore()

      store.setSearchQuery('test query')
      expect(store.searchQuery).toBe('test query')

      store.clearSearch()
      expect(store.searchQuery).toBe('')
    })
  })

  describe('edit mode', () => {
    it('should enter edit mode', () => {
      const store = useUIStore()

      expect(store.isEditMode).toBe(false)
      store.enterEditMode()
      expect(store.isEditMode).toBe(true)
    })

    it('should exit edit mode', () => {
      const store = useUIStore()

      store.enterEditMode()
      expect(store.isEditMode).toBe(true)

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

  describe('website form', () => {
    it('should open website form without editing', () => {
      const store = useUIStore()

      store.openWebsiteForm()

      expect(store.showWebsiteForm).toBe(true)
      expect(store.editingWebsite).toBeNull()
    })

    it('should open website form with editing website', () => {
      const store = useUIStore()
      const website: Website = {
        id: '1',
        name: 'Test',
        url: 'https://test.com',
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

      store.openWebsiteForm(website)

      expect(store.showWebsiteForm).toBe(true)
      expect(store.editingWebsite).toStrictEqual(website)
    })

    it('should close website form and clear editing website', () => {
      const store = useUIStore()
      const website: Website = {
        id: '1',
        name: 'Test',
        url: 'https://test.com',
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

      store.openWebsiteForm(website)
      expect(store.showWebsiteForm).toBe(true)
      expect(store.editingWebsite).toStrictEqual(website)

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
      expect(store.showSettingsModal).toBe(true)

      store.closeSettingsModal()
      expect(store.showSettingsModal).toBe(false)
    })
  })

  describe('folder modal', () => {
    it('should open folder modal with folder ID', () => {
      const store = useUIStore()

      store.openFolderModal('folder-123')
      expect(store.showFolderModal).toBe(true)
      expect(store.activeFolderId).toBe('folder-123')
    })

    it('should close folder modal and clear folder ID', () => {
      const store = useUIStore()

      store.openFolderModal('folder-123')
      expect(store.showFolderModal).toBe(true)
      expect(store.activeFolderId).toBe('folder-123')

      store.closeFolderModal()
      expect(store.showFolderModal).toBe(false)
      expect(store.activeFolderId).toBeNull()
    })
  })

  describe('tag manager', () => {
    it('should open tag manager without editing', () => {
      const store = useUIStore()

      store.openTagManager()
      expect(store.showTagManager).toBe(true)
      expect(store.editingTag).toBeNull()
    })

    it('should open tag manager with editing tag', () => {
      const store = useUIStore()
      const tag: Tag = {
        id: '1',
        name: 'Work',
        color: '#FF0000',
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }

      store.openTagManager(tag)
      expect(store.showTagManager).toBe(true)
      expect(store.editingTag).toStrictEqual(tag)
    })

    it('should close tag manager and clear editing tag', () => {
      const store = useUIStore()
      const tag: Tag = {
        id: '1',
        name: 'Work',
        color: '#FF0000',
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }

      store.openTagManager(tag)
      expect(store.showTagManager).toBe(true)
      expect(store.editingTag).toStrictEqual(tag)

      store.closeTagManager()
      expect(store.showTagManager).toBe(false)
      expect(store.editingTag).toBeNull()
    })
  })

  describe('confirm dialog', () => {
    it('should open confirm dialog with config', () => {
      const store = useUIStore()
      const onConfirm = vi.fn()

      store.openConfirmDialog({
        title: 'Delete Item',
        message: 'Are you sure you want to delete this?',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        onConfirm
      })

      expect(store.showConfirmDialog).toBe(true)
      expect(store.confirmDialogConfig.title).toBe('Delete Item')
      expect(store.confirmDialogConfig.message).toBe('Are you sure you want to delete this?')
      expect(store.confirmDialogConfig.confirmText).toBe('Delete')
      expect(store.confirmDialogConfig.cancelText).toBe('Cancel')
      expect(store.confirmDialogConfig.onConfirm).toBe(onConfirm)
    })

    it('should use default values for missing config', () => {
      const store = useUIStore()

      store.openConfirmDialog({})

      expect(store.confirmDialogConfig.title).toBe('Confirm')
      expect(store.confirmDialogConfig.message).toBe('Are you sure?')
      expect(store.confirmDialogConfig.confirmText).toBe('Confirm')
      expect(store.confirmDialogConfig.cancelText).toBe('Cancel')
    })

    it('should close confirm dialog and reset config', () => {
      const store = useUIStore()

      store.openConfirmDialog({
        title: 'Delete',
        message: 'Are you sure?'
      })

      expect(store.showConfirmDialog).toBe(true)

      store.closeConfirmDialog()

      expect(store.showConfirmDialog).toBe(false)
      expect(store.confirmDialogConfig.title).toBe('')
      expect(store.confirmDialogConfig.message).toBe('')
      expect(store.confirmDialogConfig.onConfirm).toBeNull()
    })

    it('should execute confirm action and close dialog', () => {
      const store = useUIStore()
      const onConfirm = vi.fn()

      store.openConfirmDialog({ onConfirm })
      store.confirmDialogAction()

      expect(onConfirm).toHaveBeenCalled()
      expect(store.showConfirmDialog).toBe(false)
    })

    it('should handle confirm action without callback', () => {
      const store = useUIStore()

      store.openConfirmDialog({})

      expect(() => store.confirmDialogAction()).not.toThrow()
      expect(store.showConfirmDialog).toBe(false)
    })
  })
})
