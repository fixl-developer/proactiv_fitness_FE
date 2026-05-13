'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, Edit, Trash2, RefreshCw, MapPin, Building2, Users, X, Save } from 'lucide-react'
import { apiClient } from '@/services/api/client'
import { extractList } from '@/utils/apiResponse'
import { toast } from 'sonner'

interface Location {
    id: string
    _id?: string
    name: string
    address?: string
    city?: string
    state?: string
    country?: string
    phone?: string
    email?: string
    capacity?: number
    status?: string
    businessUnitId?: string
    businessUnitName?: string
    managerId?: string
    managerName?: string
    createdAt?: string
}

export default function LocationsPage() {
    const [locations, setLocations] = useState<Location[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        city: '',
        state: '',
        country: '',
        phone: '',
        email: '',
        capacity: 0,
        status: 'active',
    })

    const loadLocations = useCallback(async () => {
        try {
            setLoading(true)
            const params: Record<string, string> = { page: '1', limit: '200' }
            if (searchTerm) params.search = searchTerm

            // Backend mounts location CRUD at /locations (the /admin/business-config/*
            // alias namespace was never wired up). extractList tolerates the
            // {success, data:[...]} shape Location routes return.
            const response = await apiClient.get<any>('/locations', { params })
            setLocations(extractList<Location>(response))
        } catch (error: any) {
            console.error('Failed to load locations:', error)
            if (error?.response?.status !== 404) {
                toast.error('Failed to load locations')
            }
            setLocations([])
        } finally {
            setLoading(false)
        }
    }, [searchTerm])

    useEffect(() => {
        loadLocations()
    }, [loadLocations])

    const resetForm = () => {
        setFormData({ name: '', address: '', city: '', state: '', country: '', phone: '', email: '', capacity: 0, status: 'active' })
        setEditingId(null)
        setShowForm(false)
    }

    const handleEdit = (location: Location) => {
        setFormData({
            name: location.name || '',
            address: location.address || '',
            city: location.city || '',
            state: location.state || '',
            country: location.country || '',
            phone: location.phone || '',
            email: location.email || '',
            capacity: location.capacity || 0,
            status: location.status || 'active',
        })
        setEditingId(location.id || location._id || '')
        setShowForm(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.name.trim()) {
            toast.error('Location name is required')
            return
        }

        setSaving(true)
        try {
            if (editingId) {
                await apiClient.put(`/locations/${editingId}`, formData)
                toast.success('Location updated successfully')
            } else {
                await apiClient.post('/locations', formData)
                toast.success('Location created successfully')
            }
            resetForm()
            loadLocations()
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to save location')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) return
        try {
            await apiClient.delete(`/locations/${id}`)
            toast.success(`Location "${name}" deleted`)
            loadLocations()
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to delete location')
        }
    }

    const filtered = locations.filter(l =>
        l.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.address?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Locations</h1>
                    <p className="text-gray-600 mt-1">Manage all locations</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => loadLocations()} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={() => { resetForm(); setShowForm(true) }}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        <Plus className="w-4 h-4" />
                        Add Location
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-4">
                    <div className="flex items-center gap-2 mb-2"><Building2 className="w-5 h-5 text-blue-600" /></div>
                    <p className="text-xs text-gray-600 font-medium">Total Locations</p>
                    <p className="text-2xl font-bold text-gray-900">{locations.length}</p>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-green-50 to-emerald-100 p-4">
                    <div className="flex items-center gap-2 mb-2"><MapPin className="w-5 h-5 text-green-600" /></div>
                    <p className="text-xs text-gray-600 font-medium">Active</p>
                    <p className="text-2xl font-bold text-gray-900">{locations.filter(l => l.status === 'active').length}</p>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 p-4">
                    <div className="flex items-center gap-2 mb-2"><Building2 className="w-5 h-5 text-gray-600" /></div>
                    <p className="text-xs text-gray-600 font-medium">Inactive</p>
                    <p className="text-2xl font-bold text-gray-900">{locations.filter(l => l.status !== 'active').length}</p>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search locations by name, city, or address..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Create/Edit Form */}
            {showForm && (
                <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">{editingId ? 'Edit Location' : 'Create New Location'}</h2>
                        <button onClick={resetForm} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5 text-gray-500" /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                                <input type="number" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                <input type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                <input type="text" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                <input type="text" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                        <div className="flex gap-3">
                            <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition">
                                {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                                {editingId ? 'Update' : 'Create'} Location
                            </button>
                            <button type="button" onClick={resetForm} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Table */}
            {loading ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600 mt-4">Loading locations...</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filtered.map((location) => (
                                    <tr key={location.id || location._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <MapPin className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{location.name}</div>
                                                    {location.businessUnitName && <div className="text-xs text-gray-500">{location.businessUnitName}</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {[location.address, location.city, location.state, location.country].filter(Boolean).join(', ') || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            <div>{location.phone || '-'}</div>
                                            <div className="text-xs text-gray-400">{location.email || ''}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {location.capacity || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${location.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {location.status || 'active'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => handleEdit(location)} className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded transition" title="Edit">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(location.id || location._id || '', location.name)} className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded transition" title="Delete">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filtered.length === 0 && (
                        <div className="text-center py-12">
                            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No locations found</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
