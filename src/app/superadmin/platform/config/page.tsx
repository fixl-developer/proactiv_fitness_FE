'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Settings, Globe, Lock, Mail, MessageSquare, CreditCard,
    Save, RefreshCw, AlertTriangle, CheckCircle, Eye, EyeOff, Zap
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { superAdminService, PlatformSettings } from '@/services/superAdminService'

export default function PlatformConfigPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [settings, setSettings] = useState<PlatformSettings | null>(null)
    const [showSecrets, setShowSecrets] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await superAdminService.getPlatformSettings()
                setSettings(data)
            } catch (error) {
                console.error('Error fetching settings:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchSettings()
    }, [])

    const handleSaveSettings = async () => {
        if (!settings) return

        setIsSaving(true)
        try {
            await superAdminService.updatePlatformSettings(settings)
            setSaveSuccess(true)
            setTimeout(() => setSaveSuccess(false), 3000)
        } catch (error) {
            console.error('Error saving settings:', error)
        } finally {
            setIsSaving(false)
        }
    }

    const updateGeneralSettings = (key: string, value: any) => {
        if (!settings) return
        setSettings({
            ...settings,
            general: {
                ...settings.general,
                [key]: value
            }
        })
    }

    const updateSecuritySettings = (key: string, value: any) => {
        if (!settings) return
        setSettings({
            ...settings,
            security: {
                ...settings.security,
                [key]: value
            }
        })
    }

    const updatePasswordPolicy = (key: string, value: any) => {
        if (!settings) return
        setSettings({
            ...settings,
            security: {
                ...settings.security,
                passwordPolicy: {
                    ...settings.security.passwordPolicy,
                    [key]: value
                }
            }
        })
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Settings className="w-12 h-12 text-purple-600 mx-auto mb-4 animate-pulse" />
                    <p className="text-gray-600">Loading Platform Settings...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <Settings className="w-8 h-8 mr-3 text-purple-600" />
                        Platform Configuration
                    </h1>
                    <p className="text-gray-600 mt-1">Manage global platform settings and configurations</p>
                </div>
                <div className="flex items-center space-x-3">
                    {saveSuccess && (
                        <Badge className="bg-green-100 text-green-800 flex items-center">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Saved Successfully
                        </Badge>
                    )}
                    <Button
                        onClick={handleSaveSettings}
                        disabled={isSaving}
                        className="bg-purple-600 hover:bg-purple-700 flex items-center"
                    >
                        <Save className={`w-4 h-4 mr-2 ${isSaving ? 'animate-spin' : ''}`} />
                        Save Changes
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="general" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                    <TabsTrigger value="features">Features</TabsTrigger>
                    <TabsTrigger value="integrations">Integrations</TabsTrigger>
                </TabsList>

                {/* General Settings */}
                <TabsContent value="general">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Globe className="w-5 h-5 mr-2 text-blue-600" />
                                    General Settings
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="siteName">Site Name</Label>
                                        <Input
                                            id="siteName"
                                            value={settings?.general.siteName || ''}
                                            onChange={(e) => updateGeneralSettings('siteName', e.target.value)}
                                            placeholder="ProActive Sports"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="siteUrl">Site URL</Label>
                                        <Input
                                            id="siteUrl"
                                            value={settings?.general.siteUrl || ''}
                                            onChange={(e) => updateGeneralSettings('siteUrl', e.target.value)}
                                            placeholder="https://proactiv.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="adminEmail">Admin Email</Label>
                                        <Input
                                            id="adminEmail"
                                            type="email"
                                            value={settings?.general.adminEmail || ''}
                                            onChange={(e) => updateGeneralSettings('adminEmail', e.target.value)}
                                            placeholder="admin@proactiv.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="timezone">Timezone</Label>
                                        <Select value={settings?.general.timezone || 'UTC'} onValueChange={(value) => updateGeneralSettings('timezone', value)}>
                                            <SelectTrigger id="timezone">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="UTC">UTC</SelectItem>
                                                <SelectItem value="EST">EST</SelectItem>
                                                <SelectItem value="CST">CST</SelectItem>
                                                <SelectItem value="MST">MST</SelectItem>
                                                <SelectItem value="PST">PST</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <Zap className="w-5 h-5 text-yellow-600" />
                                        <div>
                                            <p className="font-medium text-gray-900">Maintenance Mode</p>
                                            <p className="text-sm text-gray-600">Disable access for all users except admins</p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={settings?.general.maintenanceMode || false}
                                        onCheckedChange={(checked) => updateGeneralSettings('maintenanceMode', checked)}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </TabsContent>

                {/* Security Settings */}
                <TabsContent value="security">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="space-y-6">
                            {/* Password Policy */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Lock className="w-5 h-5 mr-2 text-red-600" />
                                        Password Policy
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="minLength">Minimum Length</Label>
                                            <Input
                                                id="minLength"
                                                type="number"
                                                value={settings?.security.passwordPolicy.minLength || 8}
                                                onChange={(e) => updatePasswordPolicy('minLength', parseInt(e.target.value))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="expirationDays">Expiration Days</Label>
                                            <Input
                                                id="expirationDays"
                                                type="number"
                                                value={settings?.security.passwordPolicy.expirationDays || 90}
                                                onChange={(e) => updatePasswordPolicy('expirationDays', parseInt(e.target.value))}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label>Require Uppercase</Label>
                                            <Switch
                                                checked={settings?.security.passwordPolicy.requireUppercase || false}
                                                onCheckedChange={(checked) => updatePasswordPolicy('requireUppercase', checked)}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <Label>Require Lowercase</Label>
                                            <Switch
                                                checked={settings?.security.passwordPolicy.requireLowercase || false}
                                                onCheckedChange={(checked) => updatePasswordPolicy('requireLowercase', checked)}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <Label>Require Numbers</Label>
                                            <Switch
                                                checked={settings?.security.passwordPolicy.requireNumbers || false}
                                                onCheckedChange={(checked) => updatePasswordPolicy('requireNumbers', checked)}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <Label>Require Special Characters</Label>
                                            <Switch
                                                checked={settings?.security.passwordPolicy.requireSpecialChars || false}
                                                onCheckedChange={(checked) => updatePasswordPolicy('requireSpecialChars', checked)}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Session Settings */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Session Settings</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="sessionTimeout">Session Timeout (seconds)</Label>
                                            <Input
                                                id="sessionTimeout"
                                                type="number"
                                                value={settings?.security.sessionTimeout || 3600}
                                                onChange={(e) => updateSecuritySettings('sessionTimeout', parseInt(e.target.value))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                                            <Input
                                                id="maxLoginAttempts"
                                                type="number"
                                                value={settings?.security.maxLoginAttempts || 5}
                                                onChange={(e) => updateSecuritySettings('maxLoginAttempts', parseInt(e.target.value))}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Label>Require Two-Factor Authentication</Label>
                                        <Switch
                                            checked={settings?.security.twoFactorRequired || false}
                                            onCheckedChange={(checked) => updateSecuritySettings('twoFactorRequired', checked)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </motion.div>
                </TabsContent>

                {/* Features */}
                <TabsContent value="features">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Zap className="w-5 h-5 mr-2 text-green-600" />
                                    Feature Flags
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900">Enable Booking</p>
                                        <p className="text-sm text-gray-600">Allow users to book classes</p>
                                    </div>
                                    <Switch checked={true} />
                                </div>
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900">Enable Payments</p>
                                        <p className="text-sm text-gray-600">Process payments through platform</p>
                                    </div>
                                    <Switch checked={true} />
                                </div>
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900">Enable Notifications</p>
                                        <p className="text-sm text-gray-600">Send email and SMS notifications</p>
                                    </div>
                                    <Switch checked={true} />
                                </div>
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900">Enable Analytics</p>
                                        <p className="text-sm text-gray-600">Track user behavior and metrics</p>
                                    </div>
                                    <Switch checked={true} />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </TabsContent>

                {/* Integrations */}
                <TabsContent value="integrations">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="space-y-6">
                            {/* Email Integration */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Mail className="w-5 h-5 mr-2 text-blue-600" />
                                        Email Service
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="emailProvider">Provider</Label>
                                        <Select defaultValue="sendgrid">
                                            <SelectTrigger id="emailProvider">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="sendgrid">SendGrid</SelectItem>
                                                <SelectItem value="mailgun">Mailgun</SelectItem>
                                                <SelectItem value="aws">AWS SES</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="emailApiKey">API Key</Label>
                                        <div className="flex items-center space-x-2">
                                            <Input
                                                id="emailApiKey"
                                                type={showSecrets ? 'text' : 'password'}
                                                value="***"
                                                readOnly
                                            />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setShowSecrets(!showSecrets)}
                                            >
                                                {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label>Enabled</Label>
                                        <Switch checked={true} />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* SMS Integration */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <MessageSquare className="w-5 h-5 mr-2 text-green-600" />
                                        SMS Service
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="smsProvider">Provider</Label>
                                        <Select defaultValue="twilio">
                                            <SelectTrigger id="smsProvider">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="twilio">Twilio</SelectItem>
                                                <SelectItem value="aws">AWS SNS</SelectItem>
                                                <SelectItem value="vonage">Vonage</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="smsApiKey">API Key</Label>
                                        <div className="flex items-center space-x-2">
                                            <Input
                                                id="smsApiKey"
                                                type={showSecrets ? 'text' : 'password'}
                                                value="***"
                                                readOnly
                                            />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setShowSecrets(!showSecrets)}
                                            >
                                                {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label>Enabled</Label>
                                        <Switch checked={true} />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Payment Integration */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <CreditCard className="w-5 h-5 mr-2 text-purple-600" />
                                        Payment Gateway
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="paymentProvider">Provider</Label>
                                        <Select defaultValue="stripe">
                                            <SelectTrigger id="paymentProvider">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="stripe">Stripe</SelectItem>
                                                <SelectItem value="paypal">PayPal</SelectItem>
                                                <SelectItem value="square">Square</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="paymentApiKey">API Key</Label>
                                        <div className="flex items-center space-x-2">
                                            <Input
                                                id="paymentApiKey"
                                                type={showSecrets ? 'text' : 'password'}
                                                value="***"
                                                readOnly
                                            />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setShowSecrets(!showSecrets)}
                                            >
                                                {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label>Enabled</Label>
                                        <Switch checked={true} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </motion.div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
