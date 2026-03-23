'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { Search, Plus, Edit2, Trash2, Eye, MapPin, Users, DollarSign, TrendingUp, X, ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { RegionalAdminService, RegionalLocation, PaginatedResponse } from '@/services/regionalAdminService'

// ─── Form Data Type ──────────────────────────────────────────────────
interface LocationFormData {
    name: string
    code: string
    address: string
    city: string
    state: string
    zipCode: string
    phone: string
    email: string
    capacity: string
}

const emptyForm: LocationFormData = {
    name: '',
    code: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    capacity: '',
}

// ─── Location Form Modal ─────────────────────────────────────────────
function LocationFormModal({
    open,
    onClose,
    onSubmit,
    initialData,
    submitting,
    title,
}: {
    open: boolean
    onClose: () => void
    onSubmit: (data: LocationFormData) => void
    initialData: LocationFormData
    submitting: boolean
    title: string
}) {
    const [form, setForm] = useState<LocationFormData>(initialData)

    useEffect(() => {
        setForm(initialData)
    }, [initialData])

    if (!open) return null

    const handleChange = (field: keyof LocationFormData, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }))
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto m-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                <form
                    onSubmit={e => {
                        e.preventDefault()
                        onSubmit(form)
                    }}
                    className="p-6 space-y-4"
                >
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                            <Input value={form.name} onChange={e => handleChange('name', e.target.value)} required placeholder="Location name" />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                            <Input value={form.code} onChange={e => handleChange('code', e.target.value)} placeholder="LOC-001" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                        <Input value={form.address} onChange={e => handleChange('address', e.target.value)} required placeholder="123 Main St" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                            <Input value={form.city} onChange={e => handleChange('city', e.target.value)} required placeholder="Boston" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                            <Input value={form.state} onChange={e => handleChange('state', e.target.value)} required placeholder="MA" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code *</label>
                            <Input value={form.zipCode} onChange={e => handleChange('zipCode', e.target.value)} required placeholder="02101" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                            <Input type="number" value={form.capacity} onChange={e => handleChange('capacity', e.target.value)} placeholder="500" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                            <Input value={form.phone} onChange={e => handleChange('phone', e.target.value)} required placeholder="(555) 123-4567" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                            <Input type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} required placeholder="location@example.com" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            {submitting ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ─── View Detail Modal ───────────────────────────────────────────────
function LocationDetailModal({
    open,
    onClose,
    location,
}: {
    open: boolean
    onClose: () => void
    location: RegionalLocation | null
}) {
    if (!open || !location) return null

    const infoRow = (label: string, value: string | number | undefined | null) => (
        <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
            <span className="text-sm text-gray-500">{label}</span>
            <span className="text-sm font-medium text-gray-900">{value ?? 'N/A'}</span>
        </div>
    )

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto m-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-900">Location Details</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                <div className="p-6 space-y-1">
                    {infoRow('Name', location.name)}
                    {infoRow('Code', location.code)}
                    {infoRow('Address', location.address)}
                    {infoRow('City', location.city)}
                    {infoRow('State', location.state)}
                    {infoRow('Postal Code', location.zipCode)}
                    {infoRow('Phone', location.phone)}
                    {infoRow('Email', location.email)}
                    {infoRow('Manager', location.manager)}
                    {infoRow('Students', location.students)}
                    {infoRow('Staff', location.staff)}
                    {infoRow('Capacity', location.capacity)}
                    {infoRow('Revenue', location.revenue != null ? `$${location.revenue.toLocaleString()}` : undefined)}
                    {infoRow('Occupancy Rate', location.occupancyRate != null ? `${location.occupancyRate}%` : undefined)}
                    {infoRow('Rating', location.rating)}
                    {infoRow('Status', location.status)}
                    {location.facilities && location.facilities.length > 0 && infoRow('Facilities', location.facilities.join(', '))}
                    {location.amenities && location.amenities.length > 0 && infoRow('Amenities', location.amenities.join(', '))}
                    {infoRow('Created', location.createdAt ? new Date(location.createdAt).toLocaleDateString() : undefined)}
                </div>
                <div className="flex justify-end p-6 border-t">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Delete Confirmation Modal ───────────────────────────────────────
function DeleteConfirmModal({
    open,
    onClose,
    onConfirm,
    locationName,
    deleting,
}: {
    open: boolean
    onClose: () => void
    onConfirm: () => void
    locationName: string
    deleting: boolean
}) {
    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md m-4" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-red-50 rounded-full">
                            <AlertCircle className="w-6 h-6 text-red-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Delete Location</h2>
                    </div>
                    <p className="text-gray-600 mb-6">
                        Are you sure you want to delete <span className="font-semibold">{locationName}</span>? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3">
                        <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={deleting}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                            {deleting ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── Main Page Component ─────────────────────────────────────────────
export default function RegionalLocationsPage() {
    // Data state
    const [locations, setLocations] = useState<RegionalLocation[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const pageSize = 10

    // UI state
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)

    // Modal state
    const [formOpen, setFormOpen] = useState(false)
    const [formTitle, setFormTitle] = useState('Add Location')
    const [formData, setFormData] = useState<LocationFormData>(emptyForm)
    const [editingId, setEditingId] = useState<string | null>(null)

    const [viewOpen, setViewOpen] = useState(false)
    const [viewLocation, setViewLocation] = useState<RegionalLocation | null>(null)

    const [deleteOpen, setDeleteOpen] = useState(false)
    const [deletingLocation, setDeletingLocation] = useState<RegionalLocation | null>(null)
    const [deleting, setDeleting] = useState(false)

    // Debounce ref
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // ── Fetch locations ──────────────────────────────────────────────
    const fetchLocations = useCallback(async (p: number, search: string, status: string) => {
        setLoading(true)
        setError(null)
        try {
            const res: PaginatedResponse<RegionalLocation> = await RegionalAdminService.getLocations(
                p,
                pageSize,
                search || undefined,
                status !== 'all' ? status : undefined,
            )
            setLocations(Array.isArray(res?.data) ? res.data : [])
            setTotal(res?.total ?? 0)
            setPage(res?.page ?? 1)
            setTotalPages(res?.totalPages ?? 1)
        } catch (err: any) {
            setError(err.message || 'Failed to load locations')
            setLocations([])
        } finally {
            setLoading(false)
        }
    }, [])

    // Initial load
    useEffect(() => {
        fetchLocations(1, '', 'all')
    }, [fetchLocations])

    // Debounced search
    const handleSearchChange = (value: string) => {
        setSearchTerm(value)
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => {
            setPage(1)
            fetchLocations(1, value, filterStatus)
        }, 400)
    }

    // Status filter change
    const handleStatusChange = (value: string) => {
        setFilterStatus(value)
        setPage(1)
        fetchLocations(1, searchTerm, value)
    }

    // Page change
    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > totalPages) return
        fetchLocations(newPage, searchTerm, filterStatus)
    }

    // ── Add location ─────────────────────────────────────────────────
    const openAddModal = () => {
        setEditingId(null)
        setFormData(emptyForm)
        setFormTitle('Add Location')
        setFormOpen(true)
    }

    // ── Edit location ────────────────────────────────────────────────
    const openEditModal = (loc: RegionalLocation) => {
        setEditingId(loc.id)
        setFormData({
            name: loc.name || '',
            code: loc.code || '',
            address: loc.address || '',
            city: loc.city || '',
            state: loc.state || '',
            zipCode: loc.zipCode || '',
            phone: loc.phone || '',
            email: loc.email || '',
            capacity: loc.capacity != null ? String(loc.capacity) : '',
        })
        setFormTitle('Edit Location')
        setFormOpen(true)
    }

    // ── Submit form (create / update) ────────────────────────────────
    const handleFormSubmit = async (data: LocationFormData) => {
        setSubmitting(true)
        try {
            const payload: Partial<RegionalLocation> = {
                name: data.name,
                code: data.code || undefined,
                address: data.address,
                city: data.city,
                state: data.state,
                zipCode: data.zipCode,
                phone: data.phone,
                email: data.email,
                capacity: data.capacity ? Number(data.capacity) : undefined,
            }

            if (editingId) {
                await RegionalAdminService.updateLocation(editingId, payload)
            } else {
                await RegionalAdminService.createLocation(payload)
            }

            setFormOpen(false)
            fetchLocations(editingId ? page : 1, searchTerm, filterStatus)
        } catch (err: any) {
            alert(err.message || 'Operation failed')
        } finally {
            setSubmitting(false)
        }
    }

    // ── View location ────────────────────────────────────────────────
    const openViewModal = (loc: RegionalLocation) => {
        setViewLocation(loc)
        setViewOpen(true)
    }

    // ── Delete location ──────────────────────────────────────────────
    const openDeleteModal = (loc: RegionalLocation) => {
        setDeletingLocation(loc)
        setDeleteOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!deletingLocation) return
        setDeleting(true)
        try {
            await RegionalAdminService.deleteLocation(deletingLocation.id)
            setDeleteOpen(false)
            setDeletingLocation(null)
            fetchLocations(page, searchTerm, filterStatus)
        } catch (err: any) {
            alert(err.message || 'Failed to delete location')
        } finally {
            setDeleting(false)
        }
    }

    // ── Render ───────────────────────────────────────────────────────
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Regional Locations</h1>
                    <p className="text-gray-600 mt-1">Manage all locations in your region</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Add Location
                </button>
            </div>

            {/* Search & Filter */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <Input
                                placeholder="Search locations..."
                                value={searchTerm}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <select
                            data-testid="select-admin-regional-locations-1"
                            value={filterStatus}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Loading State */}
            {loading && (
                <Card>
                    <CardContent className="py-16 text-center">
                        <Loader2 className="w-10 h-10 text-blue-600 mx-auto mb-4 animate-spin" />
                        <p className="text-gray-600">Loading locations...</p>
                    </CardContent>
                </Card>
            )}

            {/* Error State */}
            {!loading && error && (
                <Card>
                    <CardContent className="py-12 text-center">
                        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
                        <p className="text-red-600 mb-4">{error}</p>
                        <button
                            onClick={() => fetchLocations(page, searchTerm, filterStatus)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Retry
                        </button>
                    </CardContent>
                </Card>
            )}

            {/* Empty State */}
            {!loading && !error && (!locations || locations.length === 0) && (
                <Card>
                    <CardContent className="pt-12 pb-12 text-center">
                        <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No locations found</p>
                    </CardContent>
                </Card>
            )}

            {/* Locations Grid */}
            {!loading && !error && locations && locations.length > 0 && (
                <div className="grid grid-cols-1 gap-6">
                    {locations.map((location, idx) => (
                        <motion.div
                            key={location.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <Card className="hover:shadow-lg transition-shadow">
                                <CardContent className="pt-6">
                                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                                        {/* Location Info */}
                                        <div className="flex-1">
                                            <div className="flex items-start gap-4">
                                                <div className="p-3 bg-blue-50 rounded-lg">
                                                    <MapPin className="w-6 h-6 text-blue-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="text-lg font-bold text-gray-900">{location.name}</h3>
                                                        <Badge variant={location.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                                            {location.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-2">
                                                        {[location.address, location.city, location.state, location.zipCode].filter(Boolean).join(', ')}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        Manager: <span className="font-medium">{location.manager || 'N/A'}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Metrics */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full lg:w-auto">
                                            <div className="text-center">
                                                <div className="flex items-center justify-center gap-1 mb-1">
                                                    <Users className="w-4 h-4 text-blue-600" />
                                                    <span className="text-sm text-gray-600">Students</span>
                                                </div>
                                                <p className="text-lg font-bold text-gray-900">{location.students ?? 0}</p>
                                            </div>
                                            <div className="text-center">
                                                <div className="flex items-center justify-center gap-1 mb-1">
                                                    <DollarSign className="w-4 h-4 text-green-600" />
                                                    <span className="text-sm text-gray-600">Revenue</span>
                                                </div>
                                                <p className="text-lg font-bold text-gray-900">
                                                    ${location.revenue != null ? (location.revenue / 1000).toFixed(0) : 0}K
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <div className="flex items-center justify-center gap-1 mb-1">
                                                    <TrendingUp className="w-4 h-4 text-purple-600" />
                                                    <span className="text-sm text-gray-600">Occupancy</span>
                                                </div>
                                                <p className="text-lg font-bold text-gray-900">{location.occupancyRate ?? 0}%</p>
                                            </div>
                                            <div className="text-center">
                                                <div className="flex items-center justify-center gap-1 mb-1">
                                                    <span className="text-sm text-gray-600">Rating</span>
                                                </div>
                                                <p className="text-lg font-bold text-gray-900">{location.rating != null ? `${location.rating}` : 'N/A'}</p>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 w-full lg:w-auto">
                                            <button
                                                onClick={() => openViewModal(location)}
                                                className="flex-1 lg:flex-none px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Eye className="w-4 h-4" />
                                                <span className="hidden sm:inline">View</span>
                                            </button>
                                            <button
                                                onClick={() => openEditModal(location)}
                                                className="flex-1 lg:flex-none px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                                <span className="hidden sm:inline">Edit</span>
                                            </button>
                                            <button
                                                onClick={() => openDeleteModal(location)}
                                                className="flex-1 lg:flex-none px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                <span className="hidden sm:inline">Delete</span>
                                            </button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {!loading && !error && totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                        Showing {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, total)} of {total} locations
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page <= 1}
                            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                            .reduce<(number | string)[]>((acc, p, idx, arr) => {
                                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...')
                                acc.push(p)
                                return acc
                            }, [])
                            .map((item, idx) =>
                                item === '...' ? (
                                    <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">...</span>
                                ) : (
                                    <button
                                        key={item}
                                        onClick={() => handlePageChange(item as number)}
                                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                            page === item
                                                ? 'bg-blue-600 text-white'
                                                : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
                                        }`}
                                    >
                                        {item}
                                    </button>
                                ),
                            )}
                        <button
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page >= totalPages}
                            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Modals */}
            <LocationFormModal
                open={formOpen}
                onClose={() => setFormOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={formData}
                submitting={submitting}
                title={formTitle}
            />

            <LocationDetailModal
                open={viewOpen}
                onClose={() => { setViewOpen(false); setViewLocation(null) }}
                location={viewLocation}
            />

            <DeleteConfirmModal
                open={deleteOpen}
                onClose={() => { setDeleteOpen(false); setDeletingLocation(null) }}
                onConfirm={handleDeleteConfirm}
                locationName={deletingLocation?.name || ''}
                deleting={deleting}
            />
        </div>
    )
}
