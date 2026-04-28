/**
 * CMS Field Validation Utility
 * Provides comprehensive field-specific validation rules for all CMS pages
 */

// =============================================
// Validation Patterns
// =============================================
export const VALIDATION_PATTERNS = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    URL: /^(https?:\/\/[^\s/$.?#].[^\s]*|\/[^\s]*)$/i,
    SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    PHONE: /^[+]?[\d\s()-]{7,20}$/,
    NAME: /^[A-Za-z\s'-]+$/,
    ALPHABETS_ONLY: /^[A-Za-z\s'-]+$/,
    ALPHANUMERIC: /^[A-Za-z0-9\s'-]+$/,
    NUMBERS_ONLY: /^[0-9]+$/,
    URL_SAFE: /^[a-z0-9-]+$/,
}

// =============================================
// Field Type Validation Rules
// =============================================
export interface ValidationRule {
    pattern?: RegExp
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
    message?: string
    customValidator?: (value: any) => string | null
}

/**
 * Get validation rules based on field name and type
 * This provides intelligent, field-name-based validation
 */
export function getValidationRulesByFieldName(fieldName: string, fieldType: string): ValidationRule {
    const lowerName = fieldName.toLowerCase()

    // ===== NAME/LABEL FIELDS =====
    if (lowerName.includes('label')) {
        // Label fields: max 20-25 characters, any name allowed (no pattern restriction)
        return {
            minLength: 1,
            maxLength: 25,
            message: `${fieldName} must be less than 25 characters`,
        }
    }

    if (lowerName.includes('name') || lowerName.includes('title')) {
        if (fieldType === 'text' || fieldType === 'textarea') {
            return {
                pattern: VALIDATION_PATTERNS.ALPHABETS_ONLY,
                minLength: 1,
                maxLength: lowerName.includes('title') ? 200 : 120,
                message: `${fieldName} can only contain letters, spaces, hyphens and apostrophes`,
            }
        }
    }

    // ===== EMAIL FIELDS =====
    if (lowerName.includes('email')) {
        return {
            pattern: VALIDATION_PATTERNS.EMAIL,
            maxLength: 100,
            message: `${fieldName} must be a valid email address`,
        }
    }

    // ===== URL/HREF/LINK FIELDS =====
    if (lowerName.includes('url') || lowerName.includes('href') || lowerName.includes('link')) {
        return {
            pattern: VALIDATION_PATTERNS.URL,
            maxLength: 500,
            message: `${fieldName} must be a valid URL (http://, https://, or /)`,
        }
    }

    // ===== PHONE/TEL FIELDS =====
    if (lowerName.includes('phone') || lowerName.includes('tel') || lowerName.includes('mobile')) {
        return {
            pattern: VALIDATION_PATTERNS.PHONE,
            minLength: 7,
            maxLength: 20,
            message: `${fieldName} must be a valid phone number`,
        }
    }

    // ===== SLUG FIELDS =====
    if (lowerName.includes('slug')) {
        return {
            pattern: VALIDATION_PATTERNS.SLUG,
            minLength: 1,
            maxLength: 100,
            message: `${fieldName} must be lowercase letters, numbers, and hyphens only`,
        }
    }

    // ===== DESCRIPTION/CONTENT FIELDS =====
    if (lowerName.includes('description') || lowerName.includes('content') || lowerName.includes('bio')) {
        return {
            minLength: 0,
            maxLength: 2000,
            message: `${fieldName} must be less than 2000 characters`,
        }
    }

    // ===== SHORT TEXT FIELDS =====
    if (lowerName.includes('short') || lowerName.includes('summary')) {
        return {
            minLength: 0,
            maxLength: 500,
            message: `${fieldName} must be less than 500 characters`,
        }
    }

    // ===== ORDER/POSITION FIELDS =====
    if (lowerName.includes('order') || lowerName.includes('position') || lowerName.includes('sort')) {
        return {
            min: 0,
            max: 9999,
            message: `${fieldName} must be between 0 and 9999`,
        }
    }

    // ===== PRICE/AMOUNT FIELDS =====
    if (lowerName.includes('price') || lowerName.includes('amount') || lowerName.includes('cost')) {
        return {
            min: 0,
            max: 999999,
            message: `${fieldName} must be a valid amount`,
        }
    }

    // ===== PERCENTAGE FIELDS =====
    if (lowerName.includes('percent') || lowerName.includes('discount')) {
        return {
            min: 0,
            max: 100,
            message: `${fieldName} must be between 0 and 100`,
        }
    }

    // ===== COUNT/QUANTITY FIELDS =====
    if (lowerName.includes('count') || lowerName.includes('quantity') || lowerName.includes('number')) {
        return {
            min: 0,
            max: 999999,
            message: `${fieldName} must be a valid number`,
        }
    }

    // Default: minimal validation
    return {
        maxLength: 1000,
    }
}

/**
 * Validate a field value based on its name and type
 * Returns error message or null if valid
 */
export function validateFieldByName(
    fieldName: string,
    fieldType: string,
    value: any,
    isRequired: boolean = false
): string | null {
    // Check if empty
    const isEmpty =
        value === undefined ||
        value === null ||
        (typeof value === 'string' && value.trim() === '') ||
        (Array.isArray(value) && value.length === 0)

    if (isRequired && isEmpty) {
        return `${fieldName} is required`
    }

    if (isEmpty) return null

    // Get field-specific rules
    const rules = getValidationRulesByFieldName(fieldName, fieldType)

    // Handle array types
    if (fieldType === 'array' || fieldType === 'image-array') {
        const cleaned = (value as string[]).filter(v => typeof v === 'string' && v.trim() !== '')
        if (isRequired && cleaned.length === 0) {
            return `${fieldName} must have at least one item`
        }
        return null
    }

    // Handle number types
    if (fieldType === 'number') {
        const n = Number(value)
        if (Number.isNaN(n)) return `${fieldName} must be a valid number`
        if (rules.min !== undefined && n < rules.min) {
            return `${fieldName} must be at least ${rules.min}`
        }
        if (rules.max !== undefined && n > rules.max) {
            return `${fieldName} must be at most ${rules.max}`
        }
        return null
    }

    // Handle string types
    const str = String(value).trim()

    // Length validation
    if (rules.minLength !== undefined && str.length < rules.minLength) {
        return `${fieldName} must be at least ${rules.minLength} characters`
    }
    if (rules.maxLength !== undefined && str.length > rules.maxLength) {
        return `${fieldName} must be at most ${rules.maxLength} characters`
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(str)) {
        return rules.message || `${fieldName} format is invalid`
    }

    // Custom validator
    if (rules.customValidator) {
        return rules.customValidator(value)
    }

    return null
}

/**
 * Get character limit for a field based on its name
 */
export function getCharacterLimit(fieldName: string, fieldType: string): number | null {
    const rules = getValidationRulesByFieldName(fieldName, fieldType)
    return rules.maxLength || null
}

/**
 * Get input type hint for a field based on its name
 */
export function getInputTypeHint(fieldName: string): string {
    const lowerName = fieldName.toLowerCase()

    if (lowerName.includes('email')) return 'email'
    if (lowerName.includes('url') || lowerName.includes('href') || lowerName.includes('link')) return 'url'
    if (lowerName.includes('phone') || lowerName.includes('tel') || lowerName.includes('mobile')) return 'tel'
    if (lowerName.includes('price') || lowerName.includes('amount') || lowerName.includes('cost')) return 'number'
    if (lowerName.includes('order') || lowerName.includes('position') || lowerName.includes('count')) return 'number'

    return 'text'
}

/**
 * Sanitize input based on field type
 */
export function sanitizeFieldInput(fieldName: string, fieldType: string, value: any): any {
    if (value === null || value === undefined) return value

    const lowerName = fieldName.toLowerCase()

    // Trim whitespace for text fields
    if (typeof value === 'string') {
        value = value.trim()

        // Auto-lowercase for slug fields
        if (lowerName.includes('slug')) {
            value = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-')
        }

        // Remove non-alphabetic characters for name fields (but NOT label fields)
        if (lowerName.includes('name') && !lowerName.includes('parent')) {
            // Allow letters, spaces, hyphens, apostrophes
            value = value.replace(/[^A-Za-z\s'-]/g, '')
        }

        // Remove non-numeric characters for phone fields
        if (lowerName.includes('phone') || lowerName.includes('tel') || lowerName.includes('mobile')) {
            // Allow digits, +, -, (), spaces
            value = value.replace(/[^0-9+\-() ]/g, '')
        }
    }

    return value
}

/**
 * Get placeholder text for a field based on its name
 */
export function getPlaceholder(fieldName: string, fieldType: string): string {
    const lowerName = fieldName.toLowerCase()

    if (lowerName.includes('email')) return 'e.g., contact@example.com'
    if (lowerName.includes('url') || lowerName.includes('href')) return 'e.g., https://example.com or /path'
    if (lowerName.includes('phone') || lowerName.includes('tel')) return 'e.g., +1 (555) 123-4567'
    if (lowerName.includes('slug')) return 'e.g., my-blog-post'
    if (lowerName.includes('label')) return 'e.g., Home, About, Services'
    if (lowerName.includes('name')) return 'e.g., John Doe'
    if (lowerName.includes('title')) return 'e.g., Welcome to Our Site'
    if (lowerName.includes('description') || lowerName.includes('content')) return 'Enter detailed description...'
    if (lowerName.includes('order') || lowerName.includes('position')) return 'e.g., 1, 2, 3...'
    if (lowerName.includes('price') || lowerName.includes('amount')) return 'e.g., 99.99'

    return `Enter ${fieldName.toLowerCase()}`
}

/**
 * Get help text for a field based on its name
 */
export function getHelpText(fieldName: string, fieldType: string): string | null {
    const lowerName = fieldName.toLowerCase()
    const rules = getValidationRulesByFieldName(fieldName, fieldType)

    let helpText = ''

    if (rules.pattern) {
        if (lowerName.includes('email')) {
            helpText = 'Must be a valid email address'
        } else if (lowerName.includes('url') || lowerName.includes('href')) {
            helpText = 'Must start with http://, https://, or /'
        } else if (lowerName.includes('phone') || lowerName.includes('tel')) {
            helpText = 'Must be a valid phone number (7-20 characters)'
        } else if (lowerName.includes('slug')) {
            helpText = 'Lowercase letters, numbers, and hyphens only'
        } else if (lowerName.includes('name') || lowerName.includes('label')) {
            helpText = 'Letters, spaces, hyphens, and apostrophes only'
        }
    }

    if (rules.maxLength) {
        if (helpText) helpText += ` • `
        helpText += `Max ${rules.maxLength} characters`
    }

    if (rules.min !== undefined && rules.max !== undefined) {
        if (helpText) helpText += ` • `
        helpText += `Between ${rules.min} and ${rules.max}`
    }

    return helpText || null
}
