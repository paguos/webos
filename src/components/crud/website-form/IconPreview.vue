<script setup lang="ts">
import { computed } from 'vue'
import { normalizeUrl } from '../../../utils/validators'

interface Props {
  url: string
  customIcon: string
  iconZoom: number
  iconOffsetX: number
  iconOffsetY: number
  iconBackgroundColor: string
}

interface Emits {
  (e: 'editIcon'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const iconSrc = computed(() => {
  if (props.customIcon) {
    return props.customIcon
  }
  if (props.url) {
    return `https://www.google.com/s2/favicons?domain=${normalizeUrl(props.url)}&sz=128`
  }
  return ''
})
</script>

<template>
  <div class="icon-preview-section">
    <div v-if="url || customIcon" class="form-group">
      <label class="form-label">Icon Preview</label>
      <div class="icon-preview">
        <div class="preview-icon" :style="{ backgroundColor: iconBackgroundColor }">
          <img
            v-if="iconSrc"
            :src="iconSrc"
            :style="{
              transform: `scale(${iconZoom}) translate(${iconOffsetX}%, ${iconOffsetY}%)`
            }"
            alt="Icon preview"
          />
        </div>
      </div>
      <button type="button" class="customize-button" @click="emit('editIcon')">
        Customize Icon
      </button>
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

.icon-preview {
  display: flex;
  justify-content: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 12px;
  border: 1px dashed rgba(0, 0, 0, 0.1);
  margin-bottom: 12px;
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
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
}

.customize-button {
  width: 100%;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  background: rgba(0, 122, 255, 0.1);
  color: #007AFF;
  border: 1px solid rgba(0, 122, 255, 0.2);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.customize-button:hover {
  background: rgba(0, 122, 255, 0.15);
  border-color: rgba(0, 122, 255, 0.3);
  transform: translateY(-1px);
}

.customize-button:active {
  transform: scale(0.98);
}

@media (prefers-color-scheme: dark) {
  .form-label {
    color: rgba(255, 255, 255, 0.8);
  }

  .icon-preview {
    background: rgba(255, 255, 255, 0.03);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .customize-button {
    background: rgba(10, 132, 255, 0.15);
    color: #0A84FF;
    border-color: rgba(10, 132, 255, 0.25);
  }

  .customize-button:hover {
    background: rgba(10, 132, 255, 0.2);
    border-color: rgba(10, 132, 255, 0.35);
  }
}
</style>
