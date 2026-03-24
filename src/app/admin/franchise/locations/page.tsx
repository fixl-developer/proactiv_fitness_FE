'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search, Plus, Edit2, Trash2, Eye, MapPin, Users, DollarSign,
    TrendingUp, X, ChevronLeft, ChevronRight, Loader2, AlertCircle,
    Phone, Mail, Building2
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { FranchiseOwnerService, FranchiseLocation } from '@/services/franchiseOwnerService'

// ─── Types ───────────────────────────────────────────────────────────────────

interface LocationFormData {
    name: string
    address: string
    city: string
    state: string
    zipCode: string
    phone: string
    email: string
    capacity: number
}

type ModalMode = 'add' | 'edit' | 'view' | 'delete' | null

const emptyForm: LocationFormData = {
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    capacity: 0,
}

const PAGE_SIZE = 10

// ─── Component ───────────────────────────────────────────────────────────────

export default function FranchiseLocationsPage() {
    // Data state
    const [locations, setLocations] = useState<FranchiseLocation[]>([])
    const [totalLocations, setTotalLocations] = useState(0)
    const [totalPages, setTotalPages] = useState(1)
    const [currentPage, setCurrentPage] = useState(1)

    // Filter state
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('')
    const [debouncedSearch, setDebouncedSearch] = useState('')

    // UI state
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)

    // Modal state
    const [modalMode, setModalMode] = useState<ModalMode>(null)
    const [selectedLocation, setSelectedLocation] = useState<FranchiseLocation | null>(null)
    const [formData, setFormData] = useState<LocationFormData>(emptyForm)
    const [formError, setFormError] = useState<string | null>(null)

    // ── Debounce search ──────────────────────────────────────────────────────

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm)
            setCurrentPage(1)
        }, 400)
        return () => clearTimeout(timer)
    }, [searchTerm])

    // ── Fetch locations ──────────────────────────────────────────────────────

    const fetchLocations = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await FranchiseOwnerService.getLocations(
                currentPage,
                PAGE_SIZE,
                debouncedSearch || undefined,
                statusFilter || undefined
            )
            setLocations(res.data)
            setTotalLocations(res.total)
            setTotalPages(res.totalPages)
        } catch (err: any) {
            setError(err.message || 'Failed to load locations')
        } finally {
            setLoading(false)
        }
    }, [currentPage, debouncedSearch, statusFilter])

    useEffect(() => {
        fetchLocations()
    }, [fetchLocations])

    // ── Summary calculations ─────────────────────────────────────────────────

    const totalStudents = locations.reduce((s, l) => s + (l.students || 0), 0)
    const totalRevenue = locations.reduce((s, l) => s + (l.revenue || 0), 0)
    const avgOccupancy =
        locations.length > 0
            ? Math.round(locations.reduce((s, l) => s + (l.occupancyRate || 0), 0) / locations.length)
            : 0

    // ── Modal helpers ────────────────────────────────────────────────────────

    const openAddModal = () => {
        setFormData(emptyForm)
        setFormError(null)
        setModalMode('add')
    }

    const openViewModal = (loc: FranchiseLocation) => {
        setSelectedLocation(loc)
        setModalMode('view')
    }

    const openEditModal = (loc: FranchiseLocation) => {
        setSelectedLocation(loc)
        setFormData({
            name: loc.name,
            address: loc.address,
            city: loc.city,
            state: loc.state,
            zipCode: loc.zipCode,
            phone: loc.phone,
            email: loc.email,
            capacity: 0,
        })
        setFormError(null)
        setModalMode('edit')
    }

    const openDeleteModal = (loc: FranchiseLocation) => {
        setSelectedLocation(loc)
        setModalMode('delete')
    }

    const closeModal = () => {
        setModalMode(null)
        setSelectedLocation(null)
        setFormData(emptyForm)
        setFormError(null)
    }

    // ── Form field handler ───────────────────────────────────────────────────

    const handleFormChange = (field: keyof LocationFormData, value: string | number) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    // ── CRUD handlers ────────────────────────────────────────────────────────

    const handleCreate = async () => {
        if (!formData.name.trim() || !formData.address.trim()) {
            setFormError('Name and address are required.')
            return
        }
        setSubmitting(true)
        setFormError(null)
        try {
            await FranchiseOwnerService.createLocation(formData)
            closeModal()
            await fetchLocations()
        } catch (err: any) {
            setFormError(err.message || 'Failed to create location')
        } finally {
            setSubmitting(false)
        }
    }

    const handleUpdate = async () => {
        if (!selectedLocation) return
        if (!formData.name.trim() || !formData.address.trim()) {
            setFormError('Name and address are required.')
            return
        }
        setSubmitting(true)
        setFormError(null)
        try {
            await FranchiseOwnerService.updateLocation(selectedLocation.id, formData)
            closeModal()
            await fetchLocations()
        } catch (err: any) {
            setFormError(err.message || 'Failed to update location')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!selectedLocation) return
        setSubmitting(true)
        setFormError(null)
        try {
            await FranchiseOwnerService.deleteLocation(selectedLocation.id)
            closeModal()
            await fetchLocations()
        } catch (err: any) {
            setFormError(err.message || 'Failed to delete location')
        } finally {
            setSubmitting(false)
        }
    }

    // ── Status filter change ─────────────────────────────────────────────────

    const handleStatusFilterChange = (value: string) => {
        setStatusFilter(value)
        setCurrentPage(1)
    }

    // ─── Render ──────────────────────────────────────────────────────────────

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Franchise Locations</h1>
                    <p className="text-gray-600 mt-1">Manage all locations in your franchise</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={openAddModal}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                >
                    <Plus className="w-5 h-5" />
                    Add Location
                </motion.button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.0 }}>
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-lg shadow-md">
                                    <Building2 className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-blue-700 font-medium">Total Locations</p>
                                    <p className="text-2xl font-bold text-blue-900">{totalLocations}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="bg-gradient-to-br from-green-500 to-green-600 p-2.5 rounded-lg shadow-md">
                                    <Users className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-green-700 font-medium">Total Students</p>
                                    <p className="text-2xl font-bold text-green-900">{totalStudents}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2.5 rounded-lg shadow-md">
                                    <DollarSign className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-purple-700 font-medium">Total Revenue</p>
                                    <p className="text-2xl font-bold text-purple-900">
                                        ${totalRevenue >= 1000 ? `${(totalRevenue / 1000).toFixed(1)}K` : totalRevenue.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-0">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2.5 rounded-lg shadow-md">
                                    <TrendingUp className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-orange-700 font-medium">Avg Occupancy</p>
                                    <p className="text-2xl font-bold text-orange-900">{avgOccupancy}%</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Search + Filter Bar */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <Input
                                placeholder="Search locations by name or address..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => handleStatusFilterChange(e.target.value)}
                            className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Statuses</option>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Error State */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
                >
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                    <button
                        onClick={fetchLocations}
                        className="ml-auto text-sm font-medium underline hover:no-underline"
                    >
                        Retry
                    </button>
                </motion.div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    <span className="ml-3 text-gray-600">Loading locations...</span>
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && locations.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20"
                >
                    <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-1">No locations found</h3>
                    <p className="text-gray-500 text-sm">
                        {debouncedSearch || statusFilter
                            ? 'Try adjusting your search or filter.'
                            : 'Get started by adding your first location.'}
                    </p>
                </motion.div>
            )}

            {/* Locations List */}
            {!loading && !error && locations.length > 0 && (
                <div className="grid grid-cols-1 gap-6">
                    <AnimatePresence>
                        {locations.map((location, idx) => (
                            <motion.div
                                key={location.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Card className="hover:shadow-lg transition-shadow">
                                    <CardContent className="pt-6">
                                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                                            {/* Info */}
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
                                                        <p className="text-sm text-gray-600 mb-1">
                                                            {location.address}, {location.city}, {location.state} {location.zipCode}
                                                        </p>
                                                        {location.manager && (
                                                            <p className="text-sm text-gray-600">
                                                                Manager: <span className="font-medium">{location.manager}</span>
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Stats */}
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full lg:w-auto">
                                                <div className="text-center">
                                                    <div className="flex items-center justify-center gap-1 mb-1">
                                                        <Users className="w-4 h-4 text-blue-600" />
                                                        <span className="text-sm text-gray-600">Students</span>
                                                    </div>
                                                    <p className="text-lg font-bold text-gray-900">{location.students}</p>
                                                </div>
                                                <div className="text-center">
                                                    <div className="flex items-center justify-center gap-1 mb-1">
                                                        <DollarSign className="w-4 h-4 text-green-600" />
                                                        <span className="text-sm text-gray-600">Revenue</span>
                                                    </div>
                                                    <p className="text-lg font-bold text-gray-900">
                                                        ${(location.revenue / 1000).toFixed(0)}K
                                                    </p>
                                                </div>
                                                <div className="text-center">
                                                    <div className="flex items-center justify-center gap-1 mb-1">
                                                        <TrendingUp className="w-4 h-4 text-purple-600" />
                                                        <span className="text-sm text-gray-600">Occupancy</span>
                                                    </div>
                                                    <p className="text-lg font-bold text-gray-900">{location.occupancyRate}%</p>
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
                    </AnimatePresence>
                </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                    <p className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages} &middot; {totalLocations} total locations
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={currentPage <= 1}
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                            .reduce<(number | string)[]>((acc, p, i, arr) => {
                                if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('...')
                                acc.push(p)
                                return acc
                            }, [])
                            .map((item, i) =>
                                typeof item === 'string' ? (
                                    <span key={`ellipsis-${i}`} className="px-2 text-gray-400">...</span>
                                ) : (
                                    <button
                                        key={item}
                                        onClick={() => setCurrentPage(item)}
                                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                            currentPage === item
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        {item}
                                    </button>
                                )
                            )}
                        <button
                            disabled={currentPage >= totalPages}
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* ─── MODALS ──────────────────────────────────────────────────────── */}
            <AnimatePresence>
                {modalMode && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                        onClick={closeModal}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                        >
                            {/* ── View Modal ── */}
                            {modalMode === 'view' && selectedLocation && (
                                <div>
                                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                        <h2 className="text-xl font-bold text-gray-900">Location Details</h2>
                                        <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                            <X className="w-5 h-5 text-gray-500" />
                                        </button>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-lg shadow-md">
                                                <MapPin className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900">{selectedLocation.name}</h3>
                                                <Badge variant={selectedLocation.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                                    {selectedLocation.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-3 text-sm">
                                            <div className="flex items-start gap-2">
                                                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                                <span className="text-gray-700">
                                                    {selectedLocation.address}, {selectedLocation.city}, {selectedLocation.state} {selectedLocation.zipCode}
                                                </span>
                                            </div>
                                            {selectedLocation.phone && (
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                    <span className="text-gray-700">{selectedLocation.phone}</span>
                                                </div>
                                            )}
                                            {selectedLocation.email && (
                                                <div className="flex items-center gap-2">
                                                    <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                    <span className="text-gray-700">{selectedLocation.email}</span>
                                                </div>
                                            )}
                                            {selectedLocation.manager && (
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                    <span className="text-gray-700">Manager: {selectedLocation.manager}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                                                <p className="text-xs text-blue-600 font-medium">Students</p>
                                                <p className="text-lg font-bold text-blue-900">{selectedLocation.students}</p>
                                            </div>
                                            <div className="text-center p-3 bg-green-50 rounded-lg">
                                                <p className="text-xs text-green-600 font-medium">Revenue</p>
                                                <p className="text-lg font-bold text-green-900">${(selectedLocation.revenue / 1000).toFixed(0)}K</p>
                                            </div>
                                            <div className="text-center p-3 bg-purple-50 rounded-lg">
                                                <p className="text-xs text-purple-600 font-medium">Occupancy</p>
                                                <p className="text-lg font-bold text-purple-900">{selectedLocation.occupancyRate}%</p>
                                            </div>
                                        </div>

                                        {selectedLocation.createdAt && (
                                            <p className="text-xs text-gray-400 pt-2">
                                                Created: {new Date(selectedLocation.createdAt).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                    <div className="p-6 border-t border-gray-100">
                                        <button
                                            onClick={closeModal}
                                            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ── Add / Edit Modal ── */}
                            {(modalMode === 'add' || modalMode === 'edit') && (
                                <div>
                                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                        <h2 className="text-xl font-bold text-gray-900">
                                            {modalMode === 'add' ? 'Add New Location' : 'Edit Location'}
                                        </h2>
                                        <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                            <X className="w-5 h-5 text-gray-500" />
                                        </button>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        {formError && (
                                            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                                {formError}
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                            <Input
                                                value={formData.name}
                                                onChange={(e) => handleFormChange('name', e.target.value)}
                                                placeholder="Location name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                                            <Input
                                                value={formData.address}
                                                onChange={(e) => handleFormChange('address', e.target.value)}
                                                placeholder="Street address"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                                <Input
                                                    value={formData.city}
                                                    onChange={(e) => handleFormChange('city', e.target.value)}
                                                    placeholder="City"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                                <Input
                                                    value={formData.state}
                                                    onChange={(e) => handleFormChange('state', e.target.value)}
                                                    placeholder="State"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                                                <Input
                                                    value={formData.zipCode}
                                                    onChange={(e) => handleFormChange('zipCode', e.target.value)}
                                                    placeholder="Zip code"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                                                <Input
                                                    type="number"
                                                    value={formData.capacity || ''}
                                                    onChange={(e) => handleFormChange('capacity', parseInt(e.target.value) || 0)}
                                                    placeholder="Max capacity"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                                <Input
                                                    value={formData.phone}
                                                    onChange={(e) => handleFormChange('phone', e.target.value)}
                                                    placeholder="Phone number"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                                <Input
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => handleFormChange('email', e.target.value)}
                                                    placeholder="Email address"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 p-6 border-t border-gray-100">
                                        <button
                                            onClick={closeModal}
                                            disabled={submitting}
                                            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={modalMode === 'add' ? handleCreate : handleUpdate}
                                            disabled={submitting}
                                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                            {modalMode === 'add' ? 'Create Location' : 'Save Changes'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ── Delete Confirmation Modal ── */}
                            {modalMode === 'delete' && selectedLocation && (
                                <div>
                                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                        <h2 className="text-xl font-bold text-gray-900">Delete Location</h2>
                                        <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                            <X className="w-5 h-5 text-gray-500" />
                                        </button>
                                    </div>
                                    <div className="p-6">
                                        {formError && (
                                            <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                                {formError}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-3 bg-red-100 rounded-full">
                                                <Trash2 className="w-6 h-6 text-red-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    Are you sure you want to delete &quot;{selectedLocation.name}&quot;?
                                                </p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    This action cannot be undone. All data associated with this location will be permanently removed.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 p-6 border-t border-gray-100">
                                        <button
                                            onClick={closeModal}
                                            disabled={submitting}
                                            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            disabled={submitting}
                                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                            Delete Location
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
