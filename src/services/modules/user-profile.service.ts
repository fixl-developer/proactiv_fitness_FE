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
    private baseUrl = '/user/profile';

    async getProfile(userId?: string): Promise<UserProfileData> {
        const url = userId ? `${this.baseUrl}/${userId}` : this.baseUrl;
        const response = await apiClient.get(url);
        return response.data;
    }

    async updateProfile(data: Partial<UserProfileData>): Promise<UserProfileData> {
        const response = await apiClient.put(this.baseUrl, data);
        return response.data;
    }

    async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
        const formData = new FormData();
        formData.append('avatar', file);
        const response = await apiClient.post(`${this.baseUrl}/avatar`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }

    async getStats(userId?: string): Promise<any> {
        const url = userId ? `${this.baseUrl}/${userId}/stats` : `${this.baseUrl}/stats`;
        const response = await apiClient.get(url);
        return response.data;
    }
}

export default UserProfileService;
