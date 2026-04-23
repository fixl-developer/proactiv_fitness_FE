/**
 * useAdminForm Hook
 * Comprehensive form management for admin pages
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { validateForm, FormValidationRules, ValidationError } from '@/utils/formValidation';
import { parseApiError, getErrorMessage } from '@/utils/apiErrorHandler';

export interface UseAdminFormOptions {
    onSuccess?: (data?: any) => void;
    onError?: (error: any) => void;
    showToast?: boolean;
}

export interface UseAdminFormReturn {
    formData: Record<string, any>;
    errors: ValidationError[];
    isLoading: boolean;
    isSubmitting: boolean;
    setFormData: (data: Record<string, any>) => void;
    setFieldValue: (field: string, value: any) => void;
    setFieldError: (field: string, message: string) => void;
    clearFieldError: (field: string) => void;
    clearErrors: () => void;
    resetForm: (initialData?: Record<string, any>) => void;
    validate: (rules: FormValidationRules) => boolean;
    handleSubmit: (
        submitFn: (data: Record<string, any>) => Promise<any>,
        rules?: FormValidationRules
    ) => Promise<void>;
    getFieldError: (field: string) => string | null;
    hasFieldError: (field: string) => boolean;
}

export const useAdminForm = (
    initialData: Record<string, any> = {},
    options: UseAdminFormOptions = {}
): UseAdminFormReturn => {
    const [formData, setFormData] = useState<Record<string, any>>(initialData);
    const [errors, setErrors] = useState<ValidationError[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { onSuccess, onError, showToast = true } = options;

    // Set form data
    const handleSetFormData = useCallback((data: Record<string, any>) => {
        setFormData(data);
    }, []);

    // Set field value
    const setFieldValue = useCallback((field: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
        // Clear error for this field when user starts typing
        clearFieldError(field);
    }, []);

    // Set field error
    const setFieldError = useCallback((field: string, message: string) => {
        setErrors((prev) => {
            const filtered = prev.filter((e) => e.field !== field);
            return [...filtered, { field, message }];
        });
    }, []);

    // Clear field error
    const clearFieldError = useCallback((field: string) => {
        setErrors((prev) => prev.filter((e) => e.field !== field));
    }, []);

    // Clear all errors
    const clearErrors = useCallback(() => {
        setErrors([]);
    }, []);

    // Reset form
    const resetForm = useCallback((initialData?: Record<string, any>) => {
        setFormData(initialData || {});
        clearErrors();
    }, [clearErrors]);

    // Validate form
    const validate = useCallback((rules: FormValidationRules): boolean => {
        const result = validateForm(formData, rules);
        setErrors(result.errors);
        return result.isValid;
    }, [formData]);

    // Get field error
    const getFieldError = useCallback(
        (field: string): string | null => {
            const error = errors.find((e) => e.field === field);
            return error ? error.message : null;
        },
        [errors]
    );

    // Check if field has error
    const hasFieldError = useCallback(
        (field: string): boolean => {
            return errors.some((e) => e.field === field);
        },
        [errors]
    );

    // Handle form submission
    const handleSubmit = useCallback(
        async (
            submitFn: (data: Record<string, any>) => Promise<any>,
            rules?: FormValidationRules
        ) => {
            try {
                // Validate if rules provided
                if (rules && !validate(rules)) {
                    if (showToast) {
                        toast.error('Please fix the highlighted fields');
                    }
                    return;
                }

                setIsSubmitting(true);
                clearErrors();

                // Call submit function
                const result = await submitFn(formData);

                if (showToast) {
                    toast.success('Saved successfully');
                }

                // Call onSuccess callback
                if (onSuccess) {
                    onSuccess(result);
                }

                // Reset form after successful submission
                resetForm();
            } catch (error: any) {
                console.error('Form submission error:', error);

                const apiError = parseApiError(error);
                const errorMessage = getErrorMessage(error);

                // Handle validation errors from server
                if (apiError.details?.errors) {
                    const serverErrors: ValidationError[] = Object.entries(
                        apiError.details.errors
                    ).map(([field, message]) => ({
                        field,
                        message: String(message),
                    }));
                    setErrors(serverErrors);
                }

                if (showToast) {
                    toast.error(errorMessage);
                }

                // Call onError callback
                if (onError) {
                    onError(error);
                }
            } finally {
                setIsSubmitting(false);
            }
        },
        [formData, validate, clearErrors, onSuccess, onError, showToast, resetForm]
    );

    return {
        formData,
        errors,
        isLoading,
        isSubmitting,
        setFormData: handleSetFormData,
        setFieldValue,
        setFieldError,
        clearFieldError,
        clearErrors,
        resetForm,
        validate,
        handleSubmit,
        getFieldError,
        hasFieldError,
    };
};

export default useAdminForm;
