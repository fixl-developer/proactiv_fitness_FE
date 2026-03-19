import { apiClient } from '../api/client';

export interface Achievement {
    id: string;
    userId: string;
    title: string;
    description: string;
    icon: string;
    category: 'attendance' | 'skill' | 'milestone' | 'special';
    points: number;
    achieved: boolean;
    achievedAt?: string;
    progress?: number;
    requirement?: string;
}

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    earnedAt: string;
}

class UserAchievementsService {
    private baseUrl = '/user/achievements';

    async getAchievements(userId?: string): Promise<Achievement[]> {
        try {
            const url = userId ? `${this.baseUrl}/${userId}` : this.baseUrl;
            const response = await apiClient.get<{ data: Achievement[] }>(url);
            return response.data || [];
        } catch {
            throw new Error('Achievements not available');
        }
    }

    async getAchievementById(achievementId: string): Promise<Achievement | null> {
        try {
            const response = await apiClient.get<{ data: Achievement }>(`${this.baseUrl}/${achievementId}`);
            return response.data;
        } catch {
            return null;
        }
    }

    async unlockAchievement(achievementId: string): Promise<Achievement> {
        const response = await apiClient.post<{ data: Achievement }>(`${this.baseUrl}/${achievementId}/unlock`);
        return response.data;
    }

    async getBadges(userId?: string): Promise<Badge[]> {
        try {
            const url = userId ? `${this.baseUrl}/${userId}/badges` : `${this.baseUrl}/badges`;
            const response = await apiClient.get<{ data: Badge[] }>(url);
            return response.data || [];
        } catch {
            return [];
        }
    }

    async getStats(userId?: string): Promise<{
        totalAchievements: number;
        unlockedAchievements: number;
        totalPoints: number;
        badges: number;
    }> {
        try {
            const url = userId ? `${this.baseUrl}/${userId}/stats` : `${this.baseUrl}/stats`;
            const response = await apiClient.get<{ data: { totalAchievements: number; unlockedAchievements: number; totalPoints: number; badges: number } }>(url);
            return response.data;
        } catch {
            throw new Error('Stats not available');
        }
    }

    async getLeaderboard(category?: string): Promise<{
        rank: number;
        userId: string;
        userName: string;
        points: number;
        achievements: number;
    }[]> {
        try {
            const response = await apiClient.get<{ data: { rank: number; userId: string; userName: string; points: number; achievements: number }[] }>(`${this.baseUrl}/leaderboard`, {
                params: { category }
            });
            return response.data || [];
        } catch {
            return [];
        }
    }
}

export default UserAchievementsService;
