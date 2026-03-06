'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { getAnonymizationLogs } from '@/lib/api/dataManagement';
import type { AnonymizationLog } from '@/types/dataManagement';
import { EyeOff } from 'lucide-react';
import { format } from 'date-fns';

export default function AnonymizationLogs() {
    const [logs, setLogs] = useState<AnonymizationLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        try {
            const data = await getAnonymizationLogs();
            setLogs(data);
        } catch (error) {
            console.error('Failed to load anonymization logs:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="animate-pulse h-64 bg-muted rounded-lg"></div>;
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <EyeOff className="h-5 w-5" />
                    <CardTitle>Anonymization Logs</CardTitle>
                </div>
                <CardDescription>
                    Audit trail of data anonymization activities
                </CardDescription>
            </CardHeader>
            <CardContent>
                {logs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        No anonymization logs found
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Entity</TableHead>
                                <TableHead>Record ID</TableHead>
                                <TableHead>Fields</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell className="font-medium capitalize">
                                        {log.entity}
                                    </TableCell>
                                    <TableCell className="font-mono text-sm">
                                        {log.recordId}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {log.fields.map((field) => (
                                                <Badge key={field} variant="secondary">
                                                    {field}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-xs truncate">
                                        {log.reason}
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(log.anonymizedAt), 'MMM dd, yyyy HH:mm')}
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
