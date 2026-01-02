import { useNotificationStore } from '../stores/notificationStore'
import { formatError } from '../utils/errors'
import type { Notification } from '../types'

/**
 * Composable for showing notifications
 * Provides convenient helpers for displaying toast messages
 */
export function useNotification() {
  const notificationStore = useNotificationStore()

  /**
   * Show a success notification
   */
  function showSuccess(message: string, duration?: number, dismissible?: boolean): Notification {
    return notificationStore.showSuccess(message, duration, dismissible)
  }

  /**
   * Show an error notification
   * Can accept an Error object or string
   */
  function showError(error: unknown, duration?: number, dismissible?: boolean): Notification {
    const message = formatError(error)
    return notificationStore.showError(message, duration, dismissible)
  }

  /**
   * Show a warning notification
   */
  function showWarning(message: string, duration?: number, dismissible?: boolean): Notification {
    return notificationStore.showWarning(message, duration, dismissible)
  }

  /**
   * Show an info notification
   */
  function showInfo(message: string, duration?: number, dismissible?: boolean): Notification {
    return notificationStore.showInfo(message, duration, dismissible)
  }

  /**
   * Dismiss a specific notification
   */
  function dismiss(id: string): void {
    notificationStore.removeNotification(id)
  }

  /**
   * Clear all notifications
   */
  function clearAll(): void {
    notificationStore.clearAll()
  }

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    dismiss,
    clearAll
  }
}
