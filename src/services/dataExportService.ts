import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
        const response = await axios.post(`${API_URL}/data-export`, data);
        return response.data;
    }

    async getExport(exportId: string) {
        const response = await axios.get(`${API_URL}/data-export/${exportId}`);
        return response.data;
    }

    async listExports(filters: {
        tenantId: string;
        requestedBy?: string;
        status?: string;
    }) {
        const response = await axios.get(`${API_URL}/data-export`, {
            params: filters,
        });
        return response.data;
    }

    async downloadExport(exportId: string) {
        const response = await axios.get(`${API_URL}/data-export/${exportId}/download`, {
            responseType: 'blob',
        });
        return response.data;
    }

    async cancelExport(exportId: string) {
        const response = await axios.post(`${API_URL}/data-export/${exportId}/cancel`);
        return response.data;
    }

    async getExportProgress(exportId: string) {
        const response = await axios.get(`${API_URL}/data-export/${exportId}/progress`);
        return response.data;
    }
}

export default new DataExportService();
