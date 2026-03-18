import { apiClient } from '../api/client';

export interface UserClass {
    id: string;
    userId: string;
    classId: string;
    className: string;
    coach: string;
    schedule: {
        date: string;
        time: string;
        duration: number;
    };
    location: string;
    status: 'upcoming' | 'completed' | 'cancelled';
    attendance?: {
        present: boolean;
        notes?: string;
    };
    feedback?: {
        rating: number;
        comment: string;
    };
}

export interface ClassBooking {
    classId: string;
    date: string;
    time: string;
    notes?: string;
}

class UserClassesService {
    private baseUrl = '/user/classes';

    async getClasses(filters?: {
        status?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<UserClass[]> {
        const response = await apiClient.get(this.baseUrl, { params: filters });
        return response.data;
    }

    async getClassById(classId: string): Promise<UserClass> {
        const response = await apiClient.get(`${this.baseUrl}/${classId}`);
        return response.data;
    }

    async bookClass(data: ClassBooking): Promise<UserClass> {
        const response = await apiClient.post(this.baseUrl, data);
        return response.data;
    }

    async cancelClass(classId: string): Promise<void> {
        await apiClient.delete(`${this.baseUrl}/${classId}`);
    }

    async submitFeedback(classId: string, feedback: {
        rating: number;
        comment: string;
    }): Promise<UserClass> {
        const response = await apiClient.post(`${this.baseUrl}/${classId}/feedback`, feedback);
        return response.data;
    }

    async getUpcomingClasses(): Promise<UserClass[]> {
        const response = await apiClient.get(`${this.baseUrl}/upcoming`);
        return response.data;
    }

    async getCompletedClasses(): Promise<UserClass[]> {
        const response = await apiClient.get(`${this.baseUrl}/completed`);
        return response.data;
    }

    async getClassHistory(userId?: string): Promise<UserClass[]> {
        const url = userId ? `${this.baseUrl}/history/${userId}` : `${this.baseUrl}/history`;
        const response = await apiClient.get(url);
        return response.data;
    }
}

export default UserClassesService;
