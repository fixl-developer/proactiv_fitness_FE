'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { ROIMetric } from '@/types/advanced';

interface ROIMetricsProps {
    metrics: ROIMetric[];
}

export default function ROIMetrics({ metrics }: ROIMetricsProps) {
    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up':
                return <TrendingUp className="h-4 w-4 text-green-500" />;
            case 'down':
                return <TrendingDown className="h-4 w-4 text-red-500" />;
            case 'stable':
                return <Minus className="h-4 w-4 text-gray-500" />;
            default:
                return null;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Key Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {metrics.map((metric, index) => (
                        <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">{metric.name}</span>
                                    {getTrendIcon(metric.trend)}
                                </div>
                                <div className="text-right">
                                    <span className="text-lg font-bold">
                                        {metric.value}
                                        {metric.unit}
                                    </span>
                                </div>
                            </div>
                            <Progress value={metric.value} className="h-2" />
                            <p className="text-xs text-muted-foreground">{metric.comparison}</p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
