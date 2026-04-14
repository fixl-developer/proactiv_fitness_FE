'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Shield, AlertTriangle, Users, Lock, ShieldCheck, Key, CheckCircle, XCircle, Clock, Settings, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { apiClient } from '@/services/api/client'
import { toast } from 'sonner'

interface SecurityEvent {
    id: number | string
    type: string
    message: string
    time: string
    severity: string
    severityColor: string
}

const SETTINGS_KEY = 'proactiv_security_settings'

function getSeverityColor(severity: string): string {
    const map: Record<string, string> = {
        Critical: 'bg-red-100 text-red-700',
        critical: 'bg-red-100 text-red-700',
        high: 'bg-red-100 text-red-700',
        Warning: 'bg-yellow-100 text-yellow-700',
        warning: 'bg-yellow-100 text-yellow-700',
        medium: 'bg-yellow-100 text-yellow-700',
        Info: 'bg-blue-100 text-blue-700',
        info: 'bg-blue-100 text-blue-700',
        low: 'bg-green-100 text-green-700',
        Low: 'bg-green-100 text-green-700',
    }
    return map[severity] || 'bg-gray-100 text-gray-700'
}

function formatTime(timestamp: string): string {
    if (!timestamp) return ''
    try {
        const d = new Date(timestamp)
        if (isNaN(d.getTime())) return timestamp
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
        return timestamp
    }
}

export default function SecurityCenterPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([])
    const [failedLoginCount, setFailedLoginCount] = useState(0)
    const [activeSessions, setActiveSessions] = useState(0)
    const [twoFAEnforced, setTwoFAEnforced] = useState(true)
    const [sessionTimeout, setSessionTimeout] = useState(30)
    const [passwordMinLength, setPasswordMinLength] = useState(12)

    const recommendations = [
        { text: 'Enable 2FA for all admin accounts', done: true },
        { text: 'Set password minimum length to 12 characters', done: true },
        { text: 'Enable IP whitelisting for admin panel', done: false },
        { text: 'Review and remove inactive user sessions', done: false },
        { text: 'Update SSL certificate (expires in 45 days)', done: false },
        { text: 'Enable rate limiting on login endpoints', done: true },
    ]

    // Load settings from localStorage
    useEffect(() => {
        try {
            const stored = localStorage.getItem(SETTINGS_KEY)
            if (stored) {
                const settings = JSON.parse(stored)
                setTwoFAEnforced(settings.twoFAEnforced ?? true)
                setSessionTimeout(settings.sessionTimeout ?? 30)
                setPasswordMinLength(settings.passwordMinLength ?? 12)
            }
        } catch { /* ignore */ }
    }, [])

    const saveSettings = (key: string, value: any) => {
        try {
            const stored = localStorage.getItem(SETTINGS_KEY)
            const settings = stored ? JSON.parse(stored) : {}
            settings[key] = value
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
        } catch { /* ignore */ }
    }

    const loadSecurityData = useCallback(async () => {
        const allEvents: SecurityEvent[] = []

        // 1. Fetch security events from observability
        try {
            const data = await apiClient.get<any>('/observability/security-events')
            const items = Array.isArray(data) ? data : (data?.data || data?.events || data?.logs || [])
            items.forEach((e: any, i: number) => {
                allEvents.push({
                    id: e.id || e._id || `sec-${i}`,
                    type: e.type || e.eventType || e.action || 'Security Event',
                    message: e.message || e.description || e.details || e.action || e.entityType || 'Security event',
                    time: formatTime(e.time || e.timestamp || e.createdAt || ''),
                    severity: e.severity || e.level || 'Info',
                    severityColor: getSeverityColor(e.severity || e.level || 'Info'),
                })
            })
        } catch {
            // Endpoint may not exist yet - continue
        }

        // 2. Fetch failed logins from audit-vault
        try {
            const data = await apiClient.get<any>('/audit-vault/logs', {
                params: { action: 'LOGIN', limit: 50 }
            })
            const items = Array.isArray(data) ? data : (data?.data || data?.logs || [])
            let failedCount = 0
            const now = Date.now()
            items.forEach((e: any, i: number) => {
                const isFailed = e.status === 'failed' || e.success === false ||
                    (e.action || '').toLowerCase().includes('fail') ||
                    (e.message || '').toLowerCase().includes('fail')
                if (isFailed) {
                    const ts = e.timestamp || e.createdAt || e.time || ''
                    const eventTime = new Date(ts).getTime()
                    if (now - eventTime < 86400000) failedCount++

                    // Add to events if not already from security-events
                    allEvents.push({
                        id: e.id || e._id || `audit-${i}`,
                        type: 'Failed Login',
                        message: e.message || e.description || `Failed login attempt for ${e.email || e.user || 'unknown'}`,
                        time: formatTime(ts),
                        severity: 'Warning',
                        severityColor: getSeverityColor('Warning'),
                    })
                }
            })
            setFailedLoginCount(failedCount)
        } catch {
            // Compute from events we already have
            const fromEvents = allEvents.filter(e =>
                e.type.toLowerCase().includes('failed') || e.type.toLowerCase().includes('login fail')
            ).length
            setFailedLoginCount(fromEvents)
        }

        // 3. Fetch audit stats for active sessions count
        try {
            const stats = await apiClient.get<any>('/audit-vault/stats')
            setActiveSessions(stats?.activeSessions || stats?.active_sessions || stats?.sessions || 0)
        } catch {
            setActiveSessions(0)
        }

        // Deduplicate by id
        const seen = new Set<string | number>()
        const deduped = allEvents.filter(e => {
            if (seen.has(e.id)) return false
            seen.add(e.id)
            return true
        })

        setSecurityEvents(deduped.slice(0, 20))
        setIsLoading(false)
    }, [])

    useEffect(() => {
        loadSecurityData()
    }, [loadSecurityData])

    const handleLogEvent = async () => {
        try {
            await apiClient.post('/observability/security-events', {
                type: 'Manual Check',
                message: 'Manual security audit triggered by admin',
                severity: 'Info',
            })
            toast.success('Security event logged')
            loadSecurityData()
        } catch {
            toast.error('Failed to log security event')
        }
    }

    const criticalCount = securityEvents.filter(e => e.severity === 'Critical' || e.severity === 'critical' || e.severity === 'high').length
    const doneRecs = recommendations.filter(r => r.done).length
    const securityScore = Math.round((doneRecs / recommendations.length) * 100)

    const stats = [
        { label: 'Security Score', value: `${securityScore}/100`, icon: Shield, gradient: 'from-purple-500 to-purple-600', bgGradient: 'from-purple-50 to-purple-100' },
        { label: 'Failed Logins (24h)', value: failedLoginCount.toString(), icon: AlertTriangle, gradient: 'from-red-500 to-red-600', bgGradient: 'from-red-50 to-red-100' },
        { label: 'Active Sessions', value: activeSessions.toString(), icon: Users, gradient: 'from-blue-500 to-blue-600', bgGradient: 'from-blue-50 to-blue-100' },
        { label: '2FA Enabled', value: twoFAEnforced ? 'Enforced' : 'Optional', icon: Lock, gradient: 'from-green-500 to-emerald-600', bgGradient: 'from-green-50 to-emerald-100' },
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
                <div className="flex items-center gap-2">
                    <Button id="btn-log-event-admin-system-security" variant="outline" size="sm" onClick={handleLogEvent}>
                        <ShieldCheck className="w-4 h-4 mr-2" /> Log Audit
                    </Button>
                    <Button id="btn-action-admin-system-security" variant="outline" size="sm" onClick={() => { setIsLoading(true); loadSecurityData() }}>
                        <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                        <div className={`rounded-lg border-0 bg-gradient-to-br ${stat.bgGradient} p-4 hover:shadow-lg transition-all`}>
                            <div className="flex items-center justify-between mb-3">
                                <div className={`bg-gradient-to-br ${stat.gradient} p-2.5 rounded-lg shadow-md`}>
                                    <stat.icon className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-600 font-medium mb-1">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="w-5 h-5 text-indigo-600" /> Security Score
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center">
                            <div className="relative w-44 h-44 mb-4">
                                <svg className="w-44 h-44 transform -rotate-90" viewBox="0 0 160 160">
                                    <circle cx="80" cy="80" r="70" stroke="#e5e7eb" strokeWidth="12" fill="none" />
                                    <motion.circle cx="80" cy="80" r="70" stroke={securityScore >= 80 ? '#16a34a' : securityScore >= 60 ? '#f59e0b' : '#dc2626'} strokeWidth="12" fill="none" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 70}`} initial={{ strokeDashoffset: 2 * Math.PI * 70 }} animate={{ strokeDashoffset: 2 * Math.PI * 70 * (1 - securityScore / 100) }} transition={{ duration: 1.5, ease: 'easeOut' }} />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-4xl font-bold text-gray-900">{securityScore}</span>
                                    <span className="text-sm text-gray-500">out of 100</span>
                                </div>
                            </div>
                            <Badge className={securityScore >= 80 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
                                {securityScore >= 80 ? 'Good' : 'Room for improvement'}
                            </Badge>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="lg:col-span-2">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-600" /> Security Recommendations
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {recommendations.map((rec, i) => (
                                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.05 }} className={`flex items-center gap-3 p-3 rounded-lg ${rec.done ? 'bg-green-50' : 'bg-gray-50'}`}>
                                        {rec.done ? <CheckCircle className="w-5 h-5 text-green-600 shrink-0" /> : <XCircle className="w-5 h-5 text-gray-400 shrink-0" />}
                                        <span className={`text-sm ${rec.done ? 'text-green-800 line-through' : 'text-gray-700'}`}>{rec.text}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

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
                        {securityEvents.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Shield className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                                <p className="text-sm">No security events recorded</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {securityEvents.map((event, i) => (
                                    <motion.div key={event.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.05 }} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <div className={`w-2 h-2 rounded-full shrink-0 ${event.severity === 'Critical' || event.severity === 'critical' || event.severity === 'high' ? 'bg-red-500' : event.severity === 'Warning' || event.severity === 'warning' || event.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'}`}></div>
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
                        )}
                    </CardContent>
                </Card>
            </motion.div>

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
                                <h4 className="font-semibold text-gray-900 flex items-center gap-2"><Key className="w-4 h-4" /> Password Policy</h4>
                                <div className="space-y-3 pl-6">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Minimum Length</span>
                                        <select id="select-admin-system-security-4" value={passwordMinLength} onChange={(e) => { const v = Number(e.target.value); setPasswordMinLength(v); saveSettings('passwordMinLength', v); toast.success(`Minimum password length set to ${v}`) }} className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:border-blue-500 outline-none">
                                            <option value={8}>8 characters</option>
                                            <option value={10}>10 characters</option>
                                            <option value={12}>12 characters</option>
                                            <option value={16}>16 characters</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Require Uppercase</span><Badge className="bg-green-100 text-green-700">Enabled</Badge></div>
                                    <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Require Special Characters</span><Badge className="bg-green-100 text-green-700">Enabled</Badge></div>
                                    <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Password Expiry</span><Badge className="bg-blue-100 text-blue-700">90 days</Badge></div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h4 className="font-semibold text-gray-900 flex items-center gap-2"><Lock className="w-4 h-4" /> Access Control</h4>
                                <div className="space-y-3 pl-6">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Session Timeout</span>
                                        <select id="select-admin-system-security-5" value={sessionTimeout} onChange={(e) => { const v = Number(e.target.value); setSessionTimeout(v); saveSettings('sessionTimeout', v); toast.success(`Session timeout set to ${v} minutes`) }} className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:border-blue-500 outline-none">
                                            <option value={15}>15 minutes</option>
                                            <option value={30}>30 minutes</option>
                                            <option value={60}>60 minutes</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">2FA Enforcement</span>
                                        <button id="btn-admin-system-security-3" onClick={() => { const v = !twoFAEnforced; setTwoFAEnforced(v); saveSettings('twoFAEnforced', v); toast.success(`2FA enforcement ${v ? 'enabled' : 'disabled'}`) }} className={`relative w-11 h-6 rounded-full transition-colors ${twoFAEnforced ? 'bg-green-500' : 'bg-gray-300'}`}>
                                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${twoFAEnforced ? 'translate-x-5' : ''}`}></span>
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between"><span className="text-sm text-gray-600">IP Whitelist</span><Badge className="bg-gray-100 text-gray-600">Not Configured</Badge></div>
                                    <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Max Login Attempts</span><Badge className="bg-blue-100 text-blue-700">5 attempts</Badge></div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
