'use client';

import type { Staff } from '@/types/staff';

interface PerformanceMetricsProps {
    metrics: Staff['performanceMetrics'];
}

export default function PerformanceMetrics({ metrics }: PerformanceMetricsProps) {
    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Metrics</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-3xl font-bold text-blue-600">{metrics.classesTaught}</p>
                    <p className="text-sm text-gray-600 mt-1">Classes Taught</p>
                </div>

                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center justify-center gap-1">
                        <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <p className="text-3xl font-bold text-yellow-600">{metrics.averageRating.toFixed(1)}</p>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Average Rating</p>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-3xl font-bold text-green-600">{metrics.studentSatisfaction}%</p>
                    <p className="text-sm text-gray-600 mt-1">Satisfaction</p>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-3xl font-bold text-purple-600">{metrics.attendanceRate}%</p>
                    <p className="text-sm text-gray-600 mt-1">Attendance Rate</p>
                </div>
            </div>
        </div>
    );
}
