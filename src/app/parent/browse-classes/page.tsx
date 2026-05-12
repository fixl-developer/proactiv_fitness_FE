'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, MapPin, Clock, Users, DollarSign, Calendar, Filter, ChevronRight, AlertCircle, Loader, User } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/services/api/client'

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

interface Child {
    id: string
    name: string
    age: number
    dateOfBirth: string
}

interface FilterOptions {
    location: string
    room: string
    date: string
    time: string
    priceRange: [number, number]
    level: string
    ageGroup: string
}

export default function ParentBrowseClassesPage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [classes, setClasses] = useState<Class[]>([])
    const [filteredClasses, setFilteredClasses] = useState<Class[]>([])
    const [children, setChildren] = useState<Child[]>([])
    const [selectedChild, setSelectedChild] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [showFilters, setShowFilters] = useState(false)
    const [filters, setFilters] = useState<FilterOptions>({
        location: '',
        room: '',
        date: '',
        time: '',
        priceRange: [0, 1000],
        level: '',
        ageGroup: ''
    })

    const [locations, setLocations] = useState<any[]>([])
    const [rooms, setRooms] = useState<any[]>([])

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadChildren()
        loadClasses()
        loadLocations()
    }, [isAuthenticated, router])

    useEffect(() => {
        applyFilters()
    }, [classes, filters, searchTerm])

    const loadChildren = async () => {
        try {
            const response = await apiClient.get<any>('/parent/children')
            const list: any[] = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : [])
            const mapped: Child[] = list.map((c) => ({
                id: String(c.id ?? c._id ?? ''),
                name: c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Child',
                age: Number(c.age ?? 0),
                dateOfBirth: c.dateOfBirth || '',
            }))
            setChildren(mapped)
            if (mapped.length > 0) setSelectedChild(mapped[0].id)
        } catch (error) {
            console.error('Error loading children:', error)
            setChildren([])
        }
    }

    const loadClasses = async () => {
        try {
            setLoading(true)
            const response = await apiClient.get<any>('/parent/browse-classes')
            const list: any[] = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : [])
            // Backend returns flat items (sessions + admin programs); reshape to the
            // structure this page renders. Fields that aren't available from the
            // backend fall through to safe defaults so the UI still renders.
            const mapped: Class[] = list.map((it: any) => ({
                id: String(it.id ?? it._id ?? ''),
                name: it.program || it.name || 'Class',
                description: it.description || '',
                location: {
                    id: String(it.locationId || it.location?.id || ''),
                    name: typeof it.location === 'string' ? it.location : (it.location?.name || ''),
                    city: typeof it.location === 'object' ? (it.location?.city || '') : '',
                },
                room: { id: '', name: '', capacity: 0 },
                startTime: it.time || it.startTime || '',
                endTime: it.endTime || '',
                date: it.date || '',
                price: Number(it.price ?? 0),
                currency: it.currency || 'HK$',
                capacity: Number(it.capacity ?? (it.availableSpots ?? 0)),
                enrolled: Number(it.enrolled ?? 0),
                instructor: it.coach || it.instructor || '',
                level: it.level || '',
                ageGroup: it.ageGroup || '',
            }))
            setClasses(mapped)
        } catch (error) {
            console.error('Error loading classes:', error)
            setClasses([])
            toast.error('Failed to load classes')
        } finally {
            setLoading(false)
        }
    }

    const loadLocations = async () => {
        try {
            const response = await apiClient.get<any>('/locations')
            const payload = response?.data ?? response
            const list: any[] = Array.isArray(payload?.locations)
                ? payload.locations
                : Array.isArray(payload?.items)
                    ? payload.items
                    : Array.isArray(payload)
                        ? payload
                        : []
            setLocations(list)
        } catch (error) {
            console.error('Error loading locations:', error)
            setLocations([])
        }
    }

    const loadRooms = async (locationId: string) => {
        try {
            const response = await apiClient.get<any>(`/rooms?locationId=${locationId}`)
            const payload = response?.data ?? response
            const list: any[] = Array.isArray(payload?.rooms)
                ? payload.rooms
                : Array.isArray(payload?.items)
                    ? payload.items
                    : Array.isArray(payload)
                        ? payload
                        : []
            setRooms(list)
        } catch (error) {
            console.error('Error loading rooms:', error)
            setRooms([])
        }
    }

    const applyFilters = () => {
        let filtered = classes

        if (searchTerm) {
            filtered = filtered.filter(c =>
                c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.description?.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        if (filters.location) {
            filtered = filtered.filter(c => c.location.id === filters.location)
        }

        if (filters.room) {
            filtered = filtered.filter(c => c.room.id === filters.room)
        }

        if (filters.date) {
            filtered = filtered.filter(c => c.date === filters.date)
        }

        if (filters.time) {
            filtered = filtered.filter(c => c.startTime.startsWith(filters.time))
        }

        filtered = filtered.filter(c =>
            c.price >= filters.priceRange[0] && c.price <= filters.priceRange[1]
        )

        if (filters.level) {
            filtered = filtered.filter(c => c.level === filters.level)
        }

        if (filters.ageGroup) {
            filtered = filtered.filter(c => c.ageGroup === filters.ageGroup)
        }

        setFilteredClasses(filtered)
    }

    const handleLocationChange = (locationId: string) => {
        setFilters({ ...filters, location: locationId, room: '' })
        if (locationId) {
            loadRooms(locationId)
        }
    }

    const getAvailableSeats = (classItem: Class) => {
        return classItem.capacity - classItem.enrolled
    }

    const isClassFull = (classItem: Class) => {
        return getAvailableSeats(classItem) <= 0
    }

    const selectedChildData = children.find(c => c.id === selectedChild)

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-4xl font-bold text-slate-900 mb-2">Browse Classes</h1>
                <p className="text-slate-600">Find and book classes for your children</p>
            </motion.div>

            {/* Child Selection */}
            {children.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg shadow-md p-6"
                >
                    <label className="block text-sm font-medium text-slate-900 mb-3">Select Child</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {children.map(child => (
                            <button
                                key={child.id}
                                onClick={() => setSelectedChild(child.id)}
                                className={`p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${selectedChild === child.id
                                    ? 'border-blue-600 bg-blue-50'
                                    : 'border-slate-200 hover:border-slate-300'
                                    }`}
                            >
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                                    {child.name.charAt(0)}
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-slate-900">{child.name}</p>
                                    <p className="text-xs text-slate-500">{child.age} years old</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </motion.div>
            )}

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
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Filter Toggle */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                    <Filter className="w-4 h-4" />
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>

                {/* Filters */}
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pt-4 border-t border-slate-200"
                    >
                        {/* Location Filter */}
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">Location</label>
                            <select
                                value={filters.location}
                                onChange={(e) => handleLocationChange(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
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
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Level Filter — derived from the classes the API
                            actually returned so we never offer an option that
                            has no matching session. */}
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">Level</label>
                            <select
                                value={filters.level}
                                onChange={(e) => setFilters({ ...filters, level: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Levels</option>
                                {Array.from(new Set(classes.map(c => c.level).filter(Boolean) as string[])).sort().map(lvl => (
                                    <option key={lvl} value={lvl}>{lvl}</option>
                                ))}
                            </select>
                        </div>

                        {/* Age Group Filter — same dynamic source. */}
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">Age Group</label>
                            <select
                                value={filters.ageGroup}
                                onChange={(e) => setFilters({ ...filters, ageGroup: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Ages</option>
                                {Array.from(new Set(classes.map(c => c.ageGroup).filter(Boolean) as string[])).sort().map(ag => (
                                    <option key={ag} value={ag}>{ag}</option>
                                ))}
                            </select>
                        </div>
                    </motion.div>
                )}
            </motion.div>

            {/* Classes Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader className="w-8 h-8 text-blue-600 animate-spin" />
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
                                level: '',
                                ageGroup: ''
                            })
                        }}
                        className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
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
                            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-4 text-white">
                                <h3 className="text-xl font-bold">{classItem.name}</h3>
                                <p className="text-blue-100 text-sm mt-1">{classItem.description}</p>
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

                                {/* Age Group */}
                                <div className="flex items-center gap-3">
                                    <User className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">{classItem.ageGroup}</p>
                                    </div>
                                </div>

                                {/* Capacity */}
                                <div className="flex items-center gap-3">
                                    <Users className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">
                                            {classItem.capacity - classItem.enrolled} / {classItem.capacity} seats
                                        </p>
                                        <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
                                            <div
                                                className="bg-blue-500 h-2 rounded-full"
                                                style={{ width: `${(classItem.enrolled / classItem.capacity) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="flex items-center gap-3 pt-2 border-t border-slate-200">
                                    <DollarSign className="w-5 h-5 text-blue-600" />
                                    <p className="text-lg font-bold text-slate-900">
                                        {classItem.price} <span className="text-sm text-slate-500">{classItem.currency}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Book Button */}
                            <div className="px-4 pb-4">
                                <Link
                                    href={`/parent/book-class/${classItem.id}?childId=${selectedChild}`}
                                    className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-all ${isClassFull(classItem)
                                        ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                        }`}
                                >
                                    {isClassFull(classItem) ? 'Class Full' : 'Book for ' + (selectedChildData?.name || 'Child')}
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
