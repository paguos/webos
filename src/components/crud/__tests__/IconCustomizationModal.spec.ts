import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import IconCustomizationModal from '../IconCustomizationModal.vue'
import type { IconCustomizationValues } from '../website-form/types'

describe('IconCustomizationModal', () => {
  const defaultInitialValues: IconCustomizationValues = {
    customIcon: '',
    iconZoom: 1,
    iconOffsetX: 0,
    iconOffsetY: 0,
    iconBackgroundColor: 'transparent'
  }

  const defaultProps = {
    visible: true,
    url: 'https://github.com',
    initialValues: defaultInitialValues
  }

  beforeEach(() => {
    // Reset body for Teleport
    document.body.innerHTML = ''
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('should render modal when visible is true', async () => {
    const wrapper = mount(IconCustomizationModal, {
      props: defaultProps,
      attachTo: document.body
    })
    await wrapper.vm.$nextTick()

    expect(document.querySelector('.icon-customization-modal')).toBeTruthy()
    expect(document.querySelector('.modal-title')?.textContent).toBe('Customize Icon')
  })

  it('should not render modal when visible is false', async () => {
    const wrapper = mount(IconCustomizationModal, {
      props: {
        ...defaultProps,
        visible: false
      },
      attachTo: document.body
    })
    await wrapper.vm.$nextTick()

    expect(document.querySelector('.icon-customization-modal')).toBeFalsy()
  })

  it('should render all form controls', async () => {
    const wrapper = mount(IconCustomizationModal, {
      props: defaultProps,
      attachTo: document.body
    })
    await wrapper.vm.$nextTick()

    expect(document.querySelector('#website-icon')).toBeTruthy()
    expect(document.querySelector('#icon-zoom')).toBeTruthy()
    expect(document.querySelector('#icon-offset-x')).toBeTruthy()
    expect(document.querySelector('#icon-offset-y')).toBeTruthy()
    expect(document.querySelector('#icon-bg-color')).toBeTruthy()
  })

  it('should initialize local values from initialValues prop', async () => {
    const customValues: IconCustomizationValues = {
      customIcon: 'https://example.com/icon.png',
      iconZoom: 1.5,
      iconOffsetX: 20,
      iconOffsetY: -10,
      iconBackgroundColor: '#FF0000'
    }

    const wrapper = mount(IconCustomizationModal, {
      props: {
        ...defaultProps,
        visible: false,
        initialValues: customValues
      },
      attachTo: document.body
    })

    // Open modal to trigger watch
    await wrapper.setProps({ visible: true })
    await wrapper.vm.$nextTick()

    const iconInput = document.querySelector('#website-icon') as HTMLInputElement
    const zoomInput = document.querySelector('#icon-zoom') as HTMLInputElement
    const offsetXInput = document.querySelector('#icon-offset-x') as HTMLInputElement
    const offsetYInput = document.querySelector('#icon-offset-y') as HTMLInputElement

    expect(iconInput.value).toBe(customValues.customIcon)
    expect(parseFloat(zoomInput.value)).toBe(customValues.iconZoom)
    expect(parseInt(offsetXInput.value)).toBe(customValues.iconOffsetX)
    expect(parseInt(offsetYInput.value)).toBe(customValues.iconOffsetY)
  })

  it('should emit close event when close button is clicked', async () => {
    const wrapper = mount(IconCustomizationModal, {
      props: defaultProps,
      attachTo: document.body
    })
    await wrapper.vm.$nextTick()

    const closeButton = document.querySelector('.close-button') as HTMLElement
    closeButton.click()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('should emit close event when cancel button is clicked', async () => {
    const wrapper = mount(IconCustomizationModal, {
      props: defaultProps,
      attachTo: document.body
    })
    await wrapper.vm.$nextTick()

    const buttons = document.querySelectorAll('.modal-button')
    const cancelButton = Array.from(buttons).find(btn => btn.textContent === 'Cancel') as HTMLElement
    cancelButton.click()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('should emit apply event with updated values when apply button is clicked', async () => {
    const wrapper = mount(IconCustomizationModal, {
      props: defaultProps,
      attachTo: document.body
    })
    await wrapper.vm.$nextTick()

    // Change zoom value
    const zoomInput = document.querySelector('#icon-zoom') as HTMLInputElement
    zoomInput.value = '1.5'
    zoomInput.dispatchEvent(new Event('input'))
    await wrapper.vm.$nextTick()

    const buttons = document.querySelectorAll('.modal-button')
    const applyButton = Array.from(buttons).find(btn => btn.textContent === 'Apply') as HTMLElement
    applyButton.click()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('apply')).toBeTruthy()
    const emittedValue = wrapper.emitted('apply')![0][0] as IconCustomizationValues
    expect(emittedValue.iconZoom).toBe(1.5)
  })

  it('should update local values without affecting parent until apply', async () => {
    const wrapper = mount(IconCustomizationModal, {
      props: defaultProps,
      attachTo: document.body
    })
    await wrapper.vm.$nextTick()

    // Change custom icon
    const iconInput = document.querySelector('#website-icon') as HTMLInputElement
    iconInput.value = 'https://example.com/new-icon.png'
    iconInput.dispatchEvent(new Event('input'))
    await wrapper.vm.$nextTick()

    // Should not emit apply yet
    expect(wrapper.emitted('apply')).toBeFalsy()

    // Click cancel - should emit close, not apply
    const buttons = document.querySelectorAll('.modal-button')
    const cancelButton = Array.from(buttons).find(btn => btn.textContent === 'Cancel') as HTMLElement
    cancelButton.click()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('close')).toBeTruthy()
    expect(wrapper.emitted('apply')).toBeFalsy()
  })

  it('should have zoom preset buttons', async () => {
    const wrapper = mount(IconCustomizationModal, {
      props: defaultProps,
      attachTo: document.body
    })
    await wrapper.vm.$nextTick()

    const zoomButtons = document.querySelectorAll('.zoom-preset')
    expect(zoomButtons.length).toBe(5)
    expect(zoomButtons[0].textContent).toBe('50%')
    expect(zoomButtons[1].textContent).toBe('75%')
    expect(zoomButtons[2].textContent).toBe('100%')
    expect(zoomButtons[3].textContent).toBe('150%')
    expect(zoomButtons[4].textContent).toBe('200%')
  })

  it('should update zoom when preset button is clicked', async () => {
    const wrapper = mount(IconCustomizationModal, {
      props: defaultProps,
      attachTo: document.body
    })
    await wrapper.vm.$nextTick()

    const zoomButtons = document.querySelectorAll('.zoom-preset')
    ;(zoomButtons[3] as HTMLElement).click() // 150% button
    await wrapper.vm.$nextTick()

    const zoomInput = document.querySelector('#icon-zoom') as HTMLInputElement
    expect(parseFloat(zoomInput.value)).toBe(1.5)
  })

  it('should have offset preset buttons', async () => {
    const wrapper = mount(IconCustomizationModal, {
      props: defaultProps,
      attachTo: document.body
    })
    await wrapper.vm.$nextTick()

    const offsetControls = document.querySelectorAll('.offset-controls')
    const offsetXButtons = offsetControls[0].querySelectorAll('.offset-preset')
    expect(offsetXButtons.length).toBe(3)
    expect(offsetXButtons[0].textContent).toBe('Left')
    expect(offsetXButtons[1].textContent).toBe('Center')
    expect(offsetXButtons[2].textContent).toBe('Right')

    const offsetYButtons = offsetControls[1].querySelectorAll('.offset-preset')
    expect(offsetYButtons.length).toBe(3)
    expect(offsetYButtons[0].textContent).toBe('Top')
    expect(offsetYButtons[1].textContent).toBe('Middle')
    expect(offsetYButtons[2].textContent).toBe('Bottom')
  })

  it('should update offset when preset button is clicked', async () => {
    const wrapper = mount(IconCustomizationModal, {
      props: defaultProps,
      attachTo: document.body
    })
    await wrapper.vm.$nextTick()

    const offsetControls = document.querySelectorAll('.offset-controls')
    const offsetXButtons = offsetControls[0].querySelectorAll('.offset-preset')
    ;(offsetXButtons[0] as HTMLElement).click() // Left button (-50)
    await wrapper.vm.$nextTick()

    const offsetXInput = document.querySelector('#icon-offset-x') as HTMLInputElement
    expect(parseInt(offsetXInput.value)).toBe(-50)
  })

  it('should have color preset buttons', async () => {
    const wrapper = mount(IconCustomizationModal, {
      props: defaultProps,
      attachTo: document.body
    })
    await wrapper.vm.$nextTick()

    const colorButtons = document.querySelectorAll('.color-preset')
    expect(colorButtons.length).toBe(8)
    expect(colorButtons[0].textContent).toBe('None')
    expect(colorButtons[1].textContent).toBe('Black')
    expect(colorButtons[2].textContent).toBe('White')
  })

  it('should display icon preview with current values', async () => {
    const wrapper = mount(IconCustomizationModal, {
      props: {
        ...defaultProps,
        visible: false,
        initialValues: {
          customIcon: '',
          iconZoom: 1.5,
          iconOffsetX: 10,
          iconOffsetY: -20,
          iconBackgroundColor: '#FF0000'
        }
      },
      attachTo: document.body
    })

    // Open modal to trigger watch
    await wrapper.setProps({ visible: true })
    await wrapper.vm.$nextTick()

    const previewIcon = document.querySelector('.preview-icon') as HTMLElement
    expect(previewIcon).toBeTruthy()
    expect(previewIcon.style.backgroundColor).toBe('rgb(255, 0, 0)')

    const previewImg = document.querySelector('.preview-icon img') as HTMLElement
    expect(previewImg.style.transform).toContain('scale(1.5)')
    expect(previewImg.style.transform).toContain('translate(10%, -20%)')
  })

  it('should display zoom percentage', async () => {
    const wrapper = mount(IconCustomizationModal, {
      props: {
        ...defaultProps,
        initialValues: {
          ...defaultInitialValues,
          iconZoom: 1.5
        }
      },
      attachTo: document.body
    })
    await wrapper.vm.$nextTick()

    expect(document.body.textContent).toContain('150%')
  })

  it('should display offset values with sign', async () => {
    const wrapper = mount(IconCustomizationModal, {
      props: {
        ...defaultProps,
        visible: false,
        initialValues: {
          ...defaultInitialValues,
          iconOffsetX: 20,
          iconOffsetY: -15
        }
      },
      attachTo: document.body
    })

    // Open modal to trigger watch
    await wrapper.setProps({ visible: true })
    await wrapper.vm.$nextTick()

    expect(document.body.textContent).toContain('+20%')
    expect(document.body.textContent).toContain('-15%')
  })

  it('should emit close when overlay is clicked', async () => {
    const wrapper = mount(IconCustomizationModal, {
      props: defaultProps,
      attachTo: document.body
    })
    await wrapper.vm.$nextTick()

    const overlay = document.querySelector('.icon-modal-overlay') as HTMLElement
    overlay.click()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('should not emit close when modal content is clicked', async () => {
    const wrapper = mount(IconCustomizationModal, {
      props: defaultProps,
      attachTo: document.body
    })
    await wrapper.vm.$nextTick()

    const modal = document.querySelector('.icon-customization-modal') as HTMLElement
    modal.click()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('close')).toBeFalsy()
  })

  it('should reset local values when modal reopens', async () => {
    const wrapper = mount(IconCustomizationModal, {
      props: {
        ...defaultProps,
        visible: false
      },
      attachTo: document.body
    })

    // Open modal
    await wrapper.setProps({ visible: true })
    await wrapper.vm.$nextTick()

    // Change zoom
    const zoomInput = document.querySelector('#icon-zoom') as HTMLInputElement
    zoomInput.value = '1.5'
    zoomInput.dispatchEvent(new Event('input'))
    await wrapper.vm.$nextTick()

    // Close modal
    await wrapper.setProps({ visible: false })
    await wrapper.vm.$nextTick()

    // Reopen with new initial values
    await wrapper.setProps({
      visible: true,
      initialValues: {
        ...defaultInitialValues,
        iconZoom: 2
      }
    })
    await wrapper.vm.$nextTick()

    // Should show new initial value, not previous local change
    const zoomInputAfter = document.querySelector('#icon-zoom') as HTMLInputElement
    expect(parseFloat(zoomInputAfter.value)).toBe(2)
  })

  it('should use custom icon when provided instead of URL favicon', async () => {
    const customIcon = 'https://example.com/custom.png'
    const wrapper = mount(IconCustomizationModal, {
      props: {
        ...defaultProps,
        visible: false,
        initialValues: {
          ...defaultInitialValues,
          customIcon
        }
      },
      attachTo: document.body
    })

    // Open modal to trigger watch
    await wrapper.setProps({ visible: true })
    await wrapper.vm.$nextTick()

    const previewImg = document.querySelector('.preview-icon img') as HTMLImageElement
    expect(previewImg.src).toBe(customIcon)
  })

  it('should use Google favicon service when no custom icon is provided', async () => {
    const wrapper = mount(IconCustomizationModal, {
      props: defaultProps,
      attachTo: document.body
    })
    await wrapper.vm.$nextTick()

    const previewImg = document.querySelector('.preview-icon img') as HTMLImageElement
    expect(previewImg.src).toContain('google.com/s2/favicons')
    expect(previewImg.src).toContain('domain=https://github.com/')
  })
})
