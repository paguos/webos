<script setup>
import { computed } from 'vue'
import { useWebsitesStore } from '../../stores/websitesStore.ts'

const websitesStore = useWebsitesStore()

const dots = computed(() => {
  return Array.from({ length: websitesStore.totalPages }, (_, i) => i)
})

function goToPage(page) {
  websitesStore.setCurrentPage(page)
}
</script>

<template>
  <div class="pagination-dots">
    <button
      v-for="page in dots"
      :key="page"
      class="dot"
      :class="{ active: page === websitesStore.currentPage }"
      @click="goToPage(page)"
      :aria-label="`Go to page ${page + 1}`"
    />
  </div>
</template>

<style scoped>
.pagination-dots {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: var(--dot-gap);
  z-index: var(--z-dropdown);
}

.dot {
  width: var(--dot-size);
  height: var(--dot-size);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  transition: all var(--transition-base);
  cursor: pointer;
  padding: 0;
  border: none;
}

.dot:hover:not(.active) {
  background: rgba(255, 255, 255, 0.6);
  transform: scale(1.2);
}

.dot.active {
  width: var(--dot-active-width);
  border-radius: var(--dot-radius);
  background: rgba(255, 255, 255, 0.9);
}

.dot:active {
  transform: scale(0.9);
}

@media (max-width: 640px) {
  .pagination-dots {
    bottom: 20px;
  }
}
</style>
