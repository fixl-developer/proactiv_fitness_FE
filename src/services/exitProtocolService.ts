import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
        const response = await axios.post(`${API_URL}/exit-protocol`, data);
        return response.data;
    }

    async getExitRequest(requestId: string) {
        const response = await axios.get(`${API_URL}/exit-protocol/${requestId}`);
        return response.data;
    }

    async approveRequest(requestId: string, notes?: string) {
        const response = await axios.post(`${API_URL}/exit-protocol/${requestId}/approve`, {
            notes,
        });
        return response.data;
    }

    async rejectRequest(requestId: string, reason: string) {
        const response = await axios.post(`${API_URL}/exit-protocol/${requestId}/reject`, {
            reason,
        });
        return response.data;
    }

    async executeDeletion(requestId: string) {
        const response = await axios.post(`${API_URL}/exit-protocol/${requestId}/execute`);
        return response.data;
    }

    async getDeletionProgress(requestId: string) {
        const response = await axios.get(`${API_URL}/exit-protocol/${requestId}/progress`);
        return response.data;
    }

    async downloadCertificate(requestId: string) {
        const response = await axios.get(`${API_URL}/exit-protocol/${requestId}/certificate`, {
            responseType: 'blob',
        });
        return response.data;
    }

    async verifyCertificate(verificationCode: string) {
        const response = await axios.get(`${API_URL}/exit-protocol/verify/${verificationCode}`);
        return response.data;
    }
}

export default new ExitProtocolService();
