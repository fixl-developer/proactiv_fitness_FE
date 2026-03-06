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
import { getWorkflowExecutions } from '@/lib/api/integration';
import type { WorkflowExecution } from '@/types/integration';
import { Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface WorkflowExecutionHistoryProps {
    workflowId: string;
}

export default function WorkflowExecutionHistory({ workflowId }: WorkflowExecutionHistoryProps) {
    const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadExecutions();
        const interval = setInterval(loadExecutions, 10000);
        return () => clearInterval(interval);
    }, [workflowId]);

    const loadExecutions = async () => {
        try {
            const data = await getWorkflowExecutions(workflowId);
            setExecutions(data);
        } catch (error) {
            console.error('Failed to load executions:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: WorkflowExecution['status']) => {
        const config = {
            pending: { variant: 'secondary' as const, icon: Clock, color: 'text-yellow-500' },
            running: { variant: 'secondary' as const, icon: Loader2, color: 'text-blue-500' },
            completed: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-500' },
            failed: { variant: 'destructive' as const, icon: XCircle, color: 'text-red-500' },
        };

        const { variant, icon: Icon, color } = config[status];

        return (
            <Badge variant={variant} className="flex items-center gap-1 w-fit">
                <Icon className={`h-3 w-3 ${color} ${status === 'running' ? 'animate-spin' : ''}`} />
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
                <CardTitle>Execution History</CardTitle>
            </CardHeader>
            <CardContent>
                {executions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        No execution history
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Started At</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Logs</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {executions.map((execution) => (
                                <TableRow key={execution.id}>
                                    <TableCell>
                                        {format(new Date(execution.startedAt), 'MMM dd, yyyy HH:mm')}
                                    </TableCell>
                                    <TableCell>{getStatusBadge(execution.status)}</TableCell>
                                    <TableCell>
                                        {execution.completedAt
                                            ? `${Math.round(
                                                (new Date(execution.completedAt).getTime() -
                                                    new Date(execution.startedAt).getTime()) /
                                                1000
                                            )}s`
                                            : '-'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{execution.logs.length} logs</Badge>
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
