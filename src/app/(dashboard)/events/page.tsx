'use client';

import React from 'react';
import EventLogViewer from '@/components/events/EventLogViewer';

export default function EventsPage() {
    return (
        <div className="container mx-auto py-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Event Logs</h1>
                <p className="text-muted-foreground">
                    Monitor and replay system events
                </p>
            </div>

            <EventLogViewer />
        </div>
    );
}
