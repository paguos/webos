<script setup>
import { computed } from 'vue'
import { useWebsitesStore } from '../../stores/websitesStore'
import SearchBar from './SearchBar.vue'
import WebsiteGrid from '../grid/WebsiteGrid.vue'
import PaginationDots from './PaginationDots.vue'

const websitesStore = useWebsitesStore()

const backgroundStyle = computed(() => {
  const wallpaperUrl = websitesStore.settings.wallpaperUrl

  // If wallpaper is set, use it as background
  if (wallpaperUrl && wallpaperUrl.trim()) {
    return {
      backgroundImage: `url(${wallpaperUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }
  }

  // Otherwise use gradient
  const gradient = websitesStore.settings.background.gradient
  const colors = gradient.colors.join(', ')
  return {
    background: `linear-gradient(${gradient.angle}deg, ${colors})`
  }
})
</script>

<template>
  <div class="launchpad-container" :style="backgroundStyle">
    <SearchBar />
    <WebsiteGrid />
    <PaginationDots v-if="websitesStore.totalPages > 1" />
  </div>
</template>

<style scoped>
.launchpad-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
