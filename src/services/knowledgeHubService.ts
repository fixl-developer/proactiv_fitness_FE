import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface Document {
    documentId?: string;
    tenantId: string;
    title: string;
    type: 'sop' | 'policy' | 'procedure' | 'guideline' | 'template';
    category: string;
    content: string;
    format: 'markdown' | 'html' | 'pdf' | 'video' | 'external-link';
    version?: number;
    status?: 'draft' | 'pending-approval' | 'approved' | 'archived';
    tags?: string[];
    attachments?: string[];
    accessLevel?: 'public' | 'internal' | 'restricted';
    createdBy: string;
}

class KnowledgeHubService {
    async createDocument(data: Document) {
        const response = await axios.post(`${API_URL}/knowledge-hub/documents`, data);
        return response.data;
    }

    async getDocument(documentId: string) {
        const response = await axios.get(`${API_URL}/knowledge-hub/documents/${documentId}`);
        return response.data;
    }

    async searchDocuments(query: string, tenantId: string) {
        const response = await axios.get(`${API_URL}/knowledge-hub/search`, {
            params: { query, tenantId },
        });
        return response.data;
    }

    async listDocuments(filters: {
        tenantId: string;
        type?: string;
        category?: string;
        status?: string;
    }) {
        const response = await axios.get(`${API_URL}/knowledge-hub/documents`, {
            params: filters,
        });
        return response.data;
    }

    async updateDocument(documentId: string, updates: Partial<Document>) {
        const response = await axios.put(`${API_URL}/knowledge-hub/documents/${documentId}`, updates);
        return response.data;
    }

    async approveDocument(documentId: string) {
        const response = await axios.post(`${API_URL}/knowledge-hub/documents/${documentId}/approve`);
        return response.data;
    }

    async incrementViewCount(documentId: string) {
        const response = await axios.post(`${API_URL}/knowledge-hub/documents/${documentId}/view`);
        return response.data;
    }

    async downloadDocument(documentId: string) {
        const response = await axios.get(`${API_URL}/knowledge-hub/documents/${documentId}/download`, {
            responseType: 'blob',
        });
        return response.data;
    }
}

export default new KnowledgeHubService();
