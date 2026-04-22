'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, ChevronLeft, ChevronRight, AlertCircle, FileText, Filter } from 'lucide-react'
import { toast } from 'sonner'
import { SystemLogsService, SystemLog } from '@/services/systemService'
import { getErrorMessage } from '@/utils/apiErrorHandler'

export default function SystemLogsPage() {
    const [logs, setLogs] = useState<SystemLog[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [levelFilter, setLevelFilter] = useState('')
    const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null)

    const levels = ['info', 'warning', 'error', 'critical']

    // Load logs
    const loadLogs = async () => {
        try {
            setLoading(true)
            const response = await SystemLogsService.getAll({
                page: currentPage,
                limit: 10,
                search: searchTerm,
                level: levelFilter,
            })
            setLogs(response.data || [])
            setTotalPages(response.pagination?.totalPages || 1)
        } catch (error) {
            console.error('Error loading logs:', error)
            toast.error('Failed to load system logs')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadLogs()
    }, [currentPage, searchTerm, levelFilter])

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'info':
                return 'bg-blue-100 text-blue-800'
            case 'warning':
                return 'bg-yellow-100 text-yellow-800'
            case 'error':
                return 'bg-red-100 text-red-800'
            case 'critical':
                return 'bg-red-200 text-red-900'
            default:
                return 'bg-slate-100 text-slate-800'
        }
    }

    const getLevelIcon = (level: string) => {
        switch (level) {
            case 'info':
                return '🔵'
            case 'warning':
                return '⚠️'
            case 'error':
                return '❌'
            case 'critical':
                return '🔴'
            default:
                return '⚪'
        }
    }

    const formatTimestamp = (timestamp: string) => {
        try {
            const date = new Date(timestamp)
            return date.toLocaleString()
        } catch {
            return timestamp
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <FileText className="w-8 h-8 text-blue-600" />
                        <h1 className="text-4xl font-bold text-slate-900">System Logs</h1>
                    </div>
                    <p className="text-slate-600">View system activity and event logs (read-only)</p>
                </motion.div>

                {/* Controls */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 flex gap-4 items-center flex-wrap"
                >
                    <div className="flex-1 min-w-xs relative">
                        <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search logs..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value)
                                setCurrentPage(1)
                            }}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-slate-600" />
                        <select
                            value={levelFilter}
                            onChange={(e) => {
                                setLevelFilter(e.target.value)
                                setCurrentPage(1)
                            }}
                            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Levels</option>
                            {levels.map((level) => (
                                <option key={level} value={level}>
                                    {level.charAt(0).toUpperCase() + level.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                </motion.div>

                {/* Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg shadow-lg overflow-hidden"
                >
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="mt-4 text-slate-600">Loading system logs...</p>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="p-8 text-center">
                            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                            <p className="text-slate-600">No logs found</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Timestamp</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Level</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Service</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Message</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {logs.map((log) => (
                                            <tr key={log.id} className="hover:bg-slate-50 transition">
                                                <td className="px-6 py-4 text-sm text-slate-600 font-mono whitespace-nowrap">
                                                    {formatTimestamp(log.timestamp)}
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize inline-flex items-center gap-1 ${getLevelColor(log.level)}`}>
                                                        <span>{getLevelIcon(log.level)}</span>
                                                        {log.level}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600 font-mono">{log.service}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600 truncate max-w-xs">{log.message}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    <button
                                                        onClick={() => setSelectedLog(log)}
                                                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-xs font-medium"
                                                    >
                                                        View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                                <p className="text-sm text-slate-600">
                                    Page {currentPage} of {totalPages}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 text-slate-600 hover:bg-slate-100 rounded disabled:opacity-50 transition"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="p-2 text-slate-600 hover:bg-slate-100 rounded disabled:opacity-50 transition"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </motion.div>

                {/* Log Details Modal */}
                {selectedLog && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-slate-900">Log Details</h3>
                                <button
                                    onClick={() => setSelectedLog(null)}
                                    className="text-slate-400 hover:text-slate-600 transition"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Timestamp */}
                                <div>
                                    <label className="text-sm font-medium text-slate-600">Timestamp</label>
                                    <p className="text-slate-900 font-mono">{formatTimestamp(selectedLog.timestamp)}</p>
                                </div>

                                {/* Level */}
                                <div>
                                    <label className="text-sm font-medium text-slate-600">Level</label>
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${getLevelColor(selectedLog.level)}`}>
                                        {selectedLog.level}
                                    </span>
                                </div>

                                {/* Service */}
                                <div>
                                    <label className="text-sm font-medium text-slate-600">Service</label>
                                    <p className="text-slate-900 font-mono">{selectedLog.service}</p>
                                </div>

                                {/* Message */}
                                <div>
                                    <label className="text-sm font-medium text-slate-600">Message</label>
                                    <p className="text-slate-900 break-words">{selectedLog.message}</p>
                                </div>

                                {/* Details */}
                                {selectedLog.details && (
                                    <div>
                                        <label className="text-sm font-medium text-slate-600">Details</label>
                                        <pre className="bg-slate-50 p-3 rounded text-xs text-slate-700 overflow-x-auto">
                                            {selectedLog.details}
                                        </pre>
                                    </div>
                                )}

                                {/* ID */}
                                <div>
                                    <label className="text-sm font-medium text-slate-600">Log ID</label>
                                    <p className="text-slate-900 font-mono text-xs">{selectedLog.id}</p>
                                </div>
                            </div>

                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={() => setSelectedLog(null)}
                                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(JSON.stringify(selectedLog, null, 2))
                                        toast.success('Log details copied to clipboard')
                                    }}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                    Copy JSON
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    )
}
