import { apiClient } from '@/services/api/client';

export interface Certification {
    studentId: string;
    tenantId: string;
    certificationId?: string;
    name: string;
    level: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
    category: string;
    skillsRequired: string[];
    issuedDate?: Date;
    expiryDate?: Date;
    issuedBy: string;
    verificationCode?: string;
    badgeUrl?: string;
    certificateUrl?: string;
    status?: 'active' | 'expired' | 'revoked';
    metadata?: Record<string, any>;
}

class CertificationsService {
    async issueCertification(data: Certification) {
        const response = await apiClient.post(`/certifications`, data);
        return response;
    }

    async getCertification(certificationId: string) {
        const response = await apiClient.get(`/certifications/${certificationId}`);
        return response;
    }

    async verifyCertification(verificationCode: string) {
        const response = await apiClient.get(`/certifications/verify/${verificationCode}`);
        return response;
    }

    async listCertifications(studentId: string) {
        const response = await apiClient.get(`/certifications/student/${studentId}`);
        return response;
    }

    async revokeCertification(certificationId: string) {
        const response = await apiClient.put(`/certifications/${certificationId}/revoke`);
        return response;
    }

    async renewCertification(certificationId: string) {
        const response = await apiClient.put(`/certifications/${certificationId}/renew`);
        return response;
    }

    async downloadCertificate(certificationId: string) {
        const response = await apiClient.get(`/certifications/${certificationId}/download`, {
            responseType: 'blob',
        });
        return response;
    }

    async getBadge(certificationId: string) {
        const response = await apiClient.get(`/certifications/${certificationId}/badge`);
        return response;
    }
}

export default new CertificationsService();
