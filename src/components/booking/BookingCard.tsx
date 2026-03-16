'use client'

import { motion } from 'framer-motion'
import { FiCalendar, FiClock, FiMapPin, FiUser, FiDollarSign, FiAlertCircle, FiCheckCircle } from 'react-icons/fi'
import { Booking, BookingStatus, PaymentStatus } from '@/services/enhancedBookingService'
import Link from 'next/link'

interface BookingCardProps {
    booking: Booking
    onCancel?: (bookingId: string) => void
    onReschedule?: (bookingId: string) => void
}

export default function BookingCard({ booking, onCancel, onReschedule }: BookingCardProps) {
    const getStatusColor = (status: BookingStatus) => {
        switch (status) {
            case BookingStatus.CONFIRMED:
                return 'bg-green-100 text-green-700 border-green-200'
            case BookingStatus.PENDING:
                return 'bg-yellow-100 text-yellow-700 border-yellow-200'
            case BookingStatus.WAITLISTED:
                return 'bg-blue-100 text-blue-700 border-blue-200'
            case BookingStatus.CANCELLED:
                return 'bg-red-100 text-red-700 border-red-200'
            case BookingStatus.COMPLETED:
                return 'bg-gray-100 text-gray-700 border-gray-200'
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200'
        }
    }

    const getPaymentStatusColor = (status: PaymentStatus) => {
        switch (status) {
            case PaymentStatus.PAID:
                return 'text-green-600'
            case PaymentStatus.PENDING:
                return 'text-yellow-600'
            case PaymentStatus.FAILED:
                return 'text-red-600'
            case PaymentStatus.REFUNDED:
                return 'text-blue-600'
            default:
                return 'text-gray-600'
        }
    }

    const isPastSession = booking.sessionDate && new Date(booking.sessionDate) < new Date()
    const canCancel = booking.status === BookingStatus.CONFIRMED || booking.status === BookingStatus.PENDING
    const canReschedule = booking.status === BookingStatus.CONFIRMED && !isPastSession

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -3, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
            className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
        >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-white font-bold text-lg">{booking.programName}</h3>
                        <p className="text-blue-100 text-sm">Booking ID: {booking.bookingId}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(booking.status)}`}>
                        {booking.status}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
                {/* Participants */}
                <div className="flex items-start space-x-2">
                    <FiUser className="w-4 h-4 text-blue-600 mt-1" />
                    <div>
                        <p className="text-sm font-medium text-gray-700">Participants:</p>
                        {booking.participants.map((participant, idx) => (
                            <p key={idx} className="text-sm text-gray-600">
                                {participant.childName || `Child ${idx + 1}`}
                                {participant.skillLevel && ` (${participant.skillLevel})`}
                            </p>
                        ))}
                    </div>
                </div>

                {/* Date & Time */}
                {booking.sessionDate && (
                    <div className="flex items-center space-x-2 text-gray-700">
                        <FiCalendar className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">
                            {new Date(booking.sessionDate).toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </span>
                    </div>
                )}

                {booking.sessionTime && (
                    <div className="flex items-center space-x-2 text-gray-700">
                        <FiClock className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">
                            {booking.sessionTime.startTime} - {booking.sessionTime.endTime}
                        </span>
                    </div>
                )}

                {/* Location */}
                {booking.locationName && (
                    <div className="flex items-center space-x-2 text-gray-700">
                        <FiMapPin className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">{booking.locationName}</span>
                    </div>
                )}

                {/* Payment Status */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                        <FiDollarSign className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-700">
                            ${booking.payment.amount} {booking.payment.currency}
                        </span>
                    </div>
                    <div className={`flex items-center space-x-1 ${getPaymentStatusColor(booking.payment.status)}`}>
                        {booking.payment.status === PaymentStatus.PAID ? (
                            <FiCheckCircle className="w-4 h-4" />
                        ) : (
                            <FiAlertCircle className="w-4 h-4" />
                        )}
                        <span className="text-sm font-semibold">{booking.payment.status}</span>
                    </div>
                </div>

                {/* Waitlist Info */}
                {booking.isWaitlisted && booking.waitlistEntry && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm font-semibold text-blue-900">
                            Waitlist Position: #{booking.waitlistEntry.position}
                        </p>
                        <p className="text-xs text-blue-700 mt-1">
                            Joined: {new Date(booking.waitlistEntry.joinedAt).toLocaleDateString()}
                        </p>
                    </div>
                )}

                {/* Cancellation Info */}
                {booking.cancellation && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm font-semibold text-red-900">
                            Cancelled: {booking.cancellation.reason}
                        </p>
                        {booking.cancellation.refundAmount > 0 && (
                            <p className="text-xs text-red-700 mt-1">
                                Refund: ${booking.cancellation.refundAmount}
                            </p>
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 pt-3 border-t border-gray-100">
                    <Link
                        href={`/parent/bookings/${booking._id}`}
                        className="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
                    >
                        View Details
                    </Link>

                    {canReschedule && onReschedule && (
                        <button
                            onClick={() => onReschedule(booking._id)}
                            className="px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-all"
                        >
                            Reschedule
                        </button>
                    )}

                    {canCancel && onCancel && (
                        <button
                            onClick={() => onCancel(booking._id)}
                            className="px-4 py-2 border-2 border-red-600 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-all"
                        >
                            Cancel
                        </button>
                    )}
                </div>

                {/* Payment Button */}
                {booking.payment.status === PaymentStatus.PENDING && (
                    <Link
                        href={`/parent/bookings/${booking._id}/payment`}
                        className="block w-full text-center px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-bold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg"
                    >
                        Complete Payment
                    </Link>
                )}
            </div>
        </motion.div>
    )
}
