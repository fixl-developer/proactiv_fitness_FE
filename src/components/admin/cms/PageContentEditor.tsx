'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Save, Loader2, Eye, Image as ImageIcon, AlertCircle,
    Layers, Plus, Trash2, ChevronDown, ChevronUp, ArrowUp, ArrowDown,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { CMSAdminService, PageContentData, PageContentSection } from '@/services/cmsService'
import ImageUploader from '@/components/admin/cms/ImageUploader'
import GradientPicker from '@/components/admin/cms/GradientPicker'
import { validateFieldByName, getPlaceholder, getHelpText, getCharacterLimit } from '@/utils/cmsValidation'

interface PageContentEditorProps {
    /** Slug of the page in the CMS (e.g. 'school-gymnastics', 'parties', 'team') */
    slug: string
    /** Display name shown in admin (e.g. 'School Gymnastics') */
    displayName: string
    /** Public URL of the page on the live site (for the Preview link) */
    publicHref: string
    /** Optional sub-collection helper — rendered below the page-level editor as guidance for admins */
    subCollectionHint?: { label: string; href: string; description: string }
}

const heightOptions = [
    { value: 'small', label: 'Small (h-64)' },
    { value: 'medium', label: 'Medium (h-80)' },
    { value: 'large', label: 'Large (h-96)' },
    { value: 'xlarge', label: 'X-Large (h-[500px])' },
]

const emptyPageContent = (slug: string, name: string): PageContentData => ({
    slug,
    name,
    hero: {
        title: '',
        subtitle: '',
        backgroundImage: '',
        fallbackGradient: 'from-blue-600 to-purple-600',
        ctaText: '',
        ctaLink: '',
        height: 'medium',
    },
    sections: [],
    seo: { metaTitle: '', metaDescription: '', keywords: [] },
    isActive: true,
})

const emptySection = (order: number): PageContentSection => ({
    key: '',
    title: '',
    subtitle: '',
    body: '',
    image: '',
    items: [],
    order,
    isActive: true,
})

function tryFormatJSON(input: string): string {
    try {
        const parsed = JSON.parse(input)
        return JSON.stringify(parsed, null, 2)
    } catch {
        return input
    }
}

export default function PageContentEditor({ slug, displayName, publicHref, subCollectionHint }: PageContentEditorProps) {
    const [data, setData] = useState<PageContentData>(emptyPageContent(slug, displayName))
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [keywordsInput, setKeywordsInput] = useState('')
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [expandedSection, setExpandedSection] = useState<number | null>(0)
    // Per-section local items textarea state (so partial JSON edits don't crash)
    const [itemsTextById, setItemsTextById] = useState<Record<number, string>>({})
    const [itemsErrorById, setItemsErrorById] = useState<Record<number, string>>({})

    useEffect(() => {
        let cancelled = false
        setLoading(true)
        CMSAdminService.pageContents.get(slug)
            .then((doc: any) => {
                if (cancelled) return
                if (doc) {
                    const merged: PageContentData = {
                        ...emptyPageContent(slug, displayName),
                        ...doc,
                        hero: { ...emptyPageContent(slug, displayName).hero, ...(doc.hero || {}) },
                        seo: { ...emptyPageContent(slug, displayName).seo, ...(doc.seo || {}) },
                        sections: Array.isArray(doc.sections) ? doc.sections : [],
                    }
                    setData(merged)
                    setKeywordsInput((merged.seo?.keywords || []).join(', '))
                    // Initialize per-section JSON textareas from items[]
                    const initialItemsText: Record<number, string> = {}
                    merged.sections.forEach((s, idx) => {
                        try {
                            initialItemsText[idx] = JSON.stringify(s.items ?? [], null, 2)
                        } catch {
                            initialItemsText[idx] = '[]'
                        }
                    })
                    setItemsTextById(initialItemsText)
                }
            })
            .catch(() => { /* keep empty - admin can fill from scratch */ })
            .finally(() => { if (!cancelled) setLoading(false) })
        return () => { cancelled = true }
    }, [slug, displayName])

    const updateHero = (patch: Partial<PageContentData['hero']>) => {
        setData(d => ({ ...d, hero: { ...d.hero, ...patch } }))
        // Clear errors for updated fields
        const keys = Object.keys(patch)
        setErrors(prev => {
            const next = { ...prev }
            keys.forEach(k => delete next[`hero.${k}`])
            return next
        })
    }

    const updateSeo = (patch: Partial<PageContentData['seo']>) => {
        setData(d => ({ ...d, seo: { ...d.seo, ...patch } }))
        // Clear errors for updated fields
        const keys = Object.keys(patch)
        setErrors(prev => {
            const next = { ...prev }
            keys.forEach(k => delete next[`seo.${k}`])
            return next
        })
    }

    const validateForm = (): boolean => {
        const nextErrors: Record<string, string> = {}

        // Validate hero title (required)
        if (!data.hero.title.trim()) {
            nextErrors['hero.title'] = 'Hero title is required'
        } else if (data.hero.title.length > 200) {
            nextErrors['hero.title'] = 'Hero title must be at most 200 characters'
        }

        // Validate hero subtitle (optional, but if provided, check length)
        if (data.hero.subtitle && data.hero.subtitle.length > 500) {
            nextErrors['hero.subtitle'] = 'Hero subtitle must be at most 500 characters'
        }

        // Validate CTA text (optional, but if provided, check length)
        if (data.hero.ctaText && data.hero.ctaText.length > 40) {
            nextErrors['hero.ctaText'] = 'CTA button text must be at most 40 characters'
        }

        // Validate CTA link (optional, but if provided, check format)
        if (data.hero.ctaLink) {
            const linkError = validateFieldByName('ctaLink', 'url', data.hero.ctaLink, false)
            if (linkError) {
                nextErrors['hero.ctaLink'] = linkError
            }
        }

        // Validate SEO meta title (optional, but if provided, check length)
        if (data.seo.metaTitle && data.seo.metaTitle.length > 60) {
            nextErrors['seo.metaTitle'] = 'Meta title must be at most 60 characters'
        }

        // Validate SEO meta description (optional, but if provided, check length)
        if (data.seo.metaDescription && data.seo.metaDescription.length > 160) {
            nextErrors['seo.metaDescription'] = 'Meta description must be at most 160 characters'
        }

        setErrors(nextErrors)
        return Object.keys(nextErrors).length === 0
    }

    // ---------- Sections helpers ----------
    const addSection = () => {
        setData(d => {
            const nextOrder = (d.sections.reduce((m, s) => Math.max(m, s.order || 0), 0) || 0) + 1
            const newSection = emptySection(nextOrder)
            const sections = [...d.sections, newSection]
            const newIdx = sections.length - 1
            // Initialize items JSON text for the new section
            setItemsTextById(prev => ({ ...prev, [newIdx]: '[]' }))
            setExpandedSection(newIdx)
            return { ...d, sections }
        })
    }

    const removeSection = (idx: number) => {
        if (!confirm('Remove this section? This cannot be undone until you save.')) return
        setData(d => ({ ...d, sections: d.sections.filter((_, i) => i !== idx) }))
        setItemsTextById(prev => {
            const next: Record<number, string> = {}
            Object.keys(prev).forEach(k => {
                const numKey = Number(k)
                if (numKey < idx) next[numKey] = prev[numKey]
                else if (numKey > idx) next[numKey - 1] = prev[numKey]
            })
            return next
        })
        setItemsErrorById(prev => {
            const next: Record<number, string> = {}
            Object.keys(prev).forEach(k => {
                const numKey = Number(k)
                if (numKey < idx) next[numKey] = prev[numKey]
                else if (numKey > idx) next[numKey - 1] = prev[numKey]
            })
            return next
        })
        if (expandedSection === idx) setExpandedSection(null)
        else if (expandedSection !== null && expandedSection > idx) setExpandedSection(expandedSection - 1)
    }

    const moveSection = (idx: number, direction: 'up' | 'down') => {
        setData(d => {
            const target = direction === 'up' ? idx - 1 : idx + 1
            if (target < 0 || target >= d.sections.length) return d
            const sections = [...d.sections]
            const tmp = sections[idx]
            sections[idx] = sections[target]
            sections[target] = tmp
            sections[idx].order = idx + 1
            sections[target].order = target + 1
            return { ...d, sections }
        })
        setItemsTextById(prev => {
            const target = direction === 'up' ? idx - 1 : idx + 1
            if (target < 0) return prev
            const next = { ...prev }
            const a = next[idx]
            next[idx] = next[target]
            next[target] = a
            return next
        })
        if (expandedSection === idx) setExpandedSection(direction === 'up' ? idx - 1 : idx + 1)
        else if (expandedSection === (direction === 'up' ? idx - 1 : idx + 1)) setExpandedSection(idx)
    }

    const updateSection = (idx: number, patch: Partial<PageContentSection>) => {
        setData(d => ({
            ...d,
            sections: d.sections.map((s, i) => (i === idx ? { ...s, ...patch } : s)),
        }))
    }

    const updateSectionItemsText = (idx: number, text: string) => {
        setItemsTextById(prev => ({ ...prev, [idx]: text }))
        // Try to parse on every keystroke; if valid, sync to data; if invalid, store error
        if (text.trim() === '') {
            updateSection(idx, { items: [] })
            setItemsErrorById(prev => ({ ...prev, [idx]: '' }))
            return
        }
        try {
            const parsed = JSON.parse(text)
            if (!Array.isArray(parsed)) {
                setItemsErrorById(prev => ({ ...prev, [idx]: 'Items must be a JSON array (e.g. [] or [{"name":"..."}])' }))
                return
            }
            updateSection(idx, { items: parsed })
            setItemsErrorById(prev => ({ ...prev, [idx]: '' }))
        } catch (e: any) {
            setItemsErrorById(prev => ({ ...prev, [idx]: 'Invalid JSON: ' + (e?.message || 'parse error') }))
        }
    }

    const formatSectionItems = (idx: number) => {
        const text = itemsTextById[idx] || '[]'
        const formatted = tryFormatJSON(text)
        setItemsTextById(prev => ({ ...prev, [idx]: formatted }))
    }

    const handleSave = async () => {
        if (!validateForm()) {
            toast.error('Please fix the highlighted fields')
            return
        }
        // Block save if any section has invalid JSON
        const itemsErrorEntries = Object.entries(itemsErrorById).filter(([, v]) => v)
        if (itemsErrorEntries.length > 0) {
            toast.error('Fix invalid JSON in section items before saving')
            return
        }
        try {
            setSaving(true)
            const payload = {
                ...data,
                seo: {
                    ...data.seo,
                    keywords: keywordsInput.split(',').map(k => k.trim()).filter(Boolean),
                },
                sections: data.sections.map((s, i) => ({
                    ...s,
                    order: typeof s.order === 'number' && !Number.isNaN(s.order) ? s.order : i + 1,
                })),
            }
            const updated = await CMSAdminService.pageContents.upsert(slug, payload)
            if (updated) {
                setData(updated)
                // Resync per-section items JSON text
                const refreshed: Record<number, string> = {}
                ;(updated.sections || []).forEach((s: PageContentSection, idx: number) => {
                    try { refreshed[idx] = JSON.stringify(s.items ?? [], null, 2) }
                    catch { refreshed[idx] = '[]' }
                })
                setItemsTextById(refreshed)
            }
            toast.success(`${displayName} saved`)
        } catch (e: any) {
            toast.error(e?.response?.data?.message || 'Failed to save page content')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="space-y-8 pb-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-6 border-b border-gray-200">
                <div>
                    <div className="text-xs font-medium uppercase tracking-wider text-blue-600 mb-1">
                        Landing Page Section
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">{displayName}</h1>
                    <p className="text-gray-500 mt-2">
                        Edit the hero, content sections, and SEO metadata of the public <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">{publicHref}</code> page. Changes go live immediately.
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                        href={publicHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
                    >
                        <Eye className="w-4 h-4" />
                        Preview
                    </Link>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2.5 rounded-lg font-medium shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 text-sm"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? 'Saving...' : 'Save Changes'}
                    </motion.button>
                </div>
            </div>

            {subCollectionHint && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-sm text-blue-900">
                        <strong>Tip:</strong> {subCollectionHint.description}{' '}
                        <Link href={subCollectionHint.href} className="underline font-medium">
                            Open {subCollectionHint.label} →
                        </Link>
                    </p>
                </div>
            )}

            {/* HERO SECTION */}
            <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                    <ImageIcon className="w-5 h-5 text-blue-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Hero Section</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.hero.title}
                            onChange={e => updateHero({ title: e.target.value })}
                            placeholder="e.g. School Gymnastics Programs"
                            maxLength={200}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent text-sm transition-all ${errors['hero.title']
                                ? 'border-red-400 focus:ring-red-500 bg-red-50/40'
                                : 'border-gray-300 focus:ring-blue-500'
                                }`}
                        />
                        {errors['hero.title'] && (
                            <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors['hero.title']}
                            </p>
                        )}
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Subtitle</label>
                        <textarea
                            value={data.hero.subtitle}
                            onChange={e => updateHero({ subtitle: e.target.value })}
                            placeholder="A short paragraph below the hero title"
                            rows={3}
                            maxLength={500}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent text-sm transition-all resize-y ${errors['hero.subtitle']
                                ? 'border-red-400 focus:ring-red-500 bg-red-50/40'
                                : 'border-gray-300 focus:ring-blue-500'
                                }`}
                        />
                        {errors['hero.subtitle'] && (
                            <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors['hero.subtitle']}
                            </p>
                        )}
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Background Image</label>
                        <ImageUploader
                            value={data.hero.backgroundImage}
                            onChange={(url) => updateHero({ backgroundImage: url })}
                            label="Hero background"
                        />
                        <p className="text-xs text-gray-500 mt-1">Upload an image or paste a URL. Falls back to the gradient when missing.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Fallback Gradient</label>
                        <GradientPicker
                            value={data.hero.fallbackGradient}
                            onChange={(v) => updateHero({ fallbackGradient: v })}
                            format="colors-only"
                            placeholder="e.g. from-blue-600 to-purple-600"
                        />
                        <p className="text-xs text-gray-500 mt-1">Used when the hero image is missing or loading.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Hero Height</label>
                        <select
                            value={data.hero.height}
                            onChange={e => updateHero({ height: e.target.value as any })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        >
                            {heightOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">CTA Button Text</label>
                        <input
                            type="text"
                            value={data.hero.ctaText}
                            onChange={e => updateHero({ ctaText: e.target.value })}
                            placeholder="Book a Trial"
                            maxLength={40}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent text-sm transition-all ${errors['hero.ctaText']
                                ? 'border-red-400 focus:ring-red-500 bg-red-50/40'
                                : 'border-gray-300 focus:ring-blue-500'
                                }`}
                        />
                        {errors['hero.ctaText'] && (
                            <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors['hero.ctaText']}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">CTA Button Link</label>
                        <input
                            type="text"
                            value={data.hero.ctaLink}
                            onChange={e => updateHero({ ctaLink: e.target.value })}
                            placeholder="/book-trial"
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent text-sm transition-all ${errors['hero.ctaLink']
                                ? 'border-red-400 focus:ring-red-500 bg-red-50/40'
                                : 'border-gray-300 focus:ring-blue-500'
                                }`}
                        />
                        {errors['hero.ctaLink'] && (
                            <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors['hero.ctaLink']}
                            </p>
                        )}
                    </div>
                </div>
            </section>

            {/* PAGE SECTIONS */}
            <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <Layers className="w-5 h-5 text-blue-600" />
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Page Sections</h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Add the content blocks that appear below the hero (e.g. Location Info, Facilities, Schedule, Services, FAQ, CTA).
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={addSection}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add Section
                    </button>
                </div>

                {data.sections.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                        <Layers className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No sections yet.</p>
                        <p className="text-gray-400 text-xs mt-1">Click <strong>Add Section</strong> to create the first content block for this page.</p>
                    </div>
                )}

                <div className="space-y-3">
                    <AnimatePresence initial={false}>
                        {data.sections.map((section, idx) => {
                            const isOpen = expandedSection === idx
                            const itemsText = itemsTextById[idx] ?? JSON.stringify(section.items ?? [], null, 2)
                            const itemsError = itemsErrorById[idx] || ''
                            return (
                                <motion.div
                                    key={`section-${idx}`}
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.15 }}
                                    className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50/60"
                                >
                                    {/* Header row */}
                                    <div className="flex items-center justify-between px-4 py-3 bg-white">
                                        <button
                                            type="button"
                                            onClick={() => setExpandedSection(isOpen ? null : idx)}
                                            className="flex-1 flex items-center gap-3 text-left"
                                        >
                                            <span className="inline-flex items-center justify-center w-7 h-7 rounded bg-blue-100 text-blue-700 text-xs font-semibold">
                                                {idx + 1}
                                            </span>
                                            <div className="min-w-0">
                                                <div className="font-semibold text-gray-900 text-sm truncate">
                                                    {section.title || section.key || `Section ${idx + 1}`}
                                                </div>
                                                <div className="text-xs text-gray-500 flex items-center gap-2">
                                                    {section.key && <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">key: {section.key}</span>}
                                                    {!section.isActive && <span className="text-amber-600">• inactive</span>}
                                                    <span>• {Array.isArray(section.items) ? section.items.length : 0} item{(section.items?.length || 0) === 1 ? '' : 's'}</span>
                                                </div>
                                            </div>
                                            {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                        </button>

                                        <div className="flex items-center gap-1 ml-3">
                                            <button
                                                type="button"
                                                title="Move up"
                                                onClick={() => moveSection(idx, 'up')}
                                                disabled={idx === 0}
                                                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                <ArrowUp className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                title="Move down"
                                                onClick={() => moveSection(idx, 'down')}
                                                disabled={idx === data.sections.length - 1}
                                                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                <ArrowDown className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                title="Remove section"
                                                onClick={() => removeSection(idx)}
                                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Body — only when expanded */}
                                    {isOpen && (
                                        <div className="px-4 py-4 space-y-4 border-t border-gray-200 bg-white">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                                        Section Key <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={section.key}
                                                        onChange={e => updateSection(idx, { key: e.target.value })}
                                                        placeholder="e.g. location-info, facilities, schedule"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Unique identifier — frontend can match this key to render the block (lowercase + hyphens recommended).
                                                    </p>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Order</label>
                                                    <input
                                                        type="number"
                                                        value={section.order}
                                                        onChange={e => updateSection(idx, { order: Number(e.target.value) })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                                                <input
                                                    type="text"
                                                    value={section.title}
                                                    onChange={e => updateSection(idx, { title: e.target.value })}
                                                    placeholder="e.g. World-Class Facilities"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Subtitle / Eyebrow</label>
                                                <input
                                                    type="text"
                                                    value={section.subtitle}
                                                    onChange={e => updateSection(idx, { subtitle: e.target.value })}
                                                    placeholder="e.g. PREMIUM FACILITIES"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Body / Description</label>
                                                <textarea
                                                    value={section.body}
                                                    onChange={e => updateSection(idx, { body: e.target.value })}
                                                    rows={3}
                                                    placeholder="Section description shown below the title..."
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-y"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Section Image</label>
                                                <ImageUploader
                                                    value={section.image}
                                                    onChange={url => updateSection(idx, { image: url })}
                                                    label="Section image"
                                                />
                                            </div>

                                            <div>
                                                <div className="flex items-center justify-between mb-1">
                                                    <label className="block text-xs font-medium text-gray-700">
                                                        Items (JSON array)
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={() => formatSectionItems(idx)}
                                                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                                    >
                                                        Format JSON
                                                    </button>
                                                </div>
                                                <textarea
                                                    value={itemsText}
                                                    onChange={e => updateSectionItemsText(idx, e.target.value)}
                                                    rows={10}
                                                    spellCheck={false}
                                                    placeholder='[{"name":"Main Gymnasium","description":"...","features":["..."]}]'
                                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent font-mono text-xs resize-y ${itemsError
                                                        ? 'border-red-400 focus:ring-red-500 bg-red-50/40'
                                                        : 'border-gray-300 focus:ring-blue-500'
                                                        }`}
                                                />
                                                {itemsError ? (
                                                    <p className="mt-1 text-xs text-red-600 flex items-start gap-1">
                                                        <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                                        {itemsError}
                                                    </p>
                                                ) : (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Free-form list of structured items for this section. Each item is an object — fields depend on the section (facilities use <code className="bg-gray-100 px-1 rounded">name/description/features</code>, schedule uses <code className="bg-gray-100 px-1 rounded">day/classes</code>, etc.).
                                                    </p>
                                                )}
                                            </div>

                                            <label className="flex items-center gap-2 pt-2 border-t border-gray-100 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={section.isActive}
                                                    onChange={e => updateSection(idx, { isActive: e.target.checked })}
                                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-sm text-gray-700">Section is active</span>
                                            </label>
                                        </div>
                                    )}
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </div>
            </section>

            {/* SEO SECTION */}
            <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">SEO Metadata</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Meta Title</label>
                        <input
                            type="text"
                            value={data.seo.metaTitle}
                            onChange={e => updateSeo({ metaTitle: e.target.value })}
                            placeholder={`${displayName} | ProActive Sports`}
                            maxLength={60}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent text-sm transition-all ${errors['seo.metaTitle']
                                    ? 'border-red-400 focus:ring-red-500 bg-red-50/40'
                                    : 'border-gray-300 focus:ring-blue-500'
                                }`}
                        />
                        {errors['seo.metaTitle'] && (
                            <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors['seo.metaTitle']}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Keywords (comma-separated)</label>
                        <input
                            type="text"
                            value={keywordsInput}
                            onChange={e => setKeywordsInput(e.target.value)}
                            placeholder="gymnastics, kids, hong kong"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Meta Description</label>
                        <textarea
                            value={data.seo.metaDescription}
                            onChange={e => updateSeo({ metaDescription: e.target.value })}
                            placeholder="A short SEO description (150-160 characters)"
                            rows={2}
                            maxLength={160}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent text-sm transition-all resize-y ${errors['seo.metaDescription']
                                    ? 'border-red-400 focus:ring-red-500 bg-red-50/40'
                                    : 'border-gray-300 focus:ring-blue-500'
                                }`}
                        />
                        {errors['seo.metaDescription'] && (
                            <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors['seo.metaDescription']}
                            </p>
                        )}
                    </div>
                </div>
            </section>

            {/* ACTIVE TOGGLE */}
            <section className="bg-white rounded-xl border border-gray-200 p-6">
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={data.isActive}
                        onChange={e => setData(d => ({ ...d, isActive: e.target.checked }))}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                        <div className="text-sm font-medium text-gray-900">Page is active</div>
                        <div className="text-xs text-gray-500">Uncheck to hide this page from the public site</div>
                    </div>
                </label>
            </section>
        </div>
    )
}
