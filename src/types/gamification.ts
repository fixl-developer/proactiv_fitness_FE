// Gamification types and interfaces

export interface GamificationProfile {
    id: string;
    userId: string;
    userName: string;

    // Points
    totalPoints: number;
    availablePoints: number;
    lifetimePoints: number;

    // Level & Tier
    level: number;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
    tierProgress: number;

    // Streaks
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: string;

    // Badges
    badgeCount: number;
    achievementCount: number;

    // Rankings
    globalRank: number;
    locationRank: number;

    createdAt: string;
    updatedAt: string;
}

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: 'attendance' | 'achievement' | 'milestone' | 'special' | 'seasonal';
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    pointsRequired: number;
    isUnlocked: boolean;
    unlockedAt?: string;
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    pointsAwarded: number;
    progress: number;
    target: number;
    isCompleted: boolean;
    completedAt?: string;
}

export interface Challenge {
    id: string;
    name: string;
    description: string;
    type: 'daily' | 'weekly' | 'monthly' | 'special';
    startDate: string;
    endDate: string;
    pointsReward: number;
    progress: number;
    target: number;
    isCompleted: boolean;
    participants: number;
}

export interface LeaderboardEntry {
    rank: number;
    userId: string;
    userName: string;
    avatar?: string;
    points: number;
    tier: string;
    badgeCount: number;
}

export interface PointsTransaction {
    id: string;
    userId: string;
    type: 'earned' | 'spent' | 'expired';
    amount: number;
    reason: string;
    referenceId?: string;
    referenceType?: string;
    balanceBefore: number;
    balanceAfter: number;
    createdAt: string;
}

export interface Reward {
    id: string;
    name: string;
    description: string;
    image: string;
    category: 'discount' | 'merchandise' | 'experience' | 'digital';
    pointsCost: number;
    stockAvailable: number;
    isAvailable: boolean;
    expiryDate?: string;
}

export interface RewardRedemption {
    id: string;
    userId: string;
    rewardId: string;
    rewardName: string;
    pointsSpent: number;
    status: 'pending' | 'approved' | 'fulfilled' | 'cancelled';
    redemptionCode?: string;
    redeemedAt: string;
    fulfilledAt?: string;
}
