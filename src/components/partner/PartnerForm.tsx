'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Partner } from '@/types/enterprise';

interface PartnerFormProps {
    partner?: Partner;
    onSubmit: (data: Omit<Partner, 'id' | 'createdAt'>) => void;
    onCancel: () => void;
}

export default function PartnerForm({ partner, onSubmit, onCancel }: PartnerFormProps) {
    const [formData, setFormData] = useState({
        name: partner?.name || '',
        type: partner?.type || 'school',
        contactPerson: partner?.contactPerson || '',
        email: partner?.email || '',
        phone: partner?.phone || '',
        contractNumber: partner?.contractNumber || '',
        startDate: partner?.startDate || '',
        endDate: partner?.endDate || '',
        revenueShareRate: partner?.revenueShareRate || 0,
        status: partner?.status || 'pending',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData as any);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{partner ? 'Edit' : 'Create'} Partner</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Partner Name</Label>
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
                            <Label htmlFor="type">Partner Type</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value: any) =>
                                    setFormData({ ...formData, type: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="school">School</SelectItem>
                                    <SelectItem value="government">Government</SelectItem>
                                    <SelectItem value="corporate">Corporate</SelectItem>
                                    <SelectItem value="ngo">NGO</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="contactPerson">Contact Person</Label>
                            <Input
                                id="contactPerson"
                                value={formData.contactPerson}
                                onChange={(e) =>
                                    setFormData({ ...formData, contactPerson: e.target.value })
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

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) =>
                                    setFormData({ ...formData, phone: e.target.value })
                                }
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="contractNumber">Contract Number</Label>
                            <Input
                                id="contractNumber"
                                value={formData.contractNumber}
                                onChange={(e) =>
                                    setFormData({ ...formData, contractNumber: e.target.value })
                                }
                                required
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={formData.startDate}
                                onChange={(e) =>
                                    setFormData({ ...formData, startDate: e.target.value })
                                }
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="endDate">End Date</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={formData.endDate}
                                onChange={(e) =>
                                    setFormData({ ...formData, endDate: e.target.value })
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
                                <SelectItem value="pending">Pending</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                        <Button type="submit">{partner ? 'Update' : 'Create'} Partner</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
