import { apiClient } from '@/services/api/client';

export interface DataExport {
    exportId?: string;
    tenantId: string;
    requestedBy: string;
    exportType: 'parent' | 'franchise' | 'location' | 'custom';
    scope: {
        entityType: string;
        entityId: string;
    };
    dataCategories: string[];
    format: 'pdf' | 'csv' | 'json' | 'excel' | 'zip';
    status?: 'pending' | 'processing' | 'completed' | 'failed';
    progress?: number;
    fileUrl?: string;
    expiryDate?: Date;
}

class DataExportService {
    async requestExport(data: Omit<DataExport, 'exportId' | 'status' | 'progress'>) {
        const response = await apiClient.post(`/data-export`, data);
        return response;
    }

    async getExport(exportId: string) {
        const response = await apiClient.get(`/data-export/${exportId}`);
        return response;
    }

    async listExports(filters: {
        tenantId: string;
        requestedBy?: string;
        status?: string;
    }) {
        const response = await apiClient.get(`/data-export`, {
            params: filters,
        });
        return response;
    }

    async downloadExport(exportId: string) {
        const response = await apiClient.get(`/data-export/${exportId}/download`, {
            responseType: 'blob',
        });
        return response;
    }

    async cancelExport(exportId: string) {
        const response = await apiClient.post(`/data-export/${exportId}/cancel`);
        return response;
    }

    async getExportProgress(exportId: string) {
        const response = await apiClient.get(`/data-export/${exportId}/progress`);
        return response;
    }
}

export default new DataExportService();
