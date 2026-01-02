<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { useWebsitesStore } from '../../../stores/websitesStore'
import { useUIStore } from '../../../stores/uiStore'
import type { Tag } from '../../../types'

interface Props {
  selectedTagIds: string[]
}

interface Emits {
  (e: 'update:selectedTagIds', value: string[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const websitesStore = useWebsitesStore()
const uiStore = useUIStore()

const showTagsDropdown = ref(false)
const tagSearchQuery = ref('')
const tagSearchInput = ref<HTMLInputElement | null>(null)

const filteredTags = computed<Tag[]>(() => {
  if (!tagSearchQuery.value) {
    return websitesStore.tags
  }
  const query = tagSearchQuery.value.toLowerCase()
  return websitesStore.tags.filter(tag =>
    tag.name.toLowerCase().includes(query)
  )
})

function toggleTagsDropdown() {
  showTagsDropdown.value = !showTagsDropdown.value
  if (showTagsDropdown.value) {
    nextTick(() => {
      tagSearchInput.value?.focus()
    })
  } else {
    tagSearchQuery.value = ''
  }
}

function toggleTag(tagId: string) {
  const newTagIds = props.selectedTagIds.includes(tagId)
    ? props.selectedTagIds.filter(id => id !== tagId)
    : [...props.selectedTagIds, tagId]
  emit('update:selectedTagIds', newTagIds)
}

function removeTag(tagId: string) {
  const newTagIds = props.selectedTagIds.filter(id => id !== tagId)
  emit('update:selectedTagIds', newTagIds)
}

function openTagManager() {
  uiStore.openTagManager()
  closeTagsDropdown()
}

function closeTagsDropdown() {
  showTagsDropdown.value = false
  tagSearchQuery.value = ''
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  const dropdownEl = target.closest('.tags-dropdown')
  const triggerEl = target.closest('.tags-dropdown-trigger')

  if (showTagsDropdown.value && !dropdownEl && !triggerEl) {
    closeTagsDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="form-group tags-form-group">
    <label class="form-label">Tags</label>

    <!-- Trigger Button -->
    <button
      type="button"
      class="tags-dropdown-trigger"
      @click="toggleTagsDropdown"
    >
      <span v-if="selectedTagIds.length === 0" class="placeholder">
        Add tags...
      </span>
      <span v-else class="tag-count">
        {{ selectedTagIds.length }} tag{{ selectedTagIds.length !== 1 ? 's' : '' }} selected
      </span>
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        class="chevron-icon"
        :class="{ rotated: showTagsDropdown }"
      >
        <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <!-- Dropdown -->
    <div v-if="showTagsDropdown" class="tags-dropdown">
      <!-- Search Box -->
      <div class="dropdown-search">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="search-icon">
          <path d="M7 12.5C10.0376 12.5 12.5 10.0376 12.5 7C12.5 3.96243 10.0376 1.5 7 1.5C3.96243 1.5 1.5 3.96243 1.5 7C1.5 10.0376 3.96243 12.5 7 12.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M14.5 14.5L11 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <input
          ref="tagSearchInput"
          v-model="tagSearchQuery"
          type="text"
          placeholder="Search tags..."
          class="search-input"
        />
      </div>

      <!-- Tags List -->
      <div class="tags-list">
        <div v-if="filteredTags.length === 0" class="no-results">
          {{ tagSearchQuery ? 'No tags found' : 'No tags available' }}
        </div>
        <button
          v-for="tag in filteredTags"
          :key="tag.id"
          type="button"
          class="tag-item"
          :class="{ selected: selectedTagIds.includes(tag.id) }"
          @click="toggleTag(tag.id)"
        >
          <span class="checkmark">{{ selectedTagIds.includes(tag.id) ? '✓' : '' }}</span>
          <span class="tag-color-dot" :style="{ backgroundColor: tag.color }"></span>
          <span class="tag-name">{{ tag.name }}</span>
        </button>
      </div>

      <!-- Create New Tag -->
      <div class="dropdown-footer">
        <button
          type="button"
          class="create-tag-button"
          @click="openTagManager"
        >
          + Create new tag
        </button>
      </div>
    </div>

    <!-- Selected Tags Pills -->
    <div v-if="selectedTagIds.length > 0" class="selected-tags">
      <span>Selected: </span>
      <span
        v-for="tagId in selectedTagIds"
        :key="tagId"
        class="selected-tag-pill"
        :style="{
          backgroundColor: websitesStore.tags.find(t => t.id === tagId)?.color + '20',
          borderColor: websitesStore.tags.find(t => t.id === tagId)?.color
        }"
      >
        {{ websitesStore.tags.find(t => t.id === tagId)?.name }}
        <button
          type="button"
          @click="removeTag(tagId)"
          class="remove-tag-btn"
        >
          ×
        </button>
      </span>
    </div>
  </div>
</template>

<style scoped>
.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.8);
  margin-bottom: 8px;
}

.tags-form-group {
  position: relative;
}

.tags-dropdown-trigger {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  background: white;
  color: rgba(0, 0, 0, 0.9);
  font-size: 15px;
  text-align: left;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.tags-dropdown-trigger:hover {
  border-color: #007AFF;
  background: rgba(0, 122, 255, 0.02);
}

.tags-dropdown-trigger .placeholder {
  color: rgba(0, 0, 0, 0.4);
}

.chevron-icon {
  flex-shrink: 0;
  transition: transform var(--transition-fast);
  color: rgba(0, 0, 0, 0.5);
}

.chevron-icon.rotated {
  transform: rotate(180deg);
}

.tags-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 320px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dropdown-search {
  padding: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-icon {
  flex-shrink: 0;
  color: rgba(0, 0, 0, 0.4);
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.9);
  background: transparent;
}

.search-input::placeholder {
  color: rgba(0, 0, 0, 0.4);
}

.tags-list {
  flex: 1;
  overflow-y: auto;
  padding: 4px;
}

.no-results {
  padding: 24px;
  text-align: center;
  color: rgba(0, 0, 0, 0.5);
  font-size: 14px;
}

.tag-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 6px;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
  font-family: inherit;
}

.tag-item:hover {
  background: rgba(0, 122, 255, 0.05);
}

.tag-item.selected {
  background: rgba(0, 122, 255, 0.1);
}

.checkmark {
  width: 16px;
  font-size: 14px;
  color: #007AFF;
  font-weight: 600;
  flex-shrink: 0;
}

.tag-color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.tag-name {
  flex: 1;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.9);
}

.dropdown-footer {
  padding: 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.create-tag-button {
  width: 100%;
  padding: 8px 12px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #007AFF;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
  font-family: inherit;
}

.create-tag-button:hover {
  background: rgba(0, 122, 255, 0.05);
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 8px;
  font-size: 13px;
  color: rgba(0, 0, 0, 0.7);
}

.selected-tag-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px 4px 10px;
  border-radius: 12px;
  border: 1px solid;
  font-size: 12px;
  font-weight: 500;
}

.remove-tag-btn {
  background: none;
  border: none;
  color: inherit;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  margin-left: 2px;
}

.remove-tag-btn:hover {
  opacity: 0.7;
}

@media (prefers-color-scheme: dark) {
  .form-label {
    color: rgba(255, 255, 255, 0.8);
  }

  .tags-dropdown-trigger {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.15);
    color: rgba(255, 255, 255, 0.9);
  }

  .tags-dropdown-trigger:hover {
    border-color: #0A84FF;
    background: rgba(10, 132, 255, 0.1);
  }

  .tags-dropdown-trigger .placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  .chevron-icon {
    color: rgba(255, 255, 255, 0.5);
  }

  .tags-dropdown {
    background: rgba(30, 30, 30, 0.95);
    backdrop-filter: blur(20px);
    border-color: rgba(255, 255, 255, 0.15);
  }

  .dropdown-search {
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }

  .search-icon {
    color: rgba(255, 255, 255, 0.4);
  }

  .search-input {
    color: rgba(255, 255, 255, 0.9);
  }

  .search-input::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  .no-results {
    color: rgba(255, 255, 255, 0.5);
  }

  .tag-item:hover {
    background: rgba(10, 132, 255, 0.15);
  }

  .tag-item.selected {
    background: rgba(10, 132, 255, 0.2);
  }

  .checkmark {
    color: #0A84FF;
  }

  .tag-name {
    color: rgba(255, 255, 255, 0.9);
  }

  .dropdown-footer {
    border-top-color: rgba(255, 255, 255, 0.1);
  }

  .create-tag-button {
    color: #0A84FF;
  }

  .create-tag-button:hover {
    background: rgba(10, 132, 255, 0.15);
  }

  .selected-tags {
    background: rgba(255, 255, 255, 0.03);
    color: rgba(255, 255, 255, 0.7);
  }
}
</style>
