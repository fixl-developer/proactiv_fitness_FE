/**
 * Attendance Tracking Service
 * Handles all attendance and time tracking operations
 * Module 5.2 - Phase 5: Staff & Attendance
 */

import apiClient from '@/lib/apiClient';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface StaffAttendance {
    _id: string;
    attendanceId: string;
    staffId: string;
    scheduleId?: string;
    locationId: string;
    date: Date;
    checkInTime: Date;
    checkOutTime?: Date;
    totalHours?: number;
    breakRecords: {
        breakStart: Date;
        breakEnd?: Date;
        breakType: 'lunch' | 'short' | 'emergency';
        duration?: number;
    }[];
    status: 'present' | 'absent' | 'late' | 'early_departure' | 'overtime';
    isLate: boolean;
    lateMinutes?: number;
    isEarlyDeparture: boolean;
    earlyDepartureMinutes?: number;
    checkInLocation?: {
        latitude: number;
        longitude: number;
        address?: string;
    };
    checkOutLocation?: {
        latitude: number;
        longitude: number;
        address?: string;
    };
    checkInMethod: 'manual' | 'qr_code' | 'nfc' | 'biometric' | 'mobile_app';
    checkOutMethod?: 'manual' | 'qr_code' | 'nfc' | 'biometric' | 'mobile_app';
    verifiedBy?: string;
    notes?: string;
    managerNotes?: string;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface AttendanceFilter {
    staffId?: string;
    locationId?: string;
    startDate?: Date;
    endDate?: Date;
    status?: string;
    isLate?: boolean;
    page?: number;
    limit?: number;
}

export interface CheckInDto {
    staffId: string;
    locationId: string;
    scheduleId?: string;
    checkInMethod: 'manual' | 'qr_code' | 'nfc' | 'biometric' | 'mobile_app';
    location?: {
        latitude: number;
        longitude: number;
    };
    notes?: string;
}

export interface CheckOutDto {
    attendanceId: string;
    checkOutMethod: 'manual' | 'qr_code' | 'nfc' | 'biometric' | 'mobile_app';
    location?: {
        latitude: number;
        longitude: number;
    };
    notes?: string;
}

export interface BreakDto {
    attendanceId: string;
    breakType: 'lunch' | 'short' | 'emergency';
}

export interface AttendanceStatistics {
    totalAttendanceRecords: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    overtimeHours: number;
    averageHoursPerDay: number;
    attendanceRate: number;
    punctualityRate: number;
    attendanceByLocation: {
        locationId: string;
        locationName: string;
        attendanceRate: number;
    }[];
}

export interface AttendanceReport {
    staffId: string;
    staffName: string;
    period: string;
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    totalHours: number;
    overtimeHours: number;
    attendanceRate: number;
    punctualityRate: number;
}

// ============================================================================
// ATTENDANCE SERVICE
// ============================================================================

class AttendanceService {
    private readonly baseUrl = '/attendance';

    /**
     * Get all attendance records
     */
    async getAttendance(filters?: AttendanceFilter): Promise<{ data: StaffAttendance[]; total: number; meta: any }> {
        const params = new URLSearchParams();

        if (filters) {
            if (filters.staffId) params.append('staffId', filters.staffId);
            if (filters.locationId) params.append('locationId', filters.locationId);
            if (filters.startDate) params.append('startDate', filters.startDate.toISOString());
            if (filters.endDate) params.append('endDate', filters.endDate.toISOString());
            if (filters.status) params.append('status', filters.status);
            if (filters.isLate !== undefined) params.append('isLate', filters.isLate.toString());
            if (filters.page) params.append('page', filters.page.toString());
            if (filters.limit) params.append('limit', filters.limit.toString());
        }

        const response = await apiClient.get(`${this.baseUrl}?${params.toString()}`);
        return response.data;
    }

    /**
     * Get attendance by ID
     */
    async getAttendanceById(attendanceId: string): Promise<StaffAttendance> {
        const response = await apiClient.get(`${this.baseUrl}/${attendanceId}`);
        return response.data;
    }

    /**
     * Check in
     */
    async checkIn(data: CheckInDto): Promise<StaffAttendance> {
        const response = await apiClient.post(`${this.baseUrl}/check-in`, data);
        return response.data;
    }

    /**
     * Check out
     */
    async checkOut(data: CheckOutDto): Promise<StaffAttendance> {
        const response = await apiClient.post(`${this.baseUrl}/check-out`, data);
        return response.data;
    }

    /**
     * Start break
     */
    async startBreak(data: BreakDto): Promise<StaffAttendance> {
        const response = await apiClient.post(`${this.baseUrl}/break/start`, data);
        return response.data;
    }

    /**
     * End break
     */
    async endBreak(attendanceId: string): Promise<StaffAttendance> {
        const response = await apiClient.post(`${this.baseUrl}/break/end`, { attendanceId });
        return response.data;
    }

    /**
     * Update attendance
     */
    async updateAttendance(attendanceId: string, data: Partial<StaffAttendance>): Promise<StaffAttendance> {
        const response = await apiClient.put(`${this.baseUrl}/${attendanceId}`, data);
        return response.data;
    }

    /**
     * Delete attendance
     */
    async deleteAttendance(attendanceId: string): Promise<void> {
        await apiClient.delete(`${this.baseUrl}/${attendanceId}`);
    }

    /**
     * Mark as absent
     */
    async markAbsent(staffId: string, date: Date, reason?: string): Promise<StaffAttendance> {
        const response = await apiClient.post(`${this.baseUrl}/mark-absent`, {
            staffId,
            date,
            reason
        });
        return response.data;
    }

    /**
     * Get staff attendance history
     */
    async getStaffAttendanceHistory(
        staffId: string,
        startDate: Date,
        endDate: Date
    ): Promise<StaffAttendance[]> {
        const response = await this.getAttendance({
            staffId,
            startDate,
            endDate
        });
        return response.data;
    }

    /**
     * Get today's attendance
     */
    async getTodayAttendance(locationId?: string): Promise<StaffAttendance[]> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const response = await this.getAttendance({
            locationId,
            startDate: today,
            endDate: new Date()
        });
        return response.data;
    }

    /**
     * Get attendance statistics
     */
    async getAttendanceStatistics(
        businessUnitId?: string,
        dateRange?: { startDate: Date; endDate: Date }
    ): Promise<AttendanceStatistics> {
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
     * Get attendance report
     */
    async getAttendanceReport(
        staffId: string,
        period: string
    ): Promise<AttendanceReport> {
        const response = await apiClient.get(`${this.baseUrl}/report/${staffId}?period=${period}`);
        return response.data;
    }

    /**
     * Export attendance records
     */
    async exportAttendance(
        filters?: AttendanceFilter,
        format: 'csv' | 'xlsx' = 'csv'
    ): Promise<Blob> {
        const params = new URLSearchParams();

        if (filters) {
            if (filters.staffId) params.append('staffId', filters.staffId);
            if (filters.locationId) params.append('locationId', filters.locationId);
            if (filters.startDate) params.append('startDate', filters.startDate.toISOString());
            if (filters.endDate) params.append('endDate', filters.endDate.toISOString());
        }
        params.append('format', format);

        const response = await apiClient.get(`${this.baseUrl}/export?${params.toString()}`, {
            responseType: 'blob'
        });
        return response.data;
    }

    /**
     * Get late arrivals
     */
    async getLateArrivals(locationId?: string, date?: Date): Promise<StaffAttendance[]> {
        const response = await this.getAttendance({
            locationId,
            startDate: date || new Date(),
            isLate: true
        });
        return response.data;
    }

    /**
     * Get overtime records
     */
    async getOvertimeRecords(
        staffId?: string,
        startDate?: Date,
        endDate?: Date
    ): Promise<StaffAttendance[]> {
        const response = await this.getAttendance({
            staffId,
            startDate,
            endDate,
            status: 'overtime'
        });
        return response.data;
    }

    /**
     * Verify attendance
     */
    async verifyAttendance(attendanceId: string, verifiedBy: string): Promise<StaffAttendance> {
        const response = await apiClient.post(`${this.baseUrl}/${attendanceId}/verify`, { verifiedBy });
        return response.data;
    }

    /**
     * Add manager notes
     */
    async addManagerNotes(attendanceId: string, notes: string): Promise<StaffAttendance> {
        const response = await apiClient.patch(`${this.baseUrl}/${attendanceId}/notes`, { managerNotes: notes });
        return response.data;
    }

    /**
     * Get current check-in status
     */
    async getCurrentStatus(staffId: string): Promise<{ checkedIn: boolean; attendance?: StaffAttendance }> {
        const response = await apiClient.get(`${this.baseUrl}/status/${staffId}`);
        return response.data;
    }

    /**
     * Bulk check-in
     */
    async bulkCheckIn(staffIds: string[], locationId: string): Promise<{ successful: number; failed: number }> {
        const response = await apiClient.post(`${this.baseUrl}/bulk-check-in`, {
            staffIds,
            locationId
        });
        return response.data;
    }

    /**
     * Get attendance summary
     */
    async getAttendanceSummary(
        staffId: string,
        month: string
    ): Promise<{
        totalDays: number;
        presentDays: number;
        absentDays: number;
        lateDays: number;
        totalHours: number;
        overtimeHours: number;
    }> {
        const response = await apiClient.get(`${this.baseUrl}/summary/${staffId}?month=${month}`);
        return response.data;
    }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const attendanceService = new AttendanceService();
export default attendanceService;
