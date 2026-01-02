<script setup lang="ts">
import { computed } from 'vue'
import { useWebsitesStore } from '../../stores/websitesStore.ts'
import { useUIStore } from '../../stores/uiStore.ts'
import SearchBar from './SearchBar.vue'

const websitesStore = useWebsitesStore()
const uiStore = useUIStore()

const hasWebsites = computed(() => websitesStore.websites.length > 0)
const isSearching = computed(() => uiStore.searchQuery.length > 0)
const showEditButtons = computed(() => hasWebsites.value && !isSearching.value)

function handleAddWebsite(): void {
  uiStore.openWebsiteForm()
}
</script>

<template>
  <div class="navigation">
    <!-- Left spacer for centering -->
    <div class="spacer"></div>

    <!-- Centered search bar -->
    <SearchBar />

    <!-- Edit Mode Buttons on the right -->
    <div v-if="showEditButtons" class="edit-mode-container">
      <!-- Add Website Button (only visible in edit mode) -->
      <button
        v-show="uiStore.isEditMode"
        class="add-icon-button glass"
        @click="handleAddWebsite"
        aria-label="Add Website"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 4v12M4 10h12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
      </button>

      <!-- Edit/Done Button -->
      <button
        class="edit-mode-button glass"
        :class="{ active: uiStore.isEditMode }"
        @click="uiStore.toggleEditMode"
      >
        {{ uiStore.isEditMode ? 'Done' : 'Edit' }}
      </button>
    </div>

    <!-- Right spacer when no edit buttons -->
    <div v-else class="spacer"></div>
  </div>
</template>

<style scoped>
.navigation {
  position: fixed;
  top: 40px;
  left: 0;
  right: 0;
  z-index: var(--z-dropdown);
  display: grid;
  grid-template-columns: 25% 50% 25%;
  align-items: center;
  padding: 0 32px;
  pointer-events: none;
}

.navigation > * {
  pointer-events: auto;
}

/* Spacer takes up space on left/right to center search bar */
.spacer {
  pointer-events: none;
}

/* Center the search bar in the middle column */
.navigation > :nth-child(2) {
  justify-self: center;
}

/* Edit Mode Container on the right */
.edit-mode-container {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-self: end;
  margin-right: 16px;
}

.edit-mode-button {
  padding: 10px 24px;
  border-radius: 20px;
  font-size: 15px;
  font-weight: 600;
  color: white;
  text-shadow: var(--text-shadow);
  transition: all var(--transition-base);
  box-shadow: var(--glass-shadow);
}

.edit-mode-button:hover {
  transform: scale(1.08);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
}

.edit-mode-button:active {
  transform: scale(0.98);
}

.edit-mode-button.active {
  background: rgba(255, 255, 255, 0.3);
}

/* Add Website Icon Button */
.add-icon-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all var(--transition-base);
  box-shadow: var(--glass-shadow);
}

.add-icon-button:hover {
  transform: scale(1.1);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
}

.add-icon-button:active {
  transform: scale(0.98);
}

@media (max-width: 640px) {
  .navigation {
    top: 20px;
    padding: 0 20px;
    gap: 12px;
  }

  .edit-mode-button {
    padding: 8px 18px;
    font-size: 14px;
  }

  .add-icon-button {
    width: 36px;
    height: 36px;
  }

  .add-icon-button svg {
    width: 18px;
    height: 18px;
  }
}
</style>
