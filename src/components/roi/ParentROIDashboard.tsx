'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Award, Target } from 'lucide-react';
import type { ParentROI } from '@/types/advanced';

interface ParentROIDashboardProps {
    roi: ParentROI;
}

export default function ParentROIDashboard({ roi }: ParentROIDashboardProps) {
    const getValueRatingColor = (rating: string) => {
        switch (rating) {
            case 'excellent':
                return 'bg-green-100 text-green-800';
            case 'good':
                return 'bg-blue-100 text-blue-800';
            case 'fair':
                return 'bg-yellow-100 text-yellow-800';
            case 'needs_improvement':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>{roi.childName}'s ROI Dashboard</CardTitle>
                        <Badge className={getValueRatingColor(roi.valueRating)}>
                            {roi.valueRating.replace('_', ' ')}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Overall ROI Score</span>
                                <span className="text-2xl font-bold">{roi.overallScore}/100</span>
                            </div>
                            <Progress value={roi.overallScore} className="h-3" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            AED {roi.totalInvestment.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            AED {roi.averageCostPerClass.toFixed(2)} per class
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Attendance</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{roi.classesAttended}</div>
                        <p className="text-xs text-muted-foreground">
                            {roi.attendanceConsistency}% consistency
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Development</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{roi.skillsImproved}</div>
                        <p className="text-xs text-muted-foreground">
                            {roi.milestonesAchieved} milestones
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Engagement</CardTitle>
                        <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{roi.participationScore}%</div>
                        <p className="text-xs text-muted-foreground">
                            Behavior: {roi.behaviorScore}%
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>ROI Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm">Attendance Consistency</span>
                            <span className="font-medium">{roi.attendanceConsistency}%</span>
                        </div>
                        <Progress value={roi.attendanceConsistency} />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm">Participation Score</span>
                            <span className="font-medium">{roi.participationScore}%</span>
                        </div>
                        <Progress value={roi.participationScore} />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm">Behavior Score</span>
                            <span className="font-medium">{roi.behaviorScore}%</span>
                        </div>
                        <Progress value={roi.behaviorScore} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
