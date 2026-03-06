'use client';

import { useState, useEffect } from 'react';
import { studentsApi } from '@/lib/api/students';
import StudentCard from './StudentCard';
import type { Student, StudentFilters } from '@/types/student';
import { toast } from 'sonner';
import Link from 'next/link';

export default function StudentList() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<StudentFilters>({
        page: 1,
        limit: 20,
        sortBy: 'name',
        sortOrder: 'asc',
    });
    const [total, setTotal] = useState(0);

    useEffect(() => {
        loadStudents();
    }, [filters]);

    const loadStudents = async () => {
        try {
            setLoading(true);
            const result = await studentsApi.getAll(filters);
            setStudents(result.students);
            setTotal(result.total);
        } catch (error) {
            toast.error('Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (search: string) => {
        setFilters({ ...filters, search, page: 1 });
    };

    const handleFilterChange = (key: keyof StudentFilters, value: any) => {
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
                            placeholder="Search students..."
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <select
                        value={filters.status || ''}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                    </select>
                    <select
                        value={filters.skillLevel || ''}
                        onChange={(e) => handleFilterChange('skillLevel', e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">All Levels</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="elite">Elite</option>
                    </select>
                </div>
            </div>

            {/* Students Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {students.map((student) => (
                    <StudentCard key={student.id} student={student} onUpdate={loadStudents} />
                ))}
            </div>

            {/* Pagination */}
            {total > (filters.limit || 20) && (
                <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-4">
                    <div className="text-sm text-gray-600">
                        Showing {((filters.page || 1) - 1) * (filters.limit || 20) + 1} to{' '}
                        {Math.min((filters.page || 1) * (filters.limit || 20), total)} of {total} students
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

            {students.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No students found</h3>
                    <p className="text-gray-600 mb-4">Get started by adding your first student</p>
                    <Link href="/students/add">
                        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            Add Student
                        </button>
                    </Link>
                </div>
            )}
        </div>
    );
}
