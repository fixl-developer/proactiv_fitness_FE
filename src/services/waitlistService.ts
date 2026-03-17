import { apiClient } from '../lib/api'

export interface WaitlistEntry {
    id: string
    studentName: string
    parentName: string
    parentEmail: string
    parentPhone: string
    className: string
    classTime: string
    position: number
    joinedDate: string
    status: 'ACTIVE' | 'OFFERED' | 'EXPIRED' | 'ENROLLED'
    priority: 'HIGH' | 'MEDIUM' | 'LOW'
    notes?: string
}

export interface WaitlistStats {
    totalWaitlisted: number
    activeEntries: number
    spotsOffered: number
    expiredOffers: number
}

class WaitlistService {
    async getWaitlistEntries(locationId?: string): Promise<WaitlistEntry[]> {
        try {
            const endpoint = locationId ? `/waitlist/location/${locationId}` : '/waitlist'
            const response = await apiClient.get(endpoint)
            return response.data.data || response.data
        } catch (error) {
            console.error('Error fetching waitlist entries:', error)
            // Return mock data for development
            return [
                {
                    id: '1',
                    studentName: 'Emma Johnson',
                    parentName: 'Sarah Johnson',
                    parentEmail: 'sarah.johnson@email.com',
                    parentPhone: '+852 9876 5432',
                    className: 'Beginner Gymnastics',
                    classTime: 'Monday 4:00 PM',
                    position: 1,
                    joinedDate: '2024-03-10',
                    status: 'ACTIVE',
                    priority: 'HIGH',
                    notes: 'Flexible with timing'
                }
            ]
        }
    }

    async getWaitlistStats(locationId?: string): Promise<WaitlistStats> {
        try {
            const response = await apiClient.get('/waitlist/stats', {
                params: { locationId }
            })
            return response.data
        } catch (error) {
            console.error('Error fetching waitlist stats:', error)
            return {
                totalWaitlisted: 4,
                activeEntries: 2,
                spotsOffered: 1,
                expiredOffers: 1
            }
        }
    }

    async offerSpot(entryId: string): Promise<void> {
        try {
            await apiClient.post(`/waitlist/${entryId}/offer`)
        } catch (error) {
            console.error('Error offering spot:', error)
            throw error
        }
    }

    async removeFromWaitlist(entryId: string): Promise<void> {
        try {
            await apiClient.delete(`/waitlist/${entryId}`)
        } catch (error) {
            console.error('Error removing from waitlist:', error)
            throw error
        }
    }

    async addToWaitlist(entry: Partial<WaitlistEntry>): Promise<WaitlistEntry> {
        try {
            const response = await apiClient.post('/waitlist', entry)
            return response.data
        } catch (error) {
            console.error('Error adding to waitlist:', error)
            throw error
        }
    }

    async updateWaitlistEntry(entryId: string, updates: Partial<WaitlistEntry>): Promise<WaitlistEntry> {
        try {
            const response = await apiClient.put(`/waitlist/${entryId}`, updates)
            return response.data
        } catch (error) {
            console.error('Error updating waitlist entry:', error)
            throw error
        }
    }
}

export const waitlistService = new WaitlistService()