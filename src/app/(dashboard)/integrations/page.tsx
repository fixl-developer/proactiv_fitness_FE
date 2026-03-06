'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import IntegrationList from '@/components/integration/IntegrationList';
import WebhookList from '@/components/integration/WebhookList';
import ApiKeyList from '@/components/integration/ApiKeyList';

export default function IntegrationsPage() {
    return (
        <div className="container mx-auto py-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Integrations</h1>
                <p className="text-muted-foreground">
                    Manage third-party integrations, webhooks, and API keys
                </p>
            </div>

            <Tabs defaultValue="integrations">
                <TabsList>
                    <TabsTrigger value="integrations">Integrations</TabsTrigger>
                    <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
                    <TabsTrigger value="api-keys">API Keys</TabsTrigger>
                </TabsList>

                <TabsContent value="integrations" className="mt-6">
                    <IntegrationList />
                </TabsContent>

                <TabsContent value="webhooks" className="mt-6">
                    <WebhookList />
                </TabsContent>

                <TabsContent value="api-keys" className="mt-6">
                    <ApiKeyList />
                </TabsContent>
            </Tabs>
        </div>
    );
}
