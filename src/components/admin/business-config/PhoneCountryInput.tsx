'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, X } from 'lucide-react'
import { COUNTRY_PHONE_CODES, getCountriesByCode, searchCountries } from '@/utils/countryPhoneCodes'

interface PhoneCountryInputProps {
    value: string // Full phone number with country code (e.g., "+91 9876543210")
    onChange: (value: string) => void
    error?: string
    label?: string
    required?: boolean
    placeholder?: string
    onBlur?: () => void
}

export default function PhoneCountryInput({
    value,
    onChange,
    error,
    label = 'Phone',
    required = false,
    placeholder = '+1 555 123 4567',
    onBlur,
}: PhoneCountryInputProps) {
    const [countryCode, setCountryCode] = useState('+1')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [showDropdown, setShowDropdown] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCountry, setSelectedCountry] = useState('United States')
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Parse initial value
    useEffect(() => {
        if (value && value.trim()) {
            // Extract country code (e.g., "+91" from "+91 9876543210")
            const match = value.match(/^(\+\d{1,3})\s?(.*)/)
            if (match) {
                const code = match[1]
                const phone = match[2]
                setCountryCode(code)
                setPhoneNumber(phone)

                // Find country name
                const countries = getCountriesByCode(code)
                if (countries.length > 0) {
                    setSelectedCountry(countries[0].country)
                }
            }
        }
    }, [])

    // Get current country details
    const countries = getCountriesByCode(countryCode)
    const currentCountry = countries.find(c => c.country === selectedCountry) || countries[0]
    const requiredDigits = currentCountry?.digits || 10

    // Handle country selection
    const handleSelectCountry = (country: typeof COUNTRY_PHONE_CODES[0]) => {
        setCountryCode(country.code)
        setSelectedCountry(country.country)
        setShowDropdown(false)
        setSearchQuery('')

        // Update combined value
        const combined = `${country.code} ${phoneNumber}`.trim()
        onChange(combined)
    }

    // Handle phone number change
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value

        // Only allow digits and common phone formatting characters
        value = value.replace(/[^\d\s\-()]/g, '')

        // Limit to required digits + some formatting
        const digitsOnly = value.replace(/\D/g, '')
        if (digitsOnly.length > requiredDigits) {
            return
        }

        setPhoneNumber(value)

        // Update combined value
        const combined = `${countryCode} ${value}`.trim()
        onChange(combined)
    }

    // Handle keyboard input for country code
    const handleCodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key.length === 1 && !/^[0-9+]$/.test(e.key)) {
            e.preventDefault()
        }
    }

    // Get filtered countries for dropdown
    const filteredCountries = searchQuery
        ? searchCountries(searchQuery)
        : COUNTRY_PHONE_CODES

    // Remove duplicates from filtered list
    const uniqueCountries = Array.from(
        new Map(filteredCountries.map(c => [c.country + c.code, c])).values()
    )

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Count actual digits in phone number
    const digitCount = phoneNumber.replace(/\D/g, '').length
    const isValidDigitCount = digitCount === requiredDigits || digitCount === 0

    return (
        <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>

            <div className="flex gap-2">
                {/* Country Code Dropdown */}
                <div className="relative w-32" ref={dropdownRef}>
                    <button
                        type="button"
                        onClick={() => setShowDropdown(!showDropdown)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all text-sm flex items-center justify-between ${error ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                            }`}
                    >
                        <span className="font-medium">{countryCode}</span>
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                    </button>

                    {/* Dropdown Menu */}
                    {showDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                            {/* Search Input */}
                            <div className="sticky top-0 p-2 border-b border-slate-200 bg-white">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>

                            {/* Country List */}
                            <div className="py-1">
                                {uniqueCountries.length > 0 ? (
                                    uniqueCountries.map((country, idx) => (
                                        <button
                                            key={`${country.code}-${country.country}-${idx}`}
                                            type="button"
                                            onClick={() => handleSelectCountry(country)}
                                            className={`w-full px-3 py-2 text-left text-sm hover:bg-blue-50 transition-colors ${countryCode === country.code && selectedCountry === country.country
                                                    ? 'bg-blue-100 text-blue-900 font-medium'
                                                    : 'text-slate-700'
                                                }`}
                                        >
                                            <span className="font-medium">{country.code}</span>
                                            <span className="ml-2 text-slate-600">{country.country}</span>
                                            <span className="ml-auto text-xs text-slate-500">({country.digits}d)</span>
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-3 py-2 text-sm text-slate-500">No countries found</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Phone Number Input */}
                <div className="flex-1">
                    <input
                        type="tel"
                        value={phoneNumber}
                        onChange={handlePhoneChange}
                        onBlur={onBlur}
                        placeholder={placeholder}
                        maxLength={20}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all text-sm ${error ? 'border-red-500 focus:ring-red-500 bg-red-50/40' : 'border-slate-300 focus:ring-blue-500'
                            }`}
                    />
                </div>
            </div>

            {/* Help Text */}
            <div className="mt-2 flex items-start justify-between gap-2">
                <div className="text-xs text-slate-500">
                    <p>
                        <strong>{selectedCountry}</strong> requires <strong>{requiredDigits} digits</strong>
                    </p>
                    <p className="mt-1">Current: <strong>{digitCount} digits</strong></p>
                </div>
                {!isValidDigitCount && digitCount > 0 && (
                    <span className="text-xs text-red-600 font-medium">
                        {digitCount < requiredDigits ? `Need ${requiredDigits - digitCount} more` : `Remove ${digitCount - requiredDigits}`}
                    </span>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span>⚠</span>
                    {error}
                </p>
            )}

            {/* Validation Status */}
            {!error && digitCount > 0 && (
                <p className={`mt-1 text-xs font-medium ${isValidDigitCount ? 'text-green-600' : 'text-orange-600'}`}>
                    {isValidDigitCount ? '✓ Valid phone number' : '⚠ Digit count mismatch'}
                </p>
            )}
        </div>
    )
}
