/**
 * Enhanced error display component with retry functionality
 */

import React from 'react';
import { AlertCircle, RefreshCw, X, AlertTriangle, Wifi, Clock } from 'lucide-react';
import { isRetryableError, getUserFriendlyMessage } from '../../lib/errorHandler';

interface ErrorDisplayProps {
  error: string | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  isRetrying?: boolean;
  className?: string;
  showRetryButton?: boolean;
  showDismissButton?: boolean;
}

export default function ErrorDisplay({
  error,
  onRetry,
  onDismiss,
  isRetrying = false,
  className = '',
  showRetryButton = true,
  showDismissButton = true
}: ErrorDisplayProps) {
  if (!error) return null;

  const getErrorIcon = () => {
    if (error.includes('network') || error.includes('connection')) {
      return <Wifi className="h-5 w-5" />;
    }
    if (error.includes('timeout') || error.includes('time')) {
      return <Clock className="h-5 w-5" />;
    }
    if (error.includes('validation') || error.includes('required')) {
      return <AlertTriangle className="h-5 w-5" />;
    }
    return <AlertCircle className="h-5 w-5" />;
  };

  const getErrorType = () => {
    if (error.includes('network') || error.includes('connection')) {
      return 'network';
    }
    if (error.includes('timeout')) {
      return 'timeout';
    }
    if (error.includes('validation') || error.includes('required')) {
      return 'validation';
    }
    if (error.includes('conflict') || error.includes('already booked')) {
      return 'conflict';
    }
    return 'general';
  };

  const errorType = getErrorType();
  const isRetryable = isRetryableError(new Error(error));

  const getErrorStyles = () => {
    switch (errorType) {
      case 'network':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'timeout':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'validation':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'conflict':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      default:
        return 'bg-red-50 border-red-200 text-red-800';
    }
  };

  return (
    <div className={`rounded-lg border p-4 ${getErrorStyles()} ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getErrorIcon()}
        </div>
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">
              {errorType === 'network' && 'Connection Error'}
              {errorType === 'timeout' && 'Request Timeout'}
              {errorType === 'validation' && 'Validation Error'}
              {errorType === 'conflict' && 'Booking Conflict'}
              {errorType === 'general' && 'Error'}
            </h3>
            <div className="flex items-center space-x-2">
              {showRetryButton && isRetryable && onRetry && (
                <button
                  onClick={onRetry}
                  disabled={isRetrying}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRetrying ? (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Retry
                    </>
                  )}
                </button>
              )}
              {showDismissButton && onDismiss && (
                <button
                  onClick={onDismiss}
                  className="inline-flex items-center p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          <div className="mt-2">
            <p className="text-sm">{error}</p>
            {errorType === 'network' && (
              <p className="text-xs mt-1">
                Please check your internet connection and try again.
              </p>
            )}
            {errorType === 'timeout' && (
              <p className="text-xs mt-1">
                The request took too long to complete. Please try again.
              </p>
            )}
            {errorType === 'conflict' && (
              <p className="text-xs mt-1">
                This time slot is no longer available. Please choose a different time.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Validation error display component
 */
interface ValidationErrorDisplayProps {
  errors: Record<string, string>;
  onDismiss?: () => void;
  className?: string;
}

export function ValidationErrorDisplay({
  errors,
  onDismiss,
  className = ''
}: ValidationErrorDisplayProps) {
  if (!errors || Object.keys(errors).length === 0) return null;

  return (
    <div className={`rounded-lg border border-blue-200 bg-blue-50 p-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-blue-400" />
        </div>
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-blue-800">
              Please fix the following errors:
            </h3>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="inline-flex items-center p-1 text-blue-400 hover:text-blue-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="mt-2">
            <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
              {Object.entries(errors).map(([field, message]) => (
                <li key={field}>
                  <span className="font-medium capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}:</span> {message}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Success message display component
 */
interface SuccessDisplayProps {
  message: string;
  onDismiss?: () => void;
  className?: string;
  showDismissButton?: boolean;
}

export function SuccessDisplay({
  message,
  onDismiss,
  className = '',
  showDismissButton = true
}: SuccessDisplayProps) {
  return (
    <div className={`rounded-lg border border-green-200 bg-green-50 p-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-green-800">
              Success!
            </h3>
            {showDismissButton && onDismiss && (
              <button
                onClick={onDismiss}
                className="inline-flex items-center p-1 text-green-400 hover:text-green-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="mt-2">
            <p className="text-sm text-green-700">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
