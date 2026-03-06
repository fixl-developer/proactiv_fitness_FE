'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Target } from 'lucide-react';
import type { Achievement } from '@/types/gamification';

interface AchievementListProps {
    achievements: Achievement[];
}

export default function AchievementList({ achievements }: AchievementListProps) {
    return (
        <div className="space-y-3">
            {achievements.map((achievement) => {
                const progressPercentage = (achievement.progress / achievement.target) * 100;

                return (
                    <Card
                        key={achievement.id}
                        className={achievement.isCompleted ? 'border-green-500' : ''}
                    >
                        <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                                <div className="text-3xl">{achievement.icon}</div>
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-semibold flex items-center gap-2">
                                                {achievement.name}
                                                {achievement.isCompleted && (
                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                )}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                {achievement.description}
                                            </p>
                                        </div>
                                        <Badge variant="secondary">
                                            +{achievement.pointsAwarded} pts
                                        </Badge>
                                    </div>

                                    {!achievement.isCompleted && (
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Progress</span>
                                                <span className="font-medium">
                                                    {achievement.progress} / {achievement.target}
                                                </span>
                                            </div>
                                            <Progress value={progressPercentage} />
                                        </div>
                                    )}

                                    {achievement.isCompleted && achievement.completedAt && (
                                        <p className="text-xs text-muted-foreground">
                                            Completed on{' '}
                                            {new Date(achievement.completedAt).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
