'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import SupportService from '@/services/modules/support.service'
import { Plus, Search, Filter, AlertCircle } from 'lucide-react'

export default function SupportTickets() {
    const router = useRouter()
    const { isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [tickets, setTickets] = useState<any[]>([])
    const [filters, setFilters] = useState({ status: '', priority: '', page: 1, limit: 10 })
    const [total, setTotal] = useState(0)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        const loadTickets = async () => {
            setLoading(true)
            setError(null)
            try {
                const data = await SupportService.getTickets(filters)
                setTickets(data?.tickets || [])
                setTotal(data?.total || 0)
            } catch {
                // API not available yet — show empty state
                setTickets([])
                setTotal(0)
            } finally {
                setLoading(false)
            }
        }

        loadTickets()
    }, [isAuthenticated, router, filters])

    const handleSearch = async () => {
        if (!searchQuery.trim()) return
        try {
            const results = await SupportService.searchTickets(searchQuery)
            setTickets(results || [])
        } catch {
            // API not available yet
        }
    }

    if (!isAuthenticated) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Support Tickets</h1>
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        New Ticket
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {/* Search and Filters */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex gap-4 mb-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search tickets..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <button data-testid="btn-staff-tickets-1" onClick={handleSearch} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                            Search
                        </button>
                    </div>

                    <div className="flex gap-4">
                        <select data-testid="select-staff-tickets-2"
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Status</option>
                            <option value="open">Open</option>
                            <option value="in-progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                        </select>

                        <select data-testid="select-staff-tickets-3"
                            value={filters.priority}
                            onChange={(e) => setFilters({ ...filters, priority: e.target.value, page: 1 })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Priority</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>
                    </div>
                </div>

                {/* Tickets Table */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading tickets...</p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Ticket #</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Subject</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Customer</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Priority</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Status</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Assigned</th>
                                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tickets.map((ticket) => (
                                    <tr key={ticket.id} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
                                        <td className="py-3 px-6 text-blue-600 font-medium">{ticket.ticketNumber}</td>
                                        <td className="py-3 px-6 text-gray-900">{ticket.subject}</td>
                                        <td className="py-3 px-6 text-gray-600">{ticket.customerName}</td>
                                        <td className="py-3 px-6">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${ticket.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                                    ticket.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                                        ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-green-100 text-green-800'
                                                }`}>
                                                {ticket.priority}
                                            </span>
                                        </td>
                                        <td className="py-3 px-6">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${ticket.status === 'open' ? 'bg-blue-100 text-blue-800' :
                                                    ticket.status === 'in-progress' ? 'bg-purple-100 text-purple-800' :
                                                        ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                                            'bg-gray-100 text-gray-800'
                                                }`}>
                                                {ticket.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-6 text-gray-600">{ticket.assignedToName || 'Unassigned'}</td>
                                        <td className="py-3 px-6 text-gray-600">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                <div className="mt-6 flex justify-between items-center">
                    <p className="text-gray-600">Showing {tickets.length} of {total} tickets</p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
                            disabled={filters.page === 1}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                            disabled={tickets.length < filters.limit}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
