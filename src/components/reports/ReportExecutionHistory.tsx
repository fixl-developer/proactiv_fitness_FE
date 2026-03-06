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
import { getReportExecutions, downloadReport } from '@/lib/api/reporting';
import type { ReportExecution } from '@/types/reporting';
import { Download, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ReportExecutionHistoryProps {
    reportId: string;
}

export default function ReportExecutionHistory({ reportId }: ReportExecutionHistoryProps) {
    const [executions, setExecutions] = useState<ReportExecution[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    useEffect(() => {
        loadExecutions();
        const interval = setInterval(loadExecutions, 10000); // Refresh every 10 seconds
        return () => clearInterval(interval);
    }, [reportId]);

    const loadExecutions = async () => {
        try {
            const data = await getReportExecutions(reportId);
            setExecutions(data);
        } catch (error) {
            console.error('Failed to load execution history:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (executionId: string) => {
        try {
            setDownloadingId(executionId);
            const blob = await downloadReport(executionId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `report-${executionId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success('Report downloaded successfully');
        } catch (error) {
            toast.error('Failed to download report');
            console.error(error);
        } finally {
            setDownloadingId(null);
        }
    };

    const getStatusIcon = (status: ReportExecution['status']) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'failed':
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'running':
                return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
            case 'pending':
                return <Clock className="h-4 w-4 text-yellow-500" />;
        }
    };

    const getStatusBadge = (status: ReportExecution['status']) => {
        const variants: Record<ReportExecution['status'], 'default' | 'secondary' | 'destructive'> = {
            completed: 'default',
            failed: 'destructive',
            running: 'secondary',
            pending: 'secondary',
        };

        return (
            <Badge variant={variants[status]} className="flex items-center gap-1">
                {getStatusIcon(status)}
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Execution History</CardTitle>
            </CardHeader>
            <CardContent>
                {executions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        No execution history available
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Started At</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Rows</TableHead>
                                <TableHead>Actions</TableHead>
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
                                        {execution.rowCount?.toLocaleString() || '-'}
                                    </TableCell>
                                    <TableCell>
                                        {execution.status === 'completed' && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleDownload(execution.id)}
                                                disabled={downloadingId === execution.id}
                                            >
                                                {downloadingId === execution.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Download className="h-4 w-4" />
                                                )}
                                            </Button>
                                        )}
                                        {execution.status === 'failed' && execution.error && (
                                            <span className="text-sm text-red-500">
                                                {execution.error}
                                            </span>
                                        )}
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
