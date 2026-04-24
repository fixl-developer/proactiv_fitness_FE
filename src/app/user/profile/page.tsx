'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Calendar, Save, Edit, X, CheckCircle, Shield, Bell, RefreshCw, BookOpen, CreditCard, CalendarCheck, AlertCircle, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/services/api/client'
import { toast } from 'sonner'
import { useTrackUnsavedChanges } from '@/hooks/useTrackUnsavedChanges'
import {
    validateName,
    validateEmail,
    validatePhone,
    validateDateOfBirth,
    validateTextArea,
    filterNameInput,
    filterPhoneInput,
    FORMAT_HINTS,
} from '@/utils/validation'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'

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
    address: string
    bio: string
    avatar?: string
    emergencyContact: EmergencyContact
    preferences: Preferences
    stats?: ProfileStats
}

function buildEmptyProfile(user: any): ProfileData {
    return {
        firstName: user?.firstName || (user?.name ? user.name.split(' ')[0] : '') || '',
        lastName: user?.lastName || (user?.name ? user.name.split(' ').slice(1).join(' ') : '') || '',
        email: user?.email || '',
        phone: '',
        dateOfBirth: '',
        address: '',
        bio: '',
        emergencyContact: { name: '', phone: '', relationship: '' },
        preferences: { notifications: true, emailUpdates: true, smsReminders: true },
        stats: { totalClasses: 0, completedClasses: 0, upcomingClasses: 0, totalSpent: 0 },
    }
}

function normalizeProfile(raw: any, user: any): ProfileData {
    const base = buildEmptyProfile(user)
    if (!raw || typeof raw !== 'object') return base
    return {
        firstName: raw.firstName ?? base.firstName,
        lastName: raw.lastName ?? base.lastName,
        email: raw.email ?? base.email,
        phone: raw.phone ?? '',
        dateOfBirth: raw.dateOfBirth ?? '',
        address: raw.address ?? '',
        bio: raw.bio ?? '',
        avatar: raw.avatar,
        emergencyContact: {
            name: raw.emergencyContact?.name ?? '',
            phone: raw.emergencyContact?.phone ?? '',
            relationship: raw.emergencyContact?.relationship ?? '',
        },
        preferences: {
            notifications: raw.preferences?.notifications ?? true,
            emailUpdates: raw.preferences?.emailUpdates ?? true,
            smsReminders: raw.preferences?.smsReminders ?? true,
        },
        stats: raw.stats ?? base.stats,
    }
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<ProfileData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [formData, setFormData] = useState<ProfileData | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
    const { isAuthenticated, user } = useAuth()
    const router = useRouter()

    const isDirty = isDrawerOpen && !!profile && !!formData && JSON.stringify(profile) !== JSON.stringify(formData)

    const saveForLogout = useCallback(async () => {
        if (!isDirty || !formData) return
        try {
            await apiClient.put('/user/profile', formData)
            setProfile(formData)
            setIsDrawerOpen(false)
        } catch (err) {
            console.error('Error auto-saving profile on logout:', err)
        }
    }, [formData, isDirty])

    useTrackUnsavedChanges('user-profile', 'User Profile', isDirty, saveForLogout)

    const loadProfile = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await apiClient.get('/user/profile')
            const raw = (response as any)?.data || response
            const data = normalizeProfile(raw, user)
            setProfile(data)
        } catch (err: any) {
            console.error('Error loading profile:', err)
            setError('Failed to load profile. Please try again.')
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

    const handleOpenEdit = () => {
        if (!profile) return
        // Seed the drawer form with a snapshot of the current profile
        setFormData({ ...profile, emergencyContact: { ...profile.emergencyContact }, preferences: { ...profile.preferences } })
        setFieldErrors({})
        setIsDrawerOpen(true)
    }

    const handleCloseDrawer = () => {
        setIsDrawerOpen(false)
        setFormData(null)
        setFieldErrors({})
    }

    const validateAll = (data: ProfileData): Record<string, string> => {
        const errors: Record<string, string> = {}

        const fn = validateName(data.firstName, 'First name')
        if (fn) errors.firstName = fn

        const ln = validateName(data.lastName, 'Last name')
        if (ln) errors.lastName = ln

        const em = validateEmail(data.email)
        if (em) errors.email = em

        if (data.phone) {
            const pe = validatePhone(data.phone, false)
            if (pe) errors.phone = pe
        }

        if (data.dateOfBirth) {
            const de = validateDateOfBirth(data.dateOfBirth, false)
            if (de) errors.dateOfBirth = de
        }

        if (data.address && data.address.trim().length > 0 && data.address.trim().length < 3) {
            errors.address = 'Address must be at least 3 characters'
        }

        if (data.bio) {
            const be = validateTextArea(data.bio, 'Bio', 0, 500)
            if (be) errors.bio = be
        }

        if (data.emergencyContact?.name) {
            const en = validateName(data.emergencyContact.name, 'Contact name')
            if (en) errors.ecName = en
        }

        if (data.emergencyContact?.phone) {
            const ep = validatePhone(data.emergencyContact.phone, false)
            if (ep) errors.ecPhone = ep
        }

        return errors
    }

    const handleSave = async () => {
        if (!formData) return
        const errors = validateAll(formData)
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors)
            toast.error('Please fix the validation errors before saving.')
            return
        }
        setFieldErrors({})
        try {
            setIsSaving(true)
            const response = await apiClient.put('/user/profile', formData)
            const raw = (response as any)?.data || response
            // Prefer the server response if it returns the updated profile, else fall back to formData
            const updated = raw && typeof raw === 'object' && raw.firstName
                ? normalizeProfile(raw, user)
                : formData
            setProfile(updated)
            setSaveSuccess(true)
            setIsDrawerOpen(false)
            setFormData(null)
            toast.success('Profile saved successfully!')
        } catch (err: any) {
            console.error('Error saving profile:', err)
            const msg = err?.response?.data?.message || err?.message || 'Failed to save profile. Please try again.'
            setFieldErrors((prev) => ({ ...prev, _submit: msg }))
            toast.error(msg)
        } finally {
            setIsSaving(false)
        }
    }

    const updateForm = <K extends keyof ProfileData>(key: K, value: ProfileData[K]) => {
        setFormData((prev) => (prev ? { ...prev, [key]: value } : prev))
    }

    const updateEmergency = (key: keyof EmergencyContact, value: string) => {
        setFormData((prev) => (prev ? { ...prev, emergencyContact: { ...prev.emergencyContact, [key]: value } } : prev))
    }

    const updatePreference = (key: keyof Preferences, value: boolean) => {
        setFormData((prev) => (prev ? { ...prev, preferences: { ...prev.preferences, [key]: value } } : prev))
    }

    const calculateProfileCompletion = () => {
        if (!profile) return 0
        const fields = [
            profile.firstName,
            profile.lastName,
            profile.email,
            profile.phone,
            profile.dateOfBirth,
            profile.address,
            profile.bio,
            profile.emergencyContact?.name,
            profile.emergencyContact?.phone,
        ]
        const completed = fields.filter((f) => f && f.length > 0).length
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

    // Empty state (no profile at all)
    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <User className="w-12 h-12 text-gray-300" />
                <h2 className="text-xl font-semibold text-gray-900">No profile data</h2>
                <p className="text-gray-600">Start by creating your profile.</p>
                <Button onClick={loadProfile}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reload
                </Button>
            </div>
        )
    }

    const profileCompletion = calculateProfileCompletion()

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Profile</h1>
                    <p className="text-sm md:text-base text-gray-600 mt-2">Manage your personal information</p>
                </div>
                <Button id="user-profile-edit-btn" onClick={handleOpenEdit}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                </Button>
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                                    {profile.avatar ? (
                                        <img
                                            src={profile.avatar}
                                            alt="Avatar"
                                            className="w-24 h-24 rounded-full object-cover border-4 border-emerald-200"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-3xl font-bold border-4 border-emerald-200">
                                            {profile.firstName?.[0]}{profile.lastName?.[0]}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900">
                                        {profile.firstName} {profile.lastName}
                                    </h3>
                                    <p className="text-gray-600 mt-1">{profile.email}</p>
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

                    {/* Personal Information (Read-only view) */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <User className="w-5 h-5 text-blue-600" />
                                <CardTitle>Personal Information</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 mb-1">First Name</p>
                                    <p className="text-gray-900">{profile.firstName || <span className="text-gray-400 italic">Not set</span>}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 mb-1">Last Name</p>
                                    <p className="text-gray-900">{profile.lastName || <span className="text-gray-400 italic">Not set</span>}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1"><Mail className="w-3 h-3" /> Email</p>
                                    <p className="text-gray-900">{profile.email || <span className="text-gray-400 italic">Not set</span>}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1"><Phone className="w-3 h-3" /> Phone</p>
                                    <p className="text-gray-900">{profile.phone || <span className="text-gray-400 italic">Not set</span>}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Date of Birth</p>
                                    <p className="text-gray-900">{profile.dateOfBirth || <span className="text-gray-400 italic">Not set</span>}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Address</p>
                                    <p className="text-gray-900">{profile.address || <span className="text-gray-400 italic">Not set</span>}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bio (read-only) */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Bio</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {profile.bio ? (
                                <p className="text-gray-800 whitespace-pre-wrap">{profile.bio}</p>
                            ) : (
                                <p className="text-gray-400 italic">No bio yet.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Emergency Contact (read-only) */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Shield className="w-5 h-5 text-red-600" />
                                <CardTitle>Emergency Contact</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 mb-1">Name</p>
                                    <p className="text-gray-900">{profile.emergencyContact?.name || <span className="text-gray-400 italic">Not set</span>}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 mb-1">Phone</p>
                                    <p className="text-gray-900">{profile.emergencyContact?.phone || <span className="text-gray-400 italic">Not set</span>}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 mb-1">Relationship</p>
                                    <p className="text-gray-900">{profile.emergencyContact?.relationship || <span className="text-gray-400 italic">Not set</span>}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notification Preferences (read-only display) */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Bell className="w-5 h-5 text-purple-600" />
                                <CardTitle>Notification Preferences</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {[
                                    { key: 'notifications' as const, label: 'Push Notifications' },
                                    { key: 'emailUpdates' as const, label: 'Email Updates' },
                                    { key: 'smsReminders' as const, label: 'SMS Reminders' },
                                ].map((pref) => (
                                    <div key={pref.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-gray-800">{pref.label}</span>
                                        <Badge className={profile.preferences?.[pref.key] ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'}>
                                            {profile.preferences?.[pref.key] ? 'On' : 'Off'}
                                        </Badge>
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
                                    <p className="text-2xl font-bold text-blue-600">{profile.stats?.totalClasses || 0}</p>
                                    <p className="text-sm text-gray-600 mt-1">Total Classes</p>
                                </div>
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <p className="text-2xl font-bold text-green-600">{profile.stats?.completedClasses || 0}</p>
                                    <p className="text-sm text-gray-600 mt-1">Completed</p>
                                </div>
                                <div className="text-center p-4 bg-purple-50 rounded-lg">
                                    <p className="text-2xl font-bold text-purple-600">{profile.stats?.upcomingClasses || 0}</p>
                                    <p className="text-sm text-gray-600 mt-1">Upcoming</p>
                                </div>
                                <div className="text-center p-4 bg-amber-50 rounded-lg">
                                    <p className="text-2xl font-bold text-amber-600">HK${profile.stats?.totalSpent || 0}</p>
                                    <p className="text-sm text-gray-600 mt-1">Total Spent</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Edit Profile Drawer */}
            <SlideInDrawer
                isOpen={isDrawerOpen}
                onClose={handleCloseDrawer}
                title="Edit Profile"
                description="Update your personal information"
                size="lg"
                footer={
                    <div className="flex items-center justify-end gap-2">
                        <Button id="user-profile-cancel-edit-btn" variant="outline" onClick={handleCloseDrawer} disabled={isSaving}>
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
                }
            >
                {formData && (
                    <div className="space-y-5">
                        {fieldErrors._submit && (
                            <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                                <p className="text-sm text-red-700">{fieldErrors._submit}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="profile-firstName" className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-1">
                                    <User className="w-4 h-4" /> First Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="profile-firstName"
                                    type="text"
                                    value={formData.firstName}
                                    onChange={(e) => updateForm('firstName', e.target.value)}
                                    onKeyDown={filterNameInput}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:border-emerald-500 ${fieldErrors.firstName ? 'border-red-500' : 'border-gray-200'}`}
                                />
                                <p className="text-xs text-gray-500 mt-1">{FORMAT_HINTS.firstName}</p>
                                {fieldErrors.firstName && <p className="text-xs text-red-600 mt-1">{fieldErrors.firstName}</p>}
                            </div>

                            <div>
                                <label htmlFor="profile-lastName" className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-1">
                                    <User className="w-4 h-4" /> Last Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="profile-lastName"
                                    type="text"
                                    value={formData.lastName}
                                    onChange={(e) => updateForm('lastName', e.target.value)}
                                    onKeyDown={filterNameInput}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:border-emerald-500 ${fieldErrors.lastName ? 'border-red-500' : 'border-gray-200'}`}
                                />
                                <p className="text-xs text-gray-500 mt-1">{FORMAT_HINTS.lastName}</p>
                                {fieldErrors.lastName && <p className="text-xs text-red-600 mt-1">{fieldErrors.lastName}</p>}
                            </div>

                            <div>
                                <label htmlFor="profile-email" className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-1">
                                    <Mail className="w-4 h-4" /> Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="profile-email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => updateForm('email', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:border-emerald-500 ${fieldErrors.email ? 'border-red-500' : 'border-gray-200'}`}
                                />
                                <p className="text-xs text-gray-500 mt-1">{FORMAT_HINTS.email}</p>
                                {fieldErrors.email && <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>}
                            </div>

                            <div>
                                <label htmlFor="profile-phone" className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-1">
                                    <Phone className="w-4 h-4" /> Phone
                                </label>
                                <input
                                    id="profile-phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => updateForm('phone', e.target.value)}
                                    onKeyDown={filterPhoneInput}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:border-emerald-500 ${fieldErrors.phone ? 'border-red-500' : 'border-gray-200'}`}
                                />
                                <p className="text-xs text-gray-500 mt-1">{FORMAT_HINTS.phone}</p>
                                {fieldErrors.phone && <p className="text-xs text-red-600 mt-1">{fieldErrors.phone}</p>}
                            </div>

                            <div>
                                <label htmlFor="profile-dob" className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-1">
                                    <Calendar className="w-4 h-4" /> Date of Birth
                                </label>
                                <input
                                    id="profile-dob"
                                    type="date"
                                    value={formData.dateOfBirth}
                                    onChange={(e) => updateForm('dateOfBirth', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:border-emerald-500 ${fieldErrors.dateOfBirth ? 'border-red-500' : 'border-gray-200'}`}
                                />
                                {fieldErrors.dateOfBirth && <p className="text-xs text-red-600 mt-1">{fieldErrors.dateOfBirth}</p>}
                            </div>

                            <div>
                                <label htmlFor="profile-address" className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-1">
                                    <MapPin className="w-4 h-4" /> Address
                                </label>
                                <input
                                    id="profile-address"
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => updateForm('address', e.target.value)}
                                    placeholder="Street, City, Country"
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:border-emerald-500 ${fieldErrors.address ? 'border-red-500' : 'border-gray-200'}`}
                                />
                                {fieldErrors.address && <p className="text-xs text-red-600 mt-1">{fieldErrors.address}</p>}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="profile-bio" className="text-sm font-medium text-gray-700 mb-1 block">Bio</label>
                            <textarea
                                id="profile-bio"
                                value={formData.bio}
                                onChange={(e) => updateForm('bio', e.target.value)}
                                rows={4}
                                maxLength={500}
                                placeholder="Tell us about yourself..."
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:border-emerald-500 resize-none ${fieldErrors.bio ? 'border-red-500' : 'border-gray-200'}`}
                            />
                            <p className="text-xs text-gray-500 mt-1">{formData.bio?.length || 0} / 500 characters</p>
                            {fieldErrors.bio && <p className="text-xs text-red-600 mt-1">{fieldErrors.bio}</p>}
                        </div>

                        {/* Emergency Contact */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1 mb-2">
                                <Shield className="w-4 h-4 text-red-600" /> Emergency Contact
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                    <label htmlFor="profile-ecName" className="text-xs font-medium text-gray-600 mb-1 block">Name</label>
                                    <input
                                        id="profile-ecName"
                                        type="text"
                                        value={formData.emergencyContact.name}
                                        onChange={(e) => updateEmergency('name', e.target.value)}
                                        onKeyDown={filterNameInput}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:border-emerald-500 ${fieldErrors.ecName ? 'border-red-500' : 'border-gray-200'}`}
                                    />
                                    {fieldErrors.ecName && <p className="text-xs text-red-600 mt-1">{fieldErrors.ecName}</p>}
                                </div>
                                <div>
                                    <label htmlFor="profile-ecPhone" className="text-xs font-medium text-gray-600 mb-1 block">Phone</label>
                                    <input
                                        id="profile-ecPhone"
                                        type="tel"
                                        value={formData.emergencyContact.phone}
                                        onChange={(e) => updateEmergency('phone', e.target.value)}
                                        onKeyDown={filterPhoneInput}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:border-emerald-500 ${fieldErrors.ecPhone ? 'border-red-500' : 'border-gray-200'}`}
                                    />
                                    {fieldErrors.ecPhone && <p className="text-xs text-red-600 mt-1">{fieldErrors.ecPhone}</p>}
                                </div>
                                <div>
                                    <label htmlFor="profile-ecRelationship" className="text-xs font-medium text-gray-600 mb-1 block">Relationship</label>
                                    <input
                                        id="profile-ecRelationship"
                                        type="text"
                                        value={formData.emergencyContact.relationship}
                                        onChange={(e) => updateEmergency('relationship', e.target.value)}
                                        onKeyDown={filterNameInput}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Notification Preferences */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1 mb-2">
                                <Bell className="w-4 h-4 text-purple-600" /> Notification Preferences
                            </h3>
                            <div className="space-y-2">
                                {[
                                    { key: 'notifications' as const, label: 'Push Notifications', desc: 'Receive notifications in the app' },
                                    { key: 'emailUpdates' as const, label: 'Email Updates', desc: 'Receive updates via email' },
                                    { key: 'smsReminders' as const, label: 'SMS Reminders', desc: 'Receive class reminders via SMS' },
                                ].map((pref) => (
                                    <div key={pref.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{pref.label}</p>
                                            <p className="text-xs text-gray-500">{pref.desc}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.preferences[pref.key]}
                                                onChange={(e) => updatePreference(pref.key, e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </SlideInDrawer>
        </div>
    )
}
