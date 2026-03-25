'use client'

import { motion } from 'framer-motion'
import { Clock, MapPin, Users, Star, Calendar } from 'lucide-react'

interface AssessmentCardProps {
    id: string
    title: string
    description: string
    image: string
    time: string
    duration: string
    location: string
    ageGroup: string
    level: string
    price: string
    isFree?: boolean
    availableSlots: number
    totalSlots: number
    onBook: (id: string) => void
}

export default function AssessmentCard({
    id,
    title,
    description,
    image,
    time,
    duration,
    location,
    ageGroup,
    level,
    price,
    isFree = false,
    availableSlots,
    totalSlots,
    onBook
}: AssessmentCardProps) {
    const isAlmostFull = availableSlots <= 2
    const isFull = availableSlots === 0

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 h-[480px] flex flex-col"
        >
            {/* Image Section */}
            <div className="relative h-48 overflow-hidden">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover"
                />

                {/* Level Badge */}
                <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${level === 'BEGINNER'
                        ? 'bg-green-100 text-green-800'
                        : level === 'INTERMEDIATE'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                        {level}
                    </span>
                </div>

                {/* Free Badge */}
                {isFree && (
                    <div className="absolute top-3 right-3">
                        <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                            FREE
                        </span>
                    </div>
                )}

                {/* Availability Status */}
                {isFull && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold">
                            FULLY BOOKED
                        </span>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="p-5 flex-1 flex flex-col">
                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {description}
                </p>

                {/* Details Grid */}
                <div className="space-y-2 mb-4 flex-1">
                    {/* Time & Duration */}
                    <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2 text-blue-500" />
                        <span>{time}</span>
                        <span className="mx-2">•</span>
                        <span>{duration}</span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 text-red-500" />
                        <span>{location}</span>
                    </div>

                    {/* Age Group */}
                    <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2 text-green-500" />
                        <span>{ageGroup}</span>
                    </div>

                    {/* Availability */}
                    <div className="flex items-center text-sm">
                        <Calendar className="w-4 h-4 mr-2 text-purple-500" />
                        <span className={`${isAlmostFull ? 'text-orange-600' : 'text-gray-600'
                            }`}>
                            {availableSlots} of {totalSlots} spots available
                        </span>
                    </div>
                </div>

                {/* Price & Book Button */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                    <div className="text-left">
                        {isFree ? (
                            <div className="text-lg font-bold text-green-600">
                                FREE Assessment
                            </div>
                        ) : (
                            <>
                                <div className="text-xs text-gray-500">Drop-in for</div>
                                <div className="text-lg font-bold text-gray-900">{price}</div>
                            </>
                        )}
                    </div>

                    <button id={`assessment-card-${id}-book-btn`}
                        onClick={() => onBook(id)}
                        disabled={isFull}
                        className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${isFull
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : isFree
                                ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl'
                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                            }`}
                    >
                        {isFull ? 'Fully Booked' : 'Book Now'}
                    </button>
                </div>
            </div>
        </motion.div>
    )
}
