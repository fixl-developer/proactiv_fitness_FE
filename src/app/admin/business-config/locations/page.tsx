'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/services/api/client'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { MapPin, Plus, Edit, Trash2, Search, Users, Calendar, DoorOpen, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

interface Room {
  id: string
  name: string
  locationId: string
  type: string
  capacity: number
  createdAt?: string
}

interface Location {
  id: string
  name: string
  address: string
  businessUnitId: string
  status: string
  rooms?: Room[]
  createdAt?: string
}

interface BusinessUnit {
  id: string
  name: string
}

export default function LocationsRoomsPage() {
  const [locations, setLocations] = useState<Location[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedLocations, setExpandedLocations] = useState<Set<string>>(new Set())

  // Location form
  const [showLocationForm, setShowLocationForm] = useState(false)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  const [locationForm, setLocationForm] = useState({ name: '', address: '', businessUnitId: '', status: 'active' })
  const [savingLocation, setSavingLocation] = useState(false)

  // Room form
  const [showRoomForm, setShowRoomForm] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [roomForm, setRoomForm] = useState({ name: '', locationId: '', type: 'studio', capacity: 20 })
  const [savingRoom, setSavingRoom] = useState(false)

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'location' | 'room'; id: string; name: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [locData, roomData, buData] = await Promise.all([
        apiClient.get<any>('/locations'),
        apiClient.get<any>('/rooms'),
        apiClient.get<any>('/business-units'),
      ])
      setLocations(Array.isArray(locData) ? locData : locData?.data || [])
      setRooms(Array.isArray(roomData) ? roomData : roomData?.data || [])
      setBusinessUnits(Array.isArray(buData) ? buData : buData?.data || [])
    } catch (error: any) {
      console.error('Failed to load data:', error)
      toast.error('Failed to load locations and rooms')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const toggleExpand = (locationId: string) => {
    setExpandedLocations((prev) => {
      const next = new Set(prev)
      if (next.has(locationId)) {
        next.delete(locationId)
      } else {
        next.add(locationId)
      }
      return next
    })
  }

  const getRoomsForLocation = (locationId: string) => rooms.filter((r) => r.locationId === locationId)

  // Location CRUD
  const openLocationForm = (location?: Location) => {
    if (location) {
      setEditingLocation(location)
      setLocationForm({
        name: location.name,
        address: location.address,
        businessUnitId: location.businessUnitId || '',
        status: location.status,
      })
    } else {
      setEditingLocation(null)
      setLocationForm({ name: '', address: '', businessUnitId: businessUnits[0]?.id || '', status: 'active' })
    }
    setShowLocationForm(true)
  }

  const handleLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingLocation(true)
    try {
      if (editingLocation) {
        await apiClient.put(`/locations/${editingLocation.id}`, locationForm)
        toast.success('Location updated successfully')
      } else {
        await apiClient.post('/locations', locationForm)
        toast.success('Location created successfully')
      }
      setShowLocationForm(false)
      setEditingLocation(null)
      loadData()
    } catch (error: any) {
      toast.error(editingLocation ? 'Failed to update location' : 'Failed to create location')
    } finally {
      setSavingLocation(false)
    }
  }

  // Room CRUD
  const openRoomForm = (room?: Room, presetLocationId?: string) => {
    if (room) {
      setEditingRoom(room)
      setRoomForm({
        name: room.name,
        locationId: room.locationId,
        type: room.type,
        capacity: room.capacity,
      })
    } else {
      setEditingRoom(null)
      setRoomForm({
        name: '',
        locationId: presetLocationId || locations[0]?.id || '',
        type: 'studio',
        capacity: 20,
      })
    }
    setShowRoomForm(true)
  }

  const handleRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingRoom(true)
    try {
      if (editingRoom) {
        await apiClient.put(`/rooms/${editingRoom.id}`, roomForm)
        toast.success('Room updated successfully')
      } else {
        await apiClient.post('/rooms', roomForm)
        toast.success('Room created successfully')
      }
      setShowRoomForm(false)
      setEditingRoom(null)
      loadData()
    } catch (error: any) {
      toast.error(editingRoom ? 'Failed to update room' : 'Failed to create room')
    } finally {
      setSavingRoom(false)
    }
  }

  // Delete
  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      if (deleteTarget.type === 'location') {
        await apiClient.delete(`/locations/${deleteTarget.id}`)
        toast.success('Location deleted successfully')
      } else {
        await apiClient.delete(`/rooms/${deleteTarget.id}`)
        toast.success('Room deleted successfully')
      }
      setDeleteTarget(null)
      loadData()
    } catch (error: any) {
      toast.error(`Failed to delete ${deleteTarget.type}`)
    } finally {
      setDeleting(false)
    }
  }

  const filteredLocations = locations.filter(
    (loc) =>
      loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.address.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalRooms = rooms.length
  const totalCapacity = rooms.reduce((sum, r) => sum + (r.capacity || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Locations & Rooms</h1>
          <p className="text-gray-600 mt-2">Manage physical locations and room configurations</p>
        </div>
        <div className="flex gap-2">
          <Button data-testid="btn-open-room-form-admin-business-config-locations" variant="outline" onClick={() => openRoomForm()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Room
          </Button>
          <Button data-testid="btn-open-location-form-admin-business-config-locations" onClick={() => openLocationForm()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Location
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Locations', value: locations.length.toString(), icon: MapPin, gradient: 'from-blue-500 to-blue-600', bgGradient: 'from-blue-50 to-blue-100' },
          { label: 'Total Rooms', value: totalRooms.toString(), icon: DoorOpen, gradient: 'from-green-500 to-emerald-600', bgGradient: 'from-green-50 to-emerald-100' },
          { label: 'Total Capacity', value: totalCapacity.toString(), icon: Users, gradient: 'from-purple-500 to-purple-600', bgGradient: 'from-purple-50 to-purple-100' },
          { label: 'Active Locations', value: locations.filter((l) => l.status === 'active').length.toString(), icon: Calendar, gradient: 'from-orange-500 to-orange-600', bgGradient: 'from-orange-50 to-orange-100' },
        ].map((stat, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
            <div className={`rounded-lg border-0 bg-gradient-to-br ${stat.bgGradient} p-4 hover:shadow-lg transition-all`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`bg-gradient-to-br ${stat.gradient} p-2.5 rounded-lg shadow-md`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-xs text-gray-600 font-medium mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input data-testid="input-text-admin-business-config-locations"
              type="text"
              placeholder="Search locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Location Cards */}
      {loading ? (
        <Card>
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-500">Loading locations...</p>
            </div>
          </CardContent>
        </Card>
      ) : filteredLocations.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No locations found</p>
              <p className="text-gray-400 mt-1">
                {searchTerm ? 'Try a different search term' : 'Add your first location to get started'}
              </p>
              {!searchTerm && (
                <Button data-testid="btn-open-location-form-admin-business-config-locations" className="mt-4" onClick={() => openLocationForm()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Location
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredLocations.map((location, idx) => {
            const locationRooms = getRoomsForLocation(location.id)
            const isExpanded = expandedLocations.has(location.id)
            const locationCapacity = locationRooms.reduce((sum, r) => sum + (r.capacity || 0), 0)

            return (
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
                      <Badge className={location.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {location.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 bg-blue-50 rounded-lg text-center">
                          <DoorOpen className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                          <p className="text-xs text-gray-600">Rooms</p>
                          <p className="text-sm font-bold text-gray-900">{locationRooms.length}</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg text-center">
                          <Users className="w-4 h-4 text-green-600 mx-auto mb-1" />
                          <p className="text-xs text-gray-600">Capacity</p>
                          <p className="text-sm font-bold text-gray-900">{locationCapacity}</p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg text-center">
                          <Calendar className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                          <p className="text-xs text-gray-600">Status</p>
                          <p className="text-sm font-bold text-gray-900 capitalize">{location.status}</p>
                        </div>
                      </div>

                      {/* Expandable Rooms */}
                      {locationRooms.length > 0 && (
                        <div>
                          <button data-testid="btn-admin-business-config-locations-10"
                            onClick={() => toggleExpand(location.id)}
                            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium w-full"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            {isExpanded ? 'Hide' : 'Show'} Rooms ({locationRooms.length})
                          </button>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="mt-3 space-y-2"
                            >
                              {locationRooms.map((room) => (
                                <div
                                  key={room.id}
                                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                  <div>
                                    <p className="font-medium text-sm text-gray-900">{room.name}</p>
                                    <p className="text-xs text-gray-500">
                                      {room.type} - Capacity: {room.capacity}
                                    </p>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button data-testid="btn-open-room-form-admin-business-config-locations" variant="ghost" size="sm" onClick={() => openRoomForm(room)}>
                                      <Edit className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-600"
                                      onClick={() => setDeleteTarget({ type: 'room', id: room.id, name: room.name })}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full mt-2"
                                onClick={() => openRoomForm(undefined, location.id)}
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Add Room to {location.name}
                              </Button>
                            </motion.div>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button data-testid="btn-open-location-form-admin-business-config-locations" variant="outline" className="flex-1" onClick={() => openLocationForm(location)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => setDeleteTarget({ type: 'location', id: location.id, name: location.name })}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Location Form Dialog */}
      <Dialog open={showLocationForm} onOpenChange={setShowLocationForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingLocation ? 'Edit Location' : 'Add Location'}</DialogTitle>
            <DialogDescription>
              {editingLocation ? 'Update the location details below.' : 'Fill in the details to create a new location.'}
            </DialogDescription>
          </DialogHeader>
          <form data-testid="form-admin-business-config-locations" onSubmit={handleLocationSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Location Name</label>
              <input data-testid="input-text-admin-business-config-locations"
                type="text"
                value={locationForm.name}
                onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="e.g. Cyberport Studio"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Address</label>
              <input data-testid="input-text-admin-business-config-locations"
                type="text"
                value={locationForm.address}
                onChange={(e) => setLocationForm({ ...locationForm, address: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="e.g. 100 Cyberport Road, Hong Kong"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Business Unit</label>
              {businessUnits.length === 0 ? (
                <p className="text-sm text-gray-500">No business units available.</p>
              ) : (
                <select data-testid="select-admin-business-config-locations-16"
                  value={locationForm.businessUnitId}
                  onChange={(e) => setLocationForm({ ...locationForm, businessUnitId: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select a business unit</option>
                  {businessUnits.map((bu) => (
                    <option key={bu.id} value={bu.id}>
                      {bu.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select data-testid="select-admin-business-config-locations-17"
                value={locationForm.status}
                onChange={(e) => setLocationForm({ ...locationForm, status: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <DialogFooter>
              <Button data-testid="btn-set-show-location-form-admin-business-config-locations" type="button" variant="outline" onClick={() => setShowLocationForm(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={savingLocation}>
                {savingLocation && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingLocation ? 'Update Location' : 'Create Location'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Room Form Dialog */}
      <Dialog open={showRoomForm} onOpenChange={setShowRoomForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRoom ? 'Edit Room' : 'Add Room'}</DialogTitle>
            <DialogDescription>
              {editingRoom ? 'Update the room details below.' : 'Fill in the details to create a new room.'}
            </DialogDescription>
          </DialogHeader>
          <form data-testid="form-admin-business-config-locations" onSubmit={handleRoomSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Room Name</label>
              <input data-testid="input-text-admin-business-config-locations"
                type="text"
                value={roomForm.name}
                onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="e.g. Studio A"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              {locations.length === 0 ? (
                <p className="text-sm text-gray-500">No locations available. Please create a location first.</p>
              ) : (
                <select data-testid="select-admin-business-config-locations-18"
                  value={roomForm.locationId}
                  onChange={(e) => setRoomForm({ ...roomForm, locationId: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:border-blue-500 focus:outline-none"
                  required
                >
                  <option value="">Select a location</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Room Type</label>
              <select data-testid="select-admin-business-config-locations-19"
                value={roomForm.type}
                onChange={(e) => setRoomForm({ ...roomForm, type: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="studio">Studio</option>
                <option value="gym">Gym</option>
                <option value="pool">Pool</option>
                <option value="outdoor">Outdoor</option>
                <option value="multipurpose">Multipurpose</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Capacity</label>
              <input data-testid="input-number-admin-business-config-locations"
                type="number"
                value={roomForm.capacity}
                onChange={(e) => setRoomForm({ ...roomForm, capacity: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border rounded-lg focus:border-blue-500 focus:outline-none"
                min={1}
                required
              />
            </div>
            <DialogFooter>
              <Button data-testid="btn-set-show-room-form-admin-business-config-locations" type="button" variant="outline" onClick={() => setShowRoomForm(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={savingRoom || locations.length === 0}>
                {savingRoom && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingRoom ? 'Update Room' : 'Create Room'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?
              {deleteTarget?.type === 'location' && ' All rooms in this location will also be affected.'}
              {' '}This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button data-testid="btn-set-delete-target-admin-business-config-locations" variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button data-testid="btn-delete-admin-business-config-locations" variant="destructive" onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700 text-white">
              {deleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
