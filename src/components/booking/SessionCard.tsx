'use client'

import { motion } from 'framer-motion'
import { FiCalendar, FiClock, FiMapPin, FiUser, FiUsers } from 'react-icons/fi'
import { AvailableSession } from '@/services/enhancedBookingService'

interface SessionCardProps {
    session: AvailableSession
    onBook: (sessionId: string) => void
    onViewDetails: (session: AvailableSession) => void
}

export default function SessionCard({ session, onBook, onViewDetails }: SessionCardProps) {
    const availabilityPercentage = (session.available / session.capacity) * 100
    const isAlmostFull = availabilityPercentage <= 20 && availabilityPercentage > 0
    const isFull = session.available === 0

    const getStatusColor = () => {
        if (isFull) return 'bg-red-100 text-red-700 border-red-200'
        if (isAlmostFull) return 'bg-yellow-100 text-yellow-700 border-yellow-200'
        return 'bg-green-100 text-green-700 border-green-200'
    }

    const getStatusText = () => {
        if (isFull) return 'Full - Waitlist Available'
        if (isAlmostFull) return `Only ${session.available} spots left!`
        return `${session.available} spots available`
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
            className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 cursor-pointer"
            onClick={() => onViewDetails(session)}
        >
            {/* Header with Program Name */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
                <h3 className="text-white font-bold text-lg">{session.programName}</h3>
                <p className="text-blue-100 text-sm">{session.programType}</p>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
                {/* Date & Time */}
                <div className="flex items-center space-x-2 text-gray-700">
                    <FiCalendar className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">
                        {new Date(session.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        })}
                    </span>
                </div>

                <div className="flex items-center space-x-2 text-gray-700">
                    <FiClock className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">
                        {session.startTime} - {session.endTime}
                    </span>
                </div>

                {/* Location */}
                <div className="flex items-center space-x-2 text-gray-700">
                    <FiMapPin className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">{session.locationName}</span>
                </div>

                {/* Coach */}
                {session.coachName && (
                    <div className="flex items-center space-x-2 text-gray-700">
                        <FiUser className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">Coach {session.coachName}</span>
                    </div>
                )}

                {/* Capacity */}
                <div className="flex items-center space-x-2 text-gray-700">
                    <FiUsers className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">
                        {session.booked}/{session.capacity} enrolled
                    </span>
                </div>

                {/* Capacity Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className={`h-2 rounded-full transition-all duration-300 ${isFull ? 'bg-red-500' : isAlmostFull ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                        style={{ width: `${(session.booked / session.capacity) * 100}%` }}
                    />
                </div>

                {/* Status Badge */}
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor()}`}>
                    {getStatusText()}
                </div>

                {/* Age Group & Skill Level */}
                <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">
                        Ages {session.ageGroup.min}-{session.ageGroup.max}
                    </span>
                    <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full font-medium">
                        {session.skillLevel}
                    </span>
                </div>

                {/* Price & Book Button */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div>
                        <p className="text-2xl font-bold text-gray-900">
                            ${session.price}
                            <span className="text-sm text-gray-500 font-normal">/{session.currency}</span>
                        </p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                            e.stopPropagation()
                            onBook(session.sessionId)
                        }}
                        className={`px-6 py-2 rounded-lg font-semibold text-white transition-all ${isFull
                                ? 'bg-yellow-500 hover:bg-yellow-600'
                                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                            }`}
                    >
                        {isFull ? 'Join Waitlist' : 'Book Now'}
                    </motion.button>
                </div>
            </div>
        </motion.div>
    )
}
