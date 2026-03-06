'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
    title: string;
    value: string | number;
    change?: number;
    changeType?: 'increase' | 'decrease' | 'neutral';
    icon?: React.ReactNode;
    trend?: number[];
}

export default function MetricCard({
    title,
    value,
    change,
    changeType = 'neutral',
    icon,
    trend,
}: MetricCardProps) {
    const getTrendIcon = () => {
        if (!change) return null;

        switch (changeType) {
            case 'increase':
                return <TrendingUp className="h-3 w-3 text-green-500" />;
            case 'decrease':
                return <TrendingDown className="h-3 w-3 text-red-500" />;
            default:
                return <Minus className="h-3 w-3 text-muted-foreground" />;
        }
    };

    const getChangeColor = () => {
        switch (changeType) {
            case 'increase':
                return 'text-green-500';
            case 'decrease':
                return 'text-red-500';
            default:
                return 'text-muted-foreground';
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {change !== undefined && (
                    <p className={cn('text-xs flex items-center gap-1 mt-1', getChangeColor())}>
                        {getTrendIcon()}
                        {Math.abs(change)}% from last period
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
