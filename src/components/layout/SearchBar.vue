<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useUIStore } from '../../stores/uiStore'

const uiStore = useUIStore()
const searchInput = ref(null)

function handleInput(e) {
  uiStore.setSearchQuery(e.target.value)
}

function clearSearch() {
  uiStore.clearSearch()
  if (searchInput.value) {
    searchInput.value.focus()
  }
}

function handleKeydown(e) {
  // Focus search on "/" key (like Spotlight)
  if (e.key === '/' && document.activeElement !== searchInput.value) {
    e.preventDefault()
    searchInput.value?.focus()
  }
  // Clear search on Escape
  if (e.key === 'Escape' && document.activeElement === searchInput.value) {
    clearSearch()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
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

      <input
        ref="searchInput"
        type="text"
        class="search-input"
        placeholder="Search"
        :value="uiStore.searchQuery"
        @input="handleInput"
      />

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
          <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" stroke="currentColor" stroke-width="1.5"/>
          <path d="M10 1v2m0 14v2M4.22 4.22l1.42 1.42m8.48 8.48l1.42 1.42M1 10h2m14 0h2M4.22 15.78l1.42-1.42m8.48-8.48l1.42-1.42" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.search-bar-container {
  position: fixed;
  top: 40px;
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--z-dropdown);
  width: var(--search-width);
  max-width: 90vw;
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
}

.search-bar:focus-within {
  background: rgba(255, 255, 255, 0.25);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
}

.search-icon {
  color: rgba(255, 255, 255, 0.8);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  background: transparent;
  color: white;
  font-size: 16px;
  font-weight: 400;
  outline: none;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
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
  .search-bar-container {
    top: 20px;
  }

  .search-bar {
    padding: 0 16px;
    gap: 8px;
  }

  .search-input {
    font-size: 15px;
  }
}
</style>
