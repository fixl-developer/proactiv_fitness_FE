import { apiClient } from '@/services/api/client';

export interface ExitRequest {
    requestId?: string;
    tenantId: string;
    entityType: 'user' | 'franchise' | 'location';
    entityId: string;
    requestedBy: string;
    reason: string;
    status?: 'pending' | 'approved' | 'rejected' | 'in-progress' | 'completed';
    deletionPlan?: {
        dataCategories: string[];
        retentionExemptions: string[];
        estimatedRecords: number;
    };
    progress?: number;
    deletionCertificate?: {
        certificateId: string;
        issuedAt: Date;
        verificationCode: string;
    };
}

class ExitProtocolService {
    async createExitRequest(data: Omit<ExitRequest, 'requestId' | 'status'>) {
        const response = await apiClient.post(`/exit-protocol`, data);
        return response;
    }

    async getExitRequest(requestId: string) {
        const response = await apiClient.get(`/exit-protocol/${requestId}`);
        return response;
    }

    async approveRequest(requestId: string, notes?: string) {
        const response = await apiClient.post(`/exit-protocol/${requestId}/approve`, {
            notes,
        });
        return response;
    }

    async rejectRequest(requestId: string, reason: string) {
        const response = await apiClient.post(`/exit-protocol/${requestId}/reject`, {
            reason,
        });
        return response;
    }

    async executeDeletion(requestId: string) {
        const response = await apiClient.post(`/exit-protocol/${requestId}/execute`);
        return response;
    }

    async getDeletionProgress(requestId: string) {
        const response = await apiClient.get(`/exit-protocol/${requestId}/progress`);
        return response;
    }

    async downloadCertificate(requestId: string) {
        const response = await apiClient.get(`/exit-protocol/${requestId}/certificate`, {
            responseType: 'blob',
        });
        return response;
    }

    async verifyCertificate(verificationCode: string) {
        const response = await apiClient.get(`/exit-protocol/verify/${verificationCode}`);
        return response;
    }
}

export default new ExitProtocolService();
