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
import { getIntegrationLogs } from '@/lib/api/integration';
import type { IntegrationLog } from '@/types/integration';
import { Info, AlertTriangle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

interface IntegrationLogsProps {
    integrationId: string;
}

export default function IntegrationLogs({ integrationId }: IntegrationLogsProps) {
    const [logs, setLogs] = useState<IntegrationLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLogs();
    }, [integrationId]);

    const loadLogs = async () => {
        try {
            const data = await getIntegrationLogs(integrationId);
            setLogs(data);
        } catch (error) {
            console.error('Failed to load logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const getLevelIcon = (level: IntegrationLog['level']) => {
        switch (level) {
            case 'info':
                return <Info className="h-4 w-4 text-blue-500" />;
            case 'warning':
                return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
            case 'error':
                return <XCircle className="h-4 w-4 text-red-500" />;
        }
    };

    if (loading) {
        return <div className="animate-pulse h-64 bg-muted rounded-lg"></div>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Integration Logs</CardTitle>
            </CardHeader>
            <CardContent>
                {logs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No logs available</div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Level</TableHead>
                                <TableHead>Message</TableHead>
                                <TableHead>Timestamp</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {getLevelIcon(log.level)}
                                            <Badge
                                                variant={
                                                    log.level === 'error'
                                                        ? 'destructive'
                                                        : 'secondary'
                                                }
                                            >
                                                {log.level}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-md truncate">
                                        {log.message}
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(log.timestamp), 'MMM dd, HH:mm:ss')}
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
