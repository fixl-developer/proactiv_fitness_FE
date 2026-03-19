'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, ShieldCheck, ShieldAlert, Lock, Key, Users, AlertTriangle, CheckCircle, XCircle, Clock, Eye, Fingerprint, Globe, Settings } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

const securityEvents = [
    { id: 1, type: 'Failed Login', message: 'Failed login attempt for admin@proactiv.com from IP 103.25.67.89', time: '10:30 AM', severity: 'Critical', severityColor: 'bg-red-100 text-red-700' },
    { id: 2, type: 'Password Change', message: 'Password changed for user sarah.johnson@email.com', time: '10:15 AM', severity: 'Info', severityColor: 'bg-blue-100 text-blue-700' },
    { id: 3, type: 'Role Change', message: 'User david.wong promoted to Manager role', time: '9:45 AM', severity: 'Warning', severityColor: 'bg-yellow-100 text-yellow-700' },
    { id: 4, type: 'Suspicious Activity', message: 'Multiple login attempts detected from unknown location', time: '9:30 AM', severity: 'Critical', severityColor: 'bg-red-100 text-red-700' },
    { id: 5, type: 'Failed Login', message: 'Failed login attempt for coach.mike@proactiv.com', time: '9:15 AM', severity: 'Warning', severityColor: 'bg-yellow-100 text-yellow-700' },
    { id: 6, type: '2FA Enabled', message: 'Two-factor authentication enabled for lisa.tam@email.com', time: '8:50 AM', severity: 'Info', severityColor: 'bg-blue-100 text-blue-700' },
]

const recommendations = [
    { text: 'Enable 2FA for all admin accounts', done: true },
    { text: 'Set password minimum length to 12 characters', done: true },
    { text: 'Enable IP whitelisting for admin panel', done: false },
    { text: 'Review and remove inactive user sessions', done: false },
    { text: 'Update SSL certificate (expires in 45 days)', done: false },
    { text: 'Enable rate limiting on login endpoints', done: true },
]

export default function SecurityCenterPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [twoFAEnforced, setTwoFAEnforced] = useState(true)
    const [sessionTimeout, setSessionTimeout] = useState(30)
    const securityScore = 78

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 600)
        return () => clearTimeout(timer)
    }, [])

    const stats = [
        { label: 'Active Sessions', value: '24', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Failed Logins (24h)', value: '7', icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-50' },
        { label: '2FA Enabled', value: '85%', icon: Fingerprint, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Security Score', value: `${securityScore}/100`, icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    ]

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-gray-200 rounded-lg"></div>)}
                    </div>
                    <div className="h-96 bg-gray-200 rounded-lg"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <h1 className="text-3xl font-bold text-gray-900">Security Center</h1>
                    <p className="text-gray-600 mt-1">Monitor and manage system security, access control, and threats</p>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                        <Card className="hover:shadow-lg transition-all duration-300">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                        <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                                    </div>
                                    <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Security Score */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="w-5 h-5 text-indigo-600" />
                                Security Score
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center">
                            <div className="relative w-44 h-44 mb-4">
                                <svg className="w-44 h-44 transform -rotate-90" viewBox="0 0 160 160">
                                    <circle cx="80" cy="80" r="70" stroke="#e5e7eb" strokeWidth="12" fill="none" />
                                    <motion.circle
                                        cx="80" cy="80" r="70"
                                        stroke={securityScore >= 80 ? '#16a34a' : securityScore >= 60 ? '#f59e0b' : '#dc2626'}
                                        strokeWidth="12"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeDasharray={`${2 * Math.PI * 70}`}
                                        initial={{ strokeDashoffset: 2 * Math.PI * 70 }}
                                        animate={{ strokeDashoffset: 2 * Math.PI * 70 * (1 - securityScore / 100) }}
                                        transition={{ duration: 1.5, ease: 'easeOut' }}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-4xl font-bold text-gray-900">{securityScore}</span>
                                    <span className="text-sm text-gray-500">out of 100</span>
                                </div>
                            </div>
                            <Badge className="bg-amber-100 text-amber-700">Good - Room for improvement</Badge>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Security Recommendations */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="lg:col-span-2">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                Security Recommendations
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {recommendations.map((rec, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + i * 0.05 }}
                                        className={`flex items-center gap-3 p-3 rounded-lg ${rec.done ? 'bg-green-50' : 'bg-gray-50'}`}
                                    >
                                        {rec.done ? (
                                            <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-gray-400 shrink-0" />
                                        )}
                                        <span className={`text-sm ${rec.done ? 'text-green-800 line-through' : 'text-gray-700'}`}>{rec.text}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Security Events */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-amber-600" />
                                <CardTitle>Recent Security Events</CardTitle>
                            </div>
                            <Badge variant="outline">{securityEvents.length} events</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {securityEvents.map((event, i) => (
                                <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.6 + i * 0.05 }}
                                    className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                                >
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div className={`w-2 h-2 rounded-full shrink-0 ${event.severity === 'Critical' ? 'bg-red-500' : event.severity === 'Warning' ? 'bg-yellow-500' : 'bg-blue-500'}`}></div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium text-gray-900 text-sm">{event.type}</span>
                                                <Badge className={`text-xs ${event.severityColor}`}>{event.severity}</Badge>
                                            </div>
                                            <p className="text-sm text-gray-600 truncate">{event.message}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
                                        <Clock className="w-3 h-3" />
                                        {event.time}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Security Settings */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Settings className="w-5 h-5 text-gray-600" />
                            <CardTitle>Security Settings</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <Key className="w-4 h-4" /> Password Policy
                                </h4>
                                <div className="space-y-3 pl-6">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Minimum Length</span>
                                        <Badge className="bg-blue-100 text-blue-700">12 characters</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Require Uppercase</span>
                                        <Badge className="bg-green-100 text-green-700">Enabled</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Require Special Characters</span>
                                        <Badge className="bg-green-100 text-green-700">Enabled</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Password Expiry</span>
                                        <Badge className="bg-blue-100 text-blue-700">90 days</Badge>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <Lock className="w-4 h-4" /> Access Control
                                </h4>
                                <div className="space-y-3 pl-6">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Session Timeout</span>
                                        <select
                                            value={sessionTimeout}
                                            onChange={(e) => setSessionTimeout(Number(e.target.value))}
                                            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:border-blue-500 outline-none"
                                        >
                                            <option value={15}>15 minutes</option>
                                            <option value={30}>30 minutes</option>
                                            <option value={60}>60 minutes</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">2FA Enforcement</span>
                                        <button
                                            onClick={() => setTwoFAEnforced(!twoFAEnforced)}
                                            className={`relative w-11 h-6 rounded-full transition-colors ${twoFAEnforced ? 'bg-green-500' : 'bg-gray-300'}`}
                                        >
                                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${twoFAEnforced ? 'translate-x-5' : ''}`}></span>
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">IP Whitelist</span>
                                        <Badge className="bg-gray-100 text-gray-600">Not Configured</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Max Login Attempts</span>
                                        <Badge className="bg-blue-100 text-blue-700">5 attempts</Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
