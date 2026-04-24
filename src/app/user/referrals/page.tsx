'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Share2,
    Copy,
    Users,
    Gift,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    Loader,
    Plus,
    Send,
    UserPlus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { apiClient } from '@/services/api/client'
import {
    validateName,
    validateEmail,
    validatePhone,
    validateTextArea,
    filterNameInput,
    filterPhoneInput
} from '@/utils/validation'

interface Referral {
    id: string
    friendFirstName?: string
    friendLastName?: string
    friendName?: string
    name?: string
    friendEmail?: string
    email?: string
    friendPhone?: string
    phone?: string
    program?: string
    status: string
    reward?: string | number
    createdAt?: string
    date?: string
}

interface Program {
    id: string
    name: string
}

type ReferralFormState = {
    friendFirstName: string
    friendLastName: string
    friendEmail: string
    friendPhone: string
    program: string
    personalMessage: string
}

const FALLBACK_PROGRAMS: Program[] = [
    { id: 'weight-loss', name: 'Weight Loss' },
    { id: 'strength-training', name: 'Strength Training' },
    { id: 'yoga', name: 'Yoga' },
    { id: 'cardio', name: 'Cardio' },
    { id: 'nutrition', name: 'Nutrition Coaching' },
    { id: 'general', name: 'General Fitness' }
]

export default function ReferralsPage() {
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [copied, setCopied] = useState<'code' | 'link' | null>(null)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    const [referralCode, setReferralCode] = useState<string>('')
    const [referralLink, setReferralLink] = useState<string>('')
    const [referrals, setReferrals] = useState<Referral[]>([])
    const [stats, setStats] = useState({
        totalReferrals: 0,
        activeReferrals: 0,
        totalRewards: 0,
        pendingRewards: 0
    })

    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [programs, setPrograms] = useState<Program[]>(FALLBACK_PROGRAMS)
    const [programsLoading, setProgramsLoading] = useState(false)

    const [form, setForm] = useState<ReferralFormState>({
        friendFirstName: '',
        friendLastName: '',
        friendEmail: '',
        friendPhone: '',
        program: '',
        personalMessage: ''
    })
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            await Promise.all([loadReferrals(), loadMyCode()])
        } catch (error) {
            console.error('Failed to load referrals:', error)
        } finally {
            setLoading(false)
        }
    }

    const unwrap = (res: any): any => {
        if (res == null) return res
        if (res.data !== undefined) return res.data
        return res
    }

    const loadReferrals = async () => {
        try {
            const res = await apiClient.get<any>('/referrals')
            const payload = unwrap(res)
            const list: Referral[] = Array.isArray(payload)
                ? payload
                : Array.isArray(payload?.items)
                    ? payload.items
                    : Array.isArray(payload?.referrals)
                        ? payload.referrals
                        : []
            setReferrals(list)
            // Compute simple stats from list if server didn't send them
            if (payload?.stats) {
                setStats({
                    totalReferrals: payload.stats.totalReferrals ?? list.length,
                    activeReferrals: payload.stats.activeReferrals ?? list.filter(r => /active|converted|rewarded/i.test(r.status || '')).length,
                    totalRewards: payload.stats.totalRewards ?? 0,
                    pendingRewards: payload.stats.pendingRewards ?? 0
                })
            } else {
                setStats({
                    totalReferrals: list.length,
                    activeReferrals: list.filter(r => /active|converted|rewarded/i.test(r.status || '')).length,
                    totalRewards: 0,
                    pendingRewards: 0
                })
            }
        } catch (error) {
            console.error('Failed to load referrals list:', error)
            setReferrals([])
        }
    }

    const loadMyCode = async () => {
        try {
            const res = await apiClient.get<any>('/referrals/my-code')
            const payload = unwrap(res)
            const code = payload?.code || payload?.referralCode || payload?.referral_code || ''
            const link = payload?.link || payload?.referralLink || (code ? `${typeof window !== 'undefined' ? window.location.origin : ''}/join?ref=${code}` : '')
            setReferralCode(code)
            setReferralLink(link)
        } catch (error) {
            console.error('Failed to load referral code:', error)
        }
    }

    const loadPrograms = async () => {
        try {
            setProgramsLoading(true)
            const res = await apiClient.get<any>('/programs')
            const payload = unwrap(res)
            const list: any[] = Array.isArray(payload)
                ? payload
                : Array.isArray(payload?.items)
                    ? payload.items
                    : Array.isArray(payload?.programs)
                        ? payload.programs
                        : []
            if (list.length > 0) {
                setPrograms(list.map(p => ({ id: p.id || p._id || p.slug || p.name, name: p.name || p.title || 'Program' })))
            }
        } catch (error) {
            console.error('Failed to load programs, using fallback:', error)
            // Keep fallback programs
        } finally {
            setProgramsLoading(false)
        }
    }

    const openDrawer = () => {
        setIsDrawerOpen(true)
        loadPrograms()
    }

    const resetForm = () => {
        setForm({
            friendFirstName: '',
            friendLastName: '',
            friendEmail: '',
            friendPhone: '',
            program: '',
            personalMessage: ''
        })
        setFormErrors({})
    }

    const validateReferralForm = (): boolean => {
        const errors: Record<string, string> = {}
        const fn = validateName(form.friendFirstName, 'First name')
        if (fn) errors.friendFirstName = fn
        const ln = validateName(form.friendLastName, 'Last name')
        if (ln) errors.friendLastName = ln
        const em = validateEmail(form.friendEmail)
        if (em) errors.friendEmail = em
        if (form.friendPhone) {
            const ph = validatePhone(form.friendPhone, false)
            if (ph) errors.friendPhone = ph
        }
        if (form.personalMessage) {
            const msgErr = validateTextArea(form.personalMessage, 'Personal message', 0, 500)
            if (msgErr) errors.personalMessage = msgErr
        }
        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSubmit = async () => {
        if (!validateReferralForm()) return
        try {
            setSubmitting(true)
            const payload = {
                friendFirstName: form.friendFirstName.trim(),
                friendLastName: form.friendLastName.trim(),
                friendEmail: form.friendEmail.trim(),
                friendPhone: form.friendPhone.trim() || undefined,
                program: form.program || undefined,
                personalMessage: form.personalMessage.trim() || undefined
            }
            const res = await apiClient.post<any>('/referrals', payload)
            const created = unwrap(res)
            if (created && (created.id || created._id)) {
                setReferrals(prev => [{ ...created, id: created.id || created._id }, ...prev])
                setStats(prev => ({ ...prev, totalReferrals: prev.totalReferrals + 1 }))
            } else {
                await loadReferrals()
            }
            resetForm()
            setIsDrawerOpen(false)
            setMessage({ type: 'success', text: 'Referral sent successfully!' })
            setTimeout(() => setMessage(null), 3000)
        } catch (error: any) {
            setMessage({ type: 'error', text: error?.response?.data?.message || 'Failed to send referral' })
        } finally {
            setSubmitting(false)
        }
    }

    const handleCopy = (value: string, which: 'code' | 'link') => {
        if (!value) return
        try {
            navigator.clipboard.writeText(value)
            setCopied(which)
            setTimeout(() => setCopied(null), 2000)
        } catch {
            setMessage({ type: 'error', text: 'Failed to copy' })
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader className="w-8 h-8 text-emerald-600 animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Referral Program</h1>
                    <p className="text-gray-600 mt-2 text-sm font-medium">Earn rewards by inviting friends</p>
                </div>
                <Button
                    onClick={openDrawer}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Refer a Friend
                </Button>
            </div>

            {/* Message Alert */}
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg flex items-center space-x-3 ${message.type === 'success'
                            ? 'bg-emerald-50 border border-emerald-200'
                            : 'bg-red-50 border border-red-200'
                        }`}
                >
                    {message.type === 'success' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    ) : (
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    )}
                    <span className={message.type === 'success' ? 'text-emerald-800' : 'text-red-800'}>
                        {message.text}
                    </span>
                </motion.div>
            )}

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
                            <div className="flex items-center gap-3 mt-3 flex-wrap">
                                <p className="text-3xl font-bold font-mono break-all">{referralCode || '—'}</p>
                                <Button
                                    onClick={() => handleCopy(referralCode, 'code')}
                                    disabled={!referralCode}
                                    className="bg-white/20 hover:bg-white/30 text-white font-semibold disabled:opacity-50"
                                >
                                    <Copy className="w-4 h-4 mr-2" />
                                    {copied === 'code' ? 'Copied!' : 'Copy'}
                                </Button>
                            </div>
                        </div>

                        {referralLink && (
                            <div className="border-t border-white/20 pt-6">
                                <p className="text-emerald-100 text-sm font-semibold">Referral Link</p>
                                <div className="flex items-center gap-3 mt-3 flex-wrap">
                                    <p className="text-sm font-mono truncate max-w-full">{referralLink}</p>
                                    <Button
                                        onClick={() => handleCopy(referralLink, 'link')}
                                        className="bg-white/20 hover:bg-white/30 text-white font-semibold flex-shrink-0"
                                    >
                                        <Copy className="w-4 h-4 mr-2" />
                                        {copied === 'link' ? 'Copied!' : 'Copy'}
                                    </Button>
                                </div>
                            </div>
                        )}
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
                <Card className="p-4 border-blue-200/50 bg-gradient-to-br from-blue-50 to-blue-100/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-700 font-semibold">Total Referrals</p>
                            <p className="text-2xl font-bold text-blue-900 mt-1">{stats.totalReferrals}</p>
                        </div>
                        <Users className="w-8 h-8 text-blue-400" />
                    </div>
                </Card>

                <Card className="p-4 border-green-200/50 bg-gradient-to-br from-green-50 to-green-100/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-700 font-semibold">Active</p>
                            <p className="text-2xl font-bold text-green-900 mt-1">{stats.activeReferrals}</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-green-400" />
                    </div>
                </Card>

                <Card className="p-4 border-purple-200/50 bg-gradient-to-br from-purple-50 to-purple-100/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-purple-700 font-semibold">Total Rewards</p>
                            <p className="text-2xl font-bold text-purple-900 mt-1">₹{stats.totalRewards}</p>
                        </div>
                        <Gift className="w-8 h-8 text-purple-400" />
                    </div>
                </Card>

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

                    {referrals.length === 0 ? (
                        <div className="text-center py-12">
                            <Share2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600">You haven't referred anyone yet</p>
                            <Button
                                onClick={openDrawer}
                                className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Refer Your First Friend
                            </Button>
                        </div>
                    ) : (
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
                                    {referrals.map((ref, index) => {
                                        const displayName = ref.friendFirstName
                                            ? `${ref.friendFirstName} ${ref.friendLastName || ''}`.trim()
                                            : ref.friendName || ref.name || '—'
                                        const displayDate = ref.createdAt
                                            ? new Date(ref.createdAt).toLocaleDateString()
                                            : ref.date || '—'
                                        const status = ref.status || 'pending'
                                        const isActive = /active|converted|rewarded/i.test(status)
                                        return (
                                            <motion.tr
                                                key={ref.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                                className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                                            >
                                                <td className="py-3 px-4 text-sm text-gray-900 font-medium">{displayName}</td>
                                                <td className="py-3 px-4 text-sm text-gray-900">{displayDate}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${isActive ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                        {status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-900 font-semibold">
                                                    {typeof ref.reward === 'number' ? `₹${ref.reward}` : (ref.reward || '—')}
                                                </td>
                                            </motion.tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
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
                                <p className="text-sm text-gray-600">Get rewards for each successful referral</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Refer a Friend Drawer */}
            <SlideInDrawer
                isOpen={isDrawerOpen}
                onClose={() => {
                    if (!submitting) {
                        setIsDrawerOpen(false)
                        resetForm()
                    }
                }}
                title="Refer a Friend"
                description="Invite someone to join ProActiv Fitness and earn rewards."
                size="lg"
                footer={
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsDrawerOpen(false)
                                resetForm()
                            }}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            <Send className="w-4 h-4 mr-2" />
                            {submitting ? 'Sending...' : 'Send Referral'}
                        </Button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name <span className="text-red-500">*</span></label>
                            <Input
                                type="text"
                                value={form.friendFirstName}
                                onKeyDown={filterNameInput}
                                onChange={(e) => setForm(prev => ({ ...prev, friendFirstName: e.target.value }))}
                                placeholder="John"
                                className="w-full"
                            />
                            {formErrors.friendFirstName && <p className="text-xs text-red-600 mt-1">{formErrors.friendFirstName}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name <span className="text-red-500">*</span></label>
                            <Input
                                type="text"
                                value={form.friendLastName}
                                onKeyDown={filterNameInput}
                                onChange={(e) => setForm(prev => ({ ...prev, friendLastName: e.target.value }))}
                                placeholder="Doe"
                                className="w-full"
                            />
                            {formErrors.friendLastName && <p className="text-xs text-red-600 mt-1">{formErrors.friendLastName}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                        <Input
                            type="email"
                            value={form.friendEmail}
                            onChange={(e) => setForm(prev => ({ ...prev, friendEmail: e.target.value }))}
                            placeholder="friend@example.com"
                            className="w-full"
                        />
                        {formErrors.friendEmail && <p className="text-xs text-red-600 mt-1">{formErrors.friendEmail}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
                        <Input
                            type="tel"
                            value={form.friendPhone}
                            onKeyDown={filterPhoneInput}
                            onChange={(e) => setForm(prev => ({ ...prev, friendPhone: e.target.value }))}
                            placeholder="+1 555 123 4567"
                            className="w-full"
                        />
                        {formErrors.friendPhone && <p className="text-xs text-red-600 mt-1">{formErrors.friendPhone}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Interested Program</label>
                        <select
                            value={form.program}
                            onChange={(e) => setForm(prev => ({ ...prev, program: e.target.value }))}
                            disabled={programsLoading}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-50"
                        >
                            <option value="">{programsLoading ? 'Loading programs...' : 'Select a program (optional)'}</option>
                            {programs.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Personal Message (Optional)</label>
                        <textarea
                            value={form.personalMessage}
                            onChange={(e) => setForm(prev => ({ ...prev, personalMessage: e.target.value }))}
                            placeholder="Add a personal note to your friend (max 500 chars)..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                            rows={4}
                            maxLength={500}
                        />
                        <div className="flex justify-between mt-1">
                            {formErrors.personalMessage ? (
                                <p className="text-xs text-red-600">{formErrors.personalMessage}</p>
                            ) : <span />}
                            <p className="text-xs text-gray-400">{form.personalMessage.length}/500</p>
                        </div>
                    </div>
                </div>
            </SlideInDrawer>
        </div>
    )
}
