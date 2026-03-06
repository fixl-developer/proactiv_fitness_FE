'use client';

import type { WalletTransaction } from '@/types/payment';

interface WalletTransactionsProps {
    transactions: WalletTransaction[];
}

export default function WalletTransactions({ transactions }: WalletTransactionsProps) {
    const getBucketColor = (bucket: string) => {
        switch (bucket) {
            case 'cash':
                return 'bg-green-100 text-green-800';
            case 'promo':
                return 'bg-purple-100 text-purple-800';
            case 'loyalty':
                return 'bg-blue-100 text-blue-800';
            case 'subsidy':
                return 'bg-yellow-100 text-yellow-800';
            case 'refund':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Transaction History</h2>

            {transactions.length > 0 ? (
                <div className="space-y-3">
                    {transactions.map((txn) => (
                        <div key={txn.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <p className="font-medium text-gray-900">{txn.description}</p>
                                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getBucketColor(txn.bucketType)}`}>
                                        {txn.bucketType}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <p className={`text-lg font-semibold ${txn.type === 'credit' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {txn.type === 'credit' ? '+' : '-'}${txn.amount.toFixed(2)}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(txn.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-sm text-gray-600">
                                <span>Balance: ${txn.balanceAfter.toFixed(2)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8">
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-gray-600">No transactions yet</p>
                </div>
            )}
        </div>
    );
}
