'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { getRetentionPolicies, updateRetentionPolicy } from '@/lib/api/dataManagement';
import type { RetentionPolicy } from '@/types/dataManagement';
import { toast } from 'sonner';
import { Shield } from 'lucide-react';

export default function RetentionPolicies() {
    const [policies, setPolicies] = useState<RetentionPolicy[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPolicies();
    }, []);

    const loadPolicies = async () => {
        try {
            const data = await getRetentionPolicies();
            setPolicies(data);
        } catch (error) {
            toast.error('Failed to load retention policies');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (policyId: string, enabled: boolean) => {
        try {
            const updated = await updateRetentionPolicy(policyId, { enabled });
            setPolicies(policies.map((p) => (p.id === policyId ? updated : p)));
            toast.success(`Policy ${enabled ? 'enabled' : 'disabled'} successfully`);
        } catch (error) {
            toast.error('Failed to update policy');
            console.error(error);
        }
    };

    const getActionBadge = (action: RetentionPolicy['action']) => {
        const colors = {
            archive: 'bg-blue-500',
            delete: 'bg-red-500',
            anonymize: 'bg-yellow-500',
        };

        return (
            <Badge className={colors[action]}>
                {action.charAt(0).toUpperCase() + action.slice(1)}
            </Badge>
        );
    };

    if (loading) {
        return <div className="animate-pulse h-64 bg-muted rounded-lg"></div>;
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    <CardTitle>Data Retention Policies</CardTitle>
                </div>
                <CardDescription>
                    Automated policies for data lifecycle management
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Entity</TableHead>
                            <TableHead>Retention Period</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Last Run</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {policies.map((policy) => (
                            <TableRow key={policy.id}>
                                <TableCell className="font-medium capitalize">
                                    {policy.entity}
                                </TableCell>
                                <TableCell>{policy.retentionPeriod} days</TableCell>
                                <TableCell>{getActionBadge(policy.action)}</TableCell>
                                <TableCell>
                                    {policy.lastRunAt
                                        ? new Date(policy.lastRunAt).toLocaleDateString()
                                        : 'Never'}
                                </TableCell>
                                <TableCell>
                                    <Switch
                                        checked={policy.enabled}
                                        onCheckedChange={(checked) =>
                                            handleToggle(policy.id, checked)
                                        }
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
