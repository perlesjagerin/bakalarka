import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { getErrorMessage, showErrorToast, showSuccessToast } from '../errorHandling';
import { ERROR_MESSAGES } from '../../constants/messages';

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('errorHandling utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getErrorMessage', () => {
    it('should return fallback message for null/undefined error', () => {
      expect(getErrorMessage(null)).toBe(ERROR_MESSAGES.GENERIC_ERROR);
      expect(getErrorMessage(undefined)).toBe(ERROR_MESSAGES.GENERIC_ERROR);
    });

    it('should return custom fallback message when provided', () => {
      const customMessage = 'Custom fallback';
      expect(getErrorMessage(null, customMessage)).toBe(customMessage);
    });

    it('should extract error message from Axios error with error field', () => {
      const axiosError: Partial<AxiosError> = {
        response: {
          data: {
            error: 'Axios error message',
          },
          status: 400,
          statusText: 'Bad Request',
          headers: {},
          config: {} as any,
        },
      };

      expect(getErrorMessage(axiosError)).toBe('Axios error message');
    });

    it('should extract error message from Axios error with message field', () => {
      const axiosError: Partial<AxiosError> = {
        response: {
          data: {
            message: 'Error from message field',
          },
          status: 400,
          statusText: 'Bad Request',
          headers: {},
          config: {} as any,
        },
      };

      expect(getErrorMessage(axiosError)).toBe('Error from message field');
    });

    it('should prefer error field over message field in Axios error', () => {
      const axiosError: Partial<AxiosError> = {
        response: {
          data: {
            error: 'Error field message',
            message: 'Message field',
          },
          status: 400,
          statusText: 'Bad Request',
          headers: {},
          config: {} as any,
        },
      };

      expect(getErrorMessage(axiosError)).toBe('Error field message');
    });

    it('should return fallback for Axios error without response data', () => {
      const axiosError: Partial<AxiosError> = {
        response: {
          data: undefined,
          status: 500,
          statusText: 'Internal Server Error',
          headers: {},
          config: {} as any,
        },
      };

      expect(getErrorMessage(axiosError)).toBe(ERROR_MESSAGES.GENERIC_ERROR);
    });

    it('should extract message from Error object', () => {
      const error = new Error('Standard error message');
      expect(getErrorMessage(error)).toBe('Standard error message');
    });

    it('should return fallback for Error object without message', () => {
      const error = new Error('');
      expect(getErrorMessage(error)).toBe(ERROR_MESSAGES.GENERIC_ERROR);
    });

    it('should return string error directly', () => {
      expect(getErrorMessage('Simple string error')).toBe('Simple string error');
    });

    it('should return fallback for empty string error', () => {
      expect(getErrorMessage('')).toBe(ERROR_MESSAGES.GENERIC_ERROR);
    });

    it('should return fallback for non-error objects', () => {
      expect(getErrorMessage({ random: 'object' })).toBe(ERROR_MESSAGES.GENERIC_ERROR);
      expect(getErrorMessage(123)).toBe(ERROR_MESSAGES.GENERIC_ERROR);
      expect(getErrorMessage(true)).toBe(ERROR_MESSAGES.GENERIC_ERROR);
    });

    it('should handle nested error structures', () => {
      const complexError = {
        response: {
          data: {
            error: 'Nested error message',
            details: 'Additional info',
          },
          status: 422,
          statusText: 'Unprocessable Entity',
          headers: {},
          config: {} as any,
        },
      };

      expect(getErrorMessage(complexError)).toBe('Nested error message');
    });
  });

  describe('showErrorToast', () => {
    it('should call toast.error with extracted error message', () => {
      const error = new Error('Test error');
      showErrorToast(error);
      
      expect(toast.error).toHaveBeenCalledWith('Test error');
      expect(toast.error).toHaveBeenCalledTimes(1);
    });

    it('should call toast.error with fallback message for null error', () => {
      showErrorToast(null);
      
      expect(toast.error).toHaveBeenCalledWith(ERROR_MESSAGES.GENERIC_ERROR);
    });

    it('should call toast.error with custom fallback message', () => {
      const customMessage = 'Custom error';
      showErrorToast(null, customMessage);
      
      expect(toast.error).toHaveBeenCalledWith(customMessage);
    });

    it('should handle Axios errors correctly', () => {
      const axiosError: Partial<AxiosError> = {
        response: {
          data: {
            error: 'API error',
          },
          status: 400,
          statusText: 'Bad Request',
          headers: {},
          config: {} as any,
        },
      };

      showErrorToast(axiosError);
      
      expect(toast.error).toHaveBeenCalledWith('API error');
    });

    it('should handle string errors', () => {
      showErrorToast('String error message');
      
      expect(toast.error).toHaveBeenCalledWith('String error message');
    });

    it('should not throw when called multiple times', () => {
      expect(() => {
        showErrorToast('Error 1');
        showErrorToast('Error 2');
        showErrorToast('Error 3');
      }).not.toThrow();

      expect(toast.error).toHaveBeenCalledTimes(3);
    });
  });

  describe('showSuccessToast', () => {
    it('should call toast.success with provided message', () => {
      showSuccessToast('Success message');
      
      expect(toast.success).toHaveBeenCalledWith('Success message');
      expect(toast.success).toHaveBeenCalledTimes(1);
    });

    it('should handle empty string', () => {
      showSuccessToast('');
      
      expect(toast.success).toHaveBeenCalledWith('');
    });

    it('should handle long messages', () => {
      const longMessage = 'A'.repeat(1000);
      showSuccessToast(longMessage);
      
      expect(toast.success).toHaveBeenCalledWith(longMessage);
    });

    it('should handle special characters', () => {
      const specialMessage = 'Success! 🎉 "Quoted" & <special>';
      showSuccessToast(specialMessage);
      
      expect(toast.success).toHaveBeenCalledWith(specialMessage);
    });

    it('should not throw when called multiple times', () => {
      expect(() => {
        showSuccessToast('Success 1');
        showSuccessToast('Success 2');
        showSuccessToast('Success 3');
      }).not.toThrow();

      expect(toast.success).toHaveBeenCalledTimes(3);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle typical API error flow', () => {
      const apiError: Partial<AxiosError> = {
        response: {
          data: {
            error: 'Uživatel nebyl nalezen',
          },
          status: 404,
          statusText: 'Not Found',
          headers: {},
          config: {} as any,
        },
      };

      const message = getErrorMessage(apiError);
      expect(message).toBe('Uživatel nebyl nalezen');

      showErrorToast(apiError);
      expect(toast.error).toHaveBeenCalledWith('Uživatel nebyl nalezen');
    });

    it('should handle network error without response', () => {
      const networkError: Partial<AxiosError> = {
        message: 'Network Error',
        code: 'ERR_NETWORK',
      };

      // Should fall back to generic error since there's no response
      const message = getErrorMessage(networkError, ERROR_MESSAGES.NETWORK_ERROR);
      expect(message).toBe(ERROR_MESSAGES.NETWORK_ERROR);
    });

    it('should handle authentication errors', () => {
      const authError: Partial<AxiosError> = {
        response: {
          data: {
            error: ERROR_MESSAGES.UNAUTHORIZED,
          },
          status: 401,
          statusText: 'Unauthorized',
          headers: {},
          config: {} as any,
        },
      };

      showErrorToast(authError);
      expect(toast.error).toHaveBeenCalledWith(ERROR_MESSAGES.UNAUTHORIZED);
    });

    it('should handle validation errors', () => {
      const validationError: Partial<AxiosError> = {
        response: {
          data: {
            error: 'Validace selhala',
            message: 'Email je již používán',
          },
          status: 422,
          statusText: 'Unprocessable Entity',
          headers: {},
          config: {} as any,
        },
      };

      const message = getErrorMessage(validationError);
      expect(message).toBe('Validace selhala');
    });

    it('should handle server errors with fallback', () => {
      const serverError: Partial<AxiosError> = {
        response: {
          data: {},
          status: 500,
          statusText: 'Internal Server Error',
          headers: {},
          config: {} as any,
        },
      };

      const message = getErrorMessage(serverError);
      expect(message).toBe(ERROR_MESSAGES.GENERIC_ERROR);
    });
  });

  describe('Edge cases', () => {
    it('should handle circular reference objects safely', () => {
      const circular: any = { name: 'test' };
      circular.self = circular;

      expect(() => getErrorMessage(circular)).not.toThrow();
      expect(getErrorMessage(circular)).toBe(ERROR_MESSAGES.GENERIC_ERROR);
    });

    it('should handle errors with null prototype', () => {
      const error = Object.create(null);
      error.message = 'Error with null prototype';

      expect(() => getErrorMessage(error)).not.toThrow();
    });

    it('should handle very long error messages', () => {
      const longError = 'A'.repeat(10000);
      expect(getErrorMessage(longError)).toBe(longError);
    });

    it('should handle unicode and emoji in error messages', () => {
      const unicodeError = '❌ Chyba: Akce nenalezena 🔍';
      expect(getErrorMessage(unicodeError)).toBe(unicodeError);
    });

    it('should handle errors with only whitespace', () => {
      expect(getErrorMessage('   ')).toBe('   ');
    });
  });
});
