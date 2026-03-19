'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, Clock, ChevronLeft, ChevronRight, AlertTriangle, Wand2,
  Eye, Users, MapPin
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

type ViewMode = 'Week' | 'Day' | 'Month'

interface ScheduleSlot {
  id: string
  day: string
  time: string
  className: string
  coach: string
  room: string
  enrolled: number
  capacity: number
  type: 'REGULAR' | 'CAMP' | 'EVENT'
  color: string
}

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM']

const mockSchedule: ScheduleSlot[] = [
  { id: 'S1', day: 'Monday', time: '10:00 AM', className: 'GYMTOTS', coach: 'Coach Sarah', room: 'Main Studio', enrolled: 8, capacity: 12, type: 'REGULAR', color: 'bg-blue-100 border-blue-300 text-blue-800' },
  { id: 'S2', day: 'Monday', time: '2:00 PM', className: 'Junior Gym', coach: 'Coach Mike', room: 'Main Studio', enrolled: 10, capacity: 15, type: 'REGULAR', color: 'bg-emerald-100 border-emerald-300 text-emerald-800' },
  { id: 'S3', day: 'Monday', time: '5:00 PM', className: 'Private Lesson', coach: 'Coach Sarah', room: 'Small Studio', enrolled: 1, capacity: 1, type: 'EVENT', color: 'bg-purple-100 border-purple-300 text-purple-800' },
  { id: 'S4', day: 'Tuesday', time: '10:00 AM', className: 'Baby Gym', coach: 'Coach Lisa', room: 'Small Studio', enrolled: 6, capacity: 8, type: 'REGULAR', color: 'bg-pink-100 border-pink-300 text-pink-800' },
  { id: 'S5', day: 'Tuesday', time: '3:00 PM', className: 'Junior Gym', coach: 'Coach Mike', room: 'Main Studio', enrolled: 12, capacity: 15, type: 'REGULAR', color: 'bg-emerald-100 border-emerald-300 text-emerald-800' },
  { id: 'S6', day: 'Wednesday', time: '10:00 AM', className: 'GYMTOTS', coach: 'Coach Sarah', room: 'Main Studio', enrolled: 10, capacity: 12, type: 'REGULAR', color: 'bg-blue-100 border-blue-300 text-blue-800' },
  { id: 'S7', day: 'Wednesday', time: '4:00 PM', className: 'Advanced Tumbling', coach: 'Coach Mike', room: 'Training Hall', enrolled: 5, capacity: 10, type: 'REGULAR', color: 'bg-red-100 border-red-300 text-red-800' },
  { id: 'S8', day: 'Thursday', time: '10:00 AM', className: 'Baby Gym', coach: 'Coach Lisa', room: 'Small Studio', enrolled: 7, capacity: 8, type: 'REGULAR', color: 'bg-pink-100 border-pink-300 text-pink-800' },
  { id: 'S9', day: 'Thursday', time: '2:00 PM', className: 'GYMTOTS', coach: 'Coach Sarah', room: 'Main Studio', enrolled: 11, capacity: 12, type: 'REGULAR', color: 'bg-blue-100 border-blue-300 text-blue-800' },
  { id: 'S10', day: 'Friday', time: '10:00 AM', className: 'Junior Gym', coach: 'Coach Mike', room: 'Main Studio', enrolled: 13, capacity: 15, type: 'REGULAR', color: 'bg-emerald-100 border-emerald-300 text-emerald-800' },
  { id: 'S11', day: 'Friday', time: '4:00 PM', className: 'Advanced Tumbling', coach: 'Coach Mike', room: 'Training Hall', enrolled: 8, capacity: 10, type: 'REGULAR', color: 'bg-red-100 border-red-300 text-red-800' },
  { id: 'S12', day: 'Saturday', time: '9:00 AM', className: 'Holiday Camp', coach: 'Multiple', room: 'All Rooms', enrolled: 25, capacity: 30, type: 'CAMP', color: 'bg-orange-100 border-orange-300 text-orange-800' },
  { id: 'S13', day: 'Saturday', time: '2:00 PM', className: 'Private Lesson', coach: 'Coach Sarah', room: 'Small Studio', enrolled: 1, capacity: 1, type: 'EVENT', color: 'bg-purple-100 border-purple-300 text-purple-800' },
]

export default function ScheduleManagementPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('Week')
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date(2026, 2, 16))
  const [selectedSlot, setSelectedSlot] = useState<ScheduleSlot | null>(null)
  const [conflicts, setConflicts] = useState<string[]>([])
  const [showConflicts, setShowConflicts] = useState(false)

  const formatWeek = () => {
    const end = new Date(currentWeekStart)
    end.setDate(end.getDate() + 5)
    return `${currentWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  }

  const navigateWeek = (dir: number) => {
    const next = new Date(currentWeekStart)
    next.setDate(next.getDate() + dir * 7)
    setCurrentWeekStart(next)
  }

  const getSlot = (day: string, time: string) => mockSchedule.find(s => s.day === day && s.time === time)

  const detectConflicts = () => {
    const found: string[] = []
    const coachSlots: Record<string, string[]> = {}
    mockSchedule.forEach(s => {
      const key = `${s.coach}-${s.day}-${s.time}`
      if (!coachSlots[key]) coachSlots[key] = []
      coachSlots[key].push(s.className)
    })
    Object.entries(coachSlots).forEach(([key, classes]) => {
      if (classes.length > 1) found.push(`Conflict: ${key.split('-')[0]} double-booked at ${key.split('-').slice(1).join(' ')}`)
    })
    const roomSlots: Record<string, string[]> = {}
    mockSchedule.forEach(s => {
      const key = `${s.room}-${s.day}-${s.time}`
      if (!roomSlots[key]) roomSlots[key] = []
      roomSlots[key].push(s.className)
    })
    Object.entries(roomSlots).forEach(([key, classes]) => {
      if (classes.length > 1) found.push(`Room conflict: ${key.split('-')[0]} has ${classes.join(' & ')} at ${key.split('-').slice(1).join(' ')}`)
    })
    if (found.length === 0) found.push('No conflicts detected! All schedules are clear.')
    setConflicts(found)
    setShowConflicts(true)
  }

  const totalClasses = mockSchedule.length
  const totalStudents = mockSchedule.reduce((s, c) => s + c.enrolled, 0)
  const avgUtilization = Math.round(mockSchedule.reduce((s, c) => s + (c.enrolled / c.capacity) * 100, 0) / mockSchedule.length)

  return (
    <div className="p-6 space-y-6 min-h-screen bg-gray-50/50">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Schedule Management</h1>
          <p className="text-gray-500 mt-1">Weekly class schedule and room allocation</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={detectConflicts}>
            <AlertTriangle className="w-4 h-4" /> Conflict Detection
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            <Wand2 className="w-4 h-4" /> Generate Schedule
          </Button>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Classes This Week', value: totalClasses, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Students', value: totalStudents, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Avg Utilization', value: `${avgUtilization}%`, icon: Clock, color: 'text-violet-600', bg: 'bg-violet-50' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.bg}`}><stat.icon className={`w-5 h-5 ${stat.color}`} /></div>
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Conflict Alerts */}
      <AnimatePresence>
        {showConflicts && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <Card className={`border-0 shadow-sm ${conflicts[0]?.startsWith('No') ? 'bg-green-50' : 'bg-amber-50'}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <AlertTriangle className={`w-4 h-4 ${conflicts[0]?.startsWith('No') ? 'text-green-600' : 'text-amber-600'}`} />
                    Conflict Detection Results
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowConflicts(false)}>Dismiss</Button>
                </div>
                <ul className="space-y-1">
                  {conflicts.map((c, i) => (
                    <li key={i} className="text-sm text-gray-700">{c}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateWeek(-1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="font-semibold text-gray-900 min-w-[200px] text-center">{formatWeek()}</span>
              <Button variant="outline" size="sm" onClick={() => navigateWeek(1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setCurrentWeekStart(new Date(2026, 2, 16))}>Today</Button>
            </div>
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(['Week', 'Day', 'Month'] as ViewMode[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === mode ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Calendar */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="min-w-[900px]">
                {/* Header */}
                <div className="grid grid-cols-7 border-b bg-gray-50">
                  <div className="p-3 text-xs font-semibold text-gray-500 border-r">Time</div>
                  {days.map(day => (
                    <div key={day} className="p-3 text-xs font-semibold text-gray-700 text-center border-r last:border-r-0">{day}</div>
                  ))}
                </div>
                {/* Time Rows */}
                {timeSlots.map(time => (
                  <div key={time} className="grid grid-cols-7 border-b last:border-b-0 min-h-[70px]">
                    <div className="p-2 text-xs text-gray-500 border-r flex items-start pt-3 font-medium">{time}</div>
                    {days.map(day => {
                      const slot = getSlot(day, time)
                      return (
                        <div key={`${day}-${time}`} className="p-1 border-r last:border-r-0 relative">
                          {slot && (
                            <motion.button
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setSelectedSlot(selectedSlot?.id === slot.id ? null : slot)}
                              className={`w-full rounded-lg border p-2 text-left text-xs ${slot.color} transition-shadow hover:shadow-md`}
                            >
                              <p className="font-bold truncate">{slot.className}</p>
                              <p className="opacity-75 truncate">{slot.coach}</p>
                              <div className="flex items-center justify-between mt-1">
                                <span className="opacity-60">{slot.room}</span>
                                <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">{slot.enrolled}/{slot.capacity}</Badge>
                              </div>
                            </motion.button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Selected Slot Detail */}
      <AnimatePresence>
        {selectedSlot && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-600" />
                  {selectedSlot.className} - {selectedSlot.day} {selectedSlot.time}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div><p className="text-xs text-gray-500">Coach</p><p className="font-medium">{selectedSlot.coach}</p></div>
                  <div><p className="text-xs text-gray-500">Room</p><p className="font-medium">{selectedSlot.room}</p></div>
                  <div><p className="text-xs text-gray-500">Type</p><Badge className="mt-1">{selectedSlot.type}</Badge></div>
                  <div>
                    <p className="text-xs text-gray-500">Capacity</p>
                    <p className="font-medium">{selectedSlot.enrolled}/{selectedSlot.capacity}</p>
                    <Progress value={(selectedSlot.enrolled / selectedSlot.capacity) * 100} className="h-1.5 mt-1" />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm">Edit Session</Button>
                  <Button variant="outline" size="sm">View Roster</Button>
                  <Button variant="outline" size="sm" className="text-red-500">Cancel Session</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-200 border border-blue-300" /> GYMTOTS</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-200 border border-emerald-300" /> Junior Gym</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-200 border border-red-300" /> Advanced</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-pink-200 border border-pink-300" /> Baby Gym</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-200 border border-orange-300" /> Camp</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-purple-200 border border-purple-300" /> Private</span>
      </div>
    </div>
  )
}
