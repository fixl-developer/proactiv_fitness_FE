/**
 * Enhanced Booking Service - Complete Parent Booking Flow
 * Full backend API integration
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// ============================================================================
// ENUMS
// ============================================================================

export enum BookingType {
    TRIAL = 'TRIAL',
    DROP_IN = 'DROP_IN',
    REGULAR_CLASS = 'REGULAR_CLASS',
    TERM_ENROLLMENT = 'TERM_ENROLLMENT',
    PRIVATE_LESSON = 'PRIVATE_LESSON',
    CAMP = 'CAMP',
    EVENT = 'EVENT',
    PARTY = 'PARTY',
    ASSESSMENT = 'ASSESSMENT',
    MAKEUP = 'MAKEUP'
}

export enum BookingStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    WAITLISTED = 'WAITLISTED',
    CANCELLED = 'CANCELLED',
    COMPLETED = 'COMPLETED',
    NO_SHOW = 'NO_SHOW',
    RESCHEDULED = 'RESCHEDULED'
}

export enum PaymentStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    PARTIAL = 'PARTIAL',
    REFUNDED = 'REFUNDED',
    FAILED = 'FAILED'
}

// ============================================================================
// INTERFACES
// ============================================================================

export interface AvailableSession {
    sessionId: string;
    programId: string;
    programName: string;
    programType: string;
    date: string;
    startTime: string;
    endTime: string;
    locationId: string;
    locationName: string;
    roomId?: string;
    roomName?: string;
    coachId?: string;
    coachName?: string;
    capacity: number;
    booked: number;
    available: number;
    waitlistCount: number;
    price: number;
    currency: string;
    ageGroup: {
        min: number;
        max: number;
    };
    skillLevel: string;
    status: 'AVAILABLE' | 'FULL' | 'WAITLIST_ONLY';
}

export interface SearchFilters {
    programType?: string;
    programIds?: string[];
    locationIds?: string[];
    ageGroup?: { min: number; max: number };
    skillLevel?: string;
    dayOfWeek?: string[];
    startDate?: string;
    endDate?: string;
    minPrice?: number;
    maxPrice?: number;
    availableOnly?: boolean;
}

export interface SessionAvailability {
    sessionId: string;
    isAvailable: boolean;
    availableSpots: number;
    waitlistAvailable: boolean;
    waitlistCount: number;
    pricing: {
        basePrice: number;
        registrationFee: number;
        processingFee: number;
        total: number;
        currency: string;
    };
    restrictions: {
        minAge: number;
        maxAge: number;
        requiredSkillLevel: string;
        prerequisites: string[];
    };
}

export interface CreateBookingRequest {
    bookingType: BookingType;
    familyId: string;
    participants: Array<{
        childId: string;
        skillLevel?: string;
        specialRequirements?: string[];
    }>;
    programId: string;
    sessionId: string;
    locationId: string;
    specialRequests?: string[];
    preferences?: {
        preferredDays?: string[];
        preferredTimes?: string[];
    };
}

export interface Booking {
    _id: string;
    bookingId: string;
    bookingType: BookingType;
    status: BookingStatus;
    familyId: string;
    bookedBy: string;
    participants: Array<{
        childId: string;
        childName?: string;
        skillLevel?: string;
    }>;
    programId: string;
    programName?: string;
    sessionId: string;
    sessionDate?: string;
    sessionTime?: {
        startTime: string;
        endTime: string;
    };
    locationId: string;
    locationName?: string;
    payment: {
        amount: number;
        currency: string;
        status: PaymentStatus;
        paidAt?: string;
    };
    isWaitlisted: boolean;
    waitlistEntry?: {
        position: number;
        joinedAt: string;
        status: string;
    };
    cancellation?: {
        reason: string;
        cancelledAt: string;
        refundAmount: number;
    };
    createdAt: string;
    updatedAt: string;
}

export interface CancelBookingRequest {
    reason: string;
    reasonDetails?: string;
}

export interface RescheduleBookingRequest {
    newSessionId: string;
    reason: string;
    reasonDetails?: string;
}

export interface MakeupCredit {
    _id: string;
    originalBookingId: string;
    reason: string;
    creditAmount: number;
    expiresAt: string;
    isUsed: boolean;
    usedAt?: string;
    usedForBookingId?: string;
}

// ============================================================================
// SERVICE CLASS
// ============================================================================

class EnhancedBookingService {
    private getAuthHeaders() {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
        };
    }

    // ========================================================================
    // SEARCH & BROWSE
    // ========================================================================

    /**
     * Search available sessions with filters
     */
    async searchAvailableSessions(filters: SearchFilters): Promise<AvailableSession[]> {
        const params = new URLSearchParams();

        if (filters.programType) params.append('programType', filters.programType);
        if (filters.programIds) filters.programIds.forEach(id => params.append('programIds', id));
        if (filters.locationIds) filters.locationIds.forEach(id => params.append('locationIds', id));
        if (filters.ageGroup) {
            params.append('minAge', String(filters.ageGroup.min));
            params.append('maxAge', String(filters.ageGroup.max));
        }
        if (filters.skillLevel) params.append('skillLevel', filters.skillLevel);
        if (filters.dayOfWeek) filters.dayOfWeek.forEach(day => params.append('dayOfWeek', day));
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        if (filters.minPrice) params.append('minPrice', String(filters.minPrice));
        if (filters.maxPrice) params.append('maxPrice', String(filters.maxPrice));
        if (filters.availableOnly) params.append('availableOnly', 'true');

        const response = await fetch(`${API_URL}/bookings/search?${params.toString()}`, {
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to search sessions');
        }

        const result = await response.json();
        return result.data.sessions || [];
    }

    /**
     * Check availability for a specific session
     */
    async checkAvailability(sessionId: string): Promise<SessionAvailability> {
        const response = await fetch(`${API_URL}/bookings/availability/${sessionId}`, {
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to check availability');
        }

        const result = await response.json();
        return result.data;
    }

    // ========================================================================
    // BOOKING CREATION
    // ========================================================================

    /**
     * Create a new booking
     */
    async createBooking(data: CreateBookingRequest): Promise<Booking> {
        const response = await fetch(`${API_URL}/bookings`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create booking');
        }

        const result = await response.json();
        return result.data;
    }

    // ========================================================================
    // BOOKING MANAGEMENT
    // ========================================================================

    /**
     * Get all bookings for current user/family
     */
    async getMyBookings(filters?: {
        status?: BookingStatus;
        startDate?: string;
        endDate?: string;
    }): Promise<Booking[]> {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);

        const response = await fetch(`${API_URL}/bookings/my-bookings?${params.toString()}`, {
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch bookings');
        }

        const result = await response.json();
        return result.data.bookings || [];
    }

    /**
     * Get booking by ID
     */
    async getBookingById(bookingId: string): Promise<Booking> {
        const response = await fetch(`${API_URL}/bookings/${bookingId}`, {
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch booking');
        }

        const result = await response.json();
        return result.data;
    }

    /**
     * Cancel a booking
     */
    async cancelBooking(bookingId: string, data: CancelBookingRequest): Promise<Booking> {
        const response = await fetch(`${API_URL}/bookings/${bookingId}/cancel`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to cancel booking');
        }

        const result = await response.json();
        return result.data;
    }

    /**
     * Reschedule a booking
     */
    async rescheduleBooking(bookingId: string, data: RescheduleBookingRequest): Promise<Booking> {
        const response = await fetch(`${API_URL}/bookings/${bookingId}/reschedule`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to reschedule booking');
        }

        const result = await response.json();
        return result.data;
    }

    // ========================================================================
    // WAITLIST
    // ========================================================================

    /**
     * Add to waitlist
     */
    async addToWaitlist(sessionId: string, data: {
        childId: string;
        autoAccept?: boolean;
    }): Promise<Booking> {
        const response = await fetch(`${API_URL}/bookings/waitlist`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({ sessionId, ...data }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to add to waitlist');
        }

        const result = await response.json();
        return result.data;
    }

    /**
     * Get my waitlist entries
     */
    async getMyWaitlist(): Promise<Booking[]> {
        const response = await fetch(`${API_URL}/bookings/my-waitlist`, {
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch waitlist');
        }

        const result = await response.json();
        return result.data.bookings || [];
    }

    /**
     * Remove from waitlist
     */
    async removeFromWaitlist(bookingId: string): Promise<void> {
        const response = await fetch(`${API_URL}/bookings/${bookingId}/waitlist/remove`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to remove from waitlist');
        }
    }

    // ========================================================================
    // MAKEUP CREDITS
    // ========================================================================

    /**
     * Get my makeup credits
     */
    async getMyMakeupCredits(): Promise<MakeupCredit[]> {
        const response = await fetch(`${API_URL}/bookings/makeup-credits`, {
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch makeup credits');
        }

        const result = await response.json();
        return result.data.credits || [];
    }

    /**
     * Use makeup credit for booking
     */
    async useMakeupCredit(creditId: string, sessionId: string): Promise<Booking> {
        const response = await fetch(`${API_URL}/bookings/makeup-credits/${creditId}/use`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({ sessionId }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to use makeup credit');
        }

        const result = await response.json();
        return result.data;
    }
}

export const enhancedBookingService = new EnhancedBookingService();
export default enhancedBookingService;
