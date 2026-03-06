'use client';

import React, { useEffect, useState } from 'react';
import FamilyCalendar from '@/components/parent/FamilyCalendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon } from 'lucide-react';
import { getFamilyCalendar } from '@/lib/api/parent';
import type { FamilyCalendarEvent } from '@/types/parent';
import { useToast } from '@/hooks/use-toast';

export default function FamilyCalendarPage() {
    const { toast } = useToast();
    const [events, setEvents] = useState<FamilyCalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);

    const parentId = 'current-parent-id'; // Get from auth context

    useEffect(() => {
        fetchCalendar();
    }, []);

    const fetchCalendar = async () => {
        try {
            const startDate = new Date();
            startDate.setMonth(startDate.getMonth() - 1);
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + 2);

            const data = await getFamilyCalendar(
                parentId,
                startDate.toISOString(),
                endDate.toISOString()
            );
            setEvents(data);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load calendar',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-8">Loading...</div>;
    }

    const upcomingEvents = events
        .filter((e) => new Date(e.startDate) >= new Date())
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
        .slice(0, 5);

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Family Calendar</h1>
                <p className="text-muted-foreground">
                    View all classes and events for your children
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <FamilyCalendar events={events} />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5" />
                            Upcoming Events
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {upcomingEvents.map((event) => (
                                <div key={event.id} className="p-3 border rounded-lg">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-semibold">{event.title}</h3>
                                        <Badge variant="outline">{event.type}</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-1">
                                        {event.childName}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(event.startDate).toLocaleString()}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {event.location}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
