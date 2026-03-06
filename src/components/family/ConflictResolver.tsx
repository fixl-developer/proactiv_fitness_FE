'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import type { ScheduleConflict } from '@/types/advanced';

interface ConflictResolverProps {
    conflicts: ScheduleConflict[];
    onResolve: (conflictIndex: number) => void;
}

export default function ConflictResolver({ conflicts, onResolve }: ConflictResolverProps) {
    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'high':
                return <AlertTriangle className="h-5 w-5 text-red-500" />;
            case 'medium':
                return <AlertTriangle className="h-5 w-5 text-orange-500" />;
            case 'low':
                return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
            default:
                return null;
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'medium':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'low':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    if (conflicts.length === 0) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">No conflicts detected</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Resolve Conflicts ({conflicts.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {conflicts.map((conflict, index) => (
                        <div
                            key={index}
                            className={`p-4 border rounded-lg ${getSeverityColor(
                                conflict.severity
                            )}`}
                        >
                            <div className="flex items-start gap-3">
                                {getSeverityIcon(conflict.severity)}
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <Badge variant="outline" className="mb-2">
                                                {conflict.type.replace('_', ' ')}
                                            </Badge>
                                            <p className="text-sm font-medium">
                                                {conflict.description}
                                            </p>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => onResolve(index)}
                                        >
                                            Resolve
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Affected classes: {conflict.affectedClasses.join(', ')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
