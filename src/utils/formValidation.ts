/**
 * Form Validation Utilities
 * Comprehensive validation functions for forms
 */

export interface ValidationError {
    field: string;
    message: string;
}

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
}

// Email validation
export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Phone validation (international format)
export const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
};

// URL validation
export const validateUrl = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

// Required field validation
export const validateRequired = (value: any): boolean => {
    if (typeof value === 'string') {
        return value.trim().length > 0;
    }
    if (Array.isArray(value)) {
        return value.length > 0;
    }
    return value !== null && value !== undefined;
};

// Min length validation
export const validateMinLength = (value: string, minLength: number): boolean => {
    return value.length >= minLength;
};

// Max length validation
export const validateMaxLength = (value: string, maxLength: number): boolean => {
    return value.length <= maxLength;
};

// Number validation
export const validateNumber = (value: any): boolean => {
    return !isNaN(parseFloat(value)) && isFinite(value);
};

// Min value validation
export const validateMinValue = (value: number, minValue: number): boolean => {
    return value >= minValue;
};

// Max value validation
export const validateMaxValue = (value: number, maxValue: number): boolean => {
    return value <= maxValue;
};

// Date validation
export const validateDate = (dateString: string): boolean => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
};

// Future date validation
export const validateFutureDate = (dateString: string): boolean => {
    if (!validateDate(dateString)) return false;
    return new Date(dateString) > new Date();
};

// Past date validation
export const validatePastDate = (dateString: string): boolean => {
    if (!validateDate(dateString)) return false;
    return new Date(dateString) < new Date();
};

// Password validation (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char)
export const validatePassword = (password: string): boolean => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
};

// Weak password validation (min 6 chars)
export const validateWeakPassword = (password: string): boolean => {
    return password.length >= 6;
};

// Match fields validation
export const validateMatch = (value1: any, value2: any): boolean => {
    return value1 === value2;
};

// Custom regex validation
export const validateRegex = (value: string, pattern: RegExp): boolean => {
    return pattern.test(value);
};

// Validate form field
export interface FieldValidationRule {
    type: 'required' | 'email' | 'phone' | 'url' | 'minLength' | 'maxLength' | 'number' | 'minValue' | 'maxValue' | 'date' | 'futureDate' | 'pastDate' | 'password' | 'weakPassword' | 'match' | 'regex' | 'custom';
    message: string;
    value?: any; // For minLength, maxLength, minValue, maxValue, match, regex
    validator?: (value: any) => boolean; // For custom validation
}

export const validateField = (
    fieldValue: any,
    rules: FieldValidationRule[]
): ValidationError | null => {
    for (const rule of rules) {
        let isValid = false;

        switch (rule.type) {
            case 'required':
                isValid = validateRequired(fieldValue);
                break;
            case 'email':
                isValid = validateEmail(fieldValue);
                break;
            case 'phone':
                isValid = validatePhone(fieldValue);
                break;
            case 'url':
                isValid = validateUrl(fieldValue);
                break;
            case 'minLength':
                isValid = validateMinLength(fieldValue, rule.value);
                break;
            case 'maxLength':
                isValid = validateMaxLength(fieldValue, rule.value);
                break;
            case 'number':
                isValid = validateNumber(fieldValue);
                break;
            case 'minValue':
                isValid = validateMinValue(fieldValue, rule.value);
                break;
            case 'maxValue':
                isValid = validateMaxValue(fieldValue, rule.value);
                break;
            case 'date':
                isValid = validateDate(fieldValue);
                break;
            case 'futureDate':
                isValid = validateFutureDate(fieldValue);
                break;
            case 'pastDate':
                isValid = validatePastDate(fieldValue);
                break;
            case 'password':
                isValid = validatePassword(fieldValue);
                break;
            case 'weakPassword':
                isValid = validateWeakPassword(fieldValue);
                break;
            case 'match':
                isValid = validateMatch(fieldValue, rule.value);
                break;
            case 'regex':
                isValid = validateRegex(fieldValue, rule.value);
                break;
            case 'custom':
                isValid = rule.validator ? rule.validator(fieldValue) : false;
                break;
        }

        if (!isValid) {
            return {
                field: '',
                message: rule.message,
            };
        }
    }

    return null;
};

// Validate entire form
export interface FormValidationRules {
    [fieldName: string]: FieldValidationRule[];
}

export const validateForm = (
    formData: Record<string, any>,
    rules: FormValidationRules
): ValidationResult => {
    const errors: ValidationError[] = [];

    for (const [fieldName, fieldRules] of Object.entries(rules)) {
        const fieldValue = formData[fieldName];
        const error = validateField(fieldValue, fieldRules);

        if (error) {
            errors.push({
                field: fieldName,
                message: error.message,
            });
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};

// Get error message for a field
export const getFieldError = (
    errors: ValidationError[],
    fieldName: string
): string | null => {
    const error = errors.find((e) => e.field === fieldName);
    return error ? error.message : null;
};

// Check if field has error
export const hasFieldError = (
    errors: ValidationError[],
    fieldName: string
): boolean => {
    return errors.some((e) => e.field === fieldName);
};
