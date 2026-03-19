'use client'

import Link from 'next/link'

export default function StaffPage() {
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Staff Management</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/admin/staff/coaches" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                    <h3 className="text-lg font-semibold mb-2">Coaches</h3>
                    <p className="text-gray-600">Manage coach profiles and assignments</p>
                </Link>
                <Link href="/admin/staff/performance" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                    <h3 className="text-lg font-semibold mb-2">Performance</h3>
                    <p className="text-gray-600">View staff performance metrics</p>
                </Link>
                <Link href="/admin/staff/utilization" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                    <h3 className="text-lg font-semibold mb-2">Utilization</h3>
                    <p className="text-gray-600">Track staff utilization rates</p>
                </Link>
            </div>
        </div>
    )
}
