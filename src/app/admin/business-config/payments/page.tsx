'use client'

import { useState, useEffect } from 'react'
import BusinessConfigService from '@/services/modules/business-config.service'

interface PaymentGateway {
  id: string
  name: string
  provider: string
  isDefault: boolean
  status: string
}

export default function PaymentGatewaysPage() {
  const [gateways, setGateways] = useState<PaymentGateway[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<{
    name: string
    provider: 'stripe' | 'paypal' | 'square'
    apiKey: string
    secretKey: string
    webhookUrl: string
    isDefault: boolean
    status: 'active' | 'inactive'
  }>({
    name: '',
    provider: 'stripe',
    apiKey: '',
    secretKey: '',
    webhookUrl: '',
    isDefault: false,
    status: 'active'
  })

  useEffect(() => {
    loadGateways()
  }, [])

  const loadGateways = async () => {
    try {
      setLoading(true)
      const data = await BusinessConfigService.getAllPaymentGateways()
      setGateways(data)
    } catch (error) {
      console.error('Failed to load payment gateways:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await BusinessConfigService.createPaymentGateway(formData)
      setShowForm(false)
      setFormData({ name: '', provider: 'stripe', apiKey: '', secretKey: '', webhookUrl: '', isDefault: false, status: 'active' })
      loadGateways()
    } catch (error) {
      console.error('Failed to create payment gateway:', error)
    }
  }

  const handleSetDefault = async (id: string) => {
    try {
      await BusinessConfigService.setDefaultPaymentGateway(id)
      loadGateways()
    } catch (error) {
      console.error('Failed to set default gateway:', error)
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Payment Gateways</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'Add Gateway'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Gateway Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Provider</label>
                <select
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value as 'stripe' | 'paypal' | 'square' })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="stripe">Stripe</option>
                  <option value="paypal">PayPal</option>
                  <option value="square">Square</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Webhook URL</label>
                <input
                  type="url"
                  value={formData.webhookUrl}
                  onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="https://example.com/webhook"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="isDefault" className="text-sm font-medium">Set as default gateway</label>
              </div>
            </div>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              Create Gateway
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gateways.map((gateway) => (
            <div key={gateway.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold">{gateway.name}</h3>
                {gateway.isDefault && (
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                    Default
                  </span>
                )}
              </div>
              <p className="text-gray-600 mb-4 capitalize">{gateway.provider}</p>
              <div className="flex gap-2">
                {!gateway.isDefault && (
                  <button
                    onClick={() => handleSetDefault(gateway.id)}
                    className="flex-1 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
                  >
                    Set Default
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
