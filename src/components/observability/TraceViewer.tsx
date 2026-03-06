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
import { getTraces } from '@/lib/api/observability';
import type { TraceData } from '@/types/observability';
import { Activity, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function TraceViewer() {
    const [traces, setTraces] = useState<TraceData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTraces();
    }, []);

    const loadTraces = async () => {
        try {
            const data = await getTraces();
            setTraces(data);
        } catch (error) {
            console.error('Failed to load traces:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: TraceData['status']) => {
        return status === 'success' ? (
            <Badge variant="default" className="flex items-center gap-1 w-fit">
                <CheckCircle className="h-3 w-3" />
                Success
            </Badge>
        ) : (
            <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                <XCircle className="h-3 w-3" />
                Error
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
                    <Activity className="h-5 w-5" />
                    <CardTitle>Distributed Traces</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                {traces.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No traces found</div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Trace ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Spans</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Start Time</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {traces.map((trace) => (
                                <TableRow key={trace.id}>
                                    <TableCell className="font-mono text-sm">{trace.id}</TableCell>
                                    <TableCell className="font-medium">{trace.name}</TableCell>
                                    <TableCell>{trace.duration}ms</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{trace.spans.length}</Badge>
                                    </TableCell>
                                    <TableCell>{getStatusBadge(trace.status)}</TableCell>
                                    <TableCell>
                                        {format(new Date(trace.startTime), 'MMM dd, HH:mm:ss')}
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
