'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, Plus, Trash2, Loader2 } from 'lucide-react'
import { CMSAdminService } from '@/services/cmsService'

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

    const handleSave = async () => {
        try {
            setSaving(true)
            await CMSAdminService.about.upsert(formData)
            alert('About content saved successfully!')
        } catch (error) {
            console.error('Save failed:', error)
            alert('Failed to save')
        } finally {
            setSaving(false)
        }
    }

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
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
    }

    const updateArrayObjectItem = (field: 'values' | 'stats' | 'features', index: number, key: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].map((item, i) => i === index ? { ...item, [key]: value } : item),
        }))
    }

    const addImageUrl = () => {
        setFormData(prev => ({ ...prev, images: [...prev.images, ''] }))
    }

    const removeImageUrl = (index: number) => {
        setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))
    }

    const updateImageUrl = (index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.map((img, i) => i === index ? value : img),
        }))
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

    const inputClass = 'w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm'
    const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5'
    const sectionClass = 'bg-white rounded-xl border border-gray-200 p-6 shadow-sm'

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

            {/* Mission */}
            <div className={sectionClass}>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Mission Statement</h2>
                <label className={labelClass}>Mission</label>
                <textarea
                    value={formData.mission}
                    onChange={(e) => updateField('mission', e.target.value)}
                    rows={4}
                    placeholder="Enter your organization's mission statement..."
                    className={inputClass + ' resize-y'}
                />
            </div>

            {/* Vision */}
            <div className={sectionClass}>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Vision Statement</h2>
                <label className={labelClass}>Vision</label>
                <textarea
                    value={formData.vision}
                    onChange={(e) => updateField('vision', e.target.value)}
                    rows={4}
                    placeholder="Enter your organization's vision statement..."
                    className={inputClass + ' resize-y'}
                />
            </div>

            {/* History */}
            <div className={sectionClass}>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">History</h2>
                <label className={labelClass}>Organization History</label>
                <textarea
                    value={formData.history}
                    onChange={(e) => updateField('history', e.target.value)}
                    rows={8}
                    placeholder="Tell the story of your organization..."
                    className={inputClass + ' resize-y'}
                />
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
                                    <label className={labelClass}>Title</label>
                                    <input
                                        type="text"
                                        value={item.title}
                                        onChange={(e) => updateArrayObjectItem('values', idx, 'title', e.target.value)}
                                        placeholder="Value title"
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Icon</label>
                                    <input
                                        type="text"
                                        value={item.icon}
                                        onChange={(e) => updateArrayObjectItem('values', idx, 'icon', e.target.value)}
                                        placeholder="e.g. Heart, Star, Shield"
                                        className={inputClass}
                                    />
                                </div>
                                <div className="md:col-span-3">
                                    <label className={labelClass}>Description</label>
                                    <textarea
                                        value={item.description}
                                        onChange={(e) => updateArrayObjectItem('values', idx, 'description', e.target.value)}
                                        placeholder="Describe this value..."
                                        rows={2}
                                        className={inputClass + ' resize-y'}
                                    />
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
                                    <label className={labelClass}>Label</label>
                                    <input
                                        type="text"
                                        value={item.label}
                                        onChange={(e) => updateArrayObjectItem('stats', idx, 'label', e.target.value)}
                                        placeholder="e.g. Happy Members"
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Value</label>
                                    <input
                                        type="text"
                                        value={item.value}
                                        onChange={(e) => updateArrayObjectItem('stats', idx, 'value', e.target.value)}
                                        placeholder="e.g. 500+"
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Icon</label>
                                    <input
                                        type="text"
                                        value={item.icon}
                                        onChange={(e) => updateArrayObjectItem('stats', idx, 'icon', e.target.value)}
                                        placeholder="e.g. Users, Trophy"
                                        className={inputClass}
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
                                    <label className={labelClass}>Title</label>
                                    <input
                                        type="text"
                                        value={item.title}
                                        onChange={(e) => updateArrayObjectItem('features', idx, 'title', e.target.value)}
                                        placeholder="Feature title"
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Icon</label>
                                    <input
                                        type="text"
                                        value={item.icon}
                                        onChange={(e) => updateArrayObjectItem('features', idx, 'icon', e.target.value)}
                                        placeholder="e.g. Zap, Award"
                                        className={inputClass}
                                    />
                                </div>
                                <div className="md:col-span-3">
                                    <label className={labelClass}>Description</label>
                                    <textarea
                                        value={item.description}
                                        onChange={(e) => updateArrayObjectItem('features', idx, 'description', e.target.value)}
                                        placeholder="Describe this feature..."
                                        rows={2}
                                        className={inputClass + ' resize-y'}
                                    />
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
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Images</h2>
                    <button
                        onClick={addImageUrl}
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                        <Plus className="w-4 h-4" /> Add Image URL
                    </button>
                </div>
                {formData.images.length === 0 && (
                    <p className="text-gray-400 text-sm text-center py-4">No images added yet. Click &quot;Add Image URL&quot; to get started.</p>
                )}
                <div className="space-y-3">
                    {formData.images.map((url, idx) => (
                        <div key={idx} className="flex gap-3 items-center">
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => updateImageUrl(idx, e.target.value)}
                                placeholder="https://example.com/image.jpg"
                                className={inputClass + ' flex-1'}
                            />
                            {url && (
                                <img
                                    src={url}
                                    alt={`Image ${idx + 1}`}
                                    className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                                    onError={(e) => (e.currentTarget.style.display = 'none')}
                                />
                            )}
                            <button
                                onClick={() => removeImageUrl(idx)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
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
