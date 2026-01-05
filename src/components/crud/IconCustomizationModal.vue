<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { normalizeUrl } from '../../utils/validators'
import type { IconCustomizationValues } from './website-form/types'

interface Props {
  visible: boolean
  url: string
  initialValues: IconCustomizationValues
}

interface Emits {
  (e: 'close'): void
  (e: 'apply', values: IconCustomizationValues): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Local state (temporary until Apply)
const localValues = ref<IconCustomizationValues>({
  customIcon: '',
  iconZoom: 1,
  iconOffsetX: 0,
  iconOffsetY: 0,
  iconBackgroundColor: 'transparent'
})

// Drag state
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0, offsetX: 0, offsetY: 0 })

// Reset local values when modal opens
watch(() => props.visible, (isVisible) => {
  if (isVisible) {
    localValues.value = { ...props.initialValues }
  }
})

const zoomPercentage = computed(() => Math.round(localValues.value.iconZoom * 100))

const iconSrc = computed(() => {
  if (localValues.value.customIcon) {
    return localValues.value.customIcon
  }
  if (props.url) {
    return `https://www.google.com/s2/favicons?domain=${normalizeUrl(props.url)}&sz=128`
  }
  return ''
})

function setZoom(value: number) {
  localValues.value.iconZoom = value
}

function setBackgroundColor(color: string) {
  localValues.value.iconBackgroundColor = color
}

function handleDragStart(e: MouseEvent | TouchEvent) {
  isDragging.value = true

  const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX
  const clientY = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY

  dragStart.value = {
    x: clientX,
    y: clientY,
    offsetX: localValues.value.iconOffsetX,
    offsetY: localValues.value.iconOffsetY
  }

  document.addEventListener('mousemove', handleDragMove)
  document.addEventListener('mouseup', handleDragEnd)
  document.addEventListener('touchmove', handleDragMove)
  document.addEventListener('touchend', handleDragEnd)

  e.preventDefault()
}

function handleDragMove(e: MouseEvent | TouchEvent) {
  if (!isDragging.value) return

  const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX
  const clientY = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY

  const deltaX = clientX - dragStart.value.x
  const deltaY = clientY - dragStart.value.y

  const percentDeltaX = deltaX
  const percentDeltaY = deltaY

  const newOffsetX = Math.max(-50, Math.min(50, dragStart.value.offsetX + percentDeltaX))
  const newOffsetY = Math.max(-50, Math.min(50, dragStart.value.offsetY + percentDeltaY))

  localValues.value.iconOffsetX = Math.round(newOffsetX)
  localValues.value.iconOffsetY = Math.round(newOffsetY)
}

function handleDragEnd() {
  isDragging.value = false
  document.removeEventListener('mousemove', handleDragMove)
  document.removeEventListener('mouseup', handleDragEnd)
  document.removeEventListener('touchmove', handleDragMove)
  document.removeEventListener('touchend', handleDragEnd)
}

function handleApply() {
  emit('apply', { ...localValues.value })
}

function handleCancel() {
  emit('close')
}

// Cleanup on unmount
onBeforeUnmount(() => {
  document.removeEventListener('mousemove', handleDragMove)
  document.removeEventListener('mouseup', handleDragEnd)
  document.removeEventListener('touchmove', handleDragMove)
  document.removeEventListener('touchend', handleDragEnd)
})
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="overlay icon-modal-overlay" @click="handleCancel" @keydown.esc.stop="handleCancel">
      <div class="modal icon-customization-modal modal-instant" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">Customize Icon</h2>
          <button class="close-button" @click="handleCancel" aria-label="Close">×</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label for="website-icon" class="form-label">Custom Icon URL</label>
            <input
              id="website-icon"
              v-model="localValues.customIcon"
              type="text"
              class="form-input"
              placeholder="e.g., https://example.com/icon.png"
            />
          </div>

          <div class="form-group">
            <label for="icon-zoom" class="form-label">
              Icon Zoom ({{ zoomPercentage }}%)
            </label>
            <input
              id="icon-zoom"
              v-model.number="localValues.iconZoom"
              type="range"
              min="0.5"
              max="2"
              step="0.05"
              class="form-slider"
            />
            <div class="zoom-controls">
              <button type="button" class="zoom-preset" @click="setZoom(0.5)">50%</button>
              <button type="button" class="zoom-preset" @click="setZoom(0.75)">75%</button>
              <button type="button" class="zoom-preset" @click="setZoom(1)">100%</button>
              <button type="button" class="zoom-preset" @click="setZoom(1.5)">150%</button>
              <button type="button" class="zoom-preset" @click="setZoom(2)">200%</button>
            </div>
          </div>

          <div class="form-group">
            <label for="icon-offset-x" class="form-label">
              Horizontal Position ({{ localValues.iconOffsetX > 0 ? '+' : '' }}{{ localValues.iconOffsetX }}%)
            </label>
            <input
              id="icon-offset-x"
              v-model.number="localValues.iconOffsetX"
              type="range"
              min="-50"
              max="50"
              step="1"
              class="form-slider"
            />
            <div class="offset-controls">
              <button type="button" class="offset-preset" @click="localValues.iconOffsetX = -50">Left</button>
              <button type="button" class="offset-preset" @click="localValues.iconOffsetX = 0">Center</button>
              <button type="button" class="offset-preset" @click="localValues.iconOffsetX = 50">Right</button>
            </div>
          </div>

          <div class="form-group">
            <label for="icon-offset-y" class="form-label">
              Vertical Position ({{ localValues.iconOffsetY > 0 ? '+' : '' }}{{ localValues.iconOffsetY }}%)
            </label>
            <input
              id="icon-offset-y"
              v-model.number="localValues.iconOffsetY"
              type="range"
              min="-50"
              max="50"
              step="1"
              class="form-slider"
            />
            <div class="offset-controls">
              <button type="button" class="offset-preset" @click="localValues.iconOffsetY = -50">Top</button>
              <button type="button" class="offset-preset" @click="localValues.iconOffsetY = 0">Middle</button>
              <button type="button" class="offset-preset" @click="localValues.iconOffsetY = 50">Bottom</button>
            </div>
          </div>

          <div class="form-group">
            <label for="icon-bg-color" class="form-label">
              Icon Background Color
            </label>
            <div class="color-picker-container">
              <input
                id="icon-bg-color"
                v-model="localValues.iconBackgroundColor"
                type="color"
                class="color-input"
              />
              <input
                v-model="localValues.iconBackgroundColor"
                type="text"
                class="form-input color-text-input"
                placeholder="transparent, #000000, rgb(255,0,0)"
              />
            </div>
            <div class="color-presets">
              <button type="button" class="color-preset" @click="setBackgroundColor('transparent')" style="background: linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, white 25%, white 75%, #ccc 75%, #ccc); background-size: 10px 10px; background-position: 0 0, 5px 5px;">None</button>
              <button type="button" class="color-preset" @click="setBackgroundColor('#000000')" style="background: #000000; color: white;">Black</button>
              <button type="button" class="color-preset" @click="setBackgroundColor('#FFFFFF')" style="background: #FFFFFF; color: black; border: 1px solid #ddd;">White</button>
              <button type="button" class="color-preset" @click="setBackgroundColor('#FF6B6B')" style="background: #FF6B6B; color: white;">Red</button>
              <button type="button" class="color-preset" @click="setBackgroundColor('#4ECDC4')" style="background: #4ECDC4; color: white;">Teal</button>
              <button type="button" class="color-preset" @click="setBackgroundColor('#45B7D1')" style="background: #45B7D1; color: white;">Blue</button>
              <button type="button" class="color-preset" @click="setBackgroundColor('#FFA07A')" style="background: #FFA07A; color: white;">Orange</button>
              <button type="button" class="color-preset" @click="setBackgroundColor('#9B59B6')" style="background: #9B59B6; color: white;">Purple</button>
            </div>
          </div>

          <div v-if="url || localValues.customIcon" class="form-group">
            <label class="form-label">
              Icon Preview
              <span class="preview-hint">(drag to reposition)</span>
            </label>
            <div class="icon-preview">
              <div
                class="preview-icon"
                :style="{ backgroundColor: localValues.iconBackgroundColor }"
                :class="{ 'is-dragging': isDragging }"
              >
                <img
                  v-if="iconSrc"
                  :src="iconSrc"
                  :style="{
                    transform: `scale(${localValues.iconZoom}) translate(${localValues.iconOffsetX}%, ${localValues.iconOffsetY}%)`,
                    cursor: isDragging ? 'grabbing' : 'grab'
                  }"
                  alt="Icon preview"
                  draggable="false"
                  @mousedown="handleDragStart"
                  @touchstart="handleDragStart"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="modal-button secondary" @click="handleCancel">Cancel</button>
          <button type="button" class="modal-button primary" @click="handleApply">Apply</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.icon-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 4000;
}

.icon-customization-modal {
  z-index: 4001;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px) saturate(180%);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4),
              0 2px 6px rgba(0, 0, 0, 0.1),
              inset 0 1px 0 rgba(255, 255, 255, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px 16px;
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
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.05);
  color: rgba(0, 0, 0, 0.6);
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  background: rgba(0, 0, 0, 0.1);
  color: rgba(0, 0, 0, 0.9);
}

.modal-body {
  padding: 24px 32px;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px 32px 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.modal-button {
  flex: 1;
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.modal-button.primary {
  background: #007AFF;
  color: white;
}

.modal-button.primary:hover {
  background: #0051D5;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.modal-button.secondary {
  background: rgba(0, 0, 0, 0.05);
  color: rgba(0, 0, 0, 0.7);
}

.modal-button.secondary:hover {
  background: rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.modal-button:active {
  transform: scale(0.98);
}

/* Form styles from IconCustomization.vue */
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
  outline: none;
}

.form-input::placeholder {
  color: rgba(0, 0, 0, 0.3);
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

.zoom-controls,
.offset-controls {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.zoom-preset,
.offset-preset {
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

.zoom-preset:hover,
.offset-preset:hover {
  background: rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.zoom-preset:active,
.offset-preset:active {
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

.preview-hint {
  font-size: 11px;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.5);
  margin-left: 8px;
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

.preview-icon.is-dragging {
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.4),
              0 2px 6px rgba(0, 0, 0, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.preview-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
}

@media (prefers-color-scheme: dark) {
  .icon-customization-modal {
    background: rgba(28, 28, 30, 0.95);
  }

  .modal-header {
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }

  .modal-title {
    color: rgba(255, 255, 255, 0.9);
  }

  .close-button {
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.6);
  }

  .close-button:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
  }

  .modal-footer {
    border-top-color: rgba(255, 255, 255, 0.1);
  }

  .modal-button.primary {
    background: #0A84FF;
  }

  .modal-button.primary:hover {
    background: #0066CC;
  }

  .modal-button.secondary {
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.7);
  }

  .modal-button.secondary:hover {
    background: rgba(255, 255, 255, 0.1);
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

  .form-input::placeholder {
    color: rgba(255, 255, 255, 0.3);
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

  .zoom-preset,
  .offset-preset {
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.7);
  }

  .zoom-preset:hover,
  .offset-preset:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .preview-hint {
    color: rgba(255, 255, 255, 0.5);
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

@media (max-width: 768px) {
  .color-presets {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 640px) {
  .modal-header {
    padding: 20px 24px 12px;
  }

  .modal-body {
    padding: 20px 24px;
  }

  .modal-footer {
    padding: 12px 24px 20px;
  }

  .color-presets {
    grid-template-columns: repeat(2, 1fr);
  }

  .color-picker-container {
    flex-direction: column;
    align-items: stretch;
  }

  .color-input {
    width: 100%;
  }

  .preview-icon {
    width: 80px;
    height: 80px;
  }
}
</style>
