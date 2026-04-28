import apiClient from '@/lib/apiClient';
import type { ApiResponse, PaginatedResponse } from '@/types';
import type { Class, Booking, BookingFilters } from '@/types/booking';

type Pagination = PaginatedResponse<unknown> extends infer P ? Omit<P, 'data'> : never;

// Booking API endpoints
export const bookingApi = {
    // Get all classes with filters
    getClasses: async (
        filters?: BookingFilters,
        page = 1,
        limit = 20
    ): Promise<{ classes: Class[]; pagination: Pagination }> => {
        const response = await apiClient.get<
            ApiResponse<{ classes: Class[]; pagination: Pagination }>
        >('/classes', {
            params: { ...filters, page, limit },
        });
        return response.data;
    },

    // Get class by ID
    getClassById: async (id: string): Promise<Class> => {
        const response = await apiClient.get<ApiResponse<Class>>(`/classes/${id}`);
        return response.data;
    },

    // Get available time slots
    getTimeSlots: async (
        locationId: string,
        date: string
    ): Promise<{ time: string; classes: Class[] }[]> => {
        const response = await apiClient.get<
            ApiResponse<{ time: string; classes: Class[] }[]>
        >('/classes/time-slots', {
            params: { locationId, date },
        });
        return response.data;
    },

    // Get week schedule
    getWeekSchedule: async (
        locationId: string,
        startDate: string
    ): Promise<{ date: string; day: string; classes: Class[] }[]> => {
        const response = await apiClient.get<
            ApiResponse<{ date: string; day: string; classes: Class[] }[]>
        >('/classes/week-schedule', {
            params: { locationId, startDate },
        });
        return response.data;
    },

    // Book a class
    bookClass: async (data: {
        classId: string;
        studentId: string;
        bookingType: 'single' | 'package' | 'trial';
        packageId?: string;
        notes?: string;
    }): Promise<Booking> => {
        const response = await apiClient.post<ApiResponse<Booking>>(
            '/bookings',
            data
        );
        return response.data;
    },

    // Get my bookings
    getMyBookings: async (
        status?: string,
        page = 1,
        limit = 20
    ): Promise<{ bookings: Booking[]; pagination: Pagination }> => {
        const response = await apiClient.get<
            ApiResponse<{ bookings: Booking[]; pagination: Pagination }>
        >('/bookings/my-bookings', {
            params: { status, page, limit },
        });
        return response.data;
    },

    // Get booking by ID
    getBookingById: async (id: string): Promise<Booking> => {
        const response = await apiClient.get<ApiResponse<Booking>>(
            `/bookings/${id}`
        );
        return response.data;
    },

    // Cancel booking
    cancelBooking: async (id: string, reason?: string): Promise<Booking> => {
        const response = await apiClient.post<ApiResponse<Booking>>(
            `/bookings/${id}/cancel`,
            { reason }
        );
        return response.data;
    },

    // Join waitlist
    joinWaitlist: async (classId: string, studentId: string): Promise<any> => {
        const response = await apiClient.post<ApiResponse<any>>(
            '/bookings/waitlist',
            { classId, studentId }
        );
        return response.data;
    },

    // Leave waitlist
    leaveWaitlist: async (classId: string, studentId: string): Promise<any> => {
        const response = await apiClient.delete<ApiResponse<any>>(
            `/bookings/waitlist/${classId}/${studentId}`
        );
        return response.data;
    },

    // Check availability
    checkAvailability: async (classId: string): Promise<{
        available: boolean;
        spotsLeft: number;
        waitlistCount: number;
    }> => {
        const response = await apiClient.get<
            ApiResponse<{
                available: boolean;
                spotsLeft: number;
                waitlistCount: number;
            }>
        >(`/classes/${classId}/availability`);
        return response.data;
    },

    // Get available packages
    getPackages: async (): Promise<any[]> => {
        const response = await apiClient.get<ApiResponse<any[]>>('/packages');
        return response.data;
    },
};
