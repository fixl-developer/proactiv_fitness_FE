'use client';

import { useState, useEffect } from 'react';
import { programsApi } from '@/lib/api/programs';
import ProgramCard from './ProgramCard';
import type { Program, ProgramFilters } from '@/types/program';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ProgramList() {
    const [programs, setPrograms] = useState<Program[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<ProgramFilters>({
        page: 1,
        limit: 20,
        sortBy: 'name',
        sortOrder: 'asc',
    });
    const [total, setTotal] = useState(0);

    useEffect(() => {
        loadPrograms();
    }, [filters]);

    const loadPrograms = async () => {
        try {
            setLoading(true);
            const result = await programsApi.getAll(filters);
            setPrograms(result.programs);
            setTotal(result.total);
        } catch (error) {
            toast.error('Failed to load programs');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (search: string) => {
        setFilters({ ...filters, search, page: 1 });
    };

    const handleFilterChange = (key: keyof ProgramFilters, value: any) => {
        setFilters({ ...filters, [key]: value, page: 1 });
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
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search programs..."
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <select
                        value={filters.type || ''}
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">All Types</option>
                        <option value="regular">Regular</option>
                        <option value="camp">Camp</option>
                        <option value="event">Event</option>
                        <option value="private">Private</option>
                        <option value="assessment">Assessment</option>
                        <option value="party">Party</option>
                    </select>
                    <select
                        value={filters.category || ''}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">All Categories</option>
                        <option value="gymnastics">Gymnastics</option>
                        <option value="multi-activity">Multi-Activity</option>
                        <option value="camps">Camps</option>
                        <option value="parties">Parties</option>
                        <option value="elite">Elite</option>
                    </select>
                    <select
                        value={filters.status || ''}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="archived">Archived</option>
                    </select>
                </div>
            </div>

            {/* Programs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {programs.map((program) => (
                    <ProgramCard key={program.id} program={program} onUpdate={loadPrograms} />
                ))}
            </div>

            {/* Pagination */}
            {total > (filters.limit || 20) && (
                <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-4">
                    <div className="text-sm text-gray-600">
                        Showing {((filters.page || 1) - 1) * (filters.limit || 20) + 1} to{' '}
                        {Math.min((filters.page || 1) * (filters.limit || 20), total)} of {total} programs
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
                            disabled={(filters.page || 1) === 1}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                            disabled={(filters.page || 1) * (filters.limit || 20) >= total}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {programs.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No programs found</h3>
                    <p className="text-gray-600 mb-4">Get started by creating your first program</p>
                    <Link href="/programs/add">
                        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            Add Program
                        </button>
                    </Link>
                </div>
            )}
        </div>
    );
}
