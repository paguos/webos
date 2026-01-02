import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNotificationStore } from '../notificationStore'
import { NotificationType } from '../../types'

describe('notificationStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should initialize with empty notifications', () => {
    const store = useNotificationStore()
    expect(store.notifications).toEqual([])
  })

  describe('addNotification', () => {
    it('should add a notification to the queue', () => {
      const store = useNotificationStore()
      const notification = store.addNotification(NotificationType.SUCCESS, 'Test message')

      expect(store.notifications.length).toBe(1)
      expect(notification.type).toBe(NotificationType.SUCCESS)
      expect(notification.message).toBe('Test message')
      expect(notification.id).toBeTruthy()
    })

    it('should auto-dismiss notification after duration', () => {
      const store = useNotificationStore()
      store.addNotification(NotificationType.SUCCESS, 'Test message', 1000)

      expect(store.notifications.length).toBe(1)

      vi.advanceTimersByTime(1000)

      expect(store.notifications.length).toBe(0)
    })

    it('should not auto-dismiss if duration is 0', () => {
      const store = useNotificationStore()
      store.addNotification(NotificationType.SUCCESS, 'Test message', 0)

      expect(store.notifications.length).toBe(1)

      vi.advanceTimersByTime(10000)

      expect(store.notifications.length).toBe(1)
    })

    it('should set default duration to 4000ms', () => {
      const store = useNotificationStore()
      store.addNotification(NotificationType.SUCCESS, 'Test message')

      expect(store.notifications.length).toBe(1)

      vi.advanceTimersByTime(3999)
      expect(store.notifications.length).toBe(1)

      vi.advanceTimersByTime(1)
      expect(store.notifications.length).toBe(0)
    })

    it('should set dismissible to true by default', () => {
      const store = useNotificationStore()
      const notification = store.addNotification(NotificationType.SUCCESS, 'Test message')

      expect(notification.dismissible).toBe(true)
    })
  })

  describe('removeNotification', () => {
    it('should remove notification by ID', () => {
      const store = useNotificationStore()
      const notification = store.addNotification(NotificationType.SUCCESS, 'Test message', 0)

      expect(store.notifications.length).toBe(1)

      store.removeNotification(notification.id)

      expect(store.notifications.length).toBe(0)
    })

    it('should do nothing if ID not found', () => {
      const store = useNotificationStore()
      store.addNotification(NotificationType.SUCCESS, 'Test message', 0)

      store.removeNotification('nonexistent-id')

      expect(store.notifications.length).toBe(1)
    })
  })

  describe('clearAll', () => {
    it('should clear all notifications', () => {
      const store = useNotificationStore()
      store.addNotification(NotificationType.SUCCESS, 'Message 1', 0)
      store.addNotification(NotificationType.ERROR, 'Message 2', 0)
      store.addNotification(NotificationType.WARNING, 'Message 3', 0)

      expect(store.notifications.length).toBe(3)

      store.clearAll()

      expect(store.notifications.length).toBe(0)
    })
  })

  describe('showSuccess', () => {
    it('should add a success notification', () => {
      const store = useNotificationStore()
      const notification = store.showSuccess('Success message')

      expect(notification.type).toBe(NotificationType.SUCCESS)
      expect(notification.message).toBe('Success message')
      expect(store.notifications.length).toBe(1)
    })

    it('should accept custom duration', () => {
      const store = useNotificationStore()
      store.showSuccess('Success message', 2000)

      vi.advanceTimersByTime(2000)

      expect(store.notifications.length).toBe(0)
    })
  })

  describe('showError', () => {
    it('should add an error notification', () => {
      const store = useNotificationStore()
      const notification = store.showError('Error message')

      expect(notification.type).toBe(NotificationType.ERROR)
      expect(notification.message).toBe('Error message')
      expect(store.notifications.length).toBe(1)
    })
  })

  describe('showWarning', () => {
    it('should add a warning notification', () => {
      const store = useNotificationStore()
      const notification = store.showWarning('Warning message')

      expect(notification.type).toBe(NotificationType.WARNING)
      expect(notification.message).toBe('Warning message')
      expect(store.notifications.length).toBe(1)
    })
  })

  describe('showInfo', () => {
    it('should add an info notification', () => {
      const store = useNotificationStore()
      const notification = store.showInfo('Info message')

      expect(notification.type).toBe(NotificationType.INFO)
      expect(notification.message).toBe('Info message')
      expect(store.notifications.length).toBe(1)
    })
  })

  describe('multiple notifications', () => {
    it('should handle multiple notifications in queue', () => {
      const store = useNotificationStore()

      store.showSuccess('Success 1', 0)
      store.showError('Error 1', 0)
      store.showWarning('Warning 1', 0)

      expect(store.notifications.length).toBe(3)
      expect(store.notifications[0].type).toBe(NotificationType.SUCCESS)
      expect(store.notifications[1].type).toBe(NotificationType.ERROR)
      expect(store.notifications[2].type).toBe(NotificationType.WARNING)
    })

    it('should auto-dismiss notifications independently', () => {
      const store = useNotificationStore()

      store.showSuccess('Success 1', 1000)
      store.showError('Error 1', 2000)
      store.showWarning('Warning 1', 3000)

      expect(store.notifications.length).toBe(3)

      vi.advanceTimersByTime(1000)
      expect(store.notifications.length).toBe(2)

      vi.advanceTimersByTime(1000)
      expect(store.notifications.length).toBe(1)

      vi.advanceTimersByTime(1000)
      expect(store.notifications.length).toBe(0)
    })
  })
})
