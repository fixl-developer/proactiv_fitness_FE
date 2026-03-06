import { create } from 'zustand';
import type {
    GamificationProfile,
    Badge,
    Achievement,
    Challenge,
    LeaderboardEntry,
    PointsTransaction,
} from '@/types/gamification';

interface GamificationStore {
    profile: GamificationProfile | null;
    badges: Badge[];
    achievements: Achievement[];
    challenges: Challenge[];
    leaderboard: LeaderboardEntry[];
    pointsHistory: PointsTransaction[];
    loading: boolean;

    setProfile: (profile: GamificationProfile) => void;
    setBadges: (badges: Badge[]) => void;
    setAchievements: (achievements: Achievement[]) => void;
    setChallenges: (challenges: Challenge[]) => void;
    setLeaderboard: (leaderboard: LeaderboardEntry[]) => void;
    setPointsHistory: (history: PointsTransaction[]) => void;
    setLoading: (loading: boolean) => void;

    addPoints: (amount: number) => void;
    unlockBadge: (badgeId: string) => void;
    completeAchievement: (achievementId: string) => void;
}

export const useGamificationStore = create<GamificationStore>((set) => ({
    profile: null,
    badges: [],
    achievements: [],
    challenges: [],
    leaderboard: [],
    pointsHistory: [],
    loading: false,

    setProfile: (profile) => set({ profile }),
    setBadges: (badges) => set({ badges }),
    setAchievements: (achievements) => set({ achievements }),
    setChallenges: (challenges) => set({ challenges }),
    setLeaderboard: (leaderboard) => set({ leaderboard }),
    setPointsHistory: (pointsHistory) => set({ pointsHistory }),
    setLoading: (loading) => set({ loading }),

    addPoints: (amount) =>
        set((state) => {
            if (!state.profile) return state;
            return {
                profile: {
                    ...state.profile,
                    totalPoints: state.profile.totalPoints + amount,
                    availablePoints: state.profile.availablePoints + amount,
                },
            };
        }),

    unlockBadge: (badgeId) =>
        set((state) => ({
            badges: state.badges.map((badge) =>
                badge.id === badgeId
                    ? { ...badge, isUnlocked: true, unlockedAt: new Date().toISOString() }
                    : badge
            ),
        })),

    completeAchievement: (achievementId) =>
        set((state) => ({
            achievements: state.achievements.map((achievement) =>
                achievement.id === achievementId
                    ? {
                        ...achievement,
                        isCompleted: true,
                        completedAt: new Date().toISOString(),
                    }
                    : achievement
            ),
        })),
}));
