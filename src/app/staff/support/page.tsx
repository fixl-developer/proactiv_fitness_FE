'use client';

import React, { useState, useEffect } from 'react';
import { supportTicketService, SupportTicket } from '@/services/supportTicketService';
import { TicketComments } from '@/components/support/TicketComments';
import { TicketHistoryComponent } from '@/components/support/TicketHistory';

export default function StaffSupportPage() {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [statusFilter, setStatusFilter] = useState('');
    const [stats, setStats] = useState({ open: 0, inProgress: 0, pending: 0, total: 0 });
    const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'history'>('details');

    useEffect(() => {
        loadTickets();
        loadStats();
    }, [page, statusFilter]);

    const loadTickets = async () => {
        try {
            setLoading(true);
            const response = await supportTicketService.getAssignedTickets(page, 20, statusFilter || undefined);
            if (response.success) {
                setTickets(response.data);
                setTotal(response.pagination?.total || 0);
            }
        } catch (error) {
            console.error('Error loading tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const response = await supportTicketService.getStatistics();
            if (response.success) {
                setStats(response.data);
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    const handleUpdateTicket = async (updates: Partial<SupportTicket>) => {
        if (!selectedTicket?._id) return;

        try {
            const response = await supportTicketService.updateTicket(selectedTicket._id, updates);
            if (response.success) {
                setSelectedTicket(response.data);
                await loadTickets();
            }
        } catch (error) {
            console.error('Error updating ticket:', error);
        }
    };

    const getStatusColor = (status: string) => {
        const colors: { [key: string]: string } = {
            open: 'bg-red-100 text-red-800',
            'in-progress': 'bg-yellow-100 text-yellow-800',
            pending: 'bg-blue-100 text-blue-800',
            resolved: 'bg-green-100 text-green-800',
            closed: 'bg-gray-100 text-gray-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getPriorityColor = (priority: string) => {
        const colors: { [key: string]: string } = {
            low: 'bg-blue-100 text-blue-800',
            medium: 'bg-yellow-100 text-yellow-800',
            high: 'bg-orange-100 text-orange-800',
            critical: 'bg-red-100 text-red-800',
        };
        return colors[priority] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">My Support Tickets</h1>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-lg p-4">
                        <p className="text-gray-600 text-sm">Total Assigned</p>
                        <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                        <p className="text-gray-600 text-sm">Open</p>
                        <p className="text-2xl font-bold text-red-600">{stats.open}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                        <p className="text-gray-600 text-sm">In Progress</p>
                        <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                        <p className="text-gray-600 text-sm">Pending</p>
                        <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Tickets List */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg p-4 sticky top-4">
                            <h3 className="font-semibold mb-4">Filter by Status</h3>

                            <div className="space-y-2">
                                <button
                                    onClick={() => {
                                        setStatusFilter('');
                                        setPage(1);
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded ${statusFilter === '' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                                        }`}
                                >
                                    All Tickets
                                </button>
                                <button
                                    onClick={() => {
                                        setStatusFilter('open');
                                        setPage(1);
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded ${statusFilter === 'open' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                                        }`}
                                >
                                    Open
                                </button>
                                <button
                                    onClick={() => {
                                        setStatusFilter('in-progress');
                                        setPage(1);
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded ${statusFilter === 'in-progress' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                                        }`}
                                >
                                    In Progress
                                </button>
                                <button
                                    onClick={() => {
                                        setStatusFilter('pending');
                                        setPage(1);
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded ${statusFilter === 'pending' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                                        }`}
                                >
                                    Pending
                                </button>
                                <button
                                    onClick={() => {
                                        setStatusFilter('resolved');
                                        setPage(1);
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded ${statusFilter === 'resolved' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                                        }`}
                                >
                                    Resolved
                                </button>
                            </div>

                            {/* Tickets List */}
                            <div className="space-y-2 mt-4 max-h-96 overflow-y-auto">
                                {loading ? (
                                    <div className="text-center py-4">Loading...</div>
                                ) : tickets.length === 0 ? (
                                    <div className="text-center py-4 text-gray-500">No tickets</div>
                                ) : (
                                    tickets.map((ticket) => (
                                        <button
                                            key={ticket._id}
                                            onClick={() => setSelectedTicket(ticket)}
                                            className={`w-full text-left p-3 rounded border transition ${selectedTicket?._id === ticket._id
                                                    ? 'bg-blue-50 border-blue-500'
                                                    : 'hover:bg-gray-50'
                                                }`}
                                        >
                                            <p className="font-semibold text-sm">{ticket.ticketId}</p>
                                            <p className="text-xs text-gray-600 truncate">{ticket.subject}</p>
                                            <div className="flex gap-1 mt-2">
                                                <span className={`text-xs px-2 py-1 rounded ${getStatusColor(ticket.status)}`}>
                                                    {ticket.status}
                                                </span>
                                                <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(ticket.priority)}`}>
                                                    {ticket.priority}
                                                </span>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>

                            {/* Pagination */}
                            {total > 20 && (
                                <div className="mt-4 flex justify-between text-sm">
                                    <button
                                        onClick={() => setPage(Math.max(1, page - 1))}
                                        disabled={page === 1}
                                        className="px-2 py-1 border rounded hover:bg-gray-100 disabled:bg-gray-100"
                                    >
                                        Prev
                                    </button>
                                    <span>
                                        {page} / {Math.ceil(total / 20)}
                                    </span>
                                    <button
                                        onClick={() => setPage(page + 1)}
                                        disabled={page >= Math.ceil(total / 20)}
                                        className="px-2 py-1 border rounded hover:bg-gray-100 disabled:bg-gray-100"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Ticket Details */}
                    <div className="lg:col-span-3">
                        {selectedTicket ? (
                            <div className="bg-white rounded-lg p-8">
                                {/* Header */}
                                <div className="mb-6 pb-6 border-b">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h2 className="text-2xl font-bold">{selectedTicket.ticketId}</h2>
                                            <p className="text-gray-600">{selectedTicket.subject}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className={`px-3 py-1 rounded text-sm ${getStatusColor(selectedTicket.status)}`}>
                                                {selectedTicket.status}
                                            </span>
                                            <span className={`px-3 py-1 rounded text-sm ${getPriorityColor(selectedTicket.priority)}`}>
                                                {selectedTicket.priority}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Customer Info */}
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-600">Customer</p>
                                            <p className="font-semibold">{selectedTicket.customer.name}</p>
                                            <p className="text-gray-600">{selectedTicket.customer.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Category</p>
                                            <p className="font-semibold">{selectedTicket.category}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Status</label>
                                        <select
                                            value={selectedTicket.status}
                                            onChange={(e) => handleUpdateTicket({ status: e.target.value as any })}
                                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="open">Open</option>
                                            <option value="in-progress">In Progress</option>
                                            <option value="pending">Pending</option>
                                            <option value="resolved">Resolved</option>
                                            <option value="closed">Closed</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Priority</label>
                                        <select
                                            value={selectedTicket.priority}
                                            onChange={(e) => handleUpdateTicket({ priority: e.target.value as any })}
                                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                            <option value="critical">Critical</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="mb-6">
                                    <h3 className="font-semibold mb-2">Description</h3>
                                    <p className="text-gray-700 whitespace-pre-wrap">{selectedTicket.description}</p>
                                </div>

                                {/* Tabs */}
                                <div className="border-b mb-6">
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setActiveTab('details')}
                                            className={`px-4 py-2 border-b-2 ${activeTab === 'details'
                                                    ? 'border-blue-600 text-blue-600'
                                                    : 'border-transparent text-gray-600'
                                                }`}
                                        >
                                            Details
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('comments')}
                                            className={`px-4 py-2 border-b-2 ${activeTab === 'comments'
                                                    ? 'border-blue-600 text-blue-600'
                                                    : 'border-transparent text-gray-600'
                                                }`}
                                        >
                                            Comments
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('history')}
                                            className={`px-4 py-2 border-b-2 ${activeTab === 'history'
                                                    ? 'border-blue-600 text-blue-600'
                                                    : 'border-transparent text-gray-600'
                                                }`}
                                        >
                                            History
                                        </button>
                                    </div>
                                </div>

                                {/* Tab Content */}
                                {activeTab === 'details' && (
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm text-gray-600">Created</p>
                                            <p>{new Date(selectedTicket.createdAt).toLocaleString()}</p>
                                        </div>
                                        {selectedTicket.resolvedAt && (
                                            <div>
                                                <p className="text-sm text-gray-600">Resolved</p>
                                                <p>{new Date(selectedTicket.resolvedAt).toLocaleString()}</p>
                                            </div>
                                        )}
                                        {selectedTicket.resolution && (
                                            <div>
                                                <p className="text-sm text-gray-600">Resolution</p>
                                                <p className="whitespace-pre-wrap">{selectedTicket.resolution}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'comments' && (
                                    <TicketComments ticketId={selectedTicket._id || ''} isStaff={true} />
                                )}

                                {activeTab === 'history' && (
                                    <TicketHistoryComponent ticketId={selectedTicket._id || ''} />
                                )}
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg p-8 text-center text-gray-500">
                                Select a ticket to view details
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
