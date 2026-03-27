'use client'

import { useState, useEffect, useCallback } from 'react'
import {
    User, Mail, Phone, MapPin, Calendar, Edit, Save,
    Camera, Shield, Settings, Users, X, Loader, AlertCircle, CreditCard
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/services/api/client'
import { useTrackUnsavedChanges } from '@/hooks/useTrackUnsavedChanges'

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
    const [isSaving, setIsSaving] = useState(false)
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

    const handleEdit = () => setIsEditing(true)

    const handleSave = async () => {
        if (!editedProfile) return
        try {
            setIsSaving(true)
            setError(null)
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
            console.error('Error saving profile:', err)
            setError('Failed to save profile')
        } finally {
            setIsSaving(false)
        }
    }

    const handleCancel = () => {
        setEditedProfile(profile)
        setIsEditing(false)
    }

    const handleInputChange = (field: string, value: string | boolean) => {
        if (!editedProfile) return
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
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                    <p className="text-gray-600">Manage your account information and preferences</p>
                </div>
                {!isEditing ? (
                    <Button id="btn-edit-parent-profile" onClick={handleEdit} className="flex items-center gap-2">
                        <Edit className="w-4 h-4" />
                        Edit Profile
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Button id="btn-cancel-parent-profile" variant="outline" onClick={handleCancel} className="flex items-center gap-2">
                            <X className="w-4 h-4" /> Cancel
                        </Button>
                        <Button id="btn-save-parent-profile" onClick={handleSave} disabled={isSaving} className="flex items-center gap-2">
                            {isSaving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                )}
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <p className="text-sm text-red-700">{error}</p>
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
                                    {isEditing ? (
                                        <input type="text" value={editedProfile?.firstName || ''} onChange={(e) => handleInputChange('firstName', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    ) : (
                                        <p className="text-gray-900">{profile.firstName}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                    {isEditing ? (
                                        <input type="text" value={editedProfile?.lastName || ''} onChange={(e) => handleInputChange('lastName', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    ) : (
                                        <p className="text-gray-900">{profile.lastName}</p>
                                    )}
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
                                {isEditing ? (
                                    <input type="tel" value={editedProfile?.phone || ''} onChange={(e) => handleInputChange('phone', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <p className="text-gray-900">{profile.phone || 'Not set'}</p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                {isEditing ? (
                                    <textarea value={editedProfile?.address || ''} onChange={(e) => handleInputChange('address', e.target.value)} rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                ) : (
                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                                        <p className="text-gray-900">{profile.address || 'Not set'}</p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                                {isEditing ? (
                                    <input type="date" value={editedProfile?.dateOfBirth || ''} onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <p className="text-gray-900">{profile.dateOfBirth ? formatDate(profile.dateOfBirth) : 'Not set'}</p>
                                    </div>
                                )}
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
                                    {isEditing ? (
                                        <input type="text" value={editedProfile?.emergencyContact.name || ''} onChange={(e) => handleInputChange('emergencyContact.name', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    ) : (
                                        <p className="text-gray-900">{profile.emergencyContact.name || 'Not set'}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                                    {isEditing ? (
                                        <input type="text" value={editedProfile?.emergencyContact.relationship || ''} onChange={(e) => handleInputChange('emergencyContact.relationship', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    ) : (
                                        <p className="text-gray-900">{profile.emergencyContact.relationship || 'Not set'}</p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                {isEditing ? (
                                    <input type="tel" value={editedProfile?.emergencyContact.phone || ''} onChange={(e) => handleInputChange('emergencyContact.phone', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                ) : (
                                    <p className="text-gray-900">{profile.emergencyContact.phone || 'Not set'}</p>
                                )}
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
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={isEditing
                                                ? (editedProfile?.preferences as any)?.[pref.key]
                                                : (profile.preferences as any)?.[pref.key]}
                                            onChange={(e) => handleInputChange(`preferences.${pref.key}`, e.target.checked)}
                                            disabled={!isEditing}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
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
                                onClick={() => alert('Photo upload coming soon')}>
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
        </div>
    )
}

export default ProfilePage
