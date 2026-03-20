'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/services/api/client'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Globe, MapPin, Plus, Edit, Trash2, Search, X, Loader2 } from 'lucide-react'
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

interface Country {
  id: string
  name: string
  code: string
  status: string
  createdAt?: string
}

interface Region {
  id: string
  name: string
  countryId: string
  country?: Country
  createdAt?: string
}

export default function RegionsPage() {
  const [countries, setCountries] = useState<Country[]>([])
  const [regions, setRegions] = useState<Region[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'countries' | 'regions'>('countries')

  // Country form
  const [showCountryForm, setShowCountryForm] = useState(false)
  const [editingCountry, setEditingCountry] = useState<Country | null>(null)
  const [countryForm, setCountryForm] = useState({ name: '', code: '', status: 'active' })
  const [savingCountry, setSavingCountry] = useState(false)

  // Region form
  const [showRegionForm, setShowRegionForm] = useState(false)
  const [editingRegion, setEditingRegion] = useState<Region | null>(null)
  const [regionForm, setRegionForm] = useState({ name: '', countryId: '' })
  const [savingRegion, setSavingRegion] = useState(false)

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'country' | 'region'; id: string; name: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [countriesData, regionsData] = await Promise.all([
        apiClient.get<any>('/countries'),
        apiClient.get<any>('/regions'),
      ])
      setCountries(Array.isArray(countriesData) ? countriesData : countriesData?.data || [])
      setRegions(Array.isArray(regionsData) ? regionsData : regionsData?.data || [])
    } catch (error: any) {
      console.error('Failed to load data:', error)
      toast.error('Failed to load countries and regions')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // --- Country CRUD ---
  const openCountryForm = (country?: Country) => {
    if (country) {
      setEditingCountry(country)
      setCountryForm({ name: country.name, code: country.code, status: country.status })
    } else {
      setEditingCountry(null)
      setCountryForm({ name: '', code: '', status: 'active' })
    }
    setShowCountryForm(true)
  }

  const handleCountrySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingCountry(true)
    try {
      if (editingCountry) {
        await apiClient.put(`/countries/${editingCountry.id}`, countryForm)
        toast.success('Country updated successfully')
      } else {
        await apiClient.post('/countries', countryForm)
        toast.success('Country created successfully')
      }
      setShowCountryForm(false)
      setEditingCountry(null)
      setCountryForm({ name: '', code: '', status: 'active' })
      loadData()
    } catch (error: any) {
      toast.error(editingCountry ? 'Failed to update country' : 'Failed to create country')
    } finally {
      setSavingCountry(false)
    }
  }

  // --- Region CRUD ---
  const openRegionForm = (region?: Region) => {
    if (region) {
      setEditingRegion(region)
      setRegionForm({ name: region.name, countryId: region.countryId })
    } else {
      setEditingRegion(null)
      setRegionForm({ name: '', countryId: countries[0]?.id || '' })
    }
    setShowRegionForm(true)
  }

  const handleRegionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingRegion(true)
    try {
      if (editingRegion) {
        await apiClient.put(`/regions/${editingRegion.id}`, regionForm)
        toast.success('Region updated successfully')
      } else {
        await apiClient.post('/regions', regionForm)
        toast.success('Region created successfully')
      }
      setShowRegionForm(false)
      setEditingRegion(null)
      setRegionForm({ name: '', countryId: '' })
      loadData()
    } catch (error: any) {
      toast.error(editingRegion ? 'Failed to update region' : 'Failed to create region')
    } finally {
      setSavingRegion(false)
    }
  }

  // --- Delete ---
  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      if (deleteTarget.type === 'country') {
        await apiClient.delete(`/countries/${deleteTarget.id}`)
        toast.success('Country deleted successfully')
      } else {
        await apiClient.delete(`/regions/${deleteTarget.id}`)
        toast.success('Region deleted successfully')
      }
      setDeleteTarget(null)
      loadData()
    } catch (error: any) {
      toast.error(`Failed to delete ${deleteTarget.type}`)
    } finally {
      setDeleting(false)
    }
  }

  const getCountryName = (countryId: string) => {
    return countries.find((c) => c.id === countryId)?.name || 'Unknown'
  }

  const filteredCountries = countries.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredRegions = regions.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCountryName(r.countryId).toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Countries & Regions</h1>
          <p className="text-gray-600 mt-2">Manage countries and their regional divisions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => openRegionForm()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Region
          </Button>
          <Button onClick={() => openCountryForm()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Country
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Countries', value: countries.length.toString(), icon: Globe, gradient: 'from-blue-500 to-blue-600', bgGradient: 'from-blue-50 to-blue-100' },
          { label: 'Total Regions', value: regions.length.toString(), icon: MapPin, gradient: 'from-green-500 to-emerald-600', bgGradient: 'from-green-50 to-emerald-100' },
          { label: 'Active Countries', value: countries.filter((c) => c.status === 'active').length.toString(), icon: Globe, gradient: 'from-purple-500 to-purple-600', bgGradient: 'from-purple-50 to-purple-100' },
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

      {/* Search & Tabs */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex border rounded-lg overflow-hidden">
              <button
                onClick={() => setActiveTab('countries')}
                className={`px-4 py-2 text-sm font-medium ${activeTab === 'countries' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                Countries ({countries.length})
              </button>
              <button
                onClick={() => setActiveTab('regions')}
                className={`px-4 py-2 text-sm font-medium ${activeTab === 'regions' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                Regions ({regions.length})
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {loading ? (
        <Card>
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-500">Loading data...</p>
            </div>
          </CardContent>
        </Card>
      ) : activeTab === 'countries' ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              Countries
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredCountries.length === 0 ? (
              <div className="text-center py-12">
                <Globe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No countries found</p>
                <p className="text-gray-400 mt-1">Add your first country to get started</p>
                <Button className="mt-4" onClick={() => openCountryForm()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Country
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Regions</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCountries.map((country, idx) => (
                      <motion.tr key={country.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }}>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{country.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{country.code}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          {regions.filter((r) => r.countryId === country.id).length}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={country.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {country.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openCountryForm(country)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-800"
                              onClick={() => setDeleteTarget({ type: 'country', id: country.id, name: country.name })}
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
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-600" />
              Regions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredRegions.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No regions found</p>
                <p className="text-gray-400 mt-1">Add your first region to get started</p>
                <Button className="mt-4" onClick={() => openRegionForm()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Region
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Country</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRegions.map((region, idx) => (
                      <motion.tr key={region.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }}>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{region.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          {region.country?.name || getCountryName(region.countryId)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openRegionForm(region)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-800"
                              onClick={() => setDeleteTarget({ type: 'region', id: region.id, name: region.name })}
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
            )}
          </CardContent>
        </Card>
      )}

      {/* Country Form Dialog */}
      <Dialog open={showCountryForm} onOpenChange={setShowCountryForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCountry ? 'Edit Country' : 'Add Country'}</DialogTitle>
            <DialogDescription>
              {editingCountry ? 'Update the country details below.' : 'Fill in the details to create a new country.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCountrySubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Country Name</label>
              <input
                type="text"
                value={countryForm.name}
                onChange={(e) => setCountryForm({ ...countryForm, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="e.g. United Kingdom"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Country Code</label>
              <input
                type="text"
                value={countryForm.code}
                onChange={(e) => setCountryForm({ ...countryForm, code: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 border rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="e.g. UK"
                maxLength={3}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={countryForm.status}
                onChange={(e) => setCountryForm({ ...countryForm, status: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCountryForm(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={savingCountry}>
                {savingCountry && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingCountry ? 'Update Country' : 'Create Country'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Region Form Dialog */}
      <Dialog open={showRegionForm} onOpenChange={setShowRegionForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRegion ? 'Edit Region' : 'Add Region'}</DialogTitle>
            <DialogDescription>
              {editingRegion ? 'Update the region details below.' : 'Fill in the details to create a new region.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRegionSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Region Name</label>
              <input
                type="text"
                value={regionForm.name}
                onChange={(e) => setRegionForm({ ...regionForm, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="e.g. Southeast Asia"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Country</label>
              {countries.length === 0 ? (
                <p className="text-sm text-gray-500">No countries available. Please create a country first.</p>
              ) : (
                <select
                  value={regionForm.countryId}
                  onChange={(e) => setRegionForm({ ...regionForm, countryId: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:border-blue-500 focus:outline-none"
                  required
                >
                  <option value="">Select a country</option>
                  {countries.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowRegionForm(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={savingRegion || countries.length === 0}>
                {savingRegion && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingRegion ? 'Update Region' : 'Create Region'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700 text-white">
              {deleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
