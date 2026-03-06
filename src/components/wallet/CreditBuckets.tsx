'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Wallet, Gift, Award, DollarSign, RefreshCw } from 'lucide-react';
import type { Wallet as WalletType } from '@/types/payment';

interface CreditBucketsProps {
    wallet: WalletType;
}

export default function CreditBuckets({ wallet }: CreditBucketsProps) {
    const buckets = [
        {
            name: 'Cash Balance',
            amount: wallet.cashBalance,
            icon: DollarSign,
            color: 'text-green-600',
            bgColor: 'bg-green-100',
            description: 'Available cash credits',
        },
        {
            name: 'Promotional Credits',
            amount: wallet.promoBalance,
            icon: Gift,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100',
            description: 'Promotional offers and bonuses',
        },
        {
            name: 'Loyalty Points',
            amount: wallet.loyaltyBalance,
            icon: Award,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
            description: 'Earned through attendance',
        },
        {
            name: 'Subsidy Credits',
            amount: wallet.subsidyBalance,
            icon: Wallet,
            color: 'text-orange-600',
            bgColor: 'bg-orange-100',
            description: 'Government or partner subsidies',
        },
        {
            name: 'Refund Credits',
            amount: wallet.refundBalance,
            icon: RefreshCw,
            color: 'text-red-600',
            bgColor: 'bg-red-100',
            description: 'Refunded amounts',
        },
    ];

    const getPercentage = (amount: number) => {
        if (wallet.totalBalance === 0) return 0;
        return (amount / wallet.totalBalance) * 100;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Credit Buckets Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    {buckets.map((bucket) => {
                        const Icon = bucket.icon;
                        const percentage = getPercentage(bucket.amount);

                        return (
                            <div key={bucket.name} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-2 rounded-lg ${bucket.bgColor}`}>
                                            <Icon className={`h-4 w-4 ${bucket.color}`} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{bucket.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {bucket.description}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold">
                                            AED {bucket.amount.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {percentage.toFixed(1)}%
                                        </p>
                                    </div>
                                </div>
                                <Progress value={percentage} className="h-2" />
                            </div>
                        );
                    })}
                </div>

                <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                        <p className="font-semibold">Total Balance</p>
                        <p className="text-2xl font-bold">
                            AED {wallet.totalBalance.toLocaleString()}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
