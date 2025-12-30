<script setup>
import { ref } from 'vue'
import { useWebsitesStore } from '../../stores/websitesStore'
import { useUIStore } from '../../stores/uiStore'
import { useLongPress } from '../../composables/useLongPress'

const props = defineProps({
  website: {
    type: Object,
    required: true
  },
  isEditMode: {
    type: Boolean,
    default: false
  }
})

const websitesStore = useWebsitesStore()
const uiStore = useUIStore()

const showContextMenu = ref(false)
const contextMenuPosition = ref({ x: 0, y: 0 })
const imageError = ref(false)

// Long press to enter edit mode (iOS-style)
const longPressHandlers = useLongPress(() => {
  if (!uiStore.isEditMode) {
    uiStore.enterEditMode()
  }
}, 500)

function handleClick(event) {
  // Prevent opening if in edit mode
  if (uiStore.isEditMode) {
    event.preventDefault()
    return
  }

  // Visit the website in default browser
  websitesStore.visitWebsite(props.website.id)
  window.open(props.website.url, '_blank')
}

function handleContextMenu(e) {
  e.preventDefault()
  contextMenuPosition.value = { x: e.clientX, y: e.clientY }
  showContextMenu.value = true

  // Close context menu on click outside
  const closeMenu = () => {
    showContextMenu.value = false
    document.removeEventListener('click', closeMenu)
  }
  setTimeout(() => {
    document.addEventListener('click', closeMenu)
  }, 0)
}

function handleEdit() {
  uiStore.openWebsiteForm(props.website)
}

function handleDelete() {
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

function handleImageError() {
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
          :style="{ transform: `scale(${website.iconZoom || 1})` }"
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

    <!-- Context Menu -->
    <Teleport to="body">
      <div
        v-if="showContextMenu"
        class="context-menu"
        :style="{
          left: contextMenuPosition.x + 'px',
          top: contextMenuPosition.y + 'px'
        }"
      >
        <button class="context-menu-item" @click="handleClick">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="margin-right: 8px;">
            <path d="M14 8H2M8 2v12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          Open
        </button>
        <button class="context-menu-item" @click="handleEdit">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="margin-right: 8px;">
            <path d="M11.333 2L14 4.667l-9.333 9.333H2v-2.667L11.333 2z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Edit
        </button>
        <div class="context-menu-divider"></div>
        <button class="context-menu-item danger" @click="handleDelete">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="margin-right: 8px;">
            <path d="M2 4h12M5.333 4V2.667a1.333 1.333 0 011.334-1.334h2.666a1.333 1.333 0 011.334 1.334V4m2 0v9.333a1.333 1.333 0 01-1.334 1.334H4.667a1.333 1.333 0 01-1.334-1.334V4h9.334z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Delete
        </button>
      </div>
    </Teleport>
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
  object-fit: cover;
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
