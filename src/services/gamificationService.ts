import { apiClient } from '@/services/api/client';

export interface GamificationProfile {
    studentId: string;
    tenantId: string;
    points: {
        total: number;
        attendance: number;
        behavior: number;
        skills: number;
        engagement: number;
    };
    level: number;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
    streaks: {
        attendance: { current: number; longest: number; lastDate: Date };
        behavior: { current: number; longest: number; lastDate: Date };
        engagement: { current: number; longest: number; lastDate: Date };
    };
    achievements: Array<{
        achievementId: string;
        name: string;
        description: string;
        rarity: 'common' | 'rare' | 'epic' | 'legendary';
        earnedDate: Date;
        points: number;
    }>;
    badges: Array<{
        badgeId: string;
        name: string;
        imageUrl: string;
        earnedDate: Date;
    }>;
    rewards: Array<{
        rewardId: string;
        name: string;
        type: 'discount' | 'merchandise' | 'privilege' | 'other';
        status: 'available' | 'redeemed' | 'expired';
        redeemedDate?: Date;
    }>;
    leaderboardRank?: {
        daily: number;
        weekly: number;
        monthly: number;
        allTime: number;
    };
}

class GamificationService {
    async getProfile(studentId: string) {
        const response = await apiClient.get(`/gamification/${studentId}`);
        return response;
    }

    async addPoints(studentId: string, category: 'attendance' | 'behavior' | 'skills' | 'engagement', points: number) {
        const response = await apiClient.post(`/gamification/${studentId}/points`, {
            category,
            points,
        });
        return response;
    }

    async updateStreak(studentId: string, type: 'attendance' | 'behavior' | 'engagement') {
        const response = await apiClient.post(`/gamification/${studentId}/streak`, { type });
        return response;
    }

    async addAchievement(studentId: string, achievement: {
        name: string;
        description: string;
        rarity: 'common' | 'rare' | 'epic' | 'legendary';
        points: number;
    }) {
        const response = await apiClient.post(`/gamification/${studentId}/achievements`, achievement);
        return response;
    }

    async addBadge(studentId: string, badge: {
        name: string;
        imageUrl: string;
    }) {
        const response = await apiClient.post(`/gamification/${studentId}/badges`, badge);
        return response;
    }

    async getLeaderboard(tenantId: string, period: 'daily' | 'weekly' | 'monthly' | 'allTime', limit: number = 10) {
        const response = await apiClient.get(`/gamification/leaderboard`, {
            params: { tenantId, period, limit },
        });
        return response;
    }

    async redeemReward(studentId: string, rewardId: string) {
        const response = await apiClient.post(`/gamification/${studentId}/rewards/${rewardId}/redeem`);
        return response;
    }

    async getAvailableRewards(studentId: string) {
        const response = await apiClient.get(`/gamification/${studentId}/rewards/available`);
        return response;
    }
}

export default new GamificationService();
