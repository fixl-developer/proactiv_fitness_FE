'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Franchise } from '@/types/enterprise';

interface FranchiseFormProps {
    franchise?: Franchise;
    onSubmit: (data: Omit<Franchise, 'id' | 'createdAt' | 'updatedAt'>) => void;
    onCancel: () => void;
}

export default function FranchiseForm({ franchise, onSubmit, onCancel }: FranchiseFormProps) {
    const [formData, setFormData] = useState({
        name: franchise?.name || '',
        code: franchise?.code || '',
        owner: franchise?.owner || '',
        email: franchise?.email || '',
        phone: franchise?.phone || '',
        address: franchise?.address || '',
        city: franchise?.city || '',
        country: franchise?.country || '',
        businessLicense: franchise?.businessLicense || '',
        taxId: franchise?.taxId || '',
        contractStartDate: franchise?.contractStartDate || '',
        contractEndDate: franchise?.contractEndDate || '',
        royaltyRate: franchise?.royaltyRate || 0,
        revenueShareRate: franchise?.revenueShareRate || 0,
        monthlyFee: franchise?.monthlyFee || 0,
        status: franchise?.status || 'pending',
        primaryColor: franchise?.primaryColor || '#3b82f6',
        secondaryColor: franchise?.secondaryColor || '#8b5cf6',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData as any);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{franchise ? 'Edit' : 'Create'} Franchise</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Franchise Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="code">Franchise Code</Label>
                            <Input
                                id="code"
                                value={formData.code}
                                onChange={(e) =>
                                    setFormData({ ...formData, code: e.target.value })
                                }
                                required
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="owner">Owner Name</Label>
                            <Input
                                id="owner"
                                value={formData.owner}
                                onChange={(e) =>
                                    setFormData({ ...formData, owner: e.target.value })
                                }
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                }
                                required
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="royaltyRate">Royalty Rate (%)</Label>
                            <Input
                                id="royaltyRate"
                                type="number"
                                step="0.1"
                                value={formData.royaltyRate}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        royaltyRate: parseFloat(e.target.value),
                                    })
                                }
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="revenueShareRate">Revenue Share (%)</Label>
                            <Input
                                id="revenueShareRate"
                                type="number"
                                step="0.1"
                                value={formData.revenueShareRate}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        revenueShareRate: parseFloat(e.target.value),
                                    })
                                }
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="monthlyFee">Monthly Fee (AED)</Label>
                            <Input
                                id="monthlyFee"
                                type="number"
                                value={formData.monthlyFee}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        monthlyFee: parseFloat(e.target.value),
                                    })
                                }
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                            value={formData.status}
                            onValueChange={(value: any) =>
                                setFormData({ ...formData, status: value })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                                <SelectItem value="suspended">Suspended</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                        <Button type="submit">{franchise ? 'Update' : 'Create'} Franchise</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
