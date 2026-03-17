'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Shield, Lock, Key, Eye, EyeOff, AlertTriangle, CheckCircle,
    Users, Clock, Globe, Smartphone, Mail, Settings, Save,
    RefreshCw, Plus, Edit, Trash2, Copy, Download, Upload,
    UserCheck, Activity, FileText, Database, Wifi, Server
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface SecurityPolicy {
    id: string
    name: string
    description: string
    enabled: boolean
    severity: 'low' | 'medium' | 'high' | 'critical'
    lastUpdated: string
}

interface AccessLog {
    id: string
    user: string
    action: string
    resource: string
    timestamp: string
    ip: string
    status: 'success' | 'failed' | 'blocked'
    location: string
}

interface ApiKey {
    id: string
    name: string
    key: string
    permissions: string[]
    created: string
    lastUsed: string
    status: 'active' | 'inactive' | 'expired'
}

const securityPolicies: SecurityPolicy[] = [
    {
        id: 'password_policy',
        name: 'Password Policy',
        description: 'Enforce strong password requirements',
        enabled: true,
        severity: 'high',
        lastUpdated: '2024-01-15'
    },
    {
        id: 'two_factor_auth',
        name: 'Two-Factor Authentication',
        description: 'Require 2FA for admin accounts',
        enabled: true,
        severity: 'critical',
        lastUpdated: '2024-01-14'
    },
    {
        id: 'session_timeout',
        name: 'Session Timeout',
        description: 'Auto-logout after inactivity',
        enabled: true,
        severity: 'medium',
        lastUpdated: '2024-01-13'
    },
    {
        id: 'ip_whitelist',
        name: 'IP Whitelist',
        description: 'Restrict access to specific IP addresses',
        enabled: false,
        severity: 'high',
        lastUpdated: '2024-01-10'
    },
    {
        id: 'rate_limiting',
        name: 'Rate Limiting',
        description: 'Limit API requests per user',
        enabled: true,
        severity: 'medium',
        lastUpdated: '2024-01-12'
    },
    {
        id: 'data_encryption',
        name: 'Data Encryption',
        description: 'Encrypt sensitive data at rest',
        enabled: true,
        severity: 'critical',
        lastUpdated: '2024-01-11'
    }
]

const accessLogs: AccessLog[] = [
    {
        id: '1',
        user: 'admin@progym.hk',
        action: 'Login',
        resource: 'Admin Dashboard',
        timestamp: '2024-01-15 14:30:25',
        ip: '192.168.1.100',
        status: 'success',
        location: 'Hong Kong'
    },
    {
        id: '2',
        user: 'manager@progym.hk',
        action: 'View',
        resource: 'Customer Data',
        timestamp: '2024-01-15 14:25:10',
        ip: '192.168.1.105',
        status: 'success',
        location: 'Hong Kong'
    },
    {
        id: '3',
        user: 'unknown',
        action: 'Login Attempt',
        resource: 'Admin Dashboard',
        timestamp: '2024-01-15 14:20:45',
        ip: '203.123.45.67',
        status: 'blocked',
        location: 'Unknown'
    },
    {
        id: '4',
        user: 'coach@progym.hk',
        action: 'Update',
        resource: 'Schedule',
        timestamp: '2024-01-15 14:15:30',
        ip: '192.168.1.110',
        status: 'success',
        location: 'Hong Kong'
    },
    {
        id: '5',
        user: 'admin@progym.hk',
        action: 'Failed Login',
        resource: 'Admin Dashboard',
        timestamp: '2024-01-15 14:10:15',
        ip: '192.168.1.100',
        status: 'failed',
        location: 'Hong Kong'
    }
]

const apiKeys: ApiKey[] = [
    {
        id: '1',
        name: 'Mobile App API',
        key: 'pk_live_51H7J8K...',
        permissions: ['read:bookings', 'write:bookings', 'read:users'],
        created: '2024-01-01',
        lastUsed: '2024-01-15 14:30',
        status: 'active'
    },
    {
        id: '2',
        name: 'Analytics Integration',
        key: 'pk_test_41G6H9L...',
        permissions: ['read:analytics', 'read:reports'],
        created: '2024-01-05',
        lastUsed: '2024-01-14 10:15',
        status: 'active'
    },
    {
        id: '3',
        name: 'Legacy System',
        key: 'pk_live_31F5G8M...',
        permissions: ['read:customers'],
        created: '2023-12-15',
        lastUsed: '2023-12-20 16:45',
        status: 'expired'
    }
]

const severityColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800'
}

const statusColors = {
    success: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    blocked: 'bg-gray-100 text-gray-800',
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    expired: 'bg-red-100 text-red-800'
}

export default function SecuritySettingsPage() {
    const [activeTab, setActiveTab] = useState('policies')
    const [showApiKeys, setShowApiKeys] = useState<{ [key: string]: boolean }>({})
    const [selectedPolicy, setSelectedPolicy] = useState<SecurityPolicy | null>(null)
    const [isConfiguring, setIsConfiguring] = useState(false)

    const toggleApiKeyVisibility = (keyId: string) => {
        setShowApiKeys(prev => ({
            ...prev,
            [keyId]: !prev[keyId]
        }))
    }

    const handleTogglePolicy = (policyId: string) => {
        console.log('Toggle policy:', policyId)
    }

    const handleConfigurePolicy = (policy: SecurityPolicy) => {
        setSelectedPolicy(policy)
        setIsConfiguring(true)
    }

    const handleRevokeApiKey = (keyId: string) => {
        console.log('Revoke API key:', keyId)
    }

    const handleGenerateApiKey = () => {
        console.log('Generate new API key')
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
                    <h1 className="text-3xl font-bold text-gray-900">Security Settings</h1>
                    <p className="text-gray-600 mt-2">
                        Configure security policies, access controls, and monitoring
                    </p>
                </div>
                <div className="flex space-x-3">
                    <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Export Logs
                    </Button>
                    <Button className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700">
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                    </Button>
                </div>
            </motion.div>

            {/* Security Overview Cards */}
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
                                <p className="text-sm font-medium text-gray-600">Security Score</p>
                                <p className="text-2xl font-bold text-green-600">92%</p>
                            </div>
                            <Shield className="w-8 h-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Policies</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {securityPolicies.filter(p => p.enabled).length}
                                </p>
                            </div>
                            <Lock className="w-8 h-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Failed Logins (24h)</p>
                                <p className="text-2xl font-bold text-red-600">3</p>
                            </div>
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                                <p className="text-2xl font-bold text-gray-900">12</p>
                            </div>
                            <Users className="w-8 h-8 text-purple-600" />
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
                        <TabsTrigger value="policies">Security Policies</TabsTrigger>
                        <TabsTrigger value="access">Access Logs</TabsTrigger>
                        <TabsTrigger value="api">API Keys</TabsTrigger>
                        <TabsTrigger value="settings">Advanced Settings</TabsTrigger>
                    </TabsList>

                    {/* Security Policies Tab */}
                    <TabsContent value="policies" className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Security Policies</h3>
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Policy
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {securityPolicies.map((policy) => (
                                <Card key={policy.id} className="hover:shadow-lg transition-shadow duration-200">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <h4 className="font-semibold text-gray-900">{policy.name}</h4>
                                                    <Badge className={severityColors[policy.severity]}>
                                                        {policy.severity}
                                                    </Badge>
                                                    <Switch
                                                        checked={policy.enabled}
                                                        onCheckedChange={() => handleTogglePolicy(policy.id)}
                                                    />
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">{policy.description}</p>
                                                <p className="text-xs text-gray-500">
                                                    Last updated: {policy.lastUpdated}
                                                </p>
                                            </div>
                                            <div className="flex space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleConfigurePolicy(policy)}
                                                >
                                                    <Settings className="w-4 h-4" />
                                                </Button>
                                                <Button variant="outline" size="sm">
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Access Logs Tab */}
                    <TabsContent value="access" className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Access Logs</h3>
                            <div className="flex space-x-2">
                                <Button variant="outline" size="sm">
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Refresh
                                </Button>
                                <Button variant="outline" size="sm">
                                    <Download className="w-4 h-4 mr-2" />
                                    Export
                                </Button>
                            </div>
                        </div>

                        <Card>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    User
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Action
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Resource
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    IP Address
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Timestamp
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {accessLogs.map((log) => (
                                                <tr key={log.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                                                <Users className="w-4 h-4 text-white" />
                                                            </div>
                                                            <div className="ml-3">
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {log.user}
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    {log.location}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {log.action}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {log.resource}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {log.ip}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <Badge className={statusColors[log.status]}>
                                                            {log.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {log.timestamp}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* API Keys Tab */}
                    <TabsContent value="api" className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">API Keys</h3>
                            <Button onClick={handleGenerateApiKey}>
                                <Plus className="w-4 h-4 mr-2" />
                                Generate API Key
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {apiKeys.map((apiKey) => (
                                <Card key={apiKey.id}>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <h4 className="font-semibold text-gray-900">{apiKey.name}</h4>
                                                    <Badge className={statusColors[apiKey.status]}>
                                                        {apiKey.status}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <Input
                                                        type={showApiKeys[apiKey.id] ? 'text' : 'password'}
                                                        value={apiKey.key}
                                                        readOnly
                                                        className="font-mono text-sm w-64"
                                                    />
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => toggleApiKeyVisibility(apiKey.id)}
                                                    >
                                                        {showApiKeys[apiKey.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </Button>
                                                    <Button variant="outline" size="sm">
                                                        <Copy className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                                <div className="flex flex-wrap gap-1 mb-2">
                                                    {apiKey.permissions.map((permission) => (
                                                        <Badge key={permission} variant="outline" className="text-xs">
                                                            {permission}
                                                        </Badge>
                                                    ))}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    <p>Created: {apiKey.created} • Last used: {apiKey.lastUsed}</p>
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                <Button variant="outline" size="sm">
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleRevokeApiKey(apiKey.id)}
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-600" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Advanced Settings Tab */}
                    <TabsContent value="settings" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Authentication Settings */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Lock className="w-5 h-5" />
                                        <span>Authentication</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                                        <Input id="session-timeout" type="number" defaultValue="30" />
                                    </div>
                                    <div>
                                        <Label htmlFor="max-login-attempts">Max Login Attempts</Label>
                                        <Input id="max-login-attempts" type="number" defaultValue="5" />
                                    </div>
                                    <div>
                                        <Label htmlFor="lockout-duration">Lockout Duration (minutes)</Label>
                                        <Input id="lockout-duration" type="number" defaultValue="15" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium">Require 2FA for admins</h4>
                                            <p className="text-sm text-gray-600">Force two-factor authentication</p>
                                        </div>
                                        <Switch checked />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Password Policy */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Key className="w-5 h-5" />
                                        <span>Password Policy</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="min-length">Minimum Length</Label>
                                        <Input id="min-length" type="number" defaultValue="8" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Require uppercase letters</span>
                                            <Switch checked />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Require numbers</span>
                                            <Switch checked />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Require special characters</span>
                                            <Switch checked />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Prevent password reuse</span>
                                            <Switch checked />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Network Security */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Globe className="w-5 h-5" />
                                        <span>Network Security</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="allowed-ips">Allowed IP Addresses</Label>
                                        <Textarea
                                            id="allowed-ips"
                                            placeholder="192.168.1.0/24&#10;10.0.0.0/8"
                                            rows={3}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium">Enable IP whitelist</h4>
                                            <p className="text-sm text-gray-600">Restrict access to specific IPs</p>
                                        </div>
                                        <Switch />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium">Enable rate limiting</h4>
                                            <p className="text-sm text-gray-600">Limit API requests per user</p>
                                        </div>
                                        <Switch checked />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Data Protection */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Database className="w-5 h-5" />
                                        <span>Data Protection</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium">Encrypt data at rest</h4>
                                            <p className="text-sm text-gray-600">Encrypt sensitive database fields</p>
                                        </div>
                                        <Switch checked />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium">Enable audit logging</h4>
                                            <p className="text-sm text-gray-600">Log all data access and changes</p>
                                        </div>
                                        <Switch checked />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium">Auto-backup encryption keys</h4>
                                            <p className="text-sm text-gray-600">Backup encryption keys daily</p>
                                        </div>
                                        <Switch checked />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </motion.div>

            {/* Policy Configuration Modal */}
            {isConfiguring && selectedPolicy && (
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
                                <div>
                                    <h2 className="text-xl font-bold">Configure {selectedPolicy.name}</h2>
                                    <p className="text-gray-600">{selectedPolicy.description}</p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsConfiguring(false)}
                                >
                                    ✕
                                </Button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <Label htmlFor="policy-enabled">Policy Status</Label>
                                    <div className="flex items-center space-x-2 mt-1">
                                        <Switch
                                            checked={selectedPolicy.enabled}
                                        />
                                        <span className="text-sm text-gray-600">
                                            {selectedPolicy.enabled ? 'Enabled' : 'Disabled'}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="policy-severity">Severity Level</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select severity" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="critical">Critical</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="policy-config">Configuration</Label>
                                    <Textarea
                                        id="policy-config"
                                        placeholder="Enter policy configuration..."
                                        rows={6}
                                        className="mt-1"
                                    />
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsConfiguring(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button className="bg-gradient-to-r from-red-600 to-pink-600">
                                        Save Policy
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
