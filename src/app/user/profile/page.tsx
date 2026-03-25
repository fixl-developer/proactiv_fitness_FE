'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Calendar, Camera, Save, Edit, X, CheckCircle, Shield, Bell, RefreshCw, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import UserProfileService from '@/services/modules/user-profile.service'

export default function ProfilePage() {
    const [profile, setProfile] = useState<any>(null)
    const [originalProfile, setOriginalProfile] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
    const [saveSuccess, setSaveSuccess] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { isAuthenticated, user } = useAuth()
    const router = useRouter()
    const profileService = new UserProfileService()

    const loadProfile = useCallback(async () => {
        try {
            const data = await profileService.getProfile()
            setProfile(data)
            setOriginalProfile(data)
        } catch (err) {
            console.error('Error loading profile:', err)
            // Use auth context as fallback
            if (user) {
                const fallback = {
                    firstName: (user as any)?.firstName || user?.name?.split(' ')[0] || '',
                    lastName: (user as any)?.lastName || user?.name?.split(' ')[1] || '',
                    email: user?.email || '',
                    phone: '',
                    dateOfBirth: '',
                    bio: '',
                    emergencyContact: { name: '', phone: '', relationship: '' },
                    preferences: { notifications: true, emailUpdates: true, smsReminders: true }
                }
                setProfile(fallback)
                setOriginalProfile(fallback)
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

    const handleSave = async () => {
        try {
            setIsSaving(true)
            await profileService.updateProfile(profile)
            setOriginalProfile(profile)
            setIsEditing(false)
            setSaveSuccess(true)
            setTimeout(() => setSaveSuccess(false), 3000)
        } catch (err) {
            console.error('Error saving:', err)
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

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Preview
        const reader = new FileReader()
        reader.onloadend = () => {
            setAvatarPreview(reader.result as string)
        }
        reader.readAsDataURL(file)

        // Upload to backend
        try {
            setIsUploadingAvatar(true)
            const result = await profileService.uploadAvatar(file)
            if (result?.avatarUrl) {
                setProfile((prev: any) => ({ ...prev, avatar: result.avatarUrl }))
            }
        } catch (err) {
            console.error('Error uploading avatar:', err)
        } finally {
            setIsUploadingAvatar(false)
        }
    }

    const calculateProfileCompletion = () => {
        const fields = [
            profile?.firstName,
            profile?.lastName,
            profile?.email,
            profile?.phone,
            profile?.dateOfBirth,
            profile?.bio,
            profile?.emergencyContact?.name,
            profile?.emergencyContact?.phone
        ]
        const completed = fields.filter(f => f && f.length > 0).length
        return Math.round((completed / fields.length) * 100)
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>)}
                </div>
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
                            {isUploadingAvatar && (
                                <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center">
                                    <RefreshCw className="w-6 h-6 text-white animate-spin" />
                                </div>
                            )}
                            {isEditing && (
                                <button id="user-profile-avatar-upload-btn"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white hover:bg-emerald-700 transition-colors shadow-lg"
                                    disabled={isUploadingAvatar}
                                >
                                    <Camera className="w-4 h-4" />
                                </button>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                            />
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
                                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                                disabled={!isEditing}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg disabled:bg-gray-50 focus:border-emerald-500 focus:outline-none transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Last Name
                            </label>
                            <input
                                type="text"
                                value={profile?.lastName || ''}
                                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                                disabled={!isEditing}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg disabled:bg-gray-50 focus:border-emerald-500 focus:outline-none transition-colors"
                            />
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
                                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                disabled={!isEditing}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg disabled:bg-gray-50 focus:border-emerald-500 focus:outline-none transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Date of Birth
                            </label>
                            <input
                                type="date"
                                value={profile?.dateOfBirth || ''}
                                onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                                disabled={!isEditing}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg disabled:bg-gray-50 focus:border-emerald-500 focus:outline-none transition-colors"
                            />
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
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        disabled={!isEditing}
                        rows={4}
                        placeholder="Tell us about yourself..."
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg disabled:bg-gray-50 focus:border-emerald-500 focus:outline-none transition-colors resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                        {profile?.bio?.length || 0} / 500 characters
                    </p>
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
                                onChange={(e) => setProfile({
                                    ...profile,
                                    emergencyContact: { ...profile?.emergencyContact, name: e.target.value }
                                })}
                                disabled={!isEditing}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg disabled:bg-gray-50 focus:border-emerald-500 focus:outline-none transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Phone</label>
                            <input
                                type="tel"
                                value={profile?.emergencyContact?.phone || ''}
                                onChange={(e) => setProfile({
                                    ...profile,
                                    emergencyContact: { ...profile?.emergencyContact, phone: e.target.value }
                                })}
                                disabled={!isEditing}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg disabled:bg-gray-50 focus:border-emerald-500 focus:outline-none transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Relationship</label>
                            <input
                                type="text"
                                value={profile?.emergencyContact?.relationship || ''}
                                onChange={(e) => setProfile({
                                    ...profile,
                                    emergencyContact: { ...profile?.emergencyContact, relationship: e.target.value }
                                })}
                                disabled={!isEditing}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg disabled:bg-gray-50 focus:border-emerald-500 focus:outline-none transition-colors"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Preferences */}
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
                            { key: 'notifications', label: 'Push Notifications', desc: 'Receive notifications in the app' },
                            { key: 'emailUpdates', label: 'Email Updates', desc: 'Receive updates via email' },
                            { key: 'smsReminders', label: 'SMS Reminders', desc: 'Receive class reminders via SMS' }
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
                                        onChange={(e) => setProfile({
                                            ...profile,
                                            preferences: { ...profile?.preferences, [pref.key]: e.target.checked }
                                        })}
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

            {/* Stats Card */}
            {profile?.stats && (
                <Card>
                    <CardHeader>
                        <CardTitle>Account Stats</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <p className="text-2xl font-bold text-blue-600">{profile.stats.totalClasses || 0}</p>
                                <p className="text-sm text-gray-600 mt-1">Total Classes</p>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <p className="text-2xl font-bold text-green-600">{profile.stats.completedClasses || 0}</p>
                                <p className="text-sm text-gray-600 mt-1">Completed</p>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                                <p className="text-2xl font-bold text-purple-600">{profile.stats.upcomingClasses || 0}</p>
                                <p className="text-sm text-gray-600 mt-1">Upcoming</p>
                            </div>
                            <div className="text-center p-4 bg-amber-50 rounded-lg">
                                <p className="text-2xl font-bold text-amber-600">HK${profile.stats.totalSpent || 0}</p>
                                <p className="text-sm text-gray-600 mt-1">Total Spent</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
