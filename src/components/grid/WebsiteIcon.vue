<script setup lang="ts">
import { ref } from 'vue'
import { useWebsitesStore } from '../../stores/websitesStore.ts'
import { useUIStore } from '../../stores/uiStore.ts'
import { useLongPress } from '../../composables/useLongPress'
import type { Website } from '../../types'
import { openUrl } from '../../utils/urlOpener'

interface Props {
  website: Website
  isEditMode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isEditMode: false
})

const websitesStore = useWebsitesStore()
const uiStore = useUIStore()

const imageError = ref(false)

// Long press to enter edit mode (iOS-style)
const longPressHandlers = useLongPress(() => {
  if (!uiStore.isEditMode) {
    uiStore.enterEditMode()
  }
}, 500)

function handleClick(event: MouseEvent): void {
  // Prevent opening if in edit mode
  if (uiStore.isEditMode) {
    event.preventDefault()
    return
  }

  // Track visit
  websitesStore.visitWebsite(props.website.id)

  // Open URL using appropriate method for the platform
  openUrl(props.website.url)
}

function handleContextMenu(e: MouseEvent): void {
  e.preventDefault()
  uiStore.openContextMenu(props.website, { x: e.clientX, y: e.clientY })
}

function handleDelete(): void {
  uiStore.openConfirmDialog({
    title: 'Delete Website',
    message: `Are you sure you want to delete "${props.website.name}"?`,
    confirmText: 'Delete',
    cancelText: 'Cancel',
    onConfirm: () => {
      websitesStore.deleteWebsite(props.website.id)
    }
  })
}

function handleImageError(): void {
  imageError.value = true
}
</script>

<template>
  <div
    class="website-icon-wrapper"
    v-bind="!isEditMode ? longPressHandlers : {}"
  >
    <!-- iOS-style delete button in edit mode -->
    <button
      v-show="isEditMode"
      class="delete-button"
      @click.stop="handleDelete"
      @mousedown.stop
      @touchstart.stop
      aria-label="Delete website"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
      </svg>
    </button>

    <div
      class="website-icon card no-select"
      @click="handleClick"
      @contextmenu="handleContextMenu"
      :aria-label="`Open ${website.name}`"
      :class="{ 'in-edit-mode': isEditMode }"
    >
      <div class="icon-image" :style="{ backgroundColor: website.iconBackgroundColor || 'transparent' }">
        <img
          v-if="!imageError"
          :src="website.customIcon || website.favicon"
          :alt="website.name"
          :style="{ transform: `scale(${website.iconZoom || 1}) translate(${website.iconOffsetX || 0}%, ${website.iconOffsetY || 0}%)` }"
          @error="handleImageError"
        />
        <svg v-else width="48" height="48" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="20" fill="rgba(255,255,255,0.2)"/>
          <path d="M24 12v24M12 24h24" stroke="white" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
    </div>

    <div class="icon-label text-shadow no-select">
      {{ website.name }}
    </div>
  </div>
</template>

<style scoped>
.website-icon-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  position: relative;
  cursor: pointer;
}

/* iOS-style delete button */
.delete-button {
  position: absolute;
  top: -6px;
  left: -6px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(255, 59, 48, 0.95);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-dropdown);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: all var(--transition-fast);
  animation: scaleBounce 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.delete-button:hover {
  transform: scale(1.15);
  background: rgba(255, 59, 48, 1);
}

.delete-button:active {
  transform: scale(0.9);
}

@media (prefers-color-scheme: dark) {
  .delete-button {
    background: rgba(255, 69, 58, 0.95);
  }

  .delete-button:hover {
    background: rgba(255, 69, 58, 1);
  }
}

.website-icon {
  width: var(--icon-size);
  height: var(--icon-size);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: box-shadow var(--transition-base);
  /* Transform now handled by parent grid during drag */
}

.website-icon.in-edit-mode {
  cursor: grab;
  transform: none; /* Let grid control position */
}

.website-icon.in-edit-mode:active {
  cursor: grabbing;
}

.website-icon:hover:not(.in-edit-mode) {
  transform: scale(1.1) translateY(-5px);
  box-shadow: var(--icon-hover-shadow);
  transition: transform var(--transition-bounce),
              box-shadow var(--transition-base);
}

.website-icon:active:not(.in-edit-mode) {
  transform: scale(0.95);
  transition: transform var(--transition-fast);
}

.icon-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--icon-border-radius);
  overflow: hidden;
}

.icon-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.icon-image svg {
  color: rgba(255, 255, 255, 0.8);
}

.icon-label {
  font-size: 12px;
  font-weight: 500;
  color: white;
  text-align: center;
  max-width: var(--icon-size);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: 0.3px;
}

@media (max-width: 640px) {
  .icon-label {
    font-size: 11px;
  }
}
</style>
