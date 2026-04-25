'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Loader, AlertCircle, Search, Filter, MapPin, Clock, User, DollarSign, RefreshCw, RotateCcw, Calendar, BookOpen } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/services/api/client'
import { filterAlphanumericInput } from '@/utils/validation'

interface ClassItem {
    id: string
    program: string
    coach: string
    level: string
    location: string
    date: string
    time: string
    duration: number
    availableSpots: number
    price: string | number
    description: string
}

const BrowseClassesPage = () => {
    const router = useRouter()
    const [classes, setClasses] = useState<ClassItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const [searchFilters, setSearchFilters] = useState({
        location: '',
        program: '',
        level: '',
        date: ''
    })
    const { user, isAuthenticated } = useAuth()

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        fetchClasses()
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
            const response = await apiClient.get<any>(`/parent/browse-classes${qs}`)
            const result = response?.data || response || []
            const classArray = Array.isArray(result) ? result : []
            setClasses(classArray)
        } catch (err: any) {
            console.error('Error loading classes:', err)
            setError(err.message || 'Failed to load classes')
            setClasses([])
        } finally {
            setIsLoading(false)
        }
    }

    const handleSearch = () => {
        fetchClasses(searchFilters)
    }

    const handleReset = () => {
        const emptyFilters = { location: '', program: '', level: '', date: '' }
        setSearchFilters(emptyFilters)
        fetchClasses(emptyFilters)
    }

    const handleBook = (classId: string) => {
        router.push(`/parent/book-class/${classId}`)
    }

    const handleRetry = () => {
        fetchClasses(searchFilters)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <h1 className="text-3xl font-bold text-gray-900">Browse Classes</h1>
                <p className="text-gray-600 mt-2">Find and book the perfect class for your child</p>
            </motion.div>

            {/* Search Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
            >
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-xs text-gray-400 mt-1">Letters and numbers only</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                                <select
                                    value={searchFilters.level}
                                    onChange={(e) => setSearchFilters({ ...searchFilters, level: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                >
                                    <option value="">All levels</option>
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                <input
                                    type="date"
                                    value={searchFilters.date}
                                    onChange={(e) => setSearchFilters({ ...searchFilters, date: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-4">
                            <Button id="btn-search-parent-browse-classes" onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700">
                                <Search className="w-4 h-4 mr-2" />
                                Search
                            </Button>
                            <Button id="btn-reset-parent-browse-classes" onClick={handleReset} variant="outline">
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Reset Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Loading State */}
            {isLoading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-16"
                >
                    <Loader className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                    <p className="text-gray-600 font-medium">Loading available classes...</p>
                </motion.div>
            )}

            {/* Error State */}
            {!isLoading && error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-red-50 border border-red-200 rounded-lg flex flex-col items-center text-center"
                >
                    <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
                    <p className="text-red-700 font-medium mb-1">Something went wrong</p>
                    <p className="text-red-600 text-sm mb-4">{error}</p>
                    <Button onClick={handleRetry} variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Try Again
                    </Button>
                </motion.div>
            )}

            {/* Empty State */}
            {!isLoading && !error && classes.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                >
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
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-gray-500"
                    >
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
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-lg">{cls.program || 'Class'}</CardTitle>
                                                <p className="text-sm text-gray-600 mt-1">with {cls.coach || 'Coach'}</p>
                                            </div>
                                            <Badge className="bg-blue-100 text-blue-800">{cls.level || 'All Levels'}</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3 flex-1 flex flex-col">
                                        {cls.description && (
                                            <p className="text-sm text-gray-500 line-clamp-2">{cls.description}</p>
                                        )}
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <MapPin className="w-4 h-4 flex-shrink-0" />
                                            <span className="text-sm">{cls.location || 'Location TBD'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Calendar className="w-4 h-4 flex-shrink-0" />
                                            <span className="text-sm">
                                                {(() => {
                                                    if (!cls.date) return 'Date TBD'
                                                    try {
                                                        const d = new Date(cls.date)
                                                        if (isNaN(d.getTime())) return 'Date TBD'
                                                        return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                                                    } catch { return 'Date TBD' }
                                                })()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Clock className="w-4 h-4 flex-shrink-0" />
                                            <span className="text-sm">
                                                {cls.time || 'Time TBD'}
                                                {cls.duration ? ` (${cls.duration} min)` : ''}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <User className="w-4 h-4 flex-shrink-0" />
                                            <span className="text-sm">{cls.availableSpots ?? 0} spots available</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <DollarSign className="w-4 h-4 flex-shrink-0" />
                                            <span className="text-sm font-semibold">{cls.price ?? 'Free'}</span>
                                        </div>
                                        <div className="mt-auto pt-4">
                                            <Button
                                                id={`parent-browse-classes-book-${cls.id}-btn`}
                                                onClick={() => handleBook(cls.id)}
                                                className="w-full bg-blue-600 hover:bg-blue-700"
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

export default BrowseClassesPage
