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
        const url = userId ? `${this.baseUrl}/${userId}` : this.baseUrl;
        const response = await apiClient.get(url);
        return response.data;
    }

    async getAchievementById(achievementId: string): Promise<Achievement> {
        const response = await apiClient.get(`${this.baseUrl}/${achievementId}`);
        return response.data;
    }

    async unlockAchievement(achievementId: string): Promise<Achievement> {
        const response = await apiClient.post(`${this.baseUrl}/${achievementId}/unlock`);
        return response.data;
    }

    async getBadges(userId?: string): Promise<Badge[]> {
        const url = userId ? `${this.baseUrl}/${userId}/badges` : `${this.baseUrl}/badges`;
        const response = await apiClient.get(url);
        return response.data;
    }

    async getStats(userId?: string): Promise<{
        totalAchievements: number;
        unlockedAchievements: number;
        totalPoints: number;
        badges: number;
    }> {
        const url = userId ? `${this.baseUrl}/${userId}/stats` : `${this.baseUrl}/stats`;
        const response = await apiClient.get(url);
        return response.data;
    }

    async getLeaderboard(category?: string): Promise<{
        rank: number;
        userId: string;
        userName: string;
        points: number;
        achievements: number;
    }[]> {
        const response = await apiClient.get(`${this.baseUrl}/leaderboard`, {
            params: { category }
        });
        return response.data;
    }
}

export default UserAchievementsService;
