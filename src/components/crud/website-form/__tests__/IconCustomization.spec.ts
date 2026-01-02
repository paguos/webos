import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import IconCustomization from '../IconCustomization.vue'

describe('IconCustomization', () => {
  const defaultProps = {
    customIcon: '',
    iconZoom: 1,
    iconBackgroundColor: 'transparent',
    url: 'https://github.com'
  }

  it('should render all form fields', () => {
    const wrapper = mount(IconCustomization, {
      props: defaultProps
    })

    expect(wrapper.find('#website-icon').exists()).toBe(true)
    expect(wrapper.find('#icon-zoom').exists()).toBe(true)
    expect(wrapper.find('#icon-bg-color').exists()).toBe(true)
  })

  it('should display current values', () => {
    const wrapper = mount(IconCustomization, {
      props: {
        customIcon: 'https://example.com/icon.png',
        iconZoom: 1.5,
        iconBackgroundColor: '#FF0000',
        url: 'https://github.com'
      }
    })

    const iconInput = wrapper.find('#website-icon').element as HTMLInputElement
    const zoomInput = wrapper.find('#icon-zoom').element as HTMLInputElement
    const colorInput = wrapper.find('#icon-bg-color').element as HTMLInputElement

    expect(iconInput.value).toBe('https://example.com/icon.png')
    expect(parseFloat(zoomInput.value)).toBe(1.5)
    expect(colorInput.value).toBe('#ff0000') // Color inputs normalize to lowercase
  })

  it('should emit update:customIcon event', async () => {
    const wrapper = mount(IconCustomization, {
      props: defaultProps
    })

    const iconInput = wrapper.find('#website-icon')
    await iconInput.setValue('https://example.com/new-icon.png')

    expect(wrapper.emitted('update:customIcon')).toBeTruthy()
    expect(wrapper.emitted('update:customIcon')![0]).toEqual(['https://example.com/new-icon.png'])
  })

  it('should emit update:iconZoom event', async () => {
    const wrapper = mount(IconCustomization, {
      props: defaultProps
    })

    const zoomInput = wrapper.find('#icon-zoom')
    await zoomInput.setValue('1.5')

    expect(wrapper.emitted('update:iconZoom')).toBeTruthy()
    expect(wrapper.emitted('update:iconZoom')![0]).toEqual([1.5])
  })

  it('should emit update:iconBackgroundColor event', async () => {
    const wrapper = mount(IconCustomization, {
      props: defaultProps
    })

    const colorInputs = wrapper.findAll('.form-input')
    const colorTextInput = colorInputs[1] // Second input is the text input for color
    await colorTextInput.setValue('#FF0000')

    expect(wrapper.emitted('update:iconBackgroundColor')).toBeTruthy()
    expect(wrapper.emitted('update:iconBackgroundColor')![0]).toEqual(['#FF0000'])
  })

  it('should display zoom percentage', () => {
    const wrapper = mount(IconCustomization, {
      props: {
        ...defaultProps,
        iconZoom: 1.5
      }
    })

    expect(wrapper.text()).toContain('150%')
  })

  it('should have zoom preset buttons', () => {
    const wrapper = mount(IconCustomization, {
      props: defaultProps
    })

    const zoomButtons = wrapper.findAll('.zoom-preset')
    expect(zoomButtons.length).toBe(4)
    expect(zoomButtons[0].text()).toBe('100%')
    expect(zoomButtons[1].text()).toBe('125%')
    expect(zoomButtons[2].text()).toBe('150%')
    expect(zoomButtons[3].text()).toBe('200%')
  })

  it('should emit correct zoom value when preset is clicked', async () => {
    const wrapper = mount(IconCustomization, {
      props: defaultProps
    })

    const zoomButtons = wrapper.findAll('.zoom-preset')
    await zoomButtons[2].trigger('click') // 150% button

    expect(wrapper.emitted('update:iconZoom')).toBeTruthy()
    expect(wrapper.emitted('update:iconZoom')![0]).toEqual([1.5])
  })

  it('should have color preset buttons', () => {
    const wrapper = mount(IconCustomization, {
      props: defaultProps
    })

    const colorButtons = wrapper.findAll('.color-preset')
    expect(colorButtons.length).toBe(8) // None, Black, White, Red, Teal, Blue, Orange, Purple
  })

  it('should emit correct color when preset is clicked', async () => {
    const wrapper = mount(IconCustomization, {
      props: defaultProps
    })

    const colorButtons = wrapper.findAll('.color-preset')
    await colorButtons[1].trigger('click') // Black button

    expect(wrapper.emitted('update:iconBackgroundColor')).toBeTruthy()
    expect(wrapper.emitted('update:iconBackgroundColor')![0]).toEqual(['#000000'])
  })

  it('should show icon preview when URL is provided', () => {
    const wrapper = mount(IconCustomization, {
      props: {
        ...defaultProps,
        url: 'https://github.com'
      }
    })

    expect(wrapper.find('.icon-preview').exists()).toBe(true)
    expect(wrapper.find('.preview-icon').exists()).toBe(true)
    expect(wrapper.find('.preview-icon img').exists()).toBe(true)
  })

  it('should show icon preview when custom icon is provided', () => {
    const wrapper = mount(IconCustomization, {
      props: {
        ...defaultProps,
        customIcon: 'https://example.com/icon.png',
        url: ''
      }
    })

    expect(wrapper.find('.icon-preview').exists()).toBe(true)
    expect(wrapper.find('.preview-icon img').exists()).toBe(true)
  })

  it('should not show icon preview when neither URL nor custom icon is provided', () => {
    const wrapper = mount(IconCustomization, {
      props: {
        ...defaultProps,
        url: '',
        customIcon: ''
      }
    })

    expect(wrapper.find('.icon-preview').exists()).toBe(false)
  })

  it('should apply background color to preview icon', () => {
    const wrapper = mount(IconCustomization, {
      props: {
        ...defaultProps,
        iconBackgroundColor: '#FF0000',
        url: 'https://github.com'
      }
    })

    const previewIcon = wrapper.find('.preview-icon')
    expect(previewIcon.attributes('style')).toContain('background-color: rgb(255, 0, 0)')
  })

  it('should apply zoom transform to preview image', () => {
    const wrapper = mount(IconCustomization, {
      props: {
        ...defaultProps,
        iconZoom: 1.5,
        url: 'https://github.com'
      }
    })

    const previewImg = wrapper.find('.preview-icon img')
    expect(previewImg.attributes('style')).toContain('transform: scale(1.5)')
  })

  it('should use custom icon when provided instead of URL favicon', () => {
    const wrapper = mount(IconCustomization, {
      props: {
        ...defaultProps,
        customIcon: 'https://example.com/custom.png',
        url: 'https://github.com'
      }
    })

    const previewImg = wrapper.find('.preview-icon img')
    expect(previewImg.attributes('src')).toBe('https://example.com/custom.png')
  })

  it('should use Google favicon service when no custom icon is provided', () => {
    const wrapper = mount(IconCustomization, {
      props: {
        ...defaultProps,
        customIcon: '',
        url: 'https://github.com'
      }
    })

    const previewImg = wrapper.find('.preview-icon img')
    expect(previewImg.attributes('src')).toContain('google.com/s2/favicons')
    expect(previewImg.attributes('src')).toContain('domain=https://github.com/')
  })
})
