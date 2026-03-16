// App Constants
export const APP_NAME = 'Proactiv Fitness';
export const APP_VERSION = '1.0.0';

// API Constants
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
export const API_TIMEOUT = 30000;

// User Roles
export const USER_ROLES = {
    SUPER_ADMIN: 'super_admin',
    REGIONAL_MANAGER: 'regional_manager',
    FRANCHISE_OWNER: 'franchise_owner',
    LOCATION_MANAGER: 'location_manager',
    COACH: 'coach',
    PARENT: 'parent',
    RECEPTIONIST: 'receptionist',
} as const;

// Role Display Names
export const ROLE_NAMES = {
    [USER_ROLES.SUPER_ADMIN]: 'Super Admin',
    [USER_ROLES.REGIONAL_MANAGER]: 'Regional Manager',
    [USER_ROLES.FRANCHISE_OWNER]: 'Franchise Owner',
    [USER_ROLES.LOCATION_MANAGER]: 'Location Manager',
    [USER_ROLES.COACH]: 'Coach',
    [USER_ROLES.PARENT]: 'Parent',
    [USER_ROLES.RECEPTIONIST]: 'Receptionist',
} as const;

// Routes
export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    DASHBOARD: '/dashboard',
    PROFILE: '/profile',
    CLASSES: '/classes',
    BOOKINGS: '/bookings',
} as const;

// Date Formats
export const DATE_FORMAT = 'MMM dd, yyyy';
export const TIME_FORMAT = 'HH:mm';
export const DATETIME_FORMAT = 'MMM dd, yyyy HH:mm';

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// Colors (Tailwind classes)
export const COLORS = {
    PRIMARY: 'blue',
    SECONDARY: 'slate',
    SUCCESS: 'green',
    WARNING: 'yellow',
    DANGER: 'red',
    INFO: 'cyan',
} as const;
