'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Award, Target, Flame } from 'lucide-react';
import type { ChildProgress } from '@/types/parent';

interface ChildProgressCardProps {
    progress: ChildProgress;
}

export default function ChildProgressCard({ progress }: ChildProgressCardProps) {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Attendance</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{progress.attendanceRate}%</div>
                        <p className="text-xs text-muted-foreground">
                            {progress.attendedClasses}/{progress.totalClasses} classes
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                        <Flame className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{progress.currentStreak}</div>
                        <p className="text-xs text-muted-foreground">days</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Milestones</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{progress.milestonesAchieved}</div>
                        <p className="text-xs text-muted-foreground">achieved</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Badges</CardTitle>
                        <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{progress.badgesEarned}</div>
                        <p className="text-xs text-muted-foreground">earned</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Skills Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {progress.skillsProgress.map((category) => (
                        <div key={category.category} className="space-y-3">
                            <h3 className="font-semibold capitalize">{category.category}</h3>
                            <div className="space-y-3">
                                {category.skills.map((skill, index) => {
                                    const percentage = (skill.level / skill.maxLevel) * 100;
                                    return (
                                        <div key={index} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">
                                                    {skill.name}
                                                </span>
                                                <Badge variant="secondary">
                                                    Level {skill.level}/{skill.maxLevel}
                                                </Badge>
                                            </div>
                                            <Progress value={percentage} className="h-2" />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
