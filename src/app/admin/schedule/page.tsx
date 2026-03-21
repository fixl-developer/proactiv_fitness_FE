'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function SchedulePage() {
    const [view, setView] = useState<'week' | 'month'>('week')

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Schedule Management</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => setView('week')}
                        className={`px-4 py-2 rounded-lg ${view === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    >
                        Week
                    </button>
                    <button
                        onClick={() => setView('month')}
                        className={`px-4 py-2 rounded-lg ${view === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    >
                        Month
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Link data-testid="link-admin-schedule-classes" href="/admin/schedule/classes" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                    <h3 className="text-lg font-semibold mb-2">Classes</h3>
                    <p className="text-gray-600">Manage class schedules</p>
                </Link>
                <Link data-testid="link-admin-schedule-assign-coaches" href="/admin/schedule/assign-coaches" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                    <h3 className="text-lg font-semibold mb-2">Assign Coaches</h3>
                    <p className="text-gray-600">Assign coaches to classes</p>
                </Link>
                <Link data-testid="link-admin-schedule-assign-rooms" href="/admin/schedule/assign-rooms" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                    <h3 className="text-lg font-semibold mb-2">Assign Rooms</h3>
                    <p className="text-gray-600">Assign rooms to classes</p>
                </Link>
                <Link data-testid="link-admin-schedule-conflicts" href="/admin/schedule/conflicts" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                    <h3 className="text-lg font-semibold mb-2">Conflicts</h3>
                    <p className="text-gray-600">View scheduling conflicts</p>
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center text-gray-600">
                    Calendar view will be displayed here
                </div>
            </div>
        </div>
    )
}
