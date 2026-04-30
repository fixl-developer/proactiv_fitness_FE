/**
 * Shared validation utilities for the entire ProActiv Fitness application.
 * All forms should use these validators for consistency.
 */

// ─── Regex Patterns ───────────────────────────────────────────
export const PATTERNS = {
  nameOnly: /^[A-Za-z\s'-]+$/,
  emailFormat: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
  phoneDigits: /^[0-9+\-() ]{7,20}$/,
  phoneOnlyDigits: /^[0-9]{7,15}$/,
  zipCode: /^[A-Za-z0-9\s-]{3,10}$/,
  url: /^https?:\/\/.+/,
  numbersOnly: /^[0-9]+$/,
  alphanumeric: /^[A-Za-z0-9\s]+$/,
  noSpecialChars: /^[A-Za-z0-9\s.,'-]+$/,
  currencyAmount: /^[0-9]+(\.[0-9]{1,2})?$/,
  cardNumber: /^[0-9]{13,19}$/,
  cvv: /^[0-9]{3,4}$/,
  cardExpiry: /^(0[1-9]|1[0-2])\/([0-9]{2})$/,
}

// ─── Password Strength ───────────────────────────────────────
export const PASSWORD_RULES = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: true,
}

export function validatePassword(value: string): string | null {
  if (!value) return 'Password is required'
  if (value.length < PASSWORD_RULES.minLength) return `Minimum ${PASSWORD_RULES.minLength} characters required`
  if (PASSWORD_RULES.requireUppercase && !/[A-Z]/.test(value)) return 'Must contain at least one uppercase letter (A-Z)'
  if (PASSWORD_RULES.requireLowercase && !/[a-z]/.test(value)) return 'Must contain at least one lowercase letter (a-z)'
  if (PASSWORD_RULES.requireNumber && !/[0-9]/.test(value)) return 'Must contain at least one number (0-9)'
  if (PASSWORD_RULES.requireSpecial && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) return 'Must contain at least one special character (!@#$%^&*)'
  return null
}

// ─── Field Validators ────────────────────────────────────────
export function validateName(value: string, fieldLabel = 'Name'): string | null {
  if (!value || !value.trim()) return `${fieldLabel} is required`
  if (value.trim().length < 2) return `${fieldLabel} must be at least 2 characters`
  if (!PATTERNS.nameOnly.test(value.trim())) return `${fieldLabel} can only contain letters, spaces, hyphens and apostrophes`
  return null
}

export function validateFirstName(value: string, fieldLabel = 'First name'): string | null {
  if (!value || !value.trim()) return `${fieldLabel} is required`
  if (value.trim().length < 2) return `${fieldLabel} must be at least 2 characters`
  // First name: letters, hyphens, apostrophes only - NO SPACES
  if (!/^[A-Za-z'-]+$/.test(value.trim())) return `${fieldLabel} can only contain letters, hyphens and apostrophes (no spaces)`
  return null
}

export function validateLastName(value: string, fieldLabel = 'Last name'): string | null {
  if (!value || !value.trim()) return `${fieldLabel} is required`
  if (value.trim().length < 2) return `${fieldLabel} must be at least 2 characters`
  // Last name: letters, hyphens, apostrophes only - NO SPACES
  if (!/^[A-Za-z'-]+$/.test(value.trim())) return `${fieldLabel} can only contain letters, hyphens and apostrophes (no spaces)`
  return null
}

// Place names (city, state, country): single spaces between words, no leading/trailing space, no digits
export function validatePlaceName(value: string, fieldLabel = 'This field'): string | null {
  if (!value || !value.trim()) return `${fieldLabel} is required`
  const trimmed = value.trim()
  if (trimmed.length < 2) return `${fieldLabel} must be at least 2 characters`
  if (/\d/.test(trimmed)) return `${fieldLabel} cannot contain digits`
  if (/\s{2,}/.test(trimmed)) return `${fieldLabel} cannot contain consecutive spaces`
  if (!/^[A-Za-z][A-Za-z\s'-]*[A-Za-z]$|^[A-Za-z]$/.test(trimmed))
    return `${fieldLabel} can only contain letters, single spaces, hyphens and apostrophes`
  return null
}

export function validateEmail(value: string, required = true): string | null {
  if (!value || !value.trim()) return required ? 'Email is required' : null
  if (!PATTERNS.emailFormat.test(value.trim())) return 'Please enter a valid email address (e.g. user@example.com)'
  return null
}

export function validatePhone(value: string, required = true): string | null {
  if (!value || !value.trim()) return required ? 'Phone number is required' : null
  const digits = value.replace(/\D/g, '')
  if (digits.length < 7 || digits.length > 15) return 'Phone number must be 7-15 digits'
  if (!PATTERNS.phoneDigits.test(value.trim())) return 'Please enter a valid phone number (digits, +, -, spaces only)'
  return null
}

export function validatePhoneWithCountry(value: string, requiredDigits: number, required = true): string | null {
  if (!value || !value.trim()) return required ? 'Phone number is required' : null

  // Extract country code (e.g., "+91" from "+91 9876543210")
  const countryCodeMatch = value.match(/^(\+\d{1,3})\s?(.*)/)
  if (!countryCodeMatch) {
    return 'Please include country code (e.g., +91)'
  }

  const phoneNumberPart = countryCodeMatch[2] || ''

  // Extract digits ONLY from the phone number part (excluding country code)
  const digits = phoneNumberPart.replace(/\D/g, '')

  // Check if digit count matches required
  if (digits.length !== requiredDigits) {
    return `Phone number must have exactly ${requiredDigits} digits (currently ${digits.length})`
  }

  // Check format
  if (!PATTERNS.phoneDigits.test(value.trim())) {
    return 'Please enter a valid phone number (digits, +, -, spaces only)'
  }

  return null
}

export function validateDateOfBirth(value: string, required = true): string | null {
  if (!value) return required ? 'Date of birth is required' : null
  const date = new Date(value)
  if (isNaN(date.getTime())) return 'Please enter a valid date'
  const today = new Date()
  if (date > today) return 'Date of birth cannot be in the future'
  const age = today.getFullYear() - date.getFullYear()
  if (age > 120) return 'Please enter a valid date of birth'
  return null
}

export function validateAge(value: string | number, min = 1, max = 100): string | null {
  const num = typeof value === 'string' ? parseInt(value, 10) : value
  if (isNaN(num)) return 'Please enter a valid age'
  if (num < min || num > max) return `Age must be between ${min} and ${max}`
  return null
}

export function validateRequired(value: string, fieldLabel = 'This field'): string | null {
  if (!value || !value.toString().trim()) return `${fieldLabel} is required`
  return null
}

export function validateSelect(value: string, fieldLabel = 'This field'): string | null {
  if (!value || value === '' || value === 'select') return `Please select a ${fieldLabel.toLowerCase()}`
  return null
}

export function validateAddress(value: string, fieldLabel = 'Address'): string | null {
  if (!value || !value.trim()) return `${fieldLabel} is required`
  if (value.trim().length < 3) return `${fieldLabel} must be at least 3 characters`
  return null
}

export function validateZipCode(value: string, required = true): string | null {
  if (!value || !value.trim()) return required ? 'Zip/postal code is required' : null
  if (!PATTERNS.zipCode.test(value.trim())) return 'Please enter a valid zip/postal code'
  return null
}

export function validateUrl(value: string, required = false): string | null {
  if (!value || !value.trim()) return required ? 'URL is required' : null
  if (!PATTERNS.url.test(value.trim())) return 'Please enter a valid URL (starting with http:// or https://)'
  return null
}

export function validateCurrency(value: string, fieldLabel = 'Amount'): string | null {
  if (!value || !value.trim()) return `${fieldLabel} is required`
  if (!PATTERNS.currencyAmount.test(value.trim())) return 'Please enter a valid amount (e.g. 99.99)'
  if (parseFloat(value) < 0) return `${fieldLabel} cannot be negative`
  return null
}

export function validateNumber(value: string, fieldLabel = 'Value', min?: number, max?: number): string | null {
  if (!value || !value.trim()) return `${fieldLabel} is required`
  const num = parseFloat(value)
  if (isNaN(num)) return `${fieldLabel} must be a number`
  if (min !== undefined && num < min) return `${fieldLabel} must be at least ${min}`
  if (max !== undefined && num > max) return `${fieldLabel} must be at most ${max}`
  return null
}

export function validateCardNumber(value: string): string | null {
  if (!value) return 'Card number is required'
  const cleaned = value.replace(/\s/g, '')
  if (!PATTERNS.cardNumber.test(cleaned)) return 'Please enter a valid card number (13-19 digits)'
  return null
}

export function validateCVV(value: string): string | null {
  if (!value) return 'CVV is required'
  if (!PATTERNS.cvv.test(value)) return 'CVV must be 3 or 4 digits'
  return null
}

export function validateCardExpiry(value: string): string | null {
  if (!value) return 'Expiry date is required'
  if (!PATTERNS.cardExpiry.test(value)) return 'Please enter a valid expiry (MM/YY)'
  const [month, year] = value.split('/')
  const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1)
  if (expiry < new Date()) return 'Card has expired'
  return null
}

export function validateConfirmPassword(password: string, confirm: string): string | null {
  if (!confirm) return 'Please confirm your password'
  if (password !== confirm) return 'Passwords do not match'
  return null
}

export function validateTextArea(value: string, fieldLabel = 'This field', minLength = 0, maxLength = 5000): string | null {
  if (minLength > 0 && (!value || !value.trim())) return `${fieldLabel} is required`
  if (value && value.length > maxLength) return `${fieldLabel} must be less than ${maxLength} characters`
  if (value && value.trim().length < minLength) return `${fieldLabel} must be at least ${minLength} characters`
  return null
}

// ─── Input Filters (for onKeyDown / onChange prevention) ─────
export function filterNameInput(e: React.KeyboardEvent<HTMLInputElement>) {
  const allowed = /^[A-Za-z\s'-]$/
  if (e.key.length === 1 && !allowed.test(e.key)) {
    e.preventDefault()
  }
}

export function filterFirstNameInput(e: React.KeyboardEvent<HTMLInputElement>) {
  // First name: only letters, hyphens, apostrophes - NO SPACES
  const allowed = /^[A-Za-z'-]$/
  if (e.key.length === 1 && !allowed.test(e.key)) {
    e.preventDefault()
  }
}

export function filterLastNameInput(e: React.KeyboardEvent<HTMLInputElement>) {
  // Last name: only letters, hyphens, apostrophes - NO SPACES
  const allowed = /^[A-Za-z'-]$/
  if (e.key.length === 1 && !allowed.test(e.key)) {
    e.preventDefault()
  }
}

export function filterPhoneInput(e: React.KeyboardEvent<HTMLInputElement>) {
  const allowed = /^[0-9+\-() ]$/
  if (e.key.length === 1 && !allowed.test(e.key)) {
    e.preventDefault()
  }
}

export function filterNumberInput(e: React.KeyboardEvent<HTMLInputElement>) {
  const allowed = /^[0-9.]$/
  if (e.key.length === 1 && !allowed.test(e.key)) {
    e.preventDefault()
  }
}

export function filterAlphanumericInput(e: React.KeyboardEvent<HTMLInputElement>) {
  const allowed = /^[A-Za-z0-9\s]$/
  if (e.key.length === 1 && !allowed.test(e.key)) {
    e.preventDefault()
  }
}

export function filterCardNumberInput(e: React.KeyboardEvent<HTMLInputElement>) {
  const allowed = /^[0-9\s]$/
  if (e.key.length === 1 && !allowed.test(e.key)) {
    e.preventDefault()
  }
}

export function filterZipCodeInput(e: React.KeyboardEvent<HTMLInputElement>) {
  const allowed = /^[A-Za-z0-9\s-]$/
  if (e.key.length === 1 && !allowed.test(e.key)) {
    e.preventDefault()
  }
}

export function filterStreetInput(e: React.KeyboardEvent<HTMLInputElement>) {
  const allowed = /^[A-Za-z0-9\s.,'#\/-]$/
  if (e.key.length === 1 && !allowed.test(e.key)) {
    e.preventDefault()
  }
}

export function filterSchoolInput(e: React.KeyboardEvent<HTMLInputElement>) {
  const allowed = /^[A-Za-z0-9\s.'-]$/
  if (e.key.length === 1 && !allowed.test(e.key)) {
    e.preventDefault()
  }
}

// ─── Format Hints (shown below input fields) ────────────────
export const FORMAT_HINTS: Record<string, string> = {
  name: 'Only letters, spaces, hyphens and apostrophes allowed',
  firstName: 'Only letters, hyphens and apostrophes allowed (no spaces)',
  lastName: 'Only letters, hyphens and apostrophes allowed (no spaces)',
  email: 'Format: user@example.com',
  phone: 'Only digits, +, -, spaces allowed (7-15 digits)',
  password: 'Min 8 chars: 1 uppercase, 1 lowercase, 1 number, 1 special character',
  confirmPassword: 'Must match the password above',
  dateOfBirth: 'Select your date of birth',
  age: 'Enter age in years (numbers only)',
  address: 'Enter your full street address',
  city: 'Only letters and spaces allowed',
  state: 'Only letters and spaces allowed',
  zipCode: 'Letters, numbers, spaces and hyphens (e.g. 10001)',
  country: 'Select your country',
  url: 'Must start with http:// or https://',
  amount: 'Enter amount (e.g. 99.99)',
  cardNumber: '13-19 digit card number',
  cvv: '3 or 4 digit security code',
  cardExpiry: 'Format: MM/YY',
  description: 'Enter a brief description',
  subject: 'Only letters, numbers and spaces allowed',
  message: 'Enter your message',
  school: 'Only letters, numbers and spaces allowed',
  capacity: 'Numbers only',
  gender: 'Select gender',
  relationship: 'Select relationship type',
}

// ─── Convenience: validate a whole form object ───────────────
export type FieldRule = {
  type: 'name' | 'firstName' | 'lastName' | 'email' | 'phone' | 'password' | 'confirmPassword' | 'date' | 'required' | 'select' | 'address' | 'zip' | 'url' | 'currency' | 'number' | 'textarea' | 'age'
  label?: string
  required?: boolean
  min?: number
  max?: number
  matchField?: string // for confirmPassword
}

export function validateForm(
  data: Record<string, any>,
  rules: Record<string, FieldRule>
): Record<string, string> {
  const errors: Record<string, string> = {}

  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field]?.toString() || ''
    let error: string | null = null

    switch (rule.type) {
      case 'name':
        error = validateName(value, rule.label || field)
        break
      case 'firstName':
        error = validateFirstName(value, rule.label || field)
        break
      case 'lastName':
        error = validateLastName(value, rule.label || field)
        break
      case 'email':
        error = validateEmail(value)
        break
      case 'phone':
        error = validatePhone(value, rule.required !== false)
        break
      case 'password':
        error = validatePassword(value)
        break
      case 'confirmPassword':
        error = validateConfirmPassword(data[rule.matchField || 'password'] || '', value)
        break
      case 'date':
        error = validateDateOfBirth(value, rule.required !== false)
        break
      case 'required':
        error = validateRequired(value, rule.label || field)
        break
      case 'select':
        error = validateSelect(value, rule.label || field)
        break
      case 'address':
        error = validateAddress(value, rule.label || field)
        break
      case 'zip':
        error = validateZipCode(value, rule.required !== false)
        break
      case 'url':
        error = validateUrl(value, rule.required)
        break
      case 'currency':
        error = validateCurrency(value, rule.label || field)
        break
      case 'number':
        error = validateNumber(value, rule.label || field, rule.min, rule.max)
        break
      case 'textarea':
        error = validateTextArea(value, rule.label || field, rule.min || 0, rule.max || 5000)
        break
      case 'age':
        error = validateAge(value, rule.min || 1, rule.max || 100)
        break
    }

    if (error) errors[field] = error
  }

  return errors
}
