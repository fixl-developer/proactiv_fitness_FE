'use client';

import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Star, Package } from 'lucide-react';
import type { Reward } from '@/types/gamification';
import Image from 'next/image';

interface RewardsCatalogProps {
    rewards: Reward[];
    userPoints: number;
    onRedeem: (rewardId: string) => void;
}

export default function RewardsCatalog({ rewards, userPoints, onRedeem }: RewardsCatalogProps) {
    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'discount':
                return <Star className="h-4 w-4" />;
            case 'merchandise':
                return <Package className="h-4 w-4" />;
            case 'experience':
                return <Gift className="h-4 w-4" />;
            default:
                return <Gift className="h-4 w-4" />;
        }
    };

    const canAfford = (pointsCost: number) => userPoints >= pointsCost;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rewards.map((reward) => (
                <Card key={reward.id} className={!reward.isAvailable ? 'opacity-50' : ''}>
                    <CardHeader>
                        <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden bg-muted">
                            <Image
                                src={reward.image}
                                alt={reward.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <CardTitle className="flex items-center justify-between">
                            <span>{reward.name}</span>
                            <Badge variant="secondary" className="flex items-center gap-1">
                                {getCategoryIcon(reward.category)}
                                {reward.category}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{reward.description}</p>
                        <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-1">
                                <Star className="h-5 w-5 text-yellow-500" />
                                <span className="font-bold text-lg">{reward.pointsCost}</span>
                                <span className="text-sm text-muted-foreground">points</span>
                            </div>
                            {reward.stockAvailable > 0 && (
                                <Badge variant="outline">
                                    {reward.stockAvailable} available
                                </Badge>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            className="w-full"
                            disabled={
                                !reward.isAvailable ||
                                !canAfford(reward.pointsCost) ||
                                reward.stockAvailable === 0
                            }
                            onClick={() => onRedeem(reward.id)}
                        >
                            {!reward.isAvailable
                                ? 'Not Available'
                                : !canAfford(reward.pointsCost)
                                    ? 'Not Enough Points'
                                    : reward.stockAvailable === 0
                                        ? 'Out of Stock'
                                        : 'Redeem'}
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
