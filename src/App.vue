<script setup>
import { ref, onMounted } from 'vue'
import { useWebsitesStore } from './stores/websitesStore.ts'
import LaunchpadContainer from './components/layout/LaunchpadContainer.vue'
import WebsiteForm from './components/crud/WebsiteForm.vue'
import ConfirmDialog from './components/crud/ConfirmDialog.vue'
import SettingsModal from './components/crud/SettingsModal.vue'
import TagManager from './components/crud/TagManager.vue'
import Toast from './components/common/Toast.vue'

const websitesStore = useWebsitesStore()
const isLoading = ref(true)
const loadError = ref(null)

onMounted(async () => {
  try {
    // Initialize data from storage
    await websitesStore.initializeData()
  } catch (error) {
    console.error('Failed to load data:', error)
    loadError.value = error.message
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div id="browseros-app">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-screen">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <p>Loading webOS...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="loadError" class="error-screen">
      <div class="error-content">
        <h2>Failed to Load</h2>
        <p>{{ loadError }}</p>
        <button @click="window.location.reload()" class="retry-button">
          Retry
        </button>
      </div>
    </div>

    <!-- Main App -->
    <template v-else>
      <LaunchpadContainer />

      <!-- Global Modals -->
      <WebsiteForm />
      <ConfirmDialog />
      <SettingsModal />
      <TagManager />

      <!-- Toast Notifications -->
      <Toast />
    </template>
  </div>
</template>

<style scoped>
#browseros-app {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.loading-screen,
.error-screen {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.loading-content,
.error-content {
  text-align: center;
  color: white;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 24px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-content p,
.error-content p {
  font-size: 16px;
  font-weight: 500;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  margin: 0;
}

.error-content h2 {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 12px 0;
}

.retry-button {
  margin-top: 24px;
  padding: 12px 32px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.retry-button:active {
  transform: scale(0.98);
}
</style>
