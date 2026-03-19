'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Plus, Edit, Trash2, Search, Users, Calendar, DoorOpen } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function LocationsRoomsPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const locations = [
    {
      id: 1,
      name: 'Cyberport Studio',
      address: '100 Cyberport Road, Hong Kong',
      rooms: 3,
      capacity: 60,
      activeClasses: 12,
      status: 'active'
    },
    {
      id: 2,
      name: 'Wan Chai Center',
      address: '88 Gloucester Road, Wan Chai',
      rooms: 2,
      capacity: 40,
      activeClasses: 8,
      status: 'active'
    },
    {
      id: 3,
      name: 'Causeway Bay Hub',
      address: '500 Hennessy Road, Causeway Bay',
      rooms: 4,
      capacity: 80,
      activeClasses: 15,
      status: 'active'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Locations & Rooms</h1>
          <p className="text-gray-600 mt-2">Manage physical locations and room configurations</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Location
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Locations', value: '3', icon: MapPin, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Rooms', value: '9', icon: DoorOpen, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Total Capacity', value: '180', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Active Classes', value: '35', icon: Calendar, color: 'text-orange-600', bg: 'bg-orange-50' }
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

      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {locations.map((location, idx) => (
          <motion.div key={location.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{location.name}</CardTitle>
                      <p className="text-sm text-gray-500">{location.address}</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">{location.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-blue-50 rounded-lg text-center">
                      <DoorOpen className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                      <p className="text-xs text-gray-600">Rooms</p>
                      <p className="text-sm font-bold text-gray-900">{location.rooms}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg text-center">
                      <Users className="w-4 h-4 text-green-600 mx-auto mb-1" />
                      <p className="text-xs text-gray-600">Capacity</p>
                      <p className="text-sm font-bold text-gray-900">{location.capacity}</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg text-center">
                      <Calendar className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                      <p className="text-xs text-gray-600">Classes</p>
                      <p className="text-sm font-bold text-gray-900">{location.activeClasses}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" className="text-red-600 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
