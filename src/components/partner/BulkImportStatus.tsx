'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import type { BulkImport } from '@/types/enterprise';

interface BulkImportStatusProps {
    imports: BulkImport[];
}

export default function BulkImportStatus({ imports }: BulkImportStatusProps) {
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'failed':
                return <XCircle className="h-5 w-5 text-red-500" />;
            case 'processing':
                return <AlertCircle className="h-5 w-5 text-yellow-500" />;
            default:
                return <Upload className="h-5 w-5" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            case 'processing':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Bulk Import History
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {imports.map((importItem) => {
                        const successRate =
                            (importItem.successCount / importItem.totalRecords) * 100;

                        return (
                            <div key={importItem.id} className="p-4 border rounded-lg">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(importItem.status)}
                                        <div>
                                            <h3 className="font-semibold">{importItem.fileName}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Uploaded:{' '}
                                                {new Date(importItem.uploadedAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge className={getStatusColor(importItem.status)}>
                                        {importItem.status}
                                    </Badge>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span>Progress</span>
                                        <span className="font-medium">
                                            {importItem.successCount + importItem.failureCount} /{' '}
                                            {importItem.totalRecords}
                                        </span>
                                    </div>
                                    <Progress value={successRate} />

                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <div className="text-center p-2 bg-muted rounded">
                                            <p className="font-bold">{importItem.totalRecords}</p>
                                            <p className="text-xs text-muted-foreground">Total</p>
                                        </div>
                                        <div className="text-center p-2 bg-green-50 rounded">
                                            <p className="font-bold text-green-600">
                                                {importItem.successCount}
                                            </p>
                                            <p className="text-xs text-muted-foreground">Success</p>
                                        </div>
                                        <div className="text-center p-2 bg-red-50 rounded">
                                            <p className="font-bold text-red-600">
                                                {importItem.failureCount}
                                            </p>
                                            <p className="text-xs text-muted-foreground">Failed</p>
                                        </div>
                                    </div>

                                    {importItem.errors.length > 0 && (
                                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                                            <p className="text-xs font-medium text-red-800 mb-1">
                                                Errors:
                                            </p>
                                            <ul className="text-xs text-red-600 space-y-1">
                                                {importItem.errors.slice(0, 3).map((error, index) => (
                                                    <li key={index}>• {error}</li>
                                                ))}
                                                {importItem.errors.length > 3 && (
                                                    <li>
                                                        • And {importItem.errors.length - 3} more...
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
