'use client'

import { useState, useEffect, useCallback } from 'react'
import {
    User, Mail, Phone, MapPin, Calendar, Edit, Save,
    Camera, Shield, Settings, Users, X, Loader, AlertCircle, CreditCard
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/services/api/client'
import { useTrackUnsavedChanges } from '@/hooks/useTrackUnsavedChanges'
import { validateName, validatePhone, validateAddress, validateDateOfBirth, filterNameInput, filterPhoneInput, FORMAT_HINTS } from '@/utils/validation'
import { FormFieldHint } from '@/components/ui/FormFieldHint'
import { toast } from 'sonner'

interface UserProfile {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    dateOfBirth: string
    emergencyContact: {
        name: string
        phone: string
        relationship: string
    }
    preferences: {
        notifications: boolean
        emailUpdates: boolean
        smsUpdates: boolean
    }
    profilePicture?: string
    memberSince: string
    childrenCount: number
    totalBookings: number
    status: string
}

const ProfilePage = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
    const { user, isAuthenticated } = useAuth()
    const router = useRouter()

    const isDirty = isEditing && JSON.stringify(editedProfile) !== JSON.stringify(profile)

    const saveForLogout = useCallback(async () => {
        if (!isDirty || !editedProfile) return
        try {
            await apiClient.put('/parent/profile', {
                firstName: editedProfile.firstName,
                lastName: editedProfile.lastName,
                phone: editedProfile.phone,
                address: editedProfile.address,
                dateOfBirth: editedProfile.dateOfBirth,
                emergencyContact: editedProfile.emergencyContact,
                preferences: editedProfile.preferences,
            })
            setProfile(editedProfile)
            setIsEditing(false)
        } catch (err) {
            console.error('Auto-save failed:', err)
        }
    }, [editedProfile, isDirty])

    useTrackUnsavedChanges('parent-profile', 'Parent Profile', isDirty, saveForLogout)

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadProfile()
    }, [isAuthenticated, router])

    const loadProfile = async () => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await apiClient.get<any>('/parent/profile')
            const data = response?.data || response

            if (data) {
                const userProfile: UserProfile = {
                    id: data.id || '',
                    firstName: data.firstName || user?.name?.split(' ')[0] || 'Parent',
                    lastName: data.lastName || user?.name?.split(' ')[1] || 'User',
                    email: data.email || user?.email || '',
                    phone: data.phone || '',
                    address: data.address || '',
                    dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : '',
                    emergencyContact: data.emergencyContact || { name: '', phone: '', relationship: '' },
                    preferences: data.preferences || { notifications: true, emailUpdates: true, smsUpdates: false },
                    memberSince: data.memberSince || new Date().toISOString(),
                    childrenCount: data.childrenCount || 0,
                    totalBookings: data.totalBookings || 0,
                    status: data.status || 'ACTIVE',
                }
                setProfile(userProfile)
                setEditedProfile(userProfile)
            } else {
                const fallback: UserProfile = {
                    id: user?.id || '',
                    firstName: user?.name?.split(' ')[0] || 'Parent',
                    lastName: user?.name?.split(' ')[1] || 'User',
                    email: user?.email || '',
                    phone: '', address: '', dateOfBirth: '',
                    emergencyContact: { name: '', phone: '', relationship: '' },
                    preferences: { notifications: true, emailUpdates: true, smsUpdates: false },
                    memberSince: new Date().toISOString(),
                    childrenCount: 0, totalBookings: 0, status: 'ACTIVE',
                }
                setProfile(fallback)
                setEditedProfile(fallback)
            }
        } catch (err) {
            console.error('Error loading profile:', err)
            setError('Failed to load profile')
            const fallback: UserProfile = {
                id: user?.id || '',
                firstName: user?.name?.split(' ')[0] || 'Parent',
                lastName: user?.name?.split(' ')[1] || 'User',
                email: user?.email || '',
                phone: '', address: '', dateOfBirth: '',
                emergencyContact: { name: '', phone: '', relationship: '' },
                preferences: { notifications: true, emailUpdates: true, smsUpdates: false },
                memberSince: new Date().toISOString(),
                childrenCount: 0, totalBookings: 0, status: 'ACTIVE',
            }
            setProfile(fallback)
            setEditedProfile(fallback)
        } finally {
            setIsLoading(false)
        }
    }

    const handleEdit = () => {
        setSuccessMessage(null)
        setEditedProfile(profile)
        setFieldErrors({})
        setIsEditing(true)
    }

    const handleSave = async () => {
        if (!editedProfile) return
        // Validate all fields before saving
        const errors: Record<string, string> = {}
        const fnErr = validateName(editedProfile.firstName, 'First name')
        if (fnErr) errors.firstName = fnErr
        const lnErr = validateName(editedProfile.lastName, 'Last name')
        if (lnErr) errors.lastName = lnErr
        if (editedProfile.phone) { const pe = validatePhone(editedProfile.phone, false); if (pe) errors.phone = pe }
        if (editedProfile.dateOfBirth) { const de = validateDateOfBirth(editedProfile.dateOfBirth, false); if (de) errors.dateOfBirth = de }
        if (editedProfile.emergencyContact?.name) { const en = validateName(editedProfile.emergencyContact.name, 'Contact name'); if (en) errors['emergencyContact.name'] = en }
        if (editedProfile.emergencyContact?.phone) { const ep = validatePhone(editedProfile.emergencyContact.phone, false); if (ep) errors['emergencyContact.phone'] = ep }
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors)
            setError('Please fix the validation errors before saving.')
            return
        }
        try {
            setIsSaving(true)
            setError(null)
            setSuccessMessage(null)
            await apiClient.put('/parent/profile', {
                firstName: editedProfile.firstName,
                lastName: editedProfile.lastName,
                phone: editedProfile.phone,
                address: editedProfile.address,
                dateOfBirth: editedProfile.dateOfBirth,
                emergencyContact: editedProfile.emergencyContact,
                preferences: editedProfile.preferences,
            })
            setProfile(editedProfile)
            setIsEditing(false)
            setFieldErrors({})
            setSuccessMessage('Profile updated successfully!')
            toast.success('Profile updated successfully!')
            setTimeout(() => setSuccessMessage(null), 5000)
        } catch (err) {
            console.error('Error saving profile:', err)
            setError('Failed to save profile')
            toast.error('Failed to save profile')
        } finally {
            setIsSaving(false)
        }
    }

    const handleCancel = () => {
        setEditedProfile(profile)
        setIsEditing(false)
        setFieldErrors({})
        setError(null)
    }

    const validateField = (field: string, value: string): string | null => {
        switch (field) {
            case 'firstName': return validateName(value, 'First name')
            case 'lastName': return validateName(value, 'Last name')
            case 'phone': return validatePhone(value, false)
            case 'address': return value ? validateAddress(value) : null
            case 'dateOfBirth': return validateDateOfBirth(value, false)
            case 'emergencyContact.name': return value ? validateName(value, 'Contact name') : null
            case 'emergencyContact.phone': return validatePhone(value, false)
            case 'emergencyContact.relationship': return value ? validateName(value, 'Relationship') : null
            default: return null
        }
    }

    const handleInputChange = (field: string, value: string | boolean) => {
        if (!editedProfile) return

        // Real-time validation for string fields
        if (typeof value === 'string') {
            const error = validateField(field, value)
            setFieldErrors(prev => {
                const next = { ...prev }
                if (error) next[field] = error
                else delete next[field]
                return next
            })
        }

        if (field.includes('.')) {
            const [parent, child] = field.split('.')
            const parentValue = editedProfile[parent as keyof UserProfile]
            if (typeof parentValue === 'object' && parentValue !== null) {
                setEditedProfile({
                    ...editedProfile,
                    [parent]: { ...(parentValue as Record<string, any>), [child]: value }
                })
            }
        } else {
            setEditedProfile({ ...editedProfile, [field]: value })
        }
    }

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        } catch { return dateStr }
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2"><div className="h-96 bg-gray-200 rounded-lg"></div></div>
                        <div className="h-96 bg-gray-200 rounded-lg"></div>
                    </div>
                </div>
            </div>
        )
    }

    if (!profile) return null

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Profile</h1>
                    <p className="text-sm md:text-base text-gray-600">Manage your account information and preferences</p>
                </div>
                <Button id="btn-edit-parent-profile" onClick={handleEdit} className="flex items-center gap-2">
                    <Edit className="w-4 h-4" />
                    Edit Profile
                </Button>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            {successMessage && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                    <Save className="w-4 h-4 text-green-600" />
                    <p className="text-sm text-green-700">{successMessage}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Profile Information */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5" /> Basic Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                    <p className="text-gray-900">{profile.firstName}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                    <p className="text-gray-900">{profile.lastName}</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    <p className="text-gray-900">{profile.email}</p>
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Verified</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <p className="text-gray-900">{profile.phone || 'Not set'}</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <div className="flex items-start gap-2">
                                    <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                                    <p className="text-gray-900">{profile.address || 'Not set'}</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <p className="text-gray-900">{profile.dateOfBirth ? formatDate(profile.dateOfBirth) : 'Not set'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Emergency Contact */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="w-5 h-5" /> Emergency Contact
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                                    <p className="text-gray-900">{profile.emergencyContact.name || 'Not set'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                                    <p className="text-gray-900">{profile.emergencyContact.relationship || 'Not set'}</p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <p className="text-gray-900">{profile.emergencyContact.phone || 'Not set'}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Preferences */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="w-5 h-5" /> Preferences
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                { key: 'notifications', label: 'Push Notifications', desc: 'Receive notifications about bookings and updates' },
                                { key: 'emailUpdates', label: 'Email Updates', desc: 'Receive email updates about programs and events' },
                                { key: 'smsUpdates', label: 'SMS Updates', desc: 'Receive SMS notifications for urgent updates' },
                            ].map((pref) => (
                                <div key={pref.key} className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900">{pref.label}</p>
                                        <p className="text-sm text-gray-600">{pref.desc}</p>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded ${(profile.preferences as any)?.[pref.key] ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                        {(profile.preferences as any)?.[pref.key] ? 'On' : 'Off'}
                                    </span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Profile Picture */}
                    <Card>
                        <CardContent className="p-6 text-center">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <User className="w-12 h-12 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {profile.firstName} {profile.lastName}
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">Parent Account</p>
                            <Button id="parent-profile-change-photo-btn" variant="outline" size="sm" className="flex items-center gap-2 mx-auto"
                                onClick={handleEdit}>
                                <Camera className="w-4 h-4" /> Change Photo
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Account Stats */}
                    <Card>
                        <CardHeader><CardTitle>Account Summary</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Member Since</span>
                                <span className="text-sm font-medium text-gray-900">{formatDate(profile.memberSince)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Children</span>
                                <span className="text-sm font-medium text-gray-900">{profile.childrenCount}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Total Bookings</span>
                                <span className="text-sm font-medium text-gray-900">{profile.totalBookings}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Account Status</span>
                                <span className={`text-xs px-2 py-1 rounded ${profile.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {profile.status}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <Button id="parent-profile-manage-children-btn" variant="outline" className="w-full justify-start"
                                onClick={() => router.push('/parent/children')}>
                                <Users className="w-4 h-4 mr-2" /> Manage Children
                            </Button>
                            <Button id="parent-profile-payment-history-btn" variant="outline" className="w-full justify-start"
                                onClick={() => router.push('/parent/payments')}>
                                <CreditCard className="w-4 h-4 mr-2" /> Payment History
                            </Button>
                            <Button id="parent-profile-book-class-btn" variant="outline" className="w-full justify-start"
                                onClick={() => router.push('/parent/browse-classes')}>
                                <Calendar className="w-4 h-4 mr-2" /> Book New Class
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Edit Profile Drawer */}
            <SlideInDrawer
                isOpen={isEditing}
                onClose={handleCancel}
                title="Edit Profile"
                description="Update your personal information, emergency contact, and preferences"
                size="lg"
            >
                <form
                    onSubmit={(e) => { e.preventDefault(); handleSave() }}
                    className="space-y-5"
                >
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Basic Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                <input type="text" value={editedProfile?.firstName || ''} onChange={(e) => handleInputChange('firstName', e.target.value)} onKeyDown={filterNameInput} required
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors.firstName ? 'border-red-500' : 'border-gray-300'}`} />
                                <FormFieldHint hint={FORMAT_HINTS.firstName} error={fieldErrors.firstName} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                <input type="text" value={editedProfile?.lastName || ''} onChange={(e) => handleInputChange('lastName', e.target.value)} onKeyDown={filterNameInput} required
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors.lastName ? 'border-red-500' : 'border-gray-300'}`} />
                                <FormFieldHint hint={FORMAT_HINTS.lastName} error={fieldErrors.lastName} />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input type="tel" value={editedProfile?.phone || ''} onChange={(e) => handleInputChange('phone', e.target.value)} onKeyDown={filterPhoneInput}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors.phone ? 'border-red-500' : 'border-gray-300'}`} />
                        <FormFieldHint hint={FORMAT_HINTS.phone} error={fieldErrors.phone} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <textarea value={editedProfile?.address || ''} onChange={(e) => handleInputChange('address', e.target.value)} rows={3}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors.address ? 'border-red-500' : 'border-gray-300'}`} />
                        <FormFieldHint hint={FORMAT_HINTS.address} error={fieldErrors.address} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                        <input type="date" value={editedProfile?.dateOfBirth || ''} onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors.dateOfBirth ? 'border-red-500' : 'border-gray-300'}`} />
                        <FormFieldHint hint={FORMAT_HINTS.dateOfBirth} error={fieldErrors.dateOfBirth} />
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Emergency Contact</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input type="text" value={editedProfile?.emergencyContact.name || ''} onChange={(e) => handleInputChange('emergencyContact.name', e.target.value)} onKeyDown={filterNameInput}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors['emergencyContact.name'] ? 'border-red-500' : 'border-gray-300'}`} />
                                <FormFieldHint hint={FORMAT_HINTS.name} error={fieldErrors['emergencyContact.name']} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                                <input type="text" value={editedProfile?.emergencyContact.relationship || ''} onChange={(e) => handleInputChange('emergencyContact.relationship', e.target.value)} onKeyDown={filterNameInput}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors['emergencyContact.relationship'] ? 'border-red-500' : 'border-gray-300'}`} />
                                <FormFieldHint hint={FORMAT_HINTS.relationship} error={fieldErrors['emergencyContact.relationship']} />
                            </div>
                        </div>
                        <div className="mt-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input type="tel" value={editedProfile?.emergencyContact.phone || ''} onChange={(e) => handleInputChange('emergencyContact.phone', e.target.value)} onKeyDown={filterPhoneInput}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors['emergencyContact.phone'] ? 'border-red-500' : 'border-gray-300'}`} />
                            <FormFieldHint hint={FORMAT_HINTS.phone} error={fieldErrors['emergencyContact.phone']} />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Preferences</h4>
                        <div className="space-y-3">
                            {[
                                { key: 'notifications', label: 'Push Notifications' },
                                { key: 'emailUpdates', label: 'Email Updates' },
                                { key: 'smsUpdates', label: 'SMS Updates' },
                            ].map(pref => (
                                <label key={pref.key} className="flex items-center justify-between cursor-pointer">
                                    <span className="text-sm text-gray-700">{pref.label}</span>
                                    <input
                                        type="checkbox"
                                        checked={(editedProfile?.preferences as any)?.[pref.key] || false}
                                        onChange={(e) => handleInputChange(`preferences.${pref.key}`, e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <Button type="button" variant="outline" onClick={handleCancel} disabled={isSaving}>
                            <X className="w-4 h-4 mr-2" /> Cancel
                        </Button>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? (<><Loader className="w-4 h-4 mr-2 animate-spin" /> Saving...</>) : (<><Save className="w-4 h-4 mr-2" /> Save Changes</>)}
                        </Button>
                    </div>
                </form>
            </SlideInDrawer>
        </div>
    )
}

export default ProfilePage
