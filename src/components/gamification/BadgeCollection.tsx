'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock } from 'lucide-react';
import type { Badge as BadgeType } from '@/types/gamification';

interface BadgeCollectionProps {
    badges: BadgeType[];
}

export default function BadgeCollection({ badges }: BadgeCollectionProps) {
    const getRarityColor = (rarity: string) => {
        switch (rarity) {
            case 'common':
                return 'bg-gray-100 text-gray-800';
            case 'rare':
                return 'bg-blue-100 text-blue-800';
            case 'epic':
                return 'bg-purple-100 text-purple-800';
            case 'legendary':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {badges.map((badge) => (
                <Card
                    key={badge.id}
                    className={`${badge.isUnlocked ? '' : 'opacity-50 grayscale'
                        } transition-all hover:scale-105`}
                >
                    <CardContent className="p-6">
                        <div className="flex flex-col items-center text-center space-y-3">
                            <div className="relative">
                                <div className="text-4xl">{badge.icon}</div>
                                {!badge.isUnlocked && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Lock className="h-6 w-6 text-gray-500" />
                                    </div>
                                )}
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-semibold">{badge.name}</h3>
                                <p className="text-xs text-muted-foreground">{badge.description}</p>
                            </div>
                            <div className="flex gap-2">
                                <Badge className={getRarityColor(badge.rarity)} variant="secondary">
                                    {badge.rarity}
                                </Badge>
                                <Badge variant="outline">{badge.pointsRequired} pts</Badge>
                            </div>
                            {badge.isUnlocked && badge.unlockedAt && (
                                <p className="text-xs text-muted-foreground">
                                    Unlocked {new Date(badge.unlockedAt).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
