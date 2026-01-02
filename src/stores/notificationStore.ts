import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import type { Notification } from '../types'
import { NotificationType } from '../types'

/**
 * Default duration for notifications (in milliseconds)
 */
const DEFAULT_DURATION = 4000

/**
 * Notification store for managing toast notifications
 */
export const useNotificationStore = defineStore('notification', () => {
  const notifications: Ref<Notification[]> = ref([])

  /**
   * Add a notification to the queue
   */
  function addNotification(
    type: NotificationType,
    message: string,
    duration: number = DEFAULT_DURATION,
    dismissible: boolean = true
  ): Notification {
    const notification: Notification = {
      id: uuidv4(),
      type,
      message,
      duration,
      dismissible
    }

    notifications.value.push(notification)

    // Auto-dismiss after duration (if duration > 0)
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(notification.id)
      }, duration)
    }

    return notification
  }

  /**
   * Remove a notification by ID
   */
  function removeNotification(id: string): void {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  }

  /**
   * Clear all notifications
   */
  function clearAll(): void {
    notifications.value = []
  }

  /**
   * Show a success notification
   */
  function showSuccess(message: string, duration?: number, dismissible?: boolean): Notification {
    return addNotification(NotificationType.SUCCESS, message, duration, dismissible)
  }

  /**
   * Show an error notification
   */
  function showError(message: string, duration?: number, dismissible?: boolean): Notification {
    return addNotification(NotificationType.ERROR, message, duration, dismissible)
  }

  /**
   * Show a warning notification
   */
  function showWarning(message: string, duration?: number, dismissible?: boolean): Notification {
    return addNotification(NotificationType.WARNING, message, duration, dismissible)
  }

  /**
   * Show an info notification
   */
  function showInfo(message: string, duration?: number, dismissible?: boolean): Notification {
    return addNotification(NotificationType.INFO, message, duration, dismissible)
  }

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
})
