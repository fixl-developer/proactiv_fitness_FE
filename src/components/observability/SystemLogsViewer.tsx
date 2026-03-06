'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { getSystemLogs } from '@/lib/api/observability';
import type { SystemLog } from '@/types/observability';
import { Search, AlertCircle, Info, AlertTriangle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function SystemLogsViewer() {
    const [logs, setLogs] = useState<SystemLog[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<SystemLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadLogs();
        const interval = setInterval(loadLogs, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        filterLogs();
    }, [searchQuery, logs]);

    const loadLogs = async () => {
        try {
            const data = await getSystemLogs();
            setLogs(data);
        } catch (error) {
            console.error('Failed to load logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterLogs = () => {
        if (!searchQuery) {
            setFilteredLogs(logs);
            return;
        }

        const filtered = logs.filter(
            (log) =>
                log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                log.service.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredLogs(filtered);
    };

    const getLevelIcon = (level: SystemLog['level']) => {
        switch (level) {
            case 'debug':
            case 'info':
                return <Info className="h-4 w-4 text-blue-500" />;
            case 'warning':
                return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
            case 'error':
            case 'critical':
                return <XCircle className="h-4 w-4 text-red-500" />;
        }
    };

    const getLevelBadge = (level: SystemLog['level']) => {
        const variants = {
            debug: 'secondary' as const,
            info: 'default' as const,
            warning: 'secondary' as const,
            error: 'destructive' as const,
            critical: 'destructive' as const,
        };

        return (
            <Badge variant={variants[level]} className="flex items-center gap-1 w-fit">
                {getLevelIcon(level)}
                {level.toUpperCase()}
            </Badge>
        );
    };

    if (loading) {
        return <div className="animate-pulse h-96 bg-muted rounded-lg"></div>;
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>System Logs</CardTitle>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search logs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="max-h-[600px] overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Level</TableHead>
                                <TableHead>Service</TableHead>
                                <TableHead>Message</TableHead>
                                <TableHead>Timestamp</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredLogs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell>{getLevelBadge(log.level)}</TableCell>
                                    <TableCell className="font-medium">{log.service}</TableCell>
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
                </div>
            </CardContent>
        </Card>
    );
}
