import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
        const response = await axios.post(`${API_URL}/certifications`, data);
        return response.data;
    }

    async getCertification(certificationId: string) {
        const response = await axios.get(`${API_URL}/certifications/${certificationId}`);
        return response.data;
    }

    async verifyCertification(verificationCode: string) {
        const response = await axios.get(`${API_URL}/certifications/verify/${verificationCode}`);
        return response.data;
    }

    async listCertifications(studentId: string) {
        const response = await axios.get(`${API_URL}/certifications/student/${studentId}`);
        return response.data;
    }

    async revokeCertification(certificationId: string) {
        const response = await axios.put(`${API_URL}/certifications/${certificationId}/revoke`);
        return response.data;
    }

    async renewCertification(certificationId: string) {
        const response = await axios.put(`${API_URL}/certifications/${certificationId}/renew`);
        return response.data;
    }

    async downloadCertificate(certificationId: string) {
        const response = await axios.get(`${API_URL}/certifications/${certificationId}/download`, {
            responseType: 'blob',
        });
        return response.data;
    }

    async getBadge(certificationId: string) {
        const response = await axios.get(`${API_URL}/certifications/${certificationId}/badge`);
        return response.data;
    }
}

export default new CertificationsService();
