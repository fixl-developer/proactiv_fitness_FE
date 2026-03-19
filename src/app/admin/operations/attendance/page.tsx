'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckSquare, Calendar, Users, UserX, TrendingUp, ChevronDown,
  ChevronLeft, ChevronRight, Clock, CheckCircle2, XCircle, AlertCircle,
  Download, RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

type AttendanceStatus = 'Present' | 'Absent' | 'Late'

interface Student {
  id: string
  name: string
  status: AttendanceStatus
}

interface ClassSession {
  id: string
  className: string
  time: string
  coach: string
  enrolled: number
  present: number
  absent: number
  late: number
  attendanceRate: number
  room: string
  students: Student[]
}

const mockClasses: ClassSession[] = [
  {
    id: 'CLS001', className: 'GYMTOTS', time: '10:00 AM', coach: 'Coach Sarah',
    enrolled: 12, present: 10, absent: 2, late: 1, attendanceRate: 83, room: 'Main Studio',
    students: [
      { id: 'S1', name: 'Emma Watson', status: 'Present' },
      { id: 'S2', name: 'Oliver Smith', status: 'Present' },
      { id: 'S3', name: 'Sophie Chan', status: 'Present' },
      { id: 'S4', name: 'Lucas Brown', status: 'Late' },
      { id: 'S5', name: 'Mia Johnson', status: 'Present' },
      { id: 'S6', name: 'Noah Lee', status: 'Absent' },
      { id: 'S7', name: 'Ava Chen', status: 'Present' },
      { id: 'S8', name: 'Ethan Wong', status: 'Present' },
      { id: 'S9', name: 'Isabella Liu', status: 'Present' },
      { id: 'S10', name: 'James Park', status: 'Absent' },
      { id: 'S11', name: 'Chloe Ng', status: 'Present' },
      { id: 'S12', name: 'Liam Tan', status: 'Present' },
    ]
  },
  {
    id: 'CLS002', className: 'Junior Gym', time: '2:00 PM', coach: 'Coach Mike',
    enrolled: 15, present: 14, absent: 1, late: 0, attendanceRate: 93, room: 'Main Studio',
    students: [
      { id: 'S13', name: 'Sarah Johnson', status: 'Present' },
      { id: 'S14', name: 'Tom Chen', status: 'Present' },
      { id: 'S15', name: 'Amy Wong', status: 'Present' },
      { id: 'S16', name: 'Jack Liu', status: 'Present' },
      { id: 'S17', name: 'Emily Zhao', status: 'Present' },
      { id: 'S18', name: 'Ryan Lam', status: 'Absent' },
      { id: 'S19', name: 'Lily Ho', status: 'Present' },
      { id: 'S20', name: 'Daniel Yip', status: 'Present' },
      { id: 'S21', name: 'Grace Fung', status: 'Present' },
      { id: 'S22', name: 'Max Cheung', status: 'Present' },
      { id: 'S23', name: 'Zoe Kwok', status: 'Present' },
      { id: 'S24', name: 'Alex Tsang', status: 'Present' },
      { id: 'S25', name: 'Hannah Mak', status: 'Present' },
      { id: 'S26', name: 'Ben Leung', status: 'Present' },
      { id: 'S27', name: 'Ella Tse', status: 'Present' },
    ]
  },
  {
    id: 'CLS003', className: 'Advanced Tumbling', time: '4:00 PM', coach: 'Coach Mike',
    enrolled: 10, present: 9, absent: 1, late: 2, attendanceRate: 90, room: 'Training Hall',
    students: [
      { id: 'S28', name: 'Kevin Wu', status: 'Present' },
      { id: 'S29', name: 'Rachel Tam', status: 'Present' },
      { id: 'S30', name: 'Chris Hui', status: 'Late' },
      { id: 'S31', name: 'Nina Choi', status: 'Present' },
      { id: 'S32', name: 'Marcus Yeung', status: 'Present' },
      { id: 'S33', name: 'Ashley Lau', status: 'Late' },
      { id: 'S34', name: 'Derek Cheng', status: 'Present' },
      { id: 'S35', name: 'Fiona Ip', status: 'Present' },
      { id: 'S36', name: 'Gary So', status: 'Absent' },
      { id: 'S37', name: 'Jade Poon', status: 'Present' },
    ]
  },
]

const statusIcons: Record<AttendanceStatus, typeof CheckCircle2> = {
  Present: CheckCircle2,
  Absent: XCircle,
  Late: AlertCircle,
}

const statusStyles: Record<AttendanceStatus, string> = {
  Present: 'text-emerald-600 bg-emerald-50',
  Absent: 'text-red-600 bg-red-50',
  Late: 'text-amber-600 bg-amber-50',
}

export default function AttendanceTrackingPage() {
  const [selectedDate, setSelectedDate] = useState('2026-03-19')
  const [expandedClass, setExpandedClass] = useState<string | null>(null)
  const [classes, setClasses] = useState(mockClasses)

  const totalPresent = classes.reduce((s, c) => s + c.present, 0)
  const totalAbsent = classes.reduce((s, c) => s + c.absent, 0)
  const totalEnrolled = classes.reduce((s, c) => s + c.enrolled, 0)
  const overallRate = Math.round((totalPresent / totalEnrolled) * 100)

  const updateStudentStatus = (classId: string, studentId: string, newStatus: AttendanceStatus) => {
    setClasses(prev => prev.map(cls => {
      if (cls.id !== classId) return cls
      const updatedStudents = cls.students.map(s =>
        s.id === studentId ? { ...s, status: newStatus } : s
      )
      const present = updatedStudents.filter(s => s.status === 'Present').length
      const absent = updatedStudents.filter(s => s.status === 'Absent').length
      const late = updatedStudents.filter(s => s.status === 'Late').length
      return {
        ...cls,
        students: updatedStudents,
        present,
        absent,
        late,
        attendanceRate: Math.round((present / cls.enrolled) * 100),
      }
    }))
  }

  const markAllPresent = (classId: string) => {
    setClasses(prev => prev.map(cls => {
      if (cls.id !== classId) return cls
      return {
        ...cls,
        students: cls.students.map(s => ({ ...s, status: 'Present' as AttendanceStatus })),
        present: cls.enrolled,
        absent: 0,
        late: 0,
        attendanceRate: 100,
      }
    }))
  }

  const navigateDate = (dir: number) => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + dir)
    setSelectedDate(d.toISOString().split('T')[0])
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  }

  const stats = [
    { label: "Today's Classes", value: classes.length, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Present', value: totalPresent, icon: CheckSquare, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Absent', value: totalAbsent, icon: UserX, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Attendance Rate', value: `${overallRate}%`, icon: TrendingUp, color: 'text-violet-600', bg: 'bg-violet-50' },
  ]

  return (
    <div className="p-6 space-y-6 min-h-screen bg-gray-50/50">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Tracking</h1>
          <p className="text-gray-500 mt-1">Monitor and manage daily class attendance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2"><Download className="w-4 h-4" /> Export Report</Button>
          <Button variant="outline" className="gap-2"><RefreshCw className="w-4 h-4" /> Refresh</Button>
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

      {/* Date Picker */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigateDate(-1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-blue-600" />
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700 hidden md:inline">{formatDate(selectedDate)}</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigateDate(1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelectedDate('2026-03-19')}>Today</Button>
          </div>
        </CardContent>
      </Card>

      {/* Classes List */}
      <div className="space-y-4">
        {classes.map((cls, i) => (
          <motion.div
            key={cls.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-0 shadow-sm overflow-hidden">
              <CardContent className="p-0">
                {/* Class Header */}
                <div
                  className="p-5 cursor-pointer hover:bg-gray-50/50 transition-colors"
                  onClick={() => setExpandedClass(expandedClass === cls.id ? null : cls.id)}
                >
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedClass === cls.id ? 'rotate-180' : ''}`} />
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{cls.className}</h3>
                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {cls.time}</span>
                          <span>{cls.coach}</span>
                          <span>{cls.room}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Enrolled</p>
                        <p className="font-bold text-gray-900">{cls.enrolled}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Present</p>
                        <p className="font-bold text-emerald-600">{cls.present}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Absent</p>
                        <p className="font-bold text-red-600">{cls.absent}</p>
                      </div>
                      <div className="min-w-[140px]">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">Attendance</span>
                          <span className={`font-bold ${cls.attendanceRate >= 90 ? 'text-emerald-600' : cls.attendanceRate >= 80 ? 'text-amber-600' : 'text-red-600'}`}>
                            {cls.attendanceRate}%
                          </span>
                        </div>
                        <Progress value={cls.attendanceRate} className="h-2.5" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Student List */}
                <AnimatePresence>
                  {expandedClass === cls.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t">
                        <div className="p-4 bg-gray-50 flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-gray-700">Student Roster</h4>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                            onClick={(e) => { e.stopPropagation(); markAllPresent(cls.id) }}
                          >
                            <CheckCircle2 className="w-3 h-3" /> Mark All Present
                          </Button>
                        </div>
                        <div className="divide-y">
                          {cls.students.map((student, si) => {
                            const Icon = statusIcons[student.status]
                            return (
                              <motion.div
                                key={student.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: si * 0.02 }}
                                className="px-6 py-3 flex items-center justify-between hover:bg-gray-50/50"
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${statusStyles[student.status]}`}>
                                    <Icon className="w-4 h-4" />
                                  </div>
                                  <span className="text-sm font-medium text-gray-800">{student.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {(['Present', 'Absent', 'Late'] as AttendanceStatus[]).map(status => (
                                    <button
                                      key={status}
                                      onClick={() => updateStudentStatus(cls.id, student.id, status)}
                                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                                        student.status === status
                                          ? status === 'Present' ? 'bg-emerald-500 text-white' : status === 'Absent' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'
                                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                      }`}
                                    >
                                      {status}
                                    </button>
                                  ))}
                                </div>
                              </motion.div>
                            )
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
