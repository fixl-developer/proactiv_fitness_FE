import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
        const response = await axios.post(`${API_URL}/inquiries`, data);
        return response.data;
    }

    async getInquiries(filters?: any): Promise<Inquiry[]> {
        const response = await axios.get(`${API_URL}/inquiries`, { params: filters });
        return response.data;
    }

    async getInquiryById(id: string): Promise<Inquiry> {
        const response = await axios.get(`${API_URL}/inquiries/${id}`);
        return response.data;
    }

    async updateInquiry(id: string, data: Partial<Inquiry>): Promise<Inquiry> {
        const response = await axios.put(`${API_URL}/inquiries/${id}`, data);
        return response.data;
    }

    async deleteInquiry(id: string): Promise<void> {
        await axios.delete(`${API_URL}/inquiries/${id}`);
    }

    async assignInquiry(id: string, userId: string): Promise<Inquiry> {
        const response = await axios.post(`${API_URL}/inquiries/${id}/assign`, { userId });
        return response.data;
    }

    async updateStatus(id: string, status: string): Promise<Inquiry> {
        const response = await axios.put(`${API_URL}/inquiries/${id}/status`, { status });
        return response.data;
    }

    async markAsConverted(id: string): Promise<Inquiry> {
        const response = await axios.post(`${API_URL}/inquiries/${id}/convert`);
        return response.data;
    }

    async addNote(id: string, note: string): Promise<Inquiry> {
        const response = await axios.post(`${API_URL}/inquiries/${id}/notes`, { note });
        return response.data;
    }

    async getStats(): Promise<any> {
        const response = await axios.get(`${API_URL}/inquiries/stats`);
        return response.data;
    }
}

export default new InquiriesService();
