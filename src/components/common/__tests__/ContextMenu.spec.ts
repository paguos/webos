import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import ContextMenu from '../ContextMenu.vue'
import { useUIStore } from '../../../stores/uiStore.ts'
import { useWebsitesStore } from '../../../stores/websitesStore.ts'
import type { Website } from '../../../types'

// Mock the urlOpener module
vi.mock('../../../utils/urlOpener', () => ({
  openUrl: vi.fn()
}))

describe('ContextMenu', () => {
  const mockWebsite: Website = {
    id: '1',
    name: 'GitHub',
    url: 'https://github.com',
    favicon: 'https://github.com/favicon.ico',
    tagIds: [],
    customIcon: null,
    iconZoom: 1,
    iconOffsetX: 0,
    iconOffsetY: 0,
    iconBackgroundColor: 'transparent',
    extraLinks: [],
    position: { page: 0, order: 0 },
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      visitCount: 0,
      lastVisited: null
    }
  }

  let wrappers: any[] = []

  beforeEach(() => {
    setActivePinia(createPinia())
    document.body.innerHTML = ''
    wrappers = []
  })

  afterEach(async () => {
    // Unmount all wrappers first to let Vue clean up Teleports properly
    for (const wrapper of wrappers) {
      if (wrapper) {
        wrapper.unmount()
      }
    }
    // Wait for unmounting to complete
    await flushPromises()
    // Now safe to clear body
    document.body.innerHTML = ''
  })

  it('should not render when showContextMenu is false', async () => {
    const wrapper = mount(ContextMenu, { attachTo: document.body })
    wrappers.push(wrapper)
    await wrapper.vm.$nextTick()

    expect(document.querySelector('.context-menu')).toBeFalsy()
  })

  it('should render when showContextMenu is true', async () => {
    const wrapper = mount(ContextMenu, { attachTo: document.body })
    wrappers.push(wrapper)
    const uiStore = useUIStore()

    uiStore.openContextMenu(mockWebsite, { x: 100, y: 200 })
    await wrapper.vm.$nextTick()

    expect(document.querySelector('.context-menu')).toBeTruthy()
  })

  it('should render at correct position', async () => {
    const wrapper = mount(ContextMenu, { attachTo: document.body })
    wrappers.push(wrapper)
    const uiStore = useUIStore()

    uiStore.openContextMenu(mockWebsite, { x: 150, y: 250 })
    await wrapper.vm.$nextTick()

    const menu = document.querySelector('.context-menu') as HTMLElement
    expect(menu.style.left).toBe('150px')
    expect(menu.style.top).toBe('250px')
  })

  it('should render all menu items for website without extra links', async () => {
    const wrapper = mount(ContextMenu, { attachTo: document.body })
    wrappers.push(wrapper)
    const uiStore = useUIStore()

    uiStore.openContextMenu(mockWebsite, { x: 100, y: 100 })
    await wrapper.vm.$nextTick()

    const menuItems = document.querySelectorAll('.context-menu-item')
    expect(menuItems.length).toBe(3) // Open, Edit, Delete
    expect(menuItems[0].textContent?.trim()).toContain('Open')
    expect(menuItems[1].textContent?.trim()).toContain('Edit')
    expect(menuItems[2].textContent?.trim()).toContain('Delete')
  })

  it('should render extra links when present', async () => {
    const websiteWithLinks: Website = {
      ...mockWebsite,
      extraLinks: [
        { id: '1', name: 'Issues', url: 'https://github.com/issues' },
        { id: '2', name: 'Pull Requests', url: 'https://github.com/pulls' }
      ]
    }

    const wrapper = mount(ContextMenu, { attachTo: document.body })
    wrappers.push(wrapper)
    const uiStore = useUIStore()

    uiStore.openContextMenu(websiteWithLinks, { x: 100, y: 100 })
    await wrapper.vm.$nextTick()

    const menuItems = document.querySelectorAll('.context-menu-item')
    expect(menuItems.length).toBe(5) // Open, Issues, Pull Requests, Edit, Delete
    expect(menuItems[1].textContent?.trim()).toContain('Issues')
    expect(menuItems[2].textContent?.trim()).toContain('Pull Requests')
  })

  it('should sort extra links alphabetically', async () => {
    const websiteWithLinks: Website = {
      ...mockWebsite,
      extraLinks: [
        { id: '1', name: 'Zebra', url: 'https://example.com/z' },
        { id: '2', name: 'Apple', url: 'https://example.com/a' },
        { id: '3', name: 'Mango', url: 'https://example.com/m' }
      ]
    }

    const wrapper = mount(ContextMenu, { attachTo: document.body })
    wrappers.push(wrapper)
    const uiStore = useUIStore()

    uiStore.openContextMenu(websiteWithLinks, { x: 100, y: 100 })
    await wrapper.vm.$nextTick()

    const menuItems = document.querySelectorAll('.context-menu-item')
    expect(menuItems[1].textContent?.trim()).toContain('Apple')
    expect(menuItems[2].textContent?.trim()).toContain('Mango')
    expect(menuItems[3].textContent?.trim()).toContain('Zebra')
  })

  it('should close context menu when clicking outside', async () => {
    const wrapper = mount(ContextMenu, { attachTo: document.body })
    wrappers.push(wrapper)
    const uiStore = useUIStore()

    uiStore.openContextMenu(mockWebsite, { x: 100, y: 100 })
    await flushPromises()

    expect(uiStore.showContextMenu).toBe(true)

    // Wait for the click listener to be attached (setTimeout in onMounted)
    await new Promise(resolve => setTimeout(resolve, 10))

    // Click outside the menu (on document body)
    document.body.click()
    await flushPromises()

    expect(uiStore.showContextMenu).toBe(false)
  })

  it('should close context menu on Escape key', async () => {
    const wrapper = mount(ContextMenu, { attachTo: document.body })
    wrappers.push(wrapper)
    const uiStore = useUIStore()

    uiStore.openContextMenu(mockWebsite, { x: 100, y: 100 })
    await flushPromises()

    expect(uiStore.showContextMenu).toBe(true)

    const event = new KeyboardEvent('keydown', { key: 'Escape' })
    document.dispatchEvent(event)

    // Wait for all async operations to complete
    await flushPromises()
    await wrapper.vm.$nextTick()

    expect(uiStore.showContextMenu).toBe(false)

    // Wait for Teleport cleanup
    await flushPromises()
  })

  it('should not close when clicking menu content', async () => {
    const wrapper = mount(ContextMenu, { attachTo: document.body })
    wrappers.push(wrapper)
    const uiStore = useUIStore()

    uiStore.openContextMenu(mockWebsite, { x: 100, y: 100 })
    await flushPromises()

    const menu = document.querySelector('.context-menu') as HTMLElement
    menu.click()
    await flushPromises()

    expect(uiStore.showContextMenu).toBe(true)
  })

  it('should call visitWebsite and close menu when Open is clicked', async () => {
    const wrapper = mount(ContextMenu, { attachTo: document.body })
    wrappers.push(wrapper)
    const uiStore = useUIStore()
    const websitesStore = useWebsitesStore()
    const visitSpy = vi.spyOn(websitesStore, 'visitWebsite')

    uiStore.openContextMenu(mockWebsite, { x: 100, y: 100 })
    await wrapper.vm.$nextTick()

    const openButton = Array.from(document.querySelectorAll('.context-menu-item'))
      .find(btn => btn.textContent?.includes('Open')) as HTMLElement
    openButton.click()
    await wrapper.vm.$nextTick()

    expect(visitSpy).toHaveBeenCalledWith(mockWebsite.id)
    expect(uiStore.showContextMenu).toBe(false)
  })

  it('should open website form and close menu when Edit is clicked', async () => {
    const wrapper = mount(ContextMenu, { attachTo: document.body })
    wrappers.push(wrapper)
    const uiStore = useUIStore()

    uiStore.openContextMenu(mockWebsite, { x: 100, y: 100 })
    await wrapper.vm.$nextTick()

    const editButton = Array.from(document.querySelectorAll('.context-menu-item'))
      .find(btn => btn.textContent?.includes('Edit')) as HTMLElement
    editButton.click()
    await wrapper.vm.$nextTick()

    expect(uiStore.showWebsiteForm).toBe(true)
    expect(uiStore.editingWebsite).toStrictEqual(mockWebsite)
    expect(uiStore.showContextMenu).toBe(false)
  })

  it('should open confirm dialog and close menu when Delete is clicked', async () => {
    const wrapper = mount(ContextMenu, { attachTo: document.body })
    wrappers.push(wrapper)
    const uiStore = useUIStore()

    uiStore.openContextMenu(mockWebsite, { x: 100, y: 100 })
    await wrapper.vm.$nextTick()

    const deleteButton = Array.from(document.querySelectorAll('.context-menu-item'))
      .find(btn => btn.textContent?.includes('Delete')) as HTMLElement
    deleteButton.click()
    await wrapper.vm.$nextTick()

    expect(uiStore.showConfirmDialog).toBe(true)
    expect(uiStore.confirmDialogConfig.title).toBe('Delete Website')
    expect(uiStore.showContextMenu).toBe(false)
  })

  it('should handle extra link clicks correctly', async () => {
    const websiteWithLinks: Website = {
      ...mockWebsite,
      extraLinks: [
        { id: '1', name: 'Issues', url: 'https://github.com/issues' }
      ]
    }

    const wrapper = mount(ContextMenu, { attachTo: document.body })
    wrappers.push(wrapper)
    const uiStore = useUIStore()
    const websitesStore = useWebsitesStore()
    const visitSpy = vi.spyOn(websitesStore, 'visitWebsite')

    uiStore.openContextMenu(websiteWithLinks, { x: 100, y: 100 })
    await wrapper.vm.$nextTick()

    const issuesButton = Array.from(document.querySelectorAll('.context-menu-item'))
      .find(btn => btn.textContent?.includes('Issues')) as HTMLElement
    issuesButton.click()
    await wrapper.vm.$nextTick()

    expect(visitSpy).toHaveBeenCalledWith(websiteWithLinks.id)
    expect(uiStore.showContextMenu).toBe(false)
  })

  it('should cleanup event listeners on unmount', async () => {
    const wrapper = mount(ContextMenu, { attachTo: document.body })
    wrappers.push(wrapper)
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')

    wrapper.unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
  })
})
