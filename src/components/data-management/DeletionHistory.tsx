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
import { getDeletionRequests, downloadDeletionCertificate } from '@/lib/api/dataManagement';
import type { DataDeletionRequest } from '@/types/dataManagement';
import { Download, Clock, CheckCircle, XCircle, Loader2, FileCheck } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function DeletionHistory() {
    const [requests, setRequests] = useState<DataDeletionRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    useEffect(() => {
        loadRequests();
        const interval = setInterval(loadRequests, 10000);
        return () => clearInterval(interval);
    }, []);

    const loadRequests = async () => {
        try {
            const data = await getDeletionRequests();
            setRequests(data);
        } catch (error) {
            console.error('Failed to load deletion requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadCertificate = async (requestId: string) => {
        try {
            setDownloadingId(requestId);
            const blob = await downloadDeletionCertificate(requestId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `deletion-certificate-${requestId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success('Certificate downloaded successfully');
        } catch (error) {
            toast.error('Failed to download certificate');
            console.error(error);
        } finally {
            setDownloadingId(null);
        }
    };

    const getStatusBadge = (status: DataDeletionRequest['status']) => {
        const config = {
            pending: { variant: 'secondary' as const, icon: Clock, color: 'text-yellow-500' },
            approved: { variant: 'default' as const, icon: CheckCircle, color: 'text-blue-500' },
            processing: { variant: 'secondary' as const, icon: Loader2, color: 'text-blue-500' },
            completed: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-500' },
            rejected: { variant: 'destructive' as const, icon: XCircle, color: 'text-red-500' },
        };

        const { variant, icon: Icon, color } = config[status];

        return (
            <Badge variant={variant} className="flex items-center gap-1 w-fit">
                <Icon className={`h-3 w-3 ${color}`} />
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
                <CardTitle>Deletion History</CardTitle>
            </CardHeader>
            <CardContent>
                {requests.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        No deletion requests found
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Requested At</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {requests.map((request) => (
                                <TableRow key={request.id}>
                                    <TableCell>
                                        {format(new Date(request.requestedAt), 'MMM dd, yyyy HH:mm')}
                                    </TableCell>
                                    <TableCell className="capitalize">{request.type}</TableCell>
                                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                                    <TableCell className="max-w-xs truncate">
                                        {request.reason}
                                    </TableCell>
                                    <TableCell>
                                        {request.status === 'completed' && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleDownloadCertificate(request.id)}
                                                disabled={downloadingId === request.id}
                                            >
                                                {downloadingId === request.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <FileCheck className="h-4 w-4" />
                                                )}
                                            </Button>
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
