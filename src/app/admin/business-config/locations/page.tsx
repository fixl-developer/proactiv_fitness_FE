'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, DoorOpen, Users, BarChart3, ChevronDown, ChevronUp, Plus,
  Search, Edit2, Settings, Dumbbell, Waves, LayoutGrid, Monitor
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface Room {
  id: string
  name: string
  type: 'Studio' | 'Pool' | 'Gym' | 'Consultation' | 'Flex'
  capacity: number
  equipment: string[]
  status: 'Available' | 'In Use' | 'Maintenance'
}

interface Location {
  id: string
  name: string
  address: string
  rooms: Room[]
  totalCapacity: number
  utilization: number
  status: 'Active' | 'Inactive'
}

const roomTypeIcons: Record<string, React.ReactNode> = {
  Studio: <LayoutGrid className="h-4 w-4" />,
  Pool: <Waves className="h-4 w-4" />,
  Gym: <Dumbbell className="h-4 w-4" />,
  Consultation: <Monitor className="h-4 w-4" />,
  Flex: <LayoutGrid className="h-4 w-4" />,
}

const roomStatusColors: Record<string, string> = {
  'Available': 'bg-green-100 text-green-700',
  'In Use': 'bg-blue-100 text-blue-700',
  'Maintenance': 'bg-orange-100 text-orange-700',
}

const initialLocations: Location[] = [
  {
    id: '1',
    name: 'ProGym Cyberport',
    address: 'Level 3, Cyberport 2, 100 Cyberport Road, Pok Fu Lam',
    totalCapacity: 50,
    utilization: 78,
    status: 'Active',
    rooms: [
      { id: 'r1', name: 'Main Studio', type: 'Studio', capacity: 30, equipment: ['Sound System', 'Mirrors', 'Ballet Barres', 'Yoga Mats'], status: 'Available' },
      { id: 'r2', name: 'Small Studio', type: 'Studio', capacity: 15, equipment: ['Sound System', 'Mirrors', 'Resistance Bands'], status: 'In Use' },
      { id: 'r3', name: 'Consultation Room', type: 'Consultation', capacity: 5, equipment: ['InBody Scanner', 'Desk', 'Monitor'], status: 'Available' },
    ],
  },
  {
    id: '2',
    name: 'ProGym Wan Chai',
    address: '12/F, Tower 1, Times Square, 1 Matheson Street, Wan Chai',
    totalCapacity: 60,
    utilization: 85,
    status: 'Active',
    rooms: [
      { id: 'r4', name: 'Training Hall', type: 'Gym', capacity: 40, equipment: ['Free Weights', 'Power Racks', 'Cardio Machines', 'Cable Station'], status: 'In Use' },
      { id: 'r5', name: 'Flex Room', type: 'Flex', capacity: 20, equipment: ['Portable Equipment', 'Sound System', 'Projector'], status: 'Available' },
    ],
  },
  {
    id: '3',
    name: 'ProGym Central',
    address: '25/F, One Exchange Square, 8 Connaught Place, Central',
    totalCapacity: 45,
    utilization: 62,
    status: 'Active',
    rooms: [
      { id: 'r6', name: 'Executive Gym', type: 'Gym', capacity: 25, equipment: ['Premium Machines', 'Free Weights', 'Stretching Area'], status: 'Available' },
      { id: 'r7', name: 'Yoga Studio', type: 'Studio', capacity: 20, equipment: ['Yoga Props', 'Sound System', 'Heated Floors'], status: 'Maintenance' },
    ],
  },
  {
    id: '4',
    name: 'ProGym Discovery Bay',
    address: 'G/F, DB Plaza, Discovery Bay, Lantau Island',
    totalCapacity: 35,
    utilization: 40,
    status: 'Inactive',
    rooms: [
      { id: 'r8', name: 'Community Studio', type: 'Studio', capacity: 20, equipment: ['Sound System', 'Mirrors'], status: 'Maintenance' },
      { id: 'r9', name: 'Kids Area', type: 'Flex', capacity: 15, equipment: ['Soft Mats', 'Mini Equipment'], status: 'Maintenance' },
    ],
  },
]

export default function LocationsPage() {
  const [locations] = useState<Location[]>(initialLocations)
  const [expandedId, setExpandedId] = useState<string | null>('1')
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = locations.filter((l) => l.name.toLowerCase().includes(searchQuery.toLowerCase()) || l.address.toLowerCase().includes(searchQuery.toLowerCase()))

  const totalLocations = locations.length
  const totalRooms = locations.reduce((sum, l) => sum + l.rooms.length, 0)
  const activeRooms = locations.reduce((sum, l) => sum + l.rooms.filter((r) => r.status !== 'Maintenance').length, 0)
  const totalCapacity = locations.reduce((sum, l) => sum + l.totalCapacity, 0)
  const avgOccupancy = Math.round(locations.reduce((sum, l) => sum + l.utilization, 0) / locations.length)

  const statsData = [
    { title: 'Total Locations', value: totalLocations.toString(), icon: MapPin, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { title: 'Active Rooms', value: `${activeRooms}/${totalRooms}`, icon: DoorOpen, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
    { title: 'Total Capacity', value: totalCapacity.toString(), icon: Users, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { title: 'Avg Occupancy', value: `${avgOccupancy}%`, icon: BarChart3, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Locations & Rooms</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage physical locations, rooms, and capacity</p>
          </div>
          <Button><Plus className="h-4 w-4 mr-2" /> Add Location</Button>
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

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search locations or addresses..."
          className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white" />
      </div>

      {/* Location Cards */}
      <div className="space-y-4">
        {filtered.map((location, i) => {
          const isExpanded = expandedId === location.id
          return (
            <motion.div key={location.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className={`overflow-hidden transition-shadow ${isExpanded ? 'shadow-md ring-1 ring-blue-200 dark:ring-blue-800' : ''}`}>
                <div
                  className="p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/30"
                  onClick={() => setExpandedId(isExpanded ? null : location.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{location.name}</h3>
                        <Badge className={location.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}>
                          {location.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {location.address}
                      </p>
                      <div className="flex items-center gap-6 mt-3">
                        <div className="text-sm">
                          <span className="text-gray-500">Rooms: </span>
                          <span className="font-medium text-gray-900 dark:text-white">{location.rooms.length}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500">Capacity: </span>
                          <span className="font-medium text-gray-900 dark:text-white">{location.totalCapacity}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-1 max-w-[200px]">
                          <span className="text-sm text-gray-500">Utilization:</span>
                          <Progress value={location.utilization} className="h-2 flex-1" />
                          <span className={`text-sm font-medium ${location.utilization >= 75 ? 'text-green-600' : location.utilization >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>
                            {location.utilization}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation() }}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 border-t dark:border-gray-700">
                        <div className="flex items-center justify-between mt-4 mb-3">
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <DoorOpen className="h-4 w-4" /> Rooms ({location.rooms.length})
                          </h4>
                          <Button variant="outline" size="sm"><Plus className="h-3 w-3 mr-1" /> Add Room</Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {location.rooms.map((room) => (
                            <motion.div
                              key={room.id}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="border dark:border-gray-700 rounded-lg p-4 hover:shadow-sm transition-shadow bg-white dark:bg-gray-800/50"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                    {roomTypeIcons[room.type]}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{room.name}</p>
                                    <p className="text-xs text-gray-500">{room.type}</p>
                                  </div>
                                </div>
                                <Badge className={roomStatusColors[room.status]}>{room.status}</Badge>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                                <Users className="h-3 w-3" /> Capacity: <span className="font-medium text-gray-700 dark:text-gray-300">{room.capacity}</span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {room.equipment.map((eq) => (
                                  <span key={eq} className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                                    {eq}
                                  </span>
                                ))}
                              </div>
                              <div className="mt-3 flex gap-2">
                                <Button variant="outline" size="sm" className="flex-1 text-xs h-7">
                                  <Edit2 className="h-3 w-3 mr-1" /> Edit
                                </Button>
                                <Button variant="outline" size="sm" className="flex-1 text-xs h-7">
                                  <Settings className="h-3 w-3 mr-1" /> Configure
                                </Button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>No locations found matching your search.</p>
        </div>
      )}
    </div>
  )
}
