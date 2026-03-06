import axios from 'axios';
import type {
    GamificationProfile,
    Badge,
    Achievement,
    Challenge,
    LeaderboardEntry,
    PointsTransaction,
    Reward,
    RewardRedemption,
} from '@/types/gamification';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Profile
export const getGamificationProfile = async (userId: string): Promise<GamificationProfile> => {
    const response = await axios.get(`${API_URL}/gamification/profile/${userId}`);
    return response.data;
};

// Badges
export const getUserBadges = async (userId: string): Promise<Badge[]> => {
    const response = await axios.get(`${API_URL}/gamification/badges/${userId}`);
    return response.data;
};

export const getAllBadges = async (): Promise<Badge[]> => {
    const response = await axios.get(`${API_URL}/gamification/badges`);
    return response.data;
};

// Achievements
export const getUserAchievements = async (userId: string): Promise<Achievement[]> => {
    const response = await axios.get(`${API_URL}/gamification/achievements/${userId}`);
    return response.data;
};

// Challenges
export const getActiveChallenges = async (): Promise<Challenge[]> => {
    const response = await axios.get(`${API_URL}/gamification/challenges/active`);
    return response.data;
};

export const joinChallenge = async (challengeId: string): Promise<void> => {
    await axios.post(`${API_URL}/gamification/challenges/${challengeId}/join`);
};

// Leaderboard
export const getLeaderboard = async (
    type: 'daily' | 'weekly' | 'monthly' | 'all-time',
    limit: number = 100
): Promise<LeaderboardEntry[]> => {
    const response = await axios.get(`${API_URL}/gamification/leaderboard/${type}`, {
        params: { limit },
    });
    return response.data;
};

// Points
export const getPointsHistory = async (userId: string): Promise<PointsTransaction[]> => {
    const response = await axios.get(`${API_URL}/gamification/points/history/${userId}`);
    return response.data;
};

// Rewards
export const getRewardsCatalog = async (): Promise<Reward[]> => {
    const response = await axios.get(`${API_URL}/gamification/rewards`);
    return response.data;
};

export const redeemReward = async (rewardId: string): Promise<RewardRedemption> => {
    const response = await axios.post(`${API_URL}/gamification/rewards/${rewardId}/redeem`);
    return response.data;
};

export const getRedemptionHistory = async (userId: string): Promise<RewardRedemption[]> => {
    const response = await axios.get(`${API_URL}/gamification/redemptions/${userId}`);
    return response.data;
};
