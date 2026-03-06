// Attendance types and interfaces

export interface Attendance {
    id: string;
    studentId: string;
    studentName: string;
    scheduleId: string;
    programName: string;
    date: string;
    checkInTime: string;
    checkOutTime?: string;
    status: 'present' | 'absent' | 'late' | 'excused';
    markedBy: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface AttendanceFilters {
    studentId?: string;
    scheduleId?: string;
    programId?: string;
    locationId?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    page?: number;
    limit?: number;
}

export interface AttendanceStats {
    totalSessions: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    excusedCount: number;
    attendanceRate: number;
    averageCheckInTime: string;
}

export interface QRCodeData {
    studentId: string;
    scheduleId: string;
    timestamp: string;
    signature: string;
}
