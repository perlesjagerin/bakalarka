import { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { ERROR_MESSAGES } from '../constants/messages';

interface ApiError {
  error?: string;
  message?: string;
}

/**
 * Extracts error message from various error formats
 * Handles Axios errors, API responses, and generic errors
 */
export function getErrorMessage(error: unknown, fallbackMessage: string = ERROR_MESSAGES.GENERIC_ERROR): string {
  if (!error) return fallbackMessage;
  
  // Handle Axios errors
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as AxiosError<ApiError>;
    const errorData = axiosError.response?.data;
    
    if (errorData) {
      return errorData.error || errorData.message || fallbackMessage;
    }
  }
  
  // Handle Error objects
  if (error instanceof Error) {
    return error.message || fallbackMessage;
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }
  
  return fallbackMessage;
}

/**
 * Shows error toast notification with proper error extraction
 */
export function showErrorToast(error: unknown, fallbackMessage: string = ERROR_MESSAGES.GENERIC_ERROR): void {
  const message = getErrorMessage(error, fallbackMessage);
  toast.error(message);
}

/**
 * Shows success toast notification
 */
export function showSuccessToast(message: string): void {
  toast.success(message);
}
