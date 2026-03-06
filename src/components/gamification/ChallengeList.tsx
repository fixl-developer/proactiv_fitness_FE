'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, Users, Calendar, Star } from 'lucide-react';
import type { Challenge } from '@/types/gamification';

interface ChallengeListProps {
    challenges: Challenge[];
    onJoin: (challengeId: string) => void;
}

export default function ChallengeList({ challenges, onJoin }: ChallengeListProps) {
    const getChallengeTypeColor = (type: string) => {
        switch (type) {
            case 'daily':
                return 'bg-blue-100 text-blue-800';
            case 'weekly':
                return 'bg-green-100 text-green-800';
            case 'monthly':
                return 'bg-purple-100 text-purple-800';
            case 'special':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getDaysRemaining = (endDate: string) => {
        const end = new Date(endDate);
        const today = new Date();
        const diffTime = end.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    return (
        <div className="space-y-4">
            {challenges.map((challenge) => {
                const progressPercentage = (challenge.progress / challenge.target) * 100;
                const daysRemaining = getDaysRemaining(challenge.endDate);

                return (
                    <Card key={challenge.id}>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="flex items-center gap-2">
                                        <Target className="h-5 w-5" />
                                        {challenge.name}
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        {challenge.description}
                                    </p>
                                </div>
                                <Badge className={getChallengeTypeColor(challenge.type)}>
                                    {challenge.type}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span>Progress</span>
                                    <span className="font-medium">
                                        {challenge.progress} / {challenge.target}
                                    </span>
                                </div>
                                <Progress value={progressPercentage} />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Star className="h-4 w-4" />
                                        <span>{challenge.pointsReward} pts</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Users className="h-4 w-4" />
                                        <span>{challenge.participants} joined</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        <span>{daysRemaining} days left</span>
                                    </div>
                                </div>
                                {!challenge.isCompleted && (
                                    <Button size="sm" onClick={() => onJoin(challenge.id)}>
                                        Join Challenge
                                    </Button>
                                )}
                                {challenge.isCompleted && (
                                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                                        Completed
                                    </Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
