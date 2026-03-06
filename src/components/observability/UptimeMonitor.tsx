'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getUptimeStatus } from '@/lib/api/observability';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function UptimeMonitor() {
    const [uptime, setUptime] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUptime();
        const interval = setInterval(loadUptime, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadUptime = async () => {
        try {
            const data = await getUptimeStatus();
            setUptime(data);
        } catch (error) {
            console.error('Failed to load uptime:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'up':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'down':
                return <XCircle className="h-5 w-5 text-red-500" />;
            case 'degraded':
                return <AlertCircle className="h-5 w-5 text-yellow-500" />;
        }
    };

    const getStatusBadge = (status: string) => {
        const variants = {
            up: 'default' as const,
            down: 'destructive' as const,
            degraded: 'secondary' as const,
        };

        return (
            <Badge variant={variants[status as keyof typeof variants]}>
                {status.toUpperCase()}
            </Badge>
        );
    };

    if (loading || !uptime) {
        return <div className="animate-pulse h-32 bg-muted rounded-lg"></div>;
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>System Status</CardTitle>
                        {getStatusBadge(uptime.status)}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{uptime.uptime}% Uptime</div>
                    <p className="text-sm text-muted-foreground mt-1">
                        Last checked: {new Date(uptime.lastCheck).toLocaleTimeString()}
                    </p>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {uptime.services?.map((service: any) => (
                    <Card key={service.name}>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(service.status)}
                                    <span className="font-medium">{service.name}</span>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                    {service.responseTime}ms
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
