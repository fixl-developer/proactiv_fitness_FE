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
        const profile = await this.getProfile();
        return {
            profile,
            stats: {
                totalClasses: profile.stats?.totalClasses || 0,
                completedClasses: profile.stats?.completedClasses || 0,
                upcomingClasses: profile.stats?.upcomingClasses || 0,
                totalSpent: profile.stats?.totalSpent || 0,
                currentStreak: 0,
                achievements: 0,
            },
            recentActivity: [],
            upcomingClasses: [],
            progress: null,
        };
    }

    async getProfile(): Promise<UserProfile> {
        try {
            const response = await apiClient.get('/users/profile');
            return response.data || response;
        } catch {
            // Fallback: build profile from stored user data
            const stored = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
            if (stored) {
                const user = JSON.parse(stored);
                return {
                    id: user.id || user._id || '',
                    firstName: user.firstName || user.name?.split(' ')[0] || '',
                    lastName: user.lastName || user.name?.split(' ')[1] || '',
                    email: user.email || '',
                    phone: user.phone || '',
                };
            }
            return { id: '', firstName: '', lastName: '', email: '' };
        }
    }

    async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
        try {
            const response = await apiClient.put('/users/profile', data);
            return response.data || response;
        } catch {
            return data as UserProfile;
        }
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
