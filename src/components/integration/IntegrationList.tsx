'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getIntegrations, deleteIntegration } from '@/lib/api/integration';
import type { Integration } from '@/types/integration';
import { Plus, Settings, Trash2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function IntegrationList() {
    const router = useRouter();
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadIntegrations();
    }, []);

    const loadIntegrations = async () => {
        try {
            const data = await getIntegrations();
            setIntegrations(data);
        } catch (error) {
            toast.error('Failed to load integrations');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this integration?')) return;

        try {
            await deleteIntegration(id);
            setIntegrations(integrations.filter((i) => i.id !== id));
            toast.success('Integration deleted successfully');
        } catch (error) {
            toast.error('Failed to delete integration');
            console.error(error);
        }
    };

    const getStatusIcon = (status: Integration['status']) => {
        switch (status) {
            case 'active':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'inactive':
                return <AlertCircle className="h-4 w-4 text-yellow-500" />;
            case 'error':
                return <XCircle className="h-4 w-4 text-red-500" />;
        }
    };

    if (loading) {
        return <div className="animate-pulse h-64 bg-muted rounded-lg"></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Integrations</h2>
                    <p className="text-muted-foreground">Manage your third-party integrations</p>
                </div>
                <Button onClick={() => router.push('/dashboard/integrations/new')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Integration
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {integrations.map((integration) => (
                    <Card key={integration.id}>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="capitalize">{integration.name}</CardTitle>
                                    <CardDescription className="capitalize">
                                        {integration.type}
                                    </CardDescription>
                                </div>
                                <Badge
                                    variant={
                                        integration.status === 'active' ? 'default' : 'secondary'
                                    }
                                    className="flex items-center gap-1"
                                >
                                    {getStatusIcon(integration.status)}
                                    {integration.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() =>
                                        router.push(`/dashboard/integrations/${integration.id}`)
                                    }
                                >
                                    <Settings className="h-4 w-4 mr-2" />
                                    Configure
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDelete(integration.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {integrations.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">No integrations configured yet</p>
                </div>
            )}
        </div>
    );
}
