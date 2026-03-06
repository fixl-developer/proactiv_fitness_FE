'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { createIntegration, updateIntegration } from '@/lib/api/integration';
import type { Integration } from '@/types/integration';
import { toast } from 'sonner';

interface IntegrationFormProps {
    integration?: Integration;
    onSave: (integration: Integration) => void;
}

export default function IntegrationForm({ integration, onSave }: IntegrationFormProps) {
    const [name, setName] = useState(integration?.name || '');
    const [type, setType] = useState<Integration['type']>(integration?.type || 'custom');
    const [config, setConfig] = useState<Record<string, string>>(integration?.config || {});
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error('Please enter integration name');
            return;
        }

        try {
            setSubmitting(true);
            const data = {
                name,
                type,
                status: 'active' as const,
                config,
            };

            const saved = integration
                ? await updateIntegration(integration.id, data)
                : await createIntegration(data);

            toast.success(`Integration ${integration ? 'updated' : 'created'} successfully`);
            onSave(saved);
        } catch (error) {
            toast.error('Failed to save integration');
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{integration ? 'Edit' : 'Add'} Integration</CardTitle>
                <CardDescription>Configure your integration settings</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Integration Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="My Integration"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="type">Integration Type</Label>
                        <Select value={type} onValueChange={(value: any) => setType(value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="stripe">Stripe</SelectItem>
                                <SelectItem value="mailchimp">Mailchimp</SelectItem>
                                <SelectItem value="zapier">Zapier</SelectItem>
                                <SelectItem value="slack">Slack</SelectItem>
                                <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="apiKey">API Key</Label>
                        <Input
                            id="apiKey"
                            type="password"
                            value={config.apiKey || ''}
                            onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                            placeholder="Enter API key"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="apiSecret">API Secret</Label>
                        <Input
                            id="apiSecret"
                            type="password"
                            value={config.apiSecret || ''}
                            onChange={(e) => setConfig({ ...config, apiSecret: e.target.value })}
                            placeholder="Enter API secret"
                        />
                    </div>

                    <Button type="submit" disabled={submitting} className="w-full">
                        {submitting ? 'Saving...' : 'Save Integration'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
