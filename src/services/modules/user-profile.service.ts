import { apiClient } from '../api/client';

export interface UserProfileData {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    dateOfBirth?: string;
    avatar?: string;
    bio?: string;
    emergencyContact?: {
        name: string;
        phone: string;
        relationship: string;
    };
    preferences?: {
        notifications: boolean;
        emailUpdates: boolean;
        smsReminders: boolean;
    };
    stats?: {
        totalClasses: number;
        completedClasses: number;
        upcomingClasses: number;
        totalSpent: number;
    };
    createdAt: string;
    updatedAt: string;
}

class UserProfileService {
    private baseUrl = '/users/profile';

    async getProfile(userId?: string): Promise<UserProfileData> {
        try {
            const url = userId ? `${this.baseUrl}/${userId}` : this.baseUrl;
            const response = await apiClient.get<any>(url);
            return response.data || response;
        } catch {
            // Fallback from stored user
            const stored = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
            if (stored) {
                const user = JSON.parse(stored);
                return {
                    id: user.id || user._id || '',
                    userId: user.id || user._id || '',
                    firstName: user.firstName || user.name?.split(' ')[0] || '',
                    lastName: user.lastName || user.name?.split(' ')[1] || '',
                    email: user.email || '',
                    phone: user.phone || '',
                    createdAt: '',
                    updatedAt: ''
                };
            }
            throw new Error('Profile not available');
        }
    }

    async updateProfile(data: Partial<UserProfileData>): Promise<UserProfileData> {
        try {
            const response = await apiClient.put<any>(this.baseUrl, data);
            return response.data || response;
        } catch {
            return data as UserProfileData;
        }
    }

    async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
        const formData = new FormData();
        formData.append('avatar', file);
        const response = await apiClient.post<any>(`${this.baseUrl}/avatar`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }

    async getStats(userId?: string): Promise<any> {
        try {
            const url = userId ? `${this.baseUrl}/${userId}/stats` : `${this.baseUrl}/stats`;
            const response = await apiClient.get<any>(url);
            return response.data;
        } catch {
            return { totalClasses: 0, completedClasses: 0, upcomingClasses: 0, totalSpent: 0 };
        }
    }
}

export default UserProfileService;
