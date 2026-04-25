'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, Plus, Trash2, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { CMSAdminService } from '@/services/cmsService'
import ImageArrayUploader from '@/components/admin/cms/ImageArrayUploader'

type FieldError = Record<string, string>

const URL_REGEX = /^https?:\/\/[^\s/$.?#].[^\s]*$/i

export default function AboutContentPage() {
    const [formData, setFormData] = useState({
        mission: '',
        vision: '',
        values: [] as Array<{ title: string; description: string; icon: string }>,
        stats: [] as Array<{ label: string; value: string; icon: string }>,
        images: [] as string[],
        history: '',
        features: [] as Array<{ title: string; description: string; icon: string }>,
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [errors, setErrors] = useState<FieldError>({})
    const [submitError, setSubmitError] = useState('')

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const data = await CMSAdminService.about.get()
            if (data) setFormData(data)
        } catch (error) {
            console.error('Failed to load:', error)
        } finally {
            setLoading(false)
        }
    }

    const validate = (): boolean => {
        const next: FieldError = {}

        if (!formData.mission.trim()) next.mission = 'Mission is required'
        else if (formData.mission.trim().length < 10) next.mission = 'Mission must be at least 10 characters'
        else if (formData.mission.length > 1000) next.mission = 'Mission must be at most 1000 characters'

        if (!formData.vision.trim()) next.vision = 'Vision is required'
        else if (formData.vision.trim().length < 10) next.vision = 'Vision must be at least 10 characters'
        else if (formData.vision.length > 1000) next.vision = 'Vision must be at most 1000 characters'

        if (formData.history && formData.history.length > 5000) {
            next.history = 'History must be at most 5000 characters'
        }

        formData.values.forEach((v, i) => {
            if (!v.title.trim()) next[`values.${i}.title`] = 'Title is required'
            if (!v.description.trim()) next[`values.${i}.description`] = 'Description is required'
        })

        formData.stats.forEach((s, i) => {
            if (!s.label.trim()) next[`stats.${i}.label`] = 'Label is required'
            if (!s.value.trim()) next[`stats.${i}.value`] = 'Value is required'
        })

        formData.features.forEach((f, i) => {
            if (!f.title.trim()) next[`features.${i}.title`] = 'Title is required'
            if (!f.description.trim()) next[`features.${i}.description`] = 'Description is required'
        })

        formData.images.forEach((url, i) => {
            if (url && !URL_REGEX.test(url)) next[`images.${i}`] = 'Must be a valid URL starting with http:// or https://'
        })

        setErrors(next)
        if (Object.keys(next).length > 0) {
            setSubmitError('Please fix the highlighted fields before saving')
            return false
        }
        setSubmitError('')
        return true
    }

    const handleSave = async () => {
        if (!validate()) {
            toast.error('Please fix the highlighted fields')
            return
        }
        try {
            setSaving(true)
            const payload = {
                ...formData,
                mission: formData.mission.trim(),
                vision: formData.vision.trim(),
                history: formData.history.trim(),
                images: formData.images.filter(u => u.trim() !== ''),
                values: formData.values.filter(v => v.title.trim() || v.description.trim()),
                stats: formData.stats.filter(s => s.label.trim() || s.value.trim()),
                features: formData.features.filter(f => f.title.trim() || f.description.trim()),
            }
            await CMSAdminService.about.upsert(payload)
            toast.success('About content saved successfully!')
            setSubmitError('')
            setErrors({})
        } catch (error: any) {
            console.error('Save failed:', error)
            const msg = error?.response?.data?.message || 'Failed to save about content'
            setSubmitError(msg)
            toast.error(msg)
        } finally {
            setSaving(false)
        }
    }

    const clearError = (key: string) => {
        if (errors[key]) {
            setErrors(prev => {
                const next = { ...prev }
                delete next[key]
                return next
            })
        }
    }

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        clearError(field)
    }

    const addArrayObjectItem = (field: 'values' | 'stats' | 'features') => {
        setFormData(prev => ({
            ...prev,
            [field]: [...prev[field], { title: '', description: '', icon: '', label: '', value: '' }],
        }))
    }

    const removeArrayObjectItem = (field: 'values' | 'stats' | 'features', index: number) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index),
        }))
        setErrors(prev => {
            const next: FieldError = {}
            Object.keys(prev).forEach(k => {
                if (!k.startsWith(`${field}.${index}.`)) next[k] = prev[k]
            })
            return next
        })
    }

    const updateArrayObjectItem = (field: 'values' | 'stats' | 'features', index: number, key: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].map((item, i) => i === index ? { ...item, [key]: value } : item),
        }))
        clearError(`${field}.${index}.${key}`)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-500">Loading about content...</p>
                </div>
            </div>
        )
    }

    const inputBase = 'w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent transition-all text-sm'
    const okClass = 'border-gray-200 focus:ring-blue-500'
    const errClass = 'border-red-400 focus:ring-red-500 bg-red-50/40'
    const cn = (key: string) => `${inputBase} ${errors[key] ? errClass : okClass}`
    const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5'
    const sectionClass = 'bg-white rounded-xl border border-gray-200 p-6 shadow-sm'
    const errorMsg = (key: string) => errors[key] ? (
        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />{errors[key]}
        </p>
    ) : null

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">About Page Content</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage the About Us page content including mission, vision, values, and more.</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-lg font-medium shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50"
                >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {saving ? 'Saving...' : 'Save Changes'}
                </motion.button>
            </div>

            {submitError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{submitError}</span>
                </div>
            )}

            {/* Mission */}
            <div className={sectionClass}>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Mission Statement</h2>
                <label className={labelClass}>Mission <span className="text-red-500">*</span></label>
                <textarea
                    value={formData.mission}
                    onChange={(e) => updateField('mission', e.target.value)}
                    rows={4}
                    maxLength={1000}
                    placeholder="Enter your organization's mission statement..."
                    className={cn('mission') + ' resize-y'}
                />
                {errorMsg('mission')}
            </div>

            {/* Vision */}
            <div className={sectionClass}>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Vision Statement</h2>
                <label className={labelClass}>Vision <span className="text-red-500">*</span></label>
                <textarea
                    value={formData.vision}
                    onChange={(e) => updateField('vision', e.target.value)}
                    rows={4}
                    maxLength={1000}
                    placeholder="Enter your organization's vision statement..."
                    className={cn('vision') + ' resize-y'}
                />
                {errorMsg('vision')}
            </div>

            {/* History */}
            <div className={sectionClass}>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">History</h2>
                <label className={labelClass}>Organization History</label>
                <textarea
                    value={formData.history}
                    onChange={(e) => updateField('history', e.target.value)}
                    rows={8}
                    maxLength={5000}
                    placeholder="Tell the story of your organization..."
                    className={cn('history') + ' resize-y'}
                />
                {errorMsg('history')}
            </div>

            {/* Values */}
            <div className={sectionClass}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Values</h2>
                    <button
                        onClick={() => addArrayObjectItem('values')}
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                        <Plus className="w-4 h-4" /> Add Value
                    </button>
                </div>
                {formData.values.length === 0 && (
                    <p className="text-gray-400 text-sm text-center py-4">No values added yet. Click &quot;Add Value&quot; to get started.</p>
                )}
                <div className="space-y-4">
                    {formData.values.map((item, idx) => (
                        <div key={idx} className="flex gap-3 items-start p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                    <label className={labelClass}>Title <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={item.title}
                                        onChange={(e) => updateArrayObjectItem('values', idx, 'title', e.target.value)}
                                        maxLength={120}
                                        placeholder="Value title"
                                        className={cn(`values.${idx}.title`)}
                                    />
                                    {errorMsg(`values.${idx}.title`)}
                                </div>
                                <div>
                                    <label className={labelClass}>Icon</label>
                                    <input
                                        type="text"
                                        value={item.icon}
                                        onChange={(e) => updateArrayObjectItem('values', idx, 'icon', e.target.value)}
                                        placeholder="e.g. Heart, Star, Shield"
                                        maxLength={40}
                                        className={cn(`values.${idx}.icon`)}
                                    />
                                </div>
                                <div className="md:col-span-3">
                                    <label className={labelClass}>Description <span className="text-red-500">*</span></label>
                                    <textarea
                                        value={item.description}
                                        onChange={(e) => updateArrayObjectItem('values', idx, 'description', e.target.value)}
                                        placeholder="Describe this value..."
                                        rows={2}
                                        maxLength={500}
                                        className={cn(`values.${idx}.description`) + ' resize-y'}
                                    />
                                    {errorMsg(`values.${idx}.description`)}
                                </div>
                            </div>
                            <button
                                onClick={() => removeArrayObjectItem('values', idx)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-6"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Stats */}
            <div className={sectionClass}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Stats</h2>
                    <button
                        onClick={() => addArrayObjectItem('stats')}
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                        <Plus className="w-4 h-4" /> Add Stat
                    </button>
                </div>
                {formData.stats.length === 0 && (
                    <p className="text-gray-400 text-sm text-center py-4">No stats added yet. Click &quot;Add Stat&quot; to get started.</p>
                )}
                <div className="space-y-4">
                    {formData.stats.map((item, idx) => (
                        <div key={idx} className="flex gap-3 items-start p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                    <label className={labelClass}>Label <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={item.label}
                                        onChange={(e) => updateArrayObjectItem('stats', idx, 'label', e.target.value)}
                                        placeholder="e.g. Happy Members"
                                        maxLength={80}
                                        className={cn(`stats.${idx}.label`)}
                                    />
                                    {errorMsg(`stats.${idx}.label`)}
                                </div>
                                <div>
                                    <label className={labelClass}>Value <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={item.value}
                                        onChange={(e) => updateArrayObjectItem('stats', idx, 'value', e.target.value)}
                                        placeholder="e.g. 500+"
                                        maxLength={20}
                                        className={cn(`stats.${idx}.value`)}
                                    />
                                    {errorMsg(`stats.${idx}.value`)}
                                </div>
                                <div>
                                    <label className={labelClass}>Icon</label>
                                    <input
                                        type="text"
                                        value={item.icon}
                                        onChange={(e) => updateArrayObjectItem('stats', idx, 'icon', e.target.value)}
                                        placeholder="e.g. Users, Trophy"
                                        maxLength={40}
                                        className={cn(`stats.${idx}.icon`)}
                                    />
                                </div>
                            </div>
                            <button
                                onClick={() => removeArrayObjectItem('stats', idx)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-6"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Features */}
            <div className={sectionClass}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Features</h2>
                    <button
                        onClick={() => addArrayObjectItem('features')}
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                        <Plus className="w-4 h-4" /> Add Feature
                    </button>
                </div>
                {formData.features.length === 0 && (
                    <p className="text-gray-400 text-sm text-center py-4">No features added yet. Click &quot;Add Feature&quot; to get started.</p>
                )}
                <div className="space-y-4">
                    {formData.features.map((item, idx) => (
                        <div key={idx} className="flex gap-3 items-start p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                    <label className={labelClass}>Title <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={item.title}
                                        onChange={(e) => updateArrayObjectItem('features', idx, 'title', e.target.value)}
                                        placeholder="Feature title"
                                        maxLength={120}
                                        className={cn(`features.${idx}.title`)}
                                    />
                                    {errorMsg(`features.${idx}.title`)}
                                </div>
                                <div>
                                    <label className={labelClass}>Icon</label>
                                    <input
                                        type="text"
                                        value={item.icon}
                                        onChange={(e) => updateArrayObjectItem('features', idx, 'icon', e.target.value)}
                                        placeholder="e.g. Zap, Award"
                                        maxLength={40}
                                        className={cn(`features.${idx}.icon`)}
                                    />
                                </div>
                                <div className="md:col-span-3">
                                    <label className={labelClass}>Description <span className="text-red-500">*</span></label>
                                    <textarea
                                        value={item.description}
                                        onChange={(e) => updateArrayObjectItem('features', idx, 'description', e.target.value)}
                                        placeholder="Describe this feature..."
                                        rows={2}
                                        maxLength={500}
                                        className={cn(`features.${idx}.description`) + ' resize-y'}
                                    />
                                    {errorMsg(`features.${idx}.description`)}
                                </div>
                            </div>
                            <button
                                onClick={() => removeArrayObjectItem('features', idx)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-6"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Images */}
            <div className={sectionClass}>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Images</h2>
                <p className="text-sm text-gray-500 mb-3">Upload images directly or paste image URLs. These appear on the About page.</p>
                <ImageArrayUploader
                    value={formData.images}
                    onChange={(urls) => {
                        setFormData(prev => ({ ...prev, images: urls }))
                        // Clear any lingering image.{n} errors
                        setErrors(prev => {
                            const next: FieldError = {}
                            Object.keys(prev).forEach(k => { if (!k.startsWith('images.')) next[k] = prev[k] })
                            return next
                        })
                    }}
                    folder="about-page"
                    maxImages={12}
                />
            </div>

            {/* Save Button (bottom) */}
            <div className="flex justify-end pt-4 pb-8">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50"
                >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {saving ? 'Saving...' : 'Save All Changes'}
                </motion.button>
            </div>
        </div>
    )
}
