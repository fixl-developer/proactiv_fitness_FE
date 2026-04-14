import { apiClient } from '@/services/api/client';

export interface Inquiry {
    _id: string;
    type: 'general' | 'trial' | 'assessment' | 'party' | 'program' | 'complaint' | 'feedback';
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    source: 'website' | 'phone' | 'email' | 'walk-in' | 'social-media';
    status: 'new' | 'contacted' | 'qualified' | 'converted' | 'closed' | 'spam';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    assignedTo?: string;
    locationId?: string;
    programInterest?: string;
    childAge?: number;
    preferredDate?: Date;
    notes?: string;
    followUpDate?: Date;
    convertedToBooking?: boolean;
    createdAt: Date;
}

class InquiriesService {
    async createInquiry(data: Partial<Inquiry>): Promise<Inquiry> {
        const response = await apiClient.post(`/inquiries`, data);
        return response;
    }

    async getInquiries(filters?: any): Promise<Inquiry[]> {
        const response = await apiClient.get(`/inquiries`, { params: filters });
        return response;
    }

    async getInquiryById(id: string): Promise<Inquiry> {
        const response = await apiClient.get(`/inquiries/${id}`);
        return response;
    }

    async updateInquiry(id: string, data: Partial<Inquiry>): Promise<Inquiry> {
        const response = await apiClient.put(`/inquiries/${id}`, data);
        return response;
    }

    async deleteInquiry(id: string): Promise<void> {
        await apiClient.delete(`/inquiries/${id}`);
    }

    async assignInquiry(id: string, userId: string): Promise<Inquiry> {
        const response = await apiClient.post(`/inquiries/${id}/assign`, { userId });
        return response;
    }

    async updateStatus(id: string, status: string): Promise<Inquiry> {
        const response = await apiClient.put(`/inquiries/${id}/status`, { status });
        return response;
    }

    async markAsConverted(id: string): Promise<Inquiry> {
        const response = await apiClient.post(`/inquiries/${id}/convert`);
        return response;
    }

    async addNote(id: string, note: string): Promise<Inquiry> {
        const response = await apiClient.post(`/inquiries/${id}/notes`, { note });
        return response;
    }

    async getStats(): Promise<any> {
        const response = await apiClient.get(`/inquiries/stats`);
        return response;
    }
}

export default new InquiriesService();
