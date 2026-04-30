'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, Phone, Search, AlertCircle, Info } from 'lucide-react'
import {
  COUNTRY_CODES,
  CountryCode,
  DEFAULT_COUNTRY_ISO2,
  findByDialCode,
  findByIso2,
  validatePhoneForCountry,
} from '@/utils/countryCodes'

export interface PhoneInputProps {
  value: string
  onChange: (fullNumber: string) => void
  onValidityChange?: (isValid: boolean, error: string | null) => void
  defaultCountry?: string
  error?: string
  placeholder?: string
  disabled?: boolean
  className?: string
}

/**
 * Splits a stored phone string like "+91 9876543210" into its dial code and
 * the national digits. Falls back to the default country if no match.
 */
function splitStoredValue(stored: string, fallback: CountryCode) {
  if (!stored) return { country: fallback, national: '' }
  const trimmed = stored.trim()
  if (trimmed.startsWith('+')) {
    const match = findByDialCode(trimmed)
    if (match) {
      const national = trimmed.slice(match.dialCode.length).replace(/\D/g, '')
      return { country: match, national }
    }
  }
  return { country: fallback, national: trimmed.replace(/\D/g, '') }
}

export function PhoneInput({
  value,
  onChange,
  onValidityChange,
  defaultCountry = DEFAULT_COUNTRY_ISO2,
  error,
  placeholder,
  disabled,
  className = '',
}: PhoneInputProps) {
  const fallback = findByIso2(defaultCountry) || COUNTRY_CODES[0]
  const initial = splitStoredValue(value, fallback)

  const [country, setCountry] = useState<CountryCode>(initial.country)
  const [national, setNational] = useState<string>(initial.national)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [touched, setTouched] = useState(false)

  const wrapperRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  // Focus search field when dropdown opens
  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 50)
    }
  }, [open])

  // Sync upstream value -> local state when value changes externally (e.g. form reset)
  useEffect(() => {
    const next = splitStoredValue(value, fallback)
    setCountry(next.country)
    setNational(next.national)
    // intentionally only depends on value
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  // Validation hook
  const liveError = useMemo(() => {
    if (!national) return null
    return validatePhoneForCountry(national, country)
  }, [national, country])

  useEffect(() => {
    onValidityChange?.(liveError === null && national.length > 0, liveError)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveError, national])

  const filteredCountries = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return COUNTRY_CODES
    const cleanedDial = q.startsWith('+') ? q : q
    return COUNTRY_CODES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.iso2.toLowerCase().includes(q) ||
        c.dialCode.includes(cleanedDial),
    )
  }, [search])

  function emit(nextCountry: CountryCode, nextNational: string) {
    // Emit E.164 format with NO separator — backend phone validator
    // is strict (/^\+?[1-9]\d{1,14}$/) and rejects spaces/dashes.
    const full = nextNational ? `${nextCountry.dialCode}${nextNational}` : ''
    onChange(full)
  }

  function handleNationalChange(raw: string) {
    // If user pastes/types a leading "+" with a dial code, auto-detect country
    if (raw.startsWith('+')) {
      const detected = findByDialCode(raw)
      if (detected) {
        const rest = raw.slice(detected.dialCode.length).replace(/\D/g, '')
        const maxLen = Math.max(...detected.lengths)
        const trimmed = rest.slice(0, maxLen)
        setCountry(detected)
        setNational(trimmed)
        emit(detected, trimmed)
        return
      }
    }
    const digits = raw.replace(/\D/g, '')
    const maxLen = Math.max(...country.lengths)
    const trimmed = digits.slice(0, maxLen)
    setNational(trimmed)
    emit(country, trimmed)
  }

  function handleSelectCountry(c: CountryCode) {
    setCountry(c)
    const maxLen = Math.max(...c.lengths)
    const trimmed = national.slice(0, maxLen)
    setNational(trimmed)
    emit(c, trimmed)
    setOpen(false)
    setSearch('')
  }

  const expected =
    country.lengths.length === 1
      ? `${country.lengths[0]} digits`
      : `${country.lengths.join(' or ')} digits`

  const showError = error || (touched && liveError) || null
  const helperHint = `${country.flag} ${country.name} (${country.dialCode}) — expects ${expected}`

  return (
    <div className={className}>
      <div
        ref={wrapperRef}
        className={`relative flex items-stretch w-full border rounded-lg overflow-visible ${
          showError ? 'border-red-500' : 'border-gray-300'
        } focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent`}
      >
        {/* Country selector trigger */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1 px-3 py-3 border-r border-gray-200 bg-gray-50 hover:bg-gray-100 rounded-l-lg disabled:opacity-50 disabled:cursor-not-allowed"
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className="text-lg leading-none">{country.flag}</span>
          <span className="text-sm font-medium text-gray-700">{country.dialCode}</span>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </button>

        {/* Phone digits input */}
        <div className="relative flex-1">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            type="tel"
            inputMode="numeric"
            value={national}
            disabled={disabled}
            onChange={(e) => handleNationalChange(e.target.value)}
            onBlur={() => setTouched(true)}
            onKeyDown={(e) => {
              if (
                e.key.length === 1 &&
                !/[0-9+]/.test(e.key) &&
                !e.metaKey &&
                !e.ctrlKey
              ) {
                e.preventDefault()
              }
            }}
            placeholder={placeholder || 'Phone number'}
            className="w-full pl-10 pr-4 py-3 rounded-r-lg focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Country dropdown */}
        {open && (
          <div className="absolute top-full left-0 mt-1 w-80 max-w-[90vw] bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search country or code..."
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            <ul role="listbox" className="max-h-64 overflow-y-auto py-1">
              {filteredCountries.length === 0 && (
                <li className="px-3 py-2 text-sm text-gray-500">No countries found</li>
              )}
              {filteredCountries.map((c) => (
                <li
                  key={c.iso2}
                  role="option"
                  aria-selected={c.iso2 === country.iso2}
                  onClick={() => handleSelectCountry(c)}
                  className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50 ${
                    c.iso2 === country.iso2 ? 'bg-primary/5' : ''
                  }`}
                >
                  <span className="text-lg leading-none">{c.flag}</span>
                  <span className="flex-1 text-sm text-gray-800 truncate">{c.name}</span>
                  <span className="text-sm font-medium text-gray-500">{c.dialCode}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Helper / error line */}
      {showError ? (
        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          <span>{showError}</span>
        </p>
      ) : (
        <p className="mt-1 text-xs text-gray-400 flex items-center gap-1">
          <Info className="w-3 h-3 flex-shrink-0" />
          <span>{helperHint}</span>
        </p>
      )}
    </div>
  )
}
