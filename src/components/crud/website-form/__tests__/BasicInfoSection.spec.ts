import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BasicInfoSection from '../BasicInfoSection.vue'

describe('BasicInfoSection', () => {
  it('should render name and URL inputs', () => {
    const wrapper = mount(BasicInfoSection, {
      props: {
        name: 'GitHub',
        url: 'https://github.com',
        errors: { name: '', url: '' }
      }
    })

    expect(wrapper.find('#website-name').exists()).toBe(true)
    expect(wrapper.find('#website-url').exists()).toBe(true)
  })

  it('should display current name and URL values', () => {
    const wrapper = mount(BasicInfoSection, {
      props: {
        name: 'GitHub',
        url: 'https://github.com',
        errors: { name: '', url: '' }
      }
    })

    const nameInput = wrapper.find('#website-name').element as HTMLInputElement
    const urlInput = wrapper.find('#website-url').element as HTMLInputElement

    expect(nameInput.value).toBe('GitHub')
    expect(urlInput.value).toBe('https://github.com')
  })

  it('should emit update:name event when name input changes', async () => {
    const wrapper = mount(BasicInfoSection, {
      props: {
        name: '',
        url: '',
        errors: { name: '', url: '' }
      }
    })

    const nameInput = wrapper.find('#website-name')
    await nameInput.setValue('New Name')

    expect(wrapper.emitted('update:name')).toBeTruthy()
    expect(wrapper.emitted('update:name')![0]).toEqual(['New Name'])
  })

  it('should emit update:url event when URL input changes', async () => {
    const wrapper = mount(BasicInfoSection, {
      props: {
        name: '',
        url: '',
        errors: { name: '', url: '' }
      }
    })

    const urlInput = wrapper.find('#website-url')
    await urlInput.setValue('https://example.com')

    expect(wrapper.emitted('update:url')).toBeTruthy()
    expect(wrapper.emitted('update:url')![0]).toEqual(['https://example.com'])
  })

  it('should display error message for name field', () => {
    const wrapper = mount(BasicInfoSection, {
      props: {
        name: '',
        url: '',
        errors: { name: 'Name is required', url: '' }
      }
    })

    expect(wrapper.text()).toContain('Name is required')
  })

  it('should display error message for URL field', () => {
    const wrapper = mount(BasicInfoSection, {
      props: {
        name: 'Test',
        url: '',
        errors: { name: '', url: 'Please enter a valid URL' }
      }
    })

    expect(wrapper.text()).toContain('Please enter a valid URL')
  })

  it('should apply error class to name input when there is an error', () => {
    const wrapper = mount(BasicInfoSection, {
      props: {
        name: '',
        url: '',
        errors: { name: 'Name is required', url: '' }
      }
    })

    const nameInput = wrapper.find('#website-name')
    expect(nameInput.classes()).toContain('error')
  })

  it('should apply error class to URL input when there is an error', () => {
    const wrapper = mount(BasicInfoSection, {
      props: {
        name: 'Test',
        url: '',
        errors: { name: '', url: 'Invalid URL' }
      }
    })

    const urlInput = wrapper.find('#website-url')
    expect(urlInput.classes()).toContain('error')
  })

  it('should have proper input attributes', () => {
    const wrapper = mount(BasicInfoSection, {
      props: {
        name: '',
        url: '',
        errors: { name: '', url: '' }
      }
    })

    const nameInput = wrapper.find('#website-name')
    expect(nameInput.attributes('type')).toBe('text')
    expect(nameInput.attributes('maxlength')).toBe('50')
    expect(nameInput.attributes('placeholder')).toBe('e.g., GitHub')

    const urlInput = wrapper.find('#website-url')
    expect(urlInput.attributes('type')).toBe('text')
    expect(urlInput.attributes('placeholder')).toBe('e.g., https://github.com')
  })
})
