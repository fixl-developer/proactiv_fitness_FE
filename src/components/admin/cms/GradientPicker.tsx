'use client'

import { useMemo, useState } from 'react'
import { ChevronDown, Settings2, Check } from 'lucide-react'

// Curated gradient presets. Stored value is the plain `from-X to-Y` Tailwind
// class pair so existing renderers that prepend `bg-gradient-to-{dir}` keep
// working. The full `bg-gradient-to-br ...` strings here are inlined so
// Tailwind JIT actually emits the CSS for the swatch previews.
type Preset = {
    name: string
    /** Stored value — what gets written back via onChange (no direction prefix). */
    colors: string
    /** Inline full class used to render the swatch — keeps Tailwind JIT happy. */
    swatchClass: string
}

const PRESETS: Preset[] = [
    { name: 'Ocean',     colors: 'from-blue-600 to-cyan-500',     swatchClass: 'bg-gradient-to-br from-blue-600 to-cyan-500' },
    { name: 'Royal',     colors: 'from-purple-600 to-indigo-700', swatchClass: 'bg-gradient-to-br from-purple-600 to-indigo-700' },
    { name: 'Sunset',    colors: 'from-orange-500 to-pink-600',   swatchClass: 'bg-gradient-to-br from-orange-500 to-pink-600' },
    { name: 'Forest',    colors: 'from-green-600 to-emerald-700', swatchClass: 'bg-gradient-to-br from-green-600 to-emerald-700' },
    { name: 'Coral',     colors: 'from-pink-500 to-rose-600',     swatchClass: 'bg-gradient-to-br from-pink-500 to-rose-600' },
    { name: 'Midnight',  colors: 'from-slate-700 to-gray-900',    swatchClass: 'bg-gradient-to-br from-slate-700 to-gray-900' },
    { name: 'Mint',      colors: 'from-teal-400 to-green-500',    swatchClass: 'bg-gradient-to-br from-teal-400 to-green-500' },
    { name: 'Sky',       colors: 'from-sky-400 to-blue-500',      swatchClass: 'bg-gradient-to-br from-sky-400 to-blue-500' },
    { name: 'Amber',     colors: 'from-amber-500 to-orange-600',  swatchClass: 'bg-gradient-to-br from-amber-500 to-orange-600' },
    { name: 'Crimson',   colors: 'from-red-600 to-rose-700',      swatchClass: 'bg-gradient-to-br from-red-600 to-rose-700' },
    { name: 'Lavender',  colors: 'from-violet-500 to-purple-600', swatchClass: 'bg-gradient-to-br from-violet-500 to-purple-600' },
    { name: 'Steel',     colors: 'from-zinc-500 to-slate-700',    swatchClass: 'bg-gradient-to-br from-zinc-500 to-slate-700' },
]

const PREFIX_RE = /^(bg-gradient-to-[a-z]+)\s+/

export interface GradientPickerProps {
    value: string
    onChange: (v: string) => void
    /**
     * 'auto'        — detect from current value: if it starts with `bg-gradient-to-…`, keep that prefix on writes; otherwise write just `from-X to-Y`.
     * 'colors-only' — always store just `from-X to-Y` (no direction prefix).
     * 'full'        — always store full `bg-gradient-to-br from-X to-Y`.
     */
    format?: 'auto' | 'colors-only' | 'full'
    placeholder?: string
    invalid?: boolean
}

export default function GradientPicker({ value, onChange, format = 'auto', placeholder, invalid }: GradientPickerProps) {
    // Strip any direction prefix off the incoming value so we can match presets
    // by their pure `from-X to-Y` form.
    const { prefix, colorsOnly } = useMemo(() => {
        const v = (value || '').trim()
        const m = v.match(PREFIX_RE)
        if (m) return { prefix: m[1] + ' ', colorsOnly: v.slice(m[0].length).trim() }
        return { prefix: '', colorsOnly: v }
    }, [value])

    // Find the matching preset, if any.
    const matchedPreset = useMemo(
        () => PRESETS.find((p) => p.colors === colorsOnly) || null,
        [colorsOnly]
    )

    // Custom mode is open when:
    //   - admin explicitly toggled it open, OR
    //   - the current value doesn't match any preset and isn't empty
    //     (so existing custom data is visible immediately on edit).
    const initialCustomOpen = !matchedPreset && colorsOnly.length > 0
    const [customOpen, setCustomOpen] = useState(initialCustomOpen)

    // Decide which prefix (if any) to write back when admin picks a preset.
    const resolvePrefix = () => {
        if (format === 'full') return 'bg-gradient-to-br '
        if (format === 'colors-only') return ''
        // auto: keep whatever prefix the existing value had; if none, use none.
        return prefix
    }

    const pickPreset = (p: Preset) => {
        onChange(resolvePrefix() + p.colors)
        setCustomOpen(false)
    }

    const clearSelection = () => {
        onChange('')
        setCustomOpen(false)
    }

    // Live preview class — for empty value, show a subtle placeholder strip.
    const previewSwatch = (matchedPreset?.swatchClass)
        || (colorsOnly ? `bg-gradient-to-br ${colorsOnly}` : '')

    const baseInputCls = `w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 ${
        invalid ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
    }`

    return (
        <div className="space-y-3">
            {/* Live preview */}
            <div className="rounded-lg border border-gray-200 overflow-hidden">
                {previewSwatch ? (
                    <div className={`h-12 w-full ${previewSwatch}`} aria-label="Gradient preview" />
                ) : (
                    <div className="h-12 w-full bg-gray-50 flex items-center justify-center text-xs text-gray-400">
                        No gradient selected
                    </div>
                )}
                <div className="px-3 py-2 bg-white text-xs flex items-center justify-between gap-2">
                    <span className="text-gray-600 truncate">
                        {matchedPreset ? (
                            <span className="font-medium text-gray-900">{matchedPreset.name}</span>
                        ) : colorsOnly ? (
                            <span className="font-mono text-[11px] text-gray-700 truncate">{colorsOnly}</span>
                        ) : (
                            <span className="text-gray-400 italic">Pick a preset or open custom mode</span>
                        )}
                    </span>
                    {value && (
                        <button
                            type="button"
                            onClick={clearSelection}
                            className="text-xs text-gray-500 hover:text-red-600"
                            title="Clear selection"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Preset swatch grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {PRESETS.map((p) => {
                    const isActive = matchedPreset?.name === p.name
                    return (
                        <button
                            key={p.name}
                            type="button"
                            onClick={() => pickPreset(p)}
                            className={`relative h-12 rounded-lg overflow-hidden ring-2 transition ${
                                isActive ? 'ring-blue-600 ring-offset-1' : 'ring-transparent hover:ring-gray-300'
                            }`}
                            title={p.name}
                        >
                            <div className={`absolute inset-0 ${p.swatchClass}`} />
                            <span className="absolute inset-x-0 bottom-0 px-1 py-0.5 text-[10px] font-medium text-white bg-black/30 truncate">
                                {p.name}
                            </span>
                            {isActive && (
                                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white text-blue-600 flex items-center justify-center shadow">
                                    <Check className="w-3 h-3" />
                                </span>
                            )}
                        </button>
                    )
                })}
            </div>

            {/* Custom mode toggle + input */}
            <div className="border-t pt-3">
                <button
                    type="button"
                    onClick={() => setCustomOpen((v) => !v)}
                    className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900"
                >
                    <Settings2 className="w-3.5 h-3.5" />
                    <span>Advanced — custom Tailwind classes</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${customOpen ? 'rotate-180' : ''}`} />
                </button>
                {customOpen && (
                    <div className="mt-2 space-y-1">
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder={placeholder || 'e.g. from-blue-600 to-purple-600'}
                            className={baseInputCls}
                        />
                        <p className="text-[11px] text-gray-500">
                            Plain Tailwind gradient classes — preset selection updates this field automatically. Use this only if you need a value outside the curated palette.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
