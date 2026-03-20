import { apiClient } from '../api/client'
import ErrorHandler from '../api/errorHandler'

export interface AnalyticsData {
    id: string
    metric: string
    value: number
    timestamp: string
    category: string
    metadata?: any
}

export interface DashboardMetrics {
    totalStudents: number
    activeClasses: number
    totalRevenue: number
    attendanceRate: number
    enrollmentTrend: number
    revenueGrowth: number
    totalLocations: number
    staffMembers: number
    customerSatisfaction: number
    staffUtilization: number
}

export interface RevenueDataPoint {
    month: string
    revenue: number
    target: number
    bookingCount: number
}

export interface StudentDataPoint {
    month: string
    students: number
}

export interface ActivityItem {
    id: string
    type: string
    action: string
    title: string
    description: string
    time: string
    userId?: string
}

export interface AlertItem {
    id: string
    type: 'warning' | 'info' | 'success'
    title: string
    description: string
    priority: 'high' | 'medium' | 'low'
    createdAt: string
}

export interface ChartData {
    labels: string[]
    datasets: {
        label: string
        data: number[]
        backgroundColor?: string
        borderColor?: string
    }[]
}

export interface AnalyticsResponse {
    success: boolean
    data: AnalyticsData[]
}

export interface MetricsResponse {
    success: boolean
    data: DashboardMetrics
}

export interface ChartResponse {
    success: boolean
    data: ChartData
}

class AnalyticsService {
    private readonly MODULE_NAME = 'advanced-analytics'

    async getDashboardMetrics(timeRange: string = '30d'): Promise<MetricsResponse> {
        try {
            const response = await apiClient.get<MetricsResponse>('/analytics/dashboard', {
                params: { timeRange }
            })
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async getRevenueTrend(months: number = 6): Promise<{ success: boolean; data: RevenueDataPoint[] }> {
        try {
            const response = await apiClient.get<{ success: boolean; data: RevenueDataPoint[] }>(
                '/analytics/revenue-trend',
                { params: { months } }
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async getStudentGrowth(months: number = 6): Promise<{ success: boolean; data: StudentDataPoint[] }> {
        try {
            const response = await apiClient.get<{ success: boolean; data: StudentDataPoint[] }>(
                '/analytics/student-growth',
                { params: { months } }
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async getRecentActivities(limit: number = 10): Promise<{ success: boolean; data: ActivityItem[] }> {
        try {
            const response = await apiClient.get<{ success: boolean; data: ActivityItem[] }>(
                '/analytics/recent-activities',
                { params: { limit } }
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async getAlerts(): Promise<{ success: boolean; data: AlertItem[] }> {
        try {
            const response = await apiClient.get<{ success: boolean; data: AlertItem[] }>('/analytics/alerts')
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async getStudentAnalytics(startDate: string, endDate: string): Promise<ChartResponse> {
        try {
            const response = await apiClient.get<ChartResponse>(
                '/analytics/students',
                { params: { startDate, endDate } }
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async getRevenueAnalytics(startDate: string, endDate: string): Promise<ChartResponse> {
        try {
            const response = await apiClient.get<ChartResponse>(
                '/analytics/revenue',
                { params: { startDate, endDate } }
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async getAttendanceAnalytics(startDate: string, endDate: string): Promise<ChartResponse> {
        try {
            const response = await apiClient.get<ChartResponse>(
                '/analytics/attendance',
                { params: { startDate, endDate } }
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async getClassPerformance(): Promise<ChartResponse> {
        try {
            const response = await apiClient.get<ChartResponse>('/analytics/class-performance')
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async getCoachPerformance(): Promise<ChartResponse> {
        try {
            const response = await apiClient.get<ChartResponse>('/analytics/coach-performance')
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async getEnrollmentTrends(months: number = 12): Promise<ChartResponse> {
        try {
            const response = await apiClient.get<ChartResponse>(
                '/analytics/enrollment-trends',
                { params: { months } }
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async getTopPerformers(limit: number = 10): Promise<AnalyticsResponse> {
        try {
            const response = await apiClient.get<AnalyticsResponse>(
                '/analytics/top-performers',
                { params: { limit } }
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async getCustomMetric(metricName: string, filters?: any): Promise<AnalyticsResponse> {
        try {
            const response = await apiClient.get<AnalyticsResponse>(
                `/analytics/custom/${metricName}`,
                { params: filters }
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }

    async exportAnalytics(format: 'pdf' | 'excel' | 'csv', filters?: any): Promise<Blob> {
        try {
            const response = await apiClient.get<Blob>(
                `/analytics/export`,
                { params: { format, ...filters } }
            )
            return response
        } catch (error) {
            const appError = ErrorHandler.classifyError(error)
            ErrorHandler.logError(appError, this.MODULE_NAME)
            throw error
        }
    }
}

export const analyticsService = new AnalyticsService()
export default AnalyticsService
