/**
 * Custom error types for better error handling
 */

export enum ErrorType {
  STORAGE_FULL = 'STORAGE_FULL',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  IMPORT_ERROR = 'IMPORT_ERROR',
  DUPLICATE_ERROR = 'DUPLICATE_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNKNOWN = 'UNKNOWN'
}

/**
 * Base application error class
 */
export class AppError extends Error {
  public readonly type: ErrorType
  public readonly userMessage: string
  public readonly originalError?: Error

  constructor(
    type: ErrorType,
    userMessage: string,
    originalError?: Error
  ) {
    super(userMessage)
    this.name = 'AppError'
    this.type = type
    this.userMessage = userMessage
    this.originalError = originalError

    // Maintains proper stack trace for where error was thrown (V8 engines only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError)
    }
  }
}

/**
 * Storage quota exceeded error
 */
export class StorageFullError extends AppError {
  constructor(originalError?: Error) {
    super(
      ErrorType.STORAGE_FULL,
      'Storage is full. Please delete some websites or export your data.',
      originalError
    )
    this.name = 'StorageFullError'
  }
}

/**
 * Validation error
 */
export class ValidationError extends AppError {
  constructor(message: string, originalError?: Error) {
    super(ErrorType.VALIDATION_ERROR, message, originalError)
    this.name = 'ValidationError'
  }
}

/**
 * Import/export error
 */
export class ImportError extends AppError {
  constructor(message: string = 'Failed to import data. Please check the file format.', originalError?: Error) {
    super(ErrorType.IMPORT_ERROR, message, originalError)
    this.name = 'ImportError'
  }
}

/**
 * Duplicate entry error
 */
export class DuplicateError extends AppError {
  constructor(itemType: string, originalError?: Error) {
    super(
      ErrorType.DUPLICATE_ERROR,
      `A ${itemType} with this name already exists`,
      originalError
    )
    this.name = 'DuplicateError'
  }
}

/**
 * Not found error
 */
export class NotFoundError extends AppError {
  constructor(itemType: string, id: string, originalError?: Error) {
    super(
      ErrorType.NOT_FOUND,
      `${itemType} with ID ${id} not found`,
      originalError
    )
    this.name = 'NotFoundError'
  }
}

/**
 * Format error for user display
 */
export function formatError(error: unknown): string {
  if (error instanceof AppError) {
    return error.userMessage
  }

  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  return 'An unexpected error occurred'
}
