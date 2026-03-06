'use client';

import React, { useEffect, useState } from 'react';
import FamilyScheduleOptimizer from '@/components/family/FamilyScheduleOptimizer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Clock } from 'lucide-react';
import { getFamilySchedule, optimizeFamilySchedule } from '@/lib/api/advanced';
import type { FamilySchedule } from '@/types/advanced';
import { useToast } from '@/hooks/use-toast';

export default function FamilySchedulePage() {
    const { toast } = useToast();
    const [schedule, setSchedule] = useState<FamilySchedule | null>(null);
    const [loading, setLoading] = useState(true);

    const familyId = 'current-family-id'; // Get from auth context

    useEffect(() => {
        fetchSchedule();
    }, []);

    const fetchSchedule = async () => {
        try {
            const data = await getFamilySchedule(familyId);
            setSchedule(data);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load family schedule',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleOptimize = async () => {
        try {
            const optimized = await optimizeFamilySchedule(familyId);
            setSchedule(optimized);
            toast({
                title: 'Success',
                description: 'Schedule optimized successfully',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to optimize schedule',
                variant: 'destructive',
            });
        }
    };

    if (loading || !schedule) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Family Schedule Optimizer</h1>
                <p className="text-muted-foreground">
                    Optimize your family's class schedule for convenience
                </p>
            </div>

            <FamilyScheduleOptimizer schedule={schedule} onOptimize={handleOptimize} />

            <div className="grid gap-6 lg:grid-cols-2">
                {schedule.children.map((child) => (
                    <Card key={child.childId}>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarFallback>
                                        {child.childName.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <CardTitle>{child.childName}'s Schedule</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {child.classes.map((classItem) => (
                                    <div
                                        key={classItem.id}
                                        className="flex items-center justify-between p-3 border rounded-lg"
                                    >
                                        <div>
                                            <p className="font-medium">{classItem.name}</p>
                                            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>{classItem.day}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    <span>
                                                        {classItem.startTime} - {classItem.endTime}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
