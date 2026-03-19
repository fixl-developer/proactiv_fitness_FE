'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2, Activity, DollarSign, Settings, Plus, Search, Filter,
  Edit2, Trash2, TrendingUp, ChevronDown, X, CheckCircle2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

type UnitType = 'GYM' | 'SCHOOL' | 'CAMP' | 'EVENT'
type UnitStatus = 'Active' | 'Inactive' | 'Seasonal' | 'Pending Setup'

interface BusinessUnit {
  id: string
  name: string
  type: UnitType
  status: UnitStatus
  locations: number
  monthlyRevenue: number
  growth: number
  manager: string
  description: string
}

const typeConfig: Record<UnitType, { color: string; bg: string }> = {
  GYM: { color: 'text-blue-700', bg: 'bg-blue-100' },
  SCHOOL: { color: 'text-green-700', bg: 'bg-green-100' },
  CAMP: { color: 'text-orange-700', bg: 'bg-orange-100' },
  EVENT: { color: 'text-purple-700', bg: 'bg-purple-100' },
}

const statusConfig: Record<UnitStatus, { color: string; bg: string }> = {
  Active: { color: 'text-green-700', bg: 'bg-green-100' },
  Inactive: { color: 'text-gray-600', bg: 'bg-gray-100' },
  Seasonal: { color: 'text-amber-700', bg: 'bg-amber-100' },
  'Pending Setup': { color: 'text-blue-700', bg: 'bg-blue-100' },
}

const initialUnits: BusinessUnit[] = [
  { id: '1', name: 'ProGym Cyberport', type: 'GYM', status: 'Active', locations: 1, monthlyRevenue: 45000, growth: 12.5, manager: 'Sarah Chen', description: 'Premium fitness facility in Cyberport with full equipment range' },
  { id: '2', name: 'ProGym Wan Chai', type: 'GYM', status: 'Active', locations: 1, monthlyRevenue: 38000, growth: 8.2, manager: 'Mike Wong', description: 'Urban gym focusing on group training and personal coaching' },
  { id: '3', name: 'School Programs', type: 'SCHOOL', status: 'Active', locations: 3, monthlyRevenue: 25000, growth: 15.0, manager: 'Lisa Park', description: 'After-school fitness programs across partner schools' },
  { id: '4', name: 'Holiday Camps', type: 'CAMP', status: 'Seasonal', locations: 2, monthlyRevenue: 15000, growth: -5.0, manager: 'Tom Lee', description: 'Seasonal holiday camp programs during school breaks' },
  { id: '5', name: 'Corporate Events', type: 'EVENT', status: 'Pending Setup', locations: 0, monthlyRevenue: 0, growth: 0, manager: 'Unassigned', description: 'Corporate wellness and team-building event management' },
]

export default function UnitsPage() {
  const [units, setUnits] = useState<BusinessUnit[]>(initialUnits)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'All' | UnitType>('All')
  const [filterOpen, setFilterOpen] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [toast, setToast] = useState<{ message: string } | null>(null)
  const [newUnit, setNewUnit] = useState({ name: '', type: 'GYM' as UnitType, description: '' })

  const filtered = units.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchType = typeFilter === 'All' || u.type === typeFilter
    return matchSearch && matchType
  })

  const totalRevenue = units.reduce((sum, u) => sum + u.monthlyRevenue, 0)
  const activeCount = units.filter((u) => u.status === 'Active').length
  const revenueGenerating = units.filter((u) => u.monthlyRevenue > 0).length
  const pendingCount = units.filter((u) => u.status === 'Pending Setup').length

  const statsData = [
    { title: 'Total Units', value: units.length.toString(), icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { title: 'Active', value: activeCount.toString(), icon: Activity, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
    { title: 'Revenue Generating', value: revenueGenerating.toString(), icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { title: 'Pending Setup', value: pendingCount.toString(), icon: Settings, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  ]

  const handleAdd = () => {
    if (!newUnit.name) return
    const unit: BusinessUnit = {
      id: Date.now().toString(), name: newUnit.name, type: newUnit.type, status: 'Pending Setup',
      locations: 0, monthlyRevenue: 0, growth: 0, manager: 'Unassigned', description: newUnit.description,
    }
    setUnits([...units, unit])
    setNewUnit({ name: '', type: 'GYM', description: '' })
    setShowAddModal(false)
    setToast({ message: `${unit.name} added` })
    setTimeout(() => setToast(null), 3000)
  }

  const handleDelete = (id: string) => {
    setUnits(units.filter((u) => u.id !== id))
    setToast({ message: 'Unit removed' })
    setTimeout(() => setToast(null), 3000)
  }

  const formatCurrency = (amount: number) => `$${(amount / 1000).toFixed(0)}K`

  return (
    <div className="p-6 space-y-6">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-lg shadow-lg bg-green-600 text-white">
            <CheckCircle2 className="h-5 w-5" /><span className="text-sm font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Business Units</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage business units and their configurations</p>
          </div>
          <Button onClick={() => setShowAddModal(true)}><Plus className="h-4 w-4 mr-2" /> Add Unit</Button>
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

      {/* Search & Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search units..."
            className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white" />
        </div>
        <div className="relative">
          <Button variant="outline" onClick={() => setFilterOpen(!filterOpen)}>
            <Filter className="h-4 w-4 mr-2" /> {typeFilter} <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
          {filterOpen && (
            <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg z-10">
              {(['All', 'GYM', 'SCHOOL', 'CAMP', 'EVENT'] as const).map((t) => (
                <button key={t} onClick={() => { setTypeFilter(t); setFilterOpen(false) }}
                  className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white">{t}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Unit Name</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Locations</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Monthly Revenue</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Growth</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((unit) => {
                    const tc = typeConfig[unit.type]
                    const sc = statusConfig[unit.status]
                    return (
                      <motion.tr key={unit.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{unit.name}</p>
                            <p className="text-xs text-gray-500">{unit.manager}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={`${tc.bg} ${tc.color}`}>{unit.type}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={`${sc.bg} ${sc.color}`}>{unit.status}</Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{unit.locations}</td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {unit.monthlyRevenue > 0 ? formatCurrency(unit.monthlyRevenue) : '--'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {unit.growth !== 0 ? (
                            <span className={`text-sm font-medium flex items-center gap-1 ${unit.growth > 0 ? 'text-green-600' : 'text-red-500'}`}>
                              <TrendingUp className={`h-3 w-3 ${unit.growth < 0 ? 'rotate-180' : ''}`} />
                              {unit.growth > 0 ? '+' : ''}{unit.growth}%
                            </span>
                          ) : <span className="text-sm text-gray-400">--</span>}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm"><Edit2 className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(unit.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && <div className="p-8 text-center text-gray-500">No units found.</div>}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Revenue Summary */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card>
          <CardHeader><CardTitle className="text-lg">Revenue by Unit</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {units.filter((u) => u.monthlyRevenue > 0).sort((a, b) => b.monthlyRevenue - a.monthlyRevenue).map((unit) => (
              <div key={unit.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{unit.name}</span>
                  <span className="text-gray-900 dark:text-white font-semibold">{formatCurrency(unit.monthlyRevenue)}</span>
                </div>
                <Progress value={(unit.monthlyRevenue / totalRevenue) * 100} className="h-2" />
              </div>
            ))}
            <div className="pt-2 border-t dark:border-gray-700 flex justify-between text-sm">
              <span className="font-semibold text-gray-700 dark:text-gray-300">Total Monthly Revenue</span>
              <span className="font-bold text-gray-900 dark:text-white">${totalRevenue.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold dark:text-white">Add Business Unit</h2>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit Name</label>
                  <input type="text" value={newUnit.name} onChange={(e) => setNewUnit({ ...newUnit, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. ProGym Central" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                  <select value={newUnit.type} onChange={(e) => setNewUnit({ ...newUnit, type: e.target.value as UnitType })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="GYM">GYM</option><option value="SCHOOL">SCHOOL</option>
                    <option value="CAMP">CAMP</option><option value="EVENT">EVENT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea value={newUnit.description} onChange={(e) => setNewUnit({ ...newUnit, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3} placeholder="Brief description..." />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>Cancel</Button>
                  <Button className="flex-1" onClick={handleAdd} disabled={!newUnit.name}>Add Unit</Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
