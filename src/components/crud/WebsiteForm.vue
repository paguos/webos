<script setup>
import { ref, watch, computed } from 'vue'
import { useWebsitesStore } from '../../stores/websitesStore'
import { useUIStore } from '../../stores/uiStore'
import { isValidUrl, isValidName, normalizeUrl } from '../../utils/validators'

const websitesStore = useWebsitesStore()
const uiStore = useUIStore()

const formData = ref({
  name: '',
  url: '',
  categoryId: null,
  customIcon: '',
  iconZoom: 1
})

const errors = ref({
  name: '',
  url: ''
})

const isEditing = computed(() => !!uiStore.editingWebsite)

// Watch for editing website changes
watch(() => uiStore.editingWebsite, (website) => {
  if (website) {
    formData.value = {
      name: website.name,
      url: website.url,
      categoryId: website.categoryId || null,
      customIcon: website.customIcon || '',
      iconZoom: website.iconZoom || 1
    }
  } else {
    resetForm()
  }
}, { immediate: true })

function resetForm() {
  formData.value = {
    name: '',
    url: '',
    categoryId: null,
    customIcon: '',
    iconZoom: 1
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
      categoryId: formData.value.categoryId || null,
      customIcon: formData.value.customIcon || null,
      iconZoom: formData.value.iconZoom
    })
  } else {
    // Add new website
    const website = websitesStore.addWebsite(
      formData.value.name.trim(),
      formData.value.url,
      formData.value.categoryId || null,
      websitesStore.currentPage
    )
    // Update the zoom if different from default
    if (formData.value.iconZoom !== 1) {
      websitesStore.updateWebsite(website.id, {
        iconZoom: formData.value.iconZoom
      })
    }
  }

  uiStore.closeWebsiteForm()
  resetForm()
}

function handleCancel() {
  uiStore.closeWebsiteForm()
  resetForm()
}
</script>

<template>
  <Teleport to="body">
    <div v-if="uiStore.showWebsiteForm" class="overlay" @click="handleCancel">
      <div class="modal website-form" @click.stop>
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

          <div class="form-group">
            <label for="website-category" class="form-label">Category (Optional)</label>
            <select
              id="website-category"
              v-model="formData.categoryId"
              class="form-input"
            >
              <option :value="null">No Category</option>
              <option
                v-for="category in websitesStore.categories"
                :key="category.id"
                :value="category.id"
              >
                {{ category.name }}
              </option>
            </select>
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

          <div v-if="formData.url || formData.customIcon" class="form-group">
            <label class="form-label">Icon Preview</label>
            <div class="icon-preview">
              <div class="preview-icon">
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
}

@media (max-width: 640px) {
  .website-form {
    min-width: 0;
    width: 90vw;
    padding: 24px;
  }

  .form-title {
    font-size: 24px;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .form-button {
    width: 100%;
  }
}
</style>
