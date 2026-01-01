<script setup>
import { ref, watch, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { useWebsitesStore } from '../../stores/websitesStore.ts'
import { useUIStore } from '../../stores/uiStore.ts'
import { isValidUrl, isValidName, normalizeUrl } from '../../utils/validators.ts'
import { v4 as uuidv4 } from 'uuid'

const websitesStore = useWebsitesStore()
const uiStore = useUIStore()

const formData = ref({
  name: '',
  url: '',
  tagIds: [],
  customIcon: '',
  iconZoom: 1,
  iconBackgroundColor: 'transparent',
  extraLinks: []
})

const errors = ref({
  name: '',
  url: ''
})

const showTagsDropdown = ref(false)
const tagSearchQuery = ref('')
const tagSearchInput = ref(null)

// Extra links state
const editingLinkIndex = ref(null)
const linkFormData = ref({ name: '', url: '' })
const showLinkForm = ref(false)
const linkErrors = ref({ name: '', url: '' })

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
      iconBackgroundColor: website.iconBackgroundColor || 'transparent',
      extraLinks: website.extraLinks || []
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
    iconBackgroundColor: 'transparent',
    extraLinks: []
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
      iconBackgroundColor: formData.value.iconBackgroundColor,
      extraLinks: formData.value.extraLinks || []
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
    if (formData.value.customIcon || formData.value.iconZoom !== 1 || formData.value.iconBackgroundColor !== 'transparent' || formData.value.extraLinks.length > 0) {
      websitesStore.updateWebsite(website.id, {
        customIcon: formData.value.customIcon || null,
        iconZoom: formData.value.iconZoom,
        iconBackgroundColor: formData.value.iconBackgroundColor,
        extraLinks: formData.value.extraLinks || []
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

// Extra links management functions
function openAddLinkForm() {
  linkFormData.value = { name: '', url: '' }
  editingLinkIndex.value = null
  showLinkForm.value = true
  linkErrors.value = { name: '', url: '' }
}

function openEditLinkForm(index) {
  const link = formData.value.extraLinks[index]
  linkFormData.value = { name: link.name, url: link.url }
  editingLinkIndex.value = index
  showLinkForm.value = true
  linkErrors.value = { name: '', url: '' }
}

function cancelLinkForm() {
  linkFormData.value = { name: '', url: '' }
  editingLinkIndex.value = null
  showLinkForm.value = false
  linkErrors.value = { name: '', url: '' }
}

function validateLink() {
  linkErrors.value = { name: '', url: '' }
  let isValid = true

  if (!linkFormData.value.name.trim() || linkFormData.value.name.trim().length > 30) {
    linkErrors.value.name = 'Name is required (max 30 characters)'
    isValid = false
  }

  if (!isValidUrl(normalizeUrl(linkFormData.value.url))) {
    linkErrors.value.url = 'Please enter a valid URL'
    isValid = false
  }

  // Check for duplicate names
  const duplicateIndex = formData.value.extraLinks.findIndex(
    (link, idx) => link.name.toLowerCase() === linkFormData.value.name.trim().toLowerCase()
      && idx !== editingLinkIndex.value
  )
  if (duplicateIndex !== -1) {
    linkErrors.value.name = 'A link with this name already exists'
    isValid = false
  }

  // Check maximum limit
  if (editingLinkIndex.value === null && formData.value.extraLinks.length >= 10) {
    linkErrors.value.name = 'Maximum 10 extra links allowed'
    isValid = false
  }

  return isValid
}

function saveLinkForm() {
  if (!validateLink()) return

  const link = {
    id: editingLinkIndex.value !== null
      ? formData.value.extraLinks[editingLinkIndex.value].id
      : uuidv4(),
    name: linkFormData.value.name.trim(),
    url: normalizeUrl(linkFormData.value.url)
  }

  if (editingLinkIndex.value !== null) {
    formData.value.extraLinks[editingLinkIndex.value] = link
  } else {
    formData.value.extraLinks.push(link)
  }

  cancelLinkForm()
}

function removeLink(index) {
  formData.value.extraLinks.splice(index, 1)
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

          <!-- Extra Links Section -->
          <div class="form-group">
            <label class="form-label">Extra Links</label>
            <p class="form-hint">Add quick access links (e.g., Documentation, Issues)</p>

            <!-- Existing links list -->
            <div v-if="formData.extraLinks.length > 0" class="extra-links-list">
              <div
                v-for="(link, index) in formData.extraLinks"
                :key="link.id"
                class="extra-link-item"
              >
                <div class="link-info">
                  <div class="link-name">{{ link.name }}</div>
                  <div class="link-url">{{ link.url }}</div>
                </div>
                <div class="link-actions">
                  <button type="button" class="link-action-btn" @click="openEditLinkForm(index)">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M11.333 2L14 4.667l-9.333 9.333H2v-2.667L11.333 2z" stroke="currentColor" stroke-width="1.5"/>
                    </svg>
                  </button>
                  <button type="button" class="link-action-btn danger" @click="removeLink(index)">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Add/Edit form -->
            <div v-if="showLinkForm" class="link-form">
              <div class="link-form-inputs">
                <div>
                  <input
                    v-model="linkFormData.name"
                    type="text"
                    class="form-input"
                    :class="{ error: linkErrors.name }"
                    placeholder="Link name (e.g., Documentation)"
                    maxlength="30"
                  />
                  <span v-if="linkErrors.name" class="error-message">{{ linkErrors.name }}</span>
                </div>

                <div>
                  <input
                    v-model="linkFormData.url"
                    type="text"
                    class="form-input"
                    :class="{ error: linkErrors.url }"
                    placeholder="Link URL (e.g., https://...)"
                  />
                  <span v-if="linkErrors.url" class="error-message">{{ linkErrors.url }}</span>
                </div>
              </div>
              <div class="link-form-actions">
                <button type="button" class="form-button secondary small" @click="cancelLinkForm">
                  Cancel
                </button>
                <button type="button" class="form-button primary small" @click="saveLinkForm">
                  {{ editingLinkIndex !== null ? 'Update' : 'Add' }}
                </button>
              </div>
            </div>

            <!-- Add button -->
            <button
              v-if="!showLinkForm && formData.extraLinks.length < 10"
              type="button"
              class="add-link-button"
              @click="openAddLinkForm"
            >
              + Add Extra Link
            </button>

            <div v-if="formData.extraLinks.length >= 10" class="form-hint warning">
              Maximum 10 extra links reached
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

  .extra-links-list {
    gap: 6px;
  }

  .extra-link-item {
    padding: 10px;
  }

  .link-actions {
    gap: 4px;
  }
}

/* Extra Links Styles */
.form-hint {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.5);
  margin-bottom: 12px;
  margin-top: -8px;
}

.form-hint.warning {
  color: #FF9500;
  margin-top: 8px;
  margin-bottom: 0;
}

.extra-links-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.extra-link-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: all var(--transition-fast);
}

.extra-link-item:hover {
  background: rgba(0, 0, 0, 0.05);
  border-color: rgba(0, 0, 0, 0.15);
}

.link-info {
  flex: 1;
  min-width: 0;
}

.link-name {
  font-size: 14px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.9);
  margin-bottom: 4px;
}

.link-url {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.link-actions {
  display: flex;
  gap: 6px;
  margin-left: 12px;
}

.link-action-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.05);
  color: rgba(0, 0, 0, 0.7);
  transition: all var(--transition-fast);
  border: none;
  cursor: pointer;
}

.link-action-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  transform: scale(1.05);
}

.link-action-btn.danger {
  color: #FF3B30;
}

.link-action-btn.danger:hover {
  background: rgba(255, 59, 48, 0.1);
}

.add-link-button {
  width: 100%;
  padding: 10px 16px;
  border-radius: 8px;
  background: rgba(0, 122, 255, 0.05);
  color: #007AFF;
  border: 1px dashed rgba(0, 122, 255, 0.3);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.add-link-button:hover {
  background: rgba(0, 122, 255, 0.1);
  border-color: rgba(0, 122, 255, 0.5);
  transform: translateY(-1px);
}

.add-link-button:active {
  transform: scale(0.98);
}

/* Link form styles */
.link-form {
  padding: 16px;
  background: rgba(0, 122, 255, 0.05);
  border: 1px solid rgba(0, 122, 255, 0.2);
  border-radius: 8px;
  margin-bottom: 12px;
}

.link-form-inputs {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 12px;
}

.link-form-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.form-button.small {
  padding: 8px 16px;
  font-size: 13px;
}

/* Dark mode styles */
@media (prefers-color-scheme: dark) {
  .form-hint {
    color: rgba(255, 255, 255, 0.5);
  }

  .extra-link-item {
    background: rgba(255, 255, 255, 0.03);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .extra-link-item:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.15);
  }

  .link-name {
    color: rgba(255, 255, 255, 0.9);
  }

  .link-url {
    color: rgba(255, 255, 255, 0.6);
  }

  .link-action-btn {
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.7);
  }

  .link-action-btn:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .link-action-btn.danger {
    color: #FF453A;
  }

  .link-action-btn.danger:hover {
    background: rgba(255, 69, 58, 0.2);
  }

  .add-link-button {
    background: rgba(10, 132, 255, 0.1);
    color: #0A84FF;
    border-color: rgba(10, 132, 255, 0.3);
  }

  .add-link-button:hover {
    background: rgba(10, 132, 255, 0.15);
    border-color: rgba(10, 132, 255, 0.5);
  }

  .link-form {
    background: rgba(10, 132, 255, 0.1);
    border-color: rgba(10, 132, 255, 0.3);
  }
}
</style>
