'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { getWebhooks, updateWebhook, deleteWebhook } from '@/lib/api/integration';
import type { Webhook } from '@/types/integration';
import { Plus, Trash2, Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function WebhookList() {
    const [webhooks, setWebhooks] = useState<Webhook[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadWebhooks();
    }, []);

    const loadWebhooks = async () => {
        try {
            const data = await getWebhooks();
            setWebhooks(data);
        } catch (error) {
            toast.error('Failed to load webhooks');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (id: string, enabled: boolean) => {
        try {
            const updated = await updateWebhook(id, { enabled });
            setWebhooks(webhooks.map((w) => (w.id === id ? updated : w)));
            toast.success(`Webhook ${enabled ? 'enabled' : 'disabled'}`);
        } catch (error) {
            toast.error('Failed to update webhook');
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this webhook?')) return;

        try {
            await deleteWebhook(id);
            setWebhooks(webhooks.filter((w) => w.id !== id));
            toast.success('Webhook deleted');
        } catch (error) {
            toast.error('Failed to delete webhook');
            console.error(error);
        }
    };

    const copySecret = (secret: string) => {
        navigator.clipboard.writeText(secret);
        toast.success('Secret copied to clipboard');
    };

    if (loading) {
        return <div className="animate-pulse h-64 bg-muted rounded-lg"></div>;
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Webhooks</CardTitle>
                    <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Webhook
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {webhooks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        No webhooks configured
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>URL</TableHead>
                                <TableHead>Events</TableHead>
                                <TableHead>Secret</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {webhooks.map((webhook) => (
                                <TableRow key={webhook.id}>
                                    <TableCell className="font-mono text-sm max-w-xs truncate">
                                        {webhook.url}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {webhook.events.slice(0, 2).map((event) => (
                                                <Badge key={event} variant="secondary">
                                                    {event}
                                                </Badge>
                                            ))}
                                            {webhook.events.length > 2 && (
                                                <Badge variant="secondary">
                                                    +{webhook.events.length - 2}
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => copySecret(webhook.secret)}
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={webhook.enabled}
                                            onCheckedChange={(checked) =>
                                                handleToggle(webhook.id, checked)
                                            }
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(webhook.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
