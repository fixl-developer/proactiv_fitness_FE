'use client';

import Link from 'next/link';
import type { Booking } from '@/types/booking';

interface BookingCardProps {
    booking: Booking;
    onCancel: (bookingId: string) => void;
}

export default function BookingCard({ booking, onCancel }: BookingCardProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'completed':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const canCancel = booking.status === 'confirmed' || booking.status === 'pending';
    const isPast = new Date(booking.classDate) < new Date();

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        {booking.className}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                        Booking ID: #{booking.id}
                    </p>
                </div>
                <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        booking.status
                    )}`}
                >
                    {booking.status.toUpperCase()}
                </span>
            </div>

            <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-700">
                    <svg
                        className="w-5 h-5 mr-3 text-gray-400"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    <span>{booking.studentName}</span>
                </div>

                <div className="flex items-center text-sm text-gray-700">
                    <svg
                        className="w-5 h-5 mr-3 text-gray-400"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <span>
                        {new Date(booking.classDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </span>
                </div>

                <div className="flex items-center text-sm text-gray-700">
                    <svg
                        className="w-5 h-5 mr-3 text-gray-400"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>{booking.classTime}</span>
                </div>

                <div className="flex items-center text-sm text-gray-700">
                    <svg
                        className="w-5 h-5 mr-3 text-gray-400"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <span>{booking.locationName}</span>
                </div>

                <div className="flex items-center text-sm text-gray-700">
                    <svg
                        className="w-5 h-5 mr-3 text-gray-400"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                    </svg>
                    <span>{booking.packageName}</span>
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-lg font-bold text-gray-900">
                    ${booking.amount.toFixed(2)}
                </div>

                <div className="flex gap-2">
                    <Link
                        href={`/classes/${booking.classId}`}
                        className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        View Details
                    </Link>

                    {canCancel && !isPast && (
                        <button
                            onClick={() => onCancel(booking.id)}
                            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
