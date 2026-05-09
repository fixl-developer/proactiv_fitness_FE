import { apiClient } from '@/services/api/client'

interface FeedbackData {
    type: 'bug' | 'feature' | 'improvement' | 'other'
    title: string
    description: string
    rating: number
}

// apiClient methods already return the response BODY ({ success, data, message }) — not the
// axios envelope. The previous version of this file did `response.data?.data` which is a
// double-unwrap that returned `undefined` for every endpoint, so the feedback list was
// always empty after a successful submit (BUG_024).
const normalizeFeedback = (raw: any) => {
    if (!raw || typeof raw !== 'object') return raw
    return {
        ...raw,
        id: raw.id || raw._id || raw.feedbackId || '',
    }
}

const feedbackService = {
    async getFeedback(): Promise<any[]> {
        try {
            const body: any = await apiClient.get('/feedback')
            const list = Array.isArray(body?.data) ? body.data : Array.isArray(body) ? body : []
            return list.map(normalizeFeedback)
        } catch (error) {
            console.error('Failed to fetch feedback:', error)
            return []
        }
    },

    async submitFeedback(feedback: FeedbackData): Promise<any> {
        try {
            const body: any = await apiClient.post('/feedback', feedback)
            return normalizeFeedback(body?.data || body || {})
        } catch (error) {
            console.error('Failed to submit feedback:', error)
            throw error
        }
    },

    async getFeedbackById(id: string): Promise<any> {
        try {
            const body: any = await apiClient.get(`/feedback/${id}`)
            return normalizeFeedback(body?.data || {})
        } catch (error) {
            console.error('Failed to fetch feedback:', error)
            return {}
        }
    },

    async updateFeedback(id: string, data: any): Promise<any> {
        try {
            const body: any = await apiClient.put(`/feedback/${id}`, data)
            return normalizeFeedback(body?.data || {})
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
            const body: any = await apiClient.get('/feedback/stats')
            return body?.data || {}
        } catch (error) {
            console.error('Failed to fetch feedback stats:', error)
            return {}
        }
    }
}

export default feedbackService
