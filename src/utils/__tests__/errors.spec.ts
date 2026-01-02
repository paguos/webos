import { describe, it, expect } from 'vitest'
import {
  ErrorType,
  AppError,
  StorageFullError,
  ValidationError,
  ImportError,
  DuplicateError,
  NotFoundError,
  formatError
} from '../errors'

describe('errors', () => {
  describe('AppError', () => {
    it('should create an AppError with correct properties', () => {
      const error = new AppError(ErrorType.UNKNOWN, 'Test error message')

      expect(error.name).toBe('AppError')
      expect(error.type).toBe(ErrorType.UNKNOWN)
      expect(error.userMessage).toBe('Test error message')
      expect(error.message).toBe('Test error message')
    })

    it('should store original error', () => {
      const originalError = new Error('Original error')
      const error = new AppError(ErrorType.UNKNOWN, 'Wrapped error', originalError)

      expect(error.originalError).toBe(originalError)
    })
  })

  describe('StorageFullError', () => {
    it('should create a StorageFullError with correct message', () => {
      const error = new StorageFullError()

      expect(error.name).toBe('StorageFullError')
      expect(error.type).toBe(ErrorType.STORAGE_FULL)
      expect(error.userMessage).toContain('Storage is full')
    })
  })

  describe('ValidationError', () => {
    it('should create a ValidationError with custom message', () => {
      const error = new ValidationError('Invalid input')

      expect(error.name).toBe('ValidationError')
      expect(error.type).toBe(ErrorType.VALIDATION_ERROR)
      expect(error.userMessage).toBe('Invalid input')
    })
  })

  describe('ImportError', () => {
    it('should create an ImportError with default message', () => {
      const error = new ImportError()

      expect(error.name).toBe('ImportError')
      expect(error.type).toBe(ErrorType.IMPORT_ERROR)
      expect(error.userMessage).toContain('Failed to import data')
    })

    it('should create an ImportError with custom message', () => {
      const error = new ImportError('Custom import error')

      expect(error.userMessage).toBe('Custom import error')
    })
  })

  describe('DuplicateError', () => {
    it('should create a DuplicateError with item type', () => {
      const error = new DuplicateError('tag')

      expect(error.name).toBe('DuplicateError')
      expect(error.type).toBe(ErrorType.DUPLICATE_ERROR)
      expect(error.userMessage).toBe('A tag with this name already exists')
    })

    it('should work with different item types', () => {
      const error = new DuplicateError('website')

      expect(error.userMessage).toBe('A website with this name already exists')
    })
  })

  describe('NotFoundError', () => {
    it('should create a NotFoundError with item type and ID', () => {
      const error = new NotFoundError('Website', '123')

      expect(error.name).toBe('NotFoundError')
      expect(error.type).toBe(ErrorType.NOT_FOUND)
      expect(error.userMessage).toBe('Website with ID 123 not found')
    })
  })

  describe('formatError', () => {
    it('should format AppError correctly', () => {
      const error = new AppError(ErrorType.UNKNOWN, 'Test message')
      expect(formatError(error)).toBe('Test message')
    })

    it('should format regular Error correctly', () => {
      const error = new Error('Regular error')
      expect(formatError(error)).toBe('Regular error')
    })

    it('should format string error correctly', () => {
      expect(formatError('String error')).toBe('String error')
    })

    it('should format unknown error type with default message', () => {
      expect(formatError(123)).toBe('An unexpected error occurred')
      expect(formatError(null)).toBe('An unexpected error occurred')
      expect(formatError(undefined)).toBe('An unexpected error occurred')
      expect(formatError({})).toBe('An unexpected error occurred')
    })
  })
})
