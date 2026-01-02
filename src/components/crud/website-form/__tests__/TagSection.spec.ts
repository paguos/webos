import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import TagSection from '../TagSection.vue'
import { useWebsitesStore } from '../../../../stores/websitesStore'
import { useUIStore } from '../../../../stores/uiStore'

// Mock storage
vi.mock('../../../../utils/storage.ts', () => ({
  default: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue(true),
    clear: vi.fn()
  }
}))

describe('TagSection', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should render tags dropdown trigger', () => {
    const wrapper = mount(TagSection, {
      props: {
        selectedTagIds: []
      }
    })

    expect(wrapper.find('.tags-dropdown-trigger').exists()).toBe(true)
  })

  it('should show placeholder when no tags are selected', () => {
    const wrapper = mount(TagSection, {
      props: {
        selectedTagIds: []
      }
    })

    expect(wrapper.find('.placeholder').text()).toBe('Add tags...')
  })

  it('should show count when tags are selected', () => {
    const wrapper = mount(TagSection, {
      props: {
        selectedTagIds: ['tag1', 'tag2']
      }
    })

    expect(wrapper.find('.tag-count').text()).toBe('2 tags selected')
  })

  it('should show singular "tag" for single selection', () => {
    const wrapper = mount(TagSection, {
      props: {
        selectedTagIds: ['tag1']
      }
    })

    expect(wrapper.find('.tag-count').text()).toBe('1 tag selected')
  })

  it('should open dropdown when trigger is clicked', async () => {
    const wrapper = mount(TagSection, {
      props: {
        selectedTagIds: []
      }
    })

    expect(wrapper.find('.tags-dropdown').exists()).toBe(false)

    await wrapper.find('.tags-dropdown-trigger').trigger('click')

    expect(wrapper.find('.tags-dropdown').exists()).toBe(true)
  })

  it('should rotate chevron icon when dropdown is open', async () => {
    const wrapper = mount(TagSection, {
      props: {
        selectedTagIds: []
      }
    })

    const chevron = wrapper.find('.chevron-icon')
    expect(chevron.classes()).not.toContain('rotated')

    await wrapper.find('.tags-dropdown-trigger').trigger('click')

    expect(chevron.classes()).toContain('rotated')
  })

  it('should close dropdown when trigger is clicked again', async () => {
    const wrapper = mount(TagSection, {
      props: {
        selectedTagIds: []
      }
    })

    await wrapper.find('.tags-dropdown-trigger').trigger('click')
    expect(wrapper.find('.tags-dropdown').exists()).toBe(true)

    await wrapper.find('.tags-dropdown-trigger').trigger('click')
    expect(wrapper.find('.tags-dropdown').exists()).toBe(false)
  })

  it('should display available tags from store', async () => {
    const wrapper = mount(TagSection, {
      props: {
        selectedTagIds: []
      }
    })

    const websitesStore = useWebsitesStore()
    websitesStore.addTag('Work', '#FF0000')
    websitesStore.addTag('Personal', '#00FF00')

    await wrapper.find('.tags-dropdown-trigger').trigger('click')

    expect(wrapper.text()).toContain('Work')
    expect(wrapper.text()).toContain('Personal')
  })

  it('should show checkmark for selected tags', async () => {
    const wrapper = mount(TagSection, {
      props: {
        selectedTagIds: []
      }
    })

    const websitesStore = useWebsitesStore()
    const tag = websitesStore.addTag('Work', '#FF0000')

    await wrapper.vm.$nextTick()
    await wrapper.setProps({ selectedTagIds: [tag.id] })

    await wrapper.find('.tags-dropdown-trigger').trigger('click')

    const tagItem = wrapper.find('.tag-item.selected')
    expect(tagItem.exists()).toBe(true)
    expect(tagItem.find('.checkmark').text()).toBe('✓')
  })

  it('should emit update:selectedTagIds when tag is clicked', async () => {
    const wrapper = mount(TagSection, {
      props: {
        selectedTagIds: []
      }
    })

    const websitesStore = useWebsitesStore()
    const tag = websitesStore.addTag('Work', '#FF0000')

    await wrapper.find('.tags-dropdown-trigger').trigger('click')

    const tagItem = wrapper.find('.tag-item')
    await tagItem.trigger('click')

    expect(wrapper.emitted('update:selectedTagIds')).toBeTruthy()
    expect(wrapper.emitted('update:selectedTagIds')![0]).toEqual([[tag.id]])
  })

  it('should remove tag when already selected tag is clicked', async () => {
    const wrapper = mount(TagSection, {
      props: {
        selectedTagIds: []
      }
    })

    const websitesStore = useWebsitesStore()
    const tag = websitesStore.addTag('Work', '#FF0000')

    await wrapper.setProps({ selectedTagIds: [tag.id] })
    await wrapper.find('.tags-dropdown-trigger').trigger('click')

    const tagItem = wrapper.find('.tag-item')
    await tagItem.trigger('click')

    expect(wrapper.emitted('update:selectedTagIds')).toBeTruthy()
    expect(wrapper.emitted('update:selectedTagIds')![0]).toEqual([[]])
  })

  it('should filter tags based on search query', async () => {
    const wrapper = mount(TagSection, {
      props: {
        selectedTagIds: []
      }
    })

    const websitesStore = useWebsitesStore()
    websitesStore.addTag('Work', '#FF0000')
    websitesStore.addTag('Personal', '#00FF00')

    await wrapper.find('.tags-dropdown-trigger').trigger('click')

    const searchInput = wrapper.find('.search-input')
    await searchInput.setValue('work')

    const tagItems = wrapper.findAll('.tag-item')
    expect(tagItems.length).toBe(1)
    expect(tagItems[0].text()).toContain('Work')
  })

  it('should show "No tags found" when search has no results', async () => {
    const wrapper = mount(TagSection, {
      props: {
        selectedTagIds: []
      }
    })

    const websitesStore = useWebsitesStore()
    websitesStore.addTag('Work', '#FF0000')

    await wrapper.find('.tags-dropdown-trigger').trigger('click')

    const searchInput = wrapper.find('.search-input')
    await searchInput.setValue('nonexistent')

    expect(wrapper.text()).toContain('No tags found')
  })

  it('should show "No tags available" when no tags exist', async () => {
    const wrapper = mount(TagSection, {
      props: {
        selectedTagIds: []
      }
    })

    await wrapper.find('.tags-dropdown-trigger').trigger('click')

    expect(wrapper.text()).toContain('No tags available')
  })

  it('should have "Create new tag" button', async () => {
    const wrapper = mount(TagSection, {
      props: {
        selectedTagIds: []
      }
    })

    await wrapper.find('.tags-dropdown-trigger').trigger('click')

    expect(wrapper.find('.create-tag-button').exists()).toBe(true)
    expect(wrapper.find('.create-tag-button').text()).toBe('+ Create new tag')
  })

  it('should open tag manager when create tag button is clicked', async () => {
    const wrapper = mount(TagSection, {
      props: {
        selectedTagIds: []
      }
    })

    const uiStore = useUIStore()

    await wrapper.find('.tags-dropdown-trigger').trigger('click')
    await wrapper.find('.create-tag-button').trigger('click')

    expect(uiStore.showTagManager).toBe(true)
  })

  it('should close dropdown when create tag button is clicked', async () => {
    const wrapper = mount(TagSection, {
      props: {
        selectedTagIds: []
      }
    })

    await wrapper.find('.tags-dropdown-trigger').trigger('click')
    expect(wrapper.find('.tags-dropdown').exists()).toBe(true)

    await wrapper.find('.create-tag-button').trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.tags-dropdown').exists()).toBe(false)
  })

  it('should display selected tags as pills', async () => {
    const wrapper = mount(TagSection, {
      props: {
        selectedTagIds: []
      }
    })

    const websitesStore = useWebsitesStore()
    const tag1 = websitesStore.addTag('Work', '#FF0000')
    const tag2 = websitesStore.addTag('Personal', '#00FF00')

    await wrapper.setProps({ selectedTagIds: [tag1.id, tag2.id] })
    await wrapper.vm.$nextTick()

    const pills = wrapper.findAll('.selected-tag-pill')
    expect(pills.length).toBe(2)
    expect(pills[0].text()).toContain('Work')
    expect(pills[1].text()).toContain('Personal')
  })

  it('should emit update:selectedTagIds when tag pill is removed', async () => {
    const wrapper = mount(TagSection, {
      props: {
        selectedTagIds: []
      }
    })

    const websitesStore = useWebsitesStore()
    const tag1 = websitesStore.addTag('Work', '#FF0000')
    const tag2 = websitesStore.addTag('Personal', '#00FF00')

    await wrapper.setProps({ selectedTagIds: [tag1.id, tag2.id] })

    const removeButtons = wrapper.findAll('.remove-tag-btn')
    await removeButtons[0].trigger('click')

    expect(wrapper.emitted('update:selectedTagIds')).toBeTruthy()
    const lastEmit = wrapper.emitted('update:selectedTagIds')!
    expect(lastEmit[lastEmit.length - 1]).toEqual([[tag2.id]])
  })

  it('should display tag color dots', async () => {
    const wrapper = mount(TagSection, {
      props: {
        selectedTagIds: []
      }
    })

    const websitesStore = useWebsitesStore()
    websitesStore.addTag('Work', '#FF0000')

    await wrapper.find('.tags-dropdown-trigger').trigger('click')

    const colorDot = wrapper.find('.tag-color-dot')
    expect(colorDot.exists()).toBe(true)
    expect(colorDot.attributes('style')).toContain('background-color: rgb(255, 0, 0)')
  })

  it('should style selected tag pills with tag color', async () => {
    const wrapper = mount(TagSection, {
      props: {
        selectedTagIds: []
      }
    })

    const websitesStore = useWebsitesStore()
    const tag = websitesStore.addTag('Work', '#FF0000')

    await wrapper.setProps({ selectedTagIds: [tag.id] })

    const pill = wrapper.find('.selected-tag-pill')
    const style = pill.attributes('style')
    expect(style).toContain('background-color')
    expect(style).toContain('border-color: rgb(255, 0, 0)')
  })

  it('should be case-insensitive when searching tags', async () => {
    const wrapper = mount(TagSection, {
      props: {
        selectedTagIds: []
      }
    })

    const websitesStore = useWebsitesStore()
    websitesStore.addTag('Work', '#FF0000')
    websitesStore.addTag('Personal', '#00FF00')

    await wrapper.find('.tags-dropdown-trigger').trigger('click')

    const searchInput = wrapper.find('.search-input')
    await searchInput.setValue('WORK')

    const tagItems = wrapper.findAll('.tag-item')
    expect(tagItems.length).toBe(1)
    expect(tagItems[0].text()).toContain('Work')
  })

  it('should not show selected tags section when no tags are selected', () => {
    const wrapper = mount(TagSection, {
      props: {
        selectedTagIds: []
      }
    })

    expect(wrapper.find('.selected-tags').exists()).toBe(false)
  })

  it('should show selected tags section when tags are selected', async () => {
    const wrapper = mount(TagSection, {
      props: {
        selectedTagIds: []
      }
    })

    const websitesStore = useWebsitesStore()
    const tag = websitesStore.addTag('Work', '#FF0000')

    await wrapper.setProps({ selectedTagIds: [tag.id] })

    expect(wrapper.find('.selected-tags').exists()).toBe(true)
    expect(wrapper.find('.selected-tags').text()).toContain('Selected:')
  })
})
