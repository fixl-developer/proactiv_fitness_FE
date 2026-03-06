'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, TrendingUp, Award } from 'lucide-react';
import type { GamificationProfile } from '@/types/gamification';

interface PointsDashboardProps {
    profile: GamificationProfile;
}

export default function PointsDashboard({ profile }: PointsDashboardProps) {
    const getTierColor = (tier: string) => {
        switch (tier) {
            case 'bronze':
                return 'bg-orange-600';
            case 'silver':
                return 'bg-gray-400';
            case 'gold':
                return 'bg-yellow-500';
            case 'platinum':
                return 'bg-blue-400';
            case 'diamond':
                return 'bg-purple-500';
            default:
                return 'bg-gray-400';
        }
    };

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Points</CardTitle>
                    <Star className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{profile.totalPoints.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                        {profile.availablePoints.toLocaleString()} available
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Current Tier</CardTitle>
                    <Trophy className={`h-4 w-4 ${getTierColor(profile.tier)}`} />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold capitalize">{profile.tier}</div>
                    <Progress value={profile.tierProgress} className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                        {profile.tierProgress}% to next tier
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{profile.currentStreak} days</div>
                    <p className="text-xs text-muted-foreground">
                        Longest: {profile.longestStreak} days
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Achievements</CardTitle>
                    <Award className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{profile.badgeCount}</div>
                    <p className="text-xs text-muted-foreground">
                        {profile.achievementCount} achievements unlocked
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
