'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, AlertCircle, CreditCard, X, Eye, EyeOff, Wifi } from 'lucide-react'
import { toast } from 'sonner'
import { SlideInDrawer } from '@/components/ui/SlideInDrawer'
import { PaymentGatewayService } from '@/services/businessConfigService'
import { getErrorMessage } from '@/utils/apiErrorHandler'

interface PaymentGateway {
  id: string
  name: string
  provider: string
  apiKey?: string
  secretKey?: string
  webhookUrl?: string
  supportedCurrencies?: string[]
  isActive: boolean
}

export default function PaymentGatewaysPage() {
  const [gateways, setGateways] = useState<PaymentGateway[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [testingConnection, setTestingConnection] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    provider: 'Stripe',
    apiKey: '',
    secretKey: '',
    webhookUrl: '',
    supportedCurrencies: [] as string[],
    isActive: true,
  })

  const [newCurrency, setNewCurrency] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [showSecretKey, setShowSecretKey] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const providers = ['Stripe', 'PayPal', 'PayPay', 'Square']

  const loadGateways = async () => {
    try {
      setLoading(true)
      const response = await PaymentGatewayService.getAll({
        page: currentPage,
        limit: 10,
        search: searchTerm,
      })
      setGateways(response.data || [])
      setTotalPages(response.pagination?.totalPages || 1)
    } catch (error) {
      console.error('Error loading payment gateways:', error)
      toast.error('Failed to load payment gateways')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGateways()
  }, [currentPage, searchTerm])

  const validateFormData = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name) newErrors.name = 'Gateway name is required'
    if (!formData.provider) newErrors.provider = 'Provider is required'
    if (!formData.apiKey && !editingId) newErrors.apiKey = 'API key is required'
    if (!formData.secretKey && !editingId) newErrors.secretKey = 'Secret key is required'

    if (formData.webhookUrl && !/^https?:\/\/.+/.test(formData.webhookUrl)) {
      newErrors.webhookUrl = 'Invalid URL format'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateFormData()) {
      toast.error('Please fix the highlighted fields')
      return
    }

    try {
      setSubmitting(true)

      const payload = { ...formData }
      // Don't send empty keys on edit
      if (editingId) {
        if (!payload.apiKey) delete (payload as any).apiKey
        if (!payload.secretKey) delete (payload as any).secretKey
      }

      if (editingId) {
        await PaymentGatewayService.update(editingId, payload)
        toast.success('Payment gateway updated successfully')
      } else {
        await PaymentGatewayService.create(payload)
        toast.success('Payment gateway created successfully')
      }

      setShowForm(false)
      resetForm()
      loadGateways()
    } catch (error) {
      console.error('Error saving payment gateway:', error)
      toast.error(getErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (gateway: PaymentGateway) => {
    setFormData({
      name: gateway.name,
      provider: gateway.provider,
      apiKey: '',
      secretKey: '',
      webhookUrl: gateway.webhookUrl || '',
      supportedCurrencies: gateway.supportedCurrencies || [],
      isActive: gateway.isActive,
    })
    setEditingId(gateway.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await PaymentGatewayService.delete(id)
      toast.success('Payment gateway deleted successfully')
      setDeleteConfirm(null)
      loadGateways()
    } catch (error) {
      console.error('Error deleting payment gateway:', error)
      toast.error(getErrorMessage(error))
    }
  }

  const handleTestConnection = async (id: string) => {
    try {
      setTestingConnection(id)
      await PaymentGatewayService.test(id)
      toast.success('Connection test successful')
    } catch (error) {
      console.error('Error testing connection:', error)
      toast.error('Connection test failed')
    } finally {
      setTestingConnection(null)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      provider: 'Stripe',
      apiKey: '',
      secretKey: '',
      webhookUrl: '',
      supportedCurrencies: [],
      isActive: true,
    })
    setNewCurrency('')
    setShowApiKey(false)
    setShowSecretKey(false)
    setErrors({})
    setEditingId(null)
  }

  const handleCloseDrawer = () => {
    setShowForm(false)
    resetForm()
  }

  const addCurrency = () => {
    if (newCurrency.trim() && !formData.supportedCurrencies.includes(newCurrency.trim().toUpperCase())) {
      setFormData({
        ...formData,
        supportedCurrencies: [...formData.supportedCurrencies, newCurrency.trim().toUpperCase()],
      })
      setNewCurrency('')
    }
  }

  const removeCurrency = (index: number) => {
    setFormData({
      ...formData,
      supportedCurrencies: formData.supportedCurrencies.filter((_, i) => i !== index),
    })
  }

  const maskApiKey = (key?: string) => {
    if (!key) return '••••••••'
    return `••••${key.slice(-4)}`
  }

  const getProviderColor = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'stripe':
        return 'bg-purple-100 text-purple-800'
      case 'paypal':
        return 'bg-blue-100 text-blue-800'
      case 'paypay':
        return 'bg-red-100 text-red-800'
      case 'square':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <CreditCard className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-900">Payment Gateways</h1>
          </div>
          <p className="text-slate-600">Configure and manage payment gateway integrations</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search payment gateways..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => {
              resetForm()
              setShowForm(true)
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            Add Gateway
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-slate-600">Loading payment gateways...</p>
            </div>
          ) : gateways.length === 0 ? (
            <div className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No payment gateways found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Provider</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">API Key</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Currencies</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {gateways.map((gateway) => (
                      <tr key={gateway.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{gateway.name}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getProviderColor(gateway.provider)}`}>
                            {gateway.provider}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 font-mono">{maskApiKey(gateway.apiKey)}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            {gateway.supportedCurrencies?.length || 0} currencies
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${gateway.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}
                          >
                            {gateway.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleTestConnection(gateway.id)}
                              disabled={testingConnection === gateway.id}
                              className="p-2 text-green-600 hover:bg-green-50 rounded transition disabled:opacity-50"
                              title="Test Connection"
                            >
                              {testingConnection === gateway.id ? (
                                <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <Wifi className="w-4 h-4" />
                              )}
                            </button>
                            <button onClick={() => handleEdit(gateway)} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteConfirm(gateway.id)} className="p-2 text-red-600 hover:bg-red-50 rounded transition">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 text-slate-600 hover:bg-slate-100 rounded disabled:opacity-50 transition"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 text-slate-600 hover:bg-slate-100 rounded disabled:opacity-50 transition"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </motion.div>

        <SlideInDrawer isOpen={showForm} onClose={handleCloseDrawer} title={editingId ? 'Edit Payment Gateway' : 'Add New Payment Gateway'} size="lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Gateway Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value })
                  if (errors.name) setErrors({ ...errors, name: '' })
                }}
                placeholder="e.g., Primary Stripe Gateway"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                  }`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Provider <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.provider}
                onChange={(e) => {
                  setFormData({ ...formData, provider: e.target.value })
                  if (errors.provider) setErrors({ ...errors, provider: '' })
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.provider ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                  }`}
              >
                {providers.map((provider) => (
                  <option key={provider} value={provider}>
                    {provider}
                  </option>
                ))}
              </select>
              {errors.provider && <p className="mt-1 text-sm text-red-600">{errors.provider}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                API Key <span className="text-red-500">*</span>
                {editingId && <span className="text-slate-500 font-normal text-xs ml-2">(leave empty to keep existing)</span>}
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={formData.apiKey}
                  onChange={(e) => {
                    setFormData({ ...formData, apiKey: e.target.value })
                    if (errors.apiKey) setErrors({ ...errors, apiKey: '' })
                  }}
                  placeholder="Enter API key"
                  className={`w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 ${errors.apiKey ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.apiKey && <p className="mt-1 text-sm text-red-600">{errors.apiKey}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Secret Key <span className="text-red-500">*</span>
                {editingId && <span className="text-slate-500 font-normal text-xs ml-2">(leave empty to keep existing)</span>}
              </label>
              <div className="relative">
                <input
                  type={showSecretKey ? 'text' : 'password'}
                  value={formData.secretKey}
                  onChange={(e) => {
                    setFormData({ ...formData, secretKey: e.target.value })
                    if (errors.secretKey) setErrors({ ...errors, secretKey: '' })
                  }}
                  placeholder="Enter secret key"
                  className={`w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 ${errors.secretKey ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowSecretKey(!showSecretKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.secretKey && <p className="mt-1 text-sm text-red-600">{errors.secretKey}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Webhook URL (Optional)</label>
              <input
                type="url"
                value={formData.webhookUrl}
                onChange={(e) => {
                  setFormData({ ...formData, webhookUrl: e.target.value })
                  if (errors.webhookUrl) setErrors({ ...errors, webhookUrl: '' })
                }}
                placeholder="https://example.com/webhook"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.webhookUrl ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                  }`}
              />
              {errors.webhookUrl && <p className="mt-1 text-sm text-red-600">{errors.webhookUrl}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Supported Currencies</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newCurrency}
                  onChange={(e) => setNewCurrency(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCurrency())}
                  placeholder="e.g., USD, EUR, GBP"
                  maxLength={3}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button type="button" onClick={addCurrency} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.supportedCurrencies.map((currency, index) => (
                  <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {currency}
                    <button type="button" onClick={() => removeCurrency(index)} className="hover:text-blue-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="sr-only" />
                  <div className={`w-11 h-6 rounded-full transition-colors ${formData.isActive ? 'bg-blue-600' : 'bg-gray-200'}`}>
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform mt-0.5 ${formData.isActive ? 'translate-x-5.5 ml-[22px]' : 'translate-x-0.5 ml-0.5'
                        }`}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium text-slate-900">Active</span>
              </label>
            </div>

            <div className="flex gap-3 pt-6 border-t border-slate-200">
              <button type="button" onClick={handleCloseDrawer} className="flex-1 px-4 py-2 border border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition">
                {submitting ? 'Saving...' : editingId ? 'Update Gateway' : 'Create Gateway'}
              </button>
            </div>
          </form>
        </SlideInDrawer>

        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-lg p-6 max-w-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Delete Payment Gateway?</h3>
              <p className="text-slate-600 mb-6">This action cannot be undone. Payment processing may be affected if this gateway is in use.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2 border border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition">
                  Cancel
                </button>
                <button onClick={() => deleteConfirm && handleDelete(deleteConfirm)} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
