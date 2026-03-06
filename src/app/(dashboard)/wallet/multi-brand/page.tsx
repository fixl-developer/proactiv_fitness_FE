'use client';

import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MultiBrandBalance from '@/components/wallet/MultiBrandBalance';
import CrossBrandTransfer from '@/components/wallet/CrossBrandTransfer';
import BreakageReport from '@/components/wallet/BreakageReport';
import {
    getMultiBrandWallet,
    transferCrossBrand,
    getWalletBreakage,
} from '@/lib/api/enterprise';
import type { MultiBrandWallet, WalletBreakage } from '@/types/enterprise';
import { useToast } from '@/hooks/use-toast';

export default function MultiBrandWalletPage() {
    const { toast } = useToast();
    const [wallet, setWallet] = useState<MultiBrandWallet | null>(null);
    const [breakage, setBreakage] = useState<WalletBreakage | null>(null);
    const [loading, setLoading] = useState(true);

    const userId = 'current-user-id'; // Get from auth context

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const walletData = await getMultiBrandWallet(userId);
            setWallet(walletData);

            if (walletData.brands.length > 0) {
                const breakageData = await getWalletBreakage(
                    walletData.brands[0].brandId,
                    'current-month'
                );
                setBreakage(breakageData);
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load wallet data',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleTransfer = async (data: any) => {
        if (!wallet) return;
        await transferCrossBrand(wallet.id, data);
        fetchData();
    };

    if (loading || !wallet) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Multi-Brand Wallet</h1>
                <p className="text-muted-foreground">
                    Manage credits across multiple brands
                </p>
            </div>

            <Tabs defaultValue="balance" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="balance">Balance</TabsTrigger>
                    <TabsTrigger value="transfer">Transfer</TabsTrigger>
                    {breakage && <TabsTrigger value="breakage">Breakage</TabsTrigger>}
                </TabsList>

                <TabsContent value="balance" className="space-y-4">
                    <MultiBrandBalance wallet={wallet} />
                </TabsContent>

                <TabsContent value="transfer" className="space-y-4">
                    <div className="max-w-2xl">
                        <CrossBrandTransfer brands={wallet.brands} onTransfer={handleTransfer} />
                    </div>
                </TabsContent>

                {breakage && (
                    <TabsContent value="breakage" className="space-y-4">
                        <BreakageReport breakage={breakage} />
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}
