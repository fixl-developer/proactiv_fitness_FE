'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/services/api/client'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Building2, Plus, Edit, Trash2, Search, Loader2 } from 'lucide-react'
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

interface BusinessUnit {
  id: string
  name: string
  type: string
  description: string
  status: string
  createdAt?: string
}

export default function BusinessUnitsPage() {
  const [units, setUnits] = useState<BusinessUnit[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [editingUnit, setEditingUnit] = useState<BusinessUnit | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'franchise',
    description: '',
    status: 'active',
  })
  const [saving, setSaving] = useState(false)

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadUnits = useCallback(async () => {
    try {
      setLoading(true)
      const data = await apiClient.get<any>('/business-units')
      setUnits(Array.isArray(data) ? data : data?.data || [])
    } catch (error: any) {
      console.error('Failed to load business units:', error)
      toast.error('Failed to load business units')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUnits()
  }, [loadUnits])

  const openForm = (unit?: BusinessUnit) => {
    if (unit) {
      setEditingUnit(unit)
      setFormData({
        name: unit.name,
        type: unit.type,
        description: unit.description || '',
        status: unit.status,
      })
    } else {
      setEditingUnit(null)
      setFormData({ name: '', type: 'franchise', description: '', status: 'active' })
    }
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingUnit) {
        await apiClient.put(`/business-units/${editingUnit.id}`, formData)
        toast.success('Business unit updated successfully')
      } else {
        await apiClient.post('/business-units', formData)
        toast.success('Business unit created successfully')
      }
      setShowForm(false)
      setEditingUnit(null)
      loadUnits()
    } catch (error: any) {
      toast.error(editingUnit ? 'Failed to update business unit' : 'Failed to create business unit')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await apiClient.delete(`/business-units/${deleteTarget.id}`)
      toast.success('Business unit deleted successfully')
      setDeleteTarget(null)
      loadUnits()
    } catch (error: any) {
      toast.error('Failed to delete business unit')
    } finally {
      setDeleting(false)
    }
  }

  const filteredUnits = units.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const activeCount = units.filter((u) => u.status === 'active').length
  const typeBreakdown = units.reduce((acc, u) => {
    acc[u.type] = (acc[u.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Business Units</h1>
          <p className="text-gray-600 mt-2">Manage your organization's business units</p>
        </div>
        <Button data-testid="btn-open-form-admin-business-config-units" onClick={() => openForm()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Business Unit
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Units', value: units.length.toString(), icon: Building2, gradient: 'from-blue-500 to-blue-600', bgGradient: 'from-blue-50 to-blue-100' },
          { label: 'Active', value: activeCount.toString(), icon: Building2, gradient: 'from-green-500 to-emerald-600', bgGradient: 'from-green-50 to-emerald-100' },
          { label: 'Inactive', value: (units.length - activeCount).toString(), icon: Building2, gradient: 'from-red-500 to-red-600', bgGradient: 'from-red-50 to-red-100' },
          { label: 'Types', value: Object.keys(typeBreakdown).length.toString(), icon: Building2, gradient: 'from-purple-500 to-purple-600', bgGradient: 'from-purple-50 to-purple-100' },
        ].map((stat, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
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

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input data-testid="input-text-admin-business-config-units"
              type="text"
              placeholder="Search business units..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {loading ? (
        <Card>
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-500">Loading business units...</p>
            </div>
          </CardContent>
        </Card>
      ) : filteredUnits.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No business units found</p>
              <p className="text-gray-400 mt-1">
                {searchTerm ? 'Try a different search term' : 'Add your first business unit to get started'}
              </p>
              {!searchTerm && (
                <Button data-testid="btn-open-form-admin-business-config-units" className="mt-4" onClick={() => openForm()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Business Unit
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUnits.map((unit, idx) => (
                    <motion.tr key={unit.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }}>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{unit.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="outline" className="capitalize">{unit.type}</Badge>
                      </td>
                      <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{unit.description || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={unit.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {unit.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          <Button data-testid="btn-open-form-admin-business-config-units" variant="ghost" size="sm" onClick={() => openForm(unit)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-800"
                            onClick={() => setDeleteTarget({ id: unit.id, name: unit.name })}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUnit ? 'Edit Business Unit' : 'Add Business Unit'}</DialogTitle>
            <DialogDescription>
              {editingUnit ? 'Update the business unit details below.' : 'Fill in the details to create a new business unit.'}
            </DialogDescription>
          </DialogHeader>
          <form data-testid="form-admin-business-config-units" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Unit Name</label>
              <input data-testid="input-text-admin-business-config-units"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="e.g. Downtown Franchise"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <select data-testid="select-admin-business-config-units-9"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="franchise">Franchise</option>
                <option value="corporate">Corporate</option>
                <option value="partner">Partner</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="Brief description of this business unit"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select data-testid="select-admin-business-config-units-10"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <DialogFooter>
              <Button data-testid="btn-set-show-form-admin-business-config-units" type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingUnit ? 'Update Unit' : 'Create Unit'}
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
            <Button data-testid="btn-set-delete-target-admin-business-config-units" variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button data-testid="btn-delete-admin-business-config-units" variant="destructive" onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700 text-white">
              {deleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
