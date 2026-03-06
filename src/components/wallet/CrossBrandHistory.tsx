'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, History } from 'lucide-react';
import type { CrossBrandTransaction } from '@/types/enterprise';

interface CrossBrandHistoryProps {
    transactions: CrossBrandTransaction[];
}

export default function CrossBrandHistory({ transactions }: CrossBrandHistoryProps) {
    const getBucketColor = (bucketType: string) => {
        switch (bucketType) {
            case 'cash':
                return 'bg-green-100 text-green-800';
            case 'promo':
                return 'bg-purple-100 text-purple-800';
            case 'loyalty':
                return 'bg-blue-100 text-blue-800';
            case 'subsidy':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Cross-Brand Transaction History
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {transactions.map((transaction) => (
                        <div
                            key={transaction.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                        >
                            <div className="flex items-center gap-3 flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">{transaction.fromBrand}</span>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{transaction.toBrand}</span>
                                </div>
                                <Badge className={getBucketColor(transaction.bucketType)}>
                                    {transaction.bucketType}
                                </Badge>
                            </div>
                            <div className="text-right">
                                <p className="font-bold">AED {transaction.amount.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">
                                    {new Date(transaction.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
