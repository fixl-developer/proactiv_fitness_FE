'use client';

import { useEffect, useState } from 'use';
import { dashboardApi } from '@/lib/api/dashboard';
import MetricsCard from '@/components/dashboard/MetricsCard';
import RevenueChart from '@/components/dashboard/RevenueChart';
import type { DashboardMetrics, RevenueData } from '@/types/dashboard';
import { toast } from 'sonner';

export default function DashboardPage() {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [metricsData, revenue] = await Promise.all([
                dashboardApi.getMetrics(),
                dashboardApi.getRevenueData(),
            ]);
            setMetrics(metricsData);
            setRevenueData(revenue);
        } catch (error) {
            toast.error('Failed to load dashboard data');
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
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">Welcome back! Here's your overview.</p>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricsCard
                    title="Total Revenue"
                    value={`$${metrics?.totalRevenue.toLocaleString() || 0}`}
                    change={metrics?.revenueChange || 0}
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    color="blue"
                />
                <MetricsCard
                    title="Total Students"
                    value={metrics?.totalStudents || 0}
                    change={metrics?.studentsChange || 0}
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                    color="green"
                />
                <MetricsCard
                    title="Total Classes"
                    value={metrics?.totalClasses || 0}
                    change={metrics?.classesChange || 0}
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                    color="purple"
                />
                <MetricsCard
                    title="Attendance Rate"
                    value={`${metrics?.attendanceRate || 0}%`}
                    change={metrics?.attendanceChange || 0}
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    color="orange"
                />
            </div>

            {/* Revenue Chart */}
            <RevenueChart data={revenueData} />

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-left">
                    <div className="text-blue-600 mb-2">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    </div>
                    <h3 className="font-semibold text-gray-900">Add New Student</h3>
                    <p className="text-sm text-gray-600 mt-1">Register a new student</p>
                </button>
                <button className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-left">
                    <div className="text-green-600 mb-2">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <h3 className="font-semibold text-gray-900">Create Class</h3>
                    <p className="text-sm text-gray-600 mt-1">Schedule a new class</p>
                </button>
                <button className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-left">
                    <div className="text-purple-600 mb-2">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <h3 className="font-semibold text-gray-900">View Reports</h3>
                    <p className="text-sm text-gray-600 mt-1">Generate analytics reports</p>
                </button>
            </div>
        </div>
    );
}
