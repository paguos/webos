import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref } from 'vue'
import { useDebounce, useDebouncedFn } from '../useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('useDebounce', () => {
    it('should initialize with the initial value', () => {
      const value = ref('initial')
      const debounced = useDebounce(value, 300)

      expect(debounced.value).toBe('initial')
    })

    it('should debounce value changes', () => {
      const value = ref('initial')
      const debounced = useDebounce(value, 300)

      value.value = 'changed'
      expect(debounced.value).toBe('initial')

      vi.advanceTimersByTime(299)
      expect(debounced.value).toBe('initial')

      vi.advanceTimersByTime(1)
      expect(debounced.value).toBe('changed')
    })

    it('should cancel previous debounce on new change', () => {
      const value = ref('initial')
      const debounced = useDebounce(value, 300)

      value.value = 'first'
      vi.advanceTimersByTime(100)

      value.value = 'second'
      vi.advanceTimersByTime(100)

      value.value = 'third'
      vi.advanceTimersByTime(299)
      expect(debounced.value).toBe('initial')

      vi.advanceTimersByTime(1)
      expect(debounced.value).toBe('third')
    })

    it('should use default delay of 300ms', () => {
      const value = ref('initial')
      const debounced = useDebounce(value)

      value.value = 'changed'
      vi.advanceTimersByTime(299)
      expect(debounced.value).toBe('initial')

      vi.advanceTimersByTime(1)
      expect(debounced.value).toBe('changed')
    })

    it('should handle rapid value changes', () => {
      const value = ref(0)
      const debounced = useDebounce(value, 100)

      for (let i = 1; i <= 10; i++) {
        value.value = i
        vi.advanceTimersByTime(50)
      }

      expect(debounced.value).toBe(0)

      vi.advanceTimersByTime(50)
      expect(debounced.value).toBe(10)
    })
  })

  describe('useDebouncedFn', () => {
    it('should debounce function calls', () => {
      const callback = vi.fn()
      const debouncedFn = useDebouncedFn(callback, 300)

      debouncedFn('test')
      expect(callback).not.toHaveBeenCalled()

      vi.advanceTimersByTime(299)
      expect(callback).not.toHaveBeenCalled()

      vi.advanceTimersByTime(1)
      expect(callback).toHaveBeenCalledWith('test')
      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('should cancel previous call on new invocation', () => {
      const callback = vi.fn()
      const debouncedFn = useDebouncedFn(callback, 300)

      debouncedFn('first')
      vi.advanceTimersByTime(100)

      debouncedFn('second')
      vi.advanceTimersByTime(100)

      debouncedFn('third')
      vi.advanceTimersByTime(299)
      expect(callback).not.toHaveBeenCalled()

      vi.advanceTimersByTime(1)
      expect(callback).toHaveBeenCalledWith('third')
      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('should use default delay of 300ms', () => {
      const callback = vi.fn()
      const debouncedFn = useDebouncedFn(callback)

      debouncedFn('test')
      vi.advanceTimersByTime(299)
      expect(callback).not.toHaveBeenCalled()

      vi.advanceTimersByTime(1)
      expect(callback).toHaveBeenCalled()
    })

    it('should pass all arguments to callback', () => {
      const callback = vi.fn()
      const debouncedFn = useDebouncedFn(callback, 100)

      debouncedFn('arg1', 'arg2', 'arg3')
      vi.advanceTimersByTime(100)

      expect(callback).toHaveBeenCalledWith('arg1', 'arg2', 'arg3')
    })

    it('should handle multiple rapid calls', () => {
      const callback = vi.fn()
      const debouncedFn = useDebouncedFn(callback, 100)

      for (let i = 1; i <= 10; i++) {
        debouncedFn(i)
        vi.advanceTimersByTime(50)
      }

      expect(callback).not.toHaveBeenCalled()

      vi.advanceTimersByTime(50)
      expect(callback).toHaveBeenCalledWith(10)
      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('should work with different callback types', () => {
      const stringCallback = vi.fn((str: string) => str.toUpperCase())
      const debouncedString = useDebouncedFn(stringCallback, 100)

      debouncedString('test')
      vi.advanceTimersByTime(100)
      expect(stringCallback).toHaveBeenCalledWith('test')

      const numberCallback = vi.fn((a: number, b: number) => a + b)
      const debouncedNumber = useDebouncedFn(numberCallback, 100)

      debouncedNumber(5, 10)
      vi.advanceTimersByTime(100)
      expect(numberCallback).toHaveBeenCalledWith(5, 10)
    })
  })
})
