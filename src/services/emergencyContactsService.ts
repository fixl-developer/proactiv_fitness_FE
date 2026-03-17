import { apiClient } from '../lib/apiClient';

export interface EmergencyContact {
    id: string;
    studentName: string;
    parentName: string;
    contactName: string;
    relationship: string;
    primaryPhone: string;
    alternatePhone?: string;
    email: string;
    address: string;
    isAuthorizedPickup: boolean;
    medicalInfo?: string;
    lastUpdated: string;
    status: 'PENDING' | 'VERIFIED' | 'EXPIRED' | 'INACTIVE';
}

export interface CreateEmergencyContactRequest {
    studentId: string;
    contactName: string;
    relationship: string;
    primaryPhone: string;
    alternatePhone?: string;
    email: string;
    address: string;
    isAuthorizedPickup?: boolean;
    medicalInfo?: string;
    notes?: string;
}

export interface UpdateEmergencyContactRequest {
    contactName?: string;
    relationship?: string;
    primaryPhone?: string;
    alternatePhone?: string;
    email?: string;
    address?: string;
    isAuthorizedPickup?: boolean;
    medicalInfo?: string;
    notes?: string;
}

export const emergencyContactsService = {
    // Get emergency contacts for a location
    async getLocationEmergencyContacts(locationId: string, filters?: any): Promise<EmergencyContact[]> {
        try {
            const response = await apiClient.get(`/emergency-contacts/location/${locationId}`, { params: filters });
            return response.data.data;
        } catch (error) {
            console.error('Error fetching emergency contacts:', error);
            throw error;
        }
    },

    // Get emergency contacts for a student
    async getStudentEmergencyContacts(studentId: string): Promise<EmergencyContact[]> {
        try {
            const response = await apiClient.get(`/emergency-contacts/student/${studentId}`);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching student emergency contacts:', error);
            throw error;
        }
    },

    // Create emergency contact
    async createEmergencyContact(data: CreateEmergencyContactRequest): Promise<EmergencyContact> {
        try {
            const response = await apiClient.post('/emergency-contacts', data);
            return response.data.data;
        } catch (error) {
            console.error('Error creating emergency contact:', error);
            throw error;
        }
    },

    // Update emergency contact
    async updateEmergencyContact(contactId: string, data: UpdateEmergencyContactRequest): Promise<EmergencyContact> {
        try {
            const response = await apiClient.put(`/emergency-contacts/${contactId}`, data);
            return response.data.data;
        } catch (error) {
            console.error('Error updating emergency contact:', error);
            throw error;
        }
    },

    // Verify emergency contact
    async verifyContact(contactId: string): Promise<EmergencyContact> {
        try {
            const response = await apiClient.put(`/emergency-contacts/${contactId}/verify`);
            return response.data.data;
        } catch (error) {
            console.error('Error verifying contact:', error);
            throw error;
        }
    },

    // Delete emergency contact
    async deleteEmergencyContact(contactId: string): Promise<void> {
        try {
            await apiClient.delete(`/emergency-contacts/${contactId}`);
        } catch (error) {
            console.error('Error deleting emergency contact:', error);
            throw error;
        }
    }
};