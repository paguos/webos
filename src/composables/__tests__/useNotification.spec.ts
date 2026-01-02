import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNotification } from '../useNotification'
import { useNotificationStore } from '../../stores/notificationStore'
import { AppError, ErrorType, DuplicateError } from '../../utils/errors'

describe('useNotification', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('showSuccess', () => {
    it('should show success notification', () => {
      const { showSuccess } = useNotification()
      const notificationStore = useNotificationStore()

      showSuccess('Success message')

      expect(notificationStore.notifications.length).toBe(1)
      expect(notificationStore.notifications[0].type).toBe('success')
      expect(notificationStore.notifications[0].message).toBe('Success message')
    })

    it('should accept custom duration', () => {
      const { showSuccess } = useNotification()

      const notification = showSuccess('Success message', 5000)

      expect(notification.duration).toBe(5000)
    })
  })

  describe('showError', () => {
    it('should show error notification with string error', () => {
      const { showError } = useNotification()
      const notificationStore = useNotificationStore()

      showError('Error message')

      expect(notificationStore.notifications.length).toBe(1)
      expect(notificationStore.notifications[0].type).toBe('error')
      expect(notificationStore.notifications[0].message).toBe('Error message')
    })

    it('should show error notification with Error object', () => {
      const { showError } = useNotification()
      const notificationStore = useNotificationStore()

      showError(new Error('Error message'))

      expect(notificationStore.notifications.length).toBe(1)
      expect(notificationStore.notifications[0].message).toBe('Error message')
    })

    it('should show error notification with AppError', () => {
      const { showError } = useNotification()
      const notificationStore = useNotificationStore()

      showError(new AppError(ErrorType.VALIDATION_ERROR, 'Validation failed'))

      expect(notificationStore.notifications.length).toBe(1)
      expect(notificationStore.notifications[0].message).toBe('Validation failed')
    })

    it('should show error notification with DuplicateError', () => {
      const { showError } = useNotification()
      const notificationStore = useNotificationStore()

      showError(new DuplicateError('tag'))

      expect(notificationStore.notifications.length).toBe(1)
      expect(notificationStore.notifications[0].message).toContain('tag with this name already exists')
    })

    it('should format unknown error types', () => {
      const { showError } = useNotification()
      const notificationStore = useNotificationStore()

      showError(123)

      expect(notificationStore.notifications.length).toBe(1)
      expect(notificationStore.notifications[0].message).toBe('An unexpected error occurred')
    })
  })

  describe('showWarning', () => {
    it('should show warning notification', () => {
      const { showWarning } = useNotification()
      const notificationStore = useNotificationStore()

      showWarning('Warning message')

      expect(notificationStore.notifications.length).toBe(1)
      expect(notificationStore.notifications[0].type).toBe('warning')
      expect(notificationStore.notifications[0].message).toBe('Warning message')
    })
  })

  describe('showInfo', () => {
    it('should show info notification', () => {
      const { showInfo } = useNotification()
      const notificationStore = useNotificationStore()

      showInfo('Info message')

      expect(notificationStore.notifications.length).toBe(1)
      expect(notificationStore.notifications[0].type).toBe('info')
      expect(notificationStore.notifications[0].message).toBe('Info message')
    })
  })

  describe('dismiss', () => {
    it('should dismiss notification by ID', () => {
      const { showSuccess, dismiss } = useNotification()
      const notificationStore = useNotificationStore()

      const notification = showSuccess('Test message')

      expect(notificationStore.notifications.length).toBe(1)

      dismiss(notification.id)

      expect(notificationStore.notifications.length).toBe(0)
    })
  })

  describe('clearAll', () => {
    it('should clear all notifications', () => {
      const { showSuccess, showError, showWarning, clearAll } = useNotification()
      const notificationStore = useNotificationStore()

      showSuccess('Success')
      showError('Error')
      showWarning('Warning')

      expect(notificationStore.notifications.length).toBe(3)

      clearAll()

      expect(notificationStore.notifications.length).toBe(0)
    })
  })
})
