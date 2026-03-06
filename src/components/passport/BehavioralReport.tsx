'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Smile, Meh, Frown, Users } from 'lucide-react';
import type { BehavioralTracking } from '@/types/passport';

interface BehavioralReportProps {
    behaviors: BehavioralTracking[];
}

export default function BehavioralReport({ behaviors }: BehavioralReportProps) {
    const getBehaviorIcon = (behavior: string) => {
        switch (behavior) {
            case 'excellent':
                return <Smile className="h-5 w-5 text-green-500" />;
            case 'good':
                return <Meh className="h-5 w-5 text-blue-500" />;
            case 'needs_improvement':
                return <Frown className="h-5 w-5 text-orange-500" />;
            default:
                return null;
        }
    };

    const getBehaviorColor = (behavior: string) => {
        switch (behavior) {
            case 'excellent':
                return 'bg-green-100 text-green-800';
            case 'good':
                return 'bg-blue-100 text-blue-800';
            case 'needs_improvement':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getCategoryLabel = (category: string) => {
        return category.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    const sortedBehaviors = [...behaviors].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Behavioral Tracking
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {sortedBehaviors.map((record) => (
                        <div
                            key={record.id}
                            className="flex items-start gap-3 p-3 border rounded-lg"
                        >
                            {getBehaviorIcon(record.behavior)}
                            <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <Badge className={getBehaviorColor(record.behavior)}>
                                            {record.behavior.replace('_', ' ')}
                                        </Badge>
                                        <Badge variant="outline" className="ml-2">
                                            {getCategoryLabel(record.category)}
                                        </Badge>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(record.date).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-sm mb-1">{record.notes}</p>
                                <p className="text-xs text-muted-foreground">
                                    Recorded by: {record.recordedBy}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
