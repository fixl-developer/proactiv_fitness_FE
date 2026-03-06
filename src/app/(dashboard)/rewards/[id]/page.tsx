'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import RewardDetail from '@/components/rewards/RewardDetail';
import { getGamificationProfile, getRewardsCatalog, redeemReward } from '@/lib/api/gamification';
import type { GamificationProfile, Reward } from '@/types/gamification';
import { useToast } from '@/hooks/use-toast';

export default function RewardDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const [profile, setProfile] = useState<GamificationProfile | null>(null);
    const [reward, setReward] = useState<Reward | null>(null);
    const [loading, setLoading] = useState(true);

    const userId = 'current-user-id'; // Get from auth context

    useEffect(() => {
        fetchData();
    }, [params.id]);

    const fetchData = async () => {
        try {
            const [profileData, rewardsData] = await Promise.all([
                getGamificationProfile(userId),
                getRewardsCatalog(),
            ]);

            setProfile(profileData);
            const foundReward = rewardsData.find((r) => r.id === params.id);
            setReward(foundReward || null);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load reward details',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRedeem = async () => {
        if (!reward) return;

        try {
            await redeemReward(reward.id);
            toast({
                title: 'Success',
                description: 'Reward redeemed successfully',
            });
            router.push('/rewards');
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to redeem reward',
                variant: 'destructive',
            });
        }
    };

    if (loading) {
        return <div className="p-8">Loading...</div>;
    }

    if (!reward || !profile) {
        return <div className="p-8">Reward not found</div>;
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Rewards
            </Button>

            <RewardDetail
                reward={reward}
                userPoints={profile.availablePoints}
                onRedeem={handleRedeem}
            />
        </div>
    );
}
