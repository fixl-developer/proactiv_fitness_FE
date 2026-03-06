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
import { getApiKeys, revokeApiKey } from '@/lib/api/integration';
import type { ApiKey } from '@/types/integration';
import { Plus, Trash2, Copy, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function ApiKeyList() {
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

    useEffect(() => {
        loadApiKeys();
    }, []);

    const loadApiKeys = async () => {
        try {
            const data = await getApiKeys();
            setApiKeys(data);
        } catch (error) {
            toast.error('Failed to load API keys');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleRevoke = async (id: string) => {
        if (!confirm('Are you sure you want to revoke this API key?')) return;

        try {
            await revokeApiKey(id);
            setApiKeys(apiKeys.filter((k) => k.id !== id));
            toast.success('API key revoked');
        } catch (error) {
            toast.error('Failed to revoke API key');
            console.error(error);
        }
    };

    const copyKey = (key: string) => {
        navigator.clipboard.writeText(key);
        toast.success('API key copied to clipboard');
    };

    const toggleKeyVisibility = (id: string) => {
        setVisibleKeys((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const maskKey = (key: string) => {
        return key.substring(0, 8) + '•'.repeat(24) + key.substring(key.length - 4);
    };

    if (loading) {
        return <div className="animate-pulse h-64 bg-muted rounded-lg"></div>;
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>API Keys</CardTitle>
                    <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Generate Key
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {apiKeys.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        No API keys generated
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Key</TableHead>
                                <TableHead>Permissions</TableHead>
                                <TableHead>Last Used</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {apiKeys.map((apiKey) => (
                                <TableRow key={apiKey.id}>
                                    <TableCell className="font-medium">{apiKey.name}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <code className="text-sm">
                                                {visibleKeys.has(apiKey.id)
                                                    ? apiKey.key
                                                    : maskKey(apiKey.key)}
                                            </code>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => toggleKeyVisibility(apiKey.id)}
                                            >
                                                {visibleKeys.has(apiKey.id) ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => copyKey(apiKey.key)}
                                            >
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {apiKey.permissions.slice(0, 2).map((perm) => (
                                                <Badge key={perm} variant="secondary">
                                                    {perm}
                                                </Badge>
                                            ))}
                                            {apiKey.permissions.length > 2 && (
                                                <Badge variant="secondary">
                                                    +{apiKey.permissions.length - 2}
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {apiKey.lastUsedAt
                                            ? format(new Date(apiKey.lastUsedAt), 'MMM dd, yyyy')
                                            : 'Never'}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRevoke(apiKey.id)}
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
