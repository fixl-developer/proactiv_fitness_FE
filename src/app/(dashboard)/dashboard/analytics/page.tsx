'use client';

import { useEffect, useState } from 'react';
import { dashboardApi } from '@/lib/api/dashboard';
import RevenueChart from '@/components/dashboard/RevenueChart';
import AttendanceChart from '@/components/dashboard/AttendanceChart';
import StudentGrowthChart from '@/components/dashboard/StudentGrowthChart';
import DateRangeFilter from '@/components/dashboard/DateRangeFilter';
import ExportButton from '@/components/dashboard/ExportButton';
import type { DashboardFilters, RevenueData, AttendanceData, StudentGrowthData } from '@/types/dashboard';
import { toast } from 'sonner';

export default function AnalyticsPage() {
    const [filters, setFilters] = useState<DashboardFilters>({ dateRange: 'month' });
    const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
    const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);
    const [growthData, setGrowthData] = useState<StudentGrowthData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAnalyticsData();
    }, [filters]);

    const loadAnalyticsData = async () => {
        try {
            setLoading(true);
            const [revenue, attendance, growth] = await Promise.all([
                dashboardApi.getRevenueData(filters),
                dashboardApi.getAttendanceData(filters),
                dashboardApi.getStudentGrowth(filters),
            ]);
            setRevenueData(revenue);
            setAttendanceData(attendance);
            setGrowthData(growth);
        } catch (error) {
            toast.error('Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
                    <p className="text-gray-600 mt-1">Detailed performance analytics and insights</p>
                </div>
                <ExportButton filters={filters} />
            </div>

            <DateRangeFilter filters={filters} onFilterChange={setFilters} />

            <div className="grid grid-cols-1 gap-6">
                <RevenueChart data={revenueData} title="Revenue Trends" />
                <AttendanceChart data={attendanceData} title="Attendance Trends" />
                <StudentGrowthChart data={growthData} title="Student Growth Trends" />
            </div>

            {/* Additional Analytics Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <span className="text-sm text-gray-700">Peak Revenue Day</span>
                            <span className="text-sm font-semibold text-blue-600">Monday</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <span className="text-sm text-gray-700">Best Attendance Rate</span>
                            <span className="text-sm font-semibold text-green-600">95%</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                            <span className="text-sm text-gray-700">Growth Rate</span>
                            <span className="text-sm font-semibold text-purple-600">+12%</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
                    <div className="space-y-3">
                        <div className="flex items-start space-x-2">
                            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm text-gray-700">Consider adding more classes on Monday to capitalize on peak demand</p>
                        </div>
                        <div className="flex items-start space-x-2">
                            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm text-gray-700">Focus on retention strategies to maintain high attendance rates</p>
                        </div>
                        <div className="flex items-start space-x-2">
                            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm text-gray-700">Implement referral program to sustain growth momentum</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
