'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Loader, AlertCircle, Search, Filter, MapPin, Clock, User, DollarSign } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import SchedulingService from '@/services/modules/scheduling.service'
import BookingService from '@/services/modules/booking.service'

const BrowseClassesPage = () => {
    const router = useRouter()
    const [sessions, setSessions] = useState<any[]>([])
    const [filteredSessions, setFilteredSessions] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const [hasSearched, setHasSearched] = useState(false)
    const [searchFilters, setSearchFilters] = useState({
        location: '',
        program: '',
        level: '',
        date: ''
    })
    const { user, isAuthenticated } = useAuth()

    const parentId = user?.id || 'parent-1'

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadAvailableClasses()
    }, [isAuthenticated, router, parentId])

    const loadAvailableClasses = async () => {
        try {
            setIsLoading(true)
            setError('')

            const schedulingService = new SchedulingService()
            const classes = await schedulingService.getSchedules(parentId)
            setSessions(classes || [])
            setFilteredSessions(classes || [])
        } catch (err: any) {
            console.error('Error loading classes:', err)
            setError(err.message || 'Failed to load classes')
            setSessions([])
        } finally {
            setIsLoading(false)
        }
    }

    const handleSearch = () => {
        setHasSearched(true)

        let filtered = sessions

        if (searchFilters.location) {
            filtered = filtered.filter(s =>
                s.location?.toLowerCase().includes(searchFilters.location.toLowerCase())
            )
        }

        if (searchFilters.program) {
            filtered = filtered.filter(s =>
                s.program?.toLowerCase().includes(searchFilters.program.toLowerCase())
            )
        }

        if (searchFilters.level) {
            filtered = filtered.filter(s =>
                s.level?.toLowerCase().includes(searchFilters.level.toLowerCase())
            )
        }

        if (searchFilters.date) {
            filtered = filtered.filter(s =>
                s.date?.includes(searchFilters.date)
            )
        }

        setFilteredSessions(filtered)

        if (filtered.length === 0) {
            setError('No classes found matching your criteria. Try adjusting your filters.')
        } else {
            setError('')
        }
    }

    const handleReset = () => {
        setSearchFilters({ location: '', program: '', level: '', date: '' })
        setFilteredSessions(sessions)
        setHasSearched(false)
        setError('')
    }

    const handleBook = (sessionId: string) => {
        router.push(`/parent/book-class/${sessionId}`)
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Browse Classes</h1>
                    <p className="text-gray-600 mt-2">Find and book the perfect class for your child</p>
                </div>
                <div className="flex flex-col items-center justify-center py-12">
                    <Loader className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                    <p className="text-gray-600 font-medium">Loading available classes...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Browse Classes</h1>
                <p className="text-gray-600 mt-2">Find and book the perfect class for your child</p>
            </div>

            {/* Search Filters */}
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Program</label>
                            <input
                                type="text"
                                placeholder="Enter program"
                                value={searchFilters.program}
                                onChange={(e) => setSearchFilters({ ...searchFilters, program: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                            <input
                                type="text"
                                placeholder="Enter level"
                                value={searchFilters.level}
                                onChange={(e) => setSearchFilters({ ...searchFilters, level: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
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
                        <Button data-testid="btn-search-parent-browse-classes" onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700">
                            <Search className="w-4 h-4 mr-2" />
                            Search
                        </Button>
                        <Button data-testid="btn-reset-parent-browse-classes" onClick={handleReset} variant="outline">
                            Reset
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Error Message */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
                >
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-red-700">{error}</p>
                </motion.div>
            )}

            {/* Results */}
            {hasSearched && filteredSessions.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSessions.map((session, index) => (
                        <motion.div
                            key={session.id || index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-lg">{session.program || 'Class'}</CardTitle>
                                            <p className="text-sm text-gray-600 mt-1">{session.coach || 'Coach'}</p>
                                        </div>
                                        <Badge className="bg-blue-100 text-blue-800">{session.level || 'Level'}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <MapPin className="w-4 h-4" />
                                        <span className="text-sm">{session.location || 'Location'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Clock className="w-4 h-4" />
                                        <span className="text-sm">{session.time || 'Time'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <User className="w-4 h-4" />
                                        <span className="text-sm">{session.availableSpots || 0} spots available</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <DollarSign className="w-4 h-4" />
                                        <span className="text-sm font-semibold">{session.price || 'Price'}</span>
                                    </div>
                                    <Button
                                        onClick={() => handleBook(session.id)}
                                        className="w-full bg-blue-600 hover:bg-blue-700 mt-4"
                                    >
                                        Book Now
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* No Results */}
            {hasSearched && filteredSessions.length === 0 && !error && (
                <div className="text-center py-12">
                    <p className="text-gray-600">No classes found. Try adjusting your search criteria.</p>
                </div>
            )}

            {/* Initial State */}
            {!hasSearched && (
                <div className="text-center py-12">
                    <p className="text-gray-600">Use the filters above to search for available classes</p>
                </div>
            )}
        </div>
    )
}

export default BrowseClassesPage
