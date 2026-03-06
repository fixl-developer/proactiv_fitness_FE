'use client';

import type { Payment } from '@/types/payment';

interface PaymentHistoryProps {
    payments: Payment[];
}

export default function PaymentHistory({ payments }: PaymentHistoryProps) {
    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment History</h2>

            {payments.length > 0 ? (
                <div className="space-y-3">
                    {payments.map((payment) => (
                        <div key={payment.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <p className="font-medium text-gray-900">${payment.amount.toFixed(2)}</p>
                                    <p className="text-sm text-gray-600">{payment.description}</p>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                        payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                                                'bg-gray-100 text-gray-800'
                                    }`}>
                                    {payment.status}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm text-gray-600">
                                <span className="capitalize">{payment.paymentMethod.replace('_', ' ')}</span>
                                <span>{new Date(payment.paymentDate).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8">
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-gray-600">No payment history</p>
                </div>
            )}
        </div>
    );
}
