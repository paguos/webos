import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import IconPreview from '../IconPreview.vue'

describe('IconPreview', () => {
  const defaultProps = {
    url: 'https://github.com',
    customIcon: '',
    iconZoom: 1,
    iconOffsetX: 0,
    iconOffsetY: 0,
    iconBackgroundColor: 'transparent'
  }

  it('should render preview when url is provided', () => {
    const wrapper = mount(IconPreview, {
      props: defaultProps
    })

    expect(wrapper.find('.icon-preview').exists()).toBe(true)
    expect(wrapper.find('.preview-icon').exists()).toBe(true)
  })

  it('should not render preview when url is empty', () => {
    const wrapper = mount(IconPreview, {
      props: {
        ...defaultProps,
        url: ''
      }
    })

    expect(wrapper.find('.icon-preview').exists()).toBe(false)
  })

  it('should render customize button when url is provided', () => {
    const wrapper = mount(IconPreview, {
      props: defaultProps
    })

    const button = wrapper.find('.customize-button')
    expect(button.exists()).toBe(true)
    expect(button.text()).toBe('Customize Icon')
  })

  it('should emit editIcon event when customize button is clicked', async () => {
    const wrapper = mount(IconPreview, {
      props: defaultProps
    })

    const button = wrapper.find('.customize-button')
    await button.trigger('click')

    expect(wrapper.emitted('editIcon')).toBeTruthy()
    expect(wrapper.emitted('editIcon')!.length).toBe(1)
  })

  it('should display preview with custom icon URL', () => {
    const customIconUrl = 'https://example.com/custom.png'
    const wrapper = mount(IconPreview, {
      props: {
        ...defaultProps,
        customIcon: customIconUrl
      }
    })

    const img = wrapper.find('.preview-icon img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe(customIconUrl)
  })

  it('should apply background color to preview icon', () => {
    const backgroundColor = '#FF0000'
    const wrapper = mount(IconPreview, {
      props: {
        ...defaultProps,
        iconBackgroundColor: backgroundColor
      }
    })

    const previewIcon = wrapper.find('.preview-icon')
    // Browser converts hex to rgb format
    expect(previewIcon.attributes('style')).toContain('background-color: rgb(255, 0, 0)')
  })

  it('should apply zoom transform to preview image', () => {
    const wrapper = mount(IconPreview, {
      props: {
        ...defaultProps,
        iconZoom: 1.5,
        iconOffsetX: 10,
        iconOffsetY: -20
      }
    })

    const img = wrapper.find('.preview-icon img')
    expect(img.attributes('style')).toContain('transform: scale(1.5) translate(10%, -20%)')
  })

  it('should use Google favicon when no custom icon is provided', () => {
    const wrapper = mount(IconPreview, {
      props: {
        ...defaultProps,
        url: 'https://github.com',
        customIcon: ''
      }
    })

    const img = wrapper.find('.preview-icon img')
    expect(img.attributes('src')).toContain('google.com/s2/favicons')
    expect(img.attributes('src')).toContain('domain=https://github.com/')
  })

  it('should render preview when customIcon is provided without url', () => {
    const wrapper = mount(IconPreview, {
      props: {
        ...defaultProps,
        url: '',
        customIcon: 'https://example.com/icon.png'
      }
    })

    expect(wrapper.find('.icon-preview').exists()).toBe(true)
    expect(wrapper.find('.customize-button').exists()).toBe(true)
  })
})
