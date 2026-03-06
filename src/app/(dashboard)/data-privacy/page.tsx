'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RetentionPolicies from '@/components/data-management/RetentionPolicies';
import DataInventory from '@/components/data-management/DataInventory';
import AnonymizationLogs from '@/components/data-management/AnonymizationLogs';

export default function DataPrivacyPage() {
    return (
        <div className="container mx-auto py-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Data Privacy & Compliance</h1>
                <p className="text-muted-foreground">
                    Manage data retention policies and view compliance logs
                </p>
            </div>

            <Tabs defaultValue="policies">
                <TabsList>
                    <TabsTrigger value="policies">Retention Policies</TabsTrigger>
                    <TabsTrigger value="inventory">Data Inventory</TabsTrigger>
                    <TabsTrigger value="logs">Anonymization Logs</TabsTrigger>
                </TabsList>

                <TabsContent value="policies" className="mt-6">
                    <RetentionPolicies />
                </TabsContent>

                <TabsContent value="inventory" className="mt-6">
                    <DataInventory />
                </TabsContent>

                <TabsContent value="logs" className="mt-6">
                    <AnonymizationLogs />
                </TabsContent>
            </Tabs>
        </div>
    );
}
