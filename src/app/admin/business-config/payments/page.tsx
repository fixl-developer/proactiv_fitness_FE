'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CreditCard, Smartphone, Building, Zap, CheckCircle2, AlertCircle,
  Settings, Power, RefreshCw, TrendingUp, ShieldCheck,
  Loader2, Wifi, WifiOff, ArrowUpRight
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

type GatewayStatus = 'Active' | 'Inactive' | 'Testing'

interface Gateway {
  id: string
  name: string
  description: string
  status: GatewayStatus
  icon: 'stripe' | 'paypay' | 'bank'
  supportedMethods: string[]
  successRate: number
  processed30d: number
  transactions30d: number
  lastPing: string
  fees: string
  color: string
  bgColor: string
}

const initialGateways: Gateway[] = [
  {
    id: '1', name: 'Stripe', description: 'Primary payment processor for credit and debit card transactions',
    status: 'Active', icon: 'stripe', supportedMethods: ['Visa', 'Mastercard', 'Amex', 'Apple Pay', 'Google Pay'],
    successRate: 98.5, processed30d: 125000, transactions30d: 1847, lastPing: '2ms',
    fees: '2.9% + HK$2.35', color: 'text-indigo-600', bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
  },
  {
    id: '2', name: 'PayPay', description: 'QR code and mobile payment gateway for Japanese market',
    status: 'Active', icon: 'paypay', supportedMethods: ['QR Code', 'Mobile Wallet', 'Bank Link'],
    successRate: 99.1, processed30d: 45000, transactions30d: 632, lastPing: '5ms',
    fees: '1.98%', color: 'text-red-600', bgColor: 'bg-red-50 dark:bg-red-900/20',
  },
  {
    id: '3', name: 'Bank Transfer', description: 'Manual bank transfer processing for large or recurring payments',
    status: 'Active', icon: 'bank', supportedMethods: ['Wire Transfer', 'ACH', 'CHATS'],
    successRate: 100, processed30d: 30000, transactions30d: 48, lastPing: 'N/A',
    fees: 'HK$0 - HK$200', color: 'text-emerald-600', bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
  },
  {
    id: '4', name: 'FPS', description: 'Faster Payment System for Hong Kong instant transfers',
    status: 'Inactive', icon: 'bank', supportedMethods: ['FPS QR', 'FPS ID', 'Mobile Number'],
    successRate: 0, processed30d: 0, transactions30d: 0, lastPing: '--',
    fees: 'Free', color: 'text-cyan-600', bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
  },
]

const gatewayIcons: Record<string, React.ReactNode> = {
  stripe: <CreditCard className="h-6 w-6" />,
  paypay: <Smartphone className="h-6 w-6" />,
  bank: <Building className="h-6 w-6" />,
}

export default function PaymentsPage() {
  const [gateways, setGateways] = useState<Gateway[]>(initialGateways)
  const [testingId, setTestingId] = useState<string | null>(null)
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; latency: string } | null>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const activeCount = gateways.filter((g) => g.status === 'Active').length
  const totalTransactions = gateways.reduce((sum, g) => sum + g.transactions30d, 0)
  const totalProcessed = gateways.reduce((sum, g) => sum + g.processed30d, 0)
  const avgSuccessRate = activeCount > 0
    ? (gateways.filter((g) => g.status === 'Active').reduce((sum, g) => sum + g.successRate, 0) / activeCount).toFixed(1)
    : '0'

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  const handleTestConnection = async (id: string) => {
    setTestingId(id)
    setTestResult(null)
    await new Promise((r) => setTimeout(r, 2000))
    const gateway = gateways.find((g) => g.id === id)
    const success = gateway?.status === 'Active'
    const latency = success ? `${Math.floor(Math.random() * 15) + 1}ms` : 'timeout'
    setTestResult({ id, success, latency })
    setTestingId(null)
    showToast(success ? 'success' : 'error', success ? `${gateway?.name} connection successful (${latency})` : `${gateway?.name} connection failed`)
  }

  const toggleGateway = (id: string) => {
    setGateways(gateways.map((g) => {
      if (g.id !== id) return g
      const newStatus = g.status === 'Active' ? 'Inactive' : 'Active'
      showToast('success', `${g.name} ${newStatus === 'Active' ? 'enabled' : 'disabled'}`)
      return { ...g, status: newStatus }
    }))
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`
    return `$${amount}`
  }

  const statsData = [
    { title: 'Total Gateways', value: gateways.length.toString(), icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { title: 'Active', value: activeCount.toString(), icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
    { title: 'Transactions (30d)', value: totalTransactions.toLocaleString(), icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { title: 'Success Rate', value: `${avgSuccessRate}%`, icon: ShieldCheck, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  ]

  return (
    <div className="p-6 space-y-6">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-lg shadow-lg ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
            {toast.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            <span className="text-sm font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Gateways</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage payment processors and transaction settings</p>
          </div>
          <Button><Settings className="h-4 w-4 mr-2" /> Global Settings</Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, i) => (
          <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.bg}`}><stat.icon className={`h-5 w-5 ${stat.color}`} /></div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Total Processed Banner */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-700 border-0">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Processed (Last 30 Days)</p>
              <p className="text-3xl font-bold text-white mt-1">${totalProcessed.toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-2 text-green-300">
              <ArrowUpRight className="h-5 w-5" />
              <span className="text-lg font-medium">+12.3%</span>
              <span className="text-blue-200 text-sm">vs last month</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Gateway Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {gateways.map((gateway, i) => (
          <motion.div key={gateway.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}>
            <Card className={`overflow-hidden ${gateway.status === 'Inactive' ? 'opacity-75' : ''}`}>
              <CardContent className="p-0">
                {/* Gateway Header */}
                <div className={`p-5 ${gateway.bgColor}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl bg-white dark:bg-gray-800 shadow-sm ${gateway.color}`}>
                        {gatewayIcons[gateway.icon]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{gateway.name}</h3>
                          <Badge className={
                            gateway.status === 'Active' ? 'bg-green-100 text-green-700'
                              : gateway.status === 'Testing' ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-gray-200 text-gray-600'
                          }>
                            {gateway.status === 'Active' && <Wifi className="h-3 w-3 mr-1" />}
                            {gateway.status === 'Inactive' && <WifiOff className="h-3 w-3 mr-1" />}
                            {gateway.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{gateway.description}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gateway Body */}
                <div className="p-5 space-y-4">
                  {/* Supported Methods */}
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Supported Methods</p>
                    <div className="flex flex-wrap gap-1.5">
                      {gateway.supportedMethods.map((method) => (
                        <span key={method} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full">
                          {method}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {gateway.processed30d > 0 ? formatCurrency(gateway.processed30d) : '--'}
                      </p>
                      <p className="text-[10px] text-gray-500 uppercase">30d Volume</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {gateway.transactions30d > 0 ? gateway.transactions30d.toLocaleString() : '--'}
                      </p>
                      <p className="text-[10px] text-gray-500 uppercase">Transactions</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{gateway.fees}</p>
                      <p className="text-[10px] text-gray-500 uppercase">Fees</p>
                    </div>
                  </div>

                  {/* Success Rate */}
                  {gateway.status === 'Active' && (
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-500">Success Rate</span>
                        <span className={`font-semibold ${gateway.successRate >= 99 ? 'text-green-600' : gateway.successRate >= 95 ? 'text-yellow-600' : 'text-red-500'}`}>
                          {gateway.successRate}%
                        </span>
                      </div>
                      <Progress value={gateway.successRate} className="h-2" />
                    </div>
                  )}

                  {/* Ping */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Last ping: {gateway.lastPing}</span>
                    {testResult?.id === gateway.id && (
                      <span className={testResult.success ? 'text-green-600' : 'text-red-500'}>
                        Test: {testResult.success ? `OK (${testResult.latency})` : 'Failed'}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t dark:border-gray-700">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleTestConnection(gateway.id)}
                      disabled={testingId === gateway.id}
                    >
                      {testingId === gateway.id ? (
                        <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Testing...</>
                      ) : (
                        <><RefreshCw className="h-3 w-3 mr-1" /> Test Connection</>
                      )}
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Settings className="h-3 w-3 mr-1" /> Configure
                    </Button>
                    <Button
                      variant={gateway.status === 'Active' ? 'outline' : 'default'}
                      size="sm"
                      onClick={() => toggleGateway(gateway.id)}
                      className={gateway.status === 'Active' ? 'text-red-500 hover:text-red-700 hover:bg-red-50' : ''}
                    >
                      <Power className="h-3 w-3 mr-1" />
                      {gateway.status === 'Active' ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
