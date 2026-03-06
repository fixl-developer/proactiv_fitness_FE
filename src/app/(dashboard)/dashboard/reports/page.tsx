'use client';

import { useState } from 'react';
import DateRangeFilter from '@/components/dashboard/DateRangeFilter';
import ExportButton from '@/components/dashboard/ExportButton';
import type { DashboardFilters } from '@/types/dashboard';

export default function ReportsPage() {
    const [filters, setFilters] = useState<DashboardFilters>({ dateRange: 'month' });

    const reportTypes = [
        {
            id: 'revenue',
            name: 'Revenue Report',
            description: 'Detailed revenue breakdown by program, location, and time period',
            icon: '💰',
            color: 'blue',
        },
        {
            id: 'attendance',
            name: 'Attendance Report',
            description: 'Student attendance patterns and trends',
            icon: '📊',
            color: 'green',
        },
        {
            id: 'enrollment',
            name: 'Enrollment Report',
            description: 'New enrollments, renewals, and cancellations',
            icon: '👥',
            color: 'purple',
        },
        {
            id: 'staff',
            name: 'Staff Performance Report',
            description: 'Staff metrics, ratings, and performance indicators',
            icon: '⭐',
            color: 'orange',
        },
        {
            id: 'financial',
            name: 'Financial Summary',
            description: 'Complete financial overview including payments and outstanding balances',
            icon: '💳',
            color: 'red',
        },
        {
            id: 'program',
            name: 'Program Performance',
            description: 'Program popularity, capacity utilization, and revenue',
            icon: '🎯',
            color: 'indigo',
        },
    ];

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
                    <p className="text-gray-600 mt-1">Generate and download detailed reports</p>
                </div>
                <ExportButton filters={filters} />
            </div>

            <DateRangeFilter filters={filters} onFilterChange={setFilters} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reportTypes.map((report) => (
                    <div
                        key={report.id}
                        className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="text-4xl">{report.icon}</div>
                            <button className="text-blue-600 hover:text-blue-700">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                            </button>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {report.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                            {report.description}
                        </p>
                        <div className="mt-4 flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                                Last generated: 2 days ago
                            </span>
                            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                Generate →
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Reports */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reports</h3>
                <div className="space-y-3">
                    {[
                        { name: 'Revenue Report - March 2026', date: '2026-03-05', size: '2.4 MB', format: 'PDF' },
                        { name: 'Attendance Report - February 2026', date: '2026-03-01', size: '1.8 MB', format: 'Excel' },
                        { name: 'Financial Summary - Q1 2026', date: '2026-02-28', size: '3.1 MB', format: 'PDF' },
                    ].map((report, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="bg-blue-100 rounded-lg p-2">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{report.name}</p>
                                    <p className="text-xs text-gray-500">
                                        {report.date} • {report.size} • {report.format}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button className="p-2 text-gray-600 hover:text-gray-900">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </button>
                                <button className="p-2 text-gray-600 hover:text-gray-900">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
