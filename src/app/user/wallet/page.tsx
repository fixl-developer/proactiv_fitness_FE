'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Wallet, Plus, Send, TrendingDown, ArrowUpRight, ArrowDownLeft, AlertCircle, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { walletService } from '@/services/modules/wallet.service'

interface Transaction {
    _id: string
    type: 'credit' | 'debit'
    amount: number
    description: string
    date: string
    status: 'completed' | 'pending' | 'failed'
}

export default function WalletPage() {
    const [balance, setBalance] = useState(0)
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showAddFunds, setShowAddFunds] = useState(false)
    const [addAmount, setAddAmount] = useState('')
    const [filterType, setFilterType] = useState<'all' | 'credit' | 'debit'>('all')

    useEffect(() => {
        fetchWalletData()
    }, [])

    const fetchWalletData = async () => {
        try {
            setLoading(true)
            const [balanceRes, transactionsRes] = await Promise.all([
                walletService.getBalance(),
                walletService.getTransactions()
            ])

            if (balanceRes.success) {
                setBalance(balanceRes.data?.balance || 0)
            }
            if (transactionsRes.success) {
                setTransactions(transactionsRes.data || [])
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch wallet data')
        } finally {
            setLoading(false)
        }
    }

    const handleAddFunds = async () => {
        if (!addAmount || parseFloat(addAmount) <= 0) {
            setError('Please enter a valid amount')
            return
        }

        try {
            const res = await walletService.addFunds(parseFloat(addAmount))
            if (res.success) {
                setBalance(balance + parseFloat(addAmount))
                setAddAmount('')
                setShowAddFunds(false)
                await fetchWalletData()
            } else {
                setError(res.error || 'Failed to add funds')
            }
        } catch (err: any) {
            setError(err.message || 'Failed to add funds')
        }
    }

    const handleRequestRefund = async () => {
        try {
            const res = await walletService.requestRefund()
            if (res.success) {
                setError(null)
                await fetchWalletData()
            } else {
                setError(res.error || 'Failed to request refund')
            }
        } catch (err: any) {
            setError(err.message || 'Failed to request refund')
        }
    }

    const filteredTransactions = transactions.filter(tx => {
        if (filterType === 'all') return true
        return tx.type === filterType
    })

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

            {/* Error Alert */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3"
                >
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-red-800 font-semibold text-sm">Error</p>
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
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
                            <p className="text-4xl font-bold mt-2">₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
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
                    onClick={() => setShowAddFunds(!showAddFunds)}
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

            {/* Add Funds Form */}
            {showAddFunds && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card className="p-6 border-emerald-200/50 bg-emerald-50/50">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Add Funds to Wallet</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (₹)</label>
                                <input
                                    type="number"
                                    value={addAmount}
                                    onChange={(e) => setAddAmount(e.target.value)}
                                    placeholder="Enter amount"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    onClick={handleAddFunds}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                                >
                                    Add Funds
                                </Button>
                                <Button
                                    onClick={() => setShowAddFunds(false)}
                                    variant="outline"
                                    className="flex-1 border-gray-200 hover:bg-gray-50"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            )}

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
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${tx.type === 'credit' ? 'bg-green-100' : 'bg-red-100'}`}>
                                            {tx.type === 'credit' ? (
                                                <ArrowDownLeft className={`w-5 h-5 ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`} />
                                            ) : (
                                                <ArrowUpRight className={`w-5 h-5 ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`} />
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
                        <div className="text-center py-8">
                            <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">No transactions found</p>
                        </div>
                    )}
                </Card>
            </motion.div>
        </div>
    )
}
