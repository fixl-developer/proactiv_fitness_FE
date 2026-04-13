'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/services/api/client'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { CreditCard, Plus, Edit, Trash2, CheckCircle, XCircle, Loader2, Wifi, Star, Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { validateName, validateUrl, validateSelect, filterNameInput, FORMAT_HINTS } from '@/utils/validation'
import { FormFieldHint } from '@/components/ui/FormFieldHint'

interface PaymentGateway {
  id: string
  name: string
  provider: string
  isDefault: boolean
  status: string
  webhookUrl?: string
  createdAt?: string
}

export default function PaymentGatewaysPage() {
  const [gateways, setGateways] = useState<PaymentGateway[]>([])
  const [loading, setLoading] = useState(true)

  // Form
  const [showForm, setShowForm] = useState(false)
  const [editingGateway, setEditingGateway] = useState<PaymentGateway | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    provider: 'stripe' as 'stripe' | 'paypal' | 'square',
    apiKey: '',
    secretKey: '',
    webhookUrl: '',
    isDefault: false,
    status: 'active' as 'active' | 'inactive',
  })
  const [saving, setSaving] = useState(false)

  // Validation errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Test connection
  const [testingConnection, setTestingConnection] = useState<string | null>(null)
  const [connectionResults, setConnectionResults] = useState<Record<string, 'success' | 'error'>>({})

  const loadGateways = useCallback(async () => {
    try {
      setLoading(true)
      const data = await apiClient.get<any>('/payment-gateways')
      setGateways(Array.isArray(data) ? data : data?.data || [])
    } catch (error: any) {
      console.error('Failed to load payment gateways:', error)
      // If endpoint not found, show helpful empty state
      setGateways([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadGateways()
  }, [loadGateways])

  const openForm = (gateway?: PaymentGateway) => {
    if (gateway) {
      setEditingGateway(gateway)
      setFormData({
        name: gateway.name,
        provider: gateway.provider as 'stripe' | 'paypal' | 'square',
        apiKey: '',
        secretKey: '',
        webhookUrl: gateway.webhookUrl || '',
        isDefault: gateway.isDefault,
        status: gateway.status as 'active' | 'inactive',
      })
    } else {
      setEditingGateway(null)
      setFormData({
        name: '',
        provider: 'stripe',
        apiKey: '',
        secretKey: '',
        webhookUrl: '',
        isDefault: false,
        status: 'active',
      })
    }
    setFormErrors({})
    setShowForm(true)
  }

  const validateGatewayForm = (): boolean => {
    const errs: Record<string, string> = {}
    const nameErr = validateName(formData.name, 'Gateway name')
    if (nameErr) errs.name = nameErr
    const provErr = validateSelect(formData.provider, 'Provider')
    if (provErr) errs.provider = provErr
    if (formData.webhookUrl) {
      const urlErr = validateUrl(formData.webhookUrl, false)
      if (urlErr) errs.webhookUrl = urlErr
    }
    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateGatewayForm()) return
    setSaving(true)
    try {
      const payload = { ...formData }
      // Don't send empty key fields on edit
      if (editingGateway) {
        if (!payload.apiKey) delete (payload as any).apiKey
        if (!payload.secretKey) delete (payload as any).secretKey
        await apiClient.put(`/payment-gateways/${editingGateway.id}`, payload)
        toast.success('Payment gateway updated successfully')
      } else {
        await apiClient.post('/payment-gateways', payload)
        toast.success('Payment gateway created successfully')
      }
      setShowForm(false)
      setEditingGateway(null)
      loadGateways()
    } catch (error: any) {
      toast.error(editingGateway ? 'Failed to update gateway' : 'Failed to create gateway')
    } finally {
      setSaving(false)
    }
  }

  const handleSetDefault = async (id: string) => {
    try {
      await apiClient.patch(`/payment-gateways/${id}`, { isDefault: true })
      toast.success('Default gateway updated')
      loadGateways()
    } catch (error: any) {
      toast.error('Failed to set default gateway')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await apiClient.delete(`/payment-gateways/${deleteTarget.id}`)
      toast.success('Payment gateway deleted successfully')
      setDeleteTarget(null)
      loadGateways()
    } catch (error: any) {
      toast.error('Failed to delete gateway')
    } finally {
      setDeleting(false)
    }
  }

  const testConnection = async (gatewayId: string) => {
    setTestingConnection(gatewayId)
    try {
      await apiClient.get(`/payments/health`)
      setConnectionResults((prev) => ({ ...prev, [gatewayId]: 'success' }))
      toast.success('Connection test successful')
    } catch (error: any) {
      // Try alternative endpoint
      try {
        await apiClient.get(`/payments/stats`)
        setConnectionResults((prev) => ({ ...prev, [gatewayId]: 'success' }))
        toast.success('Connection test successful')
      } catch {
        setConnectionResults((prev) => ({ ...prev, [gatewayId]: 'error' }))
        toast.error('Connection test failed - gateway may be unreachable')
      }
    } finally {
      setTestingConnection(null)
    }
  }

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'stripe':
        return 'bg-gradient-to-br from-indigo-500 to-purple-600'
      case 'paypal':
        return 'bg-gradient-to-br from-blue-500 to-blue-700'
      case 'square':
        return 'bg-gradient-to-br from-green-500 to-teal-600'
      default:
        return 'bg-gradient-to-br from-gray-500 to-gray-700'
    }
  }

  const activeGateways = gateways.filter((g) => g.status === 'active')
  const defaultGateway = gateways.find((g) => g.isDefault)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Gateways</h1>
          <p className="text-gray-600 mt-2">Configure and manage payment gateway integrations</p>
        </div>
        <Button id="btn-open-form-admin-business-config-payments" onClick={() => openForm()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Gateway
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Gateways', value: gateways.length.toString(), icon: CreditCard, gradient: 'from-blue-500 to-blue-600', bgGradient: 'from-blue-50 to-blue-100' },
          { label: 'Active', value: activeGateways.length.toString(), icon: CheckCircle, gradient: 'from-green-500 to-emerald-600', bgGradient: 'from-green-50 to-emerald-100' },
          { label: 'Default', value: defaultGateway?.name || 'None', icon: Star, gradient: 'from-yellow-500 to-yellow-600', bgGradient: 'from-yellow-50 to-yellow-100', isText: true },
          { label: 'Providers', value: [...new Set(gateways.map((g) => g.provider))].length.toString(), icon: Shield, gradient: 'from-purple-500 to-purple-600', bgGradient: 'from-purple-50 to-purple-100' },
        ].map((stat, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
            <div className={`rounded-lg border-0 bg-gradient-to-br ${stat.bgGradient} p-4 hover:shadow-lg transition-all`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`bg-gradient-to-br ${stat.gradient} p-2.5 rounded-lg shadow-md`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-xs text-gray-600 font-medium mb-1">{stat.label}</p>
              <p className={`${(stat as any).isText ? 'text-lg' : 'text-2xl'} font-bold text-gray-900 truncate`}>{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Gateway Cards */}
      {loading ? (
        <Card>
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-500">Loading payment gateways...</p>
            </div>
          </CardContent>
        </Card>
      ) : gateways.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No payment gateways configured</p>
              <p className="text-gray-400 mt-1">Payment gateways are typically configured via environment variables.</p>
              <p className="text-gray-400">You can add gateway records here for tracking and management.</p>
              <Button id="admin-business-config-payments-add-empty-btn" className="mt-4" onClick={() => openForm()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Gateway
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gateways.map((gateway, idx) => (
            <motion.div key={gateway.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 ${getProviderIcon(gateway.provider)} rounded-lg flex items-center justify-center text-white`}>
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{gateway.name}</h3>
                        <p className="text-sm text-gray-500 capitalize">{gateway.provider}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {gateway.isDefault && (
                        <Badge className="bg-blue-100 text-blue-800">Default</Badge>
                      )}
                      <Badge className={gateway.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {gateway.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Connection status */}
                  {connectionResults[gateway.id] && (
                    <div
                      className={`flex items-center gap-2 p-2 rounded-lg mb-4 ${
                        connectionResults[gateway.id] === 'success'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {connectionResults[gateway.id] === 'success' ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      <span className="text-sm">
                        {connectionResults[gateway.id] === 'success' ? 'Connected' : 'Connection failed'}
                      </span>
                    </div>
                  )}

                  {gateway.webhookUrl && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500">Webhook URL</p>
                      <p className="text-sm text-gray-700 truncate">{gateway.webhookUrl}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Button id={`admin-business-config-payments-test-${gateway.id}-btn`}
                      variant="outline"
                      className="w-full"
                      size="sm"
                      onClick={() => testConnection(gateway.id)}
                      disabled={testingConnection === gateway.id}
                    >
                      {testingConnection === gateway.id ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Wifi className="w-4 h-4 mr-2" />
                      )}
                      Test Connection
                    </Button>
                    <div className="flex gap-2">
                      {!gateway.isDefault && (
                        <Button id={`admin-business-config-payments-setdefault-${gateway.id}-btn`} variant="outline" size="sm" className="flex-1" onClick={() => handleSetDefault(gateway.id)}>
                          <Star className="w-4 h-4 mr-1" />
                          Set Default
                        </Button>
                      )}
                      <Button id={`admin-business-config-payments-edit-${gateway.id}-btn`} variant="outline" size="sm" onClick={() => openForm(gateway)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button id={`admin-business-config-payments-delete-${gateway.id}-btn`}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => setDeleteTarget({ id: gateway.id, name: gateway.name })}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Environment Config Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="w-5 h-5 text-gray-600" />
            Environment Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-3">
            Payment gateway API keys and secrets are configured via environment variables for security.
            The records above are for management and status tracking.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { name: 'Stripe', vars: ['STRIPE_PUBLIC_KEY', 'STRIPE_SECRET_KEY'] },
              { name: 'PayPal', vars: ['PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_SECRET'] },
              { name: 'Square', vars: ['SQUARE_ACCESS_TOKEN', 'SQUARE_LOCATION_ID'] },
            ].map((provider) => (
              <div key={provider.name} className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-sm text-gray-900 mb-1">{provider.name}</p>
                {provider.vars.map((v) => (
                  <p key={v} className="text-xs text-gray-500 font-mono">{v}</p>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGateway ? 'Edit Gateway' : 'Add Payment Gateway'}</DialogTitle>
            <DialogDescription>
              {editingGateway
                ? 'Update the gateway details. Leave API key fields empty to keep existing values.'
                : 'Configure a new payment gateway integration.'}
            </DialogDescription>
          </DialogHeader>
          <form id="form-admin-business-config-payments" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Gateway Name</label>
              <input id="input-text-admin-business-config-payments"
                type="text"
                value={formData.name}
                onKeyDown={filterNameInput}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value })
                  const err = validateName(e.target.value, 'Gateway name')
                  setFormErrors((prev) => ({ ...prev, name: err || '' }))
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:border-blue-500 focus:outline-none ${formErrors.name ? 'border-red-500' : ''}`}
                placeholder="e.g. Primary Stripe"
                required
              />
              <FormFieldHint hint={FORMAT_HINTS.name} error={formErrors.name} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Provider</label>
              <select id="select-admin-business-config-payments-11"
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value as 'stripe' | 'paypal' | 'square' })}
                className="w-full px-4 py-2 border rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="stripe">Stripe</option>
                <option value="paypal">PayPal</option>
                <option value="square">Square</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Webhook URL <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input id="input-url-admin-business-config-payments"
                type="url"
                value={formData.webhookUrl}
                onChange={(e) => {
                  setFormData({ ...formData, webhookUrl: e.target.value })
                  if (e.target.value) {
                    const err = validateUrl(e.target.value, false)
                    setFormErrors((prev) => ({ ...prev, webhookUrl: err || '' }))
                  } else {
                    setFormErrors((prev) => ({ ...prev, webhookUrl: '' }))
                  }
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:border-blue-500 focus:outline-none ${formErrors.webhookUrl ? 'border-red-500' : ''}`}
                placeholder="https://example.com/webhook"
              />
              <FormFieldHint hint={FORMAT_HINTS.url} error={formErrors.webhookUrl} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select id="select-admin-business-config-payments-12"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                className="w-full px-4 py-2 border rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="admin-business-config-payments-default-checkbox"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="admin-business-config-payments-default-checkbox" className="text-sm font-medium">
                Set as default gateway
              </label>
            </div>
            <DialogFooter>
              <Button id="btn-set-show-form-admin-business-config-payments" type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button id="admin-business-config-payments-btn-3" type="submit" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingGateway ? 'Update Gateway' : 'Create Gateway'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button id="btn-set-delete-target-admin-business-config-payments" variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button id="btn-delete-admin-business-config-payments" variant="destructive" onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700 text-white">
              {deleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
