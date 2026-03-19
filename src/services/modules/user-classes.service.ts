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
        try {
            const response = await apiClient.get<any>(this.baseUrl, { params: filters });
            return response.data || [];
        } catch {
            return [];
        }
    }

    async getClassById(classId: string): Promise<UserClass | null> {
        try {
            const response = await apiClient.get<any>(`${this.baseUrl}/${classId}`);
            return response.data;
        } catch {
            return null;
        }
    }

    async bookClass(data: ClassBooking): Promise<UserClass> {
        const response = await apiClient.post<any>(this.baseUrl, data);
        return response.data;
    }

    async cancelClass(classId: string): Promise<void> {
        await apiClient.delete(`${this.baseUrl}/${classId}`);
    }

    async submitFeedback(classId: string, feedback: {
        rating: number;
        comment: string;
    }): Promise<UserClass> {
        const response = await apiClient.post<any>(`${this.baseUrl}/${classId}/feedback`, feedback);
        return response.data;
    }

    async getUpcomingClasses(): Promise<UserClass[]> {
        try {
            const response = await apiClient.get<any>(`${this.baseUrl}/upcoming`);
            return response.data || [];
        } catch {
            return [];
        }
    }

    async getCompletedClasses(): Promise<UserClass[]> {
        try {
            const response = await apiClient.get<any>(`${this.baseUrl}/completed`);
            return response.data || [];
        } catch {
            return [];
        }
    }

    async getClassHistory(userId?: string): Promise<UserClass[]> {
        try {
            const url = userId ? `${this.baseUrl}/history/${userId}` : `${this.baseUrl}/history`;
            const response = await apiClient.get<any>(url);
            return response.data || [];
        } catch {
            return [];
        }
    }
}

export default UserClassesService;
