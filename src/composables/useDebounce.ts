import { ref, watch, type Ref } from 'vue'

/**
 * Composable for debouncing reactive values
 * Delays updating the debounced value until after a specified delay
 *
 * @param value - The reactive value to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns Debounced reactive value
 *
 * @example
 * const searchQuery = ref('')
 * const debouncedQuery = useDebounce(searchQuery, 300)
 */
export function useDebounce<T>(value: Ref<T>, delay: number = 300): Ref<T> {
  const debouncedValue = ref(value.value) as Ref<T>
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  watch(
    value,
    (newValue) => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId)
      }

      timeoutId = setTimeout(() => {
        debouncedValue.value = newValue
        timeoutId = null
      }, delay)
    },
    { flush: 'sync' } // Execute watch synchronously for immediate timer setup
  )

  return debouncedValue
}

/**
 * Composable for creating a debounced function
 * Delays execution of the callback until after a specified delay
 *
 * @param callback - The function to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns Debounced function
 *
 * @example
 * const handleSearch = useDebouncedFn((query: string) => {
 *   console.log('Searching for:', query)
 * }, 300)
 */
export function useDebouncedFn<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<T>) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      callback(...args)
      timeoutId = null
    }, delay)
  }
}
