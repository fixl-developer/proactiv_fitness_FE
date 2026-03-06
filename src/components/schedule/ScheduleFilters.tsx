'use client';

import type { ScheduleFilters } from '@/types/schedule';

interface ScheduleFiltersProps {
    filters: ScheduleFilters;
    onChange: (filters: ScheduleFilters) => void;
}

export default function ScheduleFilters({ filters, onChange }: ScheduleFiltersProps) {
    return (
        <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
                    <select
                        value={filters.programId || ''}
                        onChange={(e) => onChange({ ...filters, programId: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">All Programs</option>
                        {/* Programs will be loaded dynamically */}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <select
                        value={filters.locationId || ''}
                        onChange={(e) => onChange({ ...filters, locationId: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">All Locations</option>
                        {/* Locations will be loaded dynamically */}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instructor</label>
                    <select
                        value={filters.instructorId || ''}
                        onChange={(e) => onChange({ ...filters, instructorId: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">All Instructors</option>
                        {/* Instructors will be loaded dynamically */}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                        value={filters.status || ''}
                        onChange={(e) => onChange({ ...filters, status: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">All Status</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
