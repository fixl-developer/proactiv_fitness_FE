'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiCreditCard, FiLock, FiAlertCircle } from 'react-icons/fi'
import { PaymentMethod } from '@/services/paymentService'

interface PaymentFormProps {
    amount: number
    currency: string
    onSubmit: (paymentData: {
        paymentMethodId?: string
        cardNumber?: string
        expiryMonth?: number
        expiryYear?: number
        cvv?: string
        cardholderName?: string
        saveCard?: boolean
    }) => Promise<void>
    savedMethods?: Array<{
        _id: string
        type: PaymentMethod
        last4: string
        brand: string
        expiryMonth: number
        expiryYear: number
        isDefault: boolean
    }>
}

export default function PaymentForm({ amount, currency, onSubmit, savedMethods = [] }: PaymentFormProps) {
    const [useNewCard, setUseNewCard] = useState(savedMethods.length === 0)
    const [selectedMethodId, setSelectedMethodId] = useState(savedMethods.find(m => m.isDefault)?._id || '')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // New card form state
    const [cardNumber, setCardNumber] = useState('')
    const [expiryMonth, setExpiryMonth] = useState('')
    const [expiryYear, setExpiryYear] = useState('')
    const [cvv, setCvv] = useState('')
    const [cardholderName, setCardholderName] = useState('')
    const [saveCard, setSaveCard] = useState(false)

    const formatCardNumber = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
        const matches = v.match(/\d{4,16}/g)
        const match = (matches && matches[0]) || ''
        const parts = []

        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4))
        }

        if (parts.length) {
            return parts.join(' ')
        } else {
            return value
        }
    }

    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCardNumber(e.target.value)
        if (formatted.replace(/\s/g, '').length <= 16) {
            setCardNumber(formatted)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            if (useNewCard) {
                // Validate new card
                if (!cardNumber || !expiryMonth || !expiryYear || !cvv || !cardholderName) {
                    throw new Error('Please fill in all card details')
                }

                if (cardNumber.replace(/\s/g, '').length !== 16) {
                    throw new Error('Invalid card number')
                }

                if (cvv.length < 3 || cvv.length > 4) {
                    throw new Error('Invalid CVV')
                }

                await onSubmit({
                    cardNumber: cardNumber.replace(/\s/g, ''),
                    expiryMonth: parseInt(expiryMonth),
                    expiryYear: parseInt(expiryYear),
                    cvv,
                    cardholderName,
                    saveCard
                })
            } else {
                // Use saved card
                if (!selectedMethodId) {
                    throw new Error('Please select a payment method')
                }

                await onSubmit({
                    paymentMethodId: selectedMethodId
                })
            }
        } catch (err: any) {
            setError(err.message || 'Payment failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form data-testid="form-components-booking-PaymentForm" onSubmit={handleSubmit} className="space-y-6">
            {/* Amount Display */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
                <p className="text-sm opacity-90 mb-1">Total Amount</p>
                <p className="text-4xl font-bold">
                    ${amount.toFixed(2)} <span className="text-xl">{currency}</span>
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-2"
                >
                    <FiAlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                </motion.div>
            )}

            {/* Payment Method Selection */}
            {savedMethods.length > 0 && (
                <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">
                        Payment Method
                    </label>

                    {/* Saved Cards */}
                    <div className="space-y-2">
                        {savedMethods.map((method) => (
                            <label
                                key={method._id}
                                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${!useNewCard && selectedMethodId === method._id
                                        ? 'border-blue-600 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value={method._id}
                                    checked={!useNewCard && selectedMethodId === method._id}
                                    onChange={() => {
                                        setUseNewCard(false)
                                        setSelectedMethodId(method._id)
                                    }}
                                    className="w-4 h-4 text-blue-600"
                                />
                                <div className="ml-3 flex-1">
                                    <div className="flex items-center space-x-2">
                                        <FiCreditCard className="w-5 h-5 text-gray-600" />
                                        <span className="font-medium text-gray-900">
                                            {method.brand} •••• {method.last4}
                                        </span>
                                        {method.isDefault && (
                                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">
                                                Default
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Expires {method.expiryMonth}/{method.expiryYear}
                                    </p>
                                </div>
                            </label>
                        ))}

                        {/* New Card Option */}
                        <label
                            className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${useNewCard
                                    ? 'border-blue-600 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <input
                                type="radio"
                                name="paymentMethod"
                                checked={useNewCard}
                                onChange={() => setUseNewCard(true)}
                                className="w-4 h-4 text-blue-600"
                            />
                            <div className="ml-3">
                                <span className="font-medium text-gray-900">Use a new card</span>
                            </div>
                        </label>
                    </div>
                </div>
            )}

            {/* New Card Form */}
            {useNewCard && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4"
                >
                    {/* Card Number */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Card Number
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={cardNumber}
                                onChange={handleCardNumberChange}
                                placeholder="1234 5678 9012 3456"
                                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                            <FiCreditCard className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>
                    </div>

                    {/* Cardholder Name */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Cardholder Name
                        </label>
                        <input
                            type="text"
                            value={cardholderName}
                            onChange={(e) => setCardholderName(e.target.value)}
                            placeholder="John Doe"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>

                    {/* Expiry & CVV */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Month
                            </label>
                            <select data-testid="select-components-booking-PaymentForm-1"
                                value={expiryMonth}
                                onChange={(e) => setExpiryMonth(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                <option value="">MM</option>
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                    <option key={month} value={month.toString().padStart(2, '0')}>
                                        {month.toString().padStart(2, '0')}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Year
                            </label>
                            <select data-testid="select-components-booking-PaymentForm-2"
                                value={expiryYear}
                                onChange={(e) => setExpiryYear(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                <option value="">YY</option>
                                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                                    <option key={year} value={year.toString().slice(-2)}>
                                        {year.toString().slice(-2)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                CVV
                            </label>
                            <input
                                type="text"
                                value={cvv}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '')
                                    if (value.length <= 4) setCvv(value)
                                }}
                                placeholder="123"
                                maxLength={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>
                    </div>

                    {/* Save Card Checkbox */}
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="saveCard"
                            checked={saveCard}
                            onChange={(e) => setSaveCard(e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="saveCard" className="text-sm text-gray-700">
                            Save this card for future payments
                        </label>
                    </div>
                </motion.div>
            )}

            {/* Security Notice */}
            <div className="flex items-start space-x-2 bg-gray-50 rounded-lg p-4">
                <FiLock className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                    <p className="text-sm font-semibold text-gray-900">Secure Payment</p>
                    <p className="text-xs text-gray-600 mt-1">
                        Your payment information is encrypted and secure. We never store your full card details.
                    </p>
                </div>
            </div>

            {/* Submit Button */}
            <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className={`w-full py-4 rounded-lg font-bold text-white transition-all shadow-lg ${loading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                    }`}
            >
                {loading ? (
                    <span className="flex items-center justify-center space-x-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Processing...</span>
                    </span>
                ) : (
                    `Pay $${amount.toFixed(2)} ${currency}`
                )}
            </motion.button>
        </form>
    )
}
