'use client';

import { useState, useEffect } from 'react';
import { staffApi } from '@/lib/api/staff';
import StaffCard from './StaffCard';
import type { Staff, StaffFilters } from '@/types/staff';
import { toast } from 'sonner';
import Link from 'next/link';

export default function StaffList() {
    const [staff, setStaff] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<StaffFilters>({
        page: 1,
        limit: 20,
        sortBy: 'name',
        sortOrder: 'asc',
    });
    const [total, setTotal] = useState(0);

    useEffect(() => {
        loadStaff();
    }, [filters]);

    const loadStaff = async () => {
        try {
            setLoading(true);
            const result = await staffApi.getAll(filters);
            setStaff(result.staff);
            setTotal(result.total);
        } catch (error) {
            toast.error('Failed to load staff');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input
                        type="text"
                        placeholder="Search staff..."
                        onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <select
                        value={filters.role || ''}
                        onChange={(e) => setFilters({ ...filters, role: e.target.value, page: 1 })}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">All Roles</option>
                        <option value="instructor">Instructor</option>
                        <option value="coach">Coach</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                        <option value="support">Support</option>
                    </select>
                    <select
                        value={filters.status || ''}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="on-leave">On Leave</option>
                    </select>
                </div>
            </div>

            {/* Staff Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {staff.map((member) => (
                    <StaffCard key={member.id} staff={member} onUpdate={loadStaff} />
                ))}
            </div>

            {staff.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No staff found</h3>
                    <p className="text-gray-600 mb-4">Get started by adding your first staff member</p>
                    <Link href="/staff/add">
                        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            Add Staff Member
                        </button>
                    </Link>
                </div>
            )}
        </div>
    );
}
