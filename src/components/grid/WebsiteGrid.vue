<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useWebsitesStore } from '../../stores/websitesStore.ts'
import { useUIStore } from '../../stores/uiStore.ts'
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

  // Check if this is a tag query
  if (query.startsWith('tag:')) {
    const afterTag = query.slice(4).trim()

    if (!afterTag) {
      // Just "tag:" typed - show all websites
      return currentPageSites
    }

    // Try to find the longest matching tag at the start of the text
    // This handles both "tag:work github" and "tag:workgithub"
    let matchingTag = null
    let maxLength = 0

    for (const tag of websitesStore.tags) {
      const tagNameLower = tag.name.toLowerCase()
      const afterTagLower = afterTag.toLowerCase()

      // Check if the text starts with this tag name
      if (afterTagLower.startsWith(tagNameLower)) {
        // Keep the longest match
        if (tagNameLower.length > maxLength) {
          matchingTag = tag
          maxLength = tagNameLower.length
        }
      }
    }

    if (!matchingTag) {
      // Tag doesn't exist - show no results
      return []
    }

    // Filter websites that have this tag
    let results = currentPageSites.filter(website =>
      website.tagIds && website.tagIds.includes(matchingTag.id)
    )

    // Get additional search text after the matched tag name
    const additionalSearch = afterTag.slice(maxLength).trim()

    // If there's additional search text, filter by website name
    if (additionalSearch) {
      results = results.filter(website =>
        website.name.toLowerCase().includes(additionalSearch.toLowerCase())
      )
    }

    return results
  }

  // Regular substring search by name only
  return currentPageSites.filter(website => {
    return website.name.toLowerCase().includes(query)
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

/* Enable smooth reflow for all grid items with iOS-style spring physics */
.website-grid > * {
  transition: transform var(--reflow-duration-base) var(--spring-responsive),
              opacity var(--transition-fast),
              scale var(--reflow-duration-base) var(--spring-bouncy);
  will-change: transform, scale;
}

/* Subtle pulse effect during reflow (respects prefers-reduced-motion) */
@media (prefers-reduced-motion: no-preference) {
  .website-grid > * {
    animation: subtlePulse var(--reflow-duration-base) var(--spring-responsive);
    animation-play-state: paused;
  }

  /* Trigger animation on reflow (when grid changes) */
  .website-grid > *:hover {
    animation-play-state: running;
  }
}

@keyframes subtlePulse {
  0% {
    scale: 1;
  }
  30% {
    scale: 1.02;
  }
  100% {
    scale: 1;
  }
}

/* Progressive stagger based on grid position for organic cascade effect */
.website-grid > *:nth-child(1) { transition-delay: 0ms; }
.website-grid > *:nth-child(2) { transition-delay: 30ms; }
.website-grid > *:nth-child(3) { transition-delay: 60ms; }
.website-grid > *:nth-child(4) { transition-delay: 90ms; }
.website-grid > *:nth-child(5) { transition-delay: 120ms; }
.website-grid > *:nth-child(6) { transition-delay: 150ms; }
.website-grid > *:nth-child(7) { transition-delay: 180ms; }
.website-grid > *:nth-child(8) { transition-delay: 210ms; }
.website-grid > *:nth-child(9) { transition-delay: 240ms; }
.website-grid > *:nth-child(10) { transition-delay: 270ms; }
.website-grid > *:nth-child(11) { transition-delay: 300ms; }
.website-grid > *:nth-child(12) { transition-delay: 330ms; }
.website-grid > *:nth-child(13) { transition-delay: 360ms; }
.website-grid > *:nth-child(14) { transition-delay: 390ms; }
.website-grid > *:nth-child(15) { transition-delay: 420ms; }
.website-grid > *:nth-child(16) { transition-delay: 450ms; }
.website-grid > *:nth-child(17) { transition-delay: 480ms; }
.website-grid > *:nth-child(18) { transition-delay: 510ms; }
.website-grid > *:nth-child(19) { transition-delay: 540ms; }
.website-grid > *:nth-child(20) { transition-delay: 570ms; }

/* Cap stagger delay for items beyond 20 */
.website-grid > *:nth-child(n+21) {
  transition-delay: 600ms;
}

/* Responsive spring intensity - adjust based on viewport size */
/* Desktop: More columns changing (7→5) = stronger spring effect */
@media (min-width: 1025px) {
  .website-grid > * {
    transition: transform var(--reflow-duration-base) var(--spring-responsive),
                opacity var(--transition-fast),
                scale var(--reflow-duration-base) var(--spring-bouncy);
  }
}

/* Tablet: Medium spring for moderate column changes (5→4) */
@media (max-width: 1024px) and (min-width: 769px) {
  .website-grid > * {
    transition: transform calc(var(--reflow-duration-base) * 0.9) var(--spring-smooth),
                opacity var(--transition-fast),
                scale calc(var(--reflow-duration-base) * 0.9) var(--spring-bouncy);
  }
}

/* Mobile: Gentle spring for small column changes (4→3) */
@media (max-width: 768px) {
  .website-grid > * {
    transition: transform calc(var(--reflow-duration-base) * 0.8) var(--spring-gentle),
                opacity var(--transition-fast),
                scale calc(var(--reflow-duration-base) * 0.8) var(--spring-smooth);
  }
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
