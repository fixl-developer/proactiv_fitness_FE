/**
 * Booking Engine Service
 * Handles all booking and reservation operations
 * Module 3.2 - Phase 3: Customer & Money
 */

import apiClient from '@/lib/apiClient';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export enum BookingType {
    TRIAL = 'trial',
    DROP_IN = 'drop_in',
    TERM_ENROLLMENT = 'term_enrollment',
    PRIVATE_LESSON = 'private_lesson',
    CAMP = 'camp',
    EVENT = 'event',
    PARTY = 'party',
    ASSESSMENT = 'assessment',
    MAKEUP = 'makeup'
}

export enum BookingStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    WAITLISTED = 'waitlisted',
    CANCELLED = 'cancelled',
    COMPLETED = 'completed',
    NO_SHOW = 'no_show',
    RESCHEDULED = 'rescheduled'
}

export enum PaymentStatus {
    PENDING = 'pending',
    PAID = 'paid',
    PARTIAL = 'partial',
    REFUNDED = 'refunded',
    FAILED = 'failed'
}

export enum WaitlistStatus {
    ACTIVE = 'active',
    OFFERED = 'offered',
    ACCEPTED = 'accepted',
    DECLINED = 'declined',
    EXPIRED = 'expired',
    REMOVED = 'removed'
}

export enum CancellationReason {
    CUSTOMER_REQUEST = 'customer_request',
    ILLNESS = 'illness',
    EMERGENCY = 'emergency',
    SCHEDULE_CONFLICT = 'schedule_conflict',
    DISSATISFACTION = 'dissatisfaction',
    FINANCIAL = 'financial',
    RELOCATION = 'relocation',
    OTHER = 'other'
}

export enum RescheduleReason {
    CUSTOMER_REQUEST = 'customer_request',
    ILLNESS = 'illness',
    EMERGENCY = 'emergency',
    WEATHER = 'weather',
    FACILITY_ISSUE = 'facility_issue',
    COACH_UNAVAILABLE = 'coach_unavailable',
    OTHER = 'other'
}

export interface BookingPreferences {
    preferredDays: string[];
    preferredTimes: string[];
    preferredLocations: string[];
    preferredCoaches: string[];
    avoidDays: string[];
    avoidTimes: string[];
    specialRequests: string[];
}

export interface BookingParticipant {
    childId: string;
    skillLevel?: string;
    medicalFlags: string[];
    specialRequirements: string[];
    isActive: boolean;
}

export interface BookingPayment {
    amount: number;
    currency: string;
    paymentMethodId?: string;
    transactionId?: string;
    status: PaymentStatus;
    paidAt?: Date;
    refundedAt?: Date;
    refundAmount?: number;
    fees: {
        registration?: number;
        processing?: number;
        late?: number;
        cancellation?: number;
    };
}

export interface BookingCancellation {
    reason: CancellationReason;
    reasonDetails?: string;
    cancelledAt: Date;
    cancelledBy: string;
    refundEligible: boolean;
    refundAmount?: number;
    cancellationFee?: number;
    noShowFee?: number;
}

export interface BookingReschedule {
    reason: RescheduleReason;
    reasonDetails?: string;
    originalSessionId: string;
    newSessionId: string;
    rescheduledAt: Date;
    rescheduledBy: string;
    rescheduleCount: number;
    rescheduleDeadline?: Date;
}

export interface WaitlistEntry {
    position: number;
    joinedAt: Date;
    status: WaitlistStatus;
    offeredAt?: Date;
    responseDeadline?: Date;
    respondedAt?: Date;
    priority: number;
    autoAccept: boolean;
    notificationsSent: number;
}

export interface MakeupCredit {
    originalBookingId: string;
    reason: string;
    creditAmount: number;
    expiresAt: Date;
    isUsed: boolean;
    usedAt?: Date;
    usedForBookingId?: string;
}

export interface Booking {
    _id: string;
    bookingId: string;
    bookingType: BookingType;
    status: BookingStatus;
    familyId: string;
    bookedBy: string;
    participants: BookingParticipant[];
    programId: string;
    sessionId?: string;
    termId?: string;
    locationId: string;
    roomId?: string;
    sessionDate?: Date;
    sessionTime?: {
        startTime: string;
        endTime: string;
    };
    preferences: BookingPreferences;
    specialRequests: string[];
    isWaitlisted: boolean;
    waitlistEntry?: WaitlistEntry;
    payment: BookingPayment;
    cancellation?: BookingCancellation;
    reschedule?: BookingReschedule;
    makeupCredits: MakeupCredit[];
    attendanceStatus?: 'present' | 'absent' | 'late' | 'left_early';
    attendanceNotes?: string;
    confirmationSent: boolean;
    remindersSent: number;
    lastReminderSent?: Date;
    businessUnitId: string;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface BookingSearch {
    programIds?: string[];
    programTypes?: string[];
    categories?: string[];
    skillLevels?: string[];
    locationIds?: string[];
    businessUnitId?: string;
    availableDays?: string[];
    timeSlots?: {
        startTime: string;
        endTime: string;
    }[];
    dateRange?: {
        startDate: Date;
        endDate: Date;
    };
    ageRange?: {
        min: number;
        max: number;
        ageType: 'months' | 'years';
    };
    hasAvailability?: boolean;
    minAvailableSpots?: number;
    priceRange?: {
        min: number;
        max: number;
    };
    coachIds?: string[];
    hasWaitlist?: boolean;
    isTrialAvailable?: boolean;
}

export interface BookingAvailability {
    sessionId: string;
    programId: string;
    programName: string;
    date: Date;
    timeSlot: {
        startTime: string;
        endTime: string;
    };
    locationId: string;
    locationName: string;
    roomId?: string;
    roomName?: string;
    coachIds: string[];
    coachNames: string[];
    capacity: {
        total: number;
        booked: number;
        available: number;
        waitlist: number;
    };
    pricing: {
        basePrice: number;
        discountedPrice?: number;
        fees: Record<string, number>;
        totalPrice: number;
    };
    isAvailable: boolean;
    isWaitlistAvailable: boolean;
    restrictions: string[];
}

export interface BookingRequest {
    bookingType: BookingType;
    familyId: string;
    participants: {
        childId: string;
        skillLevel?: string;
    }[];
    programId: string;
    sessionId?: string;
    termId?: string;
    locationId: string;
    preferences?: BookingPreferences;
    specialRequests?: string[];
    paymentMethodId?: string;
    autoAcceptWaitlist?: boolean;
}

export interface BookingConfirmation {
    bookingId: string;
    confirmationNumber: string;
    status: BookingStatus;
    isWaitlisted: boolean;
    waitlistPosition?: number;
    estimatedWaitTime?: string;
    payment: {
        amount: number;
        status: PaymentStatus;
        dueDate?: Date;
    };
    nextSteps: string[];
    importantInfo: string[];
    cancellationPolicy: string;
    reschedulePolicy: string;
}

export interface BookingModification {
    bookingId: string;
    modificationType: 'reschedule' | 'cancel' | 'add_participant' | 'remove_participant';
    reason?: string;
    newSessionId?: string;
    newParticipants?: string[];
    removedParticipants?: string[];
    refundAmount?: number;
    additionalPayment?: number;
}

export interface WaitlistOffer {
    bookingId: string;
    sessionId: string;
    offeredAt: Date;
    responseDeadline: Date;
    position: number;
    sessionDetails: {
        programName: string;
        date: Date;
        time: string;
        location: string;
        coach: string;
    };
    pricing: {
        amount: number;
        fees: Record<string, number>;
        total: number;
    };
}

export interface BookingFilter {
    familyId?: string;
    childId?: string;
    bookingType?: BookingType;
    status?: BookingStatus;
    programId?: string;
    locationId?: string;
    businessUnitId?: string;
    startDate?: Date;
    endDate?: Date;
    paymentStatus?: PaymentStatus;
    isWaitlisted?: boolean;
    searchText?: string;
    page?: number;
    limit?: number;
}

export interface BookingStatistics {
    totalBookings: number;
    bookingsByType: Record<BookingType, number>;
    bookingsByStatus: Record<BookingStatus, number>;
    conversionRate: number;
    cancellationRate: number;
    noShowRate: number;
    averageBookingValue: number;
    totalRevenue: number;
    waitlistStatistics: {
        totalWaitlisted: number;
        averageWaitTime: number;
        conversionRate: number;
    };
    popularPrograms: {
        programId: string;
        programName: string;
        bookingCount: number;
        revenue: number;
    }[];
    peakTimes: {
        day: string;
        hour: number;
        bookingCount: number;
    }[];
}

export interface BookingValidation {
    isEligible: boolean;
    eligibilityReasons: string[];
    hasCapacity: boolean;
    canWaitlist: boolean;
    pricing: {
        basePrice: number;
        discounts: Record<string, number>;
        fees: Record<string, number>;
        totalPrice: number;
    };
    policies: {
        cancellationDeadline: Date;
        rescheduleDeadline: Date;
        refundPolicy: string;
    };
    requirements: string[];
    warnings: string[];
}

export interface BulkBookingRequest {
    familyId: string;
    bookings: {
        programId: string;
        sessionIds: string[];
        participants: string[];
    }[];
    paymentMethodId?: string;
    applyFamilyDiscount?: boolean;
}

export interface BulkBookingResult {
    successful: Booking[];
    failed: {
        sessionId: string;
        reason: string;
        canWaitlist: boolean;
    }[];
    waitlisted: Booking[];
    totalAmount: number;
    discountApplied: number;
    summary: {
        totalRequested: number;
        totalConfirmed: number;
        totalWaitlisted: number;
        totalFailed: number;
    };
}

// ============================================================================
// BOOKING SERVICE
// ============================================================================

class BookingService {
    private readonly baseUrl = '/bookings';

    /**
     * Search available sessions
     */
    async searchAvailability(searchCriteria: BookingSearch): Promise<BookingAvailability[]> {
        const response = await apiClient.post(`${this.baseUrl}/search`, searchCriteria);
        return response.data;
    }

    /**
     * Validate booking request
     */
    async validateBooking(bookingRequest: BookingRequest): Promise<BookingValidation> {
        const response = await apiClient.post(`${this.baseUrl}/validate`, bookingRequest);
        return response.data;
    }

    /**
     * Get all bookings with filtering
     */
    async getBookings(filters?: BookingFilter): Promise<{ data: Booking[]; total: number; meta: any }> {
        const params = new URLSearchParams();

        if (filters) {
            if (filters.familyId) params.append('familyId', filters.familyId);
            if (filters.childId) params.append('childId', filters.childId);
            if (filters.bookingType) params.append('bookingType', filters.bookingType);
            if (filters.status) params.append('status', filters.status);
            if (filters.programId) params.append('programId', filters.programId);
            if (filters.locationId) params.append('locationId', filters.locationId);
            if (filters.businessUnitId) params.append('businessUnitId', filters.businessUnitId);
            if (filters.startDate) params.append('startDate', filters.startDate.toISOString());
            if (filters.endDate) params.append('endDate', filters.endDate.toISOString());
            if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
            if (filters.isWaitlisted !== undefined) params.append('isWaitlisted', filters.isWaitlisted.toString());
            if (filters.searchText) params.append('searchText', filters.searchText);
            if (filters.page) params.append('page', filters.page.toString());
            if (filters.limit) params.append('limit', filters.limit.toString());
        }

        const response = await apiClient.get(`${this.baseUrl}?${params.toString()}`);
        return response.data;
    }

    /**
     * Get booking by ID
     */
    async getBookingById(bookingId: string): Promise<Booking> {
        const response = await apiClient.get(`${this.baseUrl}/${bookingId}`);
        return response.data;
    }

    /**
     * Create new booking
     */
    async createBooking(bookingRequest: BookingRequest): Promise<BookingConfirmation> {
        const response = await apiClient.post(this.baseUrl, bookingRequest);
        return response.data;
    }

    /**
     * Update booking
     */
    async updateBooking(bookingId: string, data: Partial<Booking>): Promise<Booking> {
        const response = await apiClient.put(`${this.baseUrl}/${bookingId}`, data);
        return response.data;
    }

    /**
     * Cancel booking
     */
    async cancelBooking(
        bookingId: string,
        reason: CancellationReason,
        reasonDetails?: string
    ): Promise<Booking> {
        const response = await apiClient.patch(`${this.baseUrl}/${bookingId}/cancel`, {
            reason,
            reasonDetails
        });
        return response.data;
    }

    /**
     * Reschedule booking
     */
    async rescheduleBooking(
        bookingId: string,
        newSessionId: string,
        reason: RescheduleReason,
        reasonDetails?: string
    ): Promise<Booking> {
        const response = await apiClient.patch(`${this.baseUrl}/${bookingId}/reschedule`, {
            newSessionId,
            reason,
            reasonDetails
        });
        return response.data;
    }

    /**
     * Accept waitlist offer
     */
    async acceptWaitlistOffer(bookingId: string): Promise<Booking> {
        const response = await apiClient.patch(`${this.baseUrl}/${bookingId}/waitlist/accept`);
        return response.data;
    }

    /**
     * Decline waitlist offer
     */
    async declineWaitlistOffer(bookingId: string, reason?: string): Promise<Booking> {
        const response = await apiClient.patch(`${this.baseUrl}/${bookingId}/waitlist/decline`, { reason });
        return response.data;
    }

    /**
     * Add participant to booking
     */
    async addParticipant(bookingId: string, participant: { childId: string; skillLevel?: string }): Promise<Booking> {
        const response = await apiClient.post(`${this.baseUrl}/${bookingId}/participants`, participant);
        return response.data;
    }

    /**
     * Remove participant from booking
     */
    async removeParticipant(bookingId: string, childId: string): Promise<Booking> {
        const response = await apiClient.delete(`${this.baseUrl}/${bookingId}/participants/${childId}`);
        return response.data;
    }

    /**
     * Get booking statistics
     */
    async getBookingStatistics(businessUnitId?: string, dateRange?: { startDate: Date; endDate: Date }): Promise<BookingStatistics> {
        const params = new URLSearchParams();
        if (businessUnitId) params.append('businessUnitId', businessUnitId);
        if (dateRange) {
            params.append('startDate', dateRange.startDate.toISOString());
            params.append('endDate', dateRange.endDate.toISOString());
        }

        const response = await apiClient.get(`${this.baseUrl}/statistics?${params.toString()}`);
        return response.data;
    }

    /**
     * Get family bookings
     */
    async getFamilyBookings(familyId: string, filters?: Partial<BookingFilter>): Promise<Booking[]> {
        const response = await this.getBookings({ ...filters, familyId });
        return response.data;
    }

    /**
     * Get child bookings
     */
    async getChildBookings(childId: string, filters?: Partial<BookingFilter>): Promise<Booking[]> {
        const response = await this.getBookings({ ...filters, childId });
        return response.data;
    }

    /**
     * Get upcoming bookings
     */
    async getUpcomingBookings(familyId: string): Promise<Booking[]> {
        const response = await this.getBookings({
            familyId,
            status: BookingStatus.CONFIRMED,
            startDate: new Date()
        });
        return response.data;
    }

    /**
     * Get waitlisted bookings
     */
    async getWaitlistedBookings(familyId: string): Promise<Booking[]> {
        const response = await this.getBookings({
            familyId,
            isWaitlisted: true,
            status: BookingStatus.WAITLISTED
        });
        return response.data;
    }

    /**
     * Create bulk bookings
     */
    async createBulkBookings(bulkRequest: BulkBookingRequest): Promise<BulkBookingResult> {
        const response = await apiClient.post(`${this.baseUrl}/bulk`, bulkRequest);
        return response.data;
    }

    /**
     * Get makeup credits
     */
    async getMakeupCredits(familyId: string): Promise<MakeupCredit[]> {
        const response = await apiClient.get(`${this.baseUrl}/makeup-credits?familyId=${familyId}`);
        return response.data;
    }

    /**
     * Use makeup credit
     */
    async useMakeupCredit(creditId: string, bookingId: string): Promise<Booking> {
        const response = await apiClient.post(`${this.baseUrl}/makeup-credits/${creditId}/use`, { bookingId });
        return response.data;
    }

    /**
     * Check booking eligibility
     */
    async checkEligibility(childId: string, programId: string): Promise<{ eligible: boolean; reasons: string[] }> {
        const response = await apiClient.get(`${this.baseUrl}/eligibility?childId=${childId}&programId=${programId}`);
        return response.data;
    }

    /**
     * Get booking confirmation
     */
    async getBookingConfirmation(bookingId: string): Promise<BookingConfirmation> {
        const response = await apiClient.get(`${this.baseUrl}/${bookingId}/confirmation`);
        return response.data;
    }

    /**
     * Resend booking confirmation
     */
    async resendConfirmation(bookingId: string): Promise<void> {
        await apiClient.post(`${this.baseUrl}/${bookingId}/resend-confirmation`);
    }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const bookingService = new BookingService();
export default bookingService;
