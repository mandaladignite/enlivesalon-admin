/**
 * Enhanced error handling utilities for the frontend
 */

export interface ErrorDetails {
  message: string;
  code?: string;
  field?: string;
  timestamp?: string;
  retryable?: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: ValidationError[];
  timestamp?: string;
}

export class BookingError extends Error {
  public readonly code: string;
  public readonly field?: string;
  public readonly retryable: boolean;
  public readonly timestamp: string;

  constructor(
    message: string,
    code: string = 'BOOKING_ERROR',
    field?: string,
    retryable: boolean = false
  ) {
    super(message);
    this.name = 'BookingError';
    this.code = code;
    this.field = field;
    this.retryable = retryable;
    this.timestamp = new Date().toISOString();
  }
}

export class NetworkError extends Error {
  public readonly retryable: boolean;
  public readonly timestamp: string;

  constructor(message: string, retryable: boolean = true) {
    super(message);
    this.name = 'NetworkError';
    this.retryable = retryable;
    this.timestamp = new Date().toISOString();
  }
}

export class ValidationError extends Error {
  public readonly errors: ValidationError[];
  public readonly timestamp: string;

  constructor(message: string, errors: ValidationError[] = []) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Parse API error response and create appropriate error objects
 */
export function parseApiError(error: any): Error {
  // Handle network errors
  if (!error.response && error.message) {
    if (error.message.includes('fetch')) {
      return new NetworkError('Network connection failed. Please check your internet connection.');
    }
    if (error.message.includes('timeout')) {
      return new NetworkError('Request timed out. Please try again.');
    }
    return new NetworkError(error.message);
  }

  // Handle API error responses
  if (error.response?.data) {
    const { message, errors, timestamp } = error.response.data;
    
    // Handle validation errors
    if (errors && Array.isArray(errors) && errors.length > 0) {
      return new ValidationError(message || 'Validation failed', errors);
    }
    
    // Handle specific booking errors
    if (message.includes('already booked') || message.includes('conflict')) {
      return new BookingError(
        message,
        'BOOKING_CONFLICT',
        undefined,
        false
      );
    }
    
    if (message.includes('Stylist is not available')) {
      return new BookingError(
        message,
        'STYLIST_UNAVAILABLE',
        'stylistId',
        false
      );
    }
    
    if (message.includes('Service is not available')) {
      return new BookingError(
        message,
        'SERVICE_UNAVAILABLE',
        'serviceId',
        false
      );
    }
    
    if (message.includes('time slot')) {
      return new BookingError(
        message,
        'TIME_SLOT_UNAVAILABLE',
        'timeSlot',
        true
      );
    }
    
    // Handle rate limiting
    if (error.response.status === 429) {
      return new BookingError(
        'Too many requests. Please wait a moment and try again.',
        'RATE_LIMITED',
        undefined,
        true
      );
    }
    
    // Handle server errors
    if (error.response.status >= 500) {
      return new BookingError(
        'Server error. Please try again later.',
        'SERVER_ERROR',
        undefined,
        true
      );
    }
    
    // Generic API error
    return new BookingError(message || 'An error occurred');
  }
  
  // Fallback to generic error
  return new Error(error.message || 'An unexpected error occurred');
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: Error): string {
  if (error instanceof BookingError) {
    switch (error.code) {
      case 'BOOKING_CONFLICT':
        return 'This time slot is no longer available. Please choose a different time.';
      case 'STYLIST_UNAVAILABLE':
        return 'The selected stylist is not available. Please choose a different stylist or time.';
      case 'SERVICE_UNAVAILABLE':
        return 'This service is currently unavailable. Please try a different service.';
      case 'TIME_SLOT_UNAVAILABLE':
        return 'This time slot is not available. Please select a different time.';
      case 'RATE_LIMITED':
        return 'Please wait a moment before trying again.';
      case 'SERVER_ERROR':
        return 'Something went wrong on our end. Please try again in a few moments.';
      default:
        return error.message;
    }
  }
  
  if (error instanceof ValidationError) {
    return 'Please check your input and try again.';
  }
  
  if (error instanceof NetworkError) {
    return 'Connection problem. Please check your internet connection and try again.';
  }
  
  return error.message || 'An unexpected error occurred. Please try again.';
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: Error): boolean {
  if (error instanceof BookingError) {
    return error.retryable;
  }
  
  if (error instanceof NetworkError) {
    return error.retryable;
  }
  
  if (error instanceof ValidationError) {
    return false;
  }
  
  // Default retryable errors
  return error.message.includes('timeout') || 
         error.message.includes('network') ||
         error.message.includes('connection');
}

/**
 * Get error details for logging
 */
export function getErrorDetails(error: Error): ErrorDetails {
  if (error instanceof BookingError) {
    return {
      message: error.message,
      code: error.code,
      field: error.field,
      timestamp: error.timestamp,
      retryable: error.retryable
    };
  }
  
  if (error instanceof NetworkError) {
    return {
      message: error.message,
      code: 'NETWORK_ERROR',
      timestamp: error.timestamp,
      retryable: error.retryable
    };
  }
  
  if (error instanceof ValidationError) {
    return {
      message: error.message,
      code: 'VALIDATION_ERROR',
      timestamp: error.timestamp,
      retryable: false
    };
  }
  
  return {
    message: error.message,
    code: 'UNKNOWN_ERROR',
    timestamp: new Date().toISOString(),
    retryable: false
  };
}

/**
 * Log error
 */
export function logError(error: Error, context?: any): void {
  const errorDetails = getErrorDetails(error);
  
  console.error('Error occurred:', {
    ...errorDetails,
    context,
    stack: error.stack
  });
  
  // In production, you might want to send this to an error tracking service
  if (process.env.NODE_ENV === 'production') {
    // Example: send to error tracking service
    // errorTrackingService.captureException(error, { extra: context });
  }
}

/**
 * Create a retry mechanism for failed operations
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    retryDelay?: number;
    onRetry?: (attempt: number, error: Error) => void;
  } = {}
): Promise<T> {
  const { maxRetries = 3, retryDelay = 1000, onRetry } = options;
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on non-retryable errors
      if (!isRetryableError(lastError) || attempt === maxRetries) {
        throw lastError;
      }
      
      // Call retry callback
      onRetry?.(attempt + 1, lastError);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
    }
  }
  
  throw lastError!;
}

/**
 * Enhanced error boundary for React components
 */
export function createErrorBoundary() {
  return {
    getDerivedStateFromError: (error: Error) => {
      logError(error, { component: 'ErrorBoundary' });
      return { hasError: true, error };
    },
    
    componentDidCatch: (error: Error, errorInfo: any) => {
      logError(error, { 
        component: 'ErrorBoundary',
        errorInfo 
      });
    }
  };
}
