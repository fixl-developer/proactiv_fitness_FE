'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity as ActivityIcon } from 'lucide-react';
import type { Activity } from '@/types/parent';

interface RecentActivityProps {
    activities: Activity[];
}

export default function RecentActivity({ activities }: RecentActivityProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ActivityIcon className="h-5 w-5" />
                    Recent Activity
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {activities.map((activity, index) => (
                        <div key={activity.id} className="flex gap-3">
                            <div className="relative">
                                <div className="text-2xl">{activity.icon}</div>
                                {index < activities.length - 1 && (
                                    <div className="absolute left-1/2 top-8 w-0.5 h-8 bg-border -translate-x-1/2" />
                                )}
                            </div>
                            <div className="flex-1 pb-4">
                                <h3 className="font-semibold">{activity.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {activity.description}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {new Date(activity.date).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
