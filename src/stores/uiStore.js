import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUIStore = defineStore('ui', () => {
  // State
  const searchQuery = ref('')
  const isEditMode = ref(false)
  const showWebsiteForm = ref(false)
  const showSettingsModal = ref(false)
  const showFolderModal = ref(false)
  const showTagManager = ref(false)
  const showConfirmDialog = ref(false)
  const editingWebsite = ref(null)
  const editingTag = ref(null)
  const activeFolderId = ref(null)
  const confirmDialogConfig = ref({
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    onConfirm: null
  })

  // Actions
  function setSearchQuery(query) {
    searchQuery.value = query
  }

  function clearSearch() {
    searchQuery.value = ''
  }

  function openWebsiteForm(website = null) {
    editingWebsite.value = website
    showWebsiteForm.value = true
  }

  function closeWebsiteForm() {
    showWebsiteForm.value = false
    editingWebsite.value = null
  }

  function openSettingsModal() {
    showSettingsModal.value = true
  }

  function closeSettingsModal() {
    showSettingsModal.value = false
  }

  function openFolderModal(folderId) {
    activeFolderId.value = folderId
    showFolderModal.value = true
  }

  function closeFolderModal() {
    showFolderModal.value = false
    activeFolderId.value = null
  }

  function openTagManager(tag = null) {
    editingTag.value = tag
    showTagManager.value = true
  }

  function closeTagManager() {
    showTagManager.value = false
    editingTag.value = null
  }

  function openConfirmDialog(config) {
    confirmDialogConfig.value = {
      title: config.title || 'Confirm',
      message: config.message || 'Are you sure?',
      confirmText: config.confirmText || 'Confirm',
      cancelText: config.cancelText || 'Cancel',
      onConfirm: config.onConfirm || null
    }
    showConfirmDialog.value = true
  }

  function closeConfirmDialog() {
    showConfirmDialog.value = false
    confirmDialogConfig.value = {
      title: '',
      message: '',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      onConfirm: null
    }
  }

  function confirmDialogAction() {
    if (confirmDialogConfig.value.onConfirm) {
      confirmDialogConfig.value.onConfirm()
    }
    closeConfirmDialog()
  }

  function enterEditMode() {
    isEditMode.value = true
  }

  function exitEditMode() {
    isEditMode.value = false
  }

  function toggleEditMode() {
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
