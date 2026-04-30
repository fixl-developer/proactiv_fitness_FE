'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, MapPin, Clock, Users, DollarSign, Filter, ChevronRight, AlertCircle, Loader, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/services/api/client'

interface ClassItem {
    id: string
    source?: 'session' | 'program'
    program: string
    description?: string
    location: string
    locationAddress?: string
    coach?: string
    level?: string
    ageGroup?: string
    date: string
    time: string
    endTime?: string
    duration?: string
    price: number
    currency: string
    capacity: number
    enrolled: number
    availableSpots: number
}

interface FilterOptions {
    location: string
    date: string
    level: string
}

export default function BrowseClassesPage() {
    const router = useRouter()
    const { isAuthenticated } = useAuth()
    const [classes, setClasses] = useState<ClassItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [showFilters, setShowFilters] = useState(false)
    const [filters, setFilters] = useState<FilterOptions>({
        location: '',
        date: '',
        level: '',
    })

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadClasses()
    }, [isAuthenticated, router])

    const loadClasses = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await apiClient.get<any>('/user/classes/browse')
            const list: ClassItem[] = (response?.data || []).map((c: any) => ({
                id: String(c.id),
                source: c.source,
                program: c.program || 'Class',
                description: c.description || '',
                location: c.location || '',
                locationAddress: c.locationAddress || '',
                coach: c.coach || '',
                level: c.level || '',
                ageGroup: c.ageGroup || '',
                date: c.date || '',
                time: c.time || '',
                endTime: c.endTime || '',
                duration: c.duration || '',
                price: typeof c.price === 'number' ? c.price : 0,
                currency: c.currency || 'HKD',
                capacity: typeof c.capacity === 'number' ? c.capacity : 0,
                enrolled: typeof c.enrolled === 'number' ? c.enrolled : 0,
                availableSpots: typeof c.availableSpots === 'number' ? c.availableSpots : 0,
            }))
            setClasses(list)
        } catch (err: any) {
            console.error('Error loading classes:', err)
            setError(err?.message || 'Failed to load classes')
            setClasses([])
        } finally {
            setLoading(false)
        }
    }

    const filteredClasses = useMemo(() => {
        let filtered = classes
        if (searchTerm) {
            const q = searchTerm.toLowerCase()
            filtered = filtered.filter(c =>
                (c.program || '').toLowerCase().includes(q) ||
                (c.description || '').toLowerCase().includes(q),
            )
        }
        if (filters.location) {
            filtered = filtered.filter(c => (c.location || '').toLowerCase().includes(filters.location.toLowerCase()))
        }
        if (filters.date) {
            filtered = filtered.filter(c => (c.date || '').slice(0, 10) === filters.date)
        }
        if (filters.level) {
            filtered = filtered.filter(c => (c.level || '').toLowerCase() === filters.level.toLowerCase())
        }
        return filtered
    }, [classes, filters, searchTerm])

    const locationOptions = useMemo(
        () => Array.from(new Set(classes.map(c => c.location).filter(Boolean))),
        [classes],
    )
    const levelOptions = useMemo(
        () => Array.from(new Set(classes.map(c => c.level).filter(Boolean))),
        [classes],
    )

    const isClassFull = (c: ClassItem) => c.availableSpots <= 0 && c.capacity > 0

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-end mb-4"
            >
                <div>
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">Browse Classes</h1>
                    <p className="text-slate-600">Find and book classes for yourself</p>
                </div>
                <button
                    onClick={loadClasses}
                    className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-sm font-medium text-slate-700"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </motion.div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-md p-6 space-y-4"
            >
                <div className="relative">
                    <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search classes by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>

                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
                >
                    <Filter className="w-4 h-4" />
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>

                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200"
                    >
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">Location</label>
                            <select
                                value={filters.location}
                                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="">All Locations</option>
                                {locationOptions.map(loc => (
                                    <option key={loc} value={loc}>{loc}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">Date</label>
                            <input
                                type="date"
                                value={filters.date}
                                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">Level</label>
                            <select
                                value={filters.level}
                                onChange={(e) => setFilters({ ...filters, level: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="">All Levels</option>
                                {levelOptions.map(lvl => (
                                    <option key={lvl} value={lvl}>{lvl}</option>
                                ))}
                            </select>
                        </div>
                    </motion.div>
                )}
            </motion.div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader className="w-8 h-8 text-emerald-600 animate-spin" />
                </div>
            ) : filteredClasses.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white rounded-lg shadow-md p-12 text-center"
                >
                    <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 text-lg">
                        {classes.length === 0
                            ? 'No published classes are available right now'
                            : 'No classes match your filters'}
                    </p>
                    {(searchTerm || filters.location || filters.date || filters.level) && (
                        <button
                            onClick={() => {
                                setSearchTerm('')
                                setFilters({ location: '', date: '', level: '' })
                            }}
                            className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                            Clear Filters
                        </button>
                    )}
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {filteredClasses.map((classItem, index) => {
                        const full = isClassFull(classItem)
                        const isSession = classItem.source === 'session'
                        return (
                            <motion.div
                                key={`${classItem.source || 'item'}-${classItem.id}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                            >
                                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 text-white">
                                    <h3 className="text-xl font-bold">{classItem.program}</h3>
                                    {classItem.description && (
                                        <p className="text-emerald-100 text-sm mt-1 line-clamp-2">{classItem.description}</p>
                                    )}
                                </div>

                                <div className="p-4 space-y-3">
                                    {classItem.location && (
                                        <div className="flex items-start gap-3">
                                            <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">{classItem.location}</p>
                                                {classItem.coach && (
                                                    <p className="text-xs text-slate-500">Coach: {classItem.coach}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3">
                                        <Clock className="w-5 h-5 text-slate-400" />
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">
                                                {classItem.time || 'TBA'}{classItem.endTime ? ` - ${classItem.endTime}` : ''}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {classItem.date ? new Date(classItem.date).toLocaleDateString() : 'TBA'}
                                            </p>
                                        </div>
                                    </div>

                                    {isSession && classItem.capacity > 0 && (
                                        <div className="flex items-center gap-3">
                                            <Users className="w-5 h-5 text-slate-400" />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-slate-900">
                                                    {classItem.availableSpots} / {classItem.capacity} seats available
                                                </p>
                                                <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
                                                    <div
                                                        className="bg-emerald-500 h-2 rounded-full"
                                                        style={{ width: `${(classItem.enrolled / classItem.capacity) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3 pt-2 border-t border-slate-200">
                                        <DollarSign className="w-5 h-5 text-emerald-600" />
                                        <p className="text-lg font-bold text-slate-900">
                                            {classItem.price} <span className="text-sm text-slate-500">{classItem.currency}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="px-4 pb-4">
                                    {isSession ? (
                                        <Link
                                            href={`/user/book-class/${classItem.id}`}
                                            className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-all ${full
                                                ? 'bg-slate-200 text-slate-500 cursor-not-allowed pointer-events-none'
                                                : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                                }`}
                                        >
                                            {full ? 'Class Full' : 'Book Now'}
                                            {!full && <ChevronRight className="w-4 h-4" />}
                                        </Link>
                                    ) : (
                                        <div className="w-full text-center text-xs text-slate-500 italic py-2">
                                            Schedule pending — booking opens once admin publishes a session
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )
                    })}
                </motion.div>
            )}

            {!loading && filteredClasses.length > 0 && (
                <div className="text-center text-slate-600 text-sm">
                    Showing {filteredClasses.length} of {classes.length} classes
                </div>
            )}
        </div>
    )
}
