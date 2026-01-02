import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import Toast from '../Toast.vue'
import { useNotificationStore } from '../../../stores/notificationStore'

describe('Toast', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('should render nothing when no notifications', () => {
    mount(Toast, { attachTo: document.body })
    expect(document.querySelectorAll('.toast').length).toBe(0)
  })

  it('should render notification when added', async () => {
    const wrapper = mount(Toast, { attachTo: document.body })
    const notificationStore = useNotificationStore()

    notificationStore.showSuccess('Success message', 0)
    await wrapper.vm.$nextTick()

    expect(document.querySelectorAll('.toast').length).toBe(1)
    expect(document.body.textContent).toContain('Success message')
  })

  it('should render success toast with correct class', async () => {
    const wrapper = mount(Toast, { attachTo: document.body })
    const notificationStore = useNotificationStore()

    notificationStore.showSuccess('Success', 0)
    await wrapper.vm.$nextTick()

    const toast = document.querySelector('.toast')
    expect(toast?.classList.contains('toast-success')).toBe(true)
  })

  it('should render error toast with correct class', async () => {
    const wrapper = mount(Toast, { attachTo: document.body })
    const notificationStore = useNotificationStore()

    notificationStore.showError('Error', 0)
    await wrapper.vm.$nextTick()

    const toast = document.querySelector('.toast')
    expect(toast?.classList.contains('toast-error')).toBe(true)
  })

  it('should render warning toast with correct class', async () => {
    const wrapper = mount(Toast, { attachTo: document.body })
    const notificationStore = useNotificationStore()

    notificationStore.showWarning('Warning', 0)
    await wrapper.vm.$nextTick()

    const toast = document.querySelector('.toast')
    expect(toast?.classList.contains('toast-warning')).toBe(true)
  })

  it('should render info toast with correct class', async () => {
    const wrapper = mount(Toast, { attachTo: document.body })
    const notificationStore = useNotificationStore()

    notificationStore.showInfo('Info', 0)
    await wrapper.vm.$nextTick()

    const toast = document.querySelector('.toast')
    expect(toast?.classList.contains('toast-info')).toBe(true)
  })

  it('should display correct icon for success', async () => {
    const wrapper = mount(Toast, { attachTo: document.body })
    const notificationStore = useNotificationStore()

    notificationStore.showSuccess('Success', 0)
    await wrapper.vm.$nextTick()

    const icon = document.querySelector('.toast-icon')
    expect(icon?.textContent).toBe('✓')
  })

  it('should display correct icon for error', async () => {
    const wrapper = mount(Toast, { attachTo: document.body })
    const notificationStore = useNotificationStore()

    notificationStore.showError('Error', 0)
    await wrapper.vm.$nextTick()

    const icon = document.querySelector('.toast-icon')
    expect(icon?.textContent).toBe('✕')
  })

  it('should display correct icon for warning', async () => {
    const wrapper = mount(Toast, { attachTo: document.body })
    const notificationStore = useNotificationStore()

    notificationStore.showWarning('Warning', 0)
    await wrapper.vm.$nextTick()

    const icon = document.querySelector('.toast-icon')
    expect(icon?.textContent).toBe('⚠')
  })

  it('should display correct icon for info', async () => {
    const wrapper = mount(Toast, { attachTo: document.body })
    const notificationStore = useNotificationStore()

    notificationStore.showInfo('Info', 0)
    await wrapper.vm.$nextTick()

    const icon = document.querySelector('.toast-icon')
    expect(icon?.textContent).toBe('ℹ')
  })

  it('should show close button when dismissible is true', async () => {
    const wrapper = mount(Toast, { attachTo: document.body })
    const notificationStore = useNotificationStore()

    notificationStore.showSuccess('Success', 0, true)
    await wrapper.vm.$nextTick()

    expect(document.querySelector('.toast-close')).toBeTruthy()
  })

  it('should hide close button when dismissible is false', async () => {
    const wrapper = mount(Toast, { attachTo: document.body })
    const notificationStore = useNotificationStore()

    notificationStore.showSuccess('Success', 0, false)
    await wrapper.vm.$nextTick()

    expect(document.querySelector('.toast-close')).toBeFalsy()
  })

  it('should dismiss notification when close button is clicked', async () => {
    const wrapper = mount(Toast, { attachTo: document.body })
    const notificationStore = useNotificationStore()

    notificationStore.showSuccess('Success', 0)
    await wrapper.vm.$nextTick()

    expect(document.querySelectorAll('.toast').length).toBe(1)

    const closeButton = document.querySelector('.toast-close') as HTMLElement
    closeButton?.click()
    await wrapper.vm.$nextTick()

    expect(document.querySelectorAll('.toast').length).toBe(0)
  })

  it('should render multiple notifications in stack', async () => {
    const wrapper = mount(Toast, { attachTo: document.body })
    const notificationStore = useNotificationStore()

    notificationStore.showSuccess('Success 1', 0)
    notificationStore.showError('Error 1', 0)
    notificationStore.showWarning('Warning 1', 0)
    await wrapper.vm.$nextTick()

    expect(document.querySelectorAll('.toast').length).toBe(3)
    expect(document.body.textContent).toContain('Success 1')
    expect(document.body.textContent).toContain('Error 1')
    expect(document.body.textContent).toContain('Warning 1')
  })

  it('should have proper accessibility attributes', async () => {
    const wrapper = mount(Toast, { attachTo: document.body })
    const notificationStore = useNotificationStore()

    notificationStore.showError('Error', 0)
    await wrapper.vm.$nextTick()

    const toast = document.querySelector('.toast')
    expect(toast?.getAttribute('role')).toBe('alert')
    expect(toast?.getAttribute('aria-live')).toBe('assertive')
  })

  it('should use polite aria-live for non-error notifications', async () => {
    const wrapper = mount(Toast, { attachTo: document.body })
    const notificationStore = useNotificationStore()

    notificationStore.showSuccess('Success', 0)
    await wrapper.vm.$nextTick()

    const toast = document.querySelector('.toast')
    expect(toast?.getAttribute('aria-live')).toBe('polite')
  })

  it('should have proper aria-label for close button', async () => {
    const wrapper = mount(Toast, { attachTo: document.body })
    const notificationStore = useNotificationStore()

    notificationStore.showSuccess('Success', 0)
    await wrapper.vm.$nextTick()

    const closeButton = document.querySelector('.toast-close')
    expect(closeButton?.getAttribute('aria-label')).toBe('Dismiss success notification')
  })
})
