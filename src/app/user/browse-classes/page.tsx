'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
    Loader, AlertCircle, Search, Filter, MapPin, Clock, User,
    DollarSign, RefreshCw, RotateCcw, Calendar, BookOpen, Tag,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/services/api/client'
import { filterAlphanumericInput } from '@/utils/validation'

interface ClassItem {
    id: string
    source?: 'session' | 'program'
    program: string
    coach: string
    level: string
    location: string
    date: string
    time: string
    duration: number | string
    availableSpots: number
    price: string | number
    description: string
    category?: string
}

const UserBrowseClassesPage = () => {
    const router = useRouter()
    const [classes, setClasses] = useState<ClassItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const [searchFilters, setSearchFilters] = useState({
        location: '',
        program: '',
        level: '',
        date: '',
    })
    const { isAuthenticated } = useAuth()

    useEffect(() => {
        if (!isAuthenticated) {
            router.push(`/login?redirectTo=${encodeURIComponent('/user/browse-classes')}`)
            return
        }
        fetchClasses()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, router])

    const buildQueryString = useCallback((filters: typeof searchFilters) => {
        const params = new URLSearchParams()
        if (filters.location) params.append('location', filters.location)
        if (filters.program) params.append('program', filters.program)
        if (filters.level) params.append('level', filters.level)
        if (filters.date) params.append('date', filters.date)
        const qs = params.toString()
        return qs ? `?${qs}` : ''
    }, [])

    const fetchClasses = async (filters?: typeof searchFilters) => {
        try {
            setIsLoading(true)
            setError('')
            const qs = buildQueryString(filters || searchFilters)
            // /bookings/browse is auth-required but role-agnostic (PARENT or USER both allowed)
            const response = await apiClient.get<any>(`/bookings/browse${qs}`)
            const result = response?.data || response || []
            const classArray = Array.isArray(result) ? result : []
            setClasses(classArray)
        } catch (err: any) {
            console.error('Error loading classes:', err)
            setError(err?.response?.data?.message || err.message || 'Failed to load classes')
            setClasses([])
        } finally {
            setIsLoading(false)
        }
    }

    const handleSearch = () => fetchClasses(searchFilters)
    const handleReset = () => {
        const empty = { location: '', program: '', level: '', date: '' }
        setSearchFilters(empty)
        fetchClasses(empty)
    }
    const handleRetry = () => fetchClasses(searchFilters)

    const handleBook = (cls: ClassItem) => {
        // User books via /user/book-class/<id> — that page calls /bookings/class
        const qs = cls.source === 'program' ? '?source=program' : ''
        router.push(`/user/book-class/${cls.id}${qs}`)
    }

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <h1 className="text-3xl font-bold text-gray-900">Browse Classes</h1>
                <p className="text-gray-600 mt-2">Find and book a class, program or assessment</p>
            </motion.div>

            {/* Filters */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="w-5 h-5" />
                            Search & Filter
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                                <input
                                    type="text"
                                    placeholder="Enter location"
                                    value={searchFilters.location}
                                    onChange={(e) => setSearchFilters({ ...searchFilters, location: e.target.value })}
                                    onKeyDown={filterAlphanumericInput}
                                    maxLength={60}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                                <p className="text-xs text-gray-400 mt-1">Letters and numbers only</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Program</label>
                                <input
                                    type="text"
                                    placeholder="Enter program"
                                    value={searchFilters.program}
                                    onChange={(e) => setSearchFilters({ ...searchFilters, program: e.target.value })}
                                    onKeyDown={filterAlphanumericInput}
                                    maxLength={60}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                                <p className="text-xs text-gray-400 mt-1">Letters and numbers only</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                                <select
                                    value={searchFilters.level}
                                    onChange={(e) => setSearchFilters({ ...searchFilters, level: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                                >
                                    <option value="">All levels</option>
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                <input
                                    type="date"
                                    value={searchFilters.date}
                                    onChange={(e) => setSearchFilters({ ...searchFilters, date: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-4">
                            <Button id="btn-search-user-browse-classes" onClick={handleSearch} className="bg-emerald-600 hover:bg-emerald-700">
                                <Search className="w-4 h-4 mr-2" />
                                Search
                            </Button>
                            <Button id="btn-reset-user-browse-classes" onClick={handleReset} variant="outline">
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Reset Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Loading */}
            {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16">
                    <Loader className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
                    <p className="text-gray-600 font-medium">Loading available classes...</p>
                </motion.div>
            )}

            {/* Error */}
            {!isLoading && error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-red-50 border border-red-200 rounded-lg flex flex-col items-center text-center">
                    <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
                    <p className="text-red-700 font-medium mb-1">Something went wrong</p>
                    <p className="text-red-600 text-sm mb-4">{error}</p>
                    <Button onClick={handleRetry} variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Try Again
                    </Button>
                </motion.div>
            )}

            {/* Empty */}
            {!isLoading && !error && classes.length === 0 && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
                    <Card>
                        <CardContent className="p-12 text-center">
                            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Classes Found</h3>
                            <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                No classes match your current search criteria. Try adjusting your filters or reset to see all available classes.
                            </p>
                            <Button onClick={handleReset} variant="outline">
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Reset Filters
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Results */}
            {!isLoading && !error && classes.length > 0 && (
                <>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-gray-500">
                        Showing {classes.length} class{classes.length !== 1 ? 'es' : ''}
                    </motion.p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {classes.map((cls, index) => (
                            <motion.div
                                key={cls.id || index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05, duration: 0.3 }}
                            >
                                <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
                                    <CardHeader>
                                        <div className="flex justify-between items-start gap-2">
                                            <div className="flex-1 min-w-0">
                                                <CardTitle className="text-lg truncate">{cls.program || 'Class'}</CardTitle>
                                                {cls.coach && <p className="text-sm text-gray-600 mt-1">with {cls.coach}</p>}
                                            </div>
                                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                                <Badge className="bg-emerald-100 text-emerald-800 capitalize">{cls.level || 'All Levels'}</Badge>
                                                {cls.source === 'program' && (
                                                    <Badge variant="outline" className="text-xs">
                                                        <Tag className="w-3 h-3 mr-1" /> Program
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3 flex-1 flex flex-col">
                                        {cls.description && (
                                            <p className="text-sm text-gray-500 line-clamp-2">{cls.description}</p>
                                        )}
                                        {cls.location && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <MapPin className="w-4 h-4 flex-shrink-0" />
                                                <span className="text-sm">{cls.location}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Calendar className="w-4 h-4 flex-shrink-0" />
                                            <span className="text-sm">
                                                {(() => {
                                                    if (!cls.date) return cls.source === 'program' ? 'Schedule TBA' : 'Date TBD'
                                                    try {
                                                        const d = new Date(cls.date)
                                                        if (isNaN(d.getTime())) return 'Date TBD'
                                                        return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                                                    } catch { return 'Date TBD' }
                                                })()}
                                            </span>
                                        </div>
                                        {cls.time && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Clock className="w-4 h-4 flex-shrink-0" />
                                                <span className="text-sm">
                                                    {cls.time}
                                                    {cls.duration ? ` (${cls.duration}${typeof cls.duration === 'number' ? ' min' : ''})` : ''}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <User className="w-4 h-4 flex-shrink-0" />
                                            <span className="text-sm">{cls.availableSpots ?? 0} spots available</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <DollarSign className="w-4 h-4 flex-shrink-0" />
                                            <span className="text-sm font-semibold">{cls.price || 'Free'}</span>
                                        </div>
                                        <div className="mt-auto pt-4">
                                            <Button
                                                id={`user-browse-classes-book-${cls.id}-btn`}
                                                onClick={() => handleBook(cls)}
                                                className="w-full bg-emerald-600 hover:bg-emerald-700"
                                                disabled={cls.availableSpots === 0}
                                            >
                                                {cls.availableSpots === 0 ? 'Class Full' : 'Book Now'}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

export default UserBrowseClassesPage
