'use client'

import { useState, useEffect } from 'react'
import ProgramService from '@/services/modules/program.service'

export default function ProgramRulesPage() {
  const [rules, setRules] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRules()
  }, [])

  const loadRules = async () => {
    try {
      const data = await ProgramService.getAllRules()
      setRules(data)
    } catch (error) {
      console.error('Failed to load rules:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Program Rules</h1>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Rules engine interface coming soon...</p>
        </div>
      )}
    </div>
  )
}
