'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
    filterCardNumberInput,
    filterNumberInput,
    filterNameInput,
    validateCardNumber,
    validateCardExpiry,
    validateCVV,
    validateName,
    FORMAT_HINTS,
} from '@/utils/validation';
import { FormFieldHint } from '@/components/ui/FormFieldHint';

const paymentSchema = z.object({
    paymentMethod: z.enum(['card', 'cash', 'bank_transfer']),
    cardNumber: z.string().optional(),
    cardExpiry: z.string().optional(),
    cardCvv: z.string().optional(),
    cardName: z.string().optional(),
    promoCode: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface BookingStep3Props {
    onNext: (paymentData: PaymentFormData) => void;
    onBack: () => void;
    totalAmount: number;
}

export default function BookingStep3({ onNext, onBack, totalAmount }: BookingStep3Props) {
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash' | 'bank_transfer'>('cash');
    const [discount, setDiscount] = useState(0);
    const [cardErrors, setCardErrors] = useState<Record<string, string>>({});

    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors },
    } = useForm<PaymentFormData>({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            paymentMethod: 'cash',
        },
    });

    const onSubmit = (data: PaymentFormData) => {
        const submission = { ...data, paymentMethod };
        // Strict validation only when card is selected — cash / bank transfer
        // pass through directly so users can book without payment.
        if (paymentMethod === 'card') {
            const errs: Record<string, string> = {};
            const numErr = validateCardNumber(submission.cardNumber || '');
            if (numErr) errs.cardNumber = numErr;
            const expErr = validateCardExpiry(submission.cardExpiry || '');
            if (expErr) errs.cardExpiry = expErr;
            const cvvErr = validateCVV(submission.cardCvv || '');
            if (cvvErr) errs.cardCvv = cvvErr;
            const nameErr = validateName(submission.cardName || '', 'Cardholder name');
            if (nameErr) errs.cardName = nameErr;
            if (Object.keys(errs).length) {
                setCardErrors(errs);
                toast.error(Object.values(errs)[0]);
                return;
            }
        }
        setCardErrors({});
        onNext(submission);
    };

    const finalAmount = totalAmount - discount;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Payment Details</h2>
                <p className="mt-2 text-gray-600">
                    Complete your booking by providing payment information
                </p>
            </div>

            <form id="form-components-booking-BookingStep3" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Payment Method Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Payment Method
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                        <button id="booking-booking-step3-btn"
                            type="button"
                            onClick={() => setPaymentMethod('card')}
                            className={`p-4 border-2 rounded-lg transition-all ${paymentMethod === 'card'
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <div className="text-center">
                                <svg
                                    className="w-8 h-8 mx-auto mb-2"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                                </svg>
                                <span className="text-sm font-medium">Credit Card</span>
                            </div>
                        </button>

                        <button id="booking-booking-step3-btn-2"
                            type="button"
                            onClick={() => setPaymentMethod('cash')}
                            className={`p-4 border-2 rounded-lg transition-all ${paymentMethod === 'cash'
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <div className="text-center">
                                <svg
                                    className="w-8 h-8 mx-auto mb-2"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                </svg>
                                <span className="text-sm font-medium">Cash</span>
                            </div>
                        </button>

                        <button id="booking-booking-step3-btn-3"
                            type="button"
                            onClick={() => setPaymentMethod('bank_transfer')}
                            className={`p-4 border-2 rounded-lg transition-all ${paymentMethod === 'bank_transfer'
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <div className="text-center">
                                <svg
                                    className="w-8 h-8 mx-auto mb-2"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"></path>
                                </svg>
                                <span className="text-sm font-medium">Bank Transfer</span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Cash / Bank transfer info banner — payment collected later at the venue */}
                {paymentMethod !== 'card' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                        <p className="font-medium mb-1">No payment required to confirm</p>
                        <p>
                            {paymentMethod === 'cash'
                                ? "Pay at the venue when you arrive — your spot is held the moment you confirm."
                                : "We'll share bank-transfer instructions by email after your booking is confirmed."}
                        </p>
                    </div>
                )}

                {/* Card Details (only for card payment) */}
                {paymentMethod === 'card' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Card Number
                            </label>
                            <input
                                type="text"
                                {...register('cardNumber')}
                                onKeyDown={filterCardNumberInput}
                                maxLength={19}
                                placeholder="1234 5678 9012 3456"
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${(errors.cardNumber || cardErrors.cardNumber) ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            <FormFieldHint hint={FORMAT_HINTS.cardNumber} error={errors.cardNumber?.message || cardErrors.cardNumber} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Expiry Date
                                </label>
                                <input
                                    type="text"
                                    {...register('cardExpiry')}
                                    placeholder="MM/YY"
                                    maxLength={5}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${(errors.cardExpiry || cardErrors.cardExpiry) ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                <FormFieldHint hint={FORMAT_HINTS.cardExpiry} error={errors.cardExpiry?.message || cardErrors.cardExpiry} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    CVV
                                </label>
                                <input
                                    type="text"
                                    {...register('cardCvv')}
                                    onKeyDown={filterNumberInput}
                                    placeholder="123"
                                    maxLength={4}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${(errors.cardCvv || cardErrors.cardCvv) ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                <FormFieldHint hint={FORMAT_HINTS.cvv} error={errors.cardCvv?.message || cardErrors.cardCvv} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Cardholder Name
                            </label>
                            <input
                                type="text"
                                {...register('cardName')}
                                onKeyDown={filterNameInput}
                                placeholder="John Doe"
                                maxLength={80}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${(errors.cardName || cardErrors.cardName) ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            <FormFieldHint hint={FORMAT_HINTS.name} error={errors.cardName?.message || cardErrors.cardName} />
                        </div>
                    </div>
                )}

                {/* Promo Code */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Promo Code (Optional)
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            {...register('promoCode')}
                            placeholder="Enter promo code"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button id="booking-booking-step3-btn-apply"
                            type="button"
                            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Apply
                        </button>
                    </div>
                </div>

                {/* Price Summary */}
                <div className="bg-gray-50 p-6 rounded-lg space-y-3">
                    <div className="flex justify-between text-gray-700">
                        <span>Subtotal</span>
                        <span>${totalAmount.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                        <div className="flex justify-between text-green-600">
                            <span>Discount</span>
                            <span>-${discount.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                        <span>Total</span>
                        <span>${finalAmount.toFixed(2)}</span>
                    </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6">
                    <button id="booking-booking-step3-btn-back"
                        type="button"
                        onClick={onBack}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Back
                    </button>
                    <button id="booking-booking-step3-btn-complete-booking"
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Complete Booking
                    </button>
                </div>
            </form>
        </div>
    );
}
