'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Medal, Award } from 'lucide-react';
import type { LeaderboardEntry } from '@/types/gamification';

interface LeaderboardProps {
    entries: LeaderboardEntry[];
    currentUserId?: string;
}

export default function Leaderboard({ entries, currentUserId }: LeaderboardProps) {
    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Trophy className="h-5 w-5 text-yellow-500" />;
            case 2:
                return <Medal className="h-5 w-5 text-gray-400" />;
            case 3:
                return <Medal className="h-5 w-5 text-orange-600" />;
            default:
                return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
        }
    };

    const getTierColor = (tier: string) => {
        switch (tier.toLowerCase()) {
            case 'bronze':
                return 'bg-orange-100 text-orange-800';
            case 'silver':
                return 'bg-gray-100 text-gray-800';
            case 'gold':
                return 'bg-yellow-100 text-yellow-800';
            case 'platinum':
                return 'bg-blue-100 text-blue-800';
            case 'diamond':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Leaderboard
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {entries.map((entry) => (
                        <div
                            key={entry.userId}
                            className={`flex items-center justify-between p-3 rounded-lg border ${entry.userId === currentUserId
                                    ? 'bg-primary/10 border-primary'
                                    : 'hover:bg-muted/50'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 flex justify-center">
                                    {getRankIcon(entry.rank)}
                                </div>
                                <Avatar>
                                    <AvatarImage src={entry.avatar} />
                                    <AvatarFallback>
                                        {entry.userName.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">{entry.userName}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge
                                            variant="secondary"
                                            className={getTierColor(entry.tier)}
                                        >
                                            {entry.tier}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                            {entry.badgeCount} badges
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-lg">
                                    {entry.points.toLocaleString()}
                                </p>
                                <p className="text-xs text-muted-foreground">points</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
