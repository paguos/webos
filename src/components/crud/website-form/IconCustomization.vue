<script setup lang="ts">
import { ref, computed } from 'vue'
import { normalizeUrl } from '../../../utils/validators'

interface Props {
  customIcon: string
  iconZoom: number
  iconOffsetX: number
  iconOffsetY: number
  iconBackgroundColor: string
  url: string
}

interface Emits {
  (e: 'update:customIcon', value: string): void
  (e: 'update:iconZoom', value: number): void
  (e: 'update:iconOffsetX', value: number): void
  (e: 'update:iconOffsetY', value: number): void
  (e: 'update:iconBackgroundColor', value: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0, offsetX: 0, offsetY: 0 })

const zoomPercentage = computed(() => Math.round(props.iconZoom * 100))

const iconSrc = computed(() => {
  if (props.customIcon) {
    return props.customIcon
  }
  if (props.url) {
    return `https://www.google.com/s2/favicons?domain=${normalizeUrl(props.url)}&sz=128`
  }
  return ''
})

function setZoom(value: number) {
  emit('update:iconZoom', value)
}

function setBackgroundColor(color: string) {
  emit('update:iconBackgroundColor', color)
}

function handleDragStart(e: MouseEvent | TouchEvent) {
  isDragging.value = true

  const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX
  const clientY = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY

  dragStart.value = {
    x: clientX,
    y: clientY,
    offsetX: props.iconOffsetX,
    offsetY: props.iconOffsetY
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

  // Calculate drag delta
  const deltaX = clientX - dragStart.value.x
  const deltaY = clientY - dragStart.value.y

  // Convert pixel delta to percentage delta
  // Preview icon is 100px, so 1px = 1% of icon size
  const percentDeltaX = deltaX
  const percentDeltaY = deltaY

  // Calculate new offset with clamping
  const newOffsetX = Math.max(-50, Math.min(50, dragStart.value.offsetX + percentDeltaX))
  const newOffsetY = Math.max(-50, Math.min(50, dragStart.value.offsetY + percentDeltaY))

  emit('update:iconOffsetX', Math.round(newOffsetX))
  emit('update:iconOffsetY', Math.round(newOffsetY))
}

function handleDragEnd() {
  isDragging.value = false
  document.removeEventListener('mousemove', handleDragMove)
  document.removeEventListener('mouseup', handleDragEnd)
  document.removeEventListener('touchmove', handleDragMove)
  document.removeEventListener('touchend', handleDragEnd)
}
</script>

<template>
  <div class="icon-customization">
    <div class="form-group">
      <label for="website-icon" class="form-label">Custom Icon URL (Optional)</label>
      <input
        id="website-icon"
        :value="customIcon"
        type="text"
        class="form-input"
        placeholder="e.g., https://example.com/icon.png"
        @input="emit('update:customIcon', ($event.target as HTMLInputElement).value)"
      />
    </div>

    <div class="form-group">
      <label for="icon-zoom" class="form-label">
        Icon Zoom ({{ zoomPercentage }}%)
      </label>
      <input
        id="icon-zoom"
        :value="iconZoom"
        type="range"
        min="0.5"
        max="2"
        step="0.05"
        class="form-slider"
        @input="emit('update:iconZoom', parseFloat(($event.target as HTMLInputElement).value))"
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
        Horizontal Position ({{ iconOffsetX > 0 ? '+' : '' }}{{ iconOffsetX }}%)
      </label>
      <input
        id="icon-offset-x"
        :value="iconOffsetX"
        type="range"
        min="-50"
        max="50"
        step="1"
        class="form-slider"
        @input="emit('update:iconOffsetX', parseFloat(($event.target as HTMLInputElement).value))"
      />
      <div class="offset-controls">
        <button type="button" class="offset-preset" @click="emit('update:iconOffsetX', -50)">Left</button>
        <button type="button" class="offset-preset" @click="emit('update:iconOffsetX', 0)">Center</button>
        <button type="button" class="offset-preset" @click="emit('update:iconOffsetX', 50)">Right</button>
      </div>
    </div>

    <div class="form-group">
      <label for="icon-offset-y" class="form-label">
        Vertical Position ({{ iconOffsetY > 0 ? '+' : '' }}{{ iconOffsetY }}%)
      </label>
      <input
        id="icon-offset-y"
        :value="iconOffsetY"
        type="range"
        min="-50"
        max="50"
        step="1"
        class="form-slider"
        @input="emit('update:iconOffsetY', parseFloat(($event.target as HTMLInputElement).value))"
      />
      <div class="offset-controls">
        <button type="button" class="offset-preset" @click="emit('update:iconOffsetY', -50)">Top</button>
        <button type="button" class="offset-preset" @click="emit('update:iconOffsetY', 0)">Middle</button>
        <button type="button" class="offset-preset" @click="emit('update:iconOffsetY', 50)">Bottom</button>
      </div>
    </div>

    <div class="form-group">
      <label for="icon-bg-color" class="form-label">
        Icon Background Color
      </label>
      <div class="color-picker-container">
        <input
          id="icon-bg-color"
          :value="iconBackgroundColor"
          type="color"
          class="color-input"
          @input="emit('update:iconBackgroundColor', ($event.target as HTMLInputElement).value)"
        />
        <input
          :value="iconBackgroundColor"
          type="text"
          class="form-input color-text-input"
          placeholder="transparent, #000000, rgb(255,0,0)"
          @input="emit('update:iconBackgroundColor', ($event.target as HTMLInputElement).value)"
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

    <div v-if="url || customIcon" class="form-group">
      <label class="form-label">
        Icon Preview
        <span class="preview-hint">(drag to reposition)</span>
      </label>
      <div class="icon-preview">
        <div
          class="preview-icon"
          :style="{ backgroundColor: iconBackgroundColor }"
          :class="{ 'is-dragging': isDragging }"
        >
          <img
            v-if="iconSrc"
            :src="iconSrc"
            :style="{
              transform: `scale(${iconZoom}) translate(${iconOffsetX}%, ${iconOffsetY}%)`,
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

.offset-controls {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

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

.offset-preset:hover {
  background: rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

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
  transition: transform 0.2s ease-out;
  user-select: none;
  -webkit-user-drag: none;
}

@media (prefers-color-scheme: dark) {
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

  .zoom-preset {
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.7);
  }

  .zoom-preset:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .offset-preset {
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.7);
  }

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
