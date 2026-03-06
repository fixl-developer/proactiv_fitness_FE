'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Trophy, Star, Target } from 'lucide-react';
import type { Milestone } from '@/types/passport';

interface MilestoneAchievementsProps {
    milestones: Milestone[];
}

export default function MilestoneAchievements({ milestones }: MilestoneAchievementsProps) {
    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'skill':
                return <Star className="h-5 w-5 text-yellow-500" />;
            case 'attendance':
                return <Target className="h-5 w-5 text-blue-500" />;
            case 'achievement':
                return <Trophy className="h-5 w-5 text-purple-500" />;
            case 'behavior':
                return <Award className="h-5 w-5 text-green-500" />;
            default:
                return <Award className="h-5 w-5" />;
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'skill':
                return 'bg-yellow-100 text-yellow-800';
            case 'attendance':
                return 'bg-blue-100 text-blue-800';
            case 'achievement':
                return 'bg-purple-100 text-purple-800';
            case 'behavior':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const sortedMilestones = [...milestones].sort(
        (a, b) => new Date(b.achievedDate).getTime() - new Date(a.achievedDate).getTime()
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Milestone Achievements
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {sortedMilestones.map((milestone) => (
                        <div
                            key={milestone.id}
                            className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                            <div className="text-3xl">{milestone.icon}</div>
                            <div className="flex-1">
                                <div className="flex items-start justify-between mb-1">
                                    <h3 className="font-semibold">{milestone.name}</h3>
                                    <Badge className={getCategoryColor(milestone.category)}>
                                        {milestone.category}
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                    {milestone.description}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    {getCategoryIcon(milestone.category)}
                                    <span>
                                        Achieved on{' '}
                                        {new Date(milestone.achievedDate).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
