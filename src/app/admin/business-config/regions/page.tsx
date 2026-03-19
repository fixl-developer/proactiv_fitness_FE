'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Globe, MapPin, Building2, BarChart3, Plus, Search, Filter,
  Edit2, Trash2, ChevronDown, X, CheckCircle2, AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Country {
  id: string
  name: string
  code: string
  region: string
  locations: number
  status: 'Active' | 'Inactive'
  flag: string
}

const initialCountries: Country[] = [
  { id: '1', name: 'Hong Kong', code: 'HK', region: 'Asia Pacific', locations: 3, status: 'Active', flag: '🇭🇰' },
  { id: '2', name: 'Singapore', code: 'SG', region: 'Asia Pacific', locations: 2, status: 'Active', flag: '🇸🇬' },
  { id: '3', name: 'Japan', code: 'JP', region: 'Asia Pacific', locations: 1, status: 'Active', flag: '🇯🇵' },
  { id: '4', name: 'Australia', code: 'AU', region: 'Asia Pacific', locations: 0, status: 'Inactive', flag: '🇦🇺' },
  { id: '5', name: 'Thailand', code: 'TH', region: 'Asia Pacific', locations: 0, status: 'Inactive', flag: '🇹🇭' },
]

const stats = [
  { title: 'Total Countries', value: '5', icon: Globe, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { title: 'Total Regions', value: '1', icon: MapPin, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
  { title: 'Active Locations', value: '6', icon: Building2, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  { title: 'Coverage', value: '60%', icon: BarChart3, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
]

export default function RegionsPage() {
  const [countries, setCountries] = useState<Country[]>(initialCountries)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All')
  const [filterOpen, setFilterOpen] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [newCountry, setNewCountry] = useState({ name: '', code: '', region: 'Asia Pacific', status: 'Active' as const })

  const filtered = countries.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.code.toLowerCase().includes(searchQuery.toLowerCase())
    const matchStatus = statusFilter === 'All' || c.status === statusFilter
    return matchSearch && matchStatus
  })

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  const handleAdd = () => {
    if (!newCountry.name || !newCountry.code) return
    const country: Country = {
      id: Date.now().toString(),
      name: newCountry.name,
      code: newCountry.code.toUpperCase(),
      region: newCountry.region,
      locations: 0,
      status: newCountry.status,
      flag: '🏳️',
    }
    setCountries([...countries, country])
    setNewCountry({ name: '', code: '', region: 'Asia Pacific', status: 'Active' })
    setShowAddModal(false)
    showToast('success', `${country.name} added successfully`)
  }

  const handleDelete = (id: string) => {
    const country = countries.find((c) => c.id === id)
    setCountries(countries.filter((c) => c.id !== id))
    showToast('success', `${country?.name} removed`)
  }

  const toggleStatus = (id: string) => {
    setCountries(countries.map((c) => c.id === id ? { ...c, status: c.status === 'Active' ? 'Inactive' : 'Active' } : c))
  }

  return (
    <div className="p-6 space-y-6">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-lg shadow-lg ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}
          >
            {toast.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            <span className="text-sm font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Countries & Regions</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage operating countries and regional groupings</p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Country
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Search & Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search countries..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div className="relative">
              <Button variant="outline" onClick={() => setFilterOpen(!filterOpen)}>
                <Filter className="h-4 w-4 mr-2" /> {statusFilter}
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
              {filterOpen && (
                <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg z-10">
                  {(['All', 'Active', 'Inactive'] as const).map((s) => (
                    <button key={s} onClick={() => { setStatusFilter(s); setFilterOpen(false) }} className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white">
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Country</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Code</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Region</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Locations</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((country) => (
                    <motion.tr
                      key={country.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/30"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{country.flag}</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{country.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{country.code}</code>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{country.region}</td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{country.locations}</span>
                        <span className="text-xs text-gray-500 ml-1">locations</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          className={`cursor-pointer ${country.status === 'Active' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                          onClick={() => toggleStatus(country.id)}
                        >
                          {country.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(country.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="p-8 text-center text-gray-500">No countries match your search.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold dark:text-white">Add Country</h2>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country Name</label>
                  <input
                    type="text" value={newCountry.name} onChange={(e) => setNewCountry({ ...newCountry, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. South Korea"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country Code</label>
                  <input
                    type="text" value={newCountry.code} onChange={(e) => setNewCountry({ ...newCountry, code: e.target.value })} maxLength={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                    placeholder="e.g. KR"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Region</label>
                  <select
                    value={newCountry.region} onChange={(e) => setNewCountry({ ...newCountry, region: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Asia Pacific</option>
                    <option>Europe</option>
                    <option>North America</option>
                    <option>Middle East</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>Cancel</Button>
                  <Button className="flex-1" onClick={handleAdd} disabled={!newCountry.name || !newCountry.code}>Add Country</Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
