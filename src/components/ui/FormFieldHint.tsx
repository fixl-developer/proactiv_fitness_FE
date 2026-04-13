'use client'

import { AlertCircle, Info } from 'lucide-react'

interface FormFieldHintProps {
  hint?: string
  error?: string
}

/**
 * Shows a format hint below an input field.
 * If there's an error, it shows the error in red instead of the hint.
 */
export function FormFieldHint({ hint, error }: FormFieldHintProps) {
  if (error) {
    return (
      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
        <AlertCircle className="w-3 h-3 flex-shrink-0" />
        <span>{error}</span>
      </p>
    )
  }

  if (hint) {
    return (
      <p className="mt-1 text-xs text-gray-400 flex items-center gap-1">
        <Info className="w-3 h-3 flex-shrink-0" />
        <span>{hint}</span>
      </p>
    )
  }

  return null
}
