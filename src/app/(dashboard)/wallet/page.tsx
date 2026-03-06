'use client';

import { useEffect, useState } from 'react';
import { paymentsApi } from '@/lib/api/payments';
import WalletBalance from '@/components/wallet/WalletBalance';
import WalletTransactions from '@/components/wallet/WalletTransactions';
import type { Wallet, WalletTransaction } from '@/types/payment';
import { toast } from 'sonner';

export default function WalletPage() {
    const [wallet, setWallet] = useState<Wallet | null>(null);
    const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadWallet();
    }, []);

    const loadWallet = async () => {
        try {
            setLoading(true);
            // Replace with actual user ID
            const walletData = await paymentsApi.getWallet('user-id');
            setWallet(walletData);

            const txns = await paymentsApi.getWalletTransactions(walletData.id);
            setTransactions(txns);
        } catch (error) {
            toast.error('Failed to load wallet');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!wallet) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600">Wallet not found</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Wallet</h1>
                <p className="text-gray-600 mt-1">Manage wallet balance and transactions</p>
            </div>

            <WalletBalance wallet={wallet} />
            <WalletTransactions transactions={transactions} />
        </div>
    );
}
