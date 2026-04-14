'use client'

import { useState, useEffect } from 'react'
import programService from '@/services/modules/program.service'
import Link from 'next/link'
import { toast } from 'sonner'
import { RefreshCw } from 'lucide-react'

interface Program {
    id: string
    _id?: string
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
            const data = await programService.getAllPrograms()
            setPrograms(Array.isArray(data) ? data : [])
        } catch (error: any) {
            console.error('Failed to load programs:', error)
            if (error?.response?.status !== 404) {
                toast.error('Failed to load programs')
            }
            setPrograms([])
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this program?')) return
        try {
            await programService.deleteProgram(id)
            toast.success('Program deleted successfully')
            loadPrograms()
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to delete program')
        }
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Programs</h1>
                <div className="flex items-center gap-3">
                    <button onClick={() => loadPrograms()} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <Link id="admin-programs-nav-admin-programs-catalog"
                        href="/admin/programs/catalog"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Manage Catalog
                    </Link>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12">Loading...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {programs.map((program) => (
                        <div key={program.id || program._id} className="bg-white rounded-lg shadow p-6">
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
                                <Link id="admin-programs-nav-edit"
                                    href={`/admin/programs/${program.id || program._id}`}
                                    className="flex-1 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 text-center"
                                >
                                    Edit
                                </Link>
                                <button id="admin-programs-btn"
                                    onClick={() => handleDelete(program.id || program._id || '')}
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
