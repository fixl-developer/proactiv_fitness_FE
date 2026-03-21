'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, MapPin, User, Search, Filter, Eye, X, RefreshCw, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import UserClassesService from '@/services/modules/user-classes.service'

export default function MyClassesPage() {
    const [classes, setClasses] = useState<any[]>([])
    const [filteredClasses, setFilteredClasses] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [activeFilter, setActiveFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all')
    const { isAuthenticated } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadClasses()
    }, [isAuthenticated, router])

    useEffect(() => {
        filterClasses()
    }, [classes, searchQuery, activeFilter])

    const loadClasses = async () => {
        try {
            const service = new UserClassesService()
            const data = await service.getClasses()
            setClasses(data)
        } catch (err) {
            console.error('Error loading classes:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleRefresh = async () => {
        setRefreshing(true)
        await loadClasses()
        setRefreshing(false)
    }

    const filterClasses = () => {
        let filtered = classes

        // Apply status filter
        if (activeFilter !== 'all') {
            filtered = filtered.filter(cls => cls.status === activeFilter)
        }

        // Apply search filter
        if (searchQuery) {
            filtered = filtered.filter(cls =>
                cls.className?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                cls.coach?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                cls.location?.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        setFilteredClasses(filtered)
    }

    const getStatusColor = (status: string) => {
        const colors = {
            upcoming: 'bg-blue-100 text-blue-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
        }
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
    }

    const filters = [
        { key: 'all', label: 'All Classes', count: classes.length },
        { key: 'upcoming', label: 'Upcoming', count: classes.filter(c => c.status === 'upcoming').length },
        { key: 'completed', label: 'Completed', count: classes.filter(c => c.status === 'completed').length },
        { key: 'cancelled', label: 'Cancelled', count: classes.filter(c => c.status === 'cancelled').length }
    ]

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>)}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Classes</h1>
                    <p className="text-gray-600 mt-2">View and manage your class schedule</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button data-testid="btn-refresh-user-my-classes" variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Book Class
                    </Button>
                </div>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search classes, coaches, or locations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                >
                                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                                </button>
                            )}
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                            {filters.map((filter) => (
                                <button
                                    key={filter.key}
                                    onClick={() => setActiveFilter(filter.key as any)}
                                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeFilter === filter.key
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    {filter.label}
                                    <Badge className="ml-2" variant="outline">{filter.count}</Badge>
                                </button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Classes Grid */}
            <div className="grid gap-4">
                {filteredClasses.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {searchQuery ? 'No classes found' : 'No classes yet'}
                            </h3>
                            <p className="text-gray-500 mb-4">
                                {searchQuery ? 'Try adjusting your search or filters' : 'Book your first class to get started!'}
                            </p>
                            {!searchQuery && (
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Browse Classes
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    filteredClasses.map((cls, index) => (
                        <motion.div
                            key={cls.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className="hover:shadow-lg transition-all cursor-pointer group">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold">
                                                {cls.schedule?.date?.split('-')[2] || '?'}
                                            </div>
                                            <div>
                                                <CardTitle className="group-hover:text-emerald-600 transition-colors">
                                                    {cls.className}
                                                </CardTitle>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {cls.schedule?.duration || '60'} minutes session
                                                </p>
                                            </div>
                                        </div>
                                        <Badge className={getStatusColor(cls.status)}>
                                            {cls.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-gray-500" />
                                            <div>
                                                <p className="text-xs text-gray-500">Coach</p>
                                                <p className="text-sm font-medium text-gray-900">{cls.coach}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-gray-500" />
                                            <div>
                                                <p className="text-xs text-gray-500">Date</p>
                                                <p className="text-sm font-medium text-gray-900">{cls.schedule?.date}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-gray-500" />
                                            <div>
                                                <p className="text-xs text-gray-500">Time</p>
                                                <p className="text-sm font-medium text-gray-900">{cls.schedule?.time}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-gray-500" />
                                            <div>
                                                <p className="text-xs text-gray-500">Location</p>
                                                <p className="text-sm font-medium text-gray-900">{cls.location}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" className="flex-1">
                                            <Eye className="w-4 h-4 mr-2" />
                                            View Details
                                        </Button>
                                        {cls.status === 'upcoming' && (
                                            <>
                                                <Button size="sm" variant="outline">
                                                    Reschedule
                                                </Button>
                                                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                                                    Cancel
                                                </Button>
                                            </>
                                        )}
                                        {cls.status === 'completed' && (
                                            <Button size="sm" variant="outline">
                                                Leave Feedback
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    )
}
