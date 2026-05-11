'use client';

import { useState } from 'react';
import { Calendar, Clock, MapPin, User, Mail, Phone, Dumbbell, AlertCircle, CreditCard, Banknote, CheckCircle } from 'lucide-react';
import { apiClient } from '@/services/api/client';
import { validateCardNumber, validateCVV, validateCardExpiry, validateName } from '@/utils/validation';
import { toast } from 'sonner';

interface ReviewConfirmProps {
    bookingData: {
        program: string;
        childName: string;
        childAge: string;
        childGender: string;
        childDOB?: string;
        location: string;
        date: string;
        timeSlot: string;
        parentName: string;
        parentEmail: string;
        parentPhone: string;
        emergencyContact?: string;
    };
    onConfirm: () => void;
}

type PaymentMethod = '' | 'free' | 'card' | 'cash';

export default function ReviewConfirm({ bookingData, onConfirm }: ReviewConfirmProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('free');
    const [card, setCard] = useState({ name: '', number: '', expiry: '', cvv: '' });
    const [cardErrors, setCardErrors] = useState<Record<string, string>>({});

    // First assessment is free — no upcharge, no inflated "discount" pricing.
    const ASSESSMENT_FEE = 0;

    const programNames: { [key: string]: string } = {
        'gymnastics': 'Gymnastics',
        'multi-sports': 'Multi-Sports',
        'camps': 'Holiday Camps'
    };

    const locationNames: { [key: string]: string } = {
        'central': 'Central Sports Center',
        'east': 'East Side Academy',
        'west': 'West Point Facility',
        'cyberport': 'Cyberport Location',
        'wan-chai': 'Wan Chai Location'
    };

    const timeSlots: { [key: string]: string } = {
        '09:00': '9:00 AM',
        '10:00': '10:00 AM',
        '11:00': '11:00 AM',
        '14:00': '2:00 PM',
        '15:00': '3:00 PM',
        '16:00': '4:00 PM',
        '17:00': '5:00 PM',
        '18:00': '6:00 PM'
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const validateCardForm = (): boolean => {
        if (paymentMethod !== 'card') return true;
        const errs: Record<string, string> = {};
        const nameErr = validateName(card.name, 'Cardholder name');
        if (nameErr) errs.name = nameErr;
        const numErr = validateCardNumber(card.number);
        if (numErr) errs.number = numErr;
        const expErr = validateCardExpiry(card.expiry);
        if (expErr) errs.expiry = expErr;
        const cvvErr = validateCVV(card.cvv);
        if (cvvErr) errs.cvv = cvvErr;
        setCardErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleConfirm = async () => {
        setError(null);

        // Require payment method selection
        if (!paymentMethod) {
            setError('Please select a payment method before confirming.');
            toast.error('Please select a payment method before confirming.');
            return;
        }
        if (paymentMethod === 'card' && !validateCardForm()) {
            setError('Please complete the card details before confirming.');
            toast.error('Please complete the card details before confirming.');
            return;
        }

        setIsSubmitting(true);
        try {
            let timeSlot = bookingData.timeSlot;
            if (timeSlot.includes('AM') || timeSlot.includes('PM')) {
                const hour = parseInt(timeSlot.split(':')[0]);
                const isPM = timeSlot.includes('PM');
                const hour24 = isPM && hour !== 12 ? hour + 12 : (hour === 12 && !isPM ? 0 : hour);
                timeSlot = `${hour24.toString().padStart(2, '0')}:00`;
            }

            const payload: any = {
                program: bookingData.program,
                childName: bookingData.childName,
                childAge: parseInt(bookingData.childAge),
                childGender: bookingData.childGender || 'Prefer not to say',
                location: bookingData.location,
                date: bookingData.date,
                timeSlot: timeSlot,
                parentName: bookingData.parentName,
                parentEmail: bookingData.parentEmail,
                parentPhone: bookingData.parentPhone,
                paymentMethod,
                amount: ASSESSMENT_FEE,
            };

            if (bookingData.childDOB) payload.childDOB = bookingData.childDOB;
            if (bookingData.emergencyContact) payload.emergencyContact = bookingData.emergencyContact;

            const result = await apiClient.post('/bookings/assessment', payload);

            if (result.success) {
                onConfirm();
            } else {
                setError(result.message || 'Failed to book assessment. Please try again.');
            }
        } catch (err: any) {
            console.error('Error submitting booking:', err);
            if (err.response?.status === 401) {
                setError('Please login to book an assessment. Redirecting to login...');
                setTimeout(() => {
                    window.location.href = `/login?redirectTo=${encodeURIComponent('/book-assessment')}`;
                }, 2000);
            } else {
                setError(err.response?.data?.message || 'Network error. Please check your connection and try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Review & Confirm
            </h2>
            <p className="text-gray-600 mb-8">
                Please review your booking details before confirming
            </p>

            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-medium text-red-900">Booking Error</h4>
                        <p className="text-sm text-red-800">{error}</p>
                    </div>
                </div>
            )}

            <div className="space-y-6">
                {/* Assessment Summary Card */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Dumbbell className="w-5 h-5 text-blue-600" />
                        Assessment Details
                    </h3>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                <Dumbbell className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <div className="text-sm text-gray-600">Program</div>
                                <div className="font-medium text-gray-900">
                                    {programNames[bookingData.program]}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                                <Clock className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <div className="text-sm text-gray-600">Duration</div>
                                <div className="font-medium text-gray-900">30 minutes</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Child Information */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-green-600" />
                        Child Information
                    </h3>

                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Name:</span>
                            <span className="font-medium text-gray-900">{bookingData.childName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Age:</span>
                            <span className="font-medium text-gray-900">{bookingData.childAge} years old</span>
                        </div>
                        {bookingData.childDOB && (
                            <div className="flex justify-between">
                                <span className="text-gray-600">Date of Birth:</span>
                                <span className="font-medium text-gray-900">{new Date(bookingData.childDOB).toLocaleDateString()}</span>
                            </div>
                        )}
                        {bookingData.childGender && (
                            <div className="flex justify-between">
                                <span className="text-gray-600">Gender:</span>
                                <span className="font-medium text-gray-900">{bookingData.childGender}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Date & Location */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-orange-600" />
                        Date & Location
                    </h3>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            <div>
                                <div className="text-sm text-gray-600">Date</div>
                                <div className="font-medium text-gray-900">
                                    {formatDate(bookingData.date)}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-gray-400" />
                            <div>
                                <div className="text-sm text-gray-600">Time</div>
                                <div className="font-medium text-gray-900">
                                    {timeSlots[bookingData.timeSlot] || bookingData.timeSlot}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-gray-400" />
                            <div>
                                <div className="text-sm text-gray-600">Location</div>
                                <div className="font-medium text-gray-900">
                                    {locationNames[bookingData.location]}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Parent Contact */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Mail className="w-5 h-5 text-blue-600" />
                        Contact Information
                    </h3>

                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Parent Name:</span>
                            <span className="font-medium text-gray-900">{bookingData.parentName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Email:</span>
                            <span className="font-medium text-gray-900">{bookingData.parentEmail}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Phone:</span>
                            <span className="font-medium text-gray-900">{bookingData.parentPhone}</span>
                        </div>
                        {bookingData.emergencyContact && (
                            <div className="flex justify-between">
                                <span className="text-gray-600">Emergency:</span>
                                <span className="font-medium text-gray-900">{bookingData.emergencyContact}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Pricing */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                        Assessment Fee
                    </h3>
                    <p className="text-sm text-emerald-800 mb-2">
                        Your first assessment with us is completely <strong>FREE</strong>.
                    </p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-emerald-200">
                        <span className="text-gray-700 font-medium">Total</span>
                        <span className="text-2xl font-bold text-emerald-700">HK$ {ASSESSMENT_FEE.toFixed(2)}</span>
                    </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-indigo-600" />
                        Payment Method *
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                        <button
                            id="review-confirm-pay-free-btn"
                            type="button"
                            onClick={() => { setPaymentMethod('free'); setCardErrors({}); }}
                            className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-colors ${paymentMethod === 'free' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}
                        >
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-medium">Free Assessment</span>
                        </button>
                        <button
                            id="review-confirm-pay-card-btn"
                            type="button"
                            onClick={() => setPaymentMethod('card')}
                            className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-colors ${paymentMethod === 'card' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}
                        >
                            <CreditCard className="w-5 h-5" />
                            <span className="font-medium">Pay by Card</span>
                        </button>
                        <button
                            id="review-confirm-pay-cash-btn"
                            type="button"
                            onClick={() => { setPaymentMethod('cash'); setCardErrors({}); }}
                            className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-colors ${paymentMethod === 'cash' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}
                        >
                            <Banknote className="w-5 h-5" />
                            <span className="font-medium">Pay at Venue</span>
                        </button>
                    </div>

                    {/* Card details — only shown when "Pay by Card" is selected */}
                    {paymentMethod === 'card' && (
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                            <h4 className="font-medium text-gray-900">Card Details</h4>
                            <div>
                                <label className="block text-sm text-gray-700 mb-1">Cardholder Name</label>
                                <input
                                    type="text"
                                    value={card.name}
                                    onChange={(e) => setCard(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Name on card"
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${cardErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {cardErrors.name && <p className="text-xs text-red-600 mt-1">{cardErrors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm text-gray-700 mb-1">Card Number</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={card.number}
                                    onChange={(e) => setCard(prev => ({ ...prev, number: e.target.value.replace(/[^0-9 ]/g, '').slice(0, 19) }))}
                                    placeholder="1234 5678 9012 3456"
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono ${cardErrors.number ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {cardErrors.number && <p className="text-xs text-red-600 mt-1">{cardErrors.number}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm text-gray-700 mb-1">Expiry (MM/YY)</label>
                                    <input
                                        type="text"
                                        value={card.expiry}
                                        onChange={(e) => {
                                            let v = e.target.value.replace(/[^0-9/]/g, '').slice(0, 5);
                                            if (v.length === 2 && !v.includes('/')) v = v + '/';
                                            setCard(prev => ({ ...prev, expiry: v }));
                                        }}
                                        placeholder="MM/YY"
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono ${cardErrors.expiry ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {cardErrors.expiry && <p className="text-xs text-red-600 mt-1">{cardErrors.expiry}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-1">CVV</label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={card.cvv}
                                        onChange={(e) => setCard(prev => ({ ...prev, cvv: e.target.value.replace(/[^0-9]/g, '').slice(0, 4) }))}
                                        placeholder="123"
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono ${cardErrors.cvv ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {cardErrors.cvv && <p className="text-xs text-red-600 mt-1">{cardErrors.cvv}</p>}
                                </div>
                            </div>
                            <p className="text-xs text-gray-500">
                                Note: First assessment is free. Card is collected for future paid sessions only — you will not be charged today.
                            </p>
                        </div>
                    )}
                </div>

                {/* Important Notes */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
                    <h4 className="font-medium text-yellow-900 mb-3">
                        Important Notes
                    </h4>
                    <ul className="text-sm text-yellow-800 space-y-2">
                        <li>• Please arrive 10 minutes early for check-in</li>
                        <li>• Bring comfortable clothes and water bottle</li>
                        <li>• Parents are welcome to observe the assessment</li>
                        <li>• Free parking is available at all locations</li>
                        <li>• You'll receive a confirmation email shortly</li>
                    </ul>
                </div>

                {/* Confirm Button */}
                <button id="booking-steps-review-confirm-btn"
                    onClick={handleConfirm}
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold text-lg py-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:cursor-not-allowed disabled:scale-100"
                >
                    {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Confirming Booking...
                        </span>
                    ) : (
                        'Confirm Assessment Booking'
                    )}
                </button>
            </div>
        </div>
    );
}
