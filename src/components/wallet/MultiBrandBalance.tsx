'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Wallet, DollarSign } from 'lucide-react';
import type { MultiBrandWallet, BrandBalance } from '@/types/enterprise';

interface MultiBrandBalanceProps {
    wallet: MultiBrandWallet;
}

export default function MultiBrandBalance({ wallet }: MultiBrandBalanceProps) {
    const getPercentage = (amount: number) => {
        if (wallet.totalBalance === 0) return 0;
        return (amount / wallet.totalBalance) * 100;
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Wallet className="h-5 w-5" />
                            Multi-Brand Wallet
                        </CardTitle>
                        {wallet.crossBrandEnabled && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                                Cross-Brand Enabled
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Total Balance</span>
                            <span className="text-3xl font-bold">
                                AED {wallet.totalBalance.toLocaleString()}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Across {wallet.brands.length} brands
                        </p>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4">
                {wallet.brands.map((brand) => (
                    <Card key={brand.brandId}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">{brand.brandName}</CardTitle>
                                <div className="text-right">
                                    <p className="text-2xl font-bold">
                                        AED {brand.totalBalance.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {getPercentage(brand.totalBalance).toFixed(1)}% of total
                                    </p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Progress value={getPercentage(brand.totalBalance)} className="h-2" />

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-2 border rounded">
                                    <p className="text-xs text-muted-foreground">Cash</p>
                                    <p className="font-bold">
                                        AED {brand.cashBalance.toLocaleString()}
                                    </p>
                                </div>
                                <div className="p-2 border rounded">
                                    <p className="text-xs text-muted-foreground">Promo</p>
                                    <p className="font-bold">
                                        AED {brand.promoBalance.toLocaleString()}
                                    </p>
                                </div>
                                <div className="p-2 border rounded">
                                    <p className="text-xs text-muted-foreground">Loyalty</p>
                                    <p className="font-bold">
                                        AED {brand.loyaltyBalance.toLocaleString()}
                                    </p>
                                </div>
                                <div className="p-2 border rounded">
                                    <p className="text-xs text-muted-foreground">Subsidy</p>
                                    <p className="font-bold">
                                        AED {brand.subsidyBalance.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
