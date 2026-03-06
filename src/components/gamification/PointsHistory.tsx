'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';
import type { PointsTransaction } from '@/types/gamification';

interface PointsHistoryProps {
    transactions: PointsTransaction[];
}

export default function PointsHistory({ transactions }: PointsHistoryProps) {
    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'earned':
                return <TrendingUp className="h-4 w-4 text-green-500" />;
            case 'spent':
                return <TrendingDown className="h-4 w-4 text-red-500" />;
            case 'expired':
                return <Clock className="h-4 w-4 text-orange-500" />;
            default:
                return null;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'earned':
                return 'text-green-600';
            case 'spent':
                return 'text-red-600';
            case 'expired':
                return 'text-orange-600';
            default:
                return 'text-gray-600';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Points History</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {transactions.map((transaction) => (
                        <div
                            key={transaction.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                        >
                            <div className="flex items-center gap-3">
                                {getTypeIcon(transaction.type)}
                                <div>
                                    <p className="font-medium">{transaction.reason}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(transaction.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`font-bold ${getTypeColor(transaction.type)}`}>
                                    {transaction.type === 'earned' ? '+' : '-'}
                                    {transaction.amount}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Balance: {transaction.balanceAfter}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
