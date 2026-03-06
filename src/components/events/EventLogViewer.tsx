'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { getEventLogs, replayEvent } from '@/lib/api/integration';
import type { EventLog } from '@/types/integration';
import { Search, RotateCcw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function EventLogViewer() {
    const [events, setEvents] = useState<EventLog[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<EventLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [replayingId, setReplayingId] = useState<string | null>(null);

    useEffect(() => {
        loadEvents();
        const interval = setInterval(loadEvents, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        filterEvents();
    }, [searchQuery, events]);

    const loadEvents = async () => {
        try {
            const data = await getEventLogs();
            setEvents(data);
        } catch (error) {
            console.error('Failed to load events:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterEvents = () => {
        if (!searchQuery) {
            setFilteredEvents(events);
            return;
        }

        const filtered = events.filter((event) =>
            event.event.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredEvents(filtered);
    };

    const handleReplay = async (eventId: string) => {
        try {
            setReplayingId(eventId);
            await replayEvent(eventId);
            toast.success('Event replayed successfully');
        } catch (error) {
            toast.error('Failed to replay event');
            console.error(error);
        } finally {
            setReplayingId(null);
        }
    };

    const getDeliveryStatus = (event: EventLog) => {
        const delivered = event.webhookDeliveries.filter((d) => d.status === 'delivered').length;
        const failed = event.webhookDeliveries.filter((d) => d.status === 'failed').length;
        const pending = event.webhookDeliveries.filter((d) => d.status === 'pending').length;

        return { delivered, failed, pending };
    };

    if (loading) {
        return <div className="animate-pulse h-64 bg-muted rounded-lg"></div>;
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Event Logs</CardTitle>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search events..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {filteredEvents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No events found</div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Event</TableHead>
                                <TableHead>Timestamp</TableHead>
                                <TableHead>Webhooks</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredEvents.map((event) => {
                                const { delivered, failed, pending } = getDeliveryStatus(event);
                                return (
                                    <TableRow key={event.id}>
                                        <TableCell className="font-medium">{event.event}</TableCell>
                                        <TableCell>
                                            {format(new Date(event.timestamp), 'MMM dd, HH:mm:ss')}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                {delivered > 0 && (
                                                    <Badge variant="default" className="gap-1">
                                                        <CheckCircle className="h-3 w-3" />
                                                        {delivered}
                                                    </Badge>
                                                )}
                                                {failed > 0 && (
                                                    <Badge variant="destructive" className="gap-1">
                                                        <XCircle className="h-3 w-3" />
                                                        {failed}
                                                    </Badge>
                                                )}
                                                {pending > 0 && (
                                                    <Badge variant="secondary" className="gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {pending}
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={event.processed ? 'default' : 'secondary'}>
                                                {event.processed ? 'Processed' : 'Pending'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleReplay(event.id)}
                                                disabled={replayingId === event.id}
                                            >
                                                <RotateCcw className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
