import { apiClient } from '@/services/api/client'

export const attendanceService = {
    async checkIn() {
        try {
            const response = await apiClient.post('/attendance/check-in', {})
            return response
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Check-in failed'
            }
        }
    },

    async checkOut() {
        try {
            const response = await apiClient.post('/attendance/check-out', {})
            return response
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Check-out failed'
            }
        }
    },

    async getHistory(limit = 20) {
        try {
            const response = await apiClient.get(`/attendance/history?limit=${limit}`)
            return response
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to fetch history',
                data: []
            }
        }
    },

    async getStats() {
        try {
            const response = await apiClient.get('/attendance/stats')
            return response
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to fetch stats',
                data: {
                    totalDays: 0,
                    presentDays: 0,
                    absentDays: 0,
                    lateDays: 0,
                    attendancePercentage: 0
                }
            }
        }
    },

    async getCalendar(month: string, year: string) {
        try {
            const response = await apiClient.get(`/attendance/calendar/${month}/${year}`)
            return response
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to fetch calendar',
                data: []
            }
        }
    },

    async getReport(month: string, year: string) {
        try {
            const response = await apiClient.get(`/attendance/report/${month}/${year}`)
            return response
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to fetch report',
                data: null
            }
        }
    }
}
