'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { XCircle, AlertTriangle, Info, ChevronDown, ChevronUp } from 'lucide-react';

interface ErrorEvent {
    id: string;
    message: string;
    type: 'error' | 'warning' | 'info';
    count: number;
    lastOccurred: string;
    stackTrace?: string;
    affectedUsers: number;
}

const sampleErrors: ErrorEvent[] = [
    {
        id: '1',
        message: 'Failed to fetch user data',
        type: 'error',
        count: 45,
        lastOccurred: new Date().toISOString(),
        stackTrace: 'Error: Failed to fetch\n  at fetchUserData (api.ts:123)\n  at UserProfile (profile.tsx:45)',
        affectedUsers: 12,
    },
    {
        id: '2',
        message: 'Slow database query detected',
        type: 'warning',
        count: 23,
        lastOccurred: new Date().toISOString(),
        affectedUsers: 8,
    },
    {
        id: '3',
        message: 'Cache miss rate above threshold',
        type: 'info',
        count: 156,
        lastOccurred: new Date().toISOString(),
        affectedUsers: 45,
    },
];

export default function ErrorTracking() {
    const [errors] = useState<ErrorEvent[]>(sampleErrors);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const getTypeIcon = (type: ErrorEvent['type']) => {
        switch (type) {
            case 'error':
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'warning':
                return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
            case 'info':
                return <Info className="h-4 w-4 text-blue-500" />;
        }
    };

    const getTypeBadge = (type: ErrorEvent['type']) => {
        const variants = {
            error: 'destructive' as const,
            warning: 'secondary' as const,
            info: 'default' as const,
        };

        return (
            <Badge variant={variants[type]} className="flex items-center gap-1 w-fit">
                {getTypeIcon(type)}
                {type.toUpperCase()}
            </Badge>
        );
    };

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Error Tracking</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {errors.map((error) => (
                        <div key={error.id} className="border rounded-lg">
                            <div className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            {getTypeBadge(error.type)}
                                            <Badge variant="outline">{error.count} occurrences</Badge>
                                            <Badge variant="outline">
                                                {error.affectedUsers} users affected
                                            </Badge>
                                        </div>
                                        <p className="font-medium">{error.message}</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Last occurred:{' '}
                                            {new Date(error.lastOccurred).toLocaleString()}
                                        </p>
                                    </div>
                                    {error.stackTrace && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleExpand(error.id)}
                                        >
                                            {expandedId === error.id ? (
                                                <ChevronUp className="h-4 w-4" />
                                            ) : (
                                                <ChevronDown className="h-4 w-4" />
                                            )}
                                        </Button>
                                    )}
                                </div>

                                {expandedId === error.id && error.stackTrace && (
                                    <div className="mt-4 p-3 bg-muted rounded-md">
                                        <p className="text-sm font-medium mb-2">Stack Trace:</p>
                                        <pre className="text-xs overflow-x-auto">
                                            {error.stackTrace}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {errors.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        No errors tracked
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
