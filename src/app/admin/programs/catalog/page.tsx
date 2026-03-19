'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen, Users, DollarSign, TrendingUp, Plus, Filter, Search, Star,
  Clock, MapPin, ChevronDown, MoreVertical, Edit, Trash2, Eye, Copy
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

type ProgramType = 'REGULAR' | 'CAMP' | 'EVENT'
type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels'
type AgeGroup = '3-5' | '6-8' | '9-12' | '9-14' | '13-16' | '6-12' | 'All Ages'
type ProgramStatus = 'Active' | 'Draft' | 'Archived' | 'Full'

interface Program {
  id: string
  name: string
  type: ProgramType
  level: SkillLevel
  ageGroup: AgeGroup
  capacity: number
  enrolled: number
  price: string
  pricePer: string
  status: ProgramStatus
  description: string
  location: string
  coach: string
  rating: number
}

const mockPrograms: Program[] = [
  {
    id: 'PRG001', name: 'GYMTOTS', type: 'REGULAR', level: 'Beginner',
    ageGroup: '3-5', capacity: 60, enrolled: 45, price: '$800', pricePer: 'term',
    status: 'Active', description: 'Introduction to gymnastics for toddlers with fun movement activities.',
    location: 'Cyberport', coach: 'Sarah Chen', rating: 4.8
  },
  {
    id: 'PRG002', name: 'Junior Gymnastics', type: 'REGULAR', level: 'Intermediate',
    ageGroup: '6-8', capacity: 75, enrolled: 62, price: '$1,200', pricePer: 'term',
    status: 'Active', description: 'Progressive gymnastics training for developing fundamental skills.',
    location: 'Wan Chai', coach: 'Mike Wong', rating: 4.6
  },
  {
    id: 'PRG003', name: 'Advanced Tumbling', type: 'REGULAR', level: 'Advanced',
    ageGroup: '9-14', capacity: 40, enrolled: 28, price: '$1,500', pricePer: 'term',
    status: 'Active', description: 'High-level tumbling and acrobatic skills for competitive athletes.',
    location: 'Training Hall', coach: 'Mike Wong', rating: 4.9
  },
  {
    id: 'PRG004', name: 'Holiday Camp', type: 'CAMP', level: 'All Levels',
    ageGroup: '6-12', capacity: 50, enrolled: 35, price: '$2,500', pricePer: 'week',
    status: 'Active', description: 'Fun-packed week of gymnastics, games, and activities during school holidays.',
    location: 'Cyberport', coach: 'Multiple Coaches', rating: 4.7
  },
  {
    id: 'PRG005', name: 'Private Lessons', type: 'EVENT', level: 'All Levels',
    ageGroup: 'All Ages', capacity: 20, enrolled: 12, price: '$500', pricePer: 'session',
    status: 'Active', description: 'One-on-one coaching sessions tailored to individual goals.',
    location: 'All Locations', coach: 'Various', rating: 5.0
  },
]

const typeColors: Record<ProgramType, string> = {
  REGULAR: 'bg-blue-100 text-blue-700 border-blue-200',
  CAMP: 'bg-orange-100 text-orange-700 border-orange-200',
  EVENT: 'bg-purple-100 text-purple-700 border-purple-200',
}

const levelColors: Record<SkillLevel, string> = {
  Beginner: 'bg-green-100 text-green-700',
  Intermediate: 'bg-yellow-100 text-yellow-700',
  Advanced: 'bg-red-100 text-red-700',
  'All Levels': 'bg-gray-100 text-gray-700',
}

const statusColors: Record<ProgramStatus, string> = {
  Active: 'bg-emerald-100 text-emerald-700',
  Draft: 'bg-gray-100 text-gray-600',
  Archived: 'bg-slate-100 text-slate-600',
  Full: 'bg-red-100 text-red-700',
}

export default function ProgramCatalogPage() {
  const [typeFilter, setTypeFilter] = useState<string>('All')
  const [levelFilter, setLevelFilter] = useState<string>('All')
  const [ageFilter, setAgeFilter] = useState<string>('All')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [expandedCard, setExpandedCard] = useState<string | null>(null)

  const filtered = mockPrograms.filter(p => {
    if (typeFilter !== 'All' && p.type !== typeFilter) return false
    if (levelFilter !== 'All' && p.level !== levelFilter) return false
    if (ageFilter !== 'All' && p.ageGroup !== ageFilter) return false
    if (statusFilter !== 'All' && p.status !== statusFilter) return false
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const totalEnrolled = mockPrograms.reduce((s, p) => s + p.enrolled, 0)
  const totalRevenue = 182 * 800 + 62 * 1200 + 28 * 1500 + 35 * 2500 + 12 * 500

  const stats = [
    { label: 'Total Programs', value: mockPrograms.length, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active', value: mockPrograms.filter(p => p.status === 'Active').length, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Students Enrolled', value: totalEnrolled, icon: Users, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Revenue', value: `$${(totalRevenue).toLocaleString()}`, icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-50' },
  ]

  return (
    <div className="p-6 space-y-6 min-h-screen bg-gray-50/50">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Program Catalog</h1>
          <p className="text-gray-500 mt-1">Manage all programs, camps, and events</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <Plus className="w-4 h-4" /> Add Program
        </Button>
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
                  <div className={`p-3 rounded-xl ${stat.bg}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
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
                type="text"
                placeholder="Search programs..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button variant="outline" className="gap-2" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="w-4 h-4" /> Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
          </div>
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Type</label>
                    <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                      <option>All</option><option>REGULAR</option><option>CAMP</option><option>EVENT</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Level</label>
                    <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                      <option>All</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>All Levels</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Age Group</label>
                    <select value={ageFilter} onChange={e => setAgeFilter(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                      <option>All</option><option>3-5</option><option>6-8</option><option>9-12</option><option>9-14</option><option>13-16</option><option>6-12</option><option>All Ages</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Status</label>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                      <option>All</option><option>Active</option><option>Draft</option><option>Archived</option><option>Full</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Program Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <AnimatePresence mode="popLayout">
          {filtered.map((program, i) => (
            <motion.div
              key={program.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{program.name}</CardTitle>
                        <Badge className={`text-xs font-semibold border ${typeColors[program.type]}`}>{program.type}</Badge>
                      </div>
                      <p className="text-sm text-gray-500">{program.description}</p>
                    </div>
                    <button
                      onClick={() => setExpandedCard(expandedCard === program.id ? null : program.id)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className={`text-xs ${levelColors[program.level]}`}>{program.level}</Badge>
                    <Badge variant="outline" className="text-xs bg-slate-50">Ages {program.ageGroup}</Badge>
                    <Badge className={`text-xs ${statusColors[program.status]}`}>{program.status}</Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Price</p>
                      <p className="font-bold text-gray-900">{program.price}</p>
                      <p className="text-xs text-gray-400">/{program.pricePer}</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Enrolled</p>
                      <p className="font-bold text-gray-900">{program.enrolled}/{program.capacity}</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Rating</p>
                      <div className="flex items-center justify-center gap-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="font-bold text-gray-900">{program.rating}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">Capacity</span>
                      <span className="font-medium">{Math.round((program.enrolled / program.capacity) * 100)}%</span>
                    </div>
                    <Progress value={(program.enrolled / program.capacity) * 100} className="h-2" />
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {program.location}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {program.coach}</span>
                  </div>

                  <AnimatePresence>
                    {expandedCard === program.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="flex gap-2 pt-3 border-t">
                          <Button variant="outline" size="sm" className="gap-1 flex-1"><Eye className="w-3 h-3" /> View</Button>
                          <Button variant="outline" size="sm" className="gap-1 flex-1"><Edit className="w-3 h-3" /> Edit</Button>
                          <Button variant="outline" size="sm" className="gap-1 flex-1"><Copy className="w-3 h-3" /> Clone</Button>
                          <Button variant="outline" size="sm" className="gap-1 text-red-500 hover:text-red-600"><Trash2 className="w-3 h-3" /></Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 text-gray-400">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg font-medium">No programs found</p>
          <p className="text-sm">Try adjusting your filters</p>
        </motion.div>
      )}
    </div>
  )
}
