'use client'

import { useState, useEffect } from 'react'
import ProgramService from '@/services/modules/program.service'
import Link from 'next/link'

interface Program {
    id: string
    name: string
    category: string
    ageGroup: string
    level: string
    duration: number
    capacity: number
    price: number
    status: string
}

export default function ProgramsPage() {
    const [programs, setPrograms] = useState<Program[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadPrograms()
    }, [])

    const loadPrograms = async () => {
        try {
            setLoading(true)
            const data = await ProgramService.getAllPrograms()
            setPrograms(data)
        } catch (error) {
            console.error('Failed to load programs:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return
        try {
            await ProgramService.deleteProgram(id)
            loadPrograms()
        } catch (error) {
            console.error('Failed to delete program:', error)
        }
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Programs</h1>
                <Link
                    href="/admin/programs/catalog"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    Manage Catalog
                </Link>
            </div>

            {loading ? (
                <div className="text-center py-12">Loading...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {programs.map((program) => (
                        <div key={program.id} className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold mb-2">{program.name}</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p>Category: {program.category}</p>
                                <p>Age Group: {program.ageGroup}</p>
                                <p>Level: {program.level}</p>
                                <p>Duration: {program.duration} mins</p>
                                <p>Capacity: {program.capacity} students</p>
                                <p className="text-lg font-bold text-blue-600">${program.price}</p>
                            </div>
                            <div className="mt-4 flex gap-2">
                                <Link
                                    href={`/admin/programs/${program.id}`}
                                    className="flex-1 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 text-center"
                                >
                                    Edit
                                </Link>
                                <button
                                    onClick={() => handleDelete(program.id)}
                                    className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
