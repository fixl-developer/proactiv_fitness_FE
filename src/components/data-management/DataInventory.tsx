'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { getDataInventory } from '@/lib/api/dataManagement';
import type { DataInventory as DataInventoryType } from '@/types/dataManagement';
import { Database, Shield } from 'lucide-react';
import { format } from 'date-fns';

export default function DataInventory() {
    const [inventory, setInventory] = useState<DataInventoryType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadInventory();
    }, []);

    const loadInventory = async () => {
        try {
            const data = await getDataInventory();
            setInventory(data);
        } catch (error) {
            console.error('Failed to load data inventory:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    if (loading) {
        return <div className="animate-pulse h-64 bg-muted rounded-lg"></div>;
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    <CardTitle>Data Inventory</CardTitle>
                </div>
                <CardDescription>
                    Overview of all personal data stored in the system
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Entity</TableHead>
                            <TableHead>Records</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead>Date Range</TableHead>
                            <TableHead>PII Fields</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {inventory.map((item) => (
                            <TableRow key={item.entity}>
                                <TableCell className="font-medium capitalize">
                                    {item.entity}
                                </TableCell>
                                <TableCell>{item.count.toLocaleString()}</TableCell>
                                <TableCell>{formatBytes(item.size)}</TableCell>
                                <TableCell className="text-sm">
                                    {format(new Date(item.oldestRecord), 'MMM yyyy')} -{' '}
                                    {format(new Date(item.newestRecord), 'MMM yyyy')}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {item.piiFields.map((field) => (
                                            <Badge
                                                key={field}
                                                variant="secondary"
                                                className="text-xs"
                                            >
                                                <Shield className="h-3 w-3 mr-1" />
                                                {field}
                                            </Badge>
                                        ))}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
