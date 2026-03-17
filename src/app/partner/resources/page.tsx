'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import PartnerPortalService from '@/services/modules/partner-portal.service'
import { motion } from 'framer-motion'
import {
    BookOpen, FileText, Video, Download, Search, Filter,
    Play, Clock, Star, Eye, Heart, Share2, Tag,
    Folder, File, Image, PlayCircle, ExternalLink, AlertCircle
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
                size: '2.5 MB',
                downloads: 1250,
                rating: 4.8,
                duration: null,
                tags: ['resource', 'document'],
                uploadDate: doc.uploadedAt,
                featured: false
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
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <ExternalLink className="w-5 h-5" />
                    Request Resource
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            {/* Resource Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    {
                        title: 'Total Resources',
                        value: resources.length.toString(),
                        icon: BookOpen,
                        color: 'text-blue-600',
                        bgColor: 'bg-blue-50'
                    },
                    {
                        title: 'Downloads This Month',
                        value: '1.2K',
                        icon: Download,
                        color: 'text-green-600',
                        bgColor: 'bg-green-50'
                    },
                    {
                        title: 'Video Content',
                        value: '2.5 hours',
                        icon: Video,
                        color: 'text-purple-600',
                        bgColor: 'bg-purple-50'
                    },
                    {
                        title: 'Avg Rating',
                        value: '4.7/5',
                        icon: Star,
                        color: 'text-yellow-600',
                        bgColor: 'bg-yellow-50'
                    },
                ].map((metric, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">{metric.title}</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-2">{metric.value}</p>
                                    </div>
                                    <div className={`${metric.bgColor} p-3 rounded-lg`}>
                                        <metric.icon className={`w-6 h-6 ${metric.color}`} />
                                    </div>
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
                {resources.map((resource, idx) => {
                    const TypeIcon = getTypeIcon(resource.type)
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
                                            <button className="p-1.5 hover:bg-red-50 rounded text-red-600 transition-colors">
                                                <Heart className="w-3.5 h-3.5" />
                                            </button>
                                            <button className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                                                <Download className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )
                })}
            </div>

            {resources.length === 0 && (
                <Card>
                    <CardContent className="pt-6 text-center">
                        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No resources found.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
