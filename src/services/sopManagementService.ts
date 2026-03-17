import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
    const response = await axios.get(`${API_URL}/sop/documents`, { params: filters });
    return response.data;
  }

  async getSOPById(id: string): Promise<SOP> {
    const response = await axios.get(`${API_URL}/sop/documents/${id}`);
    return response.data;
  }

  async createSOP(data: Partial<SOP>): Promise<SOP> {
    const response = await axios.post(`${API_URL}/sop/documents`, data);
    return response.data;
  }

  async updateSOP(id: string, data: Partial<SOP>): Promise<SOP> {
    const response = await axios.put(`${API_URL}/sop/documents/${id}`, data);
    return response.data;
  }

  async deleteSOP(id: string): Promise<void> {
    await axios.delete(`${API_URL}/sop/documents/${id}`);
  }

  async approveSOP(id: string): Promise<SOP> {
    const response = await axios.post(`${API_URL}/sop/documents/${id}/approve`);
    return response.data;
  }

  async getVersions(sopId: string): Promise<SOPVersion[]> {
    const response = await axios.get(`${API_URL}/sop/documents/${sopId}/versions`);
    return response.data;
  }

  async searchSOPs(query: string): Promise<SOP[]> {
    const response = await axios.get(`${API_URL}/sop/search`, { params: { query } });
    return response.data;
  }

  async getTrainingMaterials(filters?: any): Promise<TrainingMaterial[]> {
    const response = await axios.get(`${API_URL}/sop/training`, { params: filters });
    return response.data;
  }

  async createTrainingMaterial(data: Partial<TrainingMaterial>): Promise<TrainingMaterial> {
    const response = await axios.post(`${API_URL}/sop/training`, data);
    return response.data;
  }

  async trackView(id: string, type: 'sop' | 'training'): Promise<void> {
    await axios.post(`${API_URL}/sop/${type}/${id}/view`);
  }

  async acknowledgeSOPAsync(sopId: string, signature?: string): Promise<StaffAcknowledgment> {
    const response = await axios.post(`${API_URL}/sop/documents/${sopId}/acknowledge`, {
      signature
    });
    return response.data;
  }

  async getAcknowledgments(sopId: string): Promise<StaffAcknowledgment[]> {
    const response = await axios.get(`${API_URL}/sop/documents/${sopId}/acknowledgments`);
    return response.data;
  }
}

export default new SOPManagementService();
