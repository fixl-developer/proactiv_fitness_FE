'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AddCreditsModalProps {
    open: boolean;
    onClose: () => void;
    walletId: string;
    onSuccess: () => void;
}

export default function AddCreditsModal({
    open,
    onClose,
    walletId,
    onSuccess,
}: AddCreditsModalProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        amount: '',
        bucketType: 'cash',
        description: '',
        paymentMethod: 'card',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            toast({
                title: 'Error',
                description: 'Please enter a valid amount',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);
        try {
            // API call to add credits
            const response = await fetch(`/api/wallet/${walletId}/add-credits`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: parseFloat(formData.amount),
                    bucketType: formData.bucketType,
                    description: formData.description,
                    paymentMethod: formData.paymentMethod,
                }),
            });

            if (!response.ok) throw new Error('Failed to add credits');

            toast({
                title: 'Success',
                description: `AED ${formData.amount} added to wallet`,
            });

            onSuccess();
            onClose();
            setFormData({
                amount: '',
                bucketType: 'cash',
                description: '',
                paymentMethod: 'card',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to add credits',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Add Credits to Wallet
                    </DialogTitle>
                    <DialogDescription>
                        Add credits to the wallet. Choose the bucket type and payment method.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount (AED)</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.amount}
                            onChange={(e) =>
                                setFormData({ ...formData, amount: e.target.value })
                            }
                            placeholder="Enter amount"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bucketType">Credit Bucket</Label>
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
                                <SelectItem value="loyalty">Loyalty Points</SelectItem>
                                <SelectItem value="subsidy">Subsidy</SelectItem>
                                <SelectItem value="refund">Refund</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="paymentMethod">Payment Method</Label>
                        <Select
                            value={formData.paymentMethod}
                            onValueChange={(value) =>
                                setFormData({ ...formData, paymentMethod: value })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="card">Credit/Debit Card</SelectItem>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            placeholder="Add a note about this transaction"
                            rows={3}
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Adding...' : 'Add Credits'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
