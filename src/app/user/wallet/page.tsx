'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Wallet, Plus, Send, TrendingDown, ArrowUpRight, ArrowDownLeft, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { walletService } from '@/services/modules/wallet.service'
import {
    validateCurrency,
    validateSelect,
    validateName,
    validateCardNumber,
    validateCVV,
    validateCardExpiry,
    filterNameInput,
    filterCardNumberInput
} from '@/utils/validation'

interface Transaction {
    _id: string
    type: 'credit' | 'debit'
    amount: number
    description: string
    date: string
    status: 'completed' | 'pending' | 'failed'
}

interface AddFundsForm {
    amount: string
    paymentMethod: string
    cardholderName: string
    cardNumber: string
    expiry: string
    cvv: string
}

const EMPTY_FORM: AddFundsForm = {
    amount: '',
    paymentMethod: '',
    cardholderName: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
}

export default function WalletPage() {
    const [balance, setBalance] = useState(0)
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
    const [showAddFunds, setShowAddFunds] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [filterType, setFilterType] = useState<'all' | 'credit' | 'debit'>('all')
    const [form, setForm] = useState<AddFundsForm>(EMPTY_FORM)
    const [errors, setErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        fetchWalletData()
    }, [])

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text })
        setTimeout(() => setMessage(null), 3500)
    }

    const fetchWalletData = async () => {
        try {
            setLoading(true)
            const [balanceRes, transactionsRes] = await Promise.all([
                walletService.getBalance(),
                walletService.getTransactions()
            ])

            if (balanceRes?.success) {
                // Backend returns { totalBalance, creditBuckets, ... }; older code read `balance`
                // and showed 0 forever (BUG_017).
                const data: any = balanceRes.data || {}
                setBalance(
                    typeof data.totalBalance === 'number'
                        ? data.totalBalance
                        : typeof data.balance === 'number'
                            ? data.balance
                            : 0
                )
            }
            if (transactionsRes?.success) {
                setTransactions(Array.isArray(transactionsRes.data) ? transactionsRes.data : [])
            }
        } catch (err: any) {
            showMessage('error', err?.message || 'Failed to fetch wallet data')
        } finally {
            setLoading(false)
        }
    }

    const updateField = (field: keyof AddFundsForm, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }))
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
    }

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}

        const amtErr = validateCurrency(form.amount, 'Amount')
        if (amtErr) newErrors.amount = amtErr
        else if (parseFloat(form.amount) <= 0) newErrors.amount = 'Amount must be greater than 0'

        const methodErr = validateSelect(form.paymentMethod, 'Payment Method')
        if (methodErr) newErrors.paymentMethod = methodErr

        // Card fields only required for card methods
        const isCard = form.paymentMethod === 'Credit Card' || form.paymentMethod === 'Debit Card'
        if (isCard) {
            const nameErr = validateName(form.cardholderName, 'Cardholder name')
            if (nameErr) newErrors.cardholderName = nameErr

            const cardErr = validateCardNumber(form.cardNumber)
            if (cardErr) newErrors.cardNumber = cardErr

            const expErr = validateCardExpiry(form.expiry)
            if (expErr) newErrors.expiry = expErr

            const cvvErr = validateCVV(form.cvv)
            if (cvvErr) newErrors.cvv = cvvErr
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleAddFunds = async () => {
        if (!validateForm()) return

        try {
            setSubmitting(true)
            const amountNum = parseFloat(form.amount)
            const res = await walletService.addFunds(amountNum)

            if (res?.success) {
                setBalance(prev => prev + amountNum)

                // Prepend a pending transaction record optimistically
                const newTx: Transaction = res.data?.transaction || {
                    _id: `tx-${Date.now()}`,
                    type: 'credit',
                    amount: amountNum,
                    description: `Wallet top-up via ${form.paymentMethod}`,
                    date: new Date().toLocaleDateString(),
                    status: 'completed'
                }
                setTransactions(prev => [newTx, ...prev])

                setForm(EMPTY_FORM)
                setErrors({})
                setShowAddFunds(false)
                showMessage('success', 'Funds added successfully')
                // Re-sync with backend
                fetchWalletData()
            } else {
                showMessage('error', res?.error || 'Failed to add funds')
            }
        } catch (err: any) {
            showMessage('error', err?.message || 'Failed to add funds')
        } finally {
            setSubmitting(false)
        }
    }

    const handleRequestRefund = async () => {
        try {
            const res = await walletService.requestRefund()
            if (res?.success) {
                showMessage('success', 'Refund request submitted')
                await fetchWalletData()
            } else {
                showMessage('error', res?.error || 'Failed to request refund')
            }
        } catch (err: any) {
            showMessage('error', err?.message || 'Failed to request refund')
        }
    }

    const filteredTransactions = transactions.filter(tx => {
        if (filterType === 'all') return true
        return tx.type === filterType
    })

    const isCardMethod = form.paymentMethod === 'Credit Card' || form.paymentMethod === 'Debit Card'

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading wallet...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Wallet</h1>
                <p className="text-gray-600 mt-2 text-sm font-medium">Manage your account balance and transactions</p>
            </div>

            {/* Message Alert */}
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-lg p-4 flex items-start gap-3 ${message.type === 'success'
                        ? 'bg-emerald-50 border border-emerald-200'
                        : 'bg-red-50 border border-red-200'
                        }`}
                >
                    {message.type === 'success' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    ) : (
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <p className={`text-sm font-medium ${message.type === 'success' ? 'text-emerald-800' : 'text-red-800'}`}>
                        {message.text}
                    </p>
                </motion.div>
            )}

            {/* Balance Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-emerald-100 text-sm font-semibold">Current Balance</p>
                            <p className="text-4xl font-bold mt-2">
                                ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>
                        <Wallet className="w-16 h-16 opacity-20" />
                    </div>
                </Card>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
                <Button
                    onClick={() => setShowAddFunds(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-12"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Funds
                </Button>
                <Button
                    onClick={handleRequestRefund}
                    variant="outline"
                    className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 font-semibold h-12"
                >
                    <Send className="w-4 h-4 mr-2" />
                    Request Refund
                </Button>
                <Button
                    variant="outline"
                    className="border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold h-12"
                >
                    <TrendingDown className="w-4 h-4 mr-2" />
                    View Report
                </Button>
            </motion.div>

            {/* Transactions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
            >
                <Card className="p-6 border-gray-200/50">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
                        <div className="flex gap-2">
                            <Button
                                onClick={() => setFilterType('all')}
                                variant={filterType === 'all' ? 'default' : 'outline'}
                                size="sm"
                                className={filterType === 'all' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'border-gray-200 hover:bg-gray-50'}
                            >
                                All
                            </Button>
                            <Button
                                onClick={() => setFilterType('credit')}
                                variant={filterType === 'credit' ? 'default' : 'outline'}
                                size="sm"
                                className={filterType === 'credit' ? 'bg-green-600 hover:bg-green-700 text-white' : 'border-gray-200 hover:bg-gray-50'}
                            >
                                Credit
                            </Button>
                            <Button
                                onClick={() => setFilterType('debit')}
                                variant={filterType === 'debit' ? 'default' : 'outline'}
                                size="sm"
                                className={filterType === 'debit' ? 'bg-red-600 hover:bg-red-700 text-white' : 'border-gray-200 hover:bg-gray-50'}
                            >
                                Debit
                            </Button>
                        </div>
                    </div>

                    {filteredTransactions.length > 0 ? (
                        <div className="space-y-3">
                            {filteredTransactions.map((tx, index) => (
                                <motion.div
                                    key={tx._id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.03 }}
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${tx.type === 'credit' ? 'bg-green-100' : 'bg-red-100'}`}>
                                            {tx.type === 'credit' ? (
                                                <ArrowDownLeft className="w-5 h-5 text-green-600" />
                                            ) : (
                                                <ArrowUpRight className="w-5 h-5 text-red-600" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{tx.description}</p>
                                            <p className="text-sm text-gray-600">{tx.date}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-bold text-lg ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                            {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </p>
                                        <p className={`text-xs font-semibold ${tx.status === 'completed' ? 'text-green-600' : tx.status === 'pending' ? 'text-yellow-600' : 'text-red-600'}`}>
                                            {tx.status.toUpperCase()}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-900 font-semibold">No transactions yet</p>
                            <p className="text-sm text-gray-500 mt-1">Add funds to your wallet to see activity here.</p>
                        </div>
                    )}
                </Card>
            </motion.div>

            {/* Add Funds Drawer */}
            <SlideInDrawer
                isOpen={showAddFunds}
                onClose={() => {
                    setShowAddFunds(false)
                    setErrors({})
                }}
                title="Add Funds to Wallet"
                description="Top up your wallet balance"
                size="md"
                footer={
                    <div className="flex items-center justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowAddFunds(false)
                                setErrors({})
                            }}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddFunds}
                            disabled={submitting}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            {submitting ? 'Processing...' : 'Add Funds'}
                        </Button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Amount (₹) <span className="text-red-500">*</span>
                        </label>
                        <Input
                            type="text"
                            inputMode="decimal"
                            value={form.amount}
                            onChange={(e) => updateField('amount', e.target.value)}
                            placeholder="e.g. 500.00"
                        />
                        {errors.amount && <p className="text-xs text-red-600 mt-1">{errors.amount}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Payment Method <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={form.paymentMethod}
                            onChange={(e) => updateField('paymentMethod', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        >
                            <option value="">Select payment method</option>
                            <option value="Credit Card">Credit Card</option>
                            <option value="Debit Card">Debit Card</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                        </select>
                        {errors.paymentMethod && <p className="text-xs text-red-600 mt-1">{errors.paymentMethod}</p>}
                    </div>

                    {isCardMethod && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Cardholder Name <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="text"
                                    value={form.cardholderName}
                                    onChange={(e) => updateField('cardholderName', e.target.value)}
                                    onKeyDown={filterNameInput}
                                    placeholder="John Smith"
                                />
                                {errors.cardholderName && <p className="text-xs text-red-600 mt-1">{errors.cardholderName}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Card Number <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="text"
                                    inputMode="numeric"
                                    value={form.cardNumber}
                                    onChange={(e) => updateField('cardNumber', e.target.value)}
                                    onKeyDown={filterCardNumberInput}
                                    placeholder="1234 5678 9012 3456"
                                    maxLength={19}
                                />
                                {errors.cardNumber && <p className="text-xs text-red-600 mt-1">{errors.cardNumber}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Expiry (MM/YY) <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="text"
                                        value={form.expiry}
                                        onChange={(e) => updateField('expiry', e.target.value)}
                                        placeholder="MM/YY"
                                        maxLength={5}
                                    />
                                    {errors.expiry && <p className="text-xs text-red-600 mt-1">{errors.expiry}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        CVV <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="text"
                                        inputMode="numeric"
                                        value={form.cvv}
                                        onChange={(e) => updateField('cvv', e.target.value.replace(/\D/g, ''))}
                                        placeholder="123"
                                        maxLength={4}
                                    />
                                    {errors.cvv && <p className="text-xs text-red-600 mt-1">{errors.cvv}</p>}
                                </div>
                            </div>
                        </>
                    )}

                    {form.paymentMethod === 'Bank Transfer' && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-800">
                                You will be redirected to complete the bank transfer after confirming this top-up.
                            </p>
                        </div>
                    )}
                </div>
            </SlideInDrawer>
        </div>
    )
}
