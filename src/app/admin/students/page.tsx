'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, RefreshCw, Users, UserPlus, Edit, Trash2, Eye, X, Save } from 'lucide-react'
import { apiClient } from '@/services/api/client'
import { toast } from 'sonner'

interface Student {
    id: string
    _id?: string
    firstName: string
    lastName: string
    email?: string
    dateOfBirth?: string
    gender?: string
    parentName?: string
    parent?: { firstName?: string; lastName?: string; name?: string }
    programName?: string
    program?: { name?: string }
    locationName?: string
    location?: { name?: string }
    status?: string
    enrollmentDate?: string
    createdAt?: string
}

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [totalPages, setTotalPages] = useState(1)
    const limit = 20

    const loadStudents = useCallback(async () => {
        try {
            setLoading(true)
            const params: Record<string, string | number> = { page, limit }
            if (statusFilter !== 'all') params.status = statusFilter
            if (searchTerm) params.search = searchTerm

            const response = await apiClient.get<any>('/admin/users', { params: { ...params, role: 'USER' } })
            const list = response?.users || response?.data || (Array.isArray(response) ? response : [])
            const totalCount = response?.total ?? response?.meta?.total ?? list.length
            const pages = response?.totalPages ?? response?.meta?.totalPages ?? Math.ceil(totalCount / limit)

            setStudents(list)
            setTotal(totalCount)
            setTotalPages(pages)
        } catch (error: any) {
            console.error('Failed to load students:', error)
            if (error?.response?.status !== 404) {
                toast.error('Failed to load students')
            }
            setStudents([])
            setTotal(0)
        } finally {
            setLoading(false)
        }
    }, [page, statusFilter, searchTerm])

    useEffect(() => {
        loadStudents()
    }, [loadStudents])

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) return
        try {
            await apiClient.delete(`/users/${id}`)
            toast.success(`Student "${name}" deleted`)
            loadStudents()
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to delete student')
        }
    }

    const handleStatusToggle = async (id: string, currentStatus: string, name: string) => {
        const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
        try {
            await apiClient.patch(`/users/${id}/status`, { status: newStatus })
            toast.success(`Student "${name}" ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'}`)
            loadStudents()
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to update status')
        }
    }

    const getParentName = (s: Student) => {
        if (s.parentName) return s.parentName
        if (s.parent?.name) return s.parent.name
        if (s.parent?.firstName) return `${s.parent.firstName} ${s.parent.lastName || ''}`.trim()
        return '-'
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Students</h1>
                    <p className="text-gray-600 mt-1">Manage student accounts</p>
                </div>
                <button onClick={() => loadStudents()} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-4">
                    <p className="text-xs text-gray-600 font-medium">Total Students</p>
                    <p className="text-2xl font-bold text-gray-900">{total}</p>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-green-50 to-emerald-100 p-4">
                    <p className="text-xs text-gray-600 font-medium">Active</p>
                    <p className="text-2xl font-bold text-gray-900">{students.filter(s => s.status === 'ACTIVE').length}</p>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 p-4">
                    <p className="text-xs text-gray-600 font-medium">Inactive</p>
                    <p className="text-2xl font-bold text-gray-900">{students.filter(s => s.status !== 'ACTIVE').length}</p>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search students..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setPage(1) }}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600 mt-4">Loading students...</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parent</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {students.map((student) => (
                                    <tr key={student.id || student._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <span className="text-blue-600 font-semibold text-sm">
                                                        {student.firstName?.[0] || ''}{student.lastName?.[0] || ''}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{student.firstName} {student.lastName}</div>
                                                    {student.dateOfBirth && <div className="text-xs text-gray-500">DOB: {new Date(student.dateOfBirth).toLocaleDateString()}</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{student.email || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{getParentName(student)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${student.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {student.status || 'ACTIVE'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => handleStatusToggle(student.id || student._id || '', student.status || 'ACTIVE', `${student.firstName} ${student.lastName}`)}
                                                    className={`p-2 rounded transition ${student.status === 'ACTIVE' ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`}
                                                    title={student.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                                >
                                                    <Users className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(student.id || student._id || '', `${student.firstName} ${student.lastName}`)}
                                                    className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded transition"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {students.length === 0 && (
                        <div className="text-center py-12">
                            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No students found</p>
                        </div>
                    )}
                </div>
            )}

            {/* Pagination */}
            {total > 0 && (
                <div className="flex items-center justify-between bg-white px-6 py-4 rounded-lg shadow">
                    <div className="text-sm text-gray-700">
                        Showing {Math.min((page - 1) * limit + 1, total)} to {Math.min(page * limit, total)} of {total}
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition">Previous</button>
                        <span className="px-3 py-2 text-sm text-gray-600">Page {page} of {totalPages}</span>
                        <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition">Next</button>
                    </div>
                </div>
            )}
        </div>
    )
}
