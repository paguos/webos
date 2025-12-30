<script setup>
import { onMounted } from 'vue'
import { useWebsitesStore } from './stores/websitesStore'
import LaunchpadContainer from './components/layout/LaunchpadContainer.vue'
import WebsiteForm from './components/crud/WebsiteForm.vue'
import ConfirmDialog from './components/crud/ConfirmDialog.vue'
import SettingsModal from './components/crud/SettingsModal.vue'

const websitesStore = useWebsitesStore()

onMounted(() => {
  // Initialize data from localStorage
  websitesStore.initializeData()
})
</script>

<template>
  <div id="browseros-app">
    <LaunchpadContainer />

    <!-- Global Modals -->
    <WebsiteForm />
    <ConfirmDialog />
    <SettingsModal />
  </div>
</template>

<style scoped>
#browseros-app {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}
</style>
