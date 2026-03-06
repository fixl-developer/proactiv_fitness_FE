'use client';

import { useState } from 'react';
import { paymentsApi } from '@/lib/api/payments';
import { toast } from 'sonner';

interface RefundModalProps {
    paymentId: string;
    amount: number;
    onClose: () => void;
    onSuccess: () => void;
}

export default function RefundModal({ paymentId, amount, onClose, onSuccess }: RefundModalProps) {
    const [loading, setLoading] = useState(false);
    const [refundAmount, setRefundAmount] = useState(amount);
    const [reason, setReason] = useState('');

    const handleRefund = async () => {
        if (!reason) {
            toast.error('Please provide a reason for refund');
            return;
        }

        try {
            setLoading(true);
            await paymentsApi.refund(paymentId, refundAmount, reason);
            toast.success('Refund processed successfully');
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to process refund');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Process Refund</h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Refund Amount</label>
                        <input
                            type="number"
                            min="0"
                            max={amount}
                            step="0.01"
                            value={refundAmount}
                            onChange={(e) => setRefundAmount(parseFloat(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">Maximum: ${amount.toFixed(2)}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
                        <textarea
                            required
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Explain why this refund is being processed..."
                        />
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={handleRefund}
                        disabled={loading}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : 'Process Refund'}
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
