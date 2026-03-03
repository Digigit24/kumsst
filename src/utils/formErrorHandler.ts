/**
 * Form Error Handling Utilities
 * Provides consistent error handling across all forms
 */

import { UseFormSetError, FieldValues, Path } from 'react-hook-form';
import { toast } from 'sonner';

/**
 * Maps API field-level errors to React Hook Form fields
 * @param error - The error object from API response
 * @param setError - React Hook Form's setError function
 * @returns true if errors were mapped, false otherwise
 */
export function mapApiErrorsToForm<T extends FieldValues>(
  error: any,
  setError: UseFormSetError<T>
): boolean {
  if (!error) return false;

  // Handle Django REST Framework error format
  if (error.errors && typeof error.errors === 'object') {
    let hasErrors = false;

    Object.keys(error.errors).forEach((fieldName) => {
      const errorMessages = error.errors[fieldName];
      const message = Array.isArray(errorMessages)
        ? errorMessages.join(', ')
        : String(errorMessages);

      try {
        setError(fieldName as Path<T>, {
          type: 'server',
          message: message,
        });
        hasErrors = true;
      } catch (e) {
        // Field might not exist in form, show as toast
        toast.error(`${fieldName}: ${message}`);
        hasErrors = true;
      }
    });

    return hasErrors;
  }

  // Handle single error message
  if (error.detail || error.message) {
    toast.error(error.detail || error.message || 'An error occurred');
    return true;
  }

  return false;
}

/**
 * Generic error handler for form submissions
 * @param error - The error object
 * @param setError - Optional React Hook Form's setError function
 * @param customMessage - Optional custom error message
 */
export function handleFormError<T extends FieldValues>(
  error: any,
  setError?: UseFormSetError<T>,
  customMessage?: string
): void {
  // Try to map field-level errors first
  if (setError && mapApiErrorsToForm(error, setError)) {
    return;
  }

  // Show general error message
  const message =
    customMessage ||
    error?.message ||
    error?.detail ||
    error?.error ||
    'An unexpected error occurred. Please try again.';

  toast.error(message);
}

/**
 * Validates required fields before submission (for non-React Hook Form forms)
 * @param formData - The form data object
 * @param requiredFields - Array of required field names with labels
 * @returns true if valid, false otherwise
 */
export function validateRequiredFields(
  formData: Record<string, any>,
  requiredFields: Array<{ name: string; label: string }>
): boolean {
  const missingFields: string[] = [];

  requiredFields.forEach(({ name, label }) => {
    const value = formData[name];

    if (
      value === undefined ||
      value === null ||
      value === '' ||
      (Array.isArray(value) && value.length === 0)
    ) {
      missingFields.push(label);
    }
  });

  if (missingFields.length > 0) {
    toast.error(`Please fill required fields: ${missingFields.join(', ')}`);
    return false;
  }

  return true;
}

/**
 * Validates numeric fields
 * @param value - The value to validate
 * @param fieldLabel - The field label for error message
 * @param options - Validation options (min, max, etc.)
 * @returns true if valid, false otherwise
 */
export function validateNumericField(
  value: any,
  fieldLabel: string,
  options?: { min?: number; max?: number; required?: boolean }
): boolean {
  const { min, max, required = true } = options || {};

  if (required && (value === undefined || value === null || value === '')) {
    toast.error(`${fieldLabel} is required`);
    return false;
  }

  if (value !== undefined && value !== null && value !== '') {
    const numValue = Number(value);

    if (isNaN(numValue)) {
      toast.error(`${fieldLabel} must be a valid number`);
      return false;
    }

    if (min !== undefined && numValue < min) {
      toast.error(`${fieldLabel} must be at least ${min}`);
      return false;
    }

    if (max !== undefined && numValue > max) {
      toast.error(`${fieldLabel} must be at most ${max}`);
      return false;
    }
  }

  return true;
}

/**
 * Gets error message for a specific field (for inline display)
 * @param errors - Form errors object
 * @param fieldName - Field name to check
 * @returns Error message string or empty string
 */
export function getFieldError(
  errors: Record<string, any>,
  fieldName: string
): string {
  const error = errors[fieldName];
  return error?.message ? String(error.message) : '';
}

/**
 * Extracts error message from various error formats
 * @param error - The error object
 * @returns Error message string
 */
export function extractErrorMessage(error: any): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error?.message) {
    return error.message;
  }

  if (error?.detail) {
    return error.detail;
  }

  if (error?.error) {
    return typeof error.error === 'string' ? error.error : JSON.stringify(error.error);
  }

  if (error?.errors && typeof error.errors === 'object') {
    // Try to extract first error from errors object
    const firstKey = Object.keys(error.errors)[0];
    if (firstKey) {
      const firstError = error.errors[firstKey];
      return Array.isArray(firstError) ? firstError[0] : String(firstError);
    }
  }

  return 'An unexpected error occurred';
}
