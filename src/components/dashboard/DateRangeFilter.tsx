'use client';

import { useState } from 'react';
import type { DashboardFilters } from '@/types/dashboard';

interface DateRangeFilterProps {
    filters: DashboardFilters;
    onFilterChange: (filters: DashboardFilters) => void;
}

export default function DateRangeFilter({ filters, onFilterChange }: DateRangeFilterProps) {
    const [showCustom, setShowCustom] = useState(false);

    const handleRangeChange = (range: DashboardFilters['dateRange']) => {
        if (range === 'custom') {
            setShowCustom(true);
        } else {
            setShowCustom(false);
            onFilterChange({ ...filters, dateRange: range, startDate: undefined, endDate: undefined });
        }
    };

    const handleCustomDateChange = (field: 'startDate' | 'endDate', value: string) => {
        onFilterChange({ ...filters, [field]: value });
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Date Range:</span>

                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => handleRangeChange('today')}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${filters.dateRange === 'today'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Today
                    </button>

                    <button
                        onClick={() => handleRangeChange('week')}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${filters.dateRange === 'week'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        This Week
                    </button>

                    <button
                        onClick={() => handleRangeChange('month')}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${filters.dateRange === 'month'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        This Month
                    </button>

                    <button
                        onClick={() => handleRangeChange('quarter')}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${filters.dateRange === 'quarter'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        This Quarter
                    </button>

                    <button
                        onClick={() => handleRangeChange('year')}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${filters.dateRange === 'year'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        This Year
                    </button>

                    <button
                        onClick={() => handleRangeChange('custom')}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${filters.dateRange === 'custom' || showCustom
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Custom
                    </button>
                </div>
            </div>

            {showCustom && (
                <div className="mt-4 flex flex-wrap items-center gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Date
                        </label>
                        <input
                            type="date"
                            value={filters.startDate || ''}
                            onChange={(e) => handleCustomDateChange('startDate', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            End Date
                        </label>
                        <input
                            type="date"
                            value={filters.endDate || ''}
                            onChange={(e) => handleCustomDateChange('endDate', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div className="self-end">
                        <button
                            onClick={() => onFilterChange({ ...filters, dateRange: 'custom' })}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Apply
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
