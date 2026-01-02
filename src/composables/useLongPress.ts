import { ref, onUnmounted, type Ref } from 'vue'

type HapticStyle = 'light' | 'medium' | 'heavy' | 'selection'

interface LongPressHandlers {
  onMousedown: (event: MouseEvent) => void
  onMouseup: () => void
  onMouseleave: () => void
  onTouchstart: (event: TouchEvent) => void
  onTouchend: () => void
  onTouchcancel: () => void
  triggerHaptic: (style?: HapticStyle) => void
}

/**
 * Composable for iOS-style long press detection
 * @param callback - Function to call when long press is detected
 * @param duration - Duration in ms (default 500ms like iOS)
 * @returns Event handlers for long press detection
 */
export function useLongPress(
  callback: (event: MouseEvent | TouchEvent) => void,
  duration: number = 500
): LongPressHandlers {
  const pressTimer: Ref<ReturnType<typeof setTimeout> | null> = ref(null)
  const isPressed = ref(false)

  // Trigger haptic feedback if available
  function triggerHaptic(style: HapticStyle = 'medium'): void {
    if ('vibrate' in navigator) {
      // iOS-style haptic patterns
      const patterns: Record<HapticStyle, number[]> = {
        light: [10],
        medium: [20],
        heavy: [30],
        selection: [10, 50, 10]
      }
      navigator.vibrate(patterns[style] || patterns.medium)
    }
  }

  function start(event: MouseEvent | TouchEvent): void {
    // Prevent default to avoid text selection
    if (event.cancelable) {
      event.preventDefault()
    }

    isPressed.value = true

    pressTimer.value = setTimeout(() => {
      if (isPressed.value) {
        triggerHaptic('medium') // Haptic feedback on long press activation
        callback(event)
      }
    }, duration)
  }

  function cancel(): void {
    if (pressTimer.value) {
      clearTimeout(pressTimer.value)
      pressTimer.value = null
    }
    isPressed.value = false
  }

  // Clean up on unmount
  onUnmounted(() => {
    cancel()
  })

  return {
    onMousedown: start,
    onMouseup: cancel,
    onMouseleave: cancel,
    onTouchstart: start,
    onTouchend: cancel,
    onTouchcancel: cancel,
    triggerHaptic
  }
}

export default useLongPress
