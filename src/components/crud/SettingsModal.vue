<script setup>
import { ref } from 'vue'
import { useWebsitesStore } from '../../stores/websitesStore'
import { useUIStore } from '../../stores/uiStore'

const websitesStore = useWebsitesStore()
const uiStore = useUIStore()

function handleExport() {
  const data = websitesStore.exportData()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `browserOS-export-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function handleImport() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'application/json'
  input.onchange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      try {
        const text = await file.text()
        const data = JSON.parse(text)
        websitesStore.importData(data)
        alert('Data imported successfully!')
      } catch (error) {
        alert('Failed to import data. Please check the file format.')
      }
    }
  }
  input.click()
}

function handleClearAll() {
  uiStore.openConfirmDialog({
    title: 'Clear All Data',
    message: 'This will delete all websites, categories, and settings. This cannot be undone.',
    confirmText: 'Clear All',
    cancelText: 'Cancel',
    onConfirm: () => {
      websitesStore.clearAllData()
      websitesStore.initializeData() // Reload sample data
      uiStore.closeSettingsModal()
    }
  })
}

function handleClose() {
  uiStore.closeSettingsModal()
}
</script>

<template>
  <Teleport to="body">
    <div v-if="uiStore.showSettingsModal" class="overlay" @click="handleClose">
      <div class="modal settings-modal modal-instant" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">Settings</h2>
          <button class="close-button" @click="handleClose" aria-label="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <div class="settings-section">
          <h3 class="section-title">Data Management</h3>
          <div class="settings-actions">
            <button class="settings-button" @click="handleExport">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M6 10l4 4 4-4M10 14V2M2 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              Export Data
            </button>
            <button class="settings-button" @click="handleImport">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M6 6l4-4 4 4M10 2v12M2 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              Import Data
            </button>
            <button class="settings-button danger" @click="handleClearAll">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M2.5 5h15M6.667 5V3.333A1.667 1.667 0 018.333 1.667h3.334A1.667 1.667 0 0113.333 3.333V5m2.5 0v11.667a1.667 1.667 0 01-1.666 1.666H5.833a1.667 1.667 0 01-1.666-1.666V5h11.666z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              Clear All Data
            </button>
          </div>
        </div>

        <div class="settings-section">
          <h3 class="section-title">About</h3>
          <p class="about-text">BrowserOS - A macOS Launchpad-inspired web browser</p>
          <p class="about-text">Version 1.0.0</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.settings-modal {
  min-width: 500px;
  max-width: 600px;
  padding: 0;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.modal-title {
  font-size: 24px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.9);
  margin: 0;
}

.close-button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  color: rgba(0, 0, 0, 0.5);
  transition: all var(--transition-fast);
}

.close-button:hover {
  background: rgba(0, 0, 0, 0.05);
  color: rgba(0, 0, 0, 0.9);
}

.settings-section {
  padding: 24px 32px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.settings-section:last-child {
  border-bottom: none;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.8);
  margin: 0 0 16px 0;
}

.settings-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.settings-button {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.05);
  color: rgba(0, 0, 0, 0.9);
  font-size: 15px;
  font-weight: 500;
  text-align: left;
  transition: all var(--transition-fast);
}

.settings-button:hover {
  background: rgba(0, 0, 0, 0.1);
  transform: translateX(4px);
}

.settings-button.danger {
  color: #FF3B30;
}

.settings-button.danger:hover {
  background: rgba(255, 59, 48, 0.1);
}

.about-text {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.6);
  margin: 0 0 8px 0;
}

.about-text:last-child {
  margin-bottom: 0;
}

@media (prefers-color-scheme: dark) {
  .modal-header {
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }

  .modal-title {
    color: rgba(255, 255, 255, 0.9);
  }

  .close-button {
    color: rgba(255, 255, 255, 0.5);
  }

  .close-button:hover {
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.9);
  }

  .settings-section {
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }

  .section-title {
    color: rgba(255, 255, 255, 0.8);
  }

  .settings-button {
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.9);
  }

  .settings-button:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .settings-button.danger {
    color: #FF453A;
  }

  .settings-button.danger:hover {
    background: rgba(255, 69, 58, 0.15);
  }

  .about-text {
    color: rgba(255, 255, 255, 0.6);
  }
}

@media (max-width: 640px) {
  .settings-modal {
    min-width: 0;
    width: 90vw;
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-header,
  .settings-section {
    padding: 20px;
  }
}
</style>
