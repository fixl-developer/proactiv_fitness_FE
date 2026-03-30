'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import CommissionService from '@/services/modules/commission.service'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, Plus, DollarSign, CheckCircle, Clock, TrendingUp, Download, FileText, X, CreditCard, Building2, Smartphone, Banknote, ArrowRight, Brain, Loader2, RefreshCw, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { apiClient } from '@/services/api/client'

const PAYMENT_METHODS = [
    { value: 'bank_transfer', label: 'Bank Transfer', icon: Building2, description: 'Direct deposit to your bank account' },
    { value: 'upi', label: 'UPI', icon: Smartphone, description: 'Instant transfer via UPI ID' },
    { value: 'paypal', label: 'PayPal', icon: CreditCard, description: 'Transfer to your PayPal account' },
    { value: 'check', label: 'Check', icon: Banknote, description: 'Physical check mailed to your address' },
]

export default function Commissions() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [commissions, setCommissions] = useState<any[]>([])
    const [stats, setStats] = useState<any>(null)
    const [payoutHistory, setPayoutHistory] = useState<any[]>([])
    const [exporting, setExporting] = useState(false)

    // Payout form state
    const [showPayoutModal, setShowPayoutModal] = useState(false)
    const [payoutSubmitting, setPayoutSubmitting] = useState(false)
    const [payoutForm, setPayoutForm] = useState({
        amount: '',
        method: 'bank_transfer',
        notes: '',
        bankDetails: { accountName: '', accountNumber: '', bankName: '', ifscCode: '' },
        paypalEmail: '',
        upiId: '',
    })
    const [payoutError, setPayoutError] = useState<string | null>(null)
    const [payoutSuccess, setPayoutSuccess] = useState<string | null>(null)

    const [aiForecast, setAiForecast] = useState<any>(null)
    const [aiLoading, setAiLoading] = useState(false)

    const partnerId = user?.id || 'partner-1'

    const loadAiRevenueForecast = async () => {
        setAiLoading(true)
        try {
            const result = await apiClient.get<any>('/advanced-analytics/predictive/partner-revenue')
            setAiForecast(result?.data)
        } catch (err) { console.error('AI revenue forecast unavailable:', err) }
        finally { setAiLoading(false) }
    }

    const loadData = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const [commissionsRes, statsRes, payoutsRes] = await Promise.all([
                CommissionService.getCommissions(partnerId, { limit: 20 }),
                CommissionService.getCommissionStats(partnerId),
                CommissionService.getPayoutHistory(partnerId, { limit: 10 }),
            ])
            setCommissions(commissionsRes.commissions || [])
            setStats(statsRes)
            setPayoutHistory(payoutsRes.payouts || [])
        } catch (err) {
            console.error('Error loading commissions:', err)
            setError('Failed to load commissions')
        } finally {
            setLoading(false)
        }
    }, [partnerId])

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        loadData()
        loadAiRevenueForecast()
    }, [isAuthenticated, router, loadData])

    const openPayoutModal = () => {
        const pendingAmount = stats?.totalPending || 0
        if (pendingAmount <= 0) {
            setError('No pending commissions available for payout.')
            return
        }
        setPayoutForm(prev => ({ ...prev, amount: pendingAmount.toString() }))
        setPayoutError(null)
        setPayoutSuccess(null)
        setShowPayoutModal(true)
    }

    const handlePayoutSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setPayoutError(null)
        setPayoutSuccess(null)

        const amount = parseFloat(payoutForm.amount)
        if (!amount || amount <= 0) {
            setPayoutError('Please enter a valid amount.')
            return
        }

        const pendingAmount = stats?.totalPending || 0
        if (amount > pendingAmount) {
            setPayoutError(`Amount cannot exceed pending balance of $${pendingAmount.toLocaleString()}.`)
            return
        }

        if (payoutForm.method === 'bank_transfer') {
            if (!payoutForm.bankDetails.accountName || !payoutForm.bankDetails.accountNumber || !payoutForm.bankDetails.bankName) {
                setPayoutError('Please fill in all bank details.')
                return
            }
        } else if (payoutForm.method === 'paypal') {
            if (!payoutForm.paypalEmail) {
                setPayoutError('Please enter your PayPal email.')
                return
            }
        } else if (payoutForm.method === 'upi') {
            if (!payoutForm.upiId) {
                setPayoutError('Please enter your UPI ID.')
                return
            }
        }

        setPayoutSubmitting(true)
        try {
            await CommissionService.requestCommissionPayout(partnerId, amount, payoutForm.method)
            setPayoutSuccess(`Payout request for $${amount.toLocaleString()} submitted successfully!`)
            // Reset form
            setPayoutForm({
                amount: '',
                method: 'bank_transfer',
                notes: '',
                bankDetails: { accountName: '', accountNumber: '', bankName: '', ifscCode: '' },
                paypalEmail: '',
                upiId: '',
            })
            // Refresh data after short delay
            setTimeout(async () => {
                await loadData()
                setShowPayoutModal(false)
            }, 2000)
        } catch (err: any) {
            console.error('Error requesting payout:', err)
            setPayoutError(err?.response?.data?.error || err?.message || 'Failed to submit payout request. Please try again.')
        } finally {
            setPayoutSubmitting(false)
        }
    }

    const handleExportCommissions = () => {
        setExporting(true)
        try {
            const headers = ['Period', 'Amount', 'Rate', 'Status', 'Date']
            const rows = commissions.map(c => [
                c.period || '',
                `$${c.amount?.toLocaleString() || '0'}`,
                `${c.rate || 0}%`,
                c.status || '',
                c.calculatedAt ? new Date(c.calculatedAt).toLocaleDateString() : ''
            ])
            const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `commissions_export_${new Date().toISOString().split('T')[0]}.csv`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
        } catch (err) {
            console.error('Export failed:', err)
        } finally {
            setExporting(false)
        }
    }

    const totalCommissions = stats?.totalCommissions || 0
    const totalPaid = stats?.totalPaid || 0
    const totalPending = stats?.totalPending || 0
    const avgCommission = commissions.length > 0
        ? Math.round(totalCommissions / commissions.length)
        : 0

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            paid: 'bg-green-100 text-green-800',
            completed: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            processing: 'bg-blue-100 text-blue-800',
            approved: 'bg-blue-100 text-blue-800',
            disputed: 'bg-red-100 text-red-800',
            failed: 'bg-red-100 text-red-800',
            rejected: 'bg-red-100 text-red-800',
        }
        return styles[status] || 'bg-gray-100 text-gray-800'
    }

    const getMethodLabel = (method: string) => {
        const labels: Record<string, string> = {
            bank_transfer: 'Bank Transfer',
            paypal: 'PayPal',
            upi: 'UPI',
            check: 'Check',
        }
        return labels[method] || method
    }

    if (!isAuthenticated) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Commission Management</h1>
                    <div className="flex gap-3">
                        <button
                            id="partner-commissions-export-btn"
                            onClick={handleExportCommissions}
                            disabled={exporting || commissions.length === 0}
                            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center gap-2 disabled:opacity-50 transition-colors"
                        >
                            <Download className="w-5 h-5" />
                            {exporting ? 'Exporting...' : 'Export CSV'}
                        </button>
                        <button
                            id="partner-commissions-request-payout-btn"
                            onClick={openPayoutModal}
                            disabled={totalPending <= 0}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Request Payout
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800">{error}</p>
                        <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        { title: 'Total Commissions', value: `$${totalCommissions.toLocaleString()}`, icon: DollarSign, gradient: 'from-blue-500 to-blue-600', bgGradient: 'from-blue-50 to-blue-100', change: `${commissions.length} entries` },
                        { title: 'Total Paid', value: `$${totalPaid.toLocaleString()}`, icon: CheckCircle, gradient: 'from-green-500 to-green-600', bgGradient: 'from-green-50 to-green-100', change: 'Paid out' },
                        { title: 'Pending', value: `$${totalPending.toLocaleString()}`, icon: Clock, gradient: 'from-amber-500 to-amber-600', bgGradient: 'from-amber-50 to-amber-100', change: 'Awaiting payout' },
                        { title: 'Avg Commission', value: `$${avgCommission.toLocaleString()}`, icon: TrendingUp, gradient: 'from-purple-500 to-purple-600', bgGradient: 'from-purple-50 to-purple-100', change: 'Per entry' },
                    ].map((metric, idx) => (
                        <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                            <Card className={`hover:shadow-lg transition-all border-0 bg-gradient-to-br ${metric.bgGradient}`}>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className={`bg-gradient-to-br ${metric.gradient} p-2.5 rounded-lg shadow-md`}>
                                            <metric.icon className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">{metric.change}</span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 font-medium mb-1">{metric.title}</p>
                                        <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* AI Revenue Forecast */}
                <Card className="border-purple-200">
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Brain className="w-5 h-5 text-purple-600" />
                                <span className="font-semibold text-sm">AI Revenue Forecast</span>
                                <Badge className="bg-purple-100 text-purple-700 text-xs">AI Powered</Badge>
                            </div>
                            <button onClick={loadAiRevenueForecast} disabled={aiLoading} className="text-gray-400 hover:text-gray-600">
                                <RefreshCw className={`w-4 h-4 ${aiLoading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                        {aiLoading ? (
                            <div className="flex items-center gap-2 py-2">
                                <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                                <p className="text-xs text-gray-500">Forecasting revenue...</p>
                            </div>
                        ) : aiForecast ? (
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                                    <p className="text-xs font-semibold text-green-700 uppercase flex items-center gap-1"><DollarSign className="w-3 h-3" /> Revenue Projection</p>
                                    <p className="text-xl font-bold text-green-900 mt-1">
                                        {aiForecast.predictions?.revenueProjection ? `$${(aiForecast.predictions.revenueProjection / 1000).toFixed(1)}K` : '--'}
                                    </p>
                                </div>
                                <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                                    <p className="text-xs font-semibold text-blue-700 uppercase flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Growth</p>
                                    <p className="text-xl font-bold text-blue-900 mt-1">{aiForecast.predictions?.enrollmentGrowth || '--'}%</p>
                                </div>
                                <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 sm:col-span-2">
                                    <p className="text-xs font-semibold text-purple-700 uppercase flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI Insight</p>
                                    <p className="text-sm text-purple-800 mt-1">{aiForecast.reasoning || 'AI analyzing commission patterns...'}</p>
                                    <Badge className="mt-1 bg-purple-100 text-purple-700 text-xs">{aiForecast.aiPowered ? 'AI Active' : 'Fallback'}</Badge>
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-gray-400">AI forecast unavailable. <button onClick={loadAiRevenueForecast} className="text-purple-600 hover:underline">Retry</button></p>
                        )}
                    </CardContent>
                </Card>

                {/* Commission History Table */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading commissions...</p>
                        </div>
                    </div>
                ) : commissions.length === 0 ? (
                    <Card>
                        <CardContent className="pt-12 pb-12 text-center">
                            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600">No commissions found</p>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Commission History</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="text-left py-3 px-6 font-semibold text-gray-700">Period</th>
                                            <th className="text-left py-3 px-6 font-semibold text-gray-700">Amount</th>
                                            <th className="text-left py-3 px-6 font-semibold text-gray-700">Rate</th>
                                            <th className="text-left py-3 px-6 font-semibold text-gray-700">Status</th>
                                            <th className="text-left py-3 px-6 font-semibold text-gray-700">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {commissions.map((commission) => (
                                            <tr key={commission.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                <td className="py-3 px-6 text-gray-900">{commission.period}</td>
                                                <td className="py-3 px-6 text-gray-900 font-medium">${commission.amount?.toLocaleString() || '0'}</td>
                                                <td className="py-3 px-6 text-gray-600">{commission.rate}%</td>
                                                <td className="py-3 px-6">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(commission.status)}`}>
                                                        {commission.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-6 text-gray-600">{new Date(commission.calculatedAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Payout History */}
                {!loading && payoutHistory.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Payout History</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="text-left py-3 px-6 font-semibold text-gray-700">Amount</th>
                                            <th className="text-left py-3 px-6 font-semibold text-gray-700">Method</th>
                                            <th className="text-left py-3 px-6 font-semibold text-gray-700">Status</th>
                                            <th className="text-left py-3 px-6 font-semibold text-gray-700">Requested</th>
                                            <th className="text-left py-3 px-6 font-semibold text-gray-700">Processed</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payoutHistory.map((payout) => (
                                            <tr key={payout.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                <td className="py-3 px-6 text-gray-900 font-medium">${payout.amount?.toLocaleString() || '0'}</td>
                                                <td className="py-3 px-6 text-gray-600">{getMethodLabel(payout.method)}</td>
                                                <td className="py-3 px-6">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(payout.status)}`}>
                                                        {payout.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-6 text-gray-600">{payout.requestedAt ? new Date(payout.requestedAt).toLocaleDateString() : '-'}</td>
                                                <td className="py-3 px-6 text-gray-600">{payout.processedAt ? new Date(payout.processedAt).toLocaleDateString() : '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Payout Request Modal */}
            <AnimatePresence>
                {showPayoutModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={(e) => { if (e.target === e.currentTarget) setShowPayoutModal(false) }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Request Payout</h2>
                                    <p className="text-sm text-gray-500 mt-1">Available balance: <span className="font-semibold text-green-600">${totalPending.toLocaleString()}</span></p>
                                </div>
                                <button
                                    onClick={() => setShowPayoutModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={handlePayoutSubmit} className="p-6 space-y-5">
                                {payoutError && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                                        <p className="text-sm text-red-800">{payoutError}</p>
                                    </div>
                                )}

                                {payoutSuccess && (
                                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                        <p className="text-sm text-green-800">{payoutSuccess}</p>
                                    </div>
                                )}

                                {/* Amount */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Payout Amount</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="1"
                                            max={totalPending}
                                            value={payoutForm.amount}
                                            onChange={(e) => setPayoutForm(prev => ({ ...prev, amount: e.target.value }))}
                                            className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="Enter amount"
                                            required
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Maximum: ${totalPending.toLocaleString()}</p>
                                </div>

                                {/* Payment Method */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Payment Method</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {PAYMENT_METHODS.map((method) => (
                                            <button
                                                key={method.value}
                                                type="button"
                                                onClick={() => setPayoutForm(prev => ({ ...prev, method: method.value }))}
                                                className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left ${
                                                    payoutForm.method === method.value
                                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                                }`}
                                            >
                                                <method.icon className="w-5 h-5 flex-shrink-0" />
                                                <div>
                                                    <p className="text-sm font-medium">{method.label}</p>
                                                    <p className="text-xs text-gray-500">{method.description}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Bank Details */}
                                {payoutForm.method === 'bank_transfer' && (
                                    <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                                        <h4 className="text-sm font-medium text-gray-700">Bank Details</h4>
                                        <input
                                            type="text"
                                            placeholder="Account Holder Name"
                                            value={payoutForm.bankDetails.accountName}
                                            onChange={(e) => setPayoutForm(prev => ({
                                                ...prev,
                                                bankDetails: { ...prev.bankDetails, accountName: e.target.value }
                                            }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="Account Number"
                                            value={payoutForm.bankDetails.accountNumber}
                                            onChange={(e) => setPayoutForm(prev => ({
                                                ...prev,
                                                bankDetails: { ...prev.bankDetails, accountNumber: e.target.value }
                                            }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            required
                                        />
                                        <div className="grid grid-cols-2 gap-3">
                                            <input
                                                type="text"
                                                placeholder="Bank Name"
                                                value={payoutForm.bankDetails.bankName}
                                                onChange={(e) => setPayoutForm(prev => ({
                                                    ...prev,
                                                    bankDetails: { ...prev.bankDetails, bankName: e.target.value }
                                                }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                required
                                            />
                                            <input
                                                type="text"
                                                placeholder="IFSC Code"
                                                value={payoutForm.bankDetails.ifscCode}
                                                onChange={(e) => setPayoutForm(prev => ({
                                                    ...prev,
                                                    bankDetails: { ...prev.bankDetails, ifscCode: e.target.value }
                                                }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* PayPal Email */}
                                {payoutForm.method === 'paypal' && (
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">PayPal Email</label>
                                        <input
                                            type="email"
                                            placeholder="your@email.com"
                                            value={payoutForm.paypalEmail}
                                            onChange={(e) => setPayoutForm(prev => ({ ...prev, paypalEmail: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            required
                                        />
                                    </div>
                                )}

                                {/* UPI ID */}
                                {payoutForm.method === 'upi' && (
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">UPI ID</label>
                                        <input
                                            type="text"
                                            placeholder="yourname@upi"
                                            value={payoutForm.upiId}
                                            onChange={(e) => setPayoutForm(prev => ({ ...prev, upiId: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            required
                                        />
                                    </div>
                                )}

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes (Optional)</label>
                                    <textarea
                                        value={payoutForm.notes}
                                        onChange={(e) => setPayoutForm(prev => ({ ...prev, notes: e.target.value }))}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                                        placeholder="Add any notes for this payout request..."
                                    />
                                </div>

                                {/* Submit */}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowPayoutModal(false)}
                                        className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={payoutSubmitting || !!payoutSuccess}
                                        className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {payoutSubmitting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                Submitting...
                                            </>
                                        ) : payoutSuccess ? (
                                            <>
                                                <CheckCircle className="w-4 h-4" />
                                                Submitted
                                            </>
                                        ) : (
                                            <>
                                                <ArrowRight className="w-4 h-4" />
                                                Submit Request
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
