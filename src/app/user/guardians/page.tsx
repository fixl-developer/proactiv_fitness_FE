'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Users, Plus, Search, Mail, Phone, MapPin, Shield, Star, Clock,
    Check, X, Send, Trash2, Edit3, UserPlus, AlertTriangle, RefreshCw,
    Loader2, ChevronDown, Heart, Eye
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import guardianService, {
    GuardianLink, AddGuardianData, UpdateGuardianData,
    GuardianRelationship, SearchedUser
} from '@/services/modules/guardian.service'

const RELATIONSHIP_OPTIONS: { value: GuardianRelationship; label: string }[] = [
    { value: 'parent', label: 'Parent' },
    { value: 'mother', label: 'Mother' },
    { value: 'father', label: 'Father' },
    { value: 'guardian', label: 'Legal Guardian' },
    { value: 'grandparent', label: 'Grandparent' },
    { value: 'sibling', label: 'Sibling' },
    { value: 'uncle_aunt', label: 'Uncle/Aunt' },
    { value: 'other', label: 'Other' },
]

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
    pending: { color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', label: 'Pending' },
    linked: { color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', label: 'Linked' },
    rejected: { color: 'text-red-700', bg: 'bg-red-50 border-red-200', label: 'Rejected' },
    removed: { color: 'text-gray-700', bg: 'bg-gray-50 border-gray-200', label: 'Removed' },
}

function getRelationshipLabel(rel: string): string {
    return RELATIONSHIP_OPTIONS.find(r => r.value === rel)?.label || rel
}

function getGuardianDisplayName(g: GuardianLink): string {
    if (typeof g.guardianId === 'object' && g.guardianId) {
        return `${g.guardianId.firstName} ${g.guardianId.lastName}`
    }
    return g.guardianName
}

function getGuardianEmail(g: GuardianLink): string {
    if (typeof g.guardianId === 'object' && g.guardianId) {
        return g.guardianId.email
    }
    return g.guardianEmail || ''
}

export default function GuardiansPage() {
    const { user } = useAuth()
    const [guardians, setGuardians] = useState<GuardianLink[]>([])
    const [pendingInvitations, setPendingInvitations] = useState<GuardianLink[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDetailModal, setShowDetailModal] = useState(false)
    const [selectedGuardian, setSelectedGuardian] = useState<GuardianLink | null>(null)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 4000)
    }

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const [guardiansList, invitations] = await Promise.all([
                guardianService.getMyGuardians(),
                guardianService.getPendingInvitations(),
            ])
            setGuardians(guardiansList)
            setPendingInvitations(invitations)
        } catch {
            showToast('Failed to load guardians', 'error')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleRemoveGuardian = async (id: string) => {
        if (!confirm('Are you sure you want to remove this guardian?')) return
        setActionLoading(id)
        const result = await guardianService.removeGuardian(id)
        if (result.success) {
            showToast('Guardian removed successfully', 'success')
            fetchData()
        } else {
            showToast(result.message || 'Failed to remove guardian', 'error')
        }
        setActionLoading(null)
    }

    const handleAcceptInvitation = async (id: string) => {
        setActionLoading(id)
        const result = await guardianService.acceptInvitation(id)
        if (result.success) {
            showToast('Invitation accepted!', 'success')
            fetchData()
        } else {
            showToast(result.message || 'Failed to accept invitation', 'error')
        }
        setActionLoading(null)
    }

    const handleRejectInvitation = async (id: string) => {
        setActionLoading(id)
        const result = await guardianService.rejectInvitation(id)
        if (result.success) {
            showToast('Invitation rejected', 'success')
            fetchData()
        } else {
            showToast(result.message || 'Failed to reject invitation', 'error')
        }
        setActionLoading(null)
    }

    const handleResendInvitation = async (id: string) => {
        setActionLoading(id)
        const result = await guardianService.resendInvitation(id)
        if (result.success) {
            showToast('Invitation resent successfully', 'success')
        } else {
            showToast(result.message || 'Failed to resend invitation', 'error')
        }
        setActionLoading(null)
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-64" />
                    <div className="h-4 bg-gray-200 rounded w-96" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-48 bg-gray-200 rounded-xl" />
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    const linkedGuardians = guardians.filter(g => g.status === 'linked')
    const pendingGuardians = guardians.filter(g => g.status === 'pending')

    return (
        <div className="space-y-6">
            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`fixed top-24 right-6 z-50 px-5 py-3 rounded-xl shadow-lg border ${
                            toast.type === 'success'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                : 'bg-red-50 border-red-200 text-red-800'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            {toast.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                            <span className="text-sm font-medium">{toast.message}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Parent / Guardian</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Link your parents or guardians to your account for better communication and management
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchData}
                        disabled={loading}
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => setShowAddModal(true)}
                        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Guardian
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="border-emerald-100">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                            <Users className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{linkedGuardians.length}</p>
                            <p className="text-sm text-gray-500">Linked Guardians</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-amber-100">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                            <Clock className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{pendingGuardians.length}</p>
                            <p className="text-sm text-gray-500">Pending Requests</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-blue-100">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Mail className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{pendingInvitations.length}</p>
                            <p className="text-sm text-gray-500">Invitations for You</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Pending Invitations for me (as guardian) */}
            {pendingInvitations.length > 0 && (
                <Card className="border-blue-200 bg-blue-50/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Mail className="w-5 h-5 text-blue-600" />
                            Guardian Invitations for You
                        </CardTitle>
                        <p className="text-sm text-gray-500">Students who want to add you as their guardian</p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {pendingInvitations.map(inv => {
                            const student = typeof inv.studentId === 'object' ? inv.studentId : null
                            return (
                                <div key={inv.id} className="bg-white rounded-xl p-4 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                            {student ? student.firstName[0] : '?'}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {student ? `${student.firstName} ${student.lastName}` : 'Unknown Student'}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                wants you as their <span className="font-medium text-blue-600">{getRelationshipLabel(inv.relationship)}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            onClick={() => handleAcceptInvitation(inv.id)}
                                            disabled={actionLoading === inv.id}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                        >
                                            {actionLoading === inv.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
                                            Accept
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleRejectInvitation(inv.id)}
                                            disabled={actionLoading === inv.id}
                                            className="text-red-600 hover:bg-red-50"
                                        >
                                            <X className="w-4 h-4 mr-1" />
                                            Decline
                                        </Button>
                                    </div>
                                </div>
                            )
                        })}
                    </CardContent>
                </Card>
            )}

            {/* Guardians List */}
            {guardians.length === 0 ? (
                <Card className="border-dashed border-2 border-gray-200">
                    <CardContent className="py-16 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Guardians Added Yet</h3>
                        <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
                            Add your parent or guardian so they can stay connected with your activities, receive updates, and be your emergency contact.
                        </p>
                        <Button
                            onClick={() => setShowAddModal(true)}
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Your First Guardian
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {guardians.map(guardian => {
                        const statusConfig = STATUS_CONFIG[guardian.status] || STATUS_CONFIG.pending
                        return (
                            <motion.div
                                key={guardian.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <Card className="hover:shadow-md transition-shadow h-full">
                                    <CardContent className="p-5">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                    {getGuardianDisplayName(guardian)[0]?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-semibold text-gray-900">
                                                            {getGuardianDisplayName(guardian)}
                                                        </h3>
                                                        {guardian.isPrimary && (
                                                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-500">
                                                        {getRelationshipLabel(guardian.relationship)}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge className={`${statusConfig.bg} ${statusConfig.color} border text-xs`}>
                                                {statusConfig.label}
                                            </Badge>
                                        </div>

                                        {/* Contact Info */}
                                        <div className="space-y-2 mb-4">
                                            {getGuardianEmail(guardian) && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Mail className="w-4 h-4 text-gray-400" />
                                                    <span className="truncate">{getGuardianEmail(guardian)}</span>
                                                </div>
                                            )}
                                            {guardian.guardianPhone && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Phone className="w-4 h-4 text-gray-400" />
                                                    <span>{guardian.guardianPhone}</span>
                                                </div>
                                            )}
                                            {guardian.guardianAddress && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <MapPin className="w-4 h-4 text-gray-400" />
                                                    <span className="truncate">{guardian.guardianAddress}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Badges */}
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {guardian.isPrimary && (
                                                <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50 text-xs">
                                                    <Star className="w-3 h-3 mr-1" /> Primary
                                                </Badge>
                                            )}
                                            {guardian.isEmergencyContact && (
                                                <Badge variant="outline" className="text-red-700 border-red-200 bg-red-50 text-xs">
                                                    <Shield className="w-3 h-3 mr-1" /> Emergency Contact
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => { setSelectedGuardian(guardian); setShowDetailModal(true) }}
                                                className="flex-1"
                                            >
                                                <Eye className="w-4 h-4 mr-1" /> View
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => { setSelectedGuardian(guardian); setShowEditModal(true) }}
                                                className="flex-1"
                                            >
                                                <Edit3 className="w-4 h-4 mr-1" /> Edit
                                            </Button>
                                            {guardian.status === 'pending' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleResendInvitation(guardian.id)}
                                                    disabled={actionLoading === guardian.id}
                                                    className="text-blue-600"
                                                >
                                                    {actionLoading === guardian.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                                </Button>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleRemoveGuardian(guardian.id)}
                                                disabled={actionLoading === guardian.id}
                                                className="text-red-600 hover:bg-red-50"
                                            >
                                                {actionLoading === guardian.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )
                    })}
                </div>
            )}

            {/* Add Guardian Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <AddGuardianModal
                        onClose={() => setShowAddModal(false)}
                        onSuccess={() => { setShowAddModal(false); fetchData(); showToast('Guardian added successfully!', 'success') }}
                        onError={(msg) => showToast(msg, 'error')}
                    />
                )}
            </AnimatePresence>

            {/* Edit Guardian Modal */}
            <AnimatePresence>
                {showEditModal && selectedGuardian && (
                    <EditGuardianModal
                        guardian={selectedGuardian}
                        onClose={() => { setShowEditModal(false); setSelectedGuardian(null) }}
                        onSuccess={() => { setShowEditModal(false); setSelectedGuardian(null); fetchData(); showToast('Guardian updated successfully!', 'success') }}
                        onError={(msg) => showToast(msg, 'error')}
                    />
                )}
            </AnimatePresence>

            {/* Detail Modal */}
            <AnimatePresence>
                {showDetailModal && selectedGuardian && (
                    <GuardianDetailModal
                        guardian={selectedGuardian}
                        onClose={() => { setShowDetailModal(false); setSelectedGuardian(null) }}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}

// =============================================
// Add Guardian Modal
// =============================================
function AddGuardianModal({ onClose, onSuccess, onError }: {
    onClose: () => void
    onSuccess: () => void
    onError: (msg: string) => void
}) {
    const [mode, setMode] = useState<'search' | 'manual'>('manual')
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<SearchedUser[]>([])
    const [searching, setSearching] = useState(false)
    const [selectedUser, setSelectedUser] = useState<SearchedUser | null>(null)
    const [submitting, setSubmitting] = useState(false)

    const [form, setForm] = useState<AddGuardianData>({
        relationship: 'parent',
        guardianName: '',
        guardianEmail: '',
        guardianPhone: '',
        guardianAddress: '',
        isPrimary: false,
        isEmergencyContact: false,
        notes: '',
    })

    const handleSearch = async (query: string) => {
        setSearchQuery(query)
        if (query.length < 2) { setSearchResults([]); return }
        setSearching(true)
        const results = await guardianService.searchUsers(query)
        setSearchResults(results)
        setSearching(false)
    }

    const handleSelectUser = (user: SearchedUser) => {
        setSelectedUser(user)
        setForm(prev => ({
            ...prev,
            guardianId: user.id,
            guardianName: `${user.firstName} ${user.lastName}`,
            guardianEmail: user.email,
            guardianPhone: user.phone || '',
        }))
        setSearchResults([])
        setSearchQuery('')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.guardianName.trim()) { onError('Guardian name is required'); return }

        setSubmitting(true)
        const result = await guardianService.addGuardian(form)
        if (result.success) {
            onSuccess()
        } else {
            onError(result.message || 'Failed to add guardian')
        }
        setSubmitting(false)
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
                <div className="flex items-center justify-between p-6 border-b">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Add Guardian</h2>
                        <p className="text-sm text-gray-500 mt-1">Link a parent or guardian to your account</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Mode Toggle */}
                    <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                        <button
                            type="button"
                            onClick={() => { setMode('manual'); setSelectedUser(null) }}
                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${mode === 'manual' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
                        >
                            <UserPlus className="w-4 h-4 inline mr-1" /> Add Manually
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode('search')}
                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${mode === 'search' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
                        >
                            <Search className="w-4 h-4 inline mr-1" /> Search Existing User
                        </button>
                    </div>

                    {/* Search Mode */}
                    {mode === 'search' && (
                        <div className="space-y-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                                />
                                {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />}
                            </div>
                            {searchResults.length > 0 && (
                                <div className="border rounded-xl divide-y max-h-48 overflow-y-auto">
                                    {searchResults.map(u => (
                                        <button
                                            key={u.id}
                                            type="button"
                                            onClick={() => handleSelectUser(u)}
                                            className="w-full flex items-center gap-3 p-3 hover:bg-emerald-50 transition-colors text-left"
                                        >
                                            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-sm">
                                                {u.firstName[0]}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 text-sm">{u.firstName} {u.lastName}</p>
                                                <p className="text-xs text-gray-500">{u.email}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                            {selectedUser && (
                                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-emerald-600" />
                                        <span className="text-sm font-medium text-emerald-700">
                                            Selected: {selectedUser.firstName} {selectedUser.lastName}
                                        </span>
                                    </div>
                                    <button type="button" onClick={() => { setSelectedUser(null); setForm(prev => ({ ...prev, guardianId: undefined, guardianName: '', guardianEmail: '', guardianPhone: '' })) }}>
                                        <X className="w-4 h-4 text-gray-400" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Guardian Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Name *</label>
                        <input
                            type="text"
                            required
                            value={form.guardianName}
                            onChange={(e) => setForm(prev => ({ ...prev, guardianName: e.target.value }))}
                            placeholder="Full name of guardian"
                            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                            readOnly={!!selectedUser}
                        />
                    </div>

                    {/* Relationship */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Relationship *</label>
                        <select
                            required
                            value={form.relationship}
                            onChange={(e) => setForm(prev => ({ ...prev, relationship: e.target.value as GuardianRelationship }))}
                            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                        >
                            {RELATIONSHIP_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Email & Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={form.guardianEmail || ''}
                                onChange={(e) => setForm(prev => ({ ...prev, guardianEmail: e.target.value }))}
                                placeholder="guardian@email.com"
                                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                                readOnly={!!selectedUser}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input
                                type="tel"
                                value={form.guardianPhone || ''}
                                onChange={(e) => setForm(prev => ({ ...prev, guardianPhone: e.target.value }))}
                                placeholder="+1234567890"
                                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                            />
                        </div>
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <input
                            type="text"
                            value={form.guardianAddress || ''}
                            onChange={(e) => setForm(prev => ({ ...prev, guardianAddress: e.target.value }))}
                            placeholder="Guardian's address"
                            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                        />
                    </div>

                    {/* Toggles */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.isPrimary}
                                onChange={(e) => setForm(prev => ({ ...prev, isPrimary: e.target.checked }))}
                                className="w-4 h-4 text-emerald-600 rounded"
                            />
                            <div>
                                <span className="text-sm font-medium text-gray-700">Primary Guardian</span>
                                <p className="text-xs text-gray-500">Mark as your primary parent/guardian</p>
                            </div>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.isEmergencyContact}
                                onChange={(e) => setForm(prev => ({ ...prev, isEmergencyContact: e.target.checked }))}
                                className="w-4 h-4 text-emerald-600 rounded"
                            />
                            <div>
                                <span className="text-sm font-medium text-gray-700">Emergency Contact</span>
                                <p className="text-xs text-gray-500">Add as your emergency contact</p>
                            </div>
                        </label>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                        <textarea
                            value={form.notes || ''}
                            onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="Any additional notes..."
                            rows={2}
                            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors resize-none"
                        />
                    </div>

                    {/* Submit */}
                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={submitting || !form.guardianName.trim()}
                            className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                            Add Guardian
                        </Button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    )
}

// =============================================
// Edit Guardian Modal
// =============================================
function EditGuardianModal({ guardian, onClose, onSuccess, onError }: {
    guardian: GuardianLink
    onClose: () => void
    onSuccess: () => void
    onError: (msg: string) => void
}) {
    const [submitting, setSubmitting] = useState(false)
    const [form, setForm] = useState<UpdateGuardianData>({
        relationship: guardian.relationship,
        isPrimary: guardian.isPrimary,
        isEmergencyContact: guardian.isEmergencyContact,
        guardianName: getGuardianDisplayName(guardian),
        guardianEmail: getGuardianEmail(guardian),
        guardianPhone: guardian.guardianPhone || '',
        guardianAddress: guardian.guardianAddress || '',
        notes: guardian.notes || '',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        const result = await guardianService.updateGuardian(guardian.id, form)
        if (result.success) {
            onSuccess()
        } else {
            onError(result.message || 'Failed to update guardian')
        }
        setSubmitting(false)
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
                <div className="flex items-center justify-between p-6 border-b">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Edit Guardian</h2>
                        <p className="text-sm text-gray-500 mt-1">Update guardian information</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Name</label>
                        <input
                            type="text"
                            value={form.guardianName || ''}
                            onChange={(e) => setForm(prev => ({ ...prev, guardianName: e.target.value }))}
                            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                        <select
                            value={form.relationship}
                            onChange={(e) => setForm(prev => ({ ...prev, relationship: e.target.value as GuardianRelationship }))}
                            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                        >
                            {RELATIONSHIP_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={form.guardianEmail || ''}
                                onChange={(e) => setForm(prev => ({ ...prev, guardianEmail: e.target.value }))}
                                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input
                                type="tel"
                                value={form.guardianPhone || ''}
                                onChange={(e) => setForm(prev => ({ ...prev, guardianPhone: e.target.value }))}
                                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <input
                            type="text"
                            value={form.guardianAddress || ''}
                            onChange={(e) => setForm(prev => ({ ...prev, guardianAddress: e.target.value }))}
                            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.isPrimary}
                                onChange={(e) => setForm(prev => ({ ...prev, isPrimary: e.target.checked }))}
                                className="w-4 h-4 text-emerald-600 rounded"
                            />
                            <span className="text-sm font-medium text-gray-700">Primary Guardian</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.isEmergencyContact}
                                onChange={(e) => setForm(prev => ({ ...prev, isEmergencyContact: e.target.checked }))}
                                className="w-4 h-4 text-emerald-600 rounded"
                            />
                            <span className="text-sm font-medium text-gray-700">Emergency Contact</span>
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea
                            value={form.notes || ''}
                            onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                            rows={2}
                            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors resize-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    )
}

// =============================================
// Guardian Detail Modal
// =============================================
function GuardianDetailModal({ guardian, onClose }: {
    guardian: GuardianLink
    onClose: () => void
}) {
    const statusConfig = STATUS_CONFIG[guardian.status] || STATUS_CONFIG.pending

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
            >
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Guardian Details</h2>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    <div className="text-center mb-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-3 text-white font-bold text-2xl">
                            {getGuardianDisplayName(guardian)[0]?.toUpperCase()}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">{getGuardianDisplayName(guardian)}</h3>
                        <p className="text-gray-500">{getRelationshipLabel(guardian.relationship)}</p>
                        <Badge className={`${statusConfig.bg} ${statusConfig.color} border mt-2`}>
                            {statusConfig.label}
                        </Badge>
                    </div>

                    <div className="space-y-4">
                        {getGuardianEmail(guardian) && (
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <Mail className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500">Email</p>
                                    <p className="text-sm font-medium text-gray-900">{getGuardianEmail(guardian)}</p>
                                </div>
                            </div>
                        )}
                        {guardian.guardianPhone && (
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <Phone className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500">Phone</p>
                                    <p className="text-sm font-medium text-gray-900">{guardian.guardianPhone}</p>
                                </div>
                            </div>
                        )}
                        {guardian.guardianAddress && (
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <MapPin className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500">Address</p>
                                    <p className="text-sm font-medium text-gray-900">{guardian.guardianAddress}</p>
                                </div>
                            </div>
                        )}
                        {guardian.notes && (
                            <div className="p-3 bg-gray-50 rounded-xl">
                                <p className="text-xs text-gray-500 mb-1">Notes</p>
                                <p className="text-sm text-gray-700">{guardian.notes}</p>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                            {guardian.isPrimary && (
                                <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50">
                                    <Star className="w-3 h-3 mr-1" /> Primary Guardian
                                </Badge>
                            )}
                            {guardian.isEmergencyContact && (
                                <Badge variant="outline" className="text-red-700 border-red-200 bg-red-50">
                                    <Shield className="w-3 h-3 mr-1" /> Emergency Contact
                                </Badge>
                            )}
                        </div>

                        {guardian.linkedAt && (
                            <p className="text-xs text-gray-400 text-center">
                                Linked on {new Date(guardian.linkedAt).toLocaleDateString()}
                            </p>
                        )}
                    </div>

                    <Button variant="outline" className="w-full mt-6" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </motion.div>
        </motion.div>
    )
}
