'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Share2, Copy, Users, Gift, TrendingUp, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function ReferralsPage() {
    const [copied, setCopied] = useState(false)
    const referralCode = 'REF123456789'
    const referralLink = `https://proactiv.com/join?ref=${referralCode}`

    const [referrals] = useState([
        { id: '1', name: 'Raj Kumar', date: 'Apr 20, 2026', status: 'Active', reward: '₹500' },
        { id: '2', name: 'Priya Singh', date: 'Apr 18, 2026', status: 'Active', reward: '₹500' },
        { id: '3', name: 'Amit Patel', date: 'Apr 15, 2026', status: 'Pending', reward: '₹0' }
    ])

    const [stats] = useState({
        totalReferrals: 3,
        activeReferrals: 2,
        totalRewards: 1000,
        pendingRewards: 0
    })

    const handleCopyCode = () => {
        navigator.clipboard.writeText(referralCode)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleCopyLink = () => {
        navigator.clipboard.writeText(referralLink)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Referral Program</h1>
                <p className="text-gray-600 mt-2 text-sm font-medium">Earn rewards by inviting friends</p>
            </div>

            {/* Referral Code Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-8">
                    <div className="space-y-6">
                        <div>
                            <p className="text-emerald-100 text-sm font-semibold">Your Referral Code</p>
                            <div className="flex items-center gap-3 mt-3">
                                <p className="text-3xl font-bold font-mono">{referralCode}</p>
                                <Button
                                    onClick={handleCopyCode}
                                    className="bg-white/20 hover:bg-white/30 text-white font-semibold"
                                >
                                    <Copy className="w-4 h-4 mr-2" />
                                    {copied ? 'Copied!' : 'Copy'}
                                </Button>
                            </div>
                        </div>

                        <div className="border-t border-white/20 pt-6">
                            <p className="text-emerald-100 text-sm font-semibold">Referral Link</p>
                            <div className="flex items-center gap-3 mt-3">
                                <p className="text-sm font-mono truncate">{referralLink}</p>
                                <Button
                                    onClick={handleCopyLink}
                                    className="bg-white/20 hover:bg-white/30 text-white font-semibold flex-shrink-0"
                                >
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copy
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Statistics Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
                {/* Total Referrals */}
                <Card className="p-4 border-blue-200/50 bg-gradient-to-br from-blue-50 to-blue-100/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-700 font-semibold">Total Referrals</p>
                            <p className="text-2xl font-bold text-blue-900 mt-1">{stats.totalReferrals}</p>
                        </div>
                        <Users className="w-8 h-8 text-blue-400" />
                    </div>
                </Card>

                {/* Active Referrals */}
                <Card className="p-4 border-green-200/50 bg-gradient-to-br from-green-50 to-green-100/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-700 font-semibold">Active</p>
                            <p className="text-2xl font-bold text-green-900 mt-1">{stats.activeReferrals}</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-green-400" />
                    </div>
                </Card>

                {/* Total Rewards */}
                <Card className="p-4 border-purple-200/50 bg-gradient-to-br from-purple-50 to-purple-100/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-purple-700 font-semibold">Total Rewards</p>
                            <p className="text-2xl font-bold text-purple-900 mt-1">₹{stats.totalRewards}</p>
                        </div>
                        <Gift className="w-8 h-8 text-purple-400" />
                    </div>
                </Card>

                {/* Pending Rewards */}
                <Card className="p-4 border-yellow-200/50 bg-gradient-to-br from-yellow-50 to-yellow-100/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-yellow-700 font-semibold">Pending</p>
                            <p className="text-2xl font-bold text-yellow-900 mt-1">₹{stats.pendingRewards}</p>
                        </div>
                        <AlertCircle className="w-8 h-8 text-yellow-400" />
                    </div>
                </Card>
            </motion.div>

            {/* Referrals List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
            >
                <Card className="p-6 border-gray-200/50">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Your Referrals</h2>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200/50">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Name</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Date</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Status</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Reward</th>
                                </tr>
                            </thead>
                            <tbody>
                                {referrals.map((ref, index) => (
                                    <motion.tr
                                        key={ref.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                        className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                                    >
                                        <td className="py-3 px-4 text-sm text-gray-900 font-medium">{ref.name}</td>
                                        <td className="py-3 px-4 text-sm text-gray-900">{ref.date}</td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${ref.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {ref.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-900 font-semibold">{ref.reward}</td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </motion.div>

            {/* How It Works */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
            >
                <Card className="p-6 border-emerald-200/50 bg-emerald-50/50">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">How It Works</h2>
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                            <div>
                                <p className="font-semibold text-gray-900">Share Your Code</p>
                                <p className="text-sm text-gray-600">Share your referral code with friends</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                            <div>
                                <p className="font-semibold text-gray-900">They Sign Up</p>
                                <p className="text-sm text-gray-600">Your friend signs up using your code</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                            <div>
                                <p className="font-semibold text-gray-900">Earn Rewards</p>
                                <p className="text-sm text-gray-600">Get ₹500 for each successful referral</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>
        </div>
    )
}
