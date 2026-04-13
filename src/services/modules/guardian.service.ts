import { apiClient } from '../api/client';

export interface GuardianLink {
    id: string;
    studentId: string | { id: string; firstName: string; lastName: string; email: string; phone?: string; profileImage?: string; currentProgram?: string; level?: string };
    guardianId?: string | { id: string; firstName: string; lastName: string; email: string; phone?: string; profileImage?: string; role?: string };
    relationship: GuardianRelationship;
    isPrimary: boolean;
    isEmergencyContact: boolean;
    status: GuardianLinkStatus;
    guardianName: string;
    guardianEmail?: string;
    guardianPhone?: string;
    guardianAddress?: string;
    invitationSentAt?: string;
    invitationExpiresAt?: string;
    linkedAt?: string;
    rejectedAt?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export type GuardianRelationship = 'parent' | 'mother' | 'father' | 'guardian' | 'sibling' | 'grandparent' | 'uncle_aunt' | 'other';
export type GuardianLinkStatus = 'pending' | 'linked' | 'rejected' | 'removed';

export interface AddGuardianData {
    guardianId?: string;
    relationship: GuardianRelationship;
    isPrimary?: boolean;
    isEmergencyContact?: boolean;
    guardianName: string;
    guardianEmail?: string;
    guardianPhone?: string;
    guardianAddress?: string;
    notes?: string;
}

export interface UpdateGuardianData {
    relationship?: GuardianRelationship;
    isPrimary?: boolean;
    isEmergencyContact?: boolean;
    guardianName?: string;
    guardianEmail?: string;
    guardianPhone?: string;
    guardianAddress?: string;
    notes?: string;
}

export interface SearchedUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    profileImage?: string;
    role?: string;
}

class GuardianService {
    private baseUrl = '/user/guardians';

    /**
     * Get all guardians linked to the current user
     */
    async getMyGuardians(): Promise<GuardianLink[]> {
        try {
            const response = await apiClient.get<any>(this.baseUrl);
            return response.data || [];
        } catch {
            return [];
        }
    }

    /**
     * Get a single guardian link by ID
     */
    async getGuardianLink(id: string): Promise<GuardianLink | null> {
        try {
            const response = await apiClient.get<any>(`${this.baseUrl}/${id}`);
            return response.data || null;
        } catch {
            return null;
        }
    }

    /**
     * Add a new guardian
     */
    async addGuardian(data: AddGuardianData): Promise<{ success: boolean; data?: GuardianLink; message?: string }> {
        try {
            const response = await apiClient.post<any>(this.baseUrl, data);
            return { success: true, data: response.data, message: response.message };
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message || 'Failed to add guardian';
            return { success: false, message };
        }
    }

    /**
     * Update a guardian link
     */
    async updateGuardian(id: string, data: UpdateGuardianData): Promise<{ success: boolean; data?: GuardianLink; message?: string }> {
        try {
            const response = await apiClient.put<any>(`${this.baseUrl}/${id}`, data);
            return { success: true, data: response.data, message: response.message };
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message || 'Failed to update guardian';
            return { success: false, message };
        }
    }

    /**
     * Remove a guardian link
     */
    async removeGuardian(id: string): Promise<{ success: boolean; message?: string }> {
        try {
            const response = await apiClient.delete<any>(`${this.baseUrl}/${id}`);
            return { success: true, message: response.message };
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message || 'Failed to remove guardian';
            return { success: false, message };
        }
    }

    /**
     * Accept a guardian link invitation (as guardian)
     */
    async acceptInvitation(linkId: string): Promise<{ success: boolean; data?: GuardianLink; message?: string }> {
        try {
            const response = await apiClient.post<any>(`${this.baseUrl}/${linkId}/accept`);
            return { success: true, data: response.data, message: response.message };
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message || 'Failed to accept invitation';
            return { success: false, message };
        }
    }

    /**
     * Reject a guardian link invitation (as guardian)
     */
    async rejectInvitation(linkId: string): Promise<{ success: boolean; message?: string }> {
        try {
            const response = await apiClient.post<any>(`${this.baseUrl}/${linkId}/reject`);
            return { success: true, message: response.message };
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message || 'Failed to reject invitation';
            return { success: false, message };
        }
    }

    /**
     * Accept invitation via token
     */
    async acceptByToken(token: string): Promise<{ success: boolean; data?: GuardianLink; message?: string }> {
        try {
            const response = await apiClient.post<any>(`${this.baseUrl}/accept-by-token`, { token });
            return { success: true, data: response.data, message: response.message };
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message || 'Failed to accept invitation';
            return { success: false, message };
        }
    }

    /**
     * Resend invitation to a guardian
     */
    async resendInvitation(linkId: string): Promise<{ success: boolean; message?: string }> {
        try {
            const response = await apiClient.post<any>(`${this.baseUrl}/${linkId}/resend`);
            return { success: true, message: response.message };
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message || 'Failed to resend invitation';
            return { success: false, message };
        }
    }

    /**
     * Get pending invitations for me (as a guardian)
     */
    async getPendingInvitations(): Promise<GuardianLink[]> {
        try {
            const response = await apiClient.get<any>(`${this.baseUrl}/invitations/pending`);
            return response.data || [];
        } catch {
            return [];
        }
    }

    /**
     * Get students linked to me (as guardian)
     */
    async getMyStudents(): Promise<GuardianLink[]> {
        try {
            const response = await apiClient.get<any>(`${this.baseUrl}/students`);
            return response.data || [];
        } catch {
            return [];
        }
    }

    /**
     * Search registered users to add as guardian
     */
    async searchUsers(query: string): Promise<SearchedUser[]> {
        try {
            if (!query || query.length < 2) return [];
            const response = await apiClient.get<any>(`${this.baseUrl}/search?q=${encodeURIComponent(query)}`);
            return response.data || [];
        } catch {
            return [];
        }
    }
}

const guardianService = new GuardianService();
export default guardianService;
