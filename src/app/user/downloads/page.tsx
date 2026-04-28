'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
    Download,
    FileText,
    AlertCircle,
    CheckCircle2,
    Loader,
    Search,
    Filter,
    Eye,
    Share2,
    Trash2,
    Calendar,
    HardDrive
} from 'lucide-react'
import downloadsService from '@/services/modules/downloads.service'

interface DownloadItem {
    id: string
    name: string
    type: 'certificate' | 'report' | 'material' | 'document'
    category: string
    size: string
    downloadCount: number
    createdAt: string
    url: string
    description?: string
}

export default function DownloadsPage() {
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterType, setFilterType] = useState<'all' | 'certificate' | 'report' | 'material' | 'document'>('all')
    const [downloads, setDownloads] = useState<DownloadItem[]>([])

    useEffect(() => {
        loadDownloads()
    }, [])

    const loadDownloads = async () => {
        try {
            setLoading(true)
            const data = await downloadsService.getDownloads()
            setDownloads(data || [])
        } catch (error) {
            console.error('Failed to load downloads:', error)
            setMessage({ type: 'error', text: 'Failed to load downloads' })
        } finally {
            setLoading(false)
        }
    }

    const handleDownload = async (item: DownloadItem) => {
        try {
            await downloadsService.downloadFile(item.id)
            setMessage({ type: 'success', text: `${item.name} downloaded successfully` })
            setTimeout(() => setMessage(null), 3000)
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to download file' })
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await downloadsService.deleteDownload(id)
            setDownloads(prev => prev.filter(d => d.id !== id))
            setMessage({ type: 'success', text: 'File deleted successfully' })
            setTimeout(() => setMessage(null), 3000)
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to delete file' })
        }
    }

    const handleShare = async (item: DownloadItem) => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: item.name,
                    text: item.description || item.name,
                    url: item.url
                })
            } else {
                // Fallback: copy to clipboard
                await navigator.clipboard.writeText(item.url)
                setMessage({ type: 'success', text: 'Link copied to clipboard' })
                setTimeout(() => setMessage(null), 3000)
            }
        } catch (error) {
            console.error('Failed to share:', error)
        }
    }

    const filteredDownloads = downloads.filter(item => {
        const matchesType = filterType === 'all' || item.type === filterType
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.category.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesType && matchesSearch
    })

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'certificate':
                return '🏆'
            case 'report':
                return '📊'
            case 'material':
                return '📚'
            case 'document':
                return '📄'
            default:
                return '📁'
        }
    }

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'certificate':
                return 'bg-yellow-50 text-yellow-700 border-yellow-200'
            case 'report':
                return 'bg-blue-50 text-blue-700 border-blue-200'
            case 'material':
                return 'bg-purple-50 text-purple-700 border-purple-200'
            case 'document':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200'
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200'
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader className="w-8 h-8 text-emerald-600 animate-spin" />
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Downloads</h1>
                <p className="text-gray-600">Access your certificates, reports, and training materials</p>
            </motion.div>

            {/* Message Alert */}
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${message.type === 'success'
                        ? 'bg-emerald-50 border border-emerald-200'
                        : 'bg-red-50 border border-red-200'
                        }`}
                >
                    {message.type === 'success' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    ) : (
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    )}
                    <span className={message.type === 'success' ? 'text-emerald-800' : 'text-red-800'}>
                        {message.text}
                    </span>
                </motion.div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Total Downloads', value: downloads.length, icon: '📥' },
                    { label: 'Certificates', value: downloads.filter(d => d.type === 'certificate').length, icon: '🏆' },
                    { label: 'Reports', value: downloads.filter(d => d.type === 'report').length, icon: '📊' },
                    { label: 'Materials', value: downloads.filter(d => d.type === 'material').length, icon: '📚' },
                ].map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border border-emerald-200 p-6"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                            <span className="text-3xl">{stat.icon}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search downloads..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-gray-600" />
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as any)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                        <option value="all">All Types</option>
                        <option value="certificate">Certificates</option>
                        <option value="report">Reports</option>
                        <option value="material">Materials</option>
                        <option value="document">Documents</option>
                    </select>
                </div>
            </div>

            {/* Downloads List */}
            {filteredDownloads.length === 0 ? (
                <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No downloads found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDownloads.map((item, idx) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-start space-x-3 flex-1">
                                    <span className="text-3xl">{getTypeIcon(item.type)}</span>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                                        <p className="text-xs text-gray-500 mt-1">{item.category}</p>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getTypeColor(item.type)}`}>
                                    {item.type}
                                </span>
                            </div>

                            {/* Description */}
                            {item.description && (
                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>
                            )}

                            {/* Meta Info */}
                            <div className="space-y-2 mb-4 text-xs text-gray-500">
                                <div className="flex items-center space-x-2">
                                    <HardDrive className="w-3 h-3" />
                                    <span>{item.size}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Calendar className="w-3 h-3" />
                                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Download className="w-3 h-3" />
                                    <span>{item.downloadCount} downloads</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-2">
                                <Button
                                    onClick={() => handleDownload(item)}
                                    size="sm"
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                    <Download className="w-4 h-4 mr-1" />
                                    Download
                                </Button>
                                <Button
                                    onClick={() => handleShare(item)}
                                    size="sm"
                                    variant="outline"
                                    className="p-2"
                                    title="Share"
                                >
                                    <Share2 className="w-4 h-4" />
                                </Button>
                                <Button
                                    onClick={() => handleDelete(item.id)}
                                    size="sm"
                                    variant="outline"
                                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Info Box */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6"
            >
                <h3 className="font-semibold text-blue-900 mb-3">About Your Downloads</h3>
                <ul className="space-y-2 text-sm text-blue-800">
                    <li>• <strong>Certificates:</strong> Your earned certificates and achievements</li>
                    <li>• <strong>Reports:</strong> Progress reports and performance analytics</li>
                    <li>• <strong>Materials:</strong> Training guides, workout plans, and nutrition information</li>
                    <li>• <strong>Documents:</strong> Invoices, receipts, and other important documents</li>
                </ul>
            </motion.div>
        </div>
    )
}
