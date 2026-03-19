'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar, CalendarDays, GraduationCap, PartyPopper, Clock, Plus,
  Edit2, MapPin, Trash2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

type TermStatus = 'Current' | 'Upcoming' | 'Past'

interface Term {
  id: string
  name: string
  startDate: string
  endDate: string
  durationWeeks: number
  status: TermStatus
  classesCount: number
  enrollments: number
  progress: number
}

interface Holiday {
  id: string
  name: string
  date: string
  dayOfWeek: string
  affectedLocations: string[]
  type: 'Public' | 'School' | 'Custom'
}

const termStatusConfig: Record<TermStatus, { color: string; bg: string }> = {
  Current: { color: 'text-green-700', bg: 'bg-green-100' },
  Upcoming: { color: 'text-blue-700', bg: 'bg-blue-100' },
  Past: { color: 'text-gray-600', bg: 'bg-gray-100' },
}

const terms: Term[] = [
  { id: '1', name: 'Spring Term 2026', startDate: '2026-01-06', endDate: '2026-04-12', durationWeeks: 14, status: 'Current', classesCount: 156, enrollments: 420, progress: 72 },
  { id: '2', name: 'Summer Term 2026', startDate: '2026-04-21', endDate: '2026-07-19', durationWeeks: 13, status: 'Upcoming', classesCount: 142, enrollments: 0, progress: 0 },
  { id: '3', name: 'Autumn Term 2026', startDate: '2026-08-25', endDate: '2026-12-13', durationWeeks: 16, status: 'Upcoming', classesCount: 0, enrollments: 0, progress: 0 },
  { id: '4', name: 'Autumn Term 2025', startDate: '2025-09-01', endDate: '2025-12-14', durationWeeks: 15, status: 'Past', classesCount: 148, enrollments: 395, progress: 100 },
]

const holidays: Holiday[] = [
  { id: 'h1', name: 'Good Friday', date: '2026-04-03', dayOfWeek: 'Friday', affectedLocations: ['All Locations'], type: 'Public' },
  { id: 'h2', name: 'Easter Monday', date: '2026-04-06', dayOfWeek: 'Monday', affectedLocations: ['All Locations'], type: 'Public' },
  { id: 'h3', name: "Buddha's Birthday", date: '2026-05-24', dayOfWeek: 'Sunday', affectedLocations: ['All Locations'], type: 'Public' },
  { id: 'h4', name: 'Tuen Ng Festival', date: '2026-05-31', dayOfWeek: 'Sunday', affectedLocations: ['All Locations'], type: 'Public' },
  { id: 'h5', name: 'HKSAR Establishment Day', date: '2026-07-01', dayOfWeek: 'Wednesday', affectedLocations: ['All Locations'], type: 'Public' },
  { id: 'h6', name: 'Staff Training Day', date: '2026-03-21', dayOfWeek: 'Saturday', affectedLocations: ['ProGym Cyberport', 'ProGym Wan Chai'], type: 'Custom' },
  { id: 'h7', name: 'Mid-Autumn Festival', date: '2026-09-25', dayOfWeek: 'Friday', affectedLocations: ['All Locations'], type: 'Public' },
  { id: 'h8', name: 'School Sports Day', date: '2026-04-10', dayOfWeek: 'Friday', affectedLocations: ['School Programs'], type: 'School' },
]

const holidayTypeColors: Record<string, string> = {
  Public: 'bg-red-100 text-red-700',
  School: 'bg-blue-100 text-blue-700',
  Custom: 'bg-purple-100 text-purple-700',
}

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatDate(dateStr: string): string {
  const parts = dateStr.split('-').map(Number)
  return `${monthNames[parts[1] - 1]} ${parts[2]}, ${parts[0]}`
}

export default function TermsPage() {
  const [activeTab, setActiveTab] = useState<'terms' | 'holidays'>('terms')
  const [selectedYear, setSelectedYear] = useState(2026)

  const filteredHolidays = holidays.filter((h) => h.date.startsWith(selectedYear.toString())).sort((a, b) => a.date.localeCompare(b.date))

  // Group holidays by month
  const holidaysByMonth: Record<string, Holiday[]> = {}
  filteredHolidays.forEach((h) => {
    const month = monthNames[parseInt(h.date.split('-')[1]) - 1]
    if (!holidaysByMonth[month]) holidaysByMonth[month] = []
    holidaysByMonth[month].push(h)
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Terms & Holidays</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage academic terms and holiday schedules</p>
          </div>
          <Button><Plus className="h-4 w-4 mr-2" /> {activeTab === 'terms' ? 'Add Term' : 'Add Holiday'}</Button>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('terms')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'terms' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <span className="flex items-center gap-2"><GraduationCap className="h-4 w-4" /> Terms</span>
        </button>
        <button
          onClick={() => setActiveTab('holidays')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'holidays' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <span className="flex items-center gap-2"><PartyPopper className="h-4 w-4" /> Holidays</span>
        </button>
      </div>

      {activeTab === 'terms' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Term Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Current Term</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">Spring 2026</p>
                  <p className="text-xs text-green-600">72% complete</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <CalendarDays className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Active Classes</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">156</p>
                  <p className="text-xs text-gray-500">this term</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Next Term Starts</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">Apr 21</p>
                  <p className="text-xs text-gray-500">Summer 2026</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Terms Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-600" /> Academic Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Term Name</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Start Date</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">End Date</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Duration</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Classes</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Progress</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {terms.map((term) => {
                      const sc = termStatusConfig[term.status]
                      return (
                        <motion.tr key={term.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{term.name}</p>
                              {term.enrollments > 0 && <p className="text-xs text-gray-500">{term.enrollments} enrollments</p>}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{formatDate(term.startDate)}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{formatDate(term.endDate)}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{term.durationWeeks} weeks</td>
                          <td className="px-4 py-3">
                            <Badge className={`${sc.bg} ${sc.color}`}>{term.status}</Badge>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                            {term.classesCount > 0 ? term.classesCount : '--'}
                          </td>
                          <td className="px-4 py-3">
                            {term.status !== 'Upcoming' || term.progress > 0 ? (
                              <div className="flex items-center gap-2 min-w-[120px]">
                                <Progress value={term.progress} className="h-2 flex-1" />
                                <span className="text-xs text-gray-500 w-8">{term.progress}%</span>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">Not started</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button variant="ghost" size="sm"><Edit2 className="h-4 w-4" /></Button>
                          </td>
                        </motion.tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {activeTab === 'holidays' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Year Selector */}
          <div className="flex items-center gap-2">
            {[2025, 2026, 2027].map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedYear === year ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                {year}
              </button>
            ))}
          </div>

          {/* Holiday Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{filteredHolidays.length}</p>
                <p className="text-sm text-gray-500">Total Holidays</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-red-600">{filteredHolidays.filter((h) => h.type === 'Public').length}</p>
                <p className="text-sm text-gray-500">Public Holidays</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-purple-600">{filteredHolidays.filter((h) => h.type === 'Custom').length}</p>
                <p className="text-sm text-gray-500">Custom Closures</p>
              </CardContent>
            </Card>
          </div>

          {/* Holidays by Month */}
          <div className="space-y-4">
            {Object.entries(holidaysByMonth).map(([month, monthHolidays]) => (
              <motion.div key={month} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{month} {selectedYear}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {monthHolidays.map((holiday) => (
                      <div key={holiday.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/30 group">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center">
                            <span className="text-xs text-gray-500">{holiday.dayOfWeek.slice(0, 3)}</span>
                            <span className="text-lg font-bold text-gray-900 dark:text-white">{holiday.date.split('-')[2]}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{holiday.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge className={holidayTypeColors[holiday.type]}>{holiday.type}</Badge>
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> {holiday.affectedLocations.join(', ')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm"><Edit2 className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredHolidays.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <PartyPopper className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No holidays configured for {selectedYear}.</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
