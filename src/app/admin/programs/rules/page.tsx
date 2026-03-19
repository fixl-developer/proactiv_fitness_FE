'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, Plus, Play, Zap, AlertCircle, CheckCircle2, Clock, Settings,
  ToggleLeft, ToggleRight, ChevronDown, Search, FileText, Trash2, Edit, Copy
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

type RuleCategory = 'Enrollment' | 'Scheduling' | 'Pricing' | 'Safety'
type RulePriority = 'High' | 'Medium' | 'Low'
type RuleStatus = 'Active' | 'Draft' | 'Disabled'

interface Rule {
  id: string
  name: string
  category: RuleCategory
  conditions: string
  conditionsDetail: string
  priority: RulePriority
  status: RuleStatus
  lastTriggered: string
  triggerCount: number
  createdBy: string
  createdAt: string
}

const mockRules: Rule[] = [
  {
    id: 'R001', name: 'Max Class Size', category: 'Safety',
    conditions: 'Max 15 students per coach', conditionsDetail: 'IF enrolled_count > 15 AND coach_count == 1 THEN block_enrollment AND notify_admin',
    priority: 'High', status: 'Active', lastTriggered: '2 hours ago', triggerCount: 47,
    createdBy: 'Admin', createdAt: 'Jan 15, 2026'
  },
  {
    id: 'R002', name: 'Sibling Discount', category: 'Pricing',
    conditions: '10% off second child', conditionsDetail: 'IF family.children_enrolled >= 2 THEN apply_discount(10%) ON second_child.fees',
    priority: 'Medium', status: 'Active', lastTriggered: '1 day ago', triggerCount: 23,
    createdBy: 'Admin', createdAt: 'Feb 1, 2026'
  },
  {
    id: 'R003', name: 'Age Restriction', category: 'Enrollment',
    conditions: 'Min age 3 for GYMTOTS', conditionsDetail: 'IF program == "GYMTOTS" AND student.age < 3 THEN block_enrollment AND show_message("Minimum age is 3 years")',
    priority: 'High', status: 'Active', lastTriggered: '3 days ago', triggerCount: 8,
    createdBy: 'Admin', createdAt: 'Jan 10, 2026'
  },
  {
    id: 'R004', name: 'Coach Certification', category: 'Scheduling',
    conditions: 'Coach must have L2+ cert', conditionsDetail: 'IF class.level == "Advanced" AND coach.cert_level < 2 THEN block_assignment AND alert_scheduler',
    priority: 'High', status: 'Active', lastTriggered: '5 days ago', triggerCount: 3,
    createdBy: 'Admin', createdAt: 'Jan 20, 2026'
  },
  {
    id: 'R005', name: 'Cancellation Window', category: 'Enrollment',
    conditions: '24hr notice required', conditionsDetail: 'IF cancellation.time < class.start - 24h THEN apply_late_fee(50%) AND notify_parent',
    priority: 'Medium', status: 'Active', lastTriggered: '1 day ago', triggerCount: 15,
    createdBy: 'Admin', createdAt: 'Feb 5, 2026'
  },
  {
    id: 'R006', name: 'Holiday Auto-Cancel', category: 'Scheduling',
    conditions: 'Auto-cancel on public holidays', conditionsDetail: 'IF class.date IN public_holidays THEN cancel_class AND notify_all_enrolled AND create_makeup_session',
    priority: 'Low', status: 'Draft', lastTriggered: 'Never', triggerCount: 0,
    createdBy: 'Admin', createdAt: 'Mar 1, 2026'
  },
]

const categoryColors: Record<RuleCategory, string> = {
  Enrollment: 'bg-blue-100 text-blue-700',
  Scheduling: 'bg-violet-100 text-violet-700',
  Pricing: 'bg-amber-100 text-amber-700',
  Safety: 'bg-red-100 text-red-700',
}

const priorityColors: Record<RulePriority, string> = {
  High: 'bg-red-100 text-red-700 border-red-200',
  Medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Low: 'bg-gray-100 text-gray-600 border-gray-200',
}

const statusColors: Record<RuleStatus, string> = {
  Active: 'bg-emerald-100 text-emerald-700',
  Draft: 'bg-gray-100 text-gray-600',
  Disabled: 'bg-slate-100 text-slate-500',
}

export default function RulesEnginePage() {
  const [expandedRule, setExpandedRule] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('All')
  const [testResult, setTestResult] = useState<{ ruleId: string; passed: boolean; message: string } | null>(null)
  const [rules, setRules] = useState(mockRules)

  const filtered = rules.filter(r => {
    if (categoryFilter !== 'All' && r.category !== categoryFilter) return false
    if (searchQuery && !r.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const toggleRuleStatus = (id: string) => {
    setRules(prev => prev.map(r => {
      if (r.id !== id) return r
      const next: RuleStatus = r.status === 'Active' ? 'Disabled' : 'Active'
      return { ...r, status: next }
    }))
  }

  const testRule = (rule: Rule) => {
    const passed = Math.random() > 0.3
    setTestResult({
      ruleId: rule.id,
      passed,
      message: passed
        ? `Rule "${rule.name}" passed all test scenarios (3/3 scenarios validated)`
        : `Rule "${rule.name}" failed on edge case: boundary value test`
    })
    setTimeout(() => setTestResult(null), 5000)
  }

  const stats = [
    { label: 'Total Rules', value: rules.length, icon: Shield, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active', value: rules.filter(r => r.status === 'Active').length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Triggered (30d)', value: rules.reduce((s, r) => s + r.triggerCount, 0), icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Categories', value: new Set(rules.map(r => r.category)).size, icon: Settings, color: 'text-violet-600', bg: 'bg-violet-50' },
  ]

  return (
    <div className="p-6 space-y-6 min-h-screen bg-gray-50/50">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rules Engine</h1>
          <p className="text-gray-500 mt-1">Business rules for enrollment, scheduling, pricing, and safety</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => { rules.forEach(r => r.status === 'Active' && testRule(r)) }}>
            <Play className="w-4 h-4" /> Test Rules
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            <Plus className="w-4 h-4" /> Add Rule
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="border-0 shadow-sm">
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

      {/* Test Result Alert */}
      <AnimatePresence>
        {testResult && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Card className={`border-0 shadow-sm ${testResult.passed ? 'bg-green-50' : 'bg-red-50'}`}>
              <CardContent className="p-4 flex items-center gap-3">
                {testResult.passed ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
                <span className="text-sm font-medium">{testResult.message}</span>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text" placeholder="Search rules..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
              <option>All</option><option>Enrollment</option><option>Scheduling</option><option>Pricing</option><option>Safety</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Rules Table */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Rule Name</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Category</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Conditions</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Priority</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Last Triggered</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((rule, i) => (
                  <motion.tr
                    key={rule.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b hover:bg-gray-50/50 transition-colors cursor-pointer"
                    onClick={() => setExpandedRule(expandedRule === rule.id ? null : rule.id)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedRule === rule.id ? 'rotate-180' : ''}`} />
                        <div>
                          <p className="font-medium text-gray-900">{rule.name}</p>
                          <p className="text-xs text-gray-400">{rule.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4"><Badge className={`text-xs ${categoryColors[rule.category]}`}>{rule.category}</Badge></td>
                    <td className="p-4"><span className="text-sm text-gray-600 max-w-[200px] truncate block">{rule.conditions}</span></td>
                    <td className="p-4"><Badge variant="outline" className={`text-xs border ${priorityColors[rule.priority]}`}>{rule.priority}</Badge></td>
                    <td className="p-4"><Badge className={`text-xs ${statusColors[rule.status]}`}>{rule.status}</Badge></td>
                    <td className="p-4">
                      <div>
                        <p className="text-sm text-gray-600">{rule.lastTriggered}</p>
                        <p className="text-xs text-gray-400">{rule.triggerCount} times</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <button onClick={() => toggleRuleStatus(rule.id)} className="p-1.5 hover:bg-gray-100 rounded" title="Toggle">
                          {rule.status === 'Active'
                            ? <ToggleRight className="w-5 h-5 text-emerald-600" />
                            : <ToggleLeft className="w-5 h-5 text-gray-400" />
                          }
                        </button>
                        <button onClick={() => testRule(rule)} className="p-1.5 hover:bg-gray-100 rounded" title="Test">
                          <Play className="w-4 h-4 text-blue-600" />
                        </button>
                        <button className="p-1.5 hover:bg-gray-100 rounded" title="Edit">
                          <Edit className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Expanded Rule Detail */}
          <AnimatePresence>
            {expandedRule && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                {(() => {
                  const rule = rules.find(r => r.id === expandedRule)
                  if (!rule) return null
                  return (
                    <div className="p-6 bg-slate-50 border-t space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Rule Logic</h4>
                          <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm">
                            {rule.conditionsDetail}
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Created By</h4>
                            <p className="text-sm text-gray-700">{rule.createdBy} on {rule.createdAt}</p>
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Trigger Rate</h4>
                            <div className="flex items-center gap-2">
                              <Progress value={Math.min(rule.triggerCount * 2, 100)} className="h-2 flex-1" />
                              <span className="text-sm font-medium">{rule.triggerCount}/mo</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="gap-1"><Copy className="w-3 h-3" /> Clone</Button>
                            <Button variant="outline" size="sm" className="gap-1"><FileText className="w-3 h-3" /> History</Button>
                            <Button variant="outline" size="sm" className="gap-1 text-red-500"><Trash2 className="w-3 h-3" /> Delete</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  )
}
