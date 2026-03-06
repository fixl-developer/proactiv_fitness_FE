'use client';

import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RewardsCatalog from '@/components/rewards/RewardsCatalog';
import RedemptionHistory from '@/components/rewards/RedemptionHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Gift } from 'lucide-react';
import {
    getGamificationProfile,
    getRewardsCatalog,
    getRedemptionHistory,
    redeemReward,
} from '@/lib/api/gamification';
import type { GamificationProfile, Reward, RewardRedemption } from '@/types/gamification';
import { useToast } from '@/hooks/use-toast';

export default function RewardsPage() {
    const { toast } = useToast();
    const [profile, setProfile] = useState<GamificationProfile | null>(null);
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [redemptions, setRedemptions] = useState<RewardRedemption[]>([]);
    const [loading, setLoading] = useState(true);

    const userId = 'current-user-id'; // Get from auth context

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [profileData, rewardsData, redemptionsData] = await Promise.all([
                getGamificationProfile(userId),
                getRewardsCatalog(),
                getRedemptionHistory(userId),
            ]);

            setProfile(profileData);
            setRewards(rewardsData);
            setRedemptions(redemptionsData);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load rewards data',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRedeem = async (rewardId: string) => {
        try {
            await redeemReward(rewardId);
            toast({
                title: 'Success',
                description: 'Reward redeemed successfully',
            });
            fetchData();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to redeem reward',
                variant: 'destructive',
            });
        }
    };

    if (loading || !profile) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Rewards Catalog</h1>
                <p className="text-muted-foreground">
                    Redeem your points for exciting rewards
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-500" />
                        Your Points Balance
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-3xl font-bold">
                                {profile.availablePoints.toLocaleString()}
                            </p>
                            <p className="text-sm text-muted-foreground">Available Points</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xl font-bold text-muted-foreground">
                                {profile.totalPoints.toLocaleString()}
                            </p>
                            <p className="text-sm text-muted-foreground">Total Earned</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="catalog" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="catalog">
                        <Gift className="h-4 w-4 mr-2" />
                        Catalog
                    </TabsTrigger>
                    <TabsTrigger value="history">My Redemptions</TabsTrigger>
                </TabsList>

                <TabsContent value="catalog" className="space-y-4">
                    <RewardsCatalog
                        rewards={rewards}
                        userPoints={profile.availablePoints}
                        onRedeem={handleRedeem}
                    />
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                    <RedemptionHistory redemptions={redemptions} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
