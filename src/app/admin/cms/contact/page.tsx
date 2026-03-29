'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, Plus, Trash2, Loader2 } from 'lucide-react'
import { CMSAdminService } from '@/services/cmsService'

export default function ContactInfoPage() {
    const [formData, setFormData] = useState({
        phone: '',
        email: '',
        address: '',
        hours: '',
        whatsapp: '',
        socialLinks: [] as Array<{ platform: string; url: string; icon: string }>,
        mapUrl: '',
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const data = await CMSAdminService.contactInfo.get()
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
            await CMSAdminService.contactInfo.upsert(formData)
            alert('Contact info saved successfully!')
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

    const addSocialLink = () => {
        setFormData(prev => ({
            ...prev,
            socialLinks: [...prev.socialLinks, { platform: '', url: '', icon: '' }],
        }))
    }

    const removeSocialLink = (index: number) => {
        setFormData(prev => ({
            ...prev,
            socialLinks: prev.socialLinks.filter((_, i) => i !== index),
        }))
    }

    const updateSocialLink = (index: number, key: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            socialLinks: prev.socialLinks.map((item, i) => i === index ? { ...item, [key]: value } : item),
        }))
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-500">Loading contact info...</p>
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
                    <h1 className="text-2xl font-bold text-gray-900">Contact Information</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage contact details, social links, and map settings for the Contact page.</p>
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

            {/* Contact Details */}
            <div className={sectionClass}>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Phone</label>
                        <input
                            type="text"
                            value={formData.phone}
                            onChange={(e) => updateField('phone', e.target.value)}
                            placeholder="+971 XX XXX XXXX"
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Email</label>
                        <input
                            type="text"
                            value={formData.email}
                            onChange={(e) => updateField('email', e.target.value)}
                            placeholder="info@example.com"
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>WhatsApp</label>
                        <input
                            type="text"
                            value={formData.whatsapp}
                            onChange={(e) => updateField('whatsapp', e.target.value)}
                            placeholder="+971 XX XXX XXXX"
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Map URL</label>
                        <input
                            type="text"
                            value={formData.mapUrl}
                            onChange={(e) => updateField('mapUrl', e.target.value)}
                            placeholder="https://maps.google.com/..."
                            className={inputClass}
                        />
                    </div>
                </div>
            </div>

            {/* Address & Hours */}
            <div className={sectionClass}>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Address & Operating Hours</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Address</label>
                        <textarea
                            value={formData.address}
                            onChange={(e) => updateField('address', e.target.value)}
                            rows={4}
                            placeholder="Full physical address..."
                            className={inputClass + ' resize-y'}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Operating Hours</label>
                        <textarea
                            value={formData.hours}
                            onChange={(e) => updateField('hours', e.target.value)}
                            rows={4}
                            placeholder="Mon-Fri: 6am - 10pm&#10;Sat-Sun: 8am - 8pm"
                            className={inputClass + ' resize-y'}
                        />
                    </div>
                </div>
            </div>

            {/* Social Links */}
            <div className={sectionClass}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Social Links</h2>
                    <button
                        onClick={addSocialLink}
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                        <Plus className="w-4 h-4" /> Add Social Link
                    </button>
                </div>
                {formData.socialLinks.length === 0 && (
                    <p className="text-gray-400 text-sm text-center py-4">No social links added yet. Click &quot;Add Social Link&quot; to get started.</p>
                )}
                <div className="space-y-4">
                    {formData.socialLinks.map((link, idx) => (
                        <div key={idx} className="flex gap-3 items-start p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                    <label className={labelClass}>Platform</label>
                                    <input
                                        type="text"
                                        value={link.platform}
                                        onChange={(e) => updateSocialLink(idx, 'platform', e.target.value)}
                                        placeholder="e.g. Instagram, Facebook"
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>URL</label>
                                    <input
                                        type="text"
                                        value={link.url}
                                        onChange={(e) => updateSocialLink(idx, 'url', e.target.value)}
                                        placeholder="https://..."
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Icon</label>
                                    <input
                                        type="text"
                                        value={link.icon}
                                        onChange={(e) => updateSocialLink(idx, 'icon', e.target.value)}
                                        placeholder="e.g. Instagram, Facebook"
                                        className={inputClass}
                                    />
                                </div>
                            </div>
                            <button
                                onClick={() => removeSocialLink(idx)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-6"
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
