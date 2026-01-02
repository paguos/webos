<script setup lang="ts">
import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { normalizeUrl } from '../../../utils/validators'
import { useWebsiteFormValidation } from '../../../composables/useWebsiteFormValidation'
import type { ExtraLink } from '../../../types'
import type { LinkFormData, LinkErrors } from './types'

interface Props {
  extraLinks: ExtraLink[]
}

interface Emits {
  (e: 'update:extraLinks', value: ExtraLink[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { validateExtraLink } = useWebsiteFormValidation()

const editingLinkIndex = ref<number | null>(null)
const linkFormData = ref<LinkFormData>({ name: '', url: '' })
const showLinkForm = ref(false)
const linkErrors = ref<LinkErrors>({ name: '', url: '' })

function openAddLinkForm() {
  linkFormData.value = { name: '', url: '' }
  editingLinkIndex.value = null
  showLinkForm.value = true
  linkErrors.value = { name: '', url: '' }
}

function openEditLinkForm(index: number) {
  const link = props.extraLinks[index]
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

function saveLinkForm() {
  const validation = validateExtraLink(linkFormData.value, props.extraLinks, editingLinkIndex.value)

  if (!validation.isValid) {
    linkErrors.value = validation.errors
    return
  }

  const link: ExtraLink = {
    id: editingLinkIndex.value !== null
      ? props.extraLinks[editingLinkIndex.value].id
      : uuidv4(),
    name: linkFormData.value.name.trim(),
    url: normalizeUrl(linkFormData.value.url)
  }

  const newLinks = [...props.extraLinks]
  if (editingLinkIndex.value !== null) {
    newLinks[editingLinkIndex.value] = link
  } else {
    newLinks.push(link)
  }

  emit('update:extraLinks', newLinks)
  cancelLinkForm()
}

function removeLink(index: number) {
  const newLinks = props.extraLinks.filter((_, i) => i !== index)
  emit('update:extraLinks', newLinks)
}
</script>

<template>
  <div class="form-group">
    <label class="form-label">Extra Links</label>
    <p class="form-hint">Add quick access links (e.g., Documentation, Issues)</p>

    <!-- Existing links list -->
    <div v-if="extraLinks.length > 0" class="extra-links-list">
      <div
        v-for="(link, index) in extraLinks"
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
      v-if="!showLinkForm && extraLinks.length < 10"
      type="button"
      class="add-link-button"
      @click="openAddLinkForm"
    >
      + Add Extra Link
    </button>

    <div v-if="extraLinks.length >= 10" class="form-hint warning">
      Maximum 10 extra links reached
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

.form-button {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  border: none;
}

.form-button.small {
  padding: 8px 16px;
  font-size: 13px;
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
  .form-label {
    color: rgba(255, 255, 255, 0.8);
  }

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
}

@media (max-width: 640px) {
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
</style>
