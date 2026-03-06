'use client';

import React from 'react';
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
import type { WebhookDelivery } from '@/types/integration';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface WebhookDeliveryStatusProps {
    deliveries: WebhookDelivery[];
}

export default function WebhookDeliveryStatus({ deliveries }: WebhookDeliveryStatusProps) {
    const getStatusIcon = (status: WebhookDelivery['status']) => {
        switch (status) {
            case 'delivered':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'failed':
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'pending':
                return <Clock className="h-4 w-4 text-yellow-500" />;
        }
    };

    const getStatusBadge = (status: WebhookDelivery['status']) => {
        const variants = {
            delivered: 'default' as const,
            failed: 'destructive' as const,
            pending: 'secondary' as const,
        };

        return (
            <Badge variant={variants[status]} className="flex items-center gap-1 w-fit">
                {getStatusIcon(status)}
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Webhook Deliveries</CardTitle>
            </CardHeader>
            <CardContent>
                {deliveries.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        No webhook deliveries
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Webhook ID</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Attempts</TableHead>
                                <TableHead>Last Attempt</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {deliveries.map((delivery, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-mono text-sm">
                                        {delivery.webhookId}
                                    </TableCell>
                                    <TableCell>{getStatusBadge(delivery.status)}</TableCell>
                                    <TableCell>{delivery.attempts}</TableCell>
                                    <TableCell>
                                        {format(new Date(delivery.lastAttemptAt), 'MMM dd, HH:mm')}
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
