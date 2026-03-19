'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Plus, Edit, Trash2, Search, Sun, Umbrella } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function TermsHolidaysPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const terms = [
    { id: 1, name: 'Spring Term 2024', startDate: '2024-01-15', endDate: '2024-04-15', weeks: 13, status: 'active' },
    { id: 2, name: 'Summer Term 2024', startDate: '2024-05-01', endDate: '2024-07-31', weeks: 12, status: 'upcoming' },
    { id: 3, name: 'Fall Term 2024', startDate: '2024-09-01', endDate: '2024-12-15', weeks: 15, status: 'upcoming' }
  ]

  const holidays = [
    { id: 1, name: 'Chinese New Year', date: '2024-02-10', type: 'Public Holiday', duration: '3 days' },
    { id: 2, name: 'Easter Holiday', date: '2024-03-29', type: 'School Holiday', duration: '5 days' },
    { id: 3, name: 'Dragon Boat Festival', date: '2024-06-10', type: 'Public Holiday', duration: '1 day' },
    { id: 4, name: 'Summer Break', date: '2024-07-15', type: 'School Holiday', duration: '14 days' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Terms & Holidays</h1>
          <p className="text-gray-600 mt-2">Manage academic terms and holiday schedules</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Holiday
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Term
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Terms', value: '1', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Upcoming Terms', value: '2', icon: Sun, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Total Holidays', value: '4', icon: Umbrella, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Holiday Days', value: '23', icon: Calendar, color: 'text-orange-600', bg: 'bg-orange-50' }
        ].map((stat, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`${stat.bg} p-3 rounded-lg`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Terms Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Academic Terms
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {terms.map((term, idx) => (
              <motion.div key={term.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                    {term.weeks}w
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{term.name}</h4>
                    <p className="text-sm text-gray-600">{term.startDate} to {term.endDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={term.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                    {term.status}
                  </Badge>
                  <Button variant="ghost" size="sm"><Edit className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" className="text-red-600"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Holidays Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Umbrella className="w-5 h-5 text-purple-600" />
            Holidays & Breaks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {holidays.map((holiday, idx) => (
              <motion.div key={holiday.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{holiday.name}</h4>
                  <Badge variant="outline">{holiday.type}</Badge>
                </div>
                <p className="text-sm text-gray-600">{holiday.date}</p>
                <p className="text-xs text-gray-500 mt-1">Duration: {holiday.duration}</p>
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm" className="flex-1"><Edit className="w-3 h-3 mr-1" />Edit</Button>
                  <Button variant="outline" size="sm" className="text-red-600"><Trash2 className="w-3 h-3" /></Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
