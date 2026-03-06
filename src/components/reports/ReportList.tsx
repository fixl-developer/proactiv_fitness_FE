'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Play, Edit, Trash2, Download } from 'lucide-react';
import type { Report } from '@/types/reporting';

interface ReportListProps {
    reports: Report[];
    onRun: (reportId: string) => void;
    onEdit: (report: Report) => void;
    onDelete: (reportId: string) => void;
}

export default function ReportList({ reports, onRun, onEdit, onDelete }: ReportListProps) {
    const getTypeColor = (type: string) => {
        switch (type) {
            case 'revenue':
                return 'bg-green-100 text-green-800';
            case 'student':
                return 'bg-blue-100 text-blue-800';
            case 'attendance':
                return 'bg-purple-100 text-purple-800';
            case 'staff':
                return 'bg-orange-100 text-orange-800';
            case 'custom':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'draft':
                return 'bg-yellow-100 text-yellow-800';
            case 'archived':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Reports ({reports.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {reports.map((report) => (
                        <div
                            key={report.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-semibold">{report.name}</h3>
                                    <Badge className={getTypeColor(report.type)}>
                                        {report.type}
                                    </Badge>
                                    <Badge className={getStatusColor(report.status)}>
                                        {report.status}
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                    {report.description}
                                </p>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <span>Format: {report.format.toUpperCase()}</span>
                                    <span>Filters: {report.filters.length}</span>
                                    <span>Columns: {report.columns.length}</span>
                                    {report.lastRunAt && (
                                        <span>
                                            Last run: {new Date(report.lastRunAt).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onRun(report.id)}
                                >
                                    <Play className="h-4 w-4 mr-1" />
                                    Run
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onEdit(report)}
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onDelete(report.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
