/**
 * Shared validation utilities for the entire ProActiv Fitness application.
 * All forms should use these validators for consistency.
 */

// ─── Regex Patterns ───────────────────────────────────────────
export const PATTERNS = {
  nameOnly: /^[A-Za-z\s'-]+$/,
  emailFormat: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
  // Strict email: TLD 2-6 letters, no trailing chars after it
  emailStrict: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*\.[A-Za-z]{2,6}$/,
  phoneDigits: /^[0-9+\-() ]{7,20}$/,
  phoneOnlyDigits: /^[0-9]{7,15}$/,
  // Strict 10-digit phone (no spaces, no separators, no alphabets)
  phoneStrict10: /^[0-9]{10}$/,
  // Hong Kong strict: optional +852 then exactly 8 digits, no separators
  phoneHKStrict: /^(\+852)?[0-9]{8}$/,
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

// Reject placeholder garbage like "fff", "f f f f", "a b c d" — values that pass
// regex shape checks but are obviously not a real name/place.
// Why: form regex only enforces character class, so single-letter words separated
// by spaces and single-letter repeats slip through. Used by city/state/country/name.
export function looksMeaningful(value: string): boolean {
  const trimmed = value.trim()
  const lettersOnly = trimmed.replace(/[^A-Za-z]/g, '').toLowerCase()
  if (lettersOnly.length < 2) return false
  if (new Set(lettersOnly).size < 2) return false  // "fff", "aaaa", "fff fff"
  const words = trimmed.split(/\s+/).filter(Boolean)
  if (words.every((w) => w.length <= 1)) return false  // "f f f f", "a b c"
  return true
}

// Address variant — also allows digits to count toward meaningfulness.
// Requires at least one alphabetic "word" of 3+ letters (e.g. "Main", "Elm",
// "Street") so gibberish like "47 uj 89 jk" fails even though it has 4 words.
export function looksMeaningfulAddress(value: string): boolean {
  const trimmed = value.trim()
  const alnum = trimmed.replace(/[^A-Za-z0-9]/g, '')
  if (alnum.length < 3) return false
  const letters = trimmed.replace(/[^A-Za-z]/g, '').toLowerCase()
  if (letters.length < 3) return false
  if (new Set(letters).size < 2) return false
  const alphaWords = trimmed.split(/\s+/).filter((w) => /^[A-Za-z]+$/.test(w))
  if (!alphaWords.some((w) => w.length >= 3)) return false
  return true
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
  const trimmed = value.trim()
  if (trimmed.length < 2) return `${fieldLabel} must be at least 2 characters`
  // Reject leading/trailing/multiple consecutive spaces
  if (/\s{2,}/.test(trimmed)) return `${fieldLabel} cannot contain consecutive spaces`
  if (value !== value.trim()) return `${fieldLabel} cannot start or end with spaces`
  // Reject digits and special characters
  if (/\d/.test(trimmed)) return `${fieldLabel} cannot contain digits`
  if (!PATTERNS.nameOnly.test(trimmed)) return `${fieldLabel} can only contain letters, spaces, hyphens and apostrophes`
  // Reject "Joh n"-style: any word in the name with length 1 is suspicious unless
  // the whole name is a single character (already blocked by length 2 above).
  const words = trimmed.split(/\s+/).filter(Boolean)
  if (words.length > 1 && words.some(w => w.replace(/['-]/g, '').length < 2)) {
    return `${fieldLabel} contains invalid spacing (each word must be 2+ letters)`
  }
  if (!looksMeaningful(trimmed)) return `Please enter a valid ${fieldLabel.toLowerCase()}`
  return null
}

export function validateFirstName(value: string, fieldLabel = 'First name'): string | null {
  if (!value || !value.trim()) return `${fieldLabel} is required`
  if (value.trim().length < 2) return `${fieldLabel} must be at least 2 characters`
  // First name: letters only — no spaces, no hyphens, no apostrophes, no digits
  if (!/^[A-Za-z]+$/.test(value.trim())) return `${fieldLabel} can only contain alphabets (no spaces, digits or symbols)`
  if (!looksMeaningful(value)) return `${fieldLabel} does not look like a real name`
  return null
}

export function validateLastName(value: string, fieldLabel = 'Last name'): string | null {
  if (!value || !value.trim()) return `${fieldLabel} is required`
  if (value.trim().length < 2) return `${fieldLabel} must be at least 2 characters`
  // Last name: letters only — no spaces, no hyphens, no apostrophes, no digits
  if (!/^[A-Za-z]+$/.test(value.trim())) return `${fieldLabel} can only contain alphabets (no spaces, digits or symbols)`
  if (!looksMeaningful(value)) return `${fieldLabel} does not look like a real name`
  return null
}

// Place names (city, state, country): single spaces between words, no leading/trailing space, no digits
export function validatePlaceName(value: string, fieldLabel = 'This field'): string | null {
  if (!value || !value.trim()) return `${fieldLabel} is required`
  const trimmed = value.trim().replace(/\s+/g, ' ')
  if (trimmed.length < 2) return `${fieldLabel} must be at least 2 characters`
  if (/\d/.test(trimmed)) return `${fieldLabel} cannot contain digits`
  if (!/^[A-Za-z][A-Za-z\s'-]*[A-Za-z]$|^[A-Za-z]$/.test(trimmed))
    return `${fieldLabel} can only contain letters, single spaces, hyphens and apostrophes`
  if (!looksMeaningful(trimmed)) return `Please enter a valid ${fieldLabel.toLowerCase()}`
  return null
}

export function validateEmail(value: string, required = true): string | null {
  if (!value || !value.trim()) return required ? 'Email is required' : null
  const trimmed = value.trim()
  // Reject spaces inside email
  if (/\s/.test(value)) return 'Email cannot contain spaces'
  // Strict format check
  if (!PATTERNS.emailStrict.test(trimmed)) return 'Please enter a valid email address (e.g. user@example.com)'
  // Reject leading/trailing dots near @
  if (/\.@|@\./.test(trimmed)) return 'Please enter a valid email address'
  // Reject consecutive special characters at end (e.g. ..com, .com.)
  if (/[._-]{2,}/.test(trimmed.split('@')[0] || '')) return 'Please enter a valid email address'
  return null
}

export function validatePhone(value: string, required = true): string | null {
  if (!value || !value.trim()) return required ? 'Phone number is required' : null
  // Reject spaces inside the phone (we accept country-code prefix as one piece)
  if (/\s/.test(value.trim())) return 'Phone number cannot contain spaces'
  // Reject alphabets
  if (/[A-Za-z]/.test(value)) return 'Phone number cannot contain letters'
  const digits = value.replace(/\D/g, '')
  if (digits.length < 7 || digits.length > 15) return 'Phone number must be 7-15 digits'
  if (!/^\+?[0-9]+$/.test(value.trim())) return 'Phone number can only contain digits and an optional leading +'
  return null
}

// Strict 10-digit phone: no spaces, no separators, no alphabets
export function validatePhone10(value: string, required = true, fieldLabel = 'Phone number'): string | null {
  if (!value || !value.trim()) return required ? `${fieldLabel} is required` : null
  const v = value.trim()
  if (/\s/.test(v)) return `${fieldLabel} cannot contain spaces`
  if (/[A-Za-z]/.test(v)) return `${fieldLabel} cannot contain letters`
  // Allow optional +country prefix in front of the 10 digits
  const stripped = v.replace(/^\+\d{1,3}/, '')
  if (!/^[0-9]+$/.test(stripped)) return `${fieldLabel} can only contain digits`
  if (stripped.length < 10) return `${fieldLabel} must be exactly 10 digits (currently ${stripped.length})`
  if (stripped.length > 10) return `${fieldLabel} cannot exceed 10 digits (currently ${stripped.length})`
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

export function validateDateOfBirth(
  value: string,
  required = true,
  minAge?: number,
  maxAge?: number
): string | null {
  if (!value) return required ? 'Date of birth is required' : null
  const date = new Date(value)
  if (isNaN(date.getTime())) return 'Please enter a valid date'
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  if (date > today) return 'Date of birth cannot be in the future'
  // Calendar-aware age: subtract one if birthday hasn't occurred yet this year.
  let age = today.getFullYear() - date.getFullYear()
  const m = today.getMonth() - date.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < date.getDate())) age--
  if (age > 120) return 'Please enter a valid date of birth'
  if (minAge !== undefined && age < minAge) return `You must be at least ${minAge} years old`
  if (maxAge !== undefined && age > maxAge) return `You must be ${maxAge} years old or younger`
  return null
}

export function validateAge(value: string | number, min = 1, max = 100): string | null {
  if (value === '' || value === null || value === undefined) return 'Age is required'
  const num = typeof value === 'string' ? parseInt(value, 10) : value
  if (isNaN(num)) return 'Please enter a valid age'
  if (num < min) return `Age must be at least ${min}`
  if (num > max) return `Age must be at most ${max}`
  return null
}

// Cross-check Age vs DOB consistency. Allow ±1 year tolerance for birthday this year.
export function validateAgeDOBConsistency(age: string | number, dob: string): string | null {
  if (!dob || age === '' || age === null || age === undefined) return null
  const dobDate = new Date(dob)
  if (isNaN(dobDate.getTime())) return null
  const today = new Date()
  let computedAge = today.getFullYear() - dobDate.getFullYear()
  const m = today.getMonth() - dobDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) computedAge--
  const enteredAge = typeof age === 'string' ? parseInt(age, 10) : age
  if (isNaN(enteredAge)) return null
  if (Math.abs(computedAge - enteredAge) > 1) {
    return `Age (${enteredAge}) does not match Date of Birth (calculated age: ${computedAge})`
  }
  return null
}

// Free-text notes/comments: must contain letters (reject "12323" style numeric-only input)
export function validateNotes(value: string, fieldLabel = 'Notes', required = false, maxLength = 1000): string | null {
  if (!value || !value.trim()) return required ? `${fieldLabel} is required` : null
  const trimmed = value.trim()
  if (trimmed.length > maxLength) return `${fieldLabel} cannot exceed ${maxLength} characters`
  if (!/[A-Za-z]/.test(trimmed)) return `${fieldLabel} must contain letters, not only numbers or symbols`
  return null
}

export function validateRequired(value: string, fieldLabel = 'This field'): string | null {
  if (!value || !value.toString().trim()) return `${fieldLabel} is required`
  return null
}

// Subject / title validator — must contain letters, doesn't allow strings made
// entirely of special characters (@#$%, !@#, etc), and rejects gibberish like
// repeated single chars. Used by ticket / inquiry / announcement forms.
export function validateSubject(value: string, fieldLabel = 'Subject'): string | null {
  if (!value || !value.trim()) return `${fieldLabel} is required`
  const trimmed = value.trim()
  if (trimmed.length < 5) return `${fieldLabel} must be at least 5 characters`
  if (trimmed.length > 200) return `${fieldLabel} cannot exceed 200 characters`
  if (!/[A-Za-z]/.test(trimmed)) return `${fieldLabel} must contain letters, not only symbols or numbers`
  // Reject input that is mostly special characters (>40% non-alphanumeric, non-space).
  const specials = (trimmed.match(/[^A-Za-z0-9\s]/g) || []).length
  if (specials / trimmed.length > 0.4) return `${fieldLabel} contains too many special characters`
  if (!looksMeaningful(trimmed.replace(/[^A-Za-z\s]/g, ' '))) {
    return `Please enter a meaningful ${fieldLabel.toLowerCase()}`
  }
  return null
}

export function validateSelect(value: string, fieldLabel = 'This field'): string | null {
  if (!value || value === '' || value === 'select') return `Please select a ${fieldLabel.toLowerCase()}`
  return null
}

export function validateAddress(value: string, fieldLabel = 'Address'): string | null {
  if (!value || !value.trim()) return `${fieldLabel} is required`
  const trimmed = value.trim().replace(/\s+/g, ' ')
  if (trimmed.length < 3) return `${fieldLabel} must be at least 3 characters`
  if (!/^[A-Za-z0-9\s.,'#\/-]+$/.test(trimmed)) return `${fieldLabel} contains invalid characters`
  if (!looksMeaningfulAddress(trimmed)) return `Please enter a valid ${fieldLabel.toLowerCase()}`
  return null
}

export function validateZipCode(value: string, required = true): string | null {
  if (!value || !value.trim()) return required ? 'Zip/postal code is required' : null
  const trimmed = value.trim()
  if (!PATTERNS.zipCode.test(trimmed)) return 'Zip code may only contain letters, digits, spaces and hyphens (3-10 chars)'
  if (!/\d/.test(trimmed)) return 'Zip code must contain at least one digit'
  return null
}

// School name: letters and single spaces only, must look meaningful
export function validateSchoolName(value: string, required = false): string | null {
  if (!value || !value.trim()) return required ? 'School name is required' : null
  const trimmed = value.trim().replace(/\s+/g, ' ')
  if (trimmed.length < 2) return 'School name must be at least 2 characters'
  if (trimmed.length > 100) return 'School name is too long'
  if (!/^[A-Za-z][A-Za-z\s]*[A-Za-z]$|^[A-Za-z]$/.test(trimmed))
    return 'School name can only contain alphabets and single spaces (no digits or symbols)'
  if (!looksMeaningful(trimmed)) return 'Please enter a valid school name'
  return null
}

// Medical conditions: letters and single spaces only (no digits/special chars)
export function validateMedicalConditions(value: string, required = false): string | null {
  if (!value || !value.trim()) return required ? 'Medical conditions are required' : null
  const trimmed = value.trim().replace(/\s+/g, ' ')
  if (trimmed.length < 2) return 'Medical condition must be at least 2 characters'
  if (trimmed.length > 500) return 'Medical conditions must be under 500 characters'
  if (!/^[A-Za-z][A-Za-z\s]*[A-Za-z]$|^[A-Za-z]$/.test(trimmed))
    return 'Medical condition can only contain alphabets and single spaces (no digits or symbols)'
  if (!looksMeaningful(trimmed)) return 'Please enter a valid medical condition'
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

// Location/business code (e.g., "LOC-001"): uppercase letters/digits/hyphen
// only — rejects symbol-only input like "@@@". Used by Regional Admin
// Locations + Budget category + Approval location forms when only allowing
// short alphanumeric identifiers.
export function validateLocationCode(value: string, fieldLabel = 'Code'): string | null {
  if (!value || !value.trim()) return `${fieldLabel} is required`
  const trimmed = value.trim().toUpperCase()
  if (trimmed.length < 2) return `${fieldLabel} must be at least 2 characters`
  if (trimmed.length > 20) return `${fieldLabel} cannot exceed 20 characters`
  if (!/^[A-Z0-9-]+$/.test(trimmed)) return `${fieldLabel} can only contain letters, digits, and hyphens`
  if (!/[A-Z0-9]/.test(trimmed)) return `${fieldLabel} must contain at least one letter or digit`
  return null
}

// Alphabetic / location-style text — must contain letters, no digit-or-symbol
// only input. Used for free-text "Location" or "Category" fields where
// "Boston@123" / "@@12" / "12@2jkn" should fail validation.
export function validateAlphaText(value: string, fieldLabel = 'Field', maxLen = 100): string | null {
  if (!value || !value.trim()) return `${fieldLabel} is required`
  const trimmed = value.trim()
  if (trimmed.length < 2) return `${fieldLabel} must be at least 2 characters`
  if (trimmed.length > maxLen) return `${fieldLabel} cannot exceed ${maxLen} characters`
  if (!/[A-Za-z]/.test(trimmed)) return `${fieldLabel} must contain letters`
  if (/\d/.test(trimmed)) return `${fieldLabel} cannot contain numbers`
  if (!/^[A-Za-z\s.,'\-]+$/.test(trimmed)) return `${fieldLabel} can only contain letters, spaces, and basic punctuation`
  return null
}

// Lenient plain-text validator used by partner pages. Allows letters/digits
// + basic punctuation (so an integration name like "OAuth 2.0" passes), but
// still rejects symbol-only / digit-only input and out-of-range lengths.
// Signature matches existing call sites: (value, label, minLen?, maxLen?).
export function validatePlainText(value: string, fieldLabel = 'Field', minLen = 1, maxLen = 200): string | null {
  if (!value || !value.trim()) return `${fieldLabel} is required`
  const trimmed = value.trim()
  if (trimmed.length < minLen) return `${fieldLabel} must be at least ${minLen} characters`
  if (trimmed.length > maxLen) return `${fieldLabel} cannot exceed ${maxLen} characters`
  if (!/[A-Za-z]/.test(trimmed)) return `${fieldLabel} must contain letters`
  if (!/^[A-Za-z0-9\s.,'&()_\-/]+$/.test(trimmed)) return `${fieldLabel} contains invalid characters`
  return null
}

// Title-style validator that allows letters + spaces + minimal punctuation
// but rejects all-special-chars or starts-with-digit gibberish. Used for
// Compliance title / Benchmark metric name / etc.
export function validateTitle(value: string, fieldLabel = 'Title', maxLen = 200): string | null {
  if (!value || !value.trim()) return `${fieldLabel} is required`
  const trimmed = value.trim()
  if (trimmed.length < 3) return `${fieldLabel} must be at least 3 characters`
  if (trimmed.length > maxLen) return `${fieldLabel} cannot exceed ${maxLen} characters`
  if (!/[A-Za-z]/.test(trimmed)) return `${fieldLabel} must contain letters`
  if (!/^[A-Za-z][A-Za-z0-9\s.,'&()\-/]*$/.test(trimmed)) return `${fieldLabel} must start with a letter and contain only safe characters`
  const specials = (trimmed.match(/[^A-Za-z0-9\s]/g) || []).length
  if (specials / trimmed.length > 0.3) return `${fieldLabel} contains too many special characters`
  return null
}

// Reject past dates. Used for "Due Date" / "Deadline" fields that must be
// today or in the future.
export function validateFutureOrToday(value: string, fieldLabel = 'Date'): string | null {
  if (!value || !value.trim()) return `${fieldLabel} is required`
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const picked = new Date(value)
  if (isNaN(picked.getTime())) return `Invalid ${fieldLabel.toLowerCase()}`
  if (picked < today) return `${fieldLabel} cannot be in the past`
  return null
}

// Get today's date in YYYY-MM-DD (local) for HTML date input `min` attr.
export function todayISODate(): string {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 10)
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

// Free-text title/subject/name field that must contain real letters (not just symbols).
// Allows letters, digits, spaces, and a small set of safe punctuation; rejects strings
// like "@@@###" that pass length checks but are obviously not valid input.
export function validatePlainText(
  value: string,
  fieldLabel = 'This field',
  minLength = 2,
  maxLength = 200
): string | null {
  if (!value || !value.trim()) return `${fieldLabel} is required`
  const trimmed = value.trim()
  if (trimmed.length < minLength) return `${fieldLabel} must be at least ${minLength} characters`
  if (trimmed.length > maxLength) return `${fieldLabel} must be less than ${maxLength} characters`
  // Reject if no letters at all
  if (!/[A-Za-z]/.test(trimmed)) return `${fieldLabel} must contain letters`
  // Allowed: letters, digits, spaces, .,'-_:&%/() — reject other special characters like @ # $ * etc.
  if (!/^[A-Za-z0-9\s.,'\-_:&%/()]+$/.test(trimmed))
    return `${fieldLabel} contains invalid special characters`
  // Heuristic: require at least 2 letters in a row somewhere (so "a@b@c" still fails)
  if (!/[A-Za-z]{2,}/.test(trimmed)) return `Please enter a valid ${fieldLabel.toLowerCase()}`
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
  // First name: alphabets only — no spaces, hyphens, apostrophes, or digits
  const allowed = /^[A-Za-z]$/
  if (e.key.length === 1 && !allowed.test(e.key)) {
    e.preventDefault()
  }
}

export function filterLastNameInput(e: React.KeyboardEvent<HTMLInputElement>) {
  // Last name: alphabets only — no spaces, hyphens, apostrophes, or digits
  const allowed = /^[A-Za-z]$/
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
  // Alphanumeric, spaces and hyphens (international postal codes)
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
  // Alphabets and single space — no digits, no special chars
  const allowed = /^[A-Za-z\s]$/
  if (e.key.length === 1 && !allowed.test(e.key)) {
    e.preventDefault()
  }
}

export function filterMedicalInput(e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
  // Alphabets and single space — no digits, no special chars
  const allowed = /^[A-Za-z\s]$/
  if (e.key.length === 1 && !allowed.test(e.key)) {
    e.preventDefault()
  }
}

// ─── Format Hints (shown below input fields) ────────────────
export const FORMAT_HINTS: Record<string, string> = {
  name: 'Only letters, spaces, hyphens and apostrophes allowed',
  firstName: 'Alphabets only (no spaces, digits or symbols)',
  lastName: 'Alphabets only (no spaces, digits or symbols)',
  email: 'Format: user@example.com',
  phone: 'Only digits, +, -, spaces allowed (7-15 digits)',
  password: 'Min 8 chars: 1 uppercase, 1 lowercase, 1 number, 1 special character',
  confirmPassword: 'Must match the password above',
  dateOfBirth: 'Select your date of birth',
  age: 'Enter age in years (numbers only)',
  address: 'Enter your full street address',
  city: 'Letters only with single spaces between words',
  state: 'Letters only with single spaces between words',
  zipCode: 'Alphanumeric, must contain at least one digit (e.g. 10001 or K1A 0B1)',
  country: 'Letters only with single spaces between words',
  url: 'Must start with http:// or https://',
  amount: 'Enter amount (e.g. 99.99)',
  cardNumber: '13-19 digit card number',
  cvv: '3 or 4 digit security code',
  cardExpiry: 'Format: MM/YY',
  description: 'Enter a brief description',
  subject: 'Only letters, numbers and spaces allowed',
  message: 'Enter your message',
  school: 'Alphabets and single spaces only (no digits or symbols)',
  medicalConditions: 'Alphabets and single spaces only (no digits or symbols)',
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
