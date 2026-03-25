'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    CreditCard, DollarSign, Settings, Shield, Globe, Key,
    CheckCircle, AlertTriangle, Plus, Edit, Trash2, Eye,
    EyeOff, Save, RefreshCw, Copy, ExternalLink, Percent,
    TrendingUp, Clock, Users
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface PaymentGateway {
    id: string
    name: string
    description: string
    status: 'active' | 'inactive' | 'testing'
    logo: string
    config: Record<string, any>
    fees: Record<string, string>
    features: string[]
    monthlyVolume?: string
    successRate?: string
}

interface PaymentMethod {
    id: string
    name: string
    type: 'card' | 'wallet' | 'bank' | 'crypto'
    enabled: boolean
    processingFee: string
    icon: any
}

interface CurrencyConfig {
    code: string
    name: string
    symbol: string
    enabled: boolean
    exchangeRate: number
}

const paymentGateways: PaymentGateway[] = [
    {
        id: 'stripe',
        name: 'Stripe',
        description: 'Accept credit cards, debit cards, and digital wallets',
        status: 'active',
        logo: '💳',
        config: {
            publicKey: 'pk_live_51H...',
            secretKey: 'sk_live_51H...',
            webhookSecret: 'whsec_1H...',
            currency: 'HKD',
            captureMethod: 'automatic'
        },
        fees: {
            creditCard: '2.9% + $0.30',
            internationalCard: '3.4% + $0.30',
            digitalWallet: '2.9% + $0.30'
        },
        features: ['Credit Cards', 'Digital Wallets', 'Subscriptions', 'Refunds'],
        monthlyVolume: '$45,230',
        successRate: '98.5%'
    },
    {
        id: 'paypal',
        name: 'PayPal',
        description: 'Accept PayPal payments and credit cards',
        status: 'active',
        logo: '🅿️',
        config: {
            clientId: 'AYiPC9BjuuoD...',
            clientSecret: 'EHtS2qZnhBxTJ...',
            mode: 'live',
            currency: 'HKD'
        },
        fees: {
            paypalAccount: '3.4% + $0.30',
            creditCard: '3.9% + $0.30',
            international: '4.4% + $0.30'
        },
        features: ['PayPal Account', 'Credit Cards', 'Express Checkout'],
        monthlyVolume: '$12,450',
        successRate: '96.2%'
    },
    {
        id: 'alipay',
        name: 'Alipay',
        description: 'Accept Alipay payments for Chinese customers',
        status: 'inactive',
        logo: '🇨🇳',
        config: {
            appId: '',
            privateKey: '',
            publicKey: '',
            environment: 'sandbox'
        },
        fees: {
            domestic: '0.6%',
            international: '1.2%'
        },
        features: ['QR Code', 'Mobile App', 'Web Payments'],
        monthlyVolume: '$0',
        successRate: 'N/A'
    },
    {
        id: 'wechat',
        name: 'WeChat Pay',
        description: 'Accept WeChat Pay for Chinese customers',
        status: 'testing',
        logo: '💬',
        config: {
            appId: 'wx1234567890',
            mchId: '1234567890',
            apiKey: 'test_key_123...',
            environment: 'sandbox'
        },
        fees: {
            domestic: '0.6%',
            international: '1.2%'
        },
        features: ['QR Code', 'In-App', 'Mini Program'],
        monthlyVolume: '$2,100',
        successRate: '94.1%'
    }
]

const paymentMethods: PaymentMethod[] = [
    { id: 'visa', name: 'Visa', type: 'card', enabled: true, processingFee: '2.9%', icon: CreditCard },
    { id: 'mastercard', name: 'Mastercard', type: 'card', enabled: true, processingFee: '2.9%', icon: CreditCard },
    { id: 'amex', name: 'American Express', type: 'card', enabled: false, processingFee: '3.5%', icon: CreditCard },
    { id: 'apple_pay', name: 'Apple Pay', type: 'wallet', enabled: true, processingFee: '2.9%', icon: Globe },
    { id: 'google_pay', name: 'Google Pay', type: 'wallet', enabled: true, processingFee: '2.9%', icon: Globe },
    { id: 'bank_transfer', name: 'Bank Transfer', type: 'bank', enabled: false, processingFee: '1.5%', icon: DollarSign }
]

const currencies: CurrencyConfig[] = [
    { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', enabled: true, exchangeRate: 1.0 },
    { code: 'USD', name: 'US Dollar', symbol: '$', enabled: true, exchangeRate: 0.128 },
    { code: 'EUR', name: 'Euro', symbol: '€', enabled: false, exchangeRate: 0.115 },
    { code: 'GBP', name: 'British Pound', symbol: '£', enabled: false, exchangeRate: 0.101 },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', enabled: true, exchangeRate: 0.918 }
]

export default function PaymentSettingsPage() {
    const [activeTab, setActiveTab] = useState('gateways')
    const [showApiKeys, setShowApiKeys] = useState<{ [key: string]: boolean }>({})
    const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null)
    const [isConfiguring, setIsConfiguring] = useState(false)

    const toggleApiKeyVisibility = (gatewayId: string) => {
        setShowApiKeys(prev => ({
            ...prev,
            [gatewayId]: !prev[gatewayId]
        }))
    }

    const handleConfigureGateway = (gateway: PaymentGateway) => {
        setSelectedGateway(gateway)
        setIsConfiguring(true)
    }

    const handleToggleGateway = (gatewayId: string) => {
        console.log('Toggle gateway:', gatewayId)
    }

    const handleTogglePaymentMethod = (methodId: string) => {
        console.log('Toggle payment method:', methodId)
    }

    const handleToggleCurrency = (currencyCode: string) => {
        console.log('Toggle currency:', currencyCode)
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800'
            case 'inactive': return 'bg-gray-100 text-gray-800'
            case 'testing': return 'bg-yellow-100 text-yellow-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Payment Settings</h1>
                    <p className="text-gray-600 mt-2">
                        Configure payment gateways, methods, and processing options
                    </p>
                </div>
                <div className="flex space-x-3">
                    <Button id="admin-settings-payments-btn" variant="outline">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Sync Rates
                    </Button>
                    <Button id="admin-settings-payments-btn-2" className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                    </Button>
                </div>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-6"
            >
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Gateways</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {paymentGateways.filter(g => g.status === 'active').length}
                                </p>
                            </div>
                            <CreditCard className="w-8 h-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Monthly Volume</p>
                                <p className="text-2xl font-bold text-gray-900">$57,680</p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                                <p className="text-2xl font-bold text-gray-900">97.8%</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Avg. Processing</p>
                                <p className="text-2xl font-bold text-gray-900">2.3s</p>
                            </div>
                            <Clock className="w-8 h-8 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Main Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="gateways">Payment Gateways</TabsTrigger>
                        <TabsTrigger value="methods">Payment Methods</TabsTrigger>
                        <TabsTrigger value="currencies">Currencies</TabsTrigger>
                        <TabsTrigger value="settings">General Settings</TabsTrigger>
                    </TabsList>

                    {/* Payment Gateways Tab */}
                    <TabsContent value="gateways" className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Payment Gateways</h3>
                            <Button id="admin-settings-payments-btn-3">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Gateway
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {paymentGateways.map((gateway) => (
                                <Card key={gateway.id} className="hover:shadow-lg transition-shadow duration-200">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="text-2xl">{gateway.logo}</div>
                                                <div>
                                                    <CardTitle className="text-lg">{gateway.name}</CardTitle>
                                                    <p className="text-sm text-gray-600">{gateway.description}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Badge className={getStatusColor(gateway.status)}>
                                                    {gateway.status}
                                                </Badge>
                                                <Switch
                                                    checked={gateway.status === 'active'}
                                                    onCheckedChange={() => handleToggleGateway(gateway.id)}
                                                />
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {/* Gateway Stats */}
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="text-gray-600">Monthly Volume</p>
                                                    <p className="font-semibold">{gateway.monthlyVolume}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600">Success Rate</p>
                                                    <p className="font-semibold">{gateway.successRate}</p>
                                                </div>
                                            </div>

                                            {/* Features */}
                                            <div>
                                                <p className="text-sm text-gray-600 mb-2">Features</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {gateway.features.map((feature) => (
                                                        <Badge key={feature} variant="outline" className="text-xs">
                                                            {feature}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Fees */}
                                            <div>
                                                <p className="text-sm text-gray-600 mb-2">Processing Fees</p>
                                                <div className="space-y-1 text-xs">
                                                    {Object.entries(gateway.fees).map(([type, fee]) => (
                                                        <div key={type} className="flex justify-between">
                                                            <span className="capitalize">{type.replace(/([A-Z])/g, ' $1')}</span>
                                                            <span className="font-medium">{fee}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex space-x-2 pt-2">
                                                <Button id="admin-settings-payments-btn-4"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleConfigureGateway(gateway)}
                                                    className="flex-1"
                                                >
                                                    <Settings className="w-4 h-4 mr-2" />
                                                    Configure
                                                </Button>
                                                <Button id="admin-settings-payments-btn-5"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => toggleApiKeyVisibility(gateway.id)}
                                                >
                                                    {showApiKeys[gateway.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Payment Methods Tab */}
                    <TabsContent value="methods" className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Accepted Payment Methods</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {paymentMethods.map((method) => (
                                <Card key={method.id}>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <method.icon className="w-6 h-6 text-gray-600" />
                                                <div>
                                                    <h4 className="font-medium">{method.name}</h4>
                                                    <p className="text-sm text-gray-600">Fee: {method.processingFee}</p>
                                                </div>
                                            </div>
                                            <Switch
                                                checked={method.enabled}
                                                onCheckedChange={() => handleTogglePaymentMethod(method.id)}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Currencies Tab */}
                    <TabsContent value="currencies" className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Supported Currencies</h3>
                            <Button id="admin-settings-payments-btn-6">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Currency
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {currencies.map((currency) => (
                                <Card key={currency.code}>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                                                    <span className="text-white font-bold">{currency.symbol}</span>
                                                </div>
                                                <div>
                                                    <h4 className="font-medium">{currency.name}</h4>
                                                    <p className="text-sm text-gray-600">
                                                        {currency.code} • Rate: {currency.exchangeRate}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <Badge className={currency.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                                    {currency.enabled ? 'Active' : 'Inactive'}
                                                </Badge>
                                                <Switch
                                                    checked={currency.enabled}
                                                    onCheckedChange={() => handleToggleCurrency(currency.code)}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    {/* General Settings Tab */}
                    <TabsContent value="settings" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>General Payment Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label htmlFor="default-currency">Default Currency</Label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select currency" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="HKD">Hong Kong Dollar (HKD)</SelectItem>
                                                <SelectItem value="USD">US Dollar (USD)</SelectItem>
                                                <SelectItem value="EUR">Euro (EUR)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="payment-timeout">Payment Timeout (minutes)</Label>
                                        <Input id="payment-timeout" type="number" defaultValue="15" />
                                    </div>

                                    <div>
                                        <Label htmlFor="refund-policy">Refund Policy (days)</Label>
                                        <Input id="refund-policy" type="number" defaultValue="30" />
                                    </div>

                                    <div>
                                        <Label htmlFor="minimum-amount">Minimum Payment Amount</Label>
                                        <Input id="minimum-amount" type="number" defaultValue="10" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium">Auto-capture payments</h4>
                                            <p className="text-sm text-gray-600">Automatically capture authorized payments</p>
                                        </div>
                                        <Switch checked />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium">Send payment receipts</h4>
                                            <p className="text-sm text-gray-600">Email receipts to customers automatically</p>
                                        </div>
                                        <Switch checked />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium">Enable partial refunds</h4>
                                            <p className="text-sm text-gray-600">Allow partial refunds for bookings</p>
                                        </div>
                                        <Switch checked />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </motion.div>

            {/* Configuration Modal */}
            {isConfiguring && selectedGateway && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => setIsConfiguring(false)}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <div className="text-2xl">{selectedGateway.logo}</div>
                                    <div>
                                        <h2 className="text-xl font-bold">Configure {selectedGateway.name}</h2>
                                        <p className="text-gray-600">{selectedGateway.description}</p>
                                    </div>
                                </div>
                                <Button id="admin-settings-payments-btn-7"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsConfiguring(false)}
                                >
                                    ✕
                                </Button>
                            </div>

                            <div className="space-y-6">
                                {Object.entries(selectedGateway.config).map(([key, value]) => (
                                    <div key={key}>
                                        <Label htmlFor={key} className="capitalize">
                                            {key.replace(/([A-Z])/g, ' $1')}
                                        </Label>
                                        <Input
                                            id={key}
                                            type={key.includes('secret') || key.includes('key') ? 'password' : 'text'}
                                            defaultValue={value}
                                            className="mt-1"
                                        />
                                    </div>
                                ))}

                                <div className="flex justify-end space-x-3">
                                    <Button id="admin-settings-payments-btn-cancel"
                                        variant="outline"
                                        onClick={() => setIsConfiguring(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button id="admin-settings-payments-btn-save-configuration" className="bg-gradient-to-r from-green-600 to-blue-600">
                                        Save Configuration
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    )
}
