'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { bookingApi } from '@/lib/api/booking';
import BookingCard from '@/components/booking/BookingCard';
import CancelBookingModal from '@/components/booking/CancelBookingModal';
import type { Booking } from '@/types/booking';
import { toast } from 'sonner';

export default function MyBookingsPage() {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [cancelModal, setCancelModal] = useState<{
        isOpen: boolean;
        bookingId: string;
        className: string;
    }>({
        isOpen: false,
        bookingId: '',
        className: '',
    });

    useEffect(() => {
        loadBookings();
    }, [activeTab]);

    const loadBookings = async () => {
        try {
            setIsLoading(true);
            const response = await bookingApi.getMyBookings(activeTab);
            setBookings(response.bookings);
        } catch (error: any) {
            toast.error('Failed to load bookings');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelClick = (bookingId: string, className: string) => {
        setCancelModal({
            isOpen: true,
            bookingId,
            className,
        });
    };

    const handleCancelConfirm = async (reason: string) => {
        try {
            await bookingApi.cancelBooking(cancelModal.bookingId, reason);
            toast.success('Booking cancelled successfully');
            setCancelModal({ isOpen: false, bookingId: '', className: '' });
            loadBookings(); // Reload bookings
        } catch (error: any) {
            toast.error('Failed to cancel booking');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading bookings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
                    <p className="mt-2 text-gray-600">
                        View and manage your class bookings
                    </p>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow-sm mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="flex -mb-px">
                            <button
                                onClick={() => setActiveTab('upcoming')}
                                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'upcoming'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Upcoming
                                <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                                    {filterBookings(mockBookings).length}
                                </span>
                            </button>

                            <button
                                onClick={() => setActiveTab('past')}
                                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'past'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Past
                            </button>

                            <button
                                onClick={() => setActiveTab('cancelled')}
                                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'cancelled'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Cancelled
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Bookings List */}
                {bookings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {bookings.map((booking) => (
                            <BookingCard
                                key={booking.id}
                                booking={booking}
                                onCancel={(bookingId) =>
                                    handleCancelClick(bookingId, booking.className)
                                }
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <svg
                            className="w-16 h-16 mx-auto text-gray-400 mb-4"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                        </svg>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No bookings found
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {activeTab === 'upcoming' &&
                                "You don't have any upcoming bookings."}
                            {activeTab === 'past' && "You don't have any past bookings."}
                            {activeTab === 'cancelled' &&
                                "You don't have any cancelled bookings."}
                        </p>
                        <a
                            href="/classes"
                            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Browse Classes
                        </a>
                    </div>
                )}
            </div>

            {/* Cancel Booking Modal */}
            <CancelBookingModal
                isOpen={cancelModal.isOpen}
                onClose={() =>
                    setCancelModal({ isOpen: false, bookingId: '', className: '' })
                }
                onConfirm={handleCancelConfirm}
                bookingId={cancelModal.bookingId}
                className={cancelModal.className}
            />
        </div>
    );
}
