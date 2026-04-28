'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { bookingService } from '@/services/bookingService'
import {
    Search,
    Filter,
    Calendar,
    Clock,
    Users,
    MapPin,
    Phone,
    Mail,
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
    AlertCircle,
    Download,
    RefreshCw,
    Plus,
    Eye
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface BookingDetails {
    id: string;
    bookingNumber: string;
    childName: string;
    childAge: number;
    parentName: string;
    parentEmail: string;
    parentPhone: string;
    programName: string;
    programType: 'class' | 'trial' | 'assessment' | 'party' | 'private';
    date: string;
    startTime: string;
    endTime: string;
    coach: string;
    location: string;
    status: 'confirmed' | 'waitlist' | 'cancelled' | 'completed' | 'no-show';
    paymentStatus: 'paid' | 'pending' | 'refunded' | 'failed';
    price: number;
    bookingDate: string;
    specialRequests?: string;
    medicalNotes?: string;
    waitlistPosition?: number;
}

interface BookingManagementProps {
    userRole: 'ADMIN' | 'MANAGER' | 'COACH';
    locationAccess?: string[];
}

const BookingManagement: React.FC<BookingManagementProps> = ({
    userRole,
    locationAccess = []
}) => {
    const [bookings, setBookings] = useState<BookingDetails[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedBooking, setSelectedBooking] = useState<BookingDetails | null>(null)
    const [showDetails, setShowDetails] = useState(false)
    const [filters, setFilters] = useState({
        status: 'all',
        programType: 'all',
        location: 'all',
        paymentStatus: 'all',
        dateRange: 'all'
    })

    const fetchBookings = useCallback(async () => {
        setIsLoading(true)
        try {
            const params: Record<string, string> = {}
            if (filters.status !== 'all') params.status = filters.status
            if (filters.programType !== 'all') params.programType = filters.programType
            if (filters.location !== 'all') params.location = filters.location
            if (filters.paymentStatus !== 'all') params.paymentStatus = filters.paymentStatus
            if (filters.dateRange !== 'all') params.dateRange = filters.dateRange

            const response = await bookingService.getBookings(params)
            setBookings((response as any)?.data ?? response ?? [])
        } catch (error) {
            console.error('Failed to fetch bookings:', error)
            setBookings([])
        } finally {
            setIsLoading(false)
        }
    }, [filters])

    useEffect(() => {
        fetchBookings()
    }, [fetchBookings])

    const getStatusColor = (status: string) => {
        const colors = {
            confirmed: 'text-green-600 bg-green-50 border-green-200',
            waitlist: 'text-yellow-600 bg-yellow-50 border-yellow-200',
            cancelled: 'text-red-600 bg-red-50 border-red-200',
            completed: 'text-blue-600 bg-blue-50 border-blue-200',
            'no-show': 'text-gray-600 bg-gray-50 border-gray-200'
        }
        return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-50 border-gray-200'
    }

    const getPaymentStatusColor = (status: string) => {
        const colors = {
            paid: 'text-green-600 bg-green-50',
            pending: 'text-yellow-600 bg-yellow-50',
            refunded: 'text-blue-600 bg-blue-50',
            failed: 'text-red-600 bg-red-50'
        }
        return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-50'
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'confirmed':
                return <CheckCircle className="w-4 h-4" />
            case 'waitlist':
                return <AlertCircle className="w-4 h-4" />
            case 'cancelled':
                return <XCircle className="w-4 h-4" />
            case 'completed':
                return <CheckCircle className="w-4 h-4" />
            case 'no-show':
                return <XCircle className="w-4 h-4" />
            default:
                return <Clock className="w-4 h-4" />
        }
    }

    const filteredBookings = bookings.filter(booking => {
        const searchMatch = searchTerm === '' ||
            booking.childName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.parentEmail.toLowerCase().includes(searchTerm.toLowerCase())

        const statusMatch = filters.status === 'all' || booking.status === filters.status
        const programMatch = filters.programType === 'all' || booking.programType === filters.programType
        const locationMatch = filters.location === 'all' || booking.location === filters.location
        const paymentMatch = filters.paymentStatus === 'all' || booking.paymentStatus === filters.paymentStatus

        return searchMatch && statusMatch && programMatch && locationMatch && paymentMatch
    })

    const BookingCard = ({ booking }: { booking: BookingDetails }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01, y: -2 }}
            className="cursor-pointer"
        >
            <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-mono text-gray-500">{booking.bookingNumber}</span>
                                <div className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(booking.status)}`}>
                                    {getStatusIcon(booking.status)}
                                    {booking.status.toUpperCase()}
                                </div>
                                {booking.waitlistPosition && (
                                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                        Position #{booking.waitlistPosition}
                                    </span>
                                )}
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{booking.programName}</h3>
                            <p className="text-sm text-gray-600">Child: {booking.childName} (Age {booking.childAge})</p>
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">
                                {booking.price === 0 ? 'FREE' : `HK$${booking.price}`}
                            </div>
                            <div className={`text-xs px-2 py-1 rounded-full ${getPaymentStatusColor(booking.paymentStatus)}`}>
                                {booking.paymentStatus.toUpperCase()}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                        <div className="space-y-2">
                            <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                <span>{new Date(booking.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-2" />
                                <span>{booking.startTime} - {booking.endTime}</span>
                            </div>
                            <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-2" />
                                <span>{booking.location}</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center">
                                <Users className="w-4 h-4 mr-2" />
                                <span>{booking.coach}</span>
                            </div>
                            <div className="flex items-center">
                                <Phone className="w-4 h-4 mr-2" />
                                <span>{booking.parentPhone}</span>
                            </div>
                            <div className="flex items-center">
                                <Mail className="w-4 h-4 mr-2" />
                                <span className="truncate">{booking.parentEmail}</span>
                            </div>
                        </div>
                    </div>

                    {(booking.specialRequests || booking.medicalNotes) && (
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                            {booking.specialRequests && (
                                <p className="text-sm text-blue-700 mb-1">
                                    <strong>Special Requests:</strong> {booking.specialRequests}
                                </p>
                            )}
                            {booking.medicalNotes && (
                                <p className="text-sm text-blue-700">
                                    <strong>Medical Notes:</strong> {booking.medicalNotes}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="flex gap-2">
                        <Button id="booking-booking-management-btn"
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                                setSelectedBooking(booking)
                                setShowDetails(true)
                            }}
                        >
                            <Eye className="w-4 h-4 mr-1" />
                            Details
                        </Button>
                        {(userRole === 'ADMIN' || userRole === 'MANAGER') && (
                            <>
                                <Button id="booking-booking-management-btn-2" size="sm" variant="outline" className="flex-1">
                                    <Edit className="w-4 h-4 mr-1" />
                                    Edit
                                </Button>
                                <Button id="booking-booking-management-btn-3" size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded mb-4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-80 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
                    <p className="text-gray-600">Manage all bookings and customer information</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button id="booking-booking-management-btn-4" variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                    <Button id="booking-booking-management-btn-5" variant="outline" size="sm">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                    <Button id="booking-booking-management-btn-6" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        New Booking
                    </Button>
                </div>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Search className="w-5 h-5" />
                        Search & Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by name, email, or booking number..."
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select id="select-components-booking-BookingManagement-2"
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Status</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="waitlist">Waitlist</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="completed">Completed</option>
                                <option value="no-show">No Show</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Program Type</label>
                            <select id="select-components-booking-BookingManagement-3"
                                value={filters.programType}
                                onChange={(e) => setFilters({ ...filters, programType: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Programs</option>
                                <option value="class">Classes</option>
                                <option value="trial">Trials</option>
                                <option value="assessment">Assessments</option>
                                <option value="party">Parties</option>
                                <option value="private">Private</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                            <select id="select-components-booking-BookingManagement-4"
                                value={filters.location}
                                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Locations</option>
                                <option value="Cyberport">Cyberport</option>
                                <option value="Wan Chai">Wan Chai</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Payment</label>
                            <select id="select-components-booking-BookingManagement-5"
                                value={filters.paymentStatus}
                                onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Payments</option>
                                <option value="paid">Paid</option>
                                <option value="pending">Pending</option>
                                <option value="refunded">Refunded</option>
                                <option value="failed">Failed</option>
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Bookings Grid */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Bookings ({filteredBookings.length})
                    </h3>
                </div>

                <AnimatePresence>
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ staggerChildren: 0.1 }}
                    >
                        {filteredBookings.map((booking) => (
                            <BookingCard key={booking.id} booking={booking} />
                        ))}
                    </motion.div>
                </AnimatePresence>

                {filteredBookings.length === 0 && (
                    <div className="text-center py-12">
                        <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
                        <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
                    </div>
                )}
            </div>

            {/* Booking Details Modal */}
            <AnimatePresence>
                {showDetails && selectedBooking && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                        onClick={() => setShowDetails(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
                                        <p className="text-gray-600">{selectedBooking.bookingNumber}</p>
                                    </div>
                                    <Button id="btn-set-show-details-components-booking-BookingManagement" variant="outline" onClick={() => setShowDetails(false)}>
                                        <XCircle className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="space-y-6">
                                    {/* Child Information */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Child Information</h3>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="font-medium text-gray-700">Name:</span>
                                                <p>{selectedBooking.childName}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Age:</span>
                                                <p>{selectedBooking.childAge} years</p>
                                            </div>
                                        </div>
                                        {selectedBooking.medicalNotes && (
                                            <div className="mt-3">
                                                <span className="font-medium text-gray-700">Medical Notes:</span>
                                                <p className="text-sm bg-red-50 p-2 rounded mt-1">{selectedBooking.medicalNotes}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Parent Information */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Parent Information</h3>
                                        <div className="grid grid-cols-1 gap-4 text-sm">
                                            <div>
                                                <span className="font-medium text-gray-700">Name:</span>
                                                <p>{selectedBooking.parentName}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Email:</span>
                                                <p>{selectedBooking.parentEmail}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Phone:</span>
                                                <p>{selectedBooking.parentPhone}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Class Information */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Class Information</h3>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="font-medium text-gray-700">Program:</span>
                                                <p>{selectedBooking.programName}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Type:</span>
                                                <p className="capitalize">{selectedBooking.programType}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Date:</span>
                                                <p>{new Date(selectedBooking.date).toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Time:</span>
                                                <p>{selectedBooking.startTime} - {selectedBooking.endTime}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Location:</span>
                                                <p>{selectedBooking.location}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Coach:</span>
                                                <p>{selectedBooking.coach}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Information */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Information</h3>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="font-medium text-gray-700">Amount:</span>
                                                <p className="text-lg font-bold">{selectedBooking.price === 0 ? 'FREE' : `HK$${selectedBooking.price}`}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Status:</span>
                                                <p className={`inline-block px-2 py-1 rounded-full text-xs ${getPaymentStatusColor(selectedBooking.paymentStatus)}`}>
                                                    {selectedBooking.paymentStatus.toUpperCase()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {selectedBooking.specialRequests && (
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Special Requests</h3>
                                            <p className="text-sm bg-blue-50 p-3 rounded">{selectedBooking.specialRequests}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default BookingManagement
