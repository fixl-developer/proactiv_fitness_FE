'use client';

import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import type { BookingFilters } from '@/types/booking';

interface ClassFiltersProps {
    filters: BookingFilters;
    onFilterChange: (filters: BookingFilters) => void;
    onClearFilters: () => void;
}

export function ClassFilters({
    filters,
    onFilterChange,
    onClearFilters,
}: ClassFiltersProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleFilterChange = (key: keyof BookingFilters, value: any) => {
        onFilterChange({ ...filters, [key]: value });
    };

    const activeFiltersCount = Object.values(filters).filter(Boolean).length;

    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            {/* Filter Header */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 text-gray-700 font-semibold"
                >
                    <Filter className="w-5 h-5" />
                    Filters
                    {activeFiltersCount > 0 && (
                        <span className="px-2 py-1 bg-primary text-white text-xs rounded-full">
                            {activeFiltersCount}
                        </span>
                    )}
                </button>

                {activeFiltersCount > 0 && (
                    <button
                        onClick={onClearFilters}
                        className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                    >
                        <X className="w-4 h-4" />
                        Clear All
                    </button>
                )}
            </div>

            {/* Filter Options */}
            {isOpen && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Location */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Location
                        </label>
                        <select data-testid="select-components-booking-ClassFilters-1"
                            value={filters.location || ''}
                            onChange={(e) => handleFilterChange('location', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="">All Locations</option>
                            <option value="downtown">Downtown Center</option>
                            <option value="westside">Westside Center</option>
                            <option value="eastside">Eastside Center</option>
                            <option value="northside">Northside Center</option>
                        </select>
                    </div>

                    {/* Day */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Day of Week
                        </label>
                        <select data-testid="select-components-booking-ClassFilters-2"
                            value={filters.day || ''}
                            onChange={(e) => handleFilterChange('day', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="">All Days</option>
                            <option value="monday">Monday</option>
                            <option value="tuesday">Tuesday</option>
                            <option value="wednesday">Wednesday</option>
                            <option value="thursday">Thursday</option>
                            <option value="friday">Friday</option>
                            <option value="saturday">Saturday</option>
                            <option value="sunday">Sunday</option>
                        </select>
                    </div>

                    {/* Time */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Time of Day
                        </label>
                        <select data-testid="select-components-booking-ClassFilters-3"
                            value={filters.time || ''}
                            onChange={(e) => handleFilterChange('time', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="">All Times</option>
                            <option value="morning">Morning (6AM - 12PM)</option>
                            <option value="afternoon">Afternoon (12PM - 5PM)</option>
                            <option value="evening">Evening (5PM - 9PM)</option>
                        </select>
                    </div>

                    {/* Program */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Program
                        </label>
                        <select data-testid="select-components-booking-ClassFilters-4"
                            value={filters.program || ''}
                            onChange={(e) => handleFilterChange('program', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="">All Programs</option>
                            <option value="gymnastics">Gymnastics</option>
                            <option value="multi-activity">Multi-Activity</option>
                            <option value="camps">Holiday Camps</option>
                        </select>
                    </div>

                    {/* Staff */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Instructor
                        </label>
                        <select data-testid="select-components-booking-ClassFilters-5"
                            value={filters.staff || ''}
                            onChange={(e) => handleFilterChange('staff', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="">All Instructors</option>
                            <option value="john">John Smith</option>
                            <option value="sarah">Sarah Johnson</option>
                            <option value="mike">Mike Williams</option>
                        </select>
                    </div>

                    {/* Skill Level */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Skill Level
                        </label>
                        <select data-testid="select-components-booking-ClassFilters-6"
                            value={filters.skillLevel || ''}
                            onChange={(e) => handleFilterChange('skillLevel', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="">All Levels</option>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                        </select>
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date
                        </label>
                        <input
                            type="date"
                            value={filters.date || ''}
                            onChange={(e) => handleFilterChange('date', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
