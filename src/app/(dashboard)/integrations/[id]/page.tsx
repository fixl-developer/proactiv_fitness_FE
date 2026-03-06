'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import IntegrationForm from '@/components/integration/IntegrationForm';
import IntegrationHealth from '@/components/integration/IntegrationHealth';
import IntegrationLogs from '@/components/integration/IntegrationLogs';
import { getIntegration } from '@/lib/api/integration';
import type { Integration } from '@/types/integration';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function IntegrationDetailPage() {
    const params = useParams();
    const router = useRouter();
    const integrationId = params.id as string;

    const [integration, setIntegration] = useState<Integration | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (integrationId && integrationId !== 'new') {
            loadIntegration();
        } else {
            setLoading(false);
        }
    }, [integrationId]);

    const loadIntegration = async () => {
        try {
            const data = await getIntegration(integrationId);
            setIntegration(data);
        } catch (error) {
            toast.error('Failed to load integration');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">
                        {integration?.name || 'New Integration'}
                    </h1>
                    <p className="text-muted-foreground capitalize">{integration?.type}</p>
                </div>
            </div>

            {integration ? (
                <Tabs defaultValue="settings">
                    <TabsList>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                        <TabsTrigger value="health">Health</TabsTrigger>
                        <TabsTrigger value="logs">Logs</TabsTrigger>
                    </TabsList>

                    <TabsContent value="settings" className="mt-6">
                        <IntegrationForm
                            integration={integration}
                            onSave={(updated) => setIntegration(updated)}
                        />
                    </TabsContent>

                    <TabsContent value="health" className="mt-6">
                        <IntegrationHealth integrationId={integration.id} />
                    </TabsContent>

                    <TabsContent value="logs" className="mt-6">
                        <IntegrationLogs integrationId={integration.id} />
                    </TabsContent>
                </Tabs>
            ) : (
                <IntegrationForm onSave={(created) => router.push(`/dashboard/integrations/${created.id}`)} />
            )}
        </div>
    );
}
