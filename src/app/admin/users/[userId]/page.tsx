'use client'

import { useState, useEffect, useMemo, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Loader, AlertCircle, User, Mail, Phone, Shield, MapPin, Calendar, Building2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/services/api/client'
import { toast } from 'sonner'
import { validateName, validatePhone, filterNameInput, filterPhoneInput, FORMAT_HINTS } from '@/utils/validation'
import { FormFieldHint } from '@/components/ui/FormFieldHint'

const ROLE_HIERARCHY: Record<string, string[]> = {
    'ADMIN': ['ADMIN', 'REGIONAL_ADMIN', 'FRANCHISE_OWNER', 'LOCATION_MANAGER', 'COACH', 'PARTNER_ADMIN', 'SUPPORT_STAFF'],
    'REGIONAL_ADMIN': ['FRANCHISE_OWNER', 'LOCATION_MANAGER', 'COACH', 'SUPPORT_STAFF'],
    'FRANCHISE_OWNER': ['LOCATION_MANAGER', 'COACH'],
    'LOCATION_MANAGER': ['COACH'],
}

const ROLE_LABELS: Record<string, string> = {
    ADMIN: 'Admin',
    REGIONAL_ADMIN: 'Regional Admin',
    FRANCHISE_OWNER: 'Franchise Owner',
    LOCATION_MANAGER: 'Location Manager',
    COACH: 'Coach',
    SUPPORT_STAFF: 'Support Staff',
    PARTNER_ADMIN: 'Partner Admin',
    PARENT: 'Parent',
    USER: 'User',
    STUDENT: 'Student',
}

const STATUS_OPTIONS = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING']

interface UserDetail {
    id: string
    firstName: string
    lastName: string
    email: string
    role: string
    status: string
    phone?: string
    dateOfBirth?: string
    gender?: string
    address?: { street?: string; city?: string; state?: string; country?: string; postalCode?: string }
    locationId?: string
    organizationId?: string
    locationName?: string
    organizationName?: string
    createdAt?: string
    lastLogin?: string
    isEmailVerified?: boolean
}

export default function UserDetailPage({ params }: { params: Promise<{ userId: string }> }) {
    const { userId } = use(params)
    const router = useRouter()
    const [userData, setUserData] = useState<UserDetail | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [editData, setEditData] = useState<Partial<UserDetail>>({})
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
    const [currentUserRole, setCurrentUserRole] = useState<string>('')

    useEffect(() => {
        try {
            const stored = localStorage.getItem('user') || localStorage.getItem('currentUser')
            if (stored) {
                const parsed = JSON.parse(stored)
                const rawRole = typeof parsed.role === 'object' ? parsed.role?.name : parsed.role
                const normalized = rawRole?.toUpperCase?.() || ''
                const roleMap: Record<string, string> = { 'SUPER_ADMIN': 'ADMIN', 'HQ_ADMIN': 'ADMIN' }
                setCurrentUserRole(roleMap[normalized] || normalized)
            }
        } catch { /* ignore */ }
    }, [])

    const allowedRoles = useMemo(() => ROLE_HIERARCHY[currentUserRole] || [], [currentUserRole])
    const canEdit = userData ? allowedRoles.includes(userData.role) : false

    useEffect(() => {
        loadUser()
    }, [userId])

    const loadUser = async () => {
        try {
            setIsLoading(true)
            setError(null)
            const response = await apiClient.get<any>(`/admin/users/${userId}`)
            const user = response?.data || response
            if (user) {
                setUserData({
                    id: user._id || user.id || userId,
                    firstName: user.firstName || '',
                    lastName: user.lastName || '',
                    email: user.email || '',
                    role: user.role || '',
                    status: user.status || 'ACTIVE',
                    phone: user.phone || '',
                    dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
                    gender: user.gender || '',
                    address: user.address || {},
                    locationId: user.locationId || '',
                    organizationId: user.organizationId || '',
                    locationName: user.locationName || '',
                    organizationName: user.organizationName || '',
                    createdAt: user.createdAt || '',
                    lastLogin: user.lastLogin || '',
                    isEmailVerified: user.isEmailVerified || false,
                })
                setEditData({
                    firstName: user.firstName || '',
                    lastName: user.lastName || '',
                    phone: user.phone || '',
                    role: user.role || '',
                    status: user.status || 'ACTIVE',
                })
            }
        } catch (err: any) {
            console.error('Error loading user:', err)
            setError(err?.response?.data?.message || 'Failed to load user details')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSave = async () => {
        if (!userData) return
        const errors: Record<string, string> = {}
        const fnErr = validateName(editData.firstName || '', 'First name')
        if (fnErr) errors.firstName = fnErr
        const lnErr = validateName(editData.lastName || '', 'Last name')
        if (lnErr) errors.lastName = lnErr
        if (editData.phone) {
            const pe = validatePhone(editData.phone, false)
            if (pe) errors.phone = pe
        }
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors)
            return
        }

        try {
            setIsSaving(true)
            setFieldErrors({})
            await apiClient.put(`/users/${userId}`, {
                firstName: editData.firstName,
                lastName: editData.lastName,
                phone: editData.phone || undefined,
                role: editData.role,
                status: editData.status,
            })
            toast.success('User updated successfully')
            setIsEditing(false)
            await loadUser()
        } catch (err: any) {
            console.error('Error updating user:', err)
            toast.error(err?.response?.data?.message || 'Failed to update user')
        } finally {
            setIsSaving(false)
        }
    }

    const handleCancel = () => {
        if (userData) {
            setEditData({
                firstName: userData.firstName,
                lastName: userData.lastName,
                phone: userData.phone || '',
                role: userData.role,
                status: userData.status,
            })
        }
        setFieldErrors({})
        setIsEditing(false)
    }

    const handleChange = (field: string, value: string) => {
        setEditData(prev => ({ ...prev, [field]: value }))
        if (fieldErrors[field]) {
            setFieldErrors(prev => { const n = { ...prev }; delete n[field]; return n })
        }
    }

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'N/A'
        try {
            return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        } catch { return dateStr }
    }

    const getRoleBadgeColor = (role: string) => {
        const colors: Record<string, string> = {
            ADMIN: 'bg-red-100 text-red-800',
            REGIONAL_ADMIN: 'bg-purple-100 text-purple-800',
            FRANCHISE_OWNER: 'bg-indigo-100 text-indigo-800',
            LOCATION_MANAGER: 'bg-blue-100 text-blue-800',
            COACH: 'bg-green-100 text-green-800',
            SUPPORT_STAFF: 'bg-yellow-100 text-yellow-800',
            PARTNER_ADMIN: 'bg-orange-100 text-orange-800',
            PARENT: 'bg-teal-100 text-teal-800',
            USER: 'bg-gray-100 text-gray-800',
            STUDENT: 'bg-cyan-100 text-cyan-800',
        }
        return colors[role] || 'bg-gray-100 text-gray-800'
    }

    const getStatusBadgeColor = (status: string) => {
        const colors: Record<string, string> = {
            ACTIVE: 'bg-green-100 text-green-800',
            INACTIVE: 'bg-gray-100 text-gray-800',
            SUSPENDED: 'bg-red-100 text-red-800',
            PENDING: 'bg-yellow-100 text-yellow-800',
        }
        return colors[status] || 'bg-gray-100 text-gray-800'
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        )
    }

    if (error || !userData) {
        return (
            <div className="space-y-4">
                <Button variant="outline" onClick={() => router.back()} className="flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <div className="p-6 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-red-700">{error || 'User not found'}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => router.back()}>
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {userData.firstName} {userData.lastName}
                        </h1>
                        <p className="text-sm text-gray-500">{userData.email}</p>
                    </div>
                </div>
                {canEdit && (
                    <div className="flex gap-2">
                        {isEditing ? (
                            <>
                                <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                                <Button onClick={handleSave} disabled={isSaving}>
                                    {isSaving ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </>
                        ) : (
                            <Button onClick={() => setIsEditing(true)}>Edit User</Button>
                        )}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5" /> Personal Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                    {isEditing ? (
                                        <>
                                            <input type="text" value={editData.firstName || ''} onChange={e => handleChange('firstName', e.target.value)} onKeyDown={filterNameInput}
                                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors.firstName ? 'border-red-500' : 'border-gray-300'}`} />
                                            <FormFieldHint hint={FORMAT_HINTS.firstName} error={fieldErrors.firstName} />
                                        </>
                                    ) : (
                                        <p className="text-gray-900">{userData.firstName}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                    {isEditing ? (
                                        <>
                                            <input type="text" value={editData.lastName || ''} onChange={e => handleChange('lastName', e.target.value)} onKeyDown={filterNameInput}
                                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors.lastName ? 'border-red-500' : 'border-gray-300'}`} />
                                            <FormFieldHint hint={FORMAT_HINTS.lastName} error={fieldErrors.lastName} />
                                        </>
                                    ) : (
                                        <p className="text-gray-900">{userData.lastName}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    <p className="text-gray-900">{userData.email}</p>
                                    {userData.isEmailVerified && (
                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Verified</span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                {isEditing ? (
                                    <>
                                        <input type="tel" value={editData.phone || ''} onChange={e => handleChange('phone', e.target.value)} onKeyDown={filterPhoneInput}
                                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors.phone ? 'border-red-500' : 'border-gray-300'}`}
                                            placeholder="Phone number" />
                                        <FormFieldHint hint={FORMAT_HINTS.phone} error={fieldErrors.phone} />
                                    </>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <p className="text-gray-900">{userData.phone || 'Not set'}</p>
                                    </div>
                                )}
                            </div>

                            {userData.dateOfBirth && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <p className="text-gray-900">{formatDate(userData.dateOfBirth)}</p>
                                    </div>
                                </div>
                            )}

                            {userData.address && (userData.address.street || userData.address.city) && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                        <p className="text-gray-900">
                                            {[userData.address.street, userData.address.city, userData.address.state, userData.address.country].filter(Boolean).join(', ')}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Role & Access */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="w-5 h-5" /> Role & Access
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                    {isEditing && canEdit ? (
                                        <select value={editData.role || ''} onChange={e => handleChange('role', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            {allowedRoles.map(r => (
                                                <option key={r} value={r}>{ROLE_LABELS[r] || r}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(userData.role)}`}>
                                            {ROLE_LABELS[userData.role] || userData.role}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    {isEditing && canEdit ? (
                                        <select value={editData.status || ''} onChange={e => handleChange('status', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            {STATUS_OPTIONS.map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(userData.status)}`}>
                                            {userData.status}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Profile Card */}
                    <Card>
                        <CardContent className="p-6 text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-white">
                                    {userData.firstName[0]}{userData.lastName[0]}
                                </span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">{userData.firstName} {userData.lastName}</h3>
                            <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(userData.role)}`}>
                                {ROLE_LABELS[userData.role] || userData.role}
                            </span>
                        </CardContent>
                    </Card>

                    {/* Account Details */}
                    <Card>
                        <CardHeader><CardTitle className="text-base">Account Details</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Status</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(userData.status)}`}>
                                    {userData.status}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Created</span>
                                <span className="text-gray-900">{formatDate(userData.createdAt)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Last Login</span>
                                <span className="text-gray-900">{formatDate(userData.lastLogin)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Email Verified</span>
                                <span className={`text-xs px-2 py-0.5 rounded ${userData.isEmailVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {userData.isEmailVerified ? 'Yes' : 'No'}
                                </span>
                            </div>
                            {userData.organizationName && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Organization</span>
                                    <span className="text-gray-900 flex items-center gap-1">
                                        <Building2 className="w-3 h-3" /> {userData.organizationName}
                                    </span>
                                </div>
                            )}
                            {userData.locationName && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Location</span>
                                    <span className="text-gray-900 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> {userData.locationName}
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
