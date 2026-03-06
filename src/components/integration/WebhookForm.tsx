'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { createWebhook } from '@/lib/api/integration';
import { toast } from 'sonner';

const AVAILABLE_EVENTS = [
    'student.created',
    'student.updated',
    'booking.created',
    'booking.cancelled',
    'payment.completed',
    'payment.failed',
    'class.created',
    'class.cancelled',
];

export default function WebhookForm() {
    const [url, setUrl] = useState('');
    const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);

    const handleEventToggle = (event: string) => {
        setSelectedEvents((prev) =>
            prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!url.trim()) {
            toast.error('Please enter webhook URL');
            return;
        }

        if (selectedEvents.length === 0) {
            toast.error('Please select at least one event');
            return;
        }

        try {
            setSubmitting(true);
            await createWebhook({
                url,
                events: selectedEvents,
                secret: Math.random().toString(36).substring(2),
                enabled: true,
            });
            toast.success('Webhook created successfully');
            setUrl('');
            setSelectedEvents([]);
        } catch (error) {
            toast.error('Failed to create webhook');
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Add Webhook</CardTitle>
                <CardDescription>Configure a new webhook endpoint</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="url">Webhook URL</Label>
                        <Input
                            id="url"
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com/webhook"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Events to Subscribe</Label>
                        <div className="space-y-2">
                            {AVAILABLE_EVENTS.map((event) => (
                                <div key={event} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={event}
                                        checked={selectedEvents.includes(event)}
                                        onCheckedChange={() => handleEventToggle(event)}
                                    />
                                    <Label htmlFor={event} className="cursor-pointer">
                                        {event}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Button type="submit" disabled={submitting} className="w-full">
                        {submitting ? 'Creating...' : 'Create Webhook'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
