'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarCheck, DollarSign, Clock, XCircle, CheckCircle2, Search,
  Filter, ChevronDown, MoreVertical, Eye, Ban, RotateCcw, CreditCard,
  TrendingUp, AlertCircle, FileText, Download
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

type BookingStatus = 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed'
type PaymentStatus = 'Paid' | 'Awaiting' | 'Refunded' | 'Failed'

interface Booking {
  id: string
  studentName: string
  parentName: string
  className: string
  date: string
  time: string
  status: BookingStatus
  amount: number
  paymentStatus: PaymentStatus
  createdAt: string
  notes: string
}

const mockBookings: Booking[] = [
  {
    id: 'BK001', studentName: 'Sarah Johnson', parentName: 'Emily Johnson',
    className: 'GYMTOTS', date: 'Mar 19, 2026', time: '10:00 AM',
    status: 'Confirmed', amount: 200, paymentStatus: 'Paid',
    createdAt: 'Mar 15, 2026', notes: 'Regular weekly booking'
  },
  {
    id: 'BK002', studentName: 'Tom Chen', parentName: 'David Chen',
    className: 'Junior Gym', date: 'Mar 19, 2026', time: '2:00 PM',
    status: 'Pending', amount: 300, paymentStatus: 'Awaiting',
    createdAt: 'Mar 17, 2026', notes: 'New student - trial session'
  },
  {
    id: 'BK003', studentName: 'Amy Wong', parentName: 'Jessica Wong',
    className: 'Advanced Tumbling', date: 'Mar 20, 2026', time: '4:00 PM',
    status: 'Confirmed', amount: 375, paymentStatus: 'Paid',
    createdAt: 'Mar 14, 2026', notes: 'Competition prep session'
  },
  {
    id: 'BK004', studentName: 'Jack Liu', parentName: 'Karen Liu',
    className: 'Holiday Camp', date: 'Mar 25, 2026', time: '9:00 AM',
    status: 'Cancelled', amount: 625, paymentStatus: 'Refunded',
    createdAt: 'Mar 10, 2026', notes: 'Family travel conflict'
  },
  {
    id: 'BK005', studentName: 'Mia Park', parentName: 'Susan Park',
    className: 'GYMTOTS', date: 'Mar 18, 2026', time: '10:00 AM',
    status: 'Completed', amount: 200, paymentStatus: 'Paid',
    createdAt: 'Mar 12, 2026', notes: ''
  },
  {
    id: 'BK006', studentName: 'Leo Ng', parentName: 'Paul Ng',
    className: 'Junior Gym', date: 'Mar 21, 2026', time: '2:00 PM',
    status: 'Confirmed', amount: 300, paymentStatus: 'Paid',
    createdAt: 'Mar 16, 2026', notes: 'Sibling discount applied'
  },
  {
    id: 'BK007', studentName: 'Zara Lam', parentName: 'Michelle Lam',
    className: 'Private Lesson', date: 'Mar 22, 2026', time: '11:00 AM',
    status: 'Pending', amount: 500, paymentStatus: 'Awaiting',
    createdAt: 'Mar 18, 2026', notes: 'Requesting Coach Sarah specifically'
  },
]

const bookingStatusColors: Record<BookingStatus, string> = {
  Confirmed: 'bg-emerald-100 text-emerald-700',
  Pending: 'bg-amber-100 text-amber-700',
  Cancelled: 'bg-red-100 text-red-700',
  Completed: 'bg-blue-100 text-blue-700',
}

const paymentStatusColors: Record<PaymentStatus, string> = {
  Paid: 'bg-emerald-100 text-emerald-700',
  Awaiting: 'bg-amber-100 text-amber-700',
  Refunded: 'bg-violet-100 text-violet-700',
  Failed: 'bg-red-100 text-red-700',
}

export default function BookingsManagementPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [classFilter, setClassFilter] = useState<string>('All')
  const [showFilters, setShowFilters] = useState(false)
  const [bookings, setBookings] = useState(mockBookings)
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null)
  const [actionConfirm, setActionConfirm] = useState<{ bookingId: string; action: string } | null>(null)

  const filtered = bookings.filter(b => {
    if (statusFilter !== 'All' && b.status !== statusFilter) return false
    if (classFilter !== 'All' && b.className !== classFilter) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return b.studentName.toLowerCase().includes(q) || b.id.toLowerCase().includes(q) || b.className.toLowerCase().includes(q)
    }
    return true
  })

  const confirmBooking = (id: string) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'Confirmed' as BookingStatus, paymentStatus: 'Paid' as PaymentStatus } : b))
    setActionConfirm(null)
  }

  const cancelBooking = (id: string) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'Cancelled' as BookingStatus } : b))
    setActionConfirm(null)
  }

  const refundBooking = (id: string) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, paymentStatus: 'Refunded' as PaymentStatus, status: 'Cancelled' as BookingStatus } : b))
    setActionConfirm(null)
  }

  const totalRevenue = bookings.filter(b => b.paymentStatus === 'Paid' && (b.date === 'Mar 19, 2026')).reduce((s, b) => s + b.amount, 0)

  const stats = [
    { label: 'Total Bookings', value: bookings.length, icon: CalendarCheck, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Confirmed', value: bookings.filter(b => b.status === 'Confirmed').length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Pending', value: bookings.filter(b => b.status === 'Pending').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Cancelled', value: bookings.filter(b => b.status === 'Cancelled').length, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: "Today's Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-violet-600', bg: 'bg-violet-50' },
  ]

  const uniqueClasses = [...new Set(bookings.map(b => b.className))]

  return (
    <div className="p-6 space-y-6 min-h-screen bg-gray-50/50">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bookings Management</h1>
          <p className="text-gray-500 mt-1">View, manage, and process class bookings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2"><Download className="w-4 h-4" /> Export</Button>
          <Button variant="outline" className="gap-2"><FileText className="w-4 h-4" /> Report</Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                    <p className="text-xl font-bold mt-1 text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-2.5 rounded-xl ${stat.bg}`}><stat.icon className={`w-5 h-5 ${stat.color}`} /></div>
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
                type="text" placeholder="Search by name, ID, or class..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
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
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-4 border-t">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Status</label>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                      <option>All</option><option>Confirmed</option><option>Pending</option><option>Cancelled</option><option>Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Class</label>
                    <select value={classFilter} onChange={e => setClassFilter(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                      <option>All</option>
                      {uniqueClasses.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Date Range</label>
                    <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm" defaultValue="2026-03-19" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Action Confirmation */}
      <AnimatePresence>
        {actionConfirm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Card className="border-0 shadow-sm bg-amber-50">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <span className="text-sm font-medium">
                    Are you sure you want to <strong>{actionConfirm.action}</strong> booking {actionConfirm.bookingId}?
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setActionConfirm(null)}>Cancel</Button>
                  <Button size="sm" className="bg-blue-600 text-white" onClick={() => {
                    if (actionConfirm.action === 'confirm') confirmBooking(actionConfirm.bookingId)
                    if (actionConfirm.action === 'cancel') cancelBooking(actionConfirm.bookingId)
                    if (actionConfirm.action === 'refund') refundBooking(actionConfirm.bookingId)
                  }}>
                    Proceed
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bookings Table */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Booking ID</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Student</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Class</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Date & Time</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Payment</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((booking, i) => (
                  <motion.tr
                    key={booking.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`border-b hover:bg-gray-50/80 transition-colors cursor-pointer ${selectedBooking === booking.id ? 'bg-blue-50/50' : ''}`}
                    onClick={() => setSelectedBooking(selectedBooking === booking.id ? null : booking.id)}
                  >
                    <td className="p-4">
                      <span className="font-mono text-sm font-bold text-blue-600">#{booking.id}</span>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-gray-900">{booking.studentName}</p>
                        <p className="text-xs text-gray-400">{booking.parentName}</p>
                      </div>
                    </td>
                    <td className="p-4"><span className="text-sm text-gray-700">{booking.className}</span></td>
                    <td className="p-4">
                      <div>
                        <p className="text-sm text-gray-700">{booking.date}</p>
                        <p className="text-xs text-gray-400">{booking.time}</p>
                      </div>
                    </td>
                    <td className="p-4"><Badge className={`text-xs ${bookingStatusColors[booking.status]}`}>{booking.status}</Badge></td>
                    <td className="p-4"><span className="font-semibold text-gray-900">${booking.amount}</span></td>
                    <td className="p-4"><Badge variant="outline" className={`text-xs ${paymentStatusColors[booking.paymentStatus]}`}>{booking.paymentStatus}</Badge></td>
                    <td className="p-4">
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        {booking.status === 'Pending' && (
                          <button
                            onClick={() => setActionConfirm({ bookingId: booking.id, action: 'confirm' })}
                            className="p-1.5 hover:bg-emerald-100 rounded text-emerald-600" title="Confirm"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        {booking.status !== 'Cancelled' && booking.status !== 'Completed' && (
                          <button
                            onClick={() => setActionConfirm({ bookingId: booking.id, action: 'cancel' })}
                            className="p-1.5 hover:bg-red-100 rounded text-red-500" title="Cancel"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                        {booking.paymentStatus === 'Paid' && booking.status !== 'Cancelled' && (
                          <button
                            onClick={() => setActionConfirm({ bookingId: booking.id, action: 'refund' })}
                            className="p-1.5 hover:bg-violet-100 rounded text-violet-600" title="Refund"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                        <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Booking Detail Panel */}
      <AnimatePresence>
        {selectedBooking && (() => {
          const booking = bookings.find(b => b.id === selectedBooking)
          if (!booking) return null
          return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    Booking Detail - #{booking.id}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Student</p>
                      <p className="font-medium">{booking.studentName}</p>
                      <p className="text-xs text-gray-400">Parent: {booking.parentName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Class</p>
                      <p className="font-medium">{booking.className}</p>
                      <p className="text-xs text-gray-400">{booking.date} at {booking.time}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Amount</p>
                      <p className="font-bold text-lg">${booking.amount}</p>
                      <Badge className={`text-xs mt-1 ${paymentStatusColors[booking.paymentStatus]}`}>{booking.paymentStatus}</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Created</p>
                      <p className="font-medium">{booking.createdAt}</p>
                      {booking.notes && <p className="text-xs text-gray-400 mt-1">{booking.notes}</p>}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2 border-t">
                    <Button variant="outline" size="sm" className="gap-1"><Eye className="w-3 h-3" /> Full Details</Button>
                    <Button variant="outline" size="sm" className="gap-1"><FileText className="w-3 h-3" /> Invoice</Button>
                    <Button variant="outline" size="sm" className="gap-1"><CreditCard className="w-3 h-3" /> Payment History</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })()}
      </AnimatePresence>

      {filtered.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 text-gray-400">
          <CalendarCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg font-medium">No bookings found</p>
          <p className="text-sm">Try adjusting your filters</p>
        </motion.div>
      )}
    </div>
  )
}
