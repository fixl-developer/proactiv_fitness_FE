import axios from 'axios';
import type {
    DataExportRequest,
    DataDeletionRequest,
    RetentionPolicy,
    DataInventory,
    AnonymizationLog,
} from '@/types/dataManagement';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Data Export
export const createExportRequest = async (
    data: Omit<DataExportRequest, 'id' | 'status' | 'requestedAt'>
): Promise<DataExportRequest> => {
    const response = await axios.post(`${API_URL}/data-export/requests`, data);
    return response.data;
};

export const getExportRequests = async (): Promise<DataExportRequest[]> => {
    const response = await axios.get(`${API_URL}/data-export/requests`);
    return response.data;
};

export const getExportRequest = async (requestId: string): Promise<DataExportRequest> => {
    const response = await axios.get(`${API_URL}/data-export/requests/${requestId}`);
    return response.data;
};

export const downloadExport = async (requestId: string): Promise<Blob> => {
    const response = await axios.get(`${API_URL}/data-export/requests/${requestId}/download`, {
        responseType: 'blob',
    });
    return response.data;
};

// Data Deletion
export const createDeletionRequest = async (
    data: Omit<DataDeletionRequest, 'id' | 'status' | 'requestedAt'>
): Promise<DataDeletionRequest> => {
    const response = await axios.post(`${API_URL}/data-deletion/requests`, data);
    return response.data;
};

export const getDeletionRequests = async (): Promise<DataDeletionRequest[]> => {
    const response = await axios.get(`${API_URL}/data-deletion/requests`);
    return response.data;
};

export const getDeletionRequest = async (requestId: string): Promise<DataDeletionRequest> => {
    const response = await axios.get(`${API_URL}/data-deletion/requests/${requestId}`);
    return response.data;
};

export const downloadDeletionCertificate = async (requestId: string): Promise<Blob> => {
    const response = await axios.get(
        `${API_URL}/data-deletion/requests/${requestId}/certificate`,
        {
            responseType: 'blob',
        }
    );
    return response.data;
};

// Retention Policies
export const getRetentionPolicies = async (): Promise<RetentionPolicy[]> => {
    const response = await axios.get(`${API_URL}/data-retention/policies`);
    return response.data;
};

export const updateRetentionPolicy = async (
    policyId: string,
    data: Partial<RetentionPolicy>
): Promise<RetentionPolicy> => {
    const response = await axios.put(`${API_URL}/data-retention/policies/${policyId}`, data);
    return response.data;
};

// Data Inventory
export const getDataInventory = async (): Promise<DataInventory[]> => {
    const response = await axios.get(`${API_URL}/data-inventory`);
    return response.data;
};

// Anonymization Logs
export const getAnonymizationLogs = async (): Promise<AnonymizationLog[]> => {
    const response = await axios.get(`${API_URL}/data-anonymization/logs`);
    return response.data;
};
