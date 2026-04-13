import { apiClient } from '../lib/api'

export interface EmergencyContact {
    id: string
    studentName: string
    parentName: string
    contactName: string
    relationship: string
    primaryPhone: string
    alternatePhone?: string
    email: string
    address: string
    isAuthorizedPickup: boolean
    medicalInfo?: string
    lastUpdated: string
    status: 'VERIFIED' | 'PENDING' | 'EXPIRED'
}

export interface EmergencyContactStats {
    totalContacts: number
    verified: number
    pending: number
    expired: number
}

class EmergencyContactService {
    async getEmergencyContacts(locationId?: string): Promise<EmergencyContact[]> {
        try {
            const endpoint = locationId ? `/emergency-contacts/location/${locationId}` : '/emergency-contacts'
            const response = await apiClient.get(endpoint)
            return response.data || response.data
        } catch (error) {
            console.error('Error fetching emergency contacts:', error)
            // Return mock data for development
            return [
                {
                    id: '1',
                    studentName: 'Emma Johnson',
                    parentName: 'Sarah Johnson',
                    contactName: 'Michael Johnson',
                    relationship: 'Father',
                    primaryPhone: '+852 9876 5432',
                    alternatePhone: '+852 2345 6789',
                    email: 'michael.johnson@email.com',
                    address: '123 Happy Valley Road, Hong Kong',
                    isAuthorizedPickup: true,
                    medicalInfo: 'No known allergies',
                    lastUpdated: '2024-03-10',
                    status: 'VERIFIED'
                }
            ]
        }
    }

    async getEmergencyContactStats(locationId?: string): Promise<EmergencyContactStats> {
        try {
            const response = await apiClient.get('/emergency-contacts/stats', {
                params: { locationId }
            })
            return response.data
        } catch (error) {
            console.error('Error fetching emergency contact stats:', error)
            return {
                totalContacts: 4,
                verified: 2,
                pending: 1,
                expired: 1
            }
        }
    }

    async verifyContact(contactId: string): Promise<void> {
        try {
            await apiClient.put(`/emergency-contacts/${contactId}/verify`)
        } catch (error) {
            console.error('Error verifying contact:', error)
            throw error
        }
    }

    async deleteContact(contactId: string): Promise<void> {
        try {
            await apiClient.delete(`/emergency-contacts/${contactId}`)
        } catch (error) {
            console.error('Error deleting contact:', error)
            throw error
        }
    }

    async addEmergencyContact(contact: Partial<EmergencyContact>): Promise<EmergencyContact> {
        try {
            const response = await apiClient.post('/emergency-contacts', contact)
            return response.data
        } catch (error) {
            console.error('Error adding emergency contact:', error)
            throw error
        }
    }

    async updateEmergencyContact(contactId: string, updates: Partial<EmergencyContact>): Promise<EmergencyContact> {
        try {
            const response = await apiClient.put(`/emergency-contacts/${contactId}`, updates)
            return response.data
        } catch (error) {
            console.error('Error updating emergency contact:', error)
            throw error
        }
    }

    async callEmergencyContact(contactId: string): Promise<void> {
        try {
            // This would integrate with a calling service
            await apiClient.post(`/emergency-contacts/${contactId}/call`)
        } catch (error) {
            console.error('Error calling emergency contact:', error)
            throw error
        }
    }
}

export const emergencyContactService = new EmergencyContactService()