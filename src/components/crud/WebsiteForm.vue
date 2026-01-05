<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useWebsitesStore } from '../../stores/websitesStore'
import { useUIStore } from '../../stores/uiStore'
import { useWebsiteFormValidation } from '../../composables/useWebsiteFormValidation'
import { normalizeUrl } from '../../utils/validators'
import BasicInfoSection from './website-form/BasicInfoSection.vue'
import TagSection from './website-form/TagSection.vue'
import IconCustomization from './website-form/IconCustomization.vue'
import ExtraLinksSection from './website-form/ExtraLinksSection.vue'
import type { WebsiteFormData, FormErrors } from './website-form/types'

const websitesStore = useWebsitesStore()
const uiStore = useUIStore()
const { validateBasicInfo } = useWebsiteFormValidation()

const formData = ref<WebsiteFormData>({
  name: '',
  url: '',
  tagIds: [],
  customIcon: '',
  iconZoom: 1,
  iconOffsetX: 0,
  iconOffsetY: 0,
  iconBackgroundColor: 'transparent',
  extraLinks: []
})

const errors = ref<FormErrors>({
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
      tagIds: website.tagIds || [],
      customIcon: website.customIcon || '',
      iconZoom: website.iconZoom || 1,
      iconOffsetX: website.iconOffsetX || 0,
      iconOffsetY: website.iconOffsetY || 0,
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
    iconOffsetX: 0,
    iconOffsetY: 0,
    iconBackgroundColor: 'transparent',
    extraLinks: []
  }
  errors.value = {
    name: '',
    url: ''
  }
}

function handleSubmit() {
  const validation = validateBasicInfo(formData.value.name, formData.value.url)
  errors.value = validation.errors

  if (!validation.isValid) {
    return
  }

  if (isEditing.value) {
    // Update existing website
    websitesStore.updateWebsite(uiStore.editingWebsite!.id, {
      name: formData.value.name.trim(),
      url: normalizeUrl(formData.value.url),
      tagIds: formData.value.tagIds || [],
      customIcon: formData.value.customIcon || null,
      iconZoom: formData.value.iconZoom,
      iconOffsetX: formData.value.iconOffsetX,
      iconOffsetY: formData.value.iconOffsetY,
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
    if (formData.value.customIcon || formData.value.iconZoom !== 1 || formData.value.iconOffsetX !== 0 || formData.value.iconOffsetY !== 0 || formData.value.iconBackgroundColor !== 'transparent' || formData.value.extraLinks.length > 0) {
      websitesStore.updateWebsite(website.id, {
        customIcon: formData.value.customIcon || null,
        iconZoom: formData.value.iconZoom,
        iconOffsetX: formData.value.iconOffsetX,
        iconOffsetY: formData.value.iconOffsetY,
        iconBackgroundColor: formData.value.iconBackgroundColor,
        extraLinks: formData.value.extraLinks || []
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
      <div class="modal website-form modal-instant" @click.stop>
        <h2 class="form-title">{{ isEditing ? 'Edit Website' : 'Add Website' }}</h2>

        <form @submit.prevent="handleSubmit">
          <BasicInfoSection
            v-model:name="formData.name"
            v-model:url="formData.url"
            :errors="errors"
          />

          <TagSection
            v-model:selected-tag-ids="formData.tagIds"
          />

          <ExtraLinksSection
            v-model:extra-links="formData.extraLinks"
          />

          <IconCustomization
            v-model:custom-icon="formData.customIcon"
            v-model:icon-zoom="formData.iconZoom"
            v-model:icon-offset-x="formData.iconOffsetX"
            v-model:icon-offset-y="formData.iconOffsetY"
            v-model:icon-background-color="formData.iconBackgroundColor"
            :url="formData.url"
          />

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

@media (prefers-color-scheme: dark) {
  .form-title {
    color: rgba(255, 255, 255, 0.9);
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
}

@media (max-width: 768px) {
  .website-form {
    min-width: 0;
    width: 85vw;
    max-height: 90vh;
    overflow-y: auto;
    padding: 28px;
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

  .form-actions {
    flex-direction: column-reverse;
    gap: 10px;
  }

  .form-button {
    width: 100%;
  }
}
</style>
