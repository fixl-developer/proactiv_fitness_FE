'use client'

import { useState, useEffect } from 'react'
import ProgramService from '@/services/modules/program.service'

export default function ProgramCatalogPage() {
  const [programs, setPrograms] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'gymnastics',
    ageGroup: '',
    level: 'beginner',
    duration: 60,
    capacity: 15,
    price: 0,
    status: 'active'
  })

  useEffect(() => {
    loadPrograms()
  }, [])

  const loadPrograms = async () => {
    const data = await ProgramService.getAllPrograms()
    setPrograms(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await ProgramService.createProgram(formData)
    setShowForm(false)
    loadPrograms()
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Program Catalog</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'Create Program'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Program Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="gymnastics">Gymnastics</option>
                  <option value="tumbling">Tumbling</option>
                  <option value="ninja">Ninja</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Age Group</label>
                <input
                  type="text"
                  value={formData.ageGroup}
                  onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="e.g., 5-7"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Level</label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              Create Program
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
