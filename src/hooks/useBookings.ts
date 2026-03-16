import { useState, useEffect } from 'react'
import { BookingService, TimeSlot, Booking, BookingRequest } from '@/services/bookingService'

interface UseBookingsReturn {
    bookings: Booking[]
    isLoading: boolean
    error: string | null
    createBooking: (bookingData: BookingRequest) => Promise<boolean>
    cancelBooking: (bookingId: string, reason?: string) => Promise<boolean>
    refreshBookings: () => Promise<void>
}

export const useBookings = (userId?: string): UseBookingsReturn => {
    const [bookings, setBookings] = useState<Booking[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Load bookings on mount
    useEffect(() => {
        loadBookings()
    }, [userId])

    const loadBookings = async () => {
        try {
            setIsLoading(true)
            setError(null)
            const userBookings = await BookingService.getUserBookings(userId)
            setBookings(userBookings)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load bookings')
            console.error('Load bookings failed:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const createBooking = async (bookingData: BookingRequest): Promise<boolean> => {
        try {
            setError(null)
            const response = await BookingService.createBooking(bookingData)

            if (response.success) {
                // Add new booking to the list
                setBookings(prev => [response.data, ...prev])
                return true
            }

            return false
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create booking')
            console.error('Create booking failed:', err)
            return false
        }
    }

    const cancelBooking = async (bookingId: string, reason?: string): Promise<boolean> => {
        try {
            setError(null)
            const response = await BookingService.cancelBooking(bookingId, reason)

            if (response.success) {
                // Update booking status in the list
                setBookings(prev =>
                    prev.map(booking =>
                        booking.id === bookingId
                            ? { ...booking, status: 'cancelled' }
                            : booking
                    )
                )
                return true
            }

            return false
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to cancel booking')
            console.error('Cancel booking failed:', err)
            return false
        }
    }

    const refreshBookings = async (): Promise<void> => {
        await loadBookings()
    }

    return {
        bookings,
        isLoading,
        error,
        createBooking,
        cancelBooking,
        refreshBookings
    }
}

// Hook for available time slots
interface UseTimeSlotsReturn {
    timeSlots: TimeSlot[]
    isLoading: boolean
    error: string | null
    loadSlots: (filters?: any) => Promise<void>
    refreshSlots: () => Promise<void>
}

export const useTimeSlots = (initialFilters?: any): UseTimeSlotsReturn => {
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [filters, setFilters] = useState(initialFilters || {})

    // Load slots on mount and when filters change
    useEffect(() => {
        loadSlots(filters)
    }, [])

    const loadSlots = async (newFilters?: any) => {
        try {
            setIsLoading(true)
            setError(null)

            const filtersToUse = newFilters || filters
            setFilters(filtersToUse)

            const slots = await BookingService.getAvailableSlots(filtersToUse)
            setTimeSlots(slots)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load time slots')
            console.error('Load time slots failed:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const refreshSlots = async (): Promise<void> => {
        await loadSlots(filters)
    }

    return {
        timeSlots,
        isLoading,
        error,
        loadSlots,
        refreshSlots
    }
}