<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useUIStore } from '../../stores/uiStore.ts'
import { useWebsitesStore } from '../../stores/websitesStore.ts'
import { useDebouncedFn } from '../../composables/useDebounce'
import {
  isTagQuery as checkIsTagQuery,
  parseTagQuery,
  findMatchingTag,
  filterTags
} from '../../utils/tagMatching'

const uiStore = useUIStore()
const websitesStore = useWebsitesStore()
const searchInput = ref<HTMLInputElement | null>(null)

// Local search state (immediate for UI responsiveness)
const localSearchQuery = ref(uiStore.searchQuery)

// Tag suggestions state
const showTagSuggestions = ref(false)
const highlightedIndex = ref(-1)
const positionUpdateTrigger = ref(0) // Used to trigger position recalculation
const tagSuggestionsElement = ref<HTMLElement | null>(null)
const dropdownHeight = ref(0)

// Debounced search update to store (reduces re-renders)
const updateSearchQuery = useDebouncedFn((value: string) => {
  uiStore.setSearchQuery(value)
}, 300)

// Detect if user is typing a tag query
const isTagQueryActive = computed(() => {
  return checkIsTagQuery(localSearchQuery.value)
})

// Extract the tag filter part (text after "tag:")
const tagFilterText = computed(() => {
  return parseTagQuery(localSearchQuery.value)
})

// Filter tags based on search query
// Show tag suggestions for ANY search query, not just "tag:" queries
const filteredTagSuggestions = computed(() => {
  const query = localSearchQuery.value.toLowerCase().trim()
  if (!query) return []

  // If already a tag query (starts with "tag:"), use existing logic
  if (isTagQueryActive.value) {
    return filterTags(websitesStore.tags, tagFilterText.value)
  }

  // Otherwise, filter tags by the full query (matches anywhere in tag name)
  return filterTags(websitesStore.tags, query)
})

// Get the selected tag object if a complete tag query is active
const tagQueryResult = computed(() => {
  if (!isTagQueryActive.value) return { tag: null, additionalText: '' }
  return findMatchingTag(tagFilterText.value, websitesStore.tags)
})

const selectedTag = computed(() => tagQueryResult.value.tag)
const additionalSearchText = computed(() => tagQueryResult.value.additionalText)

// Position dropdown below search input (reactive to window resize/scroll)
const suggestionsPosition = computed((): Record<string, string> => {
  // Depend on trigger to recalculate on resize/scroll
  positionUpdateTrigger.value // eslint-disable-line no-unused-expressions

  if (!searchInput.value) return {}

  const rect = searchInput.value.getBoundingClientRect()
  return {
    position: 'fixed',
    top: `${rect.bottom + 8}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`
  }
})

// Update position when window resizes or scrolls
function updateSuggestionsPosition() {
  positionUpdateTrigger.value++
}

function handleInput(e: Event) {
  const value = (e.target as HTMLInputElement).value
  localSearchQuery.value = value

  // Clear preview when user types (they're searching manually now)
  uiStore.clearPreviewTag()

  // Update store with debounce (reduces re-renders in WebsiteGrid)
  updateSearchQuery(value)

  // Show tag suggestions for any non-empty search query (immediate, no debounce for UI)
  if (value.trim().length > 0) {
    showTagSuggestions.value = true
    highlightedIndex.value = -1
  } else {
    showTagSuggestions.value = false
  }
}

function clearSearch() {
  localSearchQuery.value = ''
  uiStore.clearSearch()
  showTagSuggestions.value = false
  highlightedIndex.value = -1
  if (searchInput.value) {
    searchInput.value.focus()
  }
}

function selectTagSuggestion(tag: any) {
  // Autofill search with selected tag
  const newQuery = `tag:${tag.name}`
  localSearchQuery.value = newQuery
  uiStore.setSearchQuery(newQuery)
  showTagSuggestions.value = false
  highlightedIndex.value = -1
  // Clear preview since we've committed the selection
  uiStore.clearPreviewTag()

  // Keep focus on search input
  searchInput.value?.focus()
}

function closeSuggestions() {
  showTagSuggestions.value = false
  highlightedIndex.value = -1
  uiStore.clearPreviewTag()
}

function handleKeydownInSuggestions(e: KeyboardEvent) {
  // Handle keyboard shortcuts first
  if (e.key === '/' && document.activeElement !== searchInput.value) {
    e.preventDefault()
    searchInput.value?.focus()
    return
  }

  // Handle backspace/delete when only a tag is selected (no additional text)
  // If there's additional text, allow normal character deletion
  if ((e.key === 'Backspace' || e.key === 'Delete') && selectedTag.value && !additionalSearchText.value) {
    e.preventDefault()
    clearSearch()
    return
  }

  if (e.key === 'Escape') {
    if (showTagSuggestions.value) {
      e.preventDefault()
      closeSuggestions()
      return
    }
    if (document.activeElement === searchInput.value) {
      clearSearch()
      return
    }
  }

  // Handle suggestion navigation
  const suggestions = filteredTagSuggestions.value
  if (suggestions.length === 0 || !showTagSuggestions.value) return

  switch(e.key) {
    case 'ArrowDown':
      e.preventDefault()
      highlightedIndex.value = Math.min(
        highlightedIndex.value + 1,
        suggestions.length - 1
      )
      // Update preview to show websites for highlighted tag
      if (highlightedIndex.value >= 0) {
        uiStore.setPreviewTag(suggestions[highlightedIndex.value].id)
      }
      break
    case 'ArrowUp':
      e.preventDefault()
      highlightedIndex.value = Math.max(highlightedIndex.value - 1, -1)
      // Update preview to show websites for highlighted tag
      if (highlightedIndex.value >= 0) {
        uiStore.setPreviewTag(suggestions[highlightedIndex.value].id)
      } else {
        uiStore.clearPreviewTag()
      }
      break
    case 'Enter':
      e.preventDefault()
      if (highlightedIndex.value >= 0) {
        selectTagSuggestion(suggestions[highlightedIndex.value])
      }
      break
  }
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  const searchBar = target.closest('.search-bar-container')
  const suggestions = target.closest('.tag-suggestions')

  if (!searchBar && !suggestions) {
    closeSuggestions()
  }
}

// Watch for dropdown visibility and height changes
let resizeObserver: ResizeObserver | null = null

// Update CSS custom property for grid displacement
function updateGridOffset() {
  if (showTagSuggestions.value && dropdownHeight.value > 0) {
    const offset = `${dropdownHeight.value + 16}px`
    document.documentElement.style.setProperty('--dropdown-offset', offset)
    document.documentElement.style.setProperty('--has-dropdown', '1')
  } else {
    document.documentElement.style.setProperty('--dropdown-offset', '0px')
    document.documentElement.style.setProperty('--has-dropdown', '0')
  }
}

function attachObserverToDropdown() {
  const dropdown = document.querySelector('.tag-suggestions')
  if (dropdown && resizeObserver) {
    // Disconnect any previous observations to avoid duplicates
    resizeObserver.disconnect()
    // Observe the new dropdown element
    resizeObserver.observe(dropdown as HTMLElement)
    // Force initial measurement
    const rect = dropdown.getBoundingClientRect()
    dropdownHeight.value = rect.height
    updateGridOffset()
  }
}

// Watch for dropdown visibility to attach/detach observer
watch(showTagSuggestions, async (isVisible) => {
  if (isVisible) {
    // Use nextTick to ensure dropdown is rendered in the DOM
    await nextTick()
    // Add small delay for Teleport to complete
    setTimeout(() => {
      attachObserverToDropdown()
    }, 100)
  } else {
    // Immediately clear offset when dropdown closes
    dropdownHeight.value = 0
    updateGridOffset()
  }
})

// Also watch for dropdown content changes (when filtering changes)
watch(filteredTagSuggestions, async () => {
  if (showTagSuggestions.value) {
    // Dropdown is visible but content changed, reattach observer
    await nextTick()
    setTimeout(() => {
      attachObserverToDropdown()
    }, 50)
  }
})

onMounted(() => {
  window.addEventListener('keydown', handleKeydownInSuggestions)
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', updateSuggestionsPosition)
  window.addEventListener('scroll', updateSuggestionsPosition, true) // Use capture for all scroll events

  // Create ResizeObserver for dropdown height tracking
  resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      dropdownHeight.value = entry.contentRect.height
      updateGridOffset()
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydownInSuggestions)
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', updateSuggestionsPosition)
  window.removeEventListener('scroll', updateSuggestionsPosition, true)

  // Cleanup ResizeObserver
  if (resizeObserver) {
    resizeObserver.disconnect()
  }

  // Reset CSS custom properties
  document.documentElement.style.setProperty('--dropdown-offset', '0px')
  document.documentElement.style.setProperty('--has-dropdown', '0')
})

function openSettings() {
  uiStore.openSettingsModal()
}
</script>

<template>
  <div class="search-bar-container">
    <div class="search-bar glass">
      <svg class="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>

      <div class="search-input-wrapper">
        <input
          ref="searchInput"
          type="text"
          class="search-input"
          :class="{ 'has-tag-pill': selectedTag }"
          placeholder="Search"
          :value="localSearchQuery"
          @input="handleInput"
        />

        <!-- Tag Pill Overlay -->
        <div v-if="selectedTag" class="tag-pill-overlay">
          <span
            class="selected-tag-pill"
            :style="{
              backgroundColor: selectedTag.color + '20',
              borderColor: selectedTag.color
            }"
          >
            {{ selectedTag.name }}
          </span>
          <span v-if="additionalSearchText" class="additional-search-text">
            {{ additionalSearchText }}
          </span>
        </div>
      </div>

      <button
        v-if="localSearchQuery"
        class="clear-button"
        @click="clearSearch"
        aria-label="Clear search"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>

      <button
        class="settings-button"
        @click="openSettings"
        aria-label="Settings"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <!-- iOS-style settings icon -->
          <path d="M10 1.5v2m0 13v2M15.364 4.636l-1.414 1.414m-7.9 7.9l-1.414 1.414M18.5 10h-2m-13 0h-2M15.364 15.364l-1.414-1.414m-7.9-7.9L4.636 4.636" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <circle cx="10" cy="10" r="3" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity="0.15"/>
          <circle cx="10" cy="10" r="1.5" fill="currentColor"/>
        </svg>
      </button>
    </div>

    <!-- Tag Suggestions Dropdown -->
    <Teleport to="body">
      <div
        v-if="showTagSuggestions && filteredTagSuggestions.length > 0"
        class="tag-suggestions"
        :style="suggestionsPosition"
      >
        <div class="suggestions-header">
          <span class="suggestions-title">Categories</span>
          <span class="suggestions-count">
            {{ filteredTagSuggestions.length }}
          </span>
        </div>
        <div class="suggestions-list">
          <button
            v-for="(tag, index) in filteredTagSuggestions"
            :key="tag.id"
            class="suggestion-item"
            :class="{ highlighted: index === highlightedIndex }"
            :style="{ '--tag-hover-bg': tag.color + '12', color: tag.color }"
            @click="selectTagSuggestion(tag)"
            @mouseenter="() => { highlightedIndex = index; uiStore.setPreviewTag(tag.id); }"
          >
            <span
              class="tag-color-dot"
              :style="{ backgroundColor: tag.color }"
            ></span>
            <span class="tag-name">{{ tag.name }}</span>
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.search-bar-container {
  width: 100%;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  height: var(--search-height);
  padding: 0 20px;
  border-radius: var(--search-radius);
  box-shadow: var(--glass-shadow);
  transition: all var(--transition-base);
  flex-wrap: nowrap;
}

.search-bar:focus-within {
  background: rgba(255, 255, 255, 0.25);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
}

.search-icon {
  color: rgba(255, 255, 255, 0.8);
  flex-shrink: 0;
}

.search-input-wrapper {
  flex: 1 1 auto;
  min-width: 0;
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  background: transparent;
  color: white;
  font-size: 16px;
  font-weight: 400;
  outline: none;
}

.search-input.has-tag-pill {
  color: transparent;
  caret-color: white;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.tag-pill-overlay {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  display: flex;
  align-items: center;
  gap: 8px;
}

.selected-tag-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 12px;
  border: 1px solid;
  font-size: 13px;
  font-weight: 500;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  pointer-events: auto;
}

.additional-search-text {
  color: white;
  font-size: 16px;
  font-weight: 400;
  margin-left: 4px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.clear-button,
.settings-button {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.8);
  transition: all var(--transition-fast);
}

.clear-button:hover,
.settings-button:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  transform: scale(1.1);
}

.clear-button:active,
.settings-button:active {
  transform: scale(0.95);
}

@media (max-width: 640px) {
  .search-bar {
    padding: 0 16px;
    gap: 8px;
  }

  .search-input {
    font-size: 15px;
  }
}

/* Tag Suggestions Dropdown */
.tag-suggestions {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(30px) saturate(1.8);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 14px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12),
              0 2px 8px rgba(0, 0, 0, 0.08);
  max-height: 360px;
  overflow: hidden;
  z-index: 2000;
  display: flex;
  flex-direction: column;

  /* Entrance animation with spring physics */
  animation: dropdownEnter 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-origin: top center;
}

@keyframes dropdownEnter {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Exit animation when closing */
.tag-suggestions.closing {
  animation: dropdownExit 150ms ease-out forwards;
}

@keyframes dropdownExit {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(-4px) scale(0.98);
  }
}

.suggestions-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.suggestions-title {
  font-size: 11px;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.suggestions-count {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.4);
}

.suggestions-list {
  overflow-y: auto;
  padding: 4px;
}

.suggestion-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  border-radius: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 150ms cubic-bezier(0.34, 1.56, 0.64, 1);
  text-align: left;
  position: relative;
}

.suggestion-item::before {
  content: '';
  position: absolute;
  inset: 4px;
  border-radius: 8px;
  background: var(--tag-hover-bg, rgba(0, 122, 255, 0.08));
  opacity: 0;
  transition: opacity 150ms ease-out;
  z-index: -1;
}

.suggestion-item:hover::before,
.suggestion-item.highlighted::before {
  opacity: 1;
}

.tag-color-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  flex-shrink: 0;
  transition: transform 150ms cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 150ms ease-out;
}

.suggestion-item:hover .tag-color-dot,
.suggestion-item.highlighted .tag-color-dot {
  transform: scale(1.15);
  box-shadow: 0 0 12px currentColor, 0 0 4px currentColor;
}

.tag-name {
  font-size: 15px;
  color: rgba(0, 0, 0, 0.95);
  font-weight: 500;
  letter-spacing: -0.2px;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .tag-suggestions {
    background: rgba(28, 28, 30, 0.85);
    backdrop-filter: blur(30px) saturate(1.8);
    border-color: rgba(255, 255, 255, 0.08);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4),
                0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .suggestions-header {
    border-bottom-color: rgba(255, 255, 255, 0.08);
  }

  .suggestions-title {
    color: rgba(255, 255, 255, 0.5);
  }

  .suggestions-count {
    color: rgba(255, 255, 255, 0.4);
  }

  .suggestion-item::before {
    background: var(--tag-hover-bg, rgba(10, 132, 255, 0.15));
  }

  .tag-name {
    color: rgba(255, 255, 255, 0.95);
  }
}
</style>
