import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Ref } from 'vue'
import type { Website, Tag, ConfirmDialogConfig } from '../types'

export const useUIStore = defineStore('ui', () => {
  // State
  const searchQuery: Ref<string> = ref('')
  const isEditMode: Ref<boolean> = ref(false)
  const showWebsiteForm: Ref<boolean> = ref(false)
  const showSettingsModal: Ref<boolean> = ref(false)
  const showFolderModal: Ref<boolean> = ref(false)
  const showTagManager: Ref<boolean> = ref(false)
  const showConfirmDialog: Ref<boolean> = ref(false)
  const editingWebsite: Ref<Website | null> = ref(null)
  const editingTag: Ref<Tag | null> = ref(null)
  const activeFolderId: Ref<string | null> = ref(null)
  const confirmDialogConfig: Ref<ConfirmDialogConfig> = ref({
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    onConfirm: null
  })

  // Actions
  function setSearchQuery(query: string): void {
    searchQuery.value = query
  }

  function clearSearch(): void {
    searchQuery.value = ''
  }

  function openWebsiteForm(website: Website | null = null): void {
    editingWebsite.value = website
    showWebsiteForm.value = true
  }

  function closeWebsiteForm(): void {
    showWebsiteForm.value = false
    editingWebsite.value = null
  }

  function openSettingsModal(): void {
    showSettingsModal.value = true
  }

  function closeSettingsModal(): void {
    showSettingsModal.value = false
  }

  function openFolderModal(folderId: string): void {
    activeFolderId.value = folderId
    showFolderModal.value = true
  }

  function closeFolderModal(): void {
    showFolderModal.value = false
    activeFolderId.value = null
  }

  function openTagManager(tag: Tag | null = null): void {
    editingTag.value = tag
    showTagManager.value = true
  }

  function closeTagManager(): void {
    showTagManager.value = false
    editingTag.value = null
  }

  function openConfirmDialog(config: Partial<ConfirmDialogConfig>): void {
    confirmDialogConfig.value = {
      title: config.title || 'Confirm',
      message: config.message || 'Are you sure?',
      confirmText: config.confirmText || 'Confirm',
      cancelText: config.cancelText || 'Cancel',
      onConfirm: config.onConfirm || null
    }
    showConfirmDialog.value = true
  }

  function closeConfirmDialog(): void {
    showConfirmDialog.value = false
    confirmDialogConfig.value = {
      title: '',
      message: '',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      onConfirm: null
    }
  }

  function confirmDialogAction(): void {
    if (confirmDialogConfig.value.onConfirm) {
      confirmDialogConfig.value.onConfirm()
    }
    closeConfirmDialog()
  }

  function enterEditMode(): void {
    isEditMode.value = true
  }

  function exitEditMode(): void {
    isEditMode.value = false
  }

  function toggleEditMode(): void {
    isEditMode.value = !isEditMode.value
  }

  return {
    // State
    searchQuery,
    isEditMode,
    showWebsiteForm,
    showSettingsModal,
    showFolderModal,
    showTagManager,
    showConfirmDialog,
    editingWebsite,
    editingTag,
    activeFolderId,
    confirmDialogConfig,

    // Actions
    setSearchQuery,
    clearSearch,
    enterEditMode,
    exitEditMode,
    toggleEditMode,
    openWebsiteForm,
    closeWebsiteForm,
    openSettingsModal,
    closeSettingsModal,
    openFolderModal,
    closeFolderModal,
    openTagManager,
    closeTagManager,
    openConfirmDialog,
    closeConfirmDialog,
    confirmDialogAction
  }
})
