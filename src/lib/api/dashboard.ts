import { apiClient } from './client';
import type {
    DashboardMetrics,
    RevenueData,
    AttendanceData,
    StudentGrowthData,
    ProgramPopularity,
    LocationPerformance,
    StaffPerformance,
    RecentActivity,
    Notification,
    DashboardFilters,
    ApiResponse
} from '@/types';

// Dashboard API endpoints
export const dashboardApi = {
    // Get dashboard metrics
    getMetrics: async (filters?: DashboardFilters): Promise<DashboardMetrics> => {
        const response = await apiClient.get<ApiResponse<DashboardMetrics>>(
            '/dashboard/metrics',
            { params: filters }
        );
        return response.data.data;
    },

    // Get revenue data
    getRevenueData: async (filters?: DashboardFilters): Promise<RevenueData[]> => {
        const response = await apiClient.get<ApiResponse<RevenueData[]>>(
            '/dashboard/revenue',
            { params: filters }
        );
        return response.data.data;
    },

    // Get attendance data
    getAttendanceData: async (filters?: DashboardFilters): Promise<AttendanceData[]> => {
        const response = await apiClient.get<ApiResponse<AttendanceData[]>>(
            '/dashboard/attendance',
            { params: filters }
        );
        return response.data.data;
    },

    // Get student growth data
    getStudentGrowth: async (filters?: DashboardFilters): Promise<StudentGrowthData[]> => {
        const response = await apiClient.get<ApiResponse<StudentGrowthData[]>>(
            '/dashboard/student-growth',
            { params: filters }
        );
        return response.data.data;
    },

    // Get program popularity
    getProgramPopularity: async (filters?: DashboardFilters): Promise<ProgramPopularity[]> => {
        const response = await apiClient.get<ApiResponse<ProgramPopularity[]>>(
            '/dashboard/program-popularity',
            { params: filters }
        );
        return response.data.data;
    },

    // Get location performance
    getLocationPerformance: async (filters?: DashboardFilters): Promise<LocationPerformance[]> => {
        const response = await apiClient.get<ApiResponse<LocationPerformance[]>>(
            '/dashboard/location-performance',
            { params: filters }
        );
        return response.data.data;
    },

    // Get staff performance
    getStaffPerformance: async (filters?: DashboardFilters): Promise<StaffPerformance[]> => {
        const response = await apiClient.get<ApiResponse<StaffPerformance[]>>(
            '/dashboard/staff-performance',
            { params: filters }
        );
        return response.data.data;
    },

    // Get recent activities
    getRecentActivities: async (limit: number = 10): Promise<RecentActivity[]> => {
        const response = await apiClient.get<ApiResponse<RecentActivity[]>>(
            '/dashboard/activities',
            { params: { limit } }
        );
        return response.data.data;
    },

    // Get notifications
    getNotifications: async (unreadOnly: boolean = false): Promise<Notification[]> => {
        const response = await apiClient.get<ApiResponse<Notification[]>>(
            '/dashboard/notifications',
            { params: { unreadOnly } }
        );
        return response.data.data;
    },

    // Mark notification as read
    markNotificationRead: async (notificationId: string): Promise<void> => {
        await apiClient.put(`/dashboard/notifications/${notificationId}/read`);
    },

    // Mark all notifications as read
    markAllNotificationsRead: async (): Promise<void> => {
        await apiClient.put('/dashboard/notifications/read-all');
    },

    // Export dashboard report
    exportReport: async (format: 'pdf' | 'excel' | 'csv', filters?: DashboardFilters): Promise<Blob> => {
        const response = await apiClient.post(
            '/dashboard/export',
            { format, filters },
            { responseType: 'blob' }
        );
        return response.data;
    },
};
