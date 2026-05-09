import { z } from 'zod';
import { findByDialCode } from '@/utils/countryCodes';

// Reusable field rules ────────────────────────────────────────────────
// First/last name: alphabets only — no spaces, hyphens, apostrophes or digits
const PERSON_NAME_REGEX = /^[A-Za-z]+$/;
// Place name (city/state/country): letters, internal spaces, hyphens, apostrophes
const PLACE_NAME_REGEX = /^[A-Za-z][A-Za-z\s'-]*[A-Za-z]$|^[A-Za-z]$/;
const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const PHONE_REGEX = /^\+\d{1,4}\s?\d{3,15}$/;
const ZIP_REGEX = /^[A-Za-z0-9\s-]{3,10}$/;
const ADDRESS_REGEX = /^[A-Za-z0-9\s.,'#\/-]+$/;
const LETTERS_AND_SPACES_REGEX = /^[A-Za-z][A-Za-z\s]*[A-Za-z]$|^[A-Za-z]$/;

// Reject placeholder garbage like "fff", "f f f f" — values that pass shape
// regex but aren't real words. Mirrors looksMeaningful in utils/validation.ts.
const looksMeaningful = (value: string): boolean => {
    const trimmed = value.trim();
    const lettersOnly = trimmed.replace(/[^A-Za-z]/g, '').toLowerCase();
    if (lettersOnly.length < 2) return false;
    if (new Set(lettersOnly).size < 2) return false;
    const words = trimmed.split(/\s+/).filter(Boolean);
    if (words.every((w) => w.length <= 1)) return false;
    return true;
};
const looksMeaningfulAddress = (value: string): boolean => {
    const trimmed = value.trim();
    const alnum = trimmed.replace(/[^A-Za-z0-9]/g, '');
    if (alnum.length < 3) return false;
    const letters = trimmed.replace(/[^A-Za-z]/g, '').toLowerCase();
    if (letters.length < 3) return false;
    if (new Set(letters).size < 2) return false;
    const alphaWords = trimmed.split(/\s+/).filter((w) => /^[A-Za-z]+$/.test(w));
    if (!alphaWords.some((w) => w.length >= 3)) return false;
    return true;
};

const firstNameField = (label: string) =>
    z
        .string()
        .min(2, `${label} must be at least 2 characters`)
        .max(50, `${label} must be 50 characters or fewer`)
        .regex(
            PERSON_NAME_REGEX,
            `${label} can only contain alphabets (no spaces, digits or symbols)`
        )
        .refine(looksMeaningful, `${label} does not look like a real name`);

const lastNameField = (label: string) =>
    z
        .string()
        .min(2, `${label} must be at least 2 characters`)
        .max(50, `${label} must be 50 characters or fewer`)
        .regex(
            PERSON_NAME_REGEX,
            `${label} can only contain alphabets (no spaces, digits or symbols)`
        )
        .refine(looksMeaningful, `${label} does not look like a real name`);

const placeNameField = (label: string) =>
    z
        .string()
        .transform((v) => v.trim().replace(/\s+/g, ' '))
        .pipe(
            z
                .string()
                .min(2, `${label} must be at least 2 characters`)
                .max(60, `${label} must be 60 characters or fewer`)
                .regex(
                    PLACE_NAME_REGEX,
                    `${label} can only contain letters, single spaces, hyphens and apostrophes`
                )
                .refine(looksMeaningful, `Please enter a valid ${label.toLowerCase()}`)
        );

const emailField = z
    .string()
    .min(1, 'Email is required')
    .regex(EMAIL_REGEX, 'Please enter a valid email address (e.g. user@example.com)');

// Country-aware phone validation: requires +<dialCode> + national digits
// matching one of that country's allowed lengths.
const phoneField = z
    .string()
    .regex(PHONE_REGEX, 'Please include country code (e.g. +91 9876543210)')
    .refine((value) => {
        const country = findByDialCode(value);
        if (!country) return false;
        const national = value.slice(country.dialCode.length).replace(/\D/g, '');
        return country.lengths.includes(national.length);
    }, 'Phone number length does not match the selected country');

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
    email: emailField,
    password: z.string().min(8, 'Password must be at least 8 characters'),
    rememberMe: z.boolean().optional(),
});

// Registration Step 1: Basic Info
export const registerStep1Schema = z
    .object({
        email: emailField,
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
    firstName: firstNameField('First name'),
    lastName: lastNameField('Last name'),
    phone: phoneField,
    dateOfBirth: dobField(18),
    gender: z.enum(['male', 'female', 'other'], {
        errorMap: () => ({ message: 'Please select a gender' }),
    }),
});

// City/state/country come from a curated ISO dataset (country-state-city) so the
// only schema-level checks are non-empty + sane length. The dropdown component
// enforces "must pick from the list".
const datasetPlaceField = (label: string) =>
    z
        .string()
        .transform((v) => v.trim().replace(/\s+/g, ' '))
        .pipe(
            z
                .string()
                .min(1, `${label} is required`)
                .max(100, `${label} is too long`)
        );

// Registration Step 3: Address
export const registerStep3Schema = z.object({
    address: z.object({
        street: z
            .string()
            .transform((v) => v.trim().replace(/\s+/g, ' '))
            .pipe(
                z
                    .string()
                    .min(3, 'Street address must be at least 3 characters')
                    .regex(ADDRESS_REGEX, 'Street address contains invalid characters')
                    .refine(looksMeaningfulAddress, 'Please enter a valid street address')
            ),
        city: datasetPlaceField('City'),
        state: datasetPlaceField('State'),
        zipCode: z
            .string()
            .transform((v) => v.trim())
            .pipe(
                z
                    .string()
                    .regex(ZIP_REGEX, 'Zip code may only contain letters, digits, spaces and hyphens (3-10 chars)')
                    .refine((v) => /\d/.test(v), 'Zip code must contain at least one digit')
            ),
        country: datasetPlaceField('Country'),
    }),
});

// Student DOB: must be 3-18 years old (kids/teens fitness program)
const studentDobField = z.string().refine((value) => {
    if (!value) return false;
    const date = new Date(value);
    if (isNaN(date.getTime())) return false;
    const today = new Date();
    if (date > today) return false;
    let age = today.getFullYear() - date.getFullYear();
    const m = today.getMonth() - date.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < date.getDate())) age--;
    return age >= 3 && age <= 18;
}, 'Student must be between 3 and 18 years old');

// School name: alphabets and single spaces only, must be meaningful
const schoolNameField = z
    .string()
    .transform((v) => v.trim().replace(/\s+/g, ' '))
    .pipe(
        z
            .string()
            .max(100, 'School name is too long')
            .refine((v) => v === '' || LETTERS_AND_SPACES_REGEX.test(v), 'School name can only contain alphabets and single spaces (no digits or symbols)')
            .refine((v) => v === '' || looksMeaningful(v), 'Please enter a valid school name')
    );

// Medical conditions: alphabets and single spaces only
const medicalConditionsField = z
    .string()
    .transform((v) => v.trim().replace(/\s+/g, ' '))
    .pipe(
        z
            .string()
            .max(500, 'Medical conditions must be under 500 characters')
            .refine((v) => v === '' || LETTERS_AND_SPACES_REGEX.test(v), 'Medical condition can only contain alphabets and single spaces (no digits or symbols)')
            .refine((v) => v === '' || looksMeaningful(v), 'Please enter a valid medical condition')
    );

// Registration Step 4: Student Info
export const registerStep4Schema = z.object({
    students: z
        .array(
            z.object({
                firstName: firstNameField('First name'),
                lastName: lastNameField('Last name'),
                dateOfBirth: studentDobField,
                gender: z.enum(['male', 'female', 'other'], {
                    errorMap: () => ({ message: 'Please select a gender' }),
                }),
                school: schoolNameField.optional().or(z.literal('')),
                medicalConditions: medicalConditionsField.optional().or(z.literal('')),
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
                firstName: firstNameField('First name'),
                lastName: lastNameField('Last name'),
                relationship: z.string().min(1, 'Please select a relationship'),
                phone: phoneField,
                email: emailField,
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
    email: emailField,
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
    firstName: firstNameField('First name'),
    lastName: lastNameField('Last name'),
    phone: phoneField.optional(),
    dateOfBirth: z.string().optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    address: z
        .object({
            street: z
                .string()
                .min(3, 'Street address must be at least 3 characters')
                .regex(ADDRESS_REGEX, 'Street address contains invalid characters'),
            city: placeNameField('City'),
            state: placeNameField('State'),
            zipCode: z
                .string()
                .regex(ZIP_REGEX, 'Please enter a valid zip/postal code'),
            country: placeNameField('Country'),
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
