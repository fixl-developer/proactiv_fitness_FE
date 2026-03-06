'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, MapPin, Clock, Users } from 'lucide-react';
import type { FamilySchedule, ScheduleConflict } from '@/types/advanced';

interface FamilyScheduleOptimizerProps {
    schedule: FamilySchedule;
    onOptimize: () => void;
}

export default function FamilyScheduleOptimizer({
    schedule,
    onOptimize,
}: FamilyScheduleOptimizerProps) {
    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high':
                return 'bg-red-100 text-red-800';
            case 'medium':
                return 'bg-orange-100 text-orange-800';
            case 'low':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Schedule Optimization</CardTitle>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                                Score: {schedule.optimizationScore}/100
                            </Badge>
                            <Button onClick={onOptimize}>Optimize Schedule</Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="p-4 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Users className="h-5 w-5 text-blue-500" />
                                <span className="font-semibold">Children</span>
                            </div>
                            <p className="text-2xl font-bold">{schedule.children.length}</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="h-5 w-5 text-orange-500" />
                                <span className="font-semibold">Conflicts</span>
                            </div>
                            <p className="text-2xl font-bold">{schedule.conflicts.length}</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <span className="font-semibold">Carpool Opportunities</span>
                            </div>
                            <p className="text-2xl font-bold">
                                {schedule.carpoolOpportunities.length}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {schedule.conflicts.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            Schedule Conflicts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {schedule.conflicts.map((conflict, index) => (
                                <div key={index} className="p-3 border rounded-lg">
                                    <div className="flex items-start justify-between mb-2">
                                        <Badge className={getSeverityColor(conflict.severity)}>
                                            {conflict.severity} severity
                                        </Badge>
                                        <Badge variant="outline">{conflict.type}</Badge>
                                    </div>
                                    <p className="text-sm">{conflict.description}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {schedule.carpoolOpportunities.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Carpool Opportunities
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {schedule.carpoolOpportunities.map((opportunity, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 border rounded-lg"
                                >
                                    <div>
                                        <p className="font-medium">{opportunity.location}</p>
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                <span>{opportunity.time}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Users className="h-3 w-3" />
                                                <span>{opportunity.children.length} children</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                                        Save AED {opportunity.potentialSavings}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
