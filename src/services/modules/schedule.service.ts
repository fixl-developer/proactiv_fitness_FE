import { apiClient } from '@/services/api/client'

export const scheduleService = {
    async getSchedule() {
        try {
            const response = await apiClient.get('/schedule')
            return response
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to fetch schedule',
                data: []
            }
        }
    },

    async getCalendar(month: string, year: string) {
        try {
            const response = await apiClient.get(`/schedule/calendar/${month}/${year}`)
            return response
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to fetch calendar',
                data: []
            }
        }
    },

    async getUpcoming(limit = 10) {
        try {
            const response = await apiClient.get(`/schedule/upcoming?limit=${limit}`)
            return response
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to fetch upcoming',
                data: []
            }
        }
    },

    async addReminder(classId: string) {
        try {
            const response = await apiClient.post('/schedule/add-reminder', { classId })
            return response
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to add reminder'
            }
        }
    },

    async removeReminder(classId: string) {
        try {
            const response = await apiClient.delete(`/schedule/remove-reminder/${classId}`)
            return response
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to remove reminder'
            }
        }
    }
}
