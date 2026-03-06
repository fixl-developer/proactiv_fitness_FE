'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ExportRequestForm from '@/components/data-management/ExportRequestForm';
import ExportHistory from '@/components/data-management/ExportHistory';

export default function DataExportPage() {
    return (
        <div className="container mx-auto py-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Data Export</h1>
                <p className="text-muted-foreground">
                    Export your personal data in compliance with GDPR regulations
                </p>
            </div>

            <Tabs defaultValue="request">
                <TabsList>
                    <TabsTrigger value="request">New Request</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                <TabsContent value="request" className="mt-6">
                    <ExportRequestForm />
                </TabsContent>

                <TabsContent value="history" className="mt-6">
                    <ExportHistory />
                </TabsContent>
            </Tabs>
        </div>
    );
}
