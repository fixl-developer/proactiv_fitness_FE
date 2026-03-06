'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DeletionRequestForm from '@/components/data-management/DeletionRequestForm';
import DeletionHistory from '@/components/data-management/DeletionHistory';

export default function DataDeletionPage() {
    return (
        <div className="container mx-auto py-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Data Deletion</h1>
                <p className="text-muted-foreground">
                    Request deletion of your personal data (Right to be Forgotten)
                </p>
            </div>

            <Tabs defaultValue="request">
                <TabsList>
                    <TabsTrigger value="request">New Request</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                <TabsContent value="request" className="mt-6">
                    <DeletionRequestForm />
                </TabsContent>

                <TabsContent value="history" className="mt-6">
                    <DeletionHistory />
                </TabsContent>
            </Tabs>
        </div>
    );
}
