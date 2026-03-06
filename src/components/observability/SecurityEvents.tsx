'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { getSecurityEvents } from '@/lib/api/observability';
import type { SecurityEvent } from '@/types/observability';
import { Shield, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

export default function SecurityEvents() {
    const [events, setEvents] = useState<SecurityEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadEvents();
        const interval = setInterval(loadEvents, 10000);
        return () => clearInterval(interval);
    }, []);

    const loadEvents = async () => {
        try {
            const data = await getSecurityEvents();
            setEvents(data);
        } catch (error) {
            console.error('Failed to load security events:', error);
        } finally {
            setLoading(false);
        }
    };

    const getSeverityBadge = (severity: SecurityEvent['severity']) => {
        const colors = {
            low: 'bg-blue-500',
            medium: 'bg-yellow-500',
            high: 'bg-orange-500',
            critical: 'bg-red-500',
        };

        return (
            <Badge className={colors[severity]}>
                <AlertTriangle className="h-3 w-3 mr-1" />
                {severity.toUpperCase()}
            </Badge>
        );
    };

    if (loading) {
        return <div className="animate-pulse h-64 bg-muted rounded-lg"></div>;
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    <CardTitle>Security Events</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                {events.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        No security events
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Type</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Severity</TableHead>
                                <TableHead>IP Address</TableHead>
                                <TableHead>Timestamp</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {events.map((event) => (
                                <TableRow key={event.id}>
                                    <TableCell className="capitalize">
                                        {event.type.replace(/_/g, ' ')}
                                    </TableCell>
                                    <TableCell className="max-w-md truncate">
                                        {event.description}
                                    </TableCell>
                                    <TableCell>{getSeverityBadge(event.severity)}</TableCell>
                                    <TableCell className="font-mono text-sm">
                                        {event.ipAddress}
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(event.timestamp), 'MMM dd, HH:mm:ss')}
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
