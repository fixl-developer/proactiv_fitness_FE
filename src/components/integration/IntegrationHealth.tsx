'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getIntegrationHealth } from '@/lib/api/integration';
import type { IntegrationHealth as HealthType } from '@/types/integration';
import { Activity, Clock, TrendingUp, AlertCircle } from 'lucide-react';

interface IntegrationHealthProps {
    integrationId: string;
}

export default function IntegrationHealth({ integrationId }: IntegrationHealthProps) {
    const [health, setHealth] = useState<HealthType | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHealth();
        const interval = setInterval(loadHealth, 30000);
        return () => clearInterval(interval);
    }, [integrationId]);

    const loadHealth = async () => {
        try {
            const data = await getIntegrationHealth(integrationId);
            setHealth(data);
        } catch (error) {
            console.error('Failed to load health:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !health) {
        return <div className="animate-pulse h-32 bg-muted rounded-lg"></div>;
    }

    const getStatusColor = (status: HealthType['status']) => {
        switch (status) {
            case 'healthy':
                return 'bg-green-500';
            case 'degraded':
                return 'bg-yellow-500';
            case 'down':
                return 'bg-red-500';
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Health Status</CardTitle>
                    <Badge className={getStatusColor(health.status)}>
                        {health.status.toUpperCase()}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm">Response Time</span>
                        </div>
                        <p className="text-2xl font-bold">{health.responseTime}ms</p>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-sm">Error Rate</span>
                        </div>
                        <p className="text-2xl font-bold">{health.errorRate}%</p>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <TrendingUp className="h-4 w-4" />
                            <span className="text-sm">Uptime</span>
                        </div>
                        <p className="text-2xl font-bold">{health.uptime}%</p>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Activity className="h-4 w-4" />
                            <span className="text-sm">Last Check</span>
                        </div>
                        <p className="text-sm font-medium">
                            {new Date(health.lastCheck).toLocaleTimeString()}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
