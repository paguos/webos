<script setup>
import { ref, watch, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { useWebsitesStore } from '../../stores/websitesStore'
import { useUIStore } from '../../stores/uiStore'
import { isValidUrl, isValidName, normalizeUrl } from '../../utils/validators'

const websitesStore = useWebsitesStore()
const uiStore = useUIStore()

const formData = ref({
  name: '',
  url: '',
  tagIds: [],
  customIcon: '',
  iconZoom: 1,
  iconBackgroundColor: 'transparent'
})

const errors = ref({
  name: '',
  url: ''
})

const showTagsDropdown = ref(false)
const tagSearchQuery = ref('')
const tagSearchInput = ref(null)

const isEditing = computed(() => !!uiStore.editingWebsite)

const filteredTags = computed(() => {
  if (!tagSearchQuery.value) {
    return websitesStore.tags
  }
  const query = tagSearchQuery.value.toLowerCase()
  return websitesStore.tags.filter(tag =>
    tag.name.toLowerCase().includes(query)
  )
})

// Watch for editing website changes
watch(() => uiStore.editingWebsite, (website) => {
  if (website) {
    formData.value = {
      name: website.name,
      url: website.url,
      tagIds: website.tagIds || [],
      customIcon: website.customIcon || '',
      iconZoom: website.iconZoom || 1,
      iconBackgroundColor: website.iconBackgroundColor || 'transparent'
    }
  } else {
    resetForm()
  }
}, { immediate: true })

function resetForm() {
  formData.value = {
    name: '',
    url: '',
    tagIds: [],
    customIcon: '',
    iconZoom: 1,
    iconBackgroundColor: 'transparent'
  }
  errors.value = {
    name: '',
    url: ''
  }
}

function validate() {
  errors.value = {
    name: '',
    url: ''
  }

  let isValid = true

  if (!isValidName(formData.value.name)) {
    errors.value.name = 'Name is required (max 50 characters)'
    isValid = false
  }

  if (!isValidUrl(normalizeUrl(formData.value.url))) {
    errors.value.url = 'Please enter a valid URL'
    isValid = false
  }

  return isValid
}

function handleSubmit() {
  if (!validate()) {
    return
  }

  if (isEditing.value) {
    // Update existing website
    websitesStore.updateWebsite(uiStore.editingWebsite.id, {
      name: formData.value.name.trim(),
      url: normalizeUrl(formData.value.url),
      tagIds: formData.value.tagIds || [],
      customIcon: formData.value.customIcon || null,
      iconZoom: formData.value.iconZoom,
      iconBackgroundColor: formData.value.iconBackgroundColor
    })
  } else {
    // Add new website
    const website = websitesStore.addWebsite(
      formData.value.name.trim(),
      formData.value.url,
      formData.value.tagIds || [],
      websitesStore.currentPage
    )
    // Update custom properties if different from defaults
    if (formData.value.customIcon || formData.value.iconZoom !== 1 || formData.value.iconBackgroundColor !== 'transparent') {
      websitesStore.updateWebsite(website.id, {
        customIcon: formData.value.customIcon || null,
        iconZoom: formData.value.iconZoom,
        iconBackgroundColor: formData.value.iconBackgroundColor
      })
    }
  }

  uiStore.closeWebsiteForm()
  resetForm()
}

function removeTag(tagId) {
  formData.value.tagIds = formData.value.tagIds.filter(id => id !== tagId)
}

function openTagManager() {
  uiStore.openTagManager()
  closeTagsDropdown()
}

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

function toggleTag(tagId) {
  if (formData.value.tagIds.includes(tagId)) {
    formData.value.tagIds = formData.value.tagIds.filter(id => id !== tagId)
  } else {
    formData.value.tagIds.push(tagId)
  }
}

function closeTagsDropdown() {
  showTagsDropdown.value = false
  tagSearchQuery.value = ''
}

function handleClickOutside(event) {
  const dropdownEl = event.target.closest('.tags-dropdown')
  const triggerEl = event.target.closest('.tags-dropdown-trigger')

  if (showTagsDropdown.value && !dropdownEl && !triggerEl) {
    closeTagsDropdown()
  }
}

function handleCancel() {
  uiStore.closeWebsiteForm()
  resetForm()
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <Teleport to="body">
    <div v-if="uiStore.showWebsiteForm" class="overlay" @click="handleCancel">
      <div class="modal website-form modal-instant" @click.stop>
        <h2 class="form-title">{{ isEditing ? 'Edit Website' : 'Add Website' }}</h2>

        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="website-name" class="form-label">Name</label>
            <input
              id="website-name"
              v-model="formData.name"
              type="text"
              class="form-input"
              :class="{ error: errors.name }"
              placeholder="e.g., GitHub"
              maxlength="50"
            />
            <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
          </div>

          <div class="form-group">
            <label for="website-url" class="form-label">URL</label>
            <input
              id="website-url"
              v-model="formData.url"
              type="text"
              class="form-input"
              :class="{ error: errors.url }"
              placeholder="e.g., https://github.com"
            />
            <span v-if="errors.url" class="error-message">{{ errors.url }}</span>
          </div>

          <div class="form-group tags-form-group">
            <label class="form-label">
              Tags
            </label>

            <!-- Trigger Button -->
            <button
              type="button"
              class="tags-dropdown-trigger"
              @click="toggleTagsDropdown"
            >
              <span v-if="formData.tagIds.length === 0" class="placeholder">
                Add tags...
              </span>
              <span v-else class="tag-count">
                {{ formData.tagIds.length }} tag{{ formData.tagIds.length !== 1 ? 's' : '' }} selected
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
                  :class="{ selected: formData.tagIds.includes(tag.id) }"
                  @click="toggleTag(tag.id)"
                >
                  <span class="checkmark">{{ formData.tagIds.includes(tag.id) ? '✓' : '' }}</span>
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
            <div v-if="formData.tagIds.length > 0" class="selected-tags">
              <span>Selected: </span>
              <span
                v-for="tagId in formData.tagIds"
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

          <div class="form-group">
            <label for="website-icon" class="form-label">Custom Icon URL (Optional)</label>
            <input
              id="website-icon"
              v-model="formData.customIcon"
              type="text"
              class="form-input"
              placeholder="e.g., https://example.com/icon.png"
            />
          </div>

          <div class="form-group">
            <label for="icon-zoom" class="form-label">
              Icon Zoom ({{ Math.round(formData.iconZoom * 100) }}%)
            </label>
            <input
              id="icon-zoom"
              v-model.number="formData.iconZoom"
              type="range"
              min="1"
              max="2"
              step="0.05"
              class="form-slider"
            />
            <div class="zoom-controls">
              <button type="button" class="zoom-preset" @click="formData.iconZoom = 1">100%</button>
              <button type="button" class="zoom-preset" @click="formData.iconZoom = 1.25">125%</button>
              <button type="button" class="zoom-preset" @click="formData.iconZoom = 1.5">150%</button>
              <button type="button" class="zoom-preset" @click="formData.iconZoom = 2">200%</button>
            </div>
          </div>

          <div class="form-group">
            <label for="icon-bg-color" class="form-label">
              Icon Background Color
            </label>
            <div class="color-picker-container">
              <input
                id="icon-bg-color"
                v-model="formData.iconBackgroundColor"
                type="color"
                class="color-input"
              />
              <input
                v-model="formData.iconBackgroundColor"
                type="text"
                class="form-input color-text-input"
                placeholder="transparent, #000000, rgb(255,0,0)"
              />
            </div>
            <div class="color-presets">
              <button type="button" class="color-preset" @click="formData.iconBackgroundColor = 'transparent'" style="background: linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, white 25%, white 75%, #ccc 75%, #ccc); background-size: 10px 10px; background-position: 0 0, 5px 5px;">None</button>
              <button type="button" class="color-preset" @click="formData.iconBackgroundColor = '#000000'" style="background: #000000; color: white;">Black</button>
              <button type="button" class="color-preset" @click="formData.iconBackgroundColor = '#FFFFFF'" style="background: #FFFFFF; color: black; border: 1px solid #ddd;">White</button>
              <button type="button" class="color-preset" @click="formData.iconBackgroundColor = '#FF6B6B'" style="background: #FF6B6B; color: white;">Red</button>
              <button type="button" class="color-preset" @click="formData.iconBackgroundColor = '#4ECDC4'" style="background: #4ECDC4; color: white;">Teal</button>
              <button type="button" class="color-preset" @click="formData.iconBackgroundColor = '#45B7D1'" style="background: #45B7D1; color: white;">Blue</button>
              <button type="button" class="color-preset" @click="formData.iconBackgroundColor = '#FFA07A'" style="background: #FFA07A; color: white;">Orange</button>
              <button type="button" class="color-preset" @click="formData.iconBackgroundColor = '#9B59B6'" style="background: #9B59B6; color: white;">Purple</button>
            </div>
          </div>

          <div v-if="formData.url || formData.customIcon" class="form-group">
            <label class="form-label">Icon Preview</label>
            <div class="icon-preview">
              <div class="preview-icon" :style="{ backgroundColor: formData.iconBackgroundColor }">
                <img
                  :src="formData.customIcon || `https://www.google.com/s2/favicons?domain=${normalizeUrl(formData.url)}&sz=128`"
                  :style="{ transform: `scale(${formData.iconZoom})` }"
                  alt="Icon preview"
                />
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="form-button secondary" @click="handleCancel">
              Cancel
            </button>
            <button type="submit" class="form-button primary">
              {{ isEditing ? 'Save Changes' : 'Add Website' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.website-form {
  min-width: 500px;
  max-width: 600px;
  padding: 32px;
}

.form-title {
  font-size: 28px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.9);
  margin: 0 0 24px 0;
}

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

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  font-size: 15px;
  color: rgba(0, 0, 0, 0.9);
  background: white;
  transition: all var(--transition-fast);
}

.form-input:focus {
  border-color: #007AFF;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.form-input.error {
  border-color: #FF3B30;
}

.form-input::placeholder {
  color: rgba(0, 0, 0, 0.3);
}

.error-message {
  display: block;
  font-size: 13px;
  color: #FF3B30;
  margin-top: 6px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 32px;
}

.form-button {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  border: none;
}

.form-button.primary {
  background: #007AFF;
  color: white;
}

.form-button.primary:hover {
  background: #0051D5;
  transform: scale(1.05);
}

.form-button.secondary {
  background: rgba(0, 0, 0, 0.05);
  color: rgba(0, 0, 0, 0.7);
}

.form-button.secondary:hover {
  background: rgba(0, 0, 0, 0.1);
}

.form-button:active {
  transform: scale(0.98);
}

.form-slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.1);
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
}

.form-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #007AFF;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.form-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.form-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #007AFF;
  cursor: pointer;
  border: none;
  transition: all var(--transition-fast);
}

.form-slider::-moz-range-thumb:hover {
  transform: scale(1.2);
}

.zoom-controls {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.zoom-preset {
  flex: 1;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  background: rgba(0, 0, 0, 0.05);
  color: rgba(0, 0, 0, 0.7);
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.zoom-preset:hover {
  background: rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.zoom-preset:active {
  transform: scale(0.95);
}

.color-picker-container {
  display: flex;
  gap: 12px;
  align-items: center;
}

.color-input {
  width: 60px;
  height: 40px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  cursor: pointer;
  padding: 4px;
  background: white;
}

.color-input::-webkit-color-swatch-wrapper {
  padding: 0;
}

.color-input::-webkit-color-swatch {
  border: none;
  border-radius: 4px;
}

.color-text-input {
  flex: 1;
}

.color-presets {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-top: 12px;
}

.color-preset {
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.color-preset:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.color-preset:active {
  transform: scale(0.95);
}

.icon-preview {
  display: flex;
  justify-content: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 12px;
  border: 1px dashed rgba(0, 0, 0, 0.1);
}

.preview-icon {
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px) saturate(180%);
  border-radius: 22px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3),
              0 1px 3px rgba(0, 0, 0, 0.1),
              inset 0 1px 0 rgba(255, 255, 255, 0.3);
  overflow: hidden;
}

.preview-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s ease-out;
}

.manage-tags-link {
  margin-left: 8px;
  font-size: 12px;
  color: #007AFF;
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.manage-tags-link:hover {
  text-decoration: underline;
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
  .form-title {
    color: rgba(255, 255, 255, 0.9);
  }

  .form-label {
    color: rgba(255, 255, 255, 0.8);
  }

  .form-input {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
  }

  .form-input:focus {
    border-color: #0A84FF;
    box-shadow: 0 0 0 3px rgba(10, 132, 255, 0.2);
  }

  .form-input.error {
    border-color: #FF453A;
  }

  .form-input::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }

  .error-message {
    color: #FF453A;
  }

  .form-button.primary {
    background: #0A84FF;
  }

  .form-button.primary:hover {
    background: #0051D5;
  }

  .form-button.secondary {
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.7);
  }

  .form-button.secondary:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .form-slider {
    background: rgba(255, 255, 255, 0.1);
  }

  .form-slider::-webkit-slider-thumb {
    background: #0A84FF;
  }

  .form-slider::-moz-range-thumb {
    background: #0A84FF;
  }

  .zoom-preset {
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.7);
  }

  .zoom-preset:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .icon-preview {
    background: rgba(255, 255, 255, 0.03);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .color-input {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .manage-tags-link {
    color: #0A84FF;
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

@media (max-width: 768px) {
  .website-form {
    min-width: 0;
    width: 85vw;
    max-height: 90vh;
    overflow-y: auto;
    padding: 28px;
  }

  .zoom-presets {
    grid-template-columns: repeat(2, 1fr);
  }

  .color-presets {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 640px) {
  .website-form {
    min-width: 0;
    width: 90vw;
    max-height: 90vh;
    overflow-y: auto;
    padding: 20px;
  }

  .form-title {
    font-size: 22px;
    margin-bottom: 20px;
  }

  .form-group {
    margin-bottom: 20px;
  }

  .form-actions {
    flex-direction: column-reverse;
    gap: 10px;
  }

  .form-button {
    width: 100%;
  }

  .zoom-presets {
    grid-template-columns: repeat(2, 1fr);
  }

  .color-presets {
    grid-template-columns: repeat(2, 1fr);
  }

  .color-picker-container {
    flex-direction: column;
    align-items: stretch;
  }

  .color-input {
    width: 100%;
  }

  .preview-icon {
    width: 80px;
    height: 80px;
  }
}
</style>
