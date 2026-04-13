import { apiClient } from '@/services/api/client';

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
        const response = await apiClient.post(`/knowledge-hub/documents`, data);
        return response;
    }

    async getDocument(documentId: string) {
        const response = await apiClient.get(`/knowledge-hub/documents/${documentId}`);
        return response;
    }

    async searchDocuments(query: string, tenantId: string) {
        const response = await apiClient.get(`/knowledge-hub/search`, {
            params: { query, tenantId },
        });
        return response;
    }

    async listDocuments(filters: {
        tenantId: string;
        type?: string;
        category?: string;
        status?: string;
    }) {
        const response = await apiClient.get(`/knowledge-hub/documents`, {
            params: filters,
        });
        return response;
    }

    async updateDocument(documentId: string, updates: Partial<Document>) {
        const response = await apiClient.put(`/knowledge-hub/documents/${documentId}`, updates);
        return response;
    }

    async approveDocument(documentId: string) {
        const response = await apiClient.post(`/knowledge-hub/documents/${documentId}/approve`);
        return response;
    }

    async incrementViewCount(documentId: string) {
        const response = await apiClient.post(`/knowledge-hub/documents/${documentId}/view`);
        return response;
    }

    async downloadDocument(documentId: string) {
        const response = await apiClient.get(`/knowledge-hub/documents/${documentId}/download`, {
            responseType: 'blob',
        });
        return response;
    }
}

export default new KnowledgeHubService();
