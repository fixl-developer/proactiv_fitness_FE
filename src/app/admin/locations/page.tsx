'use client'

import React, { useEffect, useState } from 'react'

interface Location {
    id: string
    name: string
    address: string
    phone: string
    email: string
    manager: string
    capacity: number
    currentStudents: number
    facilities: string[]
    operatingHours: {
        weekdays: string
        weekends: string
    }
    status: 'active' | 'maintenance' | 'closed'
    monthlyRevenue: number
    utilization: number
}

const LocationsPage = () => {
    const [locations, setLocations] = useState<Location[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        setTimeout(() => {
            setLocations([
                {
                    id: '1',
                    name: 'Cyberport Center',
                    address: 'Shop 315, Level 3, Cyberport 1, 100 Cyberport Road, Hong Kong',
                    phone: '+852 2234 5678',
                    email: 'cyberport@proactivsports.net',
                    manager: 'Sarah Johnson',
                    capacity: 120,
                    currentStudents: 89,
                    facilities: ['Gymnastics Floor', 'Tumbling Area', 'Beam Section', 'Vault Area', 'Reception'],
                    operatingHours: {
                        weekdays: '9:00 AM - 8:00 PM',
                        weekends: '9:00 AM - 6:00 PM'
                    },
                    status: 'active',
                    monthlyRevenue: 72000,
                    utilization: 85
                },
                {
                    id: '2',
                    name: 'Wan Chai Center',
                    address: '15/F, Southorn Centre, 130 Hennessy Road, Wan Chai, Hong Kong',
                    phone: '+852 2345 6789',
                    email: 'wanchai@proactivsports.net',
                    manager: 'Mike Chen',
                    capacity: 100,
                    currentStudents: 67,
                    facilities: ['Main Gym Floor', 'Training Area', 'Equipment Storage', 'Parent Lounge'],
                    operatingHours: {
                        weekdays: '10:00 AM - 9:00 PM',
                        weekends: '10:00 AM - 7:00 PM'
                    },
                    status: 'active',
                    monthlyRevenue: 58000,
                    utilization: 72
                }
            ])
            setIsLoading(false)
        }, 500)
    }, [])

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800'
            case 'maintenance':
                return 'bg-yellow-100 text-yellow-800'
            case 'closed':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Locations Management</h1>
                    <p className="text-gray-600 mt-2">Manage all fitness centers and facilities</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2">
                    <span>+</span>
                    Add Location
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">{locations.length}</div>
                        <div className="text-sm text-gray-600 mt-2">Total Locations</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">
                            {locations.reduce((sum, loc) => sum + loc.currentStudents, 0)}
                        </div>
                        <div className="text-sm text-gray-600 mt-2">Total Students</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600">
                            {locations.reduce((sum, loc) => sum + loc.capacity, 0)}
                        </div>
                        <div className="text-sm text-gray-600 mt-2">Total Capacity</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-orange-600">
                            HKD {(locations.reduce((sum, loc) => sum + loc.monthlyRevenue, 0) / 1000).toFixed(0)}K
                        </div>
                        <div className="text-sm text-gray-600 mt-2">Monthly Revenue</div>
                    </div>
                </div>
            </div>

            {/* Locations Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {locations.map((location) => (
                    <div key={location.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold">{location.name}</h3>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-gray-500">📍</span>
                                        <p className="text-sm text-gray-600">{location.address}</p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(location.status)}`}>
                                    {location.status.charAt(0).toUpperCase() + location.status.slice(1)}
                                </span>
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-gray-500">📞</span>
                                    <span>{location.phone}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-gray-500">✉️</span>
                                    <span>{location.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-gray-500">👤</span>
                                    <span>Manager: {location.manager}</span>
                                </div>
                            </div>

                            {/* Operating Hours */}
                            <div className="bg-gray-50 p-3 rounded-lg mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-gray-600">🕒</span>
                                    <span className="font-medium text-sm">Operating Hours</span>
                                </div>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <div>Weekdays: {location.operatingHours.weekdays}</div>
                                    <div>Weekends: {location.operatingHours.weekends}</div>
                                </div>
                            </div>

                            {/* Facilities */}
                            <div className="mb-4">
                                <p className="font-medium text-sm mb-2">Facilities</p>
                                <div className="flex flex-wrap gap-2">
                                    {location.facilities.map((facility, idx) => (
                                        <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                            {facility}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Capacity & Revenue */}
                            <div className="grid grid-cols-3 gap-4 pt-4 border-t mb-4">
                                <div>
                                    <p className="text-xs text-gray-600">Capacity</p>
                                    <p className="text-lg font-bold text-gray-900">{location.capacity}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">Current</p>
                                    <p className="text-lg font-bold text-green-600">{location.currentStudents}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">Utilization</p>
                                    <p className="text-lg font-bold text-blue-600">{location.utilization}%</p>
                                </div>
                            </div>

                            {/* Monthly Revenue */}
                            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-3 rounded-lg mb-4">
                                <p className="text-xs text-gray-600">Monthly Revenue</p>
                                <p className="text-2xl font-bold text-orange-600">HKD {location.monthlyRevenue.toLocaleString()}</p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 flex items-center justify-center gap-2">
                                    <span>👁️</span>
                                    View Details
                                </button>
                                <button className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 flex items-center justify-center gap-2">
                                    <span>✏️</span>
                                    Edit
                                </button>
                                <button className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 flex items-center justify-center gap-2">
                                    <span>⚙️</span>
                                    Settings
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default LocationsPage