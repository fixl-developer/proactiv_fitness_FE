'use client';

import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PointsDashboard from '@/components/gamification/PointsDashboard';
import BadgeCollection from '@/components/gamification/BadgeCollection';
import Leaderboard from '@/components/gamification/Leaderboard';
import StreakTracker from '@/components/gamification/StreakTracker';
import ChallengeList from '@/components/gamification/ChallengeList';
import PointsHistory from '@/components/gamification/PointsHistory';
import {
    getGamificationProfile,
    getUserBadges,
    getActiveChallenges,
    getLeaderboard,
    getPointsHistory,
    joinChallenge,
} from '@/lib/api/gamification';
import type {
    GamificationProfile,
    Badge,
    Challenge,
    LeaderboardEntry,
    PointsTransaction,
} from '@/types/gamification';
import { useToast } from '@/hooks/use-toast';

export default function GamificationPage() {
    const { toast } = useToast();
    const [profile, setProfile] = useState<GamificationProfile | null>(null);
    const [badges, setBadges] = useState<Badge[]>([]);
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [pointsHistory, setPointsHistory] = useState<PointsTransaction[]>([]);
    const [loading, setLoading] = useState(true);

    const userId = 'current-user-id'; // Get from auth context

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [profileData, badgesData, challengesData, leaderboardData, historyData] =
                await Promise.all([
                    getGamificationProfile(userId),
                    getUserBadges(userId),
                    getActiveChallenges(),
                    getLeaderboard('all-time', 50),
                    getPointsHistory(userId),
                ]);

            setProfile(profileData);
            setBadges(badgesData);
            setChallenges(challengesData);
            setLeaderboard(leaderboardData);
            setPointsHistory(historyData);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load gamification data',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleJoinChallenge = async (challengeId: string) => {
        try {
            await joinChallenge(challengeId);
            toast({
                title: 'Success',
                description: 'Joined challenge successfully',
            });
            fetchData();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to join challenge',
                variant: 'destructive',
            });
        }
    };

    if (loading || !profile) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Gamification</h1>
                <p className="text-muted-foreground">
                    Track your progress, earn rewards, and compete with others
                </p>
            </div>

            <PointsDashboard profile={profile} />

            <div className="grid gap-6 md:grid-cols-2">
                <StreakTracker
                    currentStreak={profile.currentStreak}
                    longestStreak={profile.longestStreak}
                    lastActivityDate={profile.lastActivityDate}
                />
                <PointsHistory transactions={pointsHistory.slice(0, 5)} />
            </div>

            <Tabs defaultValue="badges" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="badges">Badges</TabsTrigger>
                    <TabsTrigger value="challenges">Challenges</TabsTrigger>
                    <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
                </TabsList>

                <TabsContent value="badges" className="space-y-4">
                    <BadgeCollection badges={badges} />
                </TabsContent>

                <TabsContent value="challenges" className="space-y-4">
                    <ChallengeList challenges={challenges} onJoin={handleJoinChallenge} />
                </TabsContent>

                <TabsContent value="leaderboard" className="space-y-4">
                    <Leaderboard entries={leaderboard} currentUserId={userId} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
