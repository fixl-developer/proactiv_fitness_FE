'use client'

import { useState, useEffect } from 'react'
import OperationsService from '@/services/modules/operations.service'

export default function OperationsBookingsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBookings()
  }, [])

  const loadBookings = async () => {
    try {
      const data = await OperationsService.getAllBookings()
      setBookings(data)
    } catch (error) {
      console.error('Failed to load bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Bookings Management</h1>
      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Bookings list will be displayed here</p>
        </div>
      )}
    </div>
  )
}
