import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ExtraLinksSection from '../ExtraLinksSection.vue'
import type { ExtraLink } from '../../../../types'

describe('ExtraLinksSection', () => {
  const sampleLinks: ExtraLink[] = [
    { id: '1', name: 'Documentation', url: 'https://docs.example.com' },
    { id: '2', name: 'Issues', url: 'https://issues.example.com' }
  ]

  it('should render section with label and hint', () => {
    const wrapper = mount(ExtraLinksSection, {
      props: {
        extraLinks: []
      }
    })

    expect(wrapper.find('.form-label').text()).toBe('Extra Links')
    expect(wrapper.find('.form-hint').text()).toContain('Add quick access links')
  })

  it('should display existing links', () => {
    const wrapper = mount(ExtraLinksSection, {
      props: {
        extraLinks: sampleLinks
      }
    })

    const linkItems = wrapper.findAll('.extra-link-item')
    expect(linkItems.length).toBe(2)
    expect(wrapper.text()).toContain('Documentation')
    expect(wrapper.text()).toContain('https://docs.example.com')
    expect(wrapper.text()).toContain('Issues')
    expect(wrapper.text()).toContain('https://issues.example.com')
  })

  it('should show add button when no form is open and less than 10 links', () => {
    const wrapper = mount(ExtraLinksSection, {
      props: {
        extraLinks: sampleLinks
      }
    })

    expect(wrapper.find('.add-link-button').exists()).toBe(true)
    expect(wrapper.find('.add-link-button').text()).toBe('+ Add Extra Link')
  })

  it('should not show add button when at maximum limit (10 links)', () => {
    const manyLinks: ExtraLink[] = Array.from({ length: 10 }, (_, i) => ({
      id: `${i}`,
      name: `Link ${i}`,
      url: `https://link${i}.example.com`
    }))

    const wrapper = mount(ExtraLinksSection, {
      props: {
        extraLinks: manyLinks
      }
    })

    expect(wrapper.find('.add-link-button').exists()).toBe(false)
    expect(wrapper.text()).toContain('Maximum 10 extra links reached')
  })

  it('should open add form when add button is clicked', async () => {
    const wrapper = mount(ExtraLinksSection, {
      props: {
        extraLinks: sampleLinks
      }
    })

    await wrapper.find('.add-link-button').trigger('click')

    expect(wrapper.find('.link-form').exists()).toBe(true)
    expect(wrapper.find('.add-link-button').exists()).toBe(false)
  })

  it('should display empty form inputs when adding new link', async () => {
    const wrapper = mount(ExtraLinksSection, {
      props: {
        extraLinks: []
      }
    })

    await wrapper.find('.add-link-button').trigger('click')

    const inputs = wrapper.findAll('.link-form-inputs input')
    expect((inputs[0].element as HTMLInputElement).value).toBe('')
    expect((inputs[1].element as HTMLInputElement).value).toBe('')
  })

  it('should show "Add" button text when adding new link', async () => {
    const wrapper = mount(ExtraLinksSection, {
      props: {
        extraLinks: []
      }
    })

    await wrapper.find('.add-link-button').trigger('click')

    const submitButton = wrapper.findAll('.form-button.primary')[0]
    expect(submitButton.text()).toBe('Add')
  })

  it('should cancel add form when cancel button is clicked', async () => {
    const wrapper = mount(ExtraLinksSection, {
      props: {
        extraLinks: []
      }
    })

    await wrapper.find('.add-link-button').trigger('click')
    expect(wrapper.find('.link-form').exists()).toBe(true)

    await wrapper.find('.form-button.secondary').trigger('click')
    expect(wrapper.find('.link-form').exists()).toBe(false)
  })

  it('should emit update:extraLinks when adding valid link', async () => {
    const wrapper = mount(ExtraLinksSection, {
      props: {
        extraLinks: []
      }
    })

    await wrapper.find('.add-link-button').trigger('click')

    const inputs = wrapper.findAll('.link-form-inputs input')
    await inputs[0].setValue('New Link')
    await inputs[1].setValue('https://new.example.com')

    await wrapper.findAll('.form-button.primary')[0].trigger('click')

    expect(wrapper.emitted('update:extraLinks')).toBeTruthy()
    const emittedLinks = wrapper.emitted('update:extraLinks')![0][0] as ExtraLink[]
    expect(emittedLinks.length).toBe(1)
    expect(emittedLinks[0].name).toBe('New Link')
    expect(emittedLinks[0].url).toBe('https://new.example.com/')
  })

  it('should show validation error for empty name', async () => {
    const wrapper = mount(ExtraLinksSection, {
      props: {
        extraLinks: []
      }
    })

    await wrapper.find('.add-link-button').trigger('click')

    const inputs = wrapper.findAll('.link-form-inputs input')
    await inputs[1].setValue('https://example.com')

    await wrapper.findAll('.form-button.primary')[0].trigger('click')

    expect(wrapper.text()).toContain('Name is required')
  })

  it('should show validation error for invalid URL', async () => {
    const wrapper = mount(ExtraLinksSection, {
      props: {
        extraLinks: []
      }
    })

    await wrapper.find('.add-link-button').trigger('click')

    const inputs = wrapper.findAll('.link-form-inputs input')
    await inputs[0].setValue('Link Name')
    await inputs[1].setValue('not a url')

    await wrapper.findAll('.form-button.primary')[0].trigger('click')

    expect(wrapper.text()).toContain('Please enter a valid URL')
  })

  it('should open edit form when edit button is clicked', async () => {
    const wrapper = mount(ExtraLinksSection, {
      props: {
        extraLinks: sampleLinks
      }
    })

    const editButtons = wrapper.findAll('.link-action-btn:not(.danger)')
    await editButtons[0].trigger('click')

    expect(wrapper.find('.link-form').exists()).toBe(true)

    const inputs = wrapper.findAll('.link-form-inputs input')
    expect((inputs[0].element as HTMLInputElement).value).toBe('Documentation')
    expect((inputs[1].element as HTMLInputElement).value).toBe('https://docs.example.com')
  })

  it('should show "Update" button text when editing link', async () => {
    const wrapper = mount(ExtraLinksSection, {
      props: {
        extraLinks: sampleLinks
      }
    })

    const editButtons = wrapper.findAll('.link-action-btn:not(.danger)')
    await editButtons[0].trigger('click')

    const submitButton = wrapper.findAll('.form-button.primary')[0]
    expect(submitButton.text()).toBe('Update')
  })

  it('should emit update:extraLinks when editing link', async () => {
    const wrapper = mount(ExtraLinksSection, {
      props: {
        extraLinks: sampleLinks
      }
    })

    const editButtons = wrapper.findAll('.link-action-btn:not(.danger)')
    await editButtons[0].trigger('click')

    const inputs = wrapper.findAll('.link-form-inputs input')
    await inputs[0].setValue('Updated Docs')
    await inputs[1].setValue('https://new-docs.example.com')

    await wrapper.findAll('.form-button.primary')[0].trigger('click')

    expect(wrapper.emitted('update:extraLinks')).toBeTruthy()
    const emittedLinks = wrapper.emitted('update:extraLinks')![0][0] as ExtraLink[]
    expect(emittedLinks.length).toBe(2)
    expect(emittedLinks[0].name).toBe('Updated Docs')
    expect(emittedLinks[0].url).toBe('https://new-docs.example.com/')
    expect(emittedLinks[0].id).toBe('1') // Should preserve ID
  })

  it('should emit update:extraLinks when removing link', async () => {
    const wrapper = mount(ExtraLinksSection, {
      props: {
        extraLinks: sampleLinks
      }
    })

    const deleteButtons = wrapper.findAll('.link-action-btn.danger')
    await deleteButtons[0].trigger('click')

    expect(wrapper.emitted('update:extraLinks')).toBeTruthy()
    const emittedLinks = wrapper.emitted('update:extraLinks')![0][0] as ExtraLink[]
    expect(emittedLinks.length).toBe(1)
    expect(emittedLinks[0].id).toBe('2') // First link removed, second remains
  })

  it('should have edit and delete buttons for each link', () => {
    const wrapper = mount(ExtraLinksSection, {
      props: {
        extraLinks: sampleLinks
      }
    })

    const linkItems = wrapper.findAll('.extra-link-item')
    linkItems.forEach(item => {
      const actionButtons = item.findAll('.link-action-btn')
      expect(actionButtons.length).toBe(2) // Edit and delete
    })
  })

  it('should show duplicate name error when adding link with existing name', async () => {
    const wrapper = mount(ExtraLinksSection, {
      props: {
        extraLinks: sampleLinks
      }
    })

    await wrapper.find('.add-link-button').trigger('click')

    const inputs = wrapper.findAll('.link-form-inputs input')
    await inputs[0].setValue('documentation') // Case-insensitive duplicate
    await inputs[1].setValue('https://new.example.com')

    await wrapper.findAll('.form-button.primary')[0].trigger('click')

    expect(wrapper.text()).toContain('A link with this name already exists')
  })

  it('should not show duplicate error when editing link with same name', async () => {
    const wrapper = mount(ExtraLinksSection, {
      props: {
        extraLinks: sampleLinks
      }
    })

    const editButtons = wrapper.findAll('.link-action-btn:not(.danger)')
    await editButtons[0].trigger('click')

    const inputs = wrapper.findAll('.link-form-inputs input')
    await inputs[1].setValue('https://new-url.example.com') // Change URL only

    await wrapper.findAll('.form-button.primary')[0].trigger('click')

    expect(wrapper.emitted('update:extraLinks')).toBeTruthy()
  })

  it('should preserve link IDs when editing', async () => {
    const wrapper = mount(ExtraLinksSection, {
      props: {
        extraLinks: sampleLinks
      }
    })

    const editButtons = wrapper.findAll('.link-action-btn:not(.danger)')
    await editButtons[0].trigger('click')

    const inputs = wrapper.findAll('.link-form-inputs input')
    await inputs[0].setValue('Updated Name')

    await wrapper.findAll('.form-button.primary')[0].trigger('click')

    const emittedLinks = wrapper.emitted('update:extraLinks')![0][0] as ExtraLink[]
    expect(emittedLinks[0].id).toBe('1') // Original ID preserved
  })

  it('should normalize URLs when adding link', async () => {
    const wrapper = mount(ExtraLinksSection, {
      props: {
        extraLinks: []
      }
    })

    await wrapper.find('.add-link-button').trigger('click')

    const inputs = wrapper.findAll('.link-form-inputs input')
    await inputs[0].setValue('Link')
    await inputs[1].setValue('example.com') // No protocol

    await wrapper.findAll('.form-button.primary')[0].trigger('click')

    const emittedLinks = wrapper.emitted('update:extraLinks')![0][0] as ExtraLink[]
    expect(emittedLinks[0].url).toBe('https://example.com/')
  })
})
