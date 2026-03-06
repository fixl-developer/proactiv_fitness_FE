'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { createApiKey } from '@/lib/api/integration';
import { toast } from 'sonner';

const AVAILABLE_PERMISSIONS = [
    'read:students',
    'write:students',
    'read:bookings',
    'write:bookings',
    'read:payments',
    'write:payments',
    'read:reports',
];

export default function ApiKeyForm() {
    const [name, setName] = useState('');
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);

    const handlePermissionToggle = (permission: string) => {
        setSelectedPermissions((prev) =>
            prev.includes(permission) ? prev.filter((p) => p !== permission) : [...prev, permission]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error('Please enter API key name');
            return;
        }

        if (selectedPermissions.length === 0) {
            toast.error('Please select at least one permission');
            return;
        }

        try {
            setSubmitting(true);
            await createApiKey({
                name,
                permissions: selectedPermissions,
            });
            toast.success('API key created successfully');
            setName('');
            setSelectedPermissions([]);
        } catch (error) {
            toast.error('Failed to create API key');
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Generate API Key</CardTitle>
                <CardDescription>Create a new API key with specific permissions</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Key Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="My API Key"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Permissions</Label>
                        <div className="space-y-2">
                            {AVAILABLE_PERMISSIONS.map((permission) => (
                                <div key={permission} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={permission}
                                        checked={selectedPermissions.includes(permission)}
                                        onCheckedChange={() => handlePermissionToggle(permission)}
                                    />
                                    <Label htmlFor={permission} className="cursor-pointer">
                                        {permission}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Button type="submit" disabled={submitting} className="w-full">
                        {submitting ? 'Generating...' : 'Generate API Key'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
