'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, UserPlus, Download, Search, Filter, ChevronDown, MoreVertical,
  Mail, Phone, Award, MapPin, Clock, Edit, Trash2, Eye, BarChart3
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

type StaffRole = 'Head Coach' | 'Coach' | 'Junior Coach' | 'Admin'
type StaffStatus = 'Active' | 'On Leave' | 'Inactive'

interface StaffMember {
  id: string
  name: string
  initials: string
  role: StaffRole
  location: string
  certifications: string[]
  status: StaffStatus
  utilization: number
  email: string
  phone: string
  joinDate: string
  classesPerWeek: number
  avatarColor: string
}

const mockStaff: StaffMember[] = [
  {
    id: 'STF001', name: 'Sarah Chen', initials: 'SC', role: 'Head Coach', location: 'Cyberport',
    certifications: ['L3 Gymnastics', 'First Aid'], status: 'Active', utilization: 92,
    email: 'sarah@proactiv.hk', phone: '+852 9123 4567', joinDate: 'Jan 2023', classesPerWeek: 18,
    avatarColor: 'bg-blue-500'
  },
  {
    id: 'STF002', name: 'Mike Wong', initials: 'MW', role: 'Coach', location: 'Wan Chai',
    certifications: ['L2 Gymnastics'], status: 'Active', utilization: 85,
    email: 'mike@proactiv.hk', phone: '+852 9234 5678', joinDate: 'Mar 2023', classesPerWeek: 15,
    avatarColor: 'bg-emerald-500'
  },
  {
    id: 'STF003', name: 'Lisa Zhang', initials: 'LZ', role: 'Coach', location: 'Cyberport',
    certifications: ['L2 Gymnastics', 'Safeguarding'], status: 'On Leave', utilization: 0,
    email: 'lisa@proactiv.hk', phone: '+852 9345 6789', joinDate: 'Jun 2023', classesPerWeek: 0,
    avatarColor: 'bg-violet-500'
  },
  {
    id: 'STF004', name: 'David Lee', initials: 'DL', role: 'Admin', location: 'HQ',
    certifications: [], status: 'Active', utilization: 78,
    email: 'david@proactiv.hk', phone: '+852 9456 7890', joinDate: 'Sep 2023', classesPerWeek: 0,
    avatarColor: 'bg-amber-500'
  },
  {
    id: 'STF005', name: 'Anna Park', initials: 'AP', role: 'Junior Coach', location: 'Wan Chai',
    certifications: ['L1 Gymnastics'], status: 'Active', utilization: 70,
    email: 'anna@proactiv.hk', phone: '+852 9567 8901', joinDate: 'Nov 2024', classesPerWeek: 10,
    avatarColor: 'bg-pink-500'
  },
]

const roleColors: Record<StaffRole, string> = {
  'Head Coach': 'bg-blue-100 text-blue-700',
  'Coach': 'bg-emerald-100 text-emerald-700',
  'Junior Coach': 'bg-teal-100 text-teal-700',
  'Admin': 'bg-amber-100 text-amber-700',
}

const statusColors: Record<StaffStatus, string> = {
  Active: 'bg-emerald-100 text-emerald-700',
  'On Leave': 'bg-yellow-100 text-yellow-700',
  Inactive: 'bg-gray-100 text-gray-500',
}

export default function StaffManagementPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('All')
  const [locationFilter, setLocationFilter] = useState<string>('All')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'name' | 'utilization' | 'role'>('name')

  const filtered = mockStaff
    .filter(s => {
      if (roleFilter !== 'All' && s.role !== roleFilter) return false
      if (locationFilter !== 'All' && s.location !== locationFilter) return false
      if (statusFilter !== 'All' && s.status !== statusFilter) return false
      if (searchQuery && !s.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'utilization') return b.utilization - a.utilization
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      return a.role.localeCompare(b.role)
    })

  const stats = [
    { label: 'Total Staff', value: mockStaff.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Coaches', value: mockStaff.filter(s => s.role.includes('Coach')).length, icon: Award, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Admin', value: mockStaff.filter(s => s.role === 'Admin').length, icon: BarChart3, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'On Leave', value: mockStaff.filter(s => s.status === 'On Leave').length, icon: Clock, color: 'text-red-600', bg: 'bg-red-50' },
  ]

  const getUtilizationColor = (util: number) => {
    if (util >= 90) return 'text-red-600'
    if (util >= 70) return 'text-emerald-600'
    if (util > 0) return 'text-amber-600'
    return 'text-gray-400'
  }

  return (
    <div className="p-6 space-y-6 min-h-screen bg-gray-50/50">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-500 mt-1">Manage coaches, admin staff, and certifications</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2"><Download className="w-4 h-4" /> Export</Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2"><UserPlus className="w-4 h-4" /> Add Staff</Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1 text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bg}`}><stat.icon className={`w-6 h-6 ${stat.color}`} /></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Search & Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text" placeholder="Search staff..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} className="border rounded-lg px-3 py-2 text-sm">
              <option value="name">Sort by Name</option>
              <option value="utilization">Sort by Utilization</option>
              <option value="role">Sort by Role</option>
            </select>
            <Button variant="outline" className="gap-2" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="w-4 h-4" /> Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
          </div>
          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-4 border-t">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Role</label>
                    <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                      <option>All</option><option>Head Coach</option><option>Coach</option><option>Junior Coach</option><option>Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Location</label>
                    <select value={locationFilter} onChange={e => setLocationFilter(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                      <option>All</option><option>Cyberport</option><option>Wan Chai</option><option>HQ</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Status</label>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                      <option>All</option><option>Active</option><option>On Leave</option><option>Inactive</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Staff Table */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Name</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Role</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Location</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Certifications</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Utilization</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((staff, i) => (
                  <motion.tr
                    key={staff.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`border-b hover:bg-gray-50/80 transition-colors ${selectedStaff === staff.id ? 'bg-blue-50/50' : ''}`}
                    onClick={() => setSelectedStaff(selectedStaff === staff.id ? null : staff.id)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${staff.avatarColor} flex items-center justify-center text-white font-bold text-sm`}>
                          {staff.initials}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{staff.name}</p>
                          <p className="text-xs text-gray-400">{staff.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4"><Badge className={`text-xs ${roleColors[staff.role]}`}>{staff.role}</Badge></td>
                    <td className="p-4">
                      <span className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {staff.location}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {staff.certifications.length > 0 ? staff.certifications.map(cert => (
                          <Badge key={cert} variant="outline" className="text-xs bg-slate-50">{cert}</Badge>
                        )) : <span className="text-xs text-gray-400">-</span>}
                      </div>
                    </td>
                    <td className="p-4"><Badge className={`text-xs ${statusColors[staff.status]}`}>{staff.status}</Badge></td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 min-w-[120px]">
                        <Progress value={staff.utilization} className="h-2 flex-1" />
                        <span className={`text-sm font-bold ${getUtilizationColor(staff.utilization)}`}>{staff.utilization}%</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <button className="p-1.5 hover:bg-gray-100 rounded" title="View"><Eye className="w-4 h-4 text-gray-500" /></button>
                        <button className="p-1.5 hover:bg-gray-100 rounded" title="Edit"><Edit className="w-4 h-4 text-gray-500" /></button>
                        <button className="p-1.5 hover:bg-gray-100 rounded" title="Delete"><Trash2 className="w-4 h-4 text-red-400" /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Staff Detail Panel */}
      <AnimatePresence>
        {selectedStaff && (() => {
          const staff = mockStaff.find(s => s.id === selectedStaff)
          if (!staff) return null
          return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full ${staff.avatarColor} flex items-center justify-center text-white font-bold`}>
                      {staff.initials}
                    </div>
                    <div>
                      <p>{staff.name}</p>
                      <p className="text-sm font-normal text-gray-500">{staff.role} at {staff.location}</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{staff.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{staff.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">Joined {staff.joinDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{staff.classesPerWeek} classes/week</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })()}
      </AnimatePresence>
    </div>
  )
}
