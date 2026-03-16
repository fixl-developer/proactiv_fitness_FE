import { apiClient } from '../api/client'

export interface WaitlistEntry {
    id: string
    childId: string
    classId: string
    className: string
    position: number
    totalWaiting: number
    dateAdded: string
    estimatedWaitTime: number
    status: 'waiting' | 'offered' | 'enrolled' | 'cancelled'
    notificationPreference: 'email' | 'sms' | 'both'
}

export interface WaitlistStats {
    totalWaitlisted: number
    activeWaitlists: number
    averageWaitTime: number
    spotsOfferedThisMonth: number
}

export class WaitlistService {
    /**
     * Get all waitlist entries for a parent
     */
    static async getWaitlist(parentId: string): Promise<WaitlistEntry[]> {
        try {
            const response = await apiClient.get(`/waitlist/parent/${parentId}`)
            return response.data || []
        } catch (error) {
            console.error('Error fetching waitlist:', error)
            throw error
        }
    }

    /**
     * Get waitlist entry by ID
     */
    static async getWaitlistEntry(entryId: string): Promise<WaitlistEntry> {
        try {
            const response = await apiClient.get(`/waitlist/${entryId}`)
            return response.data
        } catch (error) {
            console.error('Error fetching waitlist entry:', error)
            throw error
        }
    }

    /**
     * Add child to class waitlist
     */
    static async addToWaitlist(childId: string, classId: string, notificationPreference: 'email' | 'sms' | 'both' = 'email'): Promise<WaitlistEntry> {
        try {
            const response = await apiClient.post('/waitlist', {
                childId,
                classId,
                notificationPreference
            })
            return response.data
        } catch (error) {
            console.error('Error adding to waitlist:', error)
            throw error
        }
    }

    /**
     * Remove from waitlist
     */
    static async removeFromWaitlist(entryId: string): Promise<void> {
        try {
            await apiClient.delete(`/waitlist/${entryId}`)
        } catch (error) {
            console.error('Error removing from waitlist:', error)
            throw error
        }
    }

    /**
     * Update notification preference
     */
    static async updateNotificationPreference(entryId: string, preference: 'email' | 'sms' | 'both'): Promise<WaitlistEntry> {
        try {
            const response = await apiClient.patch(`/waitlist/${entryId}`, {
                notificationPreference: preference
            })
            return response.data
        } catch (error) {
            console.error('Error updating notification preference:', error)
            throw error
        }
    }

    /**
     * Get waitlist statistics
     */
    static async getWaitlistStats(parentId: string): Promise<WaitlistStats> {
        try {
            const response = await apiClient.get(`/waitlist/stats/${parentId}`)
            return response.data
        } catch (error) {
            console.error('Error fetching waitlist stats:', error)
            throw error
        }
    }

    /**
     * Get class waitlist position
     */
    static async getWaitlistPosition(entryId: string): Promise<{ position: number; totalWaiting: number; estimatedWaitTime: number }> {
        try {
            const response = await apiClient.get(`/waitlist/${entryId}/position`)
            return response.data
        } catch (error) {
            console.error('Error fetching waitlist position:', error)
            throw error
        }
    }

    /**
     * Accept offered spot
     */
    static async acceptOffer(entryId: string): Promise<WaitlistEntry> {
        try {
            const response = await apiClient.post(`/waitlist/${entryId}/accept`)
            return response.data
        } catch (error) {
            console.error('Error accepting offer:', error)
            throw error
        }
    }

    /**
     * Decline offered spot
     */
    static async declineOffer(entryId: string): Promise<WaitlistEntry> {
        try {
            const response = await apiClient.post(`/waitlist/${entryId}/decline`)
            return response.data
        } catch (error) {
            console.error('Error declining offer:', error)
            throw error
        }
    }

    /**
     * Get waitlist history
     */
    static async getWaitlistHistory(parentId: string, limit: number = 10): Promise<WaitlistEntry[]> {
        try {
            const response = await apiClient.get(`/waitlist/history/${parentId}?limit=${limit}`)
            return response.data || []
        } catch (error) {
            console.error('Error fetching waitlist history:', error)
            throw error
        }
    }
}
