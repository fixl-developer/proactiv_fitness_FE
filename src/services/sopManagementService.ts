import { apiClient } from '@/services/api/client';

export interface SOP {
  _id: string;
  title: string;
  category: string;
  content: string;
  version: string;
  status: 'draft' | 'review' | 'approved' | 'archived';
  author: string;
  approver?: string;
  tags: string[];
  attachments?: string[];
  effectiveDate?: Date;
  reviewDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SOPVersion {
  _id: string;
  sopId: string;
  version: string;
  content: string;
  changes: string;
  createdBy: string;
  createdAt: Date;
}

export interface TrainingMaterial {
  _id: string;
  title: string;
  type: 'video' | 'document' | 'quiz' | 'presentation';
  category: string;
  url: string;
  duration?: number;
  description: string;
  tags: string[];
  views: number;
  createdAt: Date;
}

export interface StaffAcknowledgment {
  _id: string;
  sopId: string;
  staffId: string;
  staffName: string;
  acknowledgedAt: Date;
  signature?: string;
}

class SOPManagementService {
  async getSOPs(filters?: any): Promise<SOP[]> {
    const response = await apiClient.get(`/sop/documents`, { params: filters });
    return response;
  }

  async getSOPById(id: string): Promise<SOP> {
    const response = await apiClient.get(`/sop/documents/${id}`);
    return response;
  }

  async createSOP(data: Partial<SOP>): Promise<SOP> {
    const response = await apiClient.post(`/sop/documents`, data);
    return response;
  }

  async updateSOP(id: string, data: Partial<SOP>): Promise<SOP> {
    const response = await apiClient.put(`/sop/documents/${id}`, data);
    return response;
  }

  async deleteSOP(id: string): Promise<void> {
    await apiClient.delete(`/sop/documents/${id}`);
  }

  async approveSOP(id: string): Promise<SOP> {
    const response = await apiClient.post(`/sop/documents/${id}/approve`);
    return response;
  }

  async getVersions(sopId: string): Promise<SOPVersion[]> {
    const response = await apiClient.get(`/sop/documents/${sopId}/versions`);
    return response;
  }

  async searchSOPs(query: string): Promise<SOP[]> {
    const response = await apiClient.get(`/sop/search`, { params: { query } });
    return response;
  }

  async getTrainingMaterials(filters?: any): Promise<TrainingMaterial[]> {
    const response = await apiClient.get(`/sop/training`, { params: filters });
    return response;
  }

  async createTrainingMaterial(data: Partial<TrainingMaterial>): Promise<TrainingMaterial> {
    const response = await apiClient.post(`/sop/training`, data);
    return response;
  }

  async trackView(id: string, type: 'sop' | 'training'): Promise<void> {
    await apiClient.post(`/sop/${type}/${id}/view`);
  }

  async acknowledgeSOPAsync(sopId: string, signature?: string): Promise<StaffAcknowledgment> {
    const response = await apiClient.post(`/sop/documents/${sopId}/acknowledge`, {
      signature
    });
    return response;
  }

  async getAcknowledgments(sopId: string): Promise<StaffAcknowledgment[]> {
    const response = await apiClient.get(`/sop/documents/${sopId}/acknowledgments`);
    return response;
  }
}

export default new SOPManagementService();
