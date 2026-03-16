/**
 * Staff Management Service
 * Handles all staff and HR operations
 * Module 5.1 - Phase 5: Staff & Attendance
 */

import apiClient from '@/lib/apiClient';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export enum StaffType {
    COACH = 'coach',
    INSTRUCTOR = 'instructor',
    MANAGER = 'manager',
    ADMIN = 'admin',
    RECEPTIONIST = 'receptionist',
    MAINTENANCE = 'maintenance',
    SECURITY = 'security',
    CLEANER = 'cleaner'
}

export enum StaffStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    ON_LEAVE = 'on_leave',
    SUSPENDED = 'suspended',
    TERMINATED = 'terminated'
}

export enum CertificationStatus {
    VALID = 'valid',
    EXPIRED = 'expired',
    EXPIRING_SOON = 'expiring_soon',
    PENDING = 'pending',
    REJECTED = 'rejected'
}

export enum BackgroundCheckStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    EXPIRED = 'expired',
    NOT_REQUIRED = 'not_required'
}

export enum AvailabilityStatus {
    AVAILABLE = 'available',
    UNAVAILABLE = 'unavailable',
    PARTIALLY_AVAILABLE = 'partially_available',
    ON_BREAK = 'on_break',
    SICK_LEAVE = 'sick_leave',
    VACATION = 'vacation'
}

export enum LeaveType {
    ANNUAL = 'annual',
    SICK = 'sick',
    MATERNITY = 'maternity',
    PATERNITY = 'paternity',
    EMERGENCY = 'emergency',
    UNPAID = 'unpaid',
    COMPASSIONATE = 'compassionate',
    STUDY = 'study'
}

export enum LeaveStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    CANCELLED = 'cancelled'
}

export enum ShiftType {
    MORNING = 'morning',
    AFTERNOON = 'afternoon',
    EVENING = 'evening',
    FULL_DAY = 'full_day',
    SPLIT = 'split',
    ON_CALL = 'on_call'
}

export interface PersonalInfo {
    firstName: string;
    lastName: string;
    middleName?: string;
    dateOfBirth: Date;
    gender: 'male' | 'female' | 'other';
    nationality: string;
    idNumber: string;
    idType: 'passport' | 'national_id' | 'driving_license';
    profilePhoto?: string;
}

export interface ContactInfo {
    email: string;
    phone: string;
    alternatePhone?: string;
    address: {
        street: string;
        city: string;
        state: string;
        country: string;
        postalCode: string;
    };
    emergencyContact: {
        name: string;
        relationship: string;
        phone: string;
        email?: string;
    };
}

export interface Certification {
    certificationId: string;
    name: string;
    issuingOrganization: string;
    issueDate: Date;
    expiryDate?: Date;
    certificateNumber: string;
    status: CertificationStatus;
    documentUrl?: string;
    verificationStatus: 'verified' | 'pending' | 'failed';
    notes?: string;
}

export interface BackgroundCheck {
    checkId: string;
    type: 'criminal' | 'employment' | 'education' | 'reference' | 'medical';
    provider: string;
    requestDate: Date;
    completionDate?: Date;
    status: BackgroundCheckStatus;
    result?: 'clear' | 'flagged' | 'failed';
    documentUrl?: string;
    notes?: string;
    expiryDate?: Date;
}

export interface AvailabilitySlot {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
    notes?: string;
}

export interface TimeOffRequest {
    requestId: string;
    type: LeaveType;
    startDate: Date;
    endDate: Date;
    totalDays: number;
    reason: string;
    status: LeaveStatus;
    approvedBy?: string;
    approvedAt?: Date;
    rejectionReason?: string;
    documents?: string[];
    isEmergency: boolean;
}

export interface PerformanceMetrics {
    period: string;
    classesAssigned: number;
    classesCompleted: number;
    attendanceRate: number;
    punctualityScore: number;
    studentSatisfactionRating: number;
    parentFeedbackRating: number;
    skillAssessmentScore: number;
    improvementAreas: string[];
    achievements: string[];
    goals: string[];
}

export interface PayrollInfo {
    employeeId: string;
    payrollProvider?: string;
    hourlyRate?: number;
    monthlyRate?: number;
    currency: string;
    paymentMethod: 'bank_transfer' | 'cash' | 'check' | 'digital_wallet';
    bankDetails?: {
        bankName: string;
        accountNumber: string;
        routingNumber?: string;
        swiftCode?: string;
    };
    taxId?: string;
    socialSecurityNumber?: string;
}

export interface Staff {
    _id: string;
    staffId: string;
    personalInfo: PersonalInfo;
    contactInfo: ContactInfo;
    staffType: StaffType;
    status: StaffStatus;
    hireDate: Date;
    terminationDate?: Date;
    probationEndDate?: Date;
    businessUnitId: string;
    locationIds: string[];
    primaryLocationId: string;
    departmentId?: string;
    supervisorId?: string;
    certifications: Certification[];
    backgroundChecks: BackgroundCheck[];
    skills: string[];
    specializations: string[];
    languages: string[];
    experienceYears: number;
    weeklyAvailability: AvailabilitySlot[];
    currentAvailabilityStatus: AvailabilityStatus;
    maxHoursPerWeek: number;
    preferredShiftTypes: ShiftType[];
    annualLeaveEntitlement: number;
    annualLeaveUsed: number;
    sickLeaveEntitlement: number;
    sickLeaveUsed: number;
    timeOffRequests: TimeOffRequest[];
    performanceMetrics: PerformanceMetrics[];
    trainingRecords: {
        trainingId: string;
        trainingName: string;
        completionDate: Date;
        certificateUrl?: string;
        score?: number;
    }[];
    payrollInfo: PayrollInfo;
    benefits: string[];
    isActive: boolean;
    lastLoginAt?: Date;
    notes?: string;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface StaffSchedule {
    _id: string;
    scheduleId: string;
    staffId: string;
    locationId: string;
    date: Date;
    shiftType: ShiftType;
    startTime: Date;
    endTime: Date;
    breakStartTime?: Date;
    breakEndTime?: Date;
    assignedClasses: {
        classId: string;
        className: string;
        startTime: Date;
        endTime: Date;
        roomId: string;
        studentCount: number;
    }[];
    status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
    actualStartTime?: Date;
    actualEndTime?: Date;
    checkInTime?: Date;
    checkOutTime?: Date;
    totalHours?: number;
    overtimeHours?: number;
    notes?: string;
    managerNotes?: string;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface StaffFilter {
    staffType?: StaffType;
    status?: StaffStatus;
    businessUnitId?: string;
    locationId?: string;
    skills?: string[];
    availabilityStatus?: AvailabilityStatus;
    searchText?: string;
    page?: number;
    limit?: number;
}

export interface CreateStaffDto {
    personalInfo: PersonalInfo;
    contactInfo: ContactInfo;
    staffType: StaffType;
    businessUnitId: string;
    locationIds: string[];
    primaryLocationId: string;
    skills?: string[];
    specializations?: string[];
    languages?: string[];
    experienceYears?: number;
    maxHoursPerWeek?: number;
    payrollInfo: PayrollInfo;
}

export interface CreateScheduleDto {
    staffId: string;
    locationId: string;
    date: Date;
    shiftType: ShiftType;
    startTime: Date;
    endTime: Date;
    assignedClasses?: string[];
}

export interface CreateTimeOffDto {
    staffId: string;
    type: LeaveType;
    startDate: Date;
    endDate: Date;
    reason: string;
    isEmergency?: boolean;
    documents?: string[];
}

export interface StaffStatistics {
    totalStaff: number;
    activeStaff: number;
    staffByType: Record<StaffType, number>;
    staffByStatus: Record<StaffStatus, number>;
    staffByLocation: {
        locationId: string;
        locationName: string;
        staffCount: number;
    }[];
    averageExperience: number;
    certificationExpiring: number;
    backgroundChecksExpiring: number;
    attendanceRate: number;
    turnoverRate: number;
}

// ============================================================================
// STAFF SERVICE
// ============================================================================

class StaffService {
    private readonly baseUrl = '/staff';

    /**
     * Get all staff members
     */
    async getStaff(filters?: StaffFilter): Promise<{ data: Staff[]; total: number; meta: any }> {
        const params = new URLSearchParams();

        if (filters) {
            if (filters.staffType) params.append('staffType', filters.staffType);
            if (filters.status) params.append('status', filters.status);
            if (filters.businessUnitId) params.append('businessUnitId', filters.businessUnitId);
            if (filters.locationId) params.append('locationId', filters.locationId);
            if (filters.skills) filters.skills.forEach(s => params.append('skills', s));
            if (filters.availabilityStatus) params.append('availabilityStatus', filters.availabilityStatus);
            if (filters.searchText) params.append('searchText', filters.searchText);
            if (filters.page) params.append('page', filters.page.toString());
            if (filters.limit) params.append('limit', filters.limit.toString());
        }

        const response = await apiClient.get(`${this.baseUrl}?${params.toString()}`);
        return response.data;
    }

    /**
     * Get staff member by ID
     */
    async getStaffById(staffId: string): Promise<Staff> {
        const response = await apiClient.get(`${this.baseUrl}/${staffId}`);
        return response.data.data;
    }

    /**
     * Create staff member
     */
    async createStaff(data: CreateStaffDto): Promise<Staff> {
        const response = await apiClient.post(this.baseUrl, data);
        return response.data.data;
    }

    /**
     * Update staff member
     */
    async updateStaff(staffId: string, data: Partial<Staff>): Promise<Staff> {
        const response = await apiClient.put(`${this.baseUrl}/${staffId}`, data);
        return response.data.data;
    }

    /**
     * Delete staff member
     */
    async deleteStaff(staffId: string): Promise<void> {
        await apiClient.delete(`${this.baseUrl}/${staffId}`);
    }

    /**
     * Update staff status
     */
    async updateStaffStatus(staffId: string, status: StaffStatus): Promise<Staff> {
        const response = await apiClient.patch(`${this.baseUrl}/${staffId}/status`, { status });
        return response.data.data;
    }

    /**
     * Add certification
     */
    async addCertification(staffId: string, certification: Partial<Certification>): Promise<Staff> {
        const response = await apiClient.post(`${this.baseUrl}/${staffId}/certifications`, certification);
        return response.data.data;
    }

    /**
     * Update certification
     */
    async updateCertification(staffId: string, certificationId: string, data: Partial<Certification>): Promise<Staff> {
        const response = await apiClient.put(`${this.baseUrl}/${staffId}/certifications/${certificationId}`, data);
        return response.data.data;
    }

    /**
     * Add background check
     */
    async addBackgroundCheck(staffId: string, check: Partial<BackgroundCheck>): Promise<Staff> {
        const response = await apiClient.post(`${this.baseUrl}/${staffId}/background-checks`, check);
        return response.data.data;
    }

    /**
     * Update availability
     */
    async updateAvailability(staffId: string, availability: AvailabilitySlot[]): Promise<Staff> {
        const response = await apiClient.put(`${this.baseUrl}/${staffId}/availability`, { weeklyAvailability: availability });
        return response.data.data;
    }

    /**
     * Create time off request
     */
    async createTimeOffRequest(data: CreateTimeOffDto): Promise<TimeOffRequest> {
        const response = await apiClient.post(`${this.baseUrl}/time-off`, data);
        return response.data.data;
    }

    /**
     * Approve time off request
     */
    async approveTimeOff(requestId: string): Promise<TimeOffRequest> {
        const response = await apiClient.post(`${this.baseUrl}/time-off/${requestId}/approve`);
        return response.data.data;
    }

    /**
     * Reject time off request
     */
    async rejectTimeOff(requestId: string, reason: string): Promise<TimeOffRequest> {
        const response = await apiClient.post(`${this.baseUrl}/time-off/${requestId}/reject`, { reason });
        return response.data.data;
    }

    /**
     * Get staff schedules
     */
    async getSchedules(filters?: {
        staffId?: string;
        locationId?: string;
        startDate?: Date;
        endDate?: Date;
        status?: string;
    }): Promise<StaffSchedule[]> {
        const params = new URLSearchParams();

        if (filters) {
            if (filters.staffId) params.append('staffId', filters.staffId);
            if (filters.locationId) params.append('locationId', filters.locationId);
            if (filters.startDate) params.append('startDate', filters.startDate.toISOString());
            if (filters.endDate) params.append('endDate', filters.endDate.toISOString());
            if (filters.status) params.append('status', filters.status);
        }

        const response = await apiClient.get(`${this.baseUrl}/schedules?${params.toString()}`);
        return response.data.data;
    }

    /**
     * Create schedule
     */
    async createSchedule(data: CreateScheduleDto): Promise<StaffSchedule> {
        const response = await apiClient.post(`${this.baseUrl}/schedules`, data);
        return response.data.data;
    }

    /**
     * Update schedule
     */
    async updateSchedule(scheduleId: string, data: Partial<StaffSchedule>): Promise<StaffSchedule> {
        const response = await apiClient.put(`${this.baseUrl}/schedules/${scheduleId}`, data);
        return response.data.data;
    }

    /**
     * Delete schedule
     */
    async deleteSchedule(scheduleId: string): Promise<void> {
        await apiClient.delete(`${this.baseUrl}/schedules/${scheduleId}`);
    }

    /**
     * Get staff statistics
     */
    async getStaffStatistics(businessUnitId?: string): Promise<StaffStatistics> {
        const params = businessUnitId ? `?businessUnitId=${businessUnitId}` : '';
        const response = await apiClient.get(`${this.baseUrl}/statistics${params}`);
        return response.data.data;
    }

    /**
     * Get available staff
     */
    async getAvailableStaff(locationId: string, date: Date, timeSlot: { startTime: string; endTime: string }): Promise<Staff[]> {
        const response = await apiClient.post(`${this.baseUrl}/available`, {
            locationId,
            date,
            timeSlot
        });
        return response.data.data;
    }

    /**
     * Add performance metrics
     */
    async addPerformanceMetrics(staffId: string, metrics: PerformanceMetrics): Promise<Staff> {
        const response = await apiClient.post(`${this.baseUrl}/${staffId}/performance`, metrics);
        return response.data.data;
    }

    /**
     * Get expiring certifications
     */
    async getExpiringCertifications(days: number = 30): Promise<{ staff: Staff; certification: Certification }[]> {
        const response = await apiClient.get(`${this.baseUrl}/certifications/expiring?days=${days}`);
        return response.data.data;
    }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const staffService = new StaffService();
export default staffService;
