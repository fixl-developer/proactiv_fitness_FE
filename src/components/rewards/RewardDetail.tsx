'use client';

import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Star, Package, Calendar, AlertCircle } from 'lucide-react';
import type { Reward } from '@/types/gamification';
import Image from 'next/image';

interface RewardDetailProps {
    reward: Reward;
    userPoints: number;
    onRedeem: () => void;
}

export default function RewardDetail({ reward, userPoints, onRedeem }: RewardDetailProps) {
    const canAfford = userPoints >= reward.pointsCost;
    const pointsNeeded = reward.pointsCost - userPoints;

    return (
        <Card>
            <CardHeader>
                <div className="relative w-full h-64 rounded-lg overflow-hidden bg-muted">
                    <Image
                        src={reward.image}
                        alt={reward.name}
                        fill
                        className="object-cover"
                    />
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <CardTitle className="text-2xl">{reward.name}</CardTitle>
                    <Badge variant="secondary" className="mt-2">
                        {reward.category}
                    </Badge>
                </div>

                <p className="text-muted-foreground">{reward.description}</p>

                <Separator />

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Star className="h-5 w-5 text-yellow-500" />
                            <span className="font-semibold">Points Required</span>
                        </div>
                        <span className="text-2xl font-bold">{reward.pointsCost}</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            <span className="font-semibold">Stock Available</span>
                        </div>
                        <span className="font-medium">{reward.stockAvailable}</span>
                    </div>

                    {reward.expiryDate && (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                <span className="font-semibold">Valid Until</span>
                            </div>
                            <span className="font-medium">
                                {new Date(reward.expiryDate).toLocaleDateString()}
                            </span>
                        </div>
                    )}
                </div>

                {!canAfford && (
                    <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-yellow-800">
                                Not enough points
                            </p>
                            <p className="text-xs text-yellow-700">
                                You need {pointsNeeded} more points to redeem this reward
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Button
                    className="w-full"
                    size="lg"
                    disabled={!reward.isAvailable || !canAfford || reward.stockAvailable === 0}
                    onClick={onRedeem}
                >
                    {!reward.isAvailable
                        ? 'Not Available'
                        : !canAfford
                            ? `Need ${pointsNeeded} More Points`
                            : reward.stockAvailable === 0
                                ? 'Out of Stock'
                                : `Redeem for ${reward.pointsCost} Points`}
                </Button>
            </CardFooter>
        </Card>
    );
}
