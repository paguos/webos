import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Composable for iOS-style long press detection
 * @param {Function} callback - Function to call when long press is detected
 * @param {Number} duration - Duration in ms (default 500ms like iOS)
 * @returns {Object} Event handlers
 */
export function useLongPress(callback, duration = 500) {
  const pressTimer = ref(null)
  const isPressed = ref(false)

  // Trigger haptic feedback if available
  function triggerHaptic(style = 'medium') {
    if ('vibrate' in navigator) {
      // iOS-style haptic patterns
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30],
        selection: [10, 50, 10]
      }
      navigator.vibrate(patterns[style] || patterns.medium)
    }
  }

  function start(event) {
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

  function cancel() {
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
