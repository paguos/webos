<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useWebsitesStore } from '../../stores/websitesStore'
import { useUIStore } from '../../stores/uiStore'
import draggable from 'vuedraggable'
import WebsiteIcon from './WebsiteIcon.vue'

const websitesStore = useWebsitesStore()
const uiStore = useUIStore()

// Drag state
const dragOptions = computed(() => ({
  animation: 300, // Smooth iOS-like animation
  delay: 0, // No delay since we handle long press separately
  delayOnTouchOnly: false,
  touchStartThreshold: 5,
  forceFallback: false,
  disabled: !uiStore.isEditMode || isSearching.value,
  ghostClass: 'ghost',
  dragClass: 'drag',
  chosenClass: 'chosen'
}))

// Use a local ref for draggable to work properly
const localWebsites = computed({
  get() {
    return filteredWebsites.value
  },
  set(value) {
    // Trigger spring-synchronized haptic on drop
    triggerHaptic('dragEnd')

    // Update positions when drag ends
    const currentPage = websitesStore.currentPage
    const newPositions = value.map((website, index) => ({
      id: website.id,
      page: currentPage,
      order: index
    }))
    websitesStore.updateWebsitePositions(newPositions)
  }
})

const filteredWebsites = computed(() => {
  const query = uiStore.searchQuery.toLowerCase().trim()
  const currentPageSites = websitesStore.currentPageWebsites

  if (!query) {
    return currentPageSites
  }

  // Filter by name or URL
  return currentPageSites.filter(website => {
    return (
      website.name.toLowerCase().includes(query) ||
      website.url.toLowerCase().includes(query)
    )
  })
})

const hasResults = computed(() => filteredWebsites.value.length > 0)
const isSearching = computed(() => uiStore.searchQuery.length > 0)

function triggerHaptic(style = 'medium') {
  if ('vibrate' in navigator) {
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30],
      selection: [10, 50, 10],
      dragStart: [15],
      dragEnd: [10, 40, 10]
    }
    navigator.vibrate(patterns[style] || patterns.medium)
  }
}

// Handle escape key to exit edit mode
function handleKeydown(e) {
  if (e.key === 'Escape' && uiStore.isEditMode) {
    uiStore.exitEditMode()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="grid-container">
    <draggable
      v-if="hasResults"
      v-model="localWebsites"
      class="website-grid"
      :animation="350"
      :disabled="!uiStore.isEditMode || isSearching"
      ghost-class="ghost"
      drag-class="drag"
      chosen-class="chosen"
      :force-fallback="true"
      item-key="id"
      @start="() => { triggerHaptic('dragStart'); console.log('Drag started') }"
      @end="() => console.log('Drag ended')"
    >
      <template #item="{ element, index }">
        <WebsiteIcon
          :website="element"
          :class="[
            `fade-in stagger-${Math.min(index + 1, 10)}`,
            { wiggle: uiStore.isEditMode }
          ]"
          :is-edit-mode="uiStore.isEditMode"
        />
      </template>
    </draggable>

    <div v-else-if="isSearching" class="empty-state">
      <svg class="empty-icon" width="64" height="64" viewBox="0 0 64 64" fill="none">
        <circle cx="24" cy="24" r="18" stroke="currentColor" stroke-width="3"/>
        <path d="M38 38l18 18" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
        <path d="M18 24h12M24 18v12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <h2 class="empty-title">No Results</h2>
      <p class="empty-message">Try a different search term</p>
    </div>

    <div v-else class="empty-state">
      <svg class="empty-icon" width="64" height="64" viewBox="0 0 64 64" fill="none">
        <rect x="8" y="8" width="48" height="48" rx="12" stroke="currentColor" stroke-width="3"/>
        <path d="M32 24v16M24 32h16" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
      </svg>
      <h2 class="empty-title">No Websites Yet</h2>
      <p class="empty-message">Add your first website to get started</p>
      <button class="add-button glass" @click="handleAddWebsite">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 4v12M4 10h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        Add Website
      </button>
    </div>
  </div>
</template>

<style scoped>
.grid-container {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: var(--grid-padding);
  padding-top: 140px;
  padding-bottom: 100px;
  overflow-x: hidden;
  overflow-y: auto;
}

.website-grid {
  display: grid;
  grid-template-columns: repeat(var(--grid-columns), var(--icon-size));
  gap: var(--grid-gap);
  justify-content: center;
  align-content: start;
  max-width: 100%;
}

/* Enable smooth reflow for all grid items */
.website-grid > * {
  transition: transform var(--transition-icon-reflow),
              opacity var(--transition-fast);
  will-change: transform;
}

/* iOS-style Draggable states */
.website-grid :deep(.ghost) {
  opacity: 0.2;
  transform: scale(0.95);
  transition: opacity 0.15s ease-out, transform 0.15s ease-out;
}

.website-grid :deep(.drag) {
  transform: scale(1.1);
  opacity: 1;
  z-index: var(--z-modal);
  filter: drop-shadow(0 20px 50px rgba(0, 0, 0, 0.4));
  cursor: grabbing !important;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
              filter 0.2s ease-out;
}

.website-grid :deep(.chosen) {
  transform: scale(1.05);
  filter: drop-shadow(0 15px 40px rgba(0, 0, 0, 0.35));
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
              filter 0.2s ease-out;
}

/* Prevent transition conflicts during wiggle */
.website-grid :deep(.wiggle):not(.drag):not(.ghost):not(.chosen) {
  transition: none;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-lg);
  text-align: center;
  max-width: 400px;
  padding: var(--spacing-2xl);
}

.empty-icon {
  color: rgba(255, 255, 255, 0.6);
  animation: pulse 2s ease-in-out infinite;
}

.empty-title {
  font-size: 32px;
  font-weight: 600;
  color: white;
  text-shadow: var(--text-shadow);
  margin: 0;
}

.empty-message {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
  text-shadow: var(--text-shadow);
  margin: 0;
}

.add-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  color: white;
  text-shadow: var(--text-shadow);
  transition: all var(--transition-bounce);
  margin-top: var(--spacing-md);
}

.add-button:hover {
  transform: scale(1.05);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
}

.add-button:active {
  transform: scale(0.98);
}

@media (max-width: 1024px) {
  .grid-container {
    padding-top: 140px;
    padding-bottom: 80px;
  }
}

@media (max-width: 640px) {
  .grid-container {
    padding-top: 110px;
    padding-bottom: 70px;
  }

  .empty-title {
    font-size: 24px;
  }

  .empty-message {
    font-size: 16px;
  }
}
</style>
