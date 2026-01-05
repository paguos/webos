<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useUIStore } from '../../stores/uiStore.ts'
import { useWebsitesStore } from '../../stores/websitesStore.ts'
import { openUrl } from '../../utils/urlOpener'
import type { ExtraLink } from '../../types'

const uiStore = useUIStore()
const websitesStore = useWebsitesStore()

// Computed properties for current website
const website = computed(() => uiStore.contextMenuWebsite)
const hasExtraLinks = computed(() => {
  return website.value?.extraLinks && website.value.extraLinks.length > 0
})
const sortedExtraLinks = computed(() => {
  if (!website.value?.extraLinks) return []
  return [...website.value.extraLinks].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  )
})

// Actions
function handleOpen(): void {
  if (website.value) {
    websitesStore.visitWebsite(website.value.id)
    openUrl(website.value.url)
    uiStore.closeContextMenu()
  }
}

function handleExtraLinkClick(extraLink: ExtraLink): void {
  if (website.value) {
    websitesStore.visitWebsite(website.value.id)
    openUrl(extraLink.url)
    uiStore.closeContextMenu()
  }
}

function handleEdit(): void {
  if (website.value) {
    uiStore.openWebsiteForm(website.value)
    uiStore.closeContextMenu()
  }
}

function handleDelete(): void {
  if (website.value) {
    const websiteToDelete = website.value
    uiStore.openConfirmDialog({
      title: 'Delete Website',
      message: `Are you sure you want to delete "${websiteToDelete.name}"?`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: () => {
        websitesStore.deleteWebsite(websiteToDelete.id)
      }
    })
    uiStore.closeContextMenu()
  }
}

// Close on click outside - use document listener to avoid blocking events
function handleClickOutside(e: MouseEvent): void {
  // Check if click is outside the context menu
  const target = e.target as HTMLElement
  if (!target.closest('.context-menu')) {
    uiStore.closeContextMenu()
  }
}

// Close on Escape key
function handleKeyDown(e: KeyboardEvent): void {
  if (e.key === 'Escape') {
    uiStore.closeContextMenu()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
  // Add click listener with slight delay to avoid closing immediately
  setTimeout(() => {
    document.addEventListener('click', handleClickOutside)
  }, 0)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="uiStore.showContextMenu && website"
      class="context-menu"
      :style="{
        left: uiStore.contextMenuPosition.x + 'px',
        top: uiStore.contextMenuPosition.y + 'px'
      }"
    >
        <button class="context-menu-item" @click="handleOpen">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="margin-right: 8px;">
            <path d="M14 8H2M8 2v12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          Open
        </button>

        <!-- Extra links section -->
        <template v-if="hasExtraLinks">
          <div class="context-menu-divider"></div>
          <button
            v-for="link in sortedExtraLinks"
            :key="link.id"
            class="context-menu-item"
            @click="handleExtraLinkClick(link)"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="margin-right: 8px;">
              <path d="M6.5 9.5l3-3M7.5 4.5h1c1.66 0 3 1.34 3 3v1M4.5 8.5h-1c-1.66 0-3-1.34-3-3v-1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            {{ link.name }}
          </button>
          <div class="context-menu-divider"></div>
        </template>

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
</template>
