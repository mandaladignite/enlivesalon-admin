/**
 * Comprehensive validation utilities for booking system
 */

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any, data?: any) => string | null;
  message?: string;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validate a single field against a rule
 */
export function validateField(value: any, rule: ValidationRule, data?: any): string | null {
  // Required validation
  if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return rule.message || 'This field is required';
  }

  // Skip other validations if value is empty and not required
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return null;
  }

  // String length validations
  if (typeof value === 'string') {
    if (rule.minLength && value.length < rule.minLength) {
      return rule.message || `Must be at least ${rule.minLength} characters`;
    }
    if (rule.maxLength && value.length > rule.maxLength) {
      return rule.message || `Must be no more than ${rule.maxLength} characters`;
    }
  }

  // Pattern validation
  if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
    return rule.message || 'Invalid format';
  }

  // Custom validation
  if (rule.custom) {
    return rule.custom(value, data);
  }

  return null;
}

/**
 * Validate an object against a schema
 */
export function validateObject(data: any, schema: ValidationSchema): ValidationResult {
  const errors: Record<string, string> = {};

  for (const [field, rule] of Object.entries(schema)) {
    const value = data[field];
    const error = validateField(value, rule, data);
    if (error) {
      errors[field] = error;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Booking-specific validation schemas
 */
export const bookingValidationSchema: ValidationSchema = {
  serviceId: {
    required: true,
    message: 'Please select a service'
  },
  date: {
    required: true,
    custom: (value: string) => {
      if (!value) return 'Please select a date';
      
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate <= today) {
        return 'Appointment date must be in the future';
      }
      
      // Check if date is not more than 30 days in the future
      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() + 30);
      
      if (selectedDate > maxDate) {
        return 'Appointment date cannot be more than 30 days in the future';
      }
      
      return null;
    }
  },
  timeSlot: {
    required: true,
    pattern: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    message: 'Please select a valid time slot'
  },
  location: {
    required: true,
    custom: (value: string) => {
      if (!value) return 'Please select a location';
      if (!['home', 'salon'].includes(value)) {
        return 'Location must be either home or salon';
      }
      return null;
    }
  },
  'address.street': {
    custom: (value: string, data: any) => {
      if (data.location === 'home' && (!value || value.trim() === '')) {
        return 'Street address is required for home appointments';
      }
      return null;
    }
  },
  'address.city': {
    custom: (value: string, data: any) => {
      if (data.location === 'home' && (!value || value.trim() === '')) {
        return 'City is required for home appointments';
      }
      return null;
    }
  },
  'address.state': {
    custom: (value: string, data: any) => {
      if (data.location === 'home' && (!value || value.trim() === '')) {
        return 'State is required for home appointments';
      }
      return null;
    }
  },
  'address.zipCode': {
    custom: (value: string, data: any) => {
      if (data.location === 'home' && (!value || value.trim() === '')) {
        return 'ZIP code is required for home appointments';
      }
      if (value && !/^\d{5,6}$/.test(value)) {
        return 'ZIP code must be 5-6 digits';
      }
      return null;
    }
  },
  notes: {
    maxLength: 500,
    message: 'Notes cannot exceed 500 characters'
  },
  specialInstructions: {
    maxLength: 1000,
    message: 'Special instructions cannot exceed 1000 characters'
  }
};

/**
 * Enhanced booking validation with nested object support
 */
export function validateBookingData(data: any): ValidationResult {
  const errors: Record<string, string> = {};

  // Validate top-level fields
  for (const [field, rule] of Object.entries(bookingValidationSchema)) {
    if (field.includes('.')) {
      // Handle nested fields like address.street
      const [parent, child] = field.split('.');
      const value = data[parent]?.[child];
      const error = validateField(value, rule, data);
      if (error) {
        errors[field] = error;
      }
    } else {
      // Handle top-level fields
      const value = data[field];
      const error = validateField(value, rule, data);
      if (error) {
        errors[field] = error;
      }
    }
  }

  // Additional business logic validations
  if (data.location === 'home' && data.address) {
    const address = data.address;
    const requiredFields = ['street', 'city', 'state'];
    
    for (const field of requiredFields) {
      if (!address[field] || address[field].trim() === '') {
        errors[`address.${field}`] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required for home appointments`;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Real-time validation for form fields
 */
export function validateFieldRealtime(
  field: string, 
  value: any, 
  data: any
): string | null {
  const rule = bookingValidationSchema[field];
  if (!rule) return null;

  return validateField(value, rule, data);
}

/**
 * Validate time slot availability
 */
export function validateTimeSlot(
  timeSlot: string,
  availableSlots: string[]
): string | null {
  if (!timeSlot) return 'Please select a time slot';
  
  if (!availableSlots.includes(timeSlot)) {
    return 'This time slot is no longer available';
  }
  
  return null;
}

/**
 * Validate stylist availability
 */
export function validateStylistAvailability(
  stylistId: string,
  date: string,
  timeSlot: string,
  availableStylists: any[]
): string | null {
  if (!stylistId) return null; // Stylist is optional
  
  const stylist = availableStylists.find(s => s._id === stylistId);
  if (!stylist) {
    return 'Selected stylist is not available';
  }
  
  if (!stylist.isActive) {
    return 'Selected stylist is currently inactive';
  }
  
  // Check if stylist works on the selected day
  const selectedDate = new Date(date);
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayOfWeek = days[selectedDate.getDay()];
  
  if (!stylist.workingDays.includes(dayOfWeek)) {
    return 'Stylist is not available on this day';
  }
  
  // Check if time slot is within working hours
  if (timeSlot < stylist.workingHours.start || timeSlot > stylist.workingHours.end) {
    return 'Time slot is outside stylist working hours';
  }
  
  return null;
}

/**
 * Validate service availability
 */
export function validateServiceAvailability(
  serviceId: string,
  location: string,
  availableServices: any[]
): string | null {
  if (!serviceId) return 'Please select a service';
  
  const service = availableServices.find(s => s._id === serviceId);
  if (!service) {
    return 'Selected service is not available';
  }
  
  if (!service.isActive) {
    return 'Selected service is currently inactive';
  }
  
  if (location === 'home' && !service.availableAtHome) {
    return 'This service is not available at home';
  }
  
  if (location === 'salon' && !service.availableAtSalon) {
    return 'This service is not available at salon';
  }
  
  return null;
}

/**
 * Get validation error message for a specific field
 */
export function getFieldError(
  field: string,
  errors: Record<string, string>
): string | null {
  return errors[field] || null;
}

/**
 * Check if a field has validation errors
 */
export function hasFieldError(
  field: string,
  errors: Record<string, string>
): boolean {
  return !!errors[field];
}

/**
 * Clear validation errors for a specific field
 */
export function clearFieldError(
  field: string,
  errors: Record<string, string>
): Record<string, string> {
  const newErrors = { ...errors };
  delete newErrors[field];
  return newErrors;
}

/**
 * Get all validation errors as a formatted string
 */
export function getValidationErrorsString(errors: Record<string, string>): string {
  return Object.values(errors).join(', ');
}
