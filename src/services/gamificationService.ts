import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
        const response = await axios.get(`${API_URL}/gamification/${studentId}`);
        return response.data;
    }

    async addPoints(studentId: string, category: 'attendance' | 'behavior' | 'skills' | 'engagement', points: number) {
        const response = await axios.post(`${API_URL}/gamification/${studentId}/points`, {
            category,
            points,
        });
        return response.data;
    }

    async updateStreak(studentId: string, type: 'attendance' | 'behavior' | 'engagement') {
        const response = await axios.post(`${API_URL}/gamification/${studentId}/streak`, { type });
        return response.data;
    }

    async addAchievement(studentId: string, achievement: {
        name: string;
        description: string;
        rarity: 'common' | 'rare' | 'epic' | 'legendary';
        points: number;
    }) {
        const response = await axios.post(`${API_URL}/gamification/${studentId}/achievements`, achievement);
        return response.data;
    }

    async addBadge(studentId: string, badge: {
        name: string;
        imageUrl: string;
    }) {
        const response = await axios.post(`${API_URL}/gamification/${studentId}/badges`, badge);
        return response.data;
    }

    async getLeaderboard(tenantId: string, period: 'daily' | 'weekly' | 'monthly' | 'allTime', limit: number = 10) {
        const response = await axios.get(`${API_URL}/gamification/leaderboard`, {
            params: { tenantId, period, limit },
        });
        return response.data;
    }

    async redeemReward(studentId: string, rewardId: string) {
        const response = await axios.post(`${API_URL}/gamification/${studentId}/rewards/${rewardId}/redeem`);
        return response.data;
    }

    async getAvailableRewards(studentId: string) {
        const response = await axios.get(`${API_URL}/gamification/${studentId}/rewards/available`);
        return response.data;
    }
}

export default new GamificationService();
