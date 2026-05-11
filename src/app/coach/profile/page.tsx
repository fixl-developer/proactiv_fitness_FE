'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    User, Mail, Phone, MapPin, Award, BookOpen, Target,
    Edit2, Save, AlertCircle, CheckCircle, Star, Users,
    X, Plus, Clock, TrendingUp
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { responsiveClasses } from '@/lib/responsiveClasses'
import { useAuth } from '@/contexts/AuthContext'
import { useTrackUnsavedChanges } from '@/hooks/useTrackUnsavedChanges'
import { coachService, CoachProfile, CoachReportData } from '@/services/modules/coach.service'
import { toast } from 'sonner'
import { validateName, validateEmail, validatePhone, validateTextArea, filterNameInput, filterPhoneInput, FORMAT_HINTS } from '@/utils/validation'
import { FormFieldHint } from '@/components/ui/FormFieldHint'

// Empty starting profile — was a hardcoded "Coach Sarah Johnson / Mumbai /
// 4.8 rating / 45 students" placeholder, which leaked into the dashboard
// when the API hadn't responded yet. Real data comes from `/coach/profile`.
const EMPTY_PROFILE: CoachProfile = {
    id: '',
    staffId: '',
    name: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    specializations: [],
    certifications: [],
    skills: [],
    experienceYears: 0,
    rating: 0,
    totalStudents: 0,
    totalClasses: 0,
    status: 'active',
}

// ==================== COMPONENT ====================

const CoachProfilePage = () => {
    const { isAuthenticated, user } = useAuth()
    const [isLoading, setIsLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [profile, setProfile] = useState<CoachProfile>(EMPTY_PROFILE)
    const [editedProfile, setEditedProfile] = useState<CoachProfile>(EMPTY_PROFILE)

    // Inline input states for adding items
    const [newSpecialization, setNewSpecialization] = useState('')
    const [newSkill, setNewSkill] = useState('')
    const [newCertification, setNewCertification] = useState({ name: '', issuingOrganization: '', expiryDate: '' })
    const [showAddCert, setShowAddCert] = useState(false)
    const [goals, setGoals] = useState<string[]>([])
    const [newGoal, setNewGoal] = useState('')
    const [errors, setErrors] = useState<Record<string, string>>({})

    const coachId = user?.id || ''

    // ==================== UNSAVED CHANGES TRACKING ====================

    const isDirty = isEditing && JSON.stringify(editedProfile) !== JSON.stringify(profile)

    const saveForLogout = useCallback(async () => {
        if (!isDirty || !coachId) return

        const locationParts = editedProfile.location.split(',').map(s => s.trim())
        const city = locationParts[0] || ''
        const country = locationParts[1] || ''

        const firstName = editedProfile.firstName || editedProfile.name.split(' ')[0] || ''
        const lastName = editedProfile.lastName || editedProfile.name.split(' ').slice(1).join(' ') || ''

        const updateData = {
            personalInfo: { firstName, lastName },
            contactInfo: {
                email: editedProfile.email,
                phone: editedProfile.phone,
                address: { city, country },
            },
            notes: editedProfile.bio,
            specializations: editedProfile.specializations,
            skills: editedProfile.skills,
        }

        await coachService.updateProfile(coachId, updateData)
        setProfile(editedProfile)
        setIsEditing(false)
    }, [editedProfile, isDirty, coachId, profile])

    useTrackUnsavedChanges('coach-profile', 'Coach Profile', isDirty, saveForLogout)

    // ==================== LOAD PROFILE ====================

    const loadProfile = useCallback(async () => {
        if (!coachId) {
            setIsLoading(false)
            return
        }
        try {
            setIsLoading(true)
            const [profileRes, performanceRes] = await Promise.allSettled([
                coachService.getProfile(coachId),
                coachService.getReportData(coachId, 'performance', 'month')
            ])

            const data = profileRes.status === 'fulfilled' ? profileRes.value : null
            const perfData = performanceRes.status === 'fulfilled' ? performanceRes.value : null

            // Use API data when present; otherwise pre-fill the user's auth
            // identity so the page doesn't sit blank. Real data only — no
            // fabricated locations, ratings, or certifications.
            if (data && (data.name || data.firstName || data.email)) {
                setProfile(data)
                setEditedProfile(data)
            } else {
                const u = user as any
                const seeded: CoachProfile = {
                    ...EMPTY_PROFILE,
                    id: u?.id || '',
                    name: u?.name || '',
                    firstName: u?.firstName || (u?.name?.split(' ')[0] || ''),
                    lastName: u?.lastName || (u?.name?.split(' ').slice(1).join(' ') || ''),
                    email: u?.email || '',
                }
                setProfile(seeded)
                setEditedProfile(seeded)
            }

            // Generate dynamic goals based on performance data
            const dynamicGoals: string[] = []
            if (perfData) {
                const satisfaction = perfData.performanceMetrics?.find(m => m.metric === 'Student Satisfaction')
                const completion = perfData.performanceMetrics?.find(m => m.metric === 'Class Completion Rate')
                const attendance = perfData.avgAttendance

                if (satisfaction && satisfaction.value < 95) {
                    dynamicGoals.push(`Improve student satisfaction from ${satisfaction.value}% to 95%`)
                }
                if (completion && completion.value < 100) {
                    dynamicGoals.push(`Achieve 100% class completion rate (currently ${completion.value}%)`)
                }
                if (attendance && attendance < 95) {
                    dynamicGoals.push(`Boost class attendance to 95% (currently ${attendance}%)`)
                }
                if (data && data.totalStudents > 0) {
                    dynamicGoals.push(`Continue mentoring ${data.totalStudents} active students`)
                }
            }

            // No fake "default" goals when no performance data exists — UI
            // will render an empty-state hint instead.
            setGoals(dynamicGoals)
        } catch (error) {
            console.error('Error loading profile:', error)
            const u = user as any
            const seeded: CoachProfile = {
                ...EMPTY_PROFILE,
                id: u?.id || '',
                name: u?.name || '',
                firstName: u?.firstName || (u?.name?.split(' ')[0] || ''),
                lastName: u?.lastName || (u?.name?.split(' ').slice(1).join(' ') || ''),
                email: u?.email || '',
            }
            setProfile(seeded)
            setEditedProfile(seeded)
            setGoals([])
        } finally {
            setIsLoading(false)
        }
    }, [coachId, user])

    useEffect(() => {
        if (!isAuthenticated && !localStorage.getItem('token')) {
            setIsLoading(false)
            return
        }
        loadProfile()
    }, [isAuthenticated, loadProfile])

    // ==================== SAVE PROFILE ====================

    const validateProfileForm = (): boolean => {
        const newErrors: Record<string, string> = {}
        const fnErr = validateName(editedProfile.firstName, 'First Name')
        if (fnErr) newErrors.firstName = fnErr
        const lnErr = validateName(editedProfile.lastName, 'Last Name')
        if (lnErr) newErrors.lastName = lnErr
        const emErr = validateEmail(editedProfile.email)
        if (emErr) newErrors.email = emErr
        const phErr = validatePhone(editedProfile.phone, false)
        if (phErr) newErrors.phone = phErr
        const bioErr = validateTextArea(editedProfile.bio, 'Bio', 0, 2000)
        if (bioErr) newErrors.bio = bioErr
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSave = async () => {
        if (!coachId) {
            toast.error('User ID not found. Cannot save profile.')
            return
        }

        if (!validateProfileForm()) {
            toast.error('Please fix the validation errors before saving.')
            return
        }

        try {
            setIsSaving(true)

            // Parse location into city/country
            const locationParts = editedProfile.location.split(',').map(s => s.trim())
            const city = locationParts[0] || ''
            const country = locationParts[1] || ''

            // Parse name into first/last
            const firstName = editedProfile.firstName || editedProfile.name.split(' ')[0] || ''
            const lastName = editedProfile.lastName || editedProfile.name.split(' ').slice(1).join(' ') || ''

            const updateData = {
                personalInfo: { firstName, lastName },
                contactInfo: {
                    email: editedProfile.email,
                    phone: editedProfile.phone,
                    address: { city, country },
                },
                notes: editedProfile.bio,
                specializations: editedProfile.specializations,
                skills: editedProfile.skills,
            }

            await coachService.updateProfile(coachId, updateData)

            // Update local state on success
            const updatedProfile = {
                ...editedProfile,
                firstName,
                lastName,
                name: `${firstName} ${lastName}`.trim(),
            }
            setProfile(updatedProfile)
            setEditedProfile(updatedProfile)
            setIsEditing(false)
            toast.success('Profile updated successfully!')
        } catch (error) {
            console.error('Error saving profile:', error)
            toast.error('Failed to save profile. Please try again.')
        } finally {
            setIsSaving(false)
        }
    }

    // ==================== CANCEL EDITS ====================

    const handleCancel = () => {
        setEditedProfile(profile)
        setIsEditing(false)
        setNewSpecialization('')
        setNewSkill('')
        setNewCertification({ name: '', issuingOrganization: '', expiryDate: '' })
        setShowAddCert(false)
    }

    // ==================== SPECIALIZATION HELPERS ====================

    const addSpecialization = () => {
        const value = newSpecialization.trim()
        if (!value) return
        if (editedProfile.specializations.includes(value)) {
            toast.error('Specialization already exists')
            return
        }
        setEditedProfile(prev => ({
            ...prev,
            specializations: [...prev.specializations, value],
        }))
        setNewSpecialization('')
    }

    const removeSpecialization = (index: number) => {
        setEditedProfile(prev => ({
            ...prev,
            specializations: prev.specializations.filter((_, i) => i !== index),
        }))
    }

    // ==================== SKILL HELPERS ====================

    const addSkill = () => {
        const value = newSkill.trim()
        if (!value) return
        if (editedProfile.skills.includes(value)) {
            toast.error('Skill already exists')
            return
        }
        setEditedProfile(prev => ({
            ...prev,
            skills: [...prev.skills, value],
        }))
        setNewSkill('')
    }

    const removeSkill = (index: number) => {
        setEditedProfile(prev => ({
            ...prev,
            skills: prev.skills.filter((_, i) => i !== index),
        }))
    }

    // ==================== CERTIFICATION HELPERS ====================

    const addCertification = () => {
        const name = newCertification.name.trim()
        if (!name) return
        if (editedProfile.certifications.some(c => c.name === name)) {
            toast.error('Certification already exists')
            return
        }
        setEditedProfile(prev => ({
            ...prev,
            certifications: [
                ...prev.certifications,
                {
                    name,
                    status: 'valid',
                    issuingOrganization: newCertification.issuingOrganization.trim(),
                    expiryDate: newCertification.expiryDate,
                },
            ],
        }))
        setNewCertification({ name: '', issuingOrganization: '', expiryDate: '' })
        setShowAddCert(false)
    }

    const removeCertification = (index: number) => {
        setEditedProfile(prev => ({
            ...prev,
            certifications: prev.certifications.filter((_, i) => i !== index),
        }))
    }

    // ==================== LOADING STATE ====================

    if (isLoading) {
        return (
            <div className={responsiveClasses.pageContainer}>
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-96 bg-gray-200 rounded-lg"></div>
                </div>
            </div>
        )
    }

    // Decide which data to display: edited when editing, profile when viewing
    const displayProfile = isEditing ? editedProfile : profile

    // ==================== RENDER ====================

    return (
        <div className={responsiveClasses.pageContainer}>
            {/* Header */}
            <div className={responsiveClasses.headerContainer}>
                <div>
                    <h1 className={responsiveClasses.headerTitle}>Coach Profile</h1>
                    <p className={responsiveClasses.headerSubtitle}>
                        Manage your coaching profile and credentials
                    </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    {isEditing && (
                        <Button id="coach-profile-cancel-btn"
                            variant="outline"
                            onClick={handleCancel}
                            disabled={isSaving}
                            className="w-full sm:w-auto"
                        >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                        </Button>
                    )}
                    <Button id="coach-profile-edit-save-btn"
                        onClick={() => {
                            if (isEditing) {
                                handleSave()
                            } else {
                                setIsEditing(true)
                                setEditedProfile(profile)
                            }
                        }}
                        disabled={isSaving}
                        className="w-full sm:w-auto"
                    >
                        {isEditing ? (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </>
                        ) : (
                            <>
                                <Edit2 className="w-4 h-4 mr-2" />
                                Edit Profile
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Profile Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Profile */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5 text-blue-600" />
                                Personal Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* First Name & Last Name */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        First Name
                                    </label>
                                    {isEditing ? (
                                        <>
                                        <Input
                                            value={editedProfile.firstName}
                                            onKeyDown={filterNameInput}
                                            onChange={(e) => {
                                                setEditedProfile({
                                                    ...editedProfile,
                                                    firstName: e.target.value,
                                                    name: `${e.target.value} ${editedProfile.lastName}`.trim(),
                                                })
                                                const err = validateName(e.target.value, 'First Name')
                                                setErrors(prev => { const n = { ...prev }; if (err) n.firstName = err; else delete n.firstName; return n })
                                            }}
                                            placeholder="First name"
                                            className={errors.firstName ? 'border-red-500' : ''}
                                        />
                                        <FormFieldHint hint={FORMAT_HINTS.firstName} error={errors.firstName} />
                                        </>
                                    ) : (
                                        <p className="text-gray-900 font-medium flex items-center gap-2">
                                            <User className="w-4 h-4 text-gray-400" />
                                            {displayProfile.firstName || displayProfile.name.split(' ')[0] || '-'}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Last Name
                                    </label>
                                    {isEditing ? (
                                        <>
                                        <Input
                                            value={editedProfile.lastName}
                                            onKeyDown={filterNameInput}
                                            onChange={(e) => {
                                                setEditedProfile({
                                                    ...editedProfile,
                                                    lastName: e.target.value,
                                                    name: `${editedProfile.firstName} ${e.target.value}`.trim(),
                                                })
                                                const err = validateName(e.target.value, 'Last Name')
                                                setErrors(prev => { const n = { ...prev }; if (err) n.lastName = err; else delete n.lastName; return n })
                                            }}
                                            placeholder="Last name"
                                            className={errors.lastName ? 'border-red-500' : ''}
                                        />
                                        <FormFieldHint hint={FORMAT_HINTS.lastName} error={errors.lastName} />
                                        </>
                                    ) : (
                                        <p className="text-gray-900 font-medium">
                                            {displayProfile.lastName || displayProfile.name.split(' ').slice(1).join(' ') || '-'}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                {isEditing ? (
                                    <>
                                    <Input
                                        type="email"
                                        value={editedProfile.email}
                                        onChange={(e) => {
                                            setEditedProfile({ ...editedProfile, email: e.target.value })
                                            const err = validateEmail(e.target.value)
                                            setErrors(prev => { const n = { ...prev }; if (err) n.email = err; else delete n.email; return n })
                                        }}
                                        placeholder="email@example.com"
                                        className={errors.email ? 'border-red-500' : ''}
                                    />
                                    <FormFieldHint hint={FORMAT_HINTS.email} error={errors.email} />
                                    </>
                                ) : (
                                    <p className="text-gray-900 font-medium flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        {displayProfile.email || '-'}
                                    </p>
                                )}
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number
                                </label>
                                {isEditing ? (
                                    <>
                                    <Input
                                        value={editedProfile.phone}
                                        onKeyDown={filterPhoneInput}
                                        onChange={(e) => {
                                            setEditedProfile({ ...editedProfile, phone: e.target.value })
                                            const err = validatePhone(e.target.value, false)
                                            setErrors(prev => { const n = { ...prev }; if (err) n.phone = err; else delete n.phone; return n })
                                        }}
                                        placeholder="+91-0000000000"
                                        className={errors.phone ? 'border-red-500' : ''}
                                    />
                                    <FormFieldHint hint={FORMAT_HINTS.phone} error={errors.phone} />
                                    </>
                                ) : (
                                    <p className="text-gray-900 font-medium flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        {displayProfile.phone || '-'}
                                    </p>
                                )}
                            </div>

                            {/* Location */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Location
                                </label>
                                {isEditing ? (
                                    <Input
                                        value={editedProfile.location}
                                        onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })}
                                        placeholder="City, Country"
                                    />
                                ) : (
                                    <p className="text-gray-900 font-medium flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        {displayProfile.location || '-'}
                                    </p>
                                )}
                            </div>

                            {/* Bio */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Professional Bio
                                </label>
                                {isEditing ? (
                                    <>
                                    <Textarea
                                        value={editedProfile.bio}
                                        onChange={(e) => {
                                            setEditedProfile({ ...editedProfile, bio: e.target.value })
                                            const err = validateTextArea(e.target.value, 'Bio', 0, 2000)
                                            setErrors(prev => { const n = { ...prev }; if (err) n.bio = err; else delete n.bio; return n })
                                        }}
                                        className={`min-h-24 ${errors.bio ? 'border-red-500' : ''}`}
                                        placeholder="Tell us about your coaching experience..."
                                    />
                                    <FormFieldHint hint={FORMAT_HINTS.description} error={errors.bio} />
                                    </>
                                ) : (
                                    <p className="text-gray-700">{displayProfile.bio || 'No bio provided.'}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Stats Sidebar */}
                <div className="space-y-4">
                    {/* Rating Card */}
                    <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <div className="flex justify-center gap-1 mb-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-5 h-5 ${
                                                i < Math.floor(displayProfile.rating)
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : i < displayProfile.rating
                                                        ? 'fill-yellow-200 text-yellow-300'
                                                        : 'text-gray-300'
                                            }`}
                                        />
                                    ))}
                                </div>
                                <p className="text-3xl font-bold text-amber-700">{displayProfile.rating || '-'}</p>
                                <p className="text-sm text-amber-600 font-medium">Coach Rating</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Total Students */}
                    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Users className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-blue-600 font-medium">Total Students</p>
                                        <p className="text-2xl font-bold text-blue-800">{displayProfile.totalStudents}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Total Classes */}
                    <Card className="bg-gradient-to-br from-purple-50 to-fuchsia-50 border-purple-200">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <BookOpen className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-purple-600 font-medium">Total Classes</p>
                                        <p className="text-2xl font-bold text-purple-800">{displayProfile.totalClasses}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Experience */}
                    <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-100 rounded-lg">
                                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-emerald-600 font-medium">Experience</p>
                                        <p className="text-2xl font-bold text-emerald-800">
                                            {displayProfile.experienceYears ? `${displayProfile.experienceYears} yrs` : '-'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Specializations, Skills & Certifications */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* Specializations */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="w-5 h-5 text-blue-600" />
                            Specializations
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {displayProfile.specializations.map((spec, index) => (
                                <Badge key={index} className="bg-blue-100 text-blue-800 flex items-center gap-1">
                                    {spec}
                                    {isEditing && (
                                        <button id={`coach-profile-remove-spec-${index}-btn`}
                                            onClick={() => removeSpecialization(index)}
                                            className="ml-1 hover:text-red-600 transition-colors"
                                            aria-label={`Remove ${spec}`}
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    )}
                                </Badge>
                            ))}
                            {displayProfile.specializations.length === 0 && (
                                <p className="text-sm text-gray-500">No specializations added yet.</p>
                            )}
                        </div>
                        {isEditing && (
                            <div className="flex gap-2 mt-2">
                                <Input
                                    value={newSpecialization}
                                    onChange={(e) => setNewSpecialization(e.target.value)}
                                    placeholder="Add specialization..."
                                    className="flex-1"
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialization())}
                                />
                                <Button id="coach-profile-add-spec-btn" size="sm" onClick={addSpecialization} variant="outline">
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                        )}

                        {/* Skills sub-section */}
                        <div className="mt-6 pt-4 border-t">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-indigo-500" />
                                Skills
                            </h4>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {displayProfile.skills.map((skill, index) => (
                                    <Badge key={index} variant="outline" className="border-indigo-300 text-indigo-700 flex items-center gap-1">
                                        {skill}
                                        {isEditing && (
                                            <button id={`coach-profile-remove-skill-${index}-btn`}
                                                onClick={() => removeSkill(index)}
                                                className="ml-1 hover:text-red-600 transition-colors"
                                                aria-label={`Remove ${skill}`}
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        )}
                                    </Badge>
                                ))}
                                {displayProfile.skills.length === 0 && (
                                    <p className="text-sm text-gray-500">No skills added yet.</p>
                                )}
                            </div>
                            {isEditing && (
                                <div className="flex gap-2 mt-2">
                                    <Input
                                        value={newSkill}
                                        onChange={(e) => setNewSkill(e.target.value)}
                                        placeholder="Add skill..."
                                        className="flex-1"
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                    />
                                    <Button id="coach-profile-add-skill-btn" size="sm" onClick={addSkill} variant="outline">
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Certifications */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-green-600" />
                            Certifications
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <AnimatePresence>
                                {displayProfile.certifications.map((cert, index) => (
                                    <motion.div
                                        key={`${cert.name}-${index}`}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex items-start gap-3 p-3 bg-green-50 rounded-lg group"
                                    >
                                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <span className="text-sm font-medium text-gray-800 block">{cert.name}</span>
                                            {cert.issuingOrganization && (
                                                <span className="text-xs text-gray-500 block">
                                                    Issued by: {cert.issuingOrganization}
                                                </span>
                                            )}
                                            {cert.expiryDate && (
                                                <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                    <Clock className="w-3 h-3" />
                                                    Expires: {new Date(cert.expiryDate).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={
                                                cert.status === 'valid'
                                                    ? 'border-green-300 text-green-700 text-xs'
                                                    : cert.status === 'expired'
                                                        ? 'border-red-300 text-red-700 text-xs'
                                                        : 'border-yellow-300 text-yellow-700 text-xs'
                                            }
                                        >
                                            {cert.status}
                                        </Badge>
                                        {isEditing && (
                                            <button id={`coach-profile-remove-cert-${index}-btn`}
                                                onClick={() => removeCertification(index)}
                                                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all"
                                                aria-label={`Remove ${cert.name}`}
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {displayProfile.certifications.length === 0 && (
                                <p className="text-sm text-gray-500 py-2">No certifications added yet.</p>
                            )}
                        </div>

                        {/* Add Certification Form */}
                        {isEditing && (
                            <div className="mt-4">
                                {showAddCert ? (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="space-y-2 p-3 border border-dashed border-green-300 rounded-lg bg-green-50/50"
                                    >
                                        <Input
                                            value={newCertification.name}
                                            onChange={(e) => setNewCertification(prev => ({ ...prev, name: e.target.value }))}
                                            placeholder="Certification name *"
                                        />
                                        <Input
                                            value={newCertification.issuingOrganization}
                                            onChange={(e) => setNewCertification(prev => ({ ...prev, issuingOrganization: e.target.value }))}
                                            placeholder="Issuing organization"
                                        />
                                        <Input
                                            type="date"
                                            value={newCertification.expiryDate}
                                            onChange={(e) => setNewCertification(prev => ({ ...prev, expiryDate: e.target.value }))}
                                            placeholder="Expiry date"
                                        />
                                        <div className="flex gap-2 justify-end">
                                            <Button id="coach-profile-cancel-cert-btn"
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    setShowAddCert(false)
                                                    setNewCertification({ name: '', issuingOrganization: '', expiryDate: '' })
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                            <Button id="coach-profile-add-cert-btn" size="sm" onClick={addCertification} disabled={!newCertification.name.trim()}>
                                                <Plus className="w-4 h-4 mr-1" />
                                                Add
                                            </Button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <Button id="coach-profile-show-add-cert-btn"
                                        variant="outline"
                                        size="sm"
                                        className="w-full mt-2 border-dashed"
                                        onClick={() => setShowAddCert(true)}
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Certification
                                    </Button>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Goals & Objectives */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-purple-600" />
                        Professional Goals
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {goals.map((goal, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg group"
                            >
                                <div className="w-5 h-5 rounded-full border-2 border-purple-600 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-gray-700 flex-1">{goal}</span>
                                {isEditing && (
                                    <button id={`coach-profile-remove-goal-${index}-btn`}
                                        onClick={() => setGoals(prev => prev.filter((_, i) => i !== index))}
                                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </motion.div>
                        ))}
                        {goals.length === 0 && (
                            <p className="text-sm text-gray-500 py-2">No goals set yet.</p>
                        )}
                    </div>
                    {isEditing && (
                        <div className="flex gap-2 mt-4">
                            <Input
                                value={newGoal}
                                onChange={(e) => setNewGoal(e.target.value)}
                                placeholder="Add a new goal..."
                                className="flex-1"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault()
                                        const val = newGoal.trim()
                                        if (val) {
                                            setGoals(prev => [...prev, val])
                                            setNewGoal('')
                                        }
                                    }
                                }}
                            />
                            <Button id="coach-profile-add-goal-btn"
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    const val = newGoal.trim()
                                    if (val) {
                                        setGoals(prev => [...prev, val])
                                        setNewGoal('')
                                    }
                                }}
                            >
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default CoachProfilePage
