import { apiClient } from './client';
import type { Attendance, AttendanceFilters, AttendanceStats, ApiResponse } from '@/types';

export const attendanceApi = {
    getAll: async (filters?: AttendanceFilters) => {
        const response = await apiClient.get<ApiResponse<{ attendance: Attendance[]; total: number }>>(
            '/attendance',
            { params: filters }
        );
        return response.data.data;
    },

    getById: async (id: string) => {
        const response = await apiClient.get<ApiResponse<Attendance>>(`/attendance/${id}`);
        return response.data.data;
    },

    checkIn: async (data: { studentId: string; scheduleId: string }) => {
        const response = await apiClient.post<ApiResponse<Attendance>>('/attendance/check-in', data);
        return response.data.data;
    },

    checkOut: async (id: string) => {
        const response = await apiClient.put<ApiResponse<Attendance>>(`/attendance/${id}/check-out`);
        return response.data.data;
    },

    markAttendance: async (data: { studentId: string; scheduleId: string; status: string; notes?: string }) => {
        const response = await apiClient.post<ApiResponse<Attendance>>('/attendance/mark', data);
        return response.data.data;
    },

    getStats: async (studentId: string) => {
        const response = await apiClient.get<ApiResponse<AttendanceStats>>(`/attendance/stats/${studentId}`);
        return response.data.data;
    },

    exportData: async (filters?: AttendanceFilters) => {
        const response = await apiClient.post('/attendance/export', filters, { responseType: 'blob' });
        return response.data;
    },

    scanQRCode: async (qrData: string) => {
        const response = await apiClient.post<ApiResponse<Attendance>>('/attendance/qr-scan', { qrData });
        return response.data.data;
    },
};
