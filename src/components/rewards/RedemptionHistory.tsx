'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gift, CheckCircle, Clock, XCircle } from 'lucide-react';
import type { RewardRedemption } from '@/types/gamification';

interface RedemptionHistoryProps {
    redemptions: RewardRedemption[];
}

export default function RedemptionHistory({ redemptions }: RedemptionHistoryProps) {
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'fulfilled':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'pending':
                return <Clock className="h-4 w-4 text-yellow-500" />;
            case 'approved':
                return <CheckCircle className="h-4 w-4 text-blue-500" />;
            case 'cancelled':
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return null;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'fulfilled':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'approved':
                return 'bg-blue-100 text-blue-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5" />
                    Redemption History
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {redemptions.map((redemption) => (
                        <div
                            key={redemption.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                        >
                            <div className="flex items-center gap-3">
                                {getStatusIcon(redemption.status)}
                                <div>
                                    <p className="font-medium">{redemption.rewardName}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Redeemed on{' '}
                                        {new Date(redemption.redeemedAt).toLocaleDateString()}
                                    </p>
                                    {redemption.redemptionCode && (
                                        <p className="text-xs font-mono mt-1">
                                            Code: {redemption.redemptionCode}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="text-right space-y-1">
                                <Badge className={getStatusColor(redemption.status)}>
                                    {redemption.status}
                                </Badge>
                                <p className="text-sm font-medium">
                                    {redemption.pointsSpent} pts
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
