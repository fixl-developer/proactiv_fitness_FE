import { apiClient } from '../api/client';

export interface UserProfile {
    id: string;
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
}

export interface UserDashboardData {
    profile: UserProfile;
    stats: {
        totalClasses: number;
        completedClasses: number;
        upcomingClasses: number;
        totalSpent: number;
        currentStreak: number;
        achievements: number;
    };
    recentActivity: any[];
    upcomingClasses: any[];
    progress: any;
}

class UserService {
    async getDashboardData(): Promise<UserDashboardData> {
        // No dedicated dashboard endpoint - build from profile
        const profile = await this.getProfile();
        return {
            profile,
            stats: profile.stats || {
                totalClasses: 0,
                completedClasses: 0,
                upcomingClasses: 0,
                totalSpent: 0,
                currentStreak: 0,
                achievements: 0,
            },
            recentActivity: [],
            upcomingClasses: [],
            progress: null,
        };
    }

    async getProfile(): Promise<UserProfile> {
        const response = await apiClient.get('/users/profile');
        return response.data || response;
    }

    async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
        const response = await apiClient.put('/users/profile', data);
        return response.data || response;
    }

    async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
        const formData = new FormData();
        formData.append('avatar', file);
        const response = await apiClient.post('/users/profile/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data || response;
    }

    async deleteAccount(): Promise<void> {
        await apiClient.delete('/users/profile');
    }
}

export default UserService;
