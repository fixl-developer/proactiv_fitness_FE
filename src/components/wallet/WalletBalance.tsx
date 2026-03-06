'use client';

import type { Wallet } from '@/types/payment';

interface WalletBalanceProps {
    wallet: Wallet;
}

export default function WalletBalance({ wallet }: WalletBalanceProps) {
    return (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white">
            <h2 className="text-lg font-semibold mb-4">Wallet Balance</h2>

            <div className="mb-6">
                <p className="text-sm text-blue-100">Total Balance</p>
                <p className="text-4xl font-bold">${wallet.totalBalance.toFixed(2)}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-xs text-blue-100">Cash</p>
                    <p className="text-lg font-semibold">${wallet.cashBalance.toFixed(2)}</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-xs text-blue-100">Promo</p>
                    <p className="text-lg font-semibold">${wallet.promoBalance.toFixed(2)}</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-xs text-blue-100">Loyalty</p>
                    <p className="text-lg font-semibold">${wallet.loyaltyBalance.toFixed(2)}</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-xs text-blue-100">Subsidy</p>
                    <p className="text-lg font-semibold">${wallet.subsidyBalance.toFixed(2)}</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-xs text-blue-100">Refund</p>
                    <p className="text-lg font-semibold">${wallet.refundBalance.toFixed(2)}</p>
                </div>
            </div>
        </div>
    );
}
