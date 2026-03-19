'use client'

import { useState, useEffect } from 'react'
import ProgramService from '@/services/modules/program.service'

export default function ProgramSchedulePage() {
  const [schedules, setSchedules] = useState([])
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [schedulesData, programsData] = await Promise.all([
        ProgramService.getAllSchedules(),
        ProgramService.getAllPrograms()
      ])
      setSchedules(schedulesData)
      setPrograms(programsData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Program Schedule</h1>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <p className="text-gray-600">Schedule management interface coming soon...</p>
          </div>
        </div>
      )}
    </div>
  )
}
