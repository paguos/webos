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
  iconZoom: 1,
  iconBackgroundColor: 'transparent'
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
    categoryId: null,
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
      categoryId: formData.value.categoryId || null,
      customIcon: formData.value.customIcon || null,
      iconZoom: formData.value.iconZoom,
      iconBackgroundColor: formData.value.iconBackgroundColor
    })
  } else {
    // Add new website
    const website = websitesStore.addWebsite(
      formData.value.name.trim(),
      formData.value.url,
      formData.value.categoryId || null,
      websitesStore.currentPage
    )
    // Update the zoom and color if different from defaults
    if (formData.value.iconZoom !== 1 || formData.value.iconBackgroundColor !== 'transparent') {
      websitesStore.updateWebsite(website.id, {
        iconZoom: formData.value.iconZoom,
        iconBackgroundColor: formData.value.iconBackgroundColor
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
