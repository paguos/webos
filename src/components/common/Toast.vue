<script setup lang="ts">
import { useNotificationStore } from '../../stores/notificationStore'

const notificationStore = useNotificationStore()

function getIcon(type: string): string {
  switch (type) {
    case 'success':
      return '✓'
    case 'error':
      return '✕'
    case 'warning':
      return '⚠'
    case 'info':
      return 'ℹ'
    default:
      return 'ℹ'
  }
}

function dismiss(id: string) {
  notificationStore.removeNotification(id)
}
</script>

<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="notification in notificationStore.notifications"
          :key="notification.id"
          class="toast"
          :class="`toast-${notification.type}`"
          role="alert"
          :aria-live="notification.type === 'error' ? 'assertive' : 'polite'"
        >
          <div class="toast-icon">
            {{ getIcon(notification.type) }}
          </div>
          <div class="toast-message">
            {{ notification.message }}
          </div>
          <button
            v-if="notification.dismissible !== false"
            type="button"
            class="toast-close"
            :aria-label="`Dismiss ${notification.type} notification`"
            @click="dismiss(notification.id)"
          >
            ×
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
}

.toast {
  min-width: 300px;
  max-width: 500px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15),
              0 0 0 1px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(10px);
  pointer-events: auto;
  transition: all 0.3s ease;
}

.toast-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 14px;
  font-weight: 600;
}

.toast-message {
  flex: 1;
  font-size: 14px;
  line-height: 1.5;
  color: rgba(0, 0, 0, 0.9);
}

.toast-close {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.05);
  border: none;
  border-radius: 50%;
  font-size: 20px;
  line-height: 1;
  color: rgba(0, 0, 0, 0.5);
  cursor: pointer;
  transition: all 0.2s ease;
}

.toast-close:hover {
  background: rgba(0, 0, 0, 0.1);
  color: rgba(0, 0, 0, 0.7);
  transform: scale(1.1);
}

.toast-close:active {
  transform: scale(0.95);
}

/* Success variant */
.toast-success {
  border-left: 4px solid #34C759;
}

.toast-success .toast-icon {
  background: rgba(52, 199, 89, 0.1);
  color: #34C759;
}

/* Error variant */
.toast-error {
  border-left: 4px solid #FF3B30;
}

.toast-error .toast-icon {
  background: rgba(255, 59, 48, 0.1);
  color: #FF3B30;
}

/* Warning variant */
.toast-warning {
  border-left: 4px solid #FF9500;
}

.toast-warning .toast-icon {
  background: rgba(255, 149, 0, 0.1);
  color: #FF9500;
}

/* Info variant */
.toast-info {
  border-left: 4px solid #007AFF;
}

.toast-info .toast-icon {
  background: rgba(0, 122, 255, 0.1);
  color: #007AFF;
}

/* Toast animations */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}

.toast-move {
  transition: transform 0.3s ease;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .toast {
    background: rgba(30, 30, 30, 0.95);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4),
                0 0 0 1px rgba(255, 255, 255, 0.1);
  }

  .toast-message {
    color: rgba(255, 255, 255, 0.9);
  }

  .toast-close {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.6);
  }

  .toast-close:hover {
    background: rgba(255, 255, 255, 0.15);
    color: rgba(255, 255, 255, 0.8);
  }

  /* Dark mode variants */
  .toast-success {
    border-left-color: #30D158;
  }

  .toast-success .toast-icon {
    background: rgba(48, 209, 88, 0.15);
    color: #30D158;
  }

  .toast-error {
    border-left-color: #FF453A;
  }

  .toast-error .toast-icon {
    background: rgba(255, 69, 58, 0.15);
    color: #FF453A;
  }

  .toast-warning {
    border-left-color: #FF9F0A;
  }

  .toast-warning .toast-icon {
    background: rgba(255, 159, 10, 0.15);
    color: #FF9F0A;
  }

  .toast-info {
    border-left-color: #0A84FF;
  }

  .toast-info .toast-icon {
    background: rgba(10, 132, 255, 0.15);
    color: #0A84FF;
  }
}

/* Mobile responsive */
@media (max-width: 640px) {
  .toast-container {
    top: 10px;
    right: 10px;
    left: 10px;
  }

  .toast {
    min-width: 0;
    max-width: none;
  }
}

/* Accessibility: Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .toast-enter-active,
  .toast-leave-active,
  .toast-move {
    transition: none;
  }

  .toast-enter-from,
  .toast-leave-to {
    opacity: 0;
    transform: none;
  }
}
</style>
