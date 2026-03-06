'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, RefreshCw } from 'lucide-react';
import type { BrandBalance } from '@/types/enterprise';
import { useToast } from '@/hooks/use-toast';

interface CrossBrandTransferProps {
    brands: BrandBalance[];
    onTransfer: (data: {
        fromBrand: string;
        toBrand: string;
        amount: number;
        bucketType: string;
    }) => Promise<void>;
}

export default function CrossBrandTransfer({ brands, onTransfer }: CrossBrandTransferProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fromBrand: '',
        toBrand: '',
        amount: '',
        bucketType: 'cash',
    });

    const selectedFromBrand = brands.find((b) => b.brandId === formData.fromBrand);
    const maxAmount = selectedFromBrand
        ? selectedFromBrand[`${formData.bucketType}Balance` as keyof BrandBalance] as number
        : 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.fromBrand || !formData.toBrand) {
            toast({
                title: 'Error',
                description: 'Please select both brands',
                variant: 'destructive',
            });
            return;
        }

        if (formData.fromBrand === formData.toBrand) {
            toast({
                title: 'Error',
                description: 'Cannot transfer to the same brand',
                variant: 'destructive',
            });
            return;
        }

        const amount = parseFloat(formData.amount);
        if (amount <= 0 || amount > maxAmount) {
            toast({
                title: 'Error',
                description: 'Invalid amount',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);
        try {
            await onTransfer({
                fromBrand: formData.fromBrand,
                toBrand: formData.toBrand,
                amount,
                bucketType: formData.bucketType,
            });

            toast({
                title: 'Success',
                description: 'Transfer completed successfully',
            });

            setFormData({
                fromBrand: '',
                toBrand: '',
                amount: '',
                bucketType: 'cash',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Transfer failed',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5" />
                    Cross-Brand Transfer
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="fromBrand">From Brand</Label>
                            <Select
                                value={formData.fromBrand}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, fromBrand: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select brand" />
                                </SelectTrigger>
                                <SelectContent>
                                    {brands.map((brand) => (
                                        <SelectItem key={brand.brandId} value={brand.brandId}>
                                            {brand.brandName} (AED{' '}
                                            {brand.totalBalance.toLocaleString()})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="toBrand">To Brand</Label>
                            <Select
                                value={formData.toBrand}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, toBrand: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select brand" />
                                </SelectTrigger>
                                <SelectContent>
                                    {brands.map((brand) => (
                                        <SelectItem key={brand.brandId} value={brand.brandId}>
                                            {brand.brandName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bucketType">Credit Type</Label>
                        <Select
                            value={formData.bucketType}
                            onValueChange={(value) =>
                                setFormData({ ...formData, bucketType: value })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="promo">Promotional</SelectItem>
                                <SelectItem value="loyalty">Loyalty</SelectItem>
                                <SelectItem value="subsidy">Subsidy</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount">
                            Amount (Max: AED {maxAmount.toLocaleString()})
                        </Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            min="0"
                            max={maxAmount}
                            value={formData.amount}
                            onChange={(e) =>
                                setFormData({ ...formData, amount: e.target.value })
                            }
                            placeholder="Enter amount"
                            required
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        <ArrowRight className="h-4 w-4 mr-2" />
                        {loading ? 'Processing...' : 'Transfer Credits'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
