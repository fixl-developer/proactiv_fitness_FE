import { z } from 'zod';

// Login validation
export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    rememberMe: z.boolean().optional(),
});

// Registration Step 1: Basic Info
export const registerStep1Schema = z
    .object({
        email: z.string().email('Invalid email address'),
        password: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
                'Password must contain uppercase, lowercase, number and special character'
            ),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    });

// Registration Step 2: Personal Info
export const registerStep2Schema = z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    phone: z
        .string()
        .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
    dateOfBirth: z.string().refine((date) => {
        const age = new Date().getFullYear() - new Date(date).getFullYear();
        return age >= 18;
    }, 'You must be at least 18 years old'),
    gender: z.enum(['male', 'female', 'other']),
});

// Registration Step 3: Address
export const registerStep3Schema = z.object({
    address: z.object({
        street: z.string().min(5, 'Street address is required'),
        city: z.string().min(2, 'City is required'),
        state: z.string().min(2, 'State is required'),
        zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid zip code'),
        country: z.string().min(2, 'Country is required'),
    }),
});

// Registration Step 4: Student Info
export const registerStep4Schema = z.object({
    students: z
        .array(
            z.object({
                firstName: z.string().min(2, 'First name is required'),
                lastName: z.string().min(2, 'Last name is required'),
                dateOfBirth: z.string().min(1, 'Date of birth is required'),
                gender: z.enum(['male', 'female', 'other']),
                school: z.string().optional(),
                medicalConditions: z.string().optional(),
            })
        )
        .min(1, 'At least one student is required')
        .optional(),
});

// Registration Step 5: Guardian Info
export const registerStep5Schema = z.object({
    guardians: z
        .array(
            z.object({
                firstName: z.string().min(2, 'First name is required'),
                lastName: z.string().min(2, 'Last name is required'),
                relationship: z.string().min(2, 'Relationship is required'),
                phone: z
                    .string()
                    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
                email: z.string().email('Invalid email address'),
                isEmergencyContact: z.boolean(),
            })
        )
        .min(1, 'At least one guardian is required')
        .optional(),
});

// Registration Step 6: Terms
export const registerStep6Schema = z.object({
    acceptTerms: z.boolean().refine((val) => val === true, {
        message: 'You must accept the terms and conditions',
    }),
    acceptPrivacy: z.boolean().refine((val) => val === true, {
        message: 'You must accept the privacy policy',
    }),
    marketingConsent: z.boolean().optional(),
});

// Forgot password
export const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
});

// Reset password
export const resetPasswordSchema = z
    .object({
        password: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
                'Password must contain uppercase, lowercase, number and special character'
            ),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    });

// Change password
export const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, 'Current password is required'),
        newPassword: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
                'Password must contain uppercase, lowercase, number and special character'
            ),
        confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    });

// Profile update
export const profileUpdateSchema = z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    phone: z
        .string()
        .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
        .optional(),
    dateOfBirth: z.string().optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    address: z
        .object({
            street: z.string().min(5, 'Street address is required'),
            city: z.string().min(2, 'City is required'),
            state: z.string().min(2, 'State is required'),
            zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid zip code'),
            country: z.string().min(2, 'Country is required'),
        })
        .optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterStep1Data = z.infer<typeof registerStep1Schema>;
export type RegisterStep2Data = z.infer<typeof registerStep2Schema>;
export type RegisterStep3Data = z.infer<typeof registerStep3Schema>;
export type RegisterStep4Data = z.infer<typeof registerStep4Schema>;
export type RegisterStep5Data = z.infer<typeof registerStep5Schema>;
export type RegisterStep6Data = z.infer<typeof registerStep6Schema>;
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;
