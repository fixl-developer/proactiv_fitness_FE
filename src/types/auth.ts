// Auth related types
export interface LoginRequest {
    email: string;
    password: string;
    rememberMe?: boolean;
}

export interface LoginResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
}

export interface RegisterRequest {
    // Step 1: Basic Info
    email: string;
    password: string;
    confirmPassword: string;

    // Step 2: Personal Info
    firstName: string;
    lastName: string;
    phone: string;
    dateOfBirth: string;
    gender: 'male' | 'female' | 'other';

    // Step 3: Address
    address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };

    // Step 4: Student Info (for Parent role)
    students?: Array<{
        firstName: string;
        lastName: string;
        dateOfBirth: string;
        gender: 'male' | 'female' | 'other';
        school?: string;
        medicalConditions?: string;
    }>;

    // Step 5: Guardian Info (for Parent role)
    guardians?: Array<{
        firstName: string;
        lastName: string;
        relationship: string;
        phone: string;
        email: string;
        isEmergencyContact: boolean;
    }>;

    // Step 6: Terms & Preferences
    acceptTerms: boolean;
    acceptPrivacy: boolean;
    marketingConsent?: boolean;
    role?: string;
}

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other';
    avatar?: string;
    role: UserRole;
    permissions: string[];
    isEmailVerified: boolean;
    isMFAEnabled: boolean;
    address?: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    createdAt: string;
    updatedAt: string;
}

export type UserRole =
    | 'super_admin'
    | 'regional_manager'
    | 'franchise_owner'
    | 'location_manager'
    | 'coach'
    | 'parent'
    | 'receptionist';

export interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}
