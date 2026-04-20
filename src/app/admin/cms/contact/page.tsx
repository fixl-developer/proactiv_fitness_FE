'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, Plus, Trash2, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { CMSAdminService } from '@/services/cmsService'

type FieldError = Record<string, string>

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const URL_REGEX = /^https?:\/\/[^\s/$.?#].[^\s]*$/i
const PHONE_REGEX = /^[+]?[\d\s()-]{7,20}$/

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
    const [errors, setErrors] = useState<FieldError>({})
    const [submitError, setSubmitError] = useState('')

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

    const validate = (): boolean => {
        const next: FieldError = {}

        if (!formData.phone.trim()) next.phone = 'Phone is required'
        else if (!PHONE_REGEX.test(formData.phone.trim())) next.phone = 'Enter a valid phone number'

        if (!formData.email.trim()) next.email = 'Email is required'
        else if (!EMAIL_REGEX.test(formData.email.trim())) next.email = 'Enter a valid email address'

        if (!formData.address.trim()) next.address = 'Address is required'
        else if (formData.address.length > 500) next.address = 'Address must be at most 500 characters'

        if (formData.whatsapp && !PHONE_REGEX.test(formData.whatsapp.trim())) {
            next.whatsapp = 'Enter a valid WhatsApp number'
        }
        if (formData.mapUrl && !URL_REGEX.test(formData.mapUrl.trim())) {
            next.mapUrl = 'Map URL must start with http:// or https://'
        }

        formData.socialLinks.forEach((s, i) => {
            if (!s.platform.trim() && !s.url.trim()) return
            if (!s.platform.trim()) next[`socialLinks.${i}.platform`] = 'Platform is required'
            if (!s.url.trim()) next[`socialLinks.${i}.url`] = 'URL is required'
            else if (!URL_REGEX.test(s.url.trim())) next[`socialLinks.${i}.url`] = 'URL must start with http:// or https://'
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
                phone: formData.phone.trim(),
                email: formData.email.trim(),
                address: formData.address.trim(),
                hours: formData.hours.trim(),
                whatsapp: formData.whatsapp.trim(),
                mapUrl: formData.mapUrl.trim(),
                socialLinks: formData.socialLinks
                    .filter(s => s.platform.trim() && s.url.trim())
                    .map(s => ({ ...s, platform: s.platform.trim(), url: s.url.trim(), icon: s.icon.trim() })),
            }
            await CMSAdminService.contactInfo.upsert(payload)
            toast.success('Contact info saved successfully!')
            setErrors({})
            setSubmitError('')
        } catch (error: any) {
            console.error('Save failed:', error)
            const msg = error?.response?.data?.message || 'Failed to save contact info'
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
        setErrors(prev => {
            const next: FieldError = {}
            Object.keys(prev).forEach(k => {
                if (!k.startsWith(`socialLinks.${index}.`)) next[k] = prev[k]
            })
            return next
        })
    }

    const updateSocialLink = (index: number, key: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            socialLinks: prev.socialLinks.map((item, i) => i === index ? { ...item, [key]: value } : item),
        }))
        clearError(`socialLinks.${index}.${key}`)
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

            {submitError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{submitError}</span>
                </div>
            )}

            {/* Contact Details */}
            <div className={sectionClass}>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Phone <span className="text-red-500">*</span></label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => updateField('phone', e.target.value)}
                            placeholder="+971 XX XXX XXXX"
                            className={cn('phone')}
                        />
                        {errorMsg('phone')}
                    </div>
                    <div>
                        <label className={labelClass}>Email <span className="text-red-500">*</span></label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => updateField('email', e.target.value)}
                            placeholder="info@example.com"
                            className={cn('email')}
                        />
                        {errorMsg('email')}
                    </div>
                    <div>
                        <label className={labelClass}>WhatsApp</label>
                        <input
                            type="tel"
                            value={formData.whatsapp}
                            onChange={(e) => updateField('whatsapp', e.target.value)}
                            placeholder="+971 XX XXX XXXX"
                            className={cn('whatsapp')}
                        />
                        {errorMsg('whatsapp')}
                    </div>
                    <div>
                        <label className={labelClass}>Map URL</label>
                        <input
                            type="url"
                            value={formData.mapUrl}
                            onChange={(e) => updateField('mapUrl', e.target.value)}
                            placeholder="https://maps.google.com/..."
                            className={cn('mapUrl')}
                        />
                        {errorMsg('mapUrl')}
                    </div>
                </div>
            </div>

            {/* Address & Hours */}
            <div className={sectionClass}>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Address & Operating Hours</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Address <span className="text-red-500">*</span></label>
                        <textarea
                            value={formData.address}
                            onChange={(e) => updateField('address', e.target.value)}
                            rows={4}
                            maxLength={500}
                            placeholder="Full physical address..."
                            className={cn('address') + ' resize-y'}
                        />
                        {errorMsg('address')}
                    </div>
                    <div>
                        <label className={labelClass}>Operating Hours</label>
                        <textarea
                            value={formData.hours}
                            onChange={(e) => updateField('hours', e.target.value)}
                            rows={4}
                            maxLength={500}
                            placeholder="Mon-Fri: 6am - 10pm&#10;Sat-Sun: 8am - 8pm"
                            className={cn('hours') + ' resize-y'}
                        />
                        {errorMsg('hours')}
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
                                    <label className={labelClass}>Platform <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={link.platform}
                                        onChange={(e) => updateSocialLink(idx, 'platform', e.target.value)}
                                        placeholder="e.g. Instagram, Facebook"
                                        maxLength={40}
                                        className={cn(`socialLinks.${idx}.platform`)}
                                    />
                                    {errorMsg(`socialLinks.${idx}.platform`)}
                                </div>
                                <div>
                                    <label className={labelClass}>URL <span className="text-red-500">*</span></label>
                                    <input
                                        type="url"
                                        value={link.url}
                                        onChange={(e) => updateSocialLink(idx, 'url', e.target.value)}
                                        placeholder="https://..."
                                        className={cn(`socialLinks.${idx}.url`)}
                                    />
                                    {errorMsg(`socialLinks.${idx}.url`)}
                                </div>
                                <div>
                                    <label className={labelClass}>Icon</label>
                                    <input
                                        type="text"
                                        value={link.icon}
                                        onChange={(e) => updateSocialLink(idx, 'icon', e.target.value)}
                                        placeholder="e.g. Instagram, Facebook"
                                        maxLength={40}
                                        className={cn(`socialLinks.${idx}.icon`)}
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
