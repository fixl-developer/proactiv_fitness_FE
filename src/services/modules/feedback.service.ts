import { apiClient } from '@/lib/api-client'

interface FeedbackData {
    type: 'bug' | 'feature' | 'improvement' | 'other'
    title: string
    description: string
    rating: number
}

const feedbackService = {
    async getFeedback(): Promise<any[]> {
        try {
            const response = await apiClient.get('/feedback')
            return response.data?.data || []
        } catch (error) {
            console.error('Failed to fetch feedback:', error)
            return []
        }
    },

    async submitFeedback(feedback: FeedbackData): Promise<any> {
        try {
            const response = await apiClient.post('/feedback', feedback)
            return response.data?.data || {}
        } catch (error) {
            console.error('Failed to submit feedback:', error)
            throw error
        }
    },

    async getFeedbackById(id: string): Promise<any> {
        try {
            const response = await apiClient.get(`/feedback/${id}`)
            return response.data?.data || {}
        } catch (error) {
            console.error('Failed to fetch feedback:', error)
            return {}
        }
    },

    async updateFeedback(id: string, data: any): Promise<any> {
        try {
            const response = await apiClient.put(`/feedback/${id}`, data)
            return response.data?.data || {}
        } catch (error) {
            console.error('Failed to update feedback:', error)
            throw error
        }
    },

    async deleteFeedback(id: string): Promise<void> {
        try {
            await apiClient.delete(`/feedback/${id}`)
        } catch (error) {
            console.error('Failed to delete feedback:', error)
            throw error
        }
    },

    async getFeedbackStats(): Promise<any> {
        try {
            const response = await apiClient.get('/feedback/stats')
            return response.data?.data || {}
        } catch (error) {
            console.error('Failed to fetch feedback stats:', error)
            return {}
        }
    }
}

export default feedbackService
