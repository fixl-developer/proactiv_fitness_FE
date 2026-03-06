'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin } from 'lucide-react';
import type { ChildSchedule } from '@/types/advanced';

interface ChildScheduleCardProps {
    schedule: ChildSchedule;
}

export default function ChildScheduleCard({ schedule }: ChildScheduleCardProps) {
    const groupedByDay = schedule.classes.reduce((acc, classItem) => {
        if (!acc[classItem.day]) {
            acc[classItem.day] = [];
        }
        acc[classItem.day].push(classItem);
        return acc;
    }, {} as Record<string, typeof schedule.classes>);

    const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarFallback>
                            {schedule.childName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle>{schedule.childName}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            {schedule.classes.length} classes per week
                        </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {daysOrder.map((day) => {
                        const dayClasses = groupedByDay[day];
                        if (!dayClasses) return null;

                        return (
                            <div key={day}>
                                <h3 className="font-semibold mb-2">{day}</h3>
                                <div className="space-y-2">
                                    {dayClasses.map((classItem) => (
                                        <div
                                            key={classItem.id}
                                            className="p-3 border rounded-lg bg-muted/50"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <h4 className="font-medium">{classItem.name}</h4>
                                                <Badge variant="outline">
                                                    {classItem.startTime}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    <span>
                                                        {classItem.startTime} - {classItem.endTime}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    <span>{classItem.location}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
