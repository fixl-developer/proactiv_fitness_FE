'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { getAlerts, acknowledgeAlert, resolveAlert } from '@/lib/api/observability';
import type { Alert } from '@/types/observability';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function AlertManager() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAlerts();
        const interval = setInterval(loadAlerts, 10000);
        return () => clearInterval(interval);
    }, []);

    const loadAlerts = async () => {
        try {
            const data = await getAlerts();
            setAlerts(data);
        } catch (error) {
            console.error('Failed to load alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAcknowledge = async (id: string) => {
        try {
            await acknowledgeAlert(id);
            loadAlerts();
            toast.success('Alert acknowledged');
        } catch (error) {
            toast.error('Failed to acknowledge alert');
            console.error(error);
        }
    };

    const handleResolve = async (id: string) => {
        try {
            await resolveAlert(id);
            loadAlerts();
            toast.success('Alert resolved');
        } catch (error) {
            toast.error('Failed to resolve alert');
            console.error(error);
        }
    };

    const getSeverityBadge = (severity: Alert['severity']) => {
        const colors = {
            low: 'bg-blue-500',
            medium: 'bg-yellow-500',
            high: 'bg-orange-500',
            critical: 'bg-red-500',
        };

        return (
            <Badge className={colors[severity]}>
                {severity.toUpperCase()}
            </Badge>
        );
    };

    const getStatusBadge = (status: Alert['status']) => {
        const config = {
            active: { variant: 'destructive' as const, icon: AlertCircle },
            acknowledged: { variant: 'secondary' as const, icon: Clock },
            resolved: { variant: 'default' as const, icon: CheckCircle },
        };

        const { variant, icon: Icon } = config[status];

        return (
            <Badge variant={variant} className="flex items-center gap-1 w-fit">
                <Icon className="h-3 w-3" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    if (loading) {
        return <div className="animate-pulse h-64 bg-muted rounded-lg"></div>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Active Alerts</CardTitle>
            </CardHeader>
            <CardContent>
                {alerts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        No active alerts
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Severity</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Triggered</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {alerts.map((alert) => (
                                <TableRow key={alert.id}>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{alert.title}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {alert.description}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
                                    <TableCell>{getStatusBadge(alert.status)}</TableCell>
                                    <TableCell>
                                        {format(new Date(alert.triggeredAt), 'MMM dd, HH:mm')}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            {alert.status === 'active' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleAcknowledge(alert.id)}
                                                >
                                                    Acknowledge
                                                </Button>
                                            )}
                                            {alert.status !== 'resolved' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleResolve(alert.id)}
                                                >
                                                    Resolve
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
