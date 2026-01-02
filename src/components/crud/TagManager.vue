<script setup>
import { ref } from 'vue'
import { useWebsitesStore } from '../../stores/websitesStore.ts'
import { useUIStore } from '../../stores/uiStore.ts'
import { TAG_COLORS } from '../../utils/constants.ts'
import { useNotification } from '../../composables/useNotification'
import { DuplicateError } from '../../utils/errors'

const websitesStore = useWebsitesStore()
const uiStore = useUIStore()
const { showError } = useNotification()

const tagName = ref('')
const selectedColor = ref(TAG_COLORS[0])
const editingTagId = ref(null)
const editingTagName = ref('')
const showColorPicker = ref(null) // null or tag id to show color picker for

function handleAddTag() {
  if (!tagName.value.trim()) return

  // Check for duplicate names
  const duplicate = websitesStore.tags.find(
    t => t.name.toLowerCase() === tagName.value.trim().toLowerCase()
  )
  if (duplicate) {
    showError(new DuplicateError('tag'))
    return
  }

  websitesStore.addTag(tagName.value, selectedColor.value)
  tagName.value = ''
}

function startEditTag(tag) {
  editingTagId.value = tag.id
  editingTagName.value = tag.name
}

function saveEditTag(tagId) {
  if (!editingTagName.value.trim()) return

  // Check for duplicate names (excluding current tag)
  const duplicate = websitesStore.tags.find(
    t => t.id !== tagId && t.name.toLowerCase() === editingTagName.value.trim().toLowerCase()
  )
  if (duplicate) {
    showError(new DuplicateError('tag'))
    return
  }

  websitesStore.updateTag(tagId, { name: editingTagName.value })
  editingTagId.value = null
}

function cancelEdit() {
  editingTagId.value = null
  editingTagName.value = ''
}

function handleDeleteTag(tag) {
  uiStore.openConfirmDialog({
    title: 'Delete Tag',
    message: `Delete "${tag.name}"? This will remove it from ${tag.count} website(s).`,
    confirmText: 'Delete',
    onConfirm: () => websitesStore.deleteTag(tag.id)
  })
}

function handleColorChange(tagId, color) {
  websitesStore.updateTag(tagId, { color })
  showColorPicker.value = null
}

function toggleColorPicker(tagId) {
  showColorPicker.value = showColorPicker.value === tagId ? null : tagId
}

function handleClose() {
  uiStore.closeTagManager()
  editingTagId.value = null
  showColorPicker.value = null
}
</script>

<template>
  <Teleport to="body">
    <div v-if="uiStore.showTagManager" class="overlay tag-manager-overlay" @click="handleClose">
      <div class="modal tag-manager-modal modal-instant" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">Manage Tags</h2>
          <button class="close-button" @click="handleClose" aria-label="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <!-- Tags List -->
        <div class="settings-section">
          <h3 class="section-title">Tags</h3>

          <div v-if="websitesStore.tagsWithCount.length === 0" class="empty-state">
            No tags yet. Create your first tag below.
          </div>

          <div v-else class="tags-list">
            <div
              v-for="tag in websitesStore.tagsWithCount"
              :key="tag.id"
              class="tag-item"
            >
              <div class="tag-color-wrapper">
                <button
                  class="tag-color-button"
                  :style="{ backgroundColor: tag.color }"
                  @click="toggleColorPicker(tag.id)"
                  :title="`Change color for ${tag.name}`"
                ></button>

                <!-- Color Picker Dropdown -->
                <div v-if="showColorPicker === tag.id" class="color-picker-dropdown">
                  <div class="color-picker-grid">
                    <button
                      v-for="color in TAG_COLORS"
                      :key="color"
                      class="color-swatch"
                      :style="{ backgroundColor: color }"
                      @click="handleColorChange(tag.id, color)"
                      :class="{ selected: tag.color === color }"
                    ></button>
                  </div>
                </div>
              </div>

              <div class="tag-info">
                <input
                  v-if="editingTagId === tag.id"
                  v-model="editingTagName"
                  type="text"
                  class="tag-name-input"
                  @blur="saveEditTag(tag.id)"
                  @keyup.enter="saveEditTag(tag.id)"
                  @keyup.esc="cancelEdit"
                  autofocus
                />
                <span
                  v-else
                  class="tag-name"
                  @click="startEditTag(tag)"
                >
                  {{ tag.name }}
                </span>
                <span class="tag-count">{{ tag.count }} website{{ tag.count !== 1 ? 's' : '' }}</span>
              </div>

              <button
                class="delete-tag-button"
                @click="handleDeleteTag(tag)"
                title="Delete tag"
              >
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path d="M2.5 5h15M6.667 5V3.333A1.667 1.667 0 018.333 1.667h3.334A1.667 1.667 0 0113.333 3.333V5m2.5 0v11.667a1.667 1.667 0 01-1.666 1.666H5.833a1.667 1.667 0 01-1.666-1.666V5h11.666z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Add New Tag -->
        <div class="settings-section">
          <h3 class="section-title">Add New Tag</h3>
          <div class="add-tag-form">
            <div class="form-row">
              <button
                class="tag-color-button large"
                :style="{ backgroundColor: selectedColor }"
                @click="showColorPicker = 'new'"
                title="Choose color"
              ></button>

              <!-- Color Picker for New Tag -->
              <div v-if="showColorPicker === 'new'" class="color-picker-dropdown">
                <div class="color-picker-grid">
                  <button
                    v-for="color in TAG_COLORS"
                    :key="color"
                    class="color-swatch"
                    :style="{ backgroundColor: color }"
                    @click="selectedColor = color; showColorPicker = null"
                    :class="{ selected: selectedColor === color }"
                  ></button>
                </div>
              </div>

              <input
                v-model="tagName"
                type="text"
                class="tag-name-input-large"
                placeholder="Tag name"
                @keyup.enter="handleAddTag"
              />

              <button
                class="add-tag-button"
                @click="handleAddTag"
                :disabled="!tagName.trim()"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.tag-manager-overlay {
  z-index: 2000;
}

.tag-manager-modal {
  min-width: 500px;
  max-width: 600px;
  padding: 0;
  z-index: 2001;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.modal-title {
  font-size: 24px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.9);
  margin: 0;
}

.close-button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  color: rgba(0, 0, 0, 0.5);
  transition: all var(--transition-fast);
}

.close-button:hover {
  background: rgba(0, 0, 0, 0.05);
  color: rgba(0, 0, 0, 0.9);
}

.settings-section {
  padding: 24px 32px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.settings-section:last-child {
  border-bottom: none;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.8);
  margin: 0 0 16px 0;
}

.empty-state {
  padding: 32px;
  text-align: center;
  color: rgba(0, 0, 0, 0.5);
  font-size: 14px;
}

.tags-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.03);
  transition: all var(--transition-fast);
}

.tag-item:hover {
  background: rgba(0, 0, 0, 0.05);
}

.tag-color-wrapper {
  position: relative;
}

.tag-color-button {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tag-color-button:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.tag-color-button.large {
  width: 36px;
  height: 36px;
}

.color-picker-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 8px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.color-picker-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.color-swatch {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.color-swatch:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.color-swatch.selected {
  border-color: rgba(0, 0, 0, 0.3);
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.3);
}

.tag-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.tag-name {
  font-size: 15px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.9);
  cursor: pointer;
  transition: color var(--transition-fast);
}

.tag-name:hover {
  color: rgba(0, 122, 255, 0.9);
}

.tag-name-input {
  flex: 1;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid rgba(0, 122, 255, 0.6);
  background: rgba(255, 255, 255, 0.9);
  color: rgba(0, 0, 0, 0.9);
  font-size: 15px;
  font-weight: 500;
}

.tag-name-input:focus {
  outline: none;
  border-color: rgba(0, 122, 255, 0.8);
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.tag-count {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.5);
  font-weight: 500;
  padding: 4px 10px;
  background: rgba(0, 0, 0, 0.06);
  border-radius: 12px;
  white-space: nowrap;
}

.delete-tag-button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  color: #FF3B30;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.delete-tag-button:hover {
  background: rgba(255, 59, 48, 0.1);
  transform: scale(1.05);
}

.delete-tag-button:active {
  transform: scale(0.95);
}

.add-tag-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-row {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
}

.tag-name-input-large {
  flex: 1;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  background: rgba(255, 255, 255, 0.8);
  color: rgba(0, 0, 0, 0.9);
  font-size: 15px;
  transition: all var(--transition-fast);
}

.tag-name-input-large:focus {
  outline: none;
  border-color: rgba(0, 122, 255, 0.6);
  background: rgba(255, 255, 255, 1);
}

.tag-name-input-large::placeholder {
  color: rgba(0, 0, 0, 0.4);
}

.add-tag-button {
  padding: 10px 20px;
  border-radius: 8px;
  background: rgba(0, 122, 255, 0.9);
  color: white;
  font-size: 15px;
  font-weight: 600;
  transition: all var(--transition-fast);
}

.add-tag-button:hover:not(:disabled) {
  background: rgba(0, 122, 255, 1);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.add-tag-button:active:not(:disabled) {
  transform: translateY(0);
}

.add-tag-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (prefers-color-scheme: dark) {
  .modal-header {
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }

  .modal-title {
    color: rgba(255, 255, 255, 0.9);
  }

  .close-button {
    color: rgba(255, 255, 255, 0.5);
  }

  .close-button:hover {
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.9);
  }

  .settings-section {
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }

  .section-title {
    color: rgba(255, 255, 255, 0.8);
  }

  .empty-state {
    color: rgba(255, 255, 255, 0.5);
  }

  .tag-item {
    background: rgba(255, 255, 255, 0.03);
  }

  .tag-item:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .tag-name {
    color: rgba(255, 255, 255, 0.9);
  }

  .tag-name:hover {
    color: rgba(10, 132, 255, 0.9);
  }

  .tag-name-input {
    border-color: rgba(10, 132, 255, 0.6);
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.9);
  }

  .tag-name-input:focus {
    border-color: rgba(10, 132, 255, 0.8);
    background: rgba(255, 255, 255, 0.1);
    box-shadow: 0 0 0 3px rgba(10, 132, 255, 0.1);
  }

  .tag-count {
    color: rgba(255, 255, 255, 0.5);
    background: rgba(255, 255, 255, 0.06);
  }

  .delete-tag-button {
    color: #FF453A;
  }

  .delete-tag-button:hover {
    background: rgba(255, 69, 58, 0.15);
  }

  .color-picker-dropdown {
    background: rgba(30, 30, 30, 0.95);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .color-swatch.selected {
    border-color: rgba(255, 255, 255, 0.3);
    box-shadow: 0 0 0 3px rgba(10, 132, 255, 0.3);
  }

  .tag-name-input-large {
    border-color: rgba(255, 255, 255, 0.15);
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.9);
  }

  .tag-name-input-large:focus {
    border-color: rgba(10, 132, 255, 0.6);
    background: rgba(255, 255, 255, 0.1);
  }

  .tag-name-input-large::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  .add-tag-button {
    background: rgba(10, 132, 255, 0.9);
  }

  .add-tag-button:hover:not(:disabled) {
    background: rgba(10, 132, 255, 1);
    box-shadow: 0 4px 12px rgba(10, 132, 255, 0.3);
  }
}

@media (max-width: 640px) {
  .tag-manager-modal {
    min-width: 0;
    width: 90vw;
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-header,
  .settings-section {
    padding: 20px;
  }

  .color-picker-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
