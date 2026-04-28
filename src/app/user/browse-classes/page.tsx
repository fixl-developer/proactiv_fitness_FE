'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, MapPin, Clock, Users, DollarSign, Calendar, Filter, ChevronRight, AlertCircle, Loader } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface Class {
    id: string
    name: string
    description?: string
    location: {
        id: string
        name: string
        city: string
    }
    room: {
        id: string
        name: string
        capacity: number
    }
    startTime: string
    endTime: string
    date: string
    price: number
    currency: string
    capacity: number
    enrolled: number
    instructor?: string
    level?: string
    ageGroup?: string
}

interface FilterOptions {
    location: string
    room: string
    date: string
    time: string
    priceRange: [number, number]
    level: string
}

export default function BrowseClassesPage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [classes, setClasses] = useState<Class[]>([])
    const [filteredClasses, setFilteredClasses] = useState<Class[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [showFilters, setShowFilters] = useState(false)
    const [filters, setFilters] = useState<FilterOptions>({
        location: '',
        room: '',
        date: '',
        time: '',
        priceRange: [0, 1000],
        level: ''
    })

    const [locations, setLocations] = useState<any[]>([])
    const [rooms, setRooms] = useState<any[]>([])

    // Load classes on mount
    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadClasses()
        loadLocations()
    }, [isAuthenticated, router])

    // Apply filters
    useEffect(() => {
        applyFilters()
    }, [classes, filters, searchTerm])

    const loadClasses = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/v1/bookings/browse', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })

            if (!response.ok) throw new Error('Failed to load classes')

            const data = await response.json()
            setClasses(data.data || [])
        } catch (error) {
            console.error('Error loading classes:', error)
            // Fallback to mock data for demo
            setClasses(getMockClasses())
        } finally {
            setLoading(false)
        }
    }

    const loadLocations = async () => {
        try {
            const response = await fetch('/api/v1/bcms/locations', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                setLocations(data.data || [])
            }
        } catch (error) {
            console.error('Error loading locations:', error)
        }
    }

    const loadRooms = async (locationId: string) => {
        try {
            const response = await fetch(`/api/v1/bcms/rooms?locationId=${locationId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                setRooms(data.data || [])
            }
        } catch (error) {
            console.error('Error loading rooms:', error)
        }
    }

    const applyFilters = () => {
        let filtered = classes

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(c =>
                c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.description?.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        // Location filter
        if (filters.location) {
            filtered = filtered.filter(c => c.location.id === filters.location)
        }

        // Room filter
        if (filters.room) {
            filtered = filtered.filter(c => c.room.id === filters.room)
        }

        // Date filter
        if (filters.date) {
            filtered = filtered.filter(c => c.date === filters.date)
        }

        // Time filter
        if (filters.time) {
            filtered = filtered.filter(c => c.startTime.startsWith(filters.time))
        }

        // Price range filter
        filtered = filtered.filter(c =>
            c.price >= filters.priceRange[0] && c.price <= filters.priceRange[1]
        )

        // Level filter
        if (filters.level) {
            filtered = filtered.filter(c => c.level === filters.level)
        }

        setFilteredClasses(filtered)
    }

    const handleLocationChange = (locationId: string) => {
        setFilters({ ...filters, location: locationId, room: '' })
        if (locationId) {
            loadRooms(locationId)
        }
    }

    const getMockClasses = (): Class[] => {
        return [
            {
                id: '1',
                name: 'Zumba Class',
                description: 'High-energy dance fitness class',
                location: { id: 'loc1', name: 'Dubai Marina Center', city: 'Dubai' },
                room: { id: 'room1', name: 'Room B', capacity: 75 },
                startTime: '18:00',
                endTime: '19:00',
                date: '2025-02-15',
                price: 100,
                currency: 'AED',
                capacity: 75,
                enrolled: 45,
                instructor: 'Sarah',
                level: 'Beginner',
                ageGroup: 'All Ages'
            },
            {
                id: '2',
                name: 'Yoga Class',
                description: 'Relaxing yoga session',
                location: { id: 'loc1', name: 'Dubai Marina Center', city: 'Dubai' },
                room: { id: 'room2', name: 'Room A', capacity: 50 },
                startTime: '16:00',
                endTime: '17:00',
                date: '2025-02-15',
                price: 80,
                currency: 'AED',
                capacity: 50,
                enrolled: 30,
                instructor: 'John',
                level: 'Beginner',
                ageGroup: 'All Ages'
            },
            {
                id: '3',
                name: 'CrossFit',
                description: 'Intense strength training',
                location: { id: 'loc1', name: 'Dubai Marina Center', city: 'Dubai' },
                room: { id: 'room3', name: 'Room C', capacity: 30 },
                startTime: '19:00',
                endTime: '20:00',
                date: '2025-02-15',
                price: 120,
                currency: 'AED',
                capacity: 30,
                enrolled: 25,
                instructor: 'Mike',
                level: 'Intermediate',
                ageGroup: 'Adults'
            }
        ]
    }

    const getAvailableSeats = (classItem: Class) => {
        return classItem.capacity - classItem.enrolled
    }

    const isClassFull = (classItem: Class) => {
        return getAvailableSeats(classItem) <= 0
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-4xl font-bold text-slate-900 mb-2">Browse Classes</h1>
                <p className="text-slate-600">Find and book your favorite fitness classes</p>
            </motion.div>

            {/* Search and Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-md p-6 space-y-4"
            >
                {/* Search Bar */}
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

                {/* Filter Toggle */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
                >
                    <Filter className="w-4 h-4" />
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>

                {/* Filters */}
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-200"
                    >
                        {/* Location Filter */}
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">Location</label>
                            <select
                                value={filters.location}
                                onChange={(e) => handleLocationChange(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="">All Locations</option>
                                {locations.map(loc => (
                                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Room Filter */}
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">Room</label>
                            <select
                                value={filters.room}
                                onChange={(e) => setFilters({ ...filters, room: e.target.value })}
                                disabled={!filters.location}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100"
                            >
                                <option value="">All Rooms</option>
                                {rooms.map(room => (
                                    <option key={room.id} value={room.id}>{room.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Date Filter */}
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">Date</label>
                            <input
                                type="date"
                                value={filters.date}
                                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>

                        {/* Level Filter */}
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">Level</label>
                            <select
                                value={filters.level}
                                onChange={(e) => setFilters({ ...filters, level: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="">All Levels</option>
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                        </div>
                    </motion.div>
                )}
            </motion.div>

            {/* Classes Grid */}
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
                    <p className="text-slate-600 text-lg">No classes found matching your filters</p>
                    <button
                        onClick={() => {
                            setSearchTerm('')
                            setFilters({
                                location: '',
                                room: '',
                                date: '',
                                time: '',
                                priceRange: [0, 1000],
                                level: ''
                            })
                        }}
                        className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                        Clear Filters
                    </button>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {filteredClasses.map((classItem, index) => (
                        <motion.div
                            key={classItem.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                        >
                            {/* Class Header */}
                            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 text-white">
                                <h3 className="text-xl font-bold">{classItem.name}</h3>
                                <p className="text-emerald-100 text-sm mt-1">{classItem.description}</p>
                            </div>

                            {/* Class Details */}
                            <div className="p-4 space-y-3">
                                {/* Location */}
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">{classItem.location.name}</p>
                                        <p className="text-xs text-slate-500">{classItem.room.name}</p>
                                    </div>
                                </div>

                                {/* Time */}
                                <div className="flex items-center gap-3">
                                    <Clock className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">
                                            {classItem.startTime} - {classItem.endTime}
                                        </p>
                                        <p className="text-xs text-slate-500">{classItem.date}</p>
                                    </div>
                                </div>

                                {/* Capacity */}
                                <div className="flex items-center gap-3">
                                    <Users className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">
                                            {getAvailableSeats(classItem)} / {classItem.capacity} seats available
                                        </p>
                                        <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
                                            <div
                                                className="bg-emerald-500 h-2 rounded-full"
                                                style={{ width: `${(classItem.enrolled / classItem.capacity) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="flex items-center gap-3 pt-2 border-t border-slate-200">
                                    <DollarSign className="w-5 h-5 text-emerald-600" />
                                    <p className="text-lg font-bold text-slate-900">
                                        {classItem.price} <span className="text-sm text-slate-500">{classItem.currency}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Book Button */}
                            <div className="px-4 pb-4">
                                <Link
                                    href={`/user/book-class/${classItem.id}`}
                                    className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-all ${isClassFull(classItem)
                                        ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                        }`}
                                >
                                    {isClassFull(classItem) ? 'Class Full' : 'Book Now'}
                                    {!isClassFull(classItem) && <ChevronRight className="w-4 h-4" />}
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* Results Count */}
            {!loading && filteredClasses.length > 0 && (
                <div className="text-center text-slate-600 text-sm">
                    Showing {filteredClasses.length} of {classes.length} classes
                </div>
            )}
        </div>
    )
}
