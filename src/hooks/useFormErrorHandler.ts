/**
 * Custom hook for enhanced form error handling
 * Provides consistent error display and validation across all forms
 */

import { toast } from 'sonner';

interface FormErrorHandlerOptions {
  onError?: (error: any) => void;
  redirectToStep?: (step: number) => void;
}

interface ApiError {
  errors?: Record<string, string | string[]>;
  response?: {
    data?: Record<string, string | string[]>;
  };
  data?: Record<string, string | string[]>;
  message?: string;
  detail?: string;
}

/**
 * Parse and display API errors in a user-friendly format
 */
export const useFormErrorHandler = (options: FormErrorHandlerOptions = {}) => {
  const handleError = (err: ApiError, fieldNames?: Record<string, string>) => {
    console.error('Form error:', err);

    const errorData = err?.errors || err?.response?.data || err?.data;

    // Build detailed error message
    let errorMessage = 'Operation failed';
    let errorDescription = '';
    let errorField: string | null = null;

    // Check for field-specific errors
    if (errorData && typeof errorData === 'object') {
      // Find the first error field
      const errorEntries = Object.entries(errorData);
      
      if (errorEntries.length > 0) {
        const [field, value] = errorEntries[0];
        errorField = field;
        
        // Get human-readable field name
        const fieldLabel = fieldNames?.[field] || field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        // Extract error message
        const errorMsg = Array.isArray(value) ? value[0] : value;
        
        errorMessage = `${fieldLabel} Error`;
        errorDescription = errorMsg;
      }
    }

    // Check for non-field errors
    if (!errorDescription) {
      if (errorData?.non_field_errors) {
        const nonFieldError = Array.isArray(errorData.non_field_errors) 
          ? errorData.non_field_errors[0] 
          : errorData.non_field_errors;
        errorDescription = nonFieldError;
      } else if (errorData?.detail) {
        errorDescription = Array.isArray(errorData.detail)
          ? errorData.detail[0]
          : (errorData.detail as string);
      } else if (err?.message) {
        errorDescription = err.message;
      }
    }

    // Show comprehensive error toast
    toast.error(errorMessage, {
      description: errorDescription || 'Please check the form and try again',
      duration: 8000,
    });

    // Call custom error handler if provided
    if (options.onError) {
      options.onError(err);
    }

    return {
      field: errorField,
      message: errorDescription,
    };
  };

  return { handleError };
};

/**
 * Validate required field with user-friendly error message
 */
export const validateRequired = (value: any, fieldName: string): boolean => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    toast.error('Required Field', {
      description: `${fieldName} is required`,
      duration: 5000,
    });
    return false;
  }
  return true;
};

/**
 * Validate college selection for super admins
 */
export const validateCollegeSelection = (collegeId: number | null | undefined, isSuperAdmin: boolean): boolean => {
  if (isSuperAdmin && !collegeId) {
    toast.error('College Required', {
      description: 'Please select a college before proceeding',
      duration: 5000,
    });
    return false;
  }
  return true;
};

/**
 * Show success message
 */
export const showSuccess = (message: string, description?: string) => {
  toast.success(message, {
    description,
    duration: 4000,
  });
};

/**
 * Show info message
 */
export const showInfo = (message: string, description?: string) => {
  toast.info(message, {
    description,
    duration: 4000,
  });
};

/**
 * Show warning message
 */
export const showWarning = (message: string, description?: string) => {
  toast.warning(message, {
    description,
    duration: 5000,
  });
};

/**
 * Field name mappings for common fields
 */
export const COMMON_FIELD_NAMES: Record<string, string> = {
  username: 'Username',
  email: 'Email',
  password: 'Password',
  first_name: 'First Name',
  last_name: 'Last Name',
  phone: 'Phone Number',
  college: 'College',
  program: 'Program',
  current_class: 'Class',
  current_section: 'Section',
  admission_number: 'Admission Number',
  registration_number: 'Registration Number',
  roll_number: 'Roll Number',
  date_of_birth: 'Date of Birth',
  academic_year: 'Academic Year',
  name: 'Name',
  code: 'Code',
  description: 'Description',
  start_date: 'Start Date',
  end_date: 'End Date',
  is_active: 'Active Status',
};
