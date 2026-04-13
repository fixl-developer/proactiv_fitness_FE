'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Calendar, Camera, Save, Edit, X, CheckCircle, Shield, Bell, RefreshCw, BookOpen, CreditCard, CalendarCheck, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import apiClient from '@/lib/apiClient'
import { useTrackUnsavedChanges } from '@/hooks/useTrackUnsavedChanges'
import { validateName, validatePhone, validateDateOfBirth, validateTextArea, filterNameInput, filterPhoneInput, FORMAT_HINTS } from '@/utils/validation'
import { FormFieldHint } from '@/components/ui/FormFieldHint'

interface EmergencyContact {
    name: string
    phone: string
    relationship: string
}

interface Preferences {
    notifications: boolean
    emailUpdates: boolean
    smsReminders: boolean
}

interface ProfileStats {
    totalClasses: number
    completedClasses: number
    upcomingClasses: number
    totalSpent: number
}

interface ProfileData {
    firstName: string
    lastName: string
    email: string
    phone: string
    dateOfBirth: string
    bio: string
    avatar?: string
    emergencyContact: EmergencyContact
    preferences: Preferences
    stats?: ProfileStats
}

function buildFallbackProfile(user: any): ProfileData {
    return {
        firstName: user?.firstName || user?.name?.split(' ')[0] || '',
        lastName: user?.lastName || user?.name?.split(' ')[1] || '',
        email: user?.email || '',
        phone: '',
        dateOfBirth: '',
        bio: '',
        emergencyContact: { name: '', phone: '', relationship: '' },
        preferences: { notifications: true, emailUpdates: true, smsReminders: true },
        stats: { totalClasses: 0, completedClasses: 0, upcomingClasses: 0, totalSpent: 0 }
    }
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<ProfileData | null>(null)
    const [originalProfile, setOriginalProfile] = useState<ProfileData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
    const [saveSuccess, setSaveSuccess] = useState(false)
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { isAuthenticated, user } = useAuth()
    const router = useRouter()

    const isDirty = isEditing && JSON.stringify(profile) !== JSON.stringify(originalProfile)

    const saveForLogout = useCallback(async () => {
        if (!isDirty || !profile) return
        try {
            await apiClient.put('/user/profile/profile', profile)
            setOriginalProfile(profile)
            setIsEditing(false)
        } catch (err) {
            console.error('Error auto-saving profile on logout:', err)
        }
    }, [profile, isDirty])

    useTrackUnsavedChanges('user-profile', 'User Profile', isDirty, saveForLogout)

    const loadProfile = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await apiClient.get('/user/profile/profile')
            const data = response?.data || response
            setProfile(data)
            setOriginalProfile(data)
        } catch (err: any) {
            console.error('Error loading profile:', err)
            if (user) {
                const fallback = buildFallbackProfile(user)
                setProfile(fallback)
                setOriginalProfile(fallback)
            } else {
                setError('Failed to load profile. Please try again.')
            }
        } finally {
            setIsLoading(false)
        }
    }, [user])

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadProfile()
    }, [isAuthenticated, router, loadProfile])

    // Auto-dismiss success message after 5 seconds
    useEffect(() => {
        if (!saveSuccess) return
        const timer = setTimeout(() => setSaveSuccess(false), 5000)
        return () => clearTimeout(timer)
    }, [saveSuccess])

    const handleSave = async () => {
        if (!profile) return
        // Validate all fields
        const errors: Record<string, string> = {}
        const fnErr = validateName(profile.firstName, 'First name'); if (fnErr) errors.firstName = fnErr
        const lnErr = validateName(profile.lastName, 'Last name'); if (lnErr) errors.lastName = lnErr
        if (profile.phone) { const pe = validatePhone(profile.phone, false); if (pe) errors.phone = pe }
        if (profile.dateOfBirth) { const de = validateDateOfBirth(profile.dateOfBirth, false); if (de) errors.dateOfBirth = de }
        if (profile.bio) { const be = validateTextArea(profile.bio, 'Bio', 0, 500); if (be) errors.bio = be }
        if (profile.emergencyContact?.name) { const en = validateName(profile.emergencyContact.name, 'Contact name'); if (en) errors.ecName = en }
        if (profile.emergencyContact?.phone) { const ep = validatePhone(profile.emergencyContact.phone, false); if (ep) errors.ecPhone = ep }
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors)
            alert('Please fix the validation errors before saving.')
            return
        }
        setFieldErrors({})
        try {
            setIsSaving(true)
            await apiClient.put('/user/profile/profile', profile)
            setOriginalProfile(profile)
            setIsEditing(false)
            setSaveSuccess(true)
        } catch (err: any) {
            console.error('Error saving profile:', err)
            alert('Failed to save profile. Please try again.')
        } finally {
            setIsSaving(false)
        }
    }

    const handleCancelEdit = () => {
        setProfile(originalProfile)
        setIsEditing(false)
        setAvatarPreview(null)
    }

    const handleAvatarClick = () => {
        alert('Avatar upload coming soon')
    }

    const calculateProfileCompletion = () => {
        if (!profile) return 0
        const fields = [
            profile.firstName,
            profile.lastName,
            profile.email,
            profile.phone,
            profile.dateOfBirth,
            profile.bio,
            profile.emergencyContact?.name,
            profile.emergencyContact?.phone
        ]
        const completed = fields.filter(f => f && f.length > 0).length
        return Math.round((completed / fields.length) * 100)
    }

    // Loading skeleton
    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-24 bg-gray-200 rounded-lg"></div>
                    <div className="h-48 bg-gray-200 rounded-lg"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="h-32 bg-gray-200 rounded-lg"></div>
                        <div className="h-32 bg-gray-200 rounded-lg"></div>
                    </div>
                    <div className="h-40 bg-gray-200 rounded-lg"></div>
                    <div className="h-32 bg-gray-200 rounded-lg"></div>
                </div>
            </div>
        )
    }

    // Error with retry
    if (error && !profile) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <AlertCircle className="w-12 h-12 text-red-500" />
                <h2 className="text-xl font-semibold text-gray-900">Something went wrong</h2>
                <p className="text-gray-600">{error}</p>
                <Button onClick={loadProfile}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                </Button>
            </div>
        )
    }

    const profileCompletion = calculateProfileCompletion()

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                    <p className="text-gray-600 mt-2">Manage your personal information</p>
                </div>
                {!isEditing ? (
                    <Button id="user-profile-edit-btn" onClick={() => setIsEditing(true)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Button id="user-profile-cancel-edit-btn" variant="outline" onClick={handleCancelEdit} disabled={isSaving}>
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                        </Button>
                        <Button id="user-profile-save-btn" onClick={handleSave} disabled={isSaving}>
                            {isSaving ? (
                                <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                            ) : (
                                <><Save className="w-4 h-4 mr-2" /> Save Changes</>
                            )}
                        </Button>
                    </div>
                )}
            </div>

            {/* Save Success Message */}
            {saveSuccess && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2"
                >
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-800 font-medium">Profile saved successfully!</span>
                </motion.div>
            )}

            {/* Quick Navigation Buttons */}
            <div className="grid grid-cols-3 gap-4">
                <Button
                    id="user-profile-my-classes-btn"
                    variant="outline"
                    className="flex items-center justify-center gap-2 py-6"
                    onClick={() => router.push('/user/my-classes')}
                >
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <span>My Classes</span>
                </Button>
                <Button
                    id="user-profile-bookings-btn"
                    variant="outline"
                    className="flex items-center justify-center gap-2 py-6"
                    onClick={() => router.push('/user/bookings')}
                >
                    <CalendarCheck className="w-5 h-5 text-emerald-600" />
                    <span>Bookings</span>
                </Button>
                <Button
                    id="user-profile-payments-btn"
                    variant="outline"
                    className="flex items-center justify-center gap-2 py-6"
                    onClick={() => router.push('/user/payments')}
                >
                    <CreditCard className="w-5 h-5 text-purple-600" />
                    <span>Payments</span>
                </Button>
            </div>

            {/* Profile Completion */}
            <Card className="border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h3 className="font-semibold text-gray-900">Profile Completion</h3>
                            <p className="text-sm text-gray-600 mt-1">Complete your profile to unlock all features</p>
                        </div>
                        <div className="text-3xl font-bold text-emerald-600">{profileCompletion}%</div>
                    </div>
                    <Progress value={profileCompletion} className="h-3" />
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main profile content - left 2 columns */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Profile Picture */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Picture</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-6">
                                <div className="relative">
                                    {(avatarPreview || profile?.avatar) ? (
                                        <img
                                            src={avatarPreview || profile?.avatar}
                                            alt="Avatar"
                                            className="w-24 h-24 rounded-full object-cover border-4 border-emerald-200"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-3xl font-bold border-4 border-emerald-200">
                                            {profile?.firstName?.[0]}{profile?.lastName?.[0]}
                                        </div>
                                    )}
                                    {isEditing && (
                                        <button
                                            id="user-profile-avatar-upload-btn"
                                            onClick={handleAvatarClick}
                                            className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white hover:bg-emerald-700 transition-colors shadow-lg"
                                        >
                                            <Camera className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900">
                                        {profile?.firstName} {profile?.lastName}
                                    </h3>
                                    <p className="text-gray-600 mt-1">{profile?.email}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge className="bg-emerald-100 text-emerald-800">
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            Verified
                                        </Badge>
                                        <Badge variant="outline">USER</Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Personal Information */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <User className="w-5 h-5 text-blue-600" />
                                <CardTitle>Personal Information</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        value={profile?.firstName || ''}
                                        onChange={(e) => {
                                            setProfile((prev) => prev ? { ...prev, firstName: e.target.value } : prev)
                                            const err = validateName(e.target.value, 'First name')
                                            setFieldErrors(prev => { const n = {...prev}; if (err) n.firstName = err; else delete n.firstName; return n })
                                        }}
                                        onKeyDown={filterNameInput}
                                        disabled={!isEditing}
                                        className={`w-full px-4 py-3 border-2 rounded-lg disabled:bg-gray-50 focus:border-emerald-500 focus:outline-none transition-colors ${fieldErrors.firstName ? 'border-red-500' : 'border-gray-200'}`}
                                    />
                                    {isEditing && <FormFieldHint hint={FORMAT_HINTS.firstName} error={fieldErrors.firstName} />}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        value={profile?.lastName || ''}
                                        onChange={(e) => {
                                            setProfile((prev) => prev ? { ...prev, lastName: e.target.value } : prev)
                                            const err = validateName(e.target.value, 'Last name')
                                            setFieldErrors(prev => { const n = {...prev}; if (err) n.lastName = err; else delete n.lastName; return n })
                                        }}
                                        onKeyDown={filterNameInput}
                                        disabled={!isEditing}
                                        className={`w-full px-4 py-3 border-2 rounded-lg disabled:bg-gray-50 focus:border-emerald-500 focus:outline-none transition-colors ${fieldErrors.lastName ? 'border-red-500' : 'border-gray-200'}`}
                                    />
                                    {isEditing && <FormFieldHint hint={FORMAT_HINTS.lastName} error={fieldErrors.lastName} />}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={profile?.email || ''}
                                        disabled
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed"
                                    />
                                    <p className="text-xs text-gray-500">Email cannot be changed</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <Phone className="w-4 h-4" />
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        value={profile?.phone || ''}
                                        onChange={(e) => {
                                            setProfile((prev) => prev ? { ...prev, phone: e.target.value } : prev)
                                            const err = validatePhone(e.target.value, false)
                                            setFieldErrors(prev => { const n = {...prev}; if (err) n.phone = err; else delete n.phone; return n })
                                        }}
                                        onKeyDown={filterPhoneInput}
                                        disabled={!isEditing}
                                        className={`w-full px-4 py-3 border-2 rounded-lg disabled:bg-gray-50 focus:border-emerald-500 focus:outline-none transition-colors ${fieldErrors.phone ? 'border-red-500' : 'border-gray-200'}`}
                                    />
                                    {isEditing && <FormFieldHint hint={FORMAT_HINTS.phone} error={fieldErrors.phone} />}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        Date of Birth
                                    </label>
                                    <input
                                        type="date"
                                        value={profile?.dateOfBirth || ''}
                                        onChange={(e) => {
                                            setProfile((prev) => prev ? { ...prev, dateOfBirth: e.target.value } : prev)
                                            const err = validateDateOfBirth(e.target.value, false)
                                            setFieldErrors(prev => { const n = {...prev}; if (err) n.dateOfBirth = err; else delete n.dateOfBirth; return n })
                                        }}
                                        disabled={!isEditing}
                                        className={`w-full px-4 py-3 border-2 rounded-lg disabled:bg-gray-50 focus:border-emerald-500 focus:outline-none transition-colors ${fieldErrors.dateOfBirth ? 'border-red-500' : 'border-gray-200'}`}
                                    />
                                    {isEditing && <FormFieldHint hint={FORMAT_HINTS.dateOfBirth} error={fieldErrors.dateOfBirth} />}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bio */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Bio</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <textarea
                                value={profile?.bio || ''}
                                onChange={(e) => {
                                    setProfile((prev) => prev ? { ...prev, bio: e.target.value } : prev)
                                    const err = validateTextArea(e.target.value, 'Bio', 0, 500)
                                    setFieldErrors(prev => { const n = {...prev}; if (err) n.bio = err; else delete n.bio; return n })
                                }}
                                disabled={!isEditing}
                                rows={4}
                                maxLength={500}
                                placeholder="Tell us about yourself..."
                                className={`w-full px-4 py-3 border-2 rounded-lg disabled:bg-gray-50 focus:border-emerald-500 focus:outline-none transition-colors resize-none ${fieldErrors.bio ? 'border-red-500' : 'border-gray-200'}`}
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                {profile?.bio?.length || 0} / 500 characters
                            </p>
                            {isEditing && <FormFieldHint error={fieldErrors.bio} />}
                        </CardContent>
                    </Card>

                    {/* Emergency Contact */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Shield className="w-5 h-5 text-red-600" />
                                <CardTitle>Emergency Contact</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Name</label>
                                    <input
                                        type="text"
                                        value={profile?.emergencyContact?.name || ''}
                                        onChange={(e) => {
                                            setProfile((prev) => prev ? {
                                                ...prev,
                                                emergencyContact: { ...prev.emergencyContact, name: e.target.value }
                                            } : prev)
                                            if (e.target.value) {
                                                const err = validateName(e.target.value, 'Contact name')
                                                setFieldErrors(prev => { const n = {...prev}; if (err) n.ecName = err; else delete n.ecName; return n })
                                            }
                                        }}
                                        onKeyDown={filterNameInput}
                                        disabled={!isEditing}
                                        className={`w-full px-4 py-3 border-2 rounded-lg disabled:bg-gray-50 focus:border-emerald-500 focus:outline-none transition-colors ${fieldErrors.ecName ? 'border-red-500' : 'border-gray-200'}`}
                                    />
                                    {isEditing && <FormFieldHint hint={FORMAT_HINTS.name} error={fieldErrors.ecName} />}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Phone</label>
                                    <input
                                        type="tel"
                                        value={profile?.emergencyContact?.phone || ''}
                                        onChange={(e) => {
                                            setProfile((prev) => prev ? {
                                                ...prev,
                                                emergencyContact: { ...prev.emergencyContact, phone: e.target.value }
                                            } : prev)
                                            if (e.target.value) {
                                                const err = validatePhone(e.target.value, false)
                                                setFieldErrors(prev => { const n = {...prev}; if (err) n.ecPhone = err; else delete n.ecPhone; return n })
                                            }
                                        }}
                                        onKeyDown={filterPhoneInput}
                                        disabled={!isEditing}
                                        className={`w-full px-4 py-3 border-2 rounded-lg disabled:bg-gray-50 focus:border-emerald-500 focus:outline-none transition-colors ${fieldErrors.ecPhone ? 'border-red-500' : 'border-gray-200'}`}
                                    />
                                    {isEditing && <FormFieldHint hint={FORMAT_HINTS.phone} error={fieldErrors.ecPhone} />}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Relationship</label>
                                    <input
                                        type="text"
                                        value={profile?.emergencyContact?.relationship || ''}
                                        onChange={(e) => {
                                            setProfile((prev) => prev ? {
                                                ...prev,
                                                emergencyContact: { ...prev.emergencyContact, relationship: e.target.value }
                                            } : prev)
                                        }}
                                        onKeyDown={filterNameInput}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg disabled:bg-gray-50 focus:border-emerald-500 focus:outline-none transition-colors"
                                    />
                                    {isEditing && <FormFieldHint hint={FORMAT_HINTS.relationship} />}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notification Preferences */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Bell className="w-5 h-5 text-purple-600" />
                                <CardTitle>Notification Preferences</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    { key: 'notifications' as const, label: 'Push Notifications', desc: 'Receive notifications in the app' },
                                    { key: 'emailUpdates' as const, label: 'Email Updates', desc: 'Receive updates via email' },
                                    { key: 'smsReminders' as const, label: 'SMS Reminders', desc: 'Receive class reminders via SMS' }
                                ].map((pref) => (
                                    <div key={pref.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h4 className="font-medium text-gray-900">{pref.label}</h4>
                                            <p className="text-sm text-gray-600 mt-1">{pref.desc}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={profile?.preferences?.[pref.key] || false}
                                                onChange={(e) => setProfile((prev) => prev ? {
                                                    ...prev,
                                                    preferences: { ...prev.preferences, [pref.key]: e.target.checked }
                                                } : prev)}
                                                disabled={!isEditing}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Account Stats Sidebar - right column */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Account Stats</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <p className="text-2xl font-bold text-blue-600">{profile?.stats?.totalClasses || 0}</p>
                                    <p className="text-sm text-gray-600 mt-1">Total Classes</p>
                                </div>
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <p className="text-2xl font-bold text-green-600">{profile?.stats?.completedClasses || 0}</p>
                                    <p className="text-sm text-gray-600 mt-1">Completed</p>
                                </div>
                                <div className="text-center p-4 bg-purple-50 rounded-lg">
                                    <p className="text-2xl font-bold text-purple-600">{profile?.stats?.upcomingClasses || 0}</p>
                                    <p className="text-sm text-gray-600 mt-1">Upcoming</p>
                                </div>
                                <div className="text-center p-4 bg-amber-50 rounded-lg">
                                    <p className="text-2xl font-bold text-amber-600">HK${profile?.stats?.totalSpent || 0}</p>
                                    <p className="text-sm text-gray-600 mt-1">Total Spent</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
