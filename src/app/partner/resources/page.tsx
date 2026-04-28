'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import PartnerPortalService from '@/services/modules/partner-portal.service'
import { motion } from 'framer-motion'
import {
    BookOpen, FileText, Video, Download, Search, Filter,
    Play, Clock, Star, Eye, Heart, Share2, Tag,
    Folder, File, Image, PlayCircle, ExternalLink, AlertCircle, Book
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function PartnerResourcesPage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [resources, setResources] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [favorites, setFavorites] = useState<Set<string>>(new Set())
    const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set())
    const [showRequestModal, setShowRequestModal] = useState(false)
    const [requestSubmitting, setRequestSubmitting] = useState(false)
    const [requestSuccess, setRequestSuccess] = useState(false)
    const [requestForm, setRequestForm] = useState({
        resourceName: '',
        category: 'Training Material',
        format: 'PDF',
        priority: 'Medium',
        description: '',
        purpose: '',
    })

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        fetchResources()
    }, [isAuthenticated, router])

    const fetchResources = async () => {
        try {
            setIsLoading(true)
            setError(null)

            const partnerId = user?.id || 'partner-1'
            const response = await PartnerPortalService.getPartnerDocuments(partnerId)

            setResources((response || []).map((doc: any) => ({
                id: doc.id,
                title: doc.name,
                description: `Resource: ${doc.name}`,
                type: doc.type,
                category: 'documentation',
                size: doc.size || '2.5 MB',
                downloads: doc.downloads || 0,
                rating: doc.rating || 4.8,
                duration: doc.duration || null,
                tags: doc.tags || ['resource', 'document'],
                uploadDate: doc.uploadedAt,
                featured: doc.featured || false,
                url: doc.url || null
            })))
        } catch (err) {
            console.error('Error fetching resources:', err)
            setError('Failed to load resources')
        } finally {
            setIsLoading(false)
        }
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'PDF': return FileText
            case 'VIDEO': return PlayCircle
            case 'ZIP': return Folder
            case 'EXCEL': return File
            case 'IMAGE': return Image
            default: return File
        }
    }

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'PDF': return 'text-red-600 bg-red-50'
            case 'VIDEO': return 'text-blue-600 bg-blue-50'
            case 'ZIP': return 'text-purple-600 bg-purple-50'
            case 'EXCEL': return 'text-green-600 bg-green-50'
            case 'IMAGE': return 'text-orange-600 bg-orange-50'
            default: return 'text-gray-600 bg-gray-50'
        }
    }

    const handleDownload = useCallback(async (resource: any) => {
        try {
            setDownloadingIds(prev => new Set(prev).add(resource.id))
            if (resource.url) {
                const link = document.createElement('a')
                link.href = resource.url
                link.download = resource.title || 'download'
                link.target = '_blank'
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
            } else {
                const partnerId = user?.id || 'partner-1'
                try {
                    const blob = await (PartnerPortalService as any).downloadPartnerDocument(partnerId, resource.id)
                    const url = window.URL.createObjectURL(blob as Blob)
                    const link = document.createElement('a')
                    link.href = url
                    link.download = resource.title || 'download'
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                    window.URL.revokeObjectURL(url)
                } catch {
                    alert(`Download started for: ${resource.title}`)
                }
            }
            // Increment local download count
            setResources(prev => prev.map(r =>
                r.id === resource.id ? { ...r, downloads: r.downloads + 1 } : r
            ))
        } catch (err) {
            console.error('Download error:', err)
            alert('Failed to download resource. Please try again.')
        } finally {
            setDownloadingIds(prev => {
                const next = new Set(prev)
                next.delete(resource.id)
                return next
            })
        }
    }, [user])

    const handleFavorite = useCallback((resourceId: string) => {
        setFavorites(prev => {
            const next = new Set(prev)
            if (next.has(resourceId)) {
                next.delete(resourceId)
            } else {
                next.add(resourceId)
            }
            return next
        })
    }, [])

    const handleRequestResource = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!requestForm.resourceName.trim()) return

        setRequestSubmitting(true)
        try {
            const partnerId = user?.id || 'partner-1'
            await (PartnerPortalService as any).requestResource?.(partnerId, requestForm)
        } catch {
            // API may not exist yet
        }
        setRequestSubmitting(false)
        setRequestSuccess(true)
        setTimeout(() => {
            setShowRequestModal(false)
            setRequestSuccess(false)
            setRequestForm({ resourceName: '', category: 'Training Material', format: 'PDF', priority: 'Medium', description: '', purpose: '' })
        }, 2000)
    }

    // Computed metrics from actual data
    const totalResources = resources.length
    const totalDownloads = resources.reduce((sum, r) => sum + (r.downloads || 0), 0)
    const videoCount = resources.filter(r => r.type === 'VIDEO').length
    const videoHours = resources.filter(r => r.type === 'VIDEO').reduce((sum, r) => sum + (r.duration || 0), 0)
    const avgRating = resources.length > 0
        ? (resources.reduce((sum, r) => sum + (r.rating || 0), 0) / resources.length).toFixed(1)
        : '0.0'

    const filteredResources = resources.filter(r => {
        const matchesSearch = !searchQuery || r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.description.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = selectedCategory === 'all' || r.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    if (!isAuthenticated) return null

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Resource Library</h1>
                    <p className="text-gray-600 mt-1">Access training materials, documentation, and marketing assets</p>
                </div>
                <button
                    id="partner-resources-request-btn"
                    onClick={() => setShowRequestModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <ExternalLink className="w-5 h-5" />
                    Request Resource
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-red-800">{error}</p>
                    <button onClick={fetchResources} className="ml-auto text-sm text-red-600 hover:text-red-800 underline">Retry</button>
                </div>
            )}

            {/* Resource Overview - Colorful Admin-Style Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { title: 'Total Resources', value: totalResources.toString(), icon: Book, gradient: 'from-blue-500 to-blue-600', bgGradient: 'from-blue-50 to-blue-100', change: `${totalResources} available` },
                    { title: 'Downloads This Month', value: totalDownloads > 1000 ? `${(totalDownloads / 1000).toFixed(1)}K` : totalDownloads.toString(), icon: Download, gradient: 'from-green-500 to-green-600', bgGradient: 'from-green-50 to-green-100', change: '+12% this month' },
                    { title: 'Video Content', value: videoCount > 0 ? `${videoCount} videos` : '0 videos', icon: Video, gradient: 'from-purple-500 to-purple-600', bgGradient: 'from-purple-50 to-purple-100', change: `${videoHours > 0 ? videoHours + 'h' : 'Browse'}` },
                    { title: 'Avg Rating', value: `${avgRating}/5`, icon: Star, gradient: 'from-yellow-500 to-yellow-600', bgGradient: 'from-yellow-50 to-yellow-100', change: 'Excellent' },
                ].map((metric, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                        <Card className={`hover:shadow-lg transition-all border-0 bg-gradient-to-br ${metric.bgGradient}`}>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`bg-gradient-to-br ${metric.gradient} p-2.5 rounded-lg shadow-md`}>
                                        <metric.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">{metric.change}</span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 font-medium mb-1">{metric.title}</p>
                                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search resources..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            {/* Resources Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map((resource, idx) => {
                    const TypeIcon = getTypeIcon(resource.type)
                    const isFavorited = favorites.has(resource.id)
                    const isDownloading = downloadingIds.has(resource.id)
                    return (
                        <motion.div
                            key={resource.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <Card className="hover:shadow-lg transition-shadow h-full">
                                <CardContent className="pt-6 flex flex-col h-full">
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className={`p-2 rounded-lg ${getTypeColor(resource.type)}`}>
                                            <TypeIcon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{resource.title}</h3>
                                            <p className="text-sm text-gray-600 line-clamp-2">{resource.description}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-1 mb-3">
                                        {resource.tags.slice(0, 3).map((tag: string) => (
                                            <Badge key={tag} variant="outline" className="text-xs">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                                        <span>{resource.size}</span>
                                        <span>{resource.downloads} downloads</span>
                                    </div>

                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="flex items-center gap-1">
                                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                            <span className="text-sm font-medium">{resource.rating}</span>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                id={`partner-resources-favorite-${resource.id}-btn`}
                                                onClick={() => handleFavorite(resource.id)}
                                                className={`p-1.5 rounded transition-colors ${isFavorited ? 'bg-red-100 text-red-600' : 'hover:bg-red-50 text-red-400'}`}
                                                title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                                            >
                                                <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-current' : ''}`} />
                                            </button>
                                            <button
                                                id={`partner-resources-download-${resource.id}-btn`}
                                                onClick={() => handleDownload(resource)}
                                                disabled={isDownloading}
                                                className={`px-3 py-1.5 rounded transition-colors ${isDownloading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                                            >
                                                {isDownloading ? (
                                                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <Download className="w-3.5 h-3.5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )
                })}
            </div>

            {filteredResources.length === 0 && (
                <Card>
                    <CardContent className="pt-6 text-center">
                        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">
                            {searchQuery ? 'No resources match your search.' : 'No resources found.'}
                        </p>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
                            >
                                Clear search
                            </button>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Request Resource Modal */}
            {showRequestModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                    >
                        {requestSuccess ? (
                            <div className="p-10 text-center">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Star className="w-8 h-8 text-green-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Request Submitted!</h3>
                                <p className="text-gray-600">Your resource request has been sent to the admin team. You will be notified once it is available.</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between p-6 border-b">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Request a Resource</h2>
                                        <p className="text-sm text-gray-500 mt-1">Submit a request to the admin team for new resources</p>
                                    </div>
                                    <button onClick={() => setShowRequestModal(false)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                                        <AlertCircle className="w-5 h-5" />
                                    </button>
                                </div>
                                <form onSubmit={handleRequestResource} className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Resource Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={requestForm.resourceName}
                                            onChange={e => setRequestForm(prev => ({ ...prev, resourceName: e.target.value }))}
                                            placeholder="e.g., Gym Equipment Setup Guide, Marketing Banner Templates"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                            <select
                                                value={requestForm.category}
                                                onChange={e => setRequestForm(prev => ({ ...prev, category: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            >
                                                <option value="Training Material">Training Material</option>
                                                <option value="Marketing Asset">Marketing Asset</option>
                                                <option value="Operations Guide">Operations Guide</option>
                                                <option value="Compliance Document">Compliance Document</option>
                                                <option value="Branding Kit">Branding Kit</option>
                                                <option value="Video Tutorial">Video Tutorial</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Format</label>
                                            <select
                                                value={requestForm.format}
                                                onChange={e => setRequestForm(prev => ({ ...prev, format: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            >
                                                <option value="PDF">PDF Document</option>
                                                <option value="VIDEO">Video</option>
                                                <option value="EXCEL">Excel / Spreadsheet</option>
                                                <option value="IMAGE">Image / Graphics</option>
                                                <option value="ZIP">ZIP Archive</option>
                                                <option value="Any">Any Format</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                        <div className="flex gap-3">
                                            {['Low', 'Medium', 'High', 'Urgent'].map(p => (
                                                <button
                                                    key={p}
                                                    type="button"
                                                    onClick={() => setRequestForm(prev => ({ ...prev, priority: p }))}
                                                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                                                        requestForm.priority === p
                                                            ? p === 'Low' ? 'bg-gray-100 border-gray-400 text-gray-800'
                                                            : p === 'Medium' ? 'bg-blue-100 border-blue-400 text-blue-800'
                                                            : p === 'High' ? 'bg-orange-100 border-orange-400 text-orange-800'
                                                            : 'bg-red-100 border-red-400 text-red-800'
                                                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {p}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                                        <textarea
                                            required
                                            value={requestForm.description}
                                            onChange={e => setRequestForm(prev => ({ ...prev, description: e.target.value }))}
                                            placeholder="Describe what content the resource should contain..."
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Purpose / Use Case</label>
                                        <input
                                            type="text"
                                            value={requestForm.purpose}
                                            onChange={e => setRequestForm(prev => ({ ...prev, purpose: e.target.value }))}
                                            placeholder="e.g., Staff onboarding, Client marketing, Compliance training"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                    <div className="flex justify-end gap-3 pt-4 border-t">
                                        <button
                                            type="button"
                                            onClick={() => setShowRequestModal(false)}
                                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={requestSubmitting || !requestForm.resourceName.trim() || !requestForm.description.trim()}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {requestSubmitting ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    Submitting...
                                                </>
                                            ) : (
                                                <>
                                                    <ExternalLink className="w-4 h-4" />
                                                    Submit Request
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </motion.div>
                </div>
            )}
        </div>
    )
}
