'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Calendar } from 'lucide-react';

interface ProgressReport {
    id: string;
    title: string;
    period: string;
    generatedDate: string;
    type: 'monthly' | 'quarterly' | 'annual';
}

interface ProgressReportsProps {
    reports: ProgressReport[];
    onDownload: (reportId: string) => void;
    onGenerate: () => void;
}

export default function ProgressReports({
    reports,
    onDownload,
    onGenerate,
}: ProgressReportsProps) {
    const getTypeColor = (type: string) => {
        switch (type) {
            case 'monthly':
                return 'bg-blue-100 text-blue-800';
            case 'quarterly':
                return 'bg-purple-100 text-purple-800';
            case 'annual':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Progress Reports
                    </CardTitle>
                    <Button onClick={onGenerate}>Generate New Report</Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {reports.map((report) => (
                        <div
                            key={report.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                        >
                            <div>
                                <h3 className="font-semibold">{report.title}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge className={getTypeColor(report.type)}>
                                        {report.type}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                        {report.period}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>
                                        Generated: {new Date(report.generatedDate).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onDownload(report.id)}
                            >
                                <Download className="h-4 w-4 mr-1" />
                                Download
                            </Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
