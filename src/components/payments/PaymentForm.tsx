'use client';

import { useState } from 'react';
import { paymentsApi } from '@/lib/api/payments';
import { toast } from 'sonner';

interface PaymentFormProps {
    studentId: string;
    amount: number;
    description: string;
    onSuccess?: () => void;
}

export default function PaymentForm({ studentId, amount, description, onSuccess }: PaymentFormProps) {
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash' | 'bank_transfer' | 'wallet'>('card');
    const [cardDetails, setCardDetails] = useState({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardholderName: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await paymentsApi.create({
                studentId,
                amount,
                description,
                paymentMethod,
                status: 'processing',
                paymentDate: new Date().toISOString(),
            });
            toast.success('Payment processed successfully');
            onSuccess?.();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Payment failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Details</h2>

                <div className="mb-4">
                    <p className="text-sm text-gray-600">Amount to Pay</p>
                    <p className="text-3xl font-bold text-gray-900">${amount.toFixed(2)}</p>
                    <p className="text-sm text-gray-600 mt-1">{description}</p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {['card', 'cash', 'bank_transfer', 'wallet'].map((method) => (
                                <button
                                    key={method}
                                    type="button"
                                    onClick={() => setPaymentMethod(method as any)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium ${paymentMethod === method
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {method.replace('_', ' ').toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {paymentMethod === 'card' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="1234 5678 9012 3456"
                                    value={cardDetails.cardNumber}
                                    onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="MM/YY"
                                        value={cardDetails.expiryDate}
                                        onChange={(e) => setCardDetails({ ...cardDetails, expiryDate: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="123"
                                        value={cardDetails.cvv}
                                        onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                                <input
                                    type="text"
                                    required
                                    value={cardDetails.cardholderName}
                                    onChange={(e) => setCardDetails({ ...cardDetails, cardholderName: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
                </button>
            </div>
        </form>
    );
}
