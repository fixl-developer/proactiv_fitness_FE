import { z } from 'zod';

// Reusable field rules ────────────────────────────────────────────────
const NAME_REGEX = /^[A-Za-z\s'-]+$/;
const PHONE_REGEX = /^[0-9+\-() ]{7,20}$/;
const ZIP_REGEX = /^[A-Za-z0-9\s-]{3,10}$/;
const ADDRESS_REGEX = /^[A-Za-z0-9\s.,'#\/-]+$/;

const nameField = (label: string) =>
    z
        .string()
        .min(2, `${label} must be at least 2 characters`)
        .regex(NAME_REGEX, `${label} can only contain letters, spaces, hyphens and apostrophes`);

const phoneField = z
    .string()
    .regex(PHONE_REGEX, 'Please enter a valid phone number (digits, +, -, spaces only)')
    .refine((v) => {
        const digits = v.replace(/\D/g, '');
        return digits.length >= 7 && digits.length <= 15;
    }, 'Phone number must be 7-15 digits');

const dobField = (minAge?: number) =>
    z.string().refine((value) => {
        if (!value) return false;
        const date = new Date(value);
        if (isNaN(date.getTime())) return false;
        const today = new Date();
        if (date > today) return false;
        if (minAge !== undefined) {
            const age = today.getFullYear() - date.getFullYear();
            return age >= minAge;
        }
        return true;
    }, minAge !== undefined ? `You must be at least ${minAge} years old` : 'Please enter a valid date of birth');

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
    firstName: nameField('First name'),
    lastName: nameField('Last name'),
    phone: phoneField,
    dateOfBirth: dobField(18),
    gender: z.enum(['male', 'female', 'other'], {
        errorMap: () => ({ message: 'Please select a gender' }),
    }),
});

// Registration Step 3: Address
export const registerStep3Schema = z.object({
    address: z.object({
        street: z
            .string()
            .min(3, 'Street address must be at least 3 characters')
            .regex(ADDRESS_REGEX, 'Street address contains invalid characters'),
        city: nameField('City'),
        state: nameField('State'),
        zipCode: z
            .string()
            .regex(ZIP_REGEX, 'Please enter a valid zip/postal code (letters, numbers, spaces and hyphens, 3-10 chars)'),
        country: nameField('Country'),
    }),
});

// Registration Step 4: Student Info
export const registerStep4Schema = z.object({
    students: z
        .array(
            z.object({
                firstName: nameField('First name'),
                lastName: nameField('Last name'),
                dateOfBirth: dobField(),
                gender: z.enum(['male', 'female', 'other'], {
                    errorMap: () => ({ message: 'Please select a gender' }),
                }),
                school: z
                    .string()
                    .max(100, 'School name is too long')
                    .regex(/^[A-Za-z0-9\s.'-]*$/, 'School name contains invalid characters')
                    .optional()
                    .or(z.literal('')),
                medicalConditions: z
                    .string()
                    .max(500, 'Medical conditions must be under 500 characters')
                    .optional()
                    .or(z.literal('')),
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
                firstName: nameField('First name'),
                lastName: nameField('Last name'),
                relationship: z.string().min(1, 'Please select a relationship'),
                phone: phoneField,
                email: z.string().email('Please enter a valid email address (e.g. user@example.com)'),
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
    firstName: nameField('First name'),
    lastName: nameField('Last name'),
    phone: phoneField.optional(),
    dateOfBirth: z.string().optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    address: z
        .object({
            street: z
                .string()
                .min(3, 'Street address must be at least 3 characters')
                .regex(ADDRESS_REGEX, 'Street address contains invalid characters'),
            city: nameField('City'),
            state: nameField('State'),
            zipCode: z
                .string()
                .regex(ZIP_REGEX, 'Please enter a valid zip/postal code'),
            country: nameField('Country'),
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
