<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useUIStore } from '../../stores/uiStore.ts'
import { useWebsitesStore } from '../../stores/websitesStore.ts'

const uiStore = useUIStore()
const websitesStore = useWebsitesStore()
const searchInput = ref(null)

// Tag suggestions state
const showTagSuggestions = ref(false)
const highlightedIndex = ref(-1)
const positionUpdateTrigger = ref(0) // Used to trigger position recalculation

// Detect if user is typing a tag query
const isTagQuery = computed(() => {
  const query = uiStore.searchQuery.toLowerCase().trim()
  return query.startsWith('tag:')
})

// Extract the tag filter part (text after "tag:")
const tagFilterText = computed(() => {
  if (!isTagQuery.value) return ''
  return uiStore.searchQuery.slice(4).toLowerCase().trim()
})

// Filter tags based on text after "tag:"
const filteredTagSuggestions = computed(() => {
  if (!isTagQuery.value) return []

  const filterText = tagFilterText.value
  const allTags = websitesStore.tags

  if (!filterText) {
    // Show all tags when just "tag:" is typed
    return allTags
  }

  // Filter tags by name
  return allTags.filter(tag =>
    tag.name.toLowerCase().includes(filterText)
  )
})

// Get the selected tag object if a complete tag query is active
const selectedTag = computed(() => {
  if (!isTagQuery.value) return null

  const afterTag = tagFilterText.value
  if (!afterTag) return null

  // Try to find the longest matching tag at the start of the text
  // This handles both "tag:work github" and "tag:workgithub"
  let matchedTag = null
  let maxLength = 0

  for (const tag of websitesStore.tags) {
    const tagNameLower = tag.name.toLowerCase()
    const afterTagLower = afterTag.toLowerCase()

    // Check if the text starts with this tag name
    if (afterTagLower.startsWith(tagNameLower)) {
      // Keep the longest match
      if (tagNameLower.length > maxLength) {
        matchedTag = tag
        maxLength = tagNameLower.length
      }
    }
  }

  return matchedTag
})

// Get additional search text after the tag
const additionalSearchText = computed(() => {
  if (!selectedTag.value) return ''

  const afterTag = tagFilterText.value
  const tagNameLength = selectedTag.value.name.length

  // Return everything after the matched tag name
  const remaining = afterTag.slice(tagNameLength).trim()
  return remaining
})

// Position dropdown below search input (reactive to window resize/scroll)
const suggestionsPosition = computed(() => {
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

function handleInput(e) {
  const value = e.target.value
  uiStore.setSearchQuery(value)

  // Show tag suggestions if typing "tag:"
  if (value.toLowerCase().startsWith('tag:')) {
    showTagSuggestions.value = true
    highlightedIndex.value = -1
  } else {
    showTagSuggestions.value = false
  }
}

function clearSearch() {
  uiStore.clearSearch()
  showTagSuggestions.value = false
  highlightedIndex.value = -1
  if (searchInput.value) {
    searchInput.value.focus()
  }
}

function selectTagSuggestion(tag) {
  // Autofill search with selected tag
  uiStore.setSearchQuery(`tag:${tag.name}`)
  showTagSuggestions.value = false
  highlightedIndex.value = -1

  // Keep focus on search input
  searchInput.value?.focus()
}

function closeSuggestions() {
  showTagSuggestions.value = false
  highlightedIndex.value = -1
}

function handleKeydownInSuggestions(e) {
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
      break
    case 'ArrowUp':
      e.preventDefault()
      highlightedIndex.value = Math.max(highlightedIndex.value - 1, -1)
      break
    case 'Enter':
      e.preventDefault()
      if (highlightedIndex.value >= 0) {
        selectTagSuggestion(suggestions[highlightedIndex.value])
      }
      break
  }
}

function handleClickOutside(event) {
  const searchBar = event.target.closest('.search-bar-container')
  const suggestions = event.target.closest('.tag-suggestions')

  if (!searchBar && !suggestions) {
    closeSuggestions()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydownInSuggestions)
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', updateSuggestionsPosition)
  window.addEventListener('scroll', updateSuggestionsPosition, true) // Use capture for all scroll events
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydownInSuggestions)
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', updateSuggestionsPosition)
  window.removeEventListener('scroll', updateSuggestionsPosition, true)
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
          :value="uiStore.searchQuery"
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
        v-if="uiStore.searchQuery"
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
          <span class="suggestions-title">Tags</span>
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
            @click="selectTagSuggestion(tag)"
            @mouseenter="highlightedIndex = index"
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
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  max-height: 320px;
  overflow: hidden;
  z-index: 2000;
  display: flex;
  flex-direction: column;
}

.suggestions-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.suggestions-title {
  font-size: 13px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
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
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
}

.suggestion-item:hover,
.suggestion-item.highlighted {
  background: rgba(0, 122, 255, 0.1);
}

.tag-color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.tag-name {
  font-size: 15px;
  color: rgba(0, 0, 0, 0.9);
  font-weight: 500;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .tag-suggestions {
    background: rgba(28, 28, 30, 0.95);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .suggestions-header {
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }

  .suggestions-title {
    color: rgba(255, 255, 255, 0.6);
  }

  .suggestions-count {
    color: rgba(255, 255, 255, 0.4);
  }

  .suggestion-item:hover,
  .suggestion-item.highlighted {
    background: rgba(10, 132, 255, 0.2);
  }

  .tag-name {
    color: rgba(255, 255, 255, 0.9);
  }
}
</style>
