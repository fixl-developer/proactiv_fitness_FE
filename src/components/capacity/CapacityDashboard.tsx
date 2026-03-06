'use client';

import { useState, useEffect } from 'react';
import { capacityApi } from '@/lib/api/capacity';
import { toast } from 'sonner';

interface CapacityMetrics {
    totalClasses: number;
    underbookedClasses: number;
    fullClasses: number;
    averageCapacity: number;
    revenueImpact: number;
}

interface Recommendation {
    type: 'merge' | 'adjust' | 'waitlist';
    title: string;
    description: string;
    count: number;
}

export default function CapacityDashboard() {
    const [metrics, setMetrics] = useState<CapacityMetrics | null>(null);
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCapacityData();
    }, []);

    const loadCapacityData = async () => {
        try {
            setLoading(true);
            const [metricsData, recsData] = await Promise.all([
                capacityApi.getMetrics(),
                capacityApi.getRecommendations(),
            ]);
            setMetrics(metricsData);
            setRecommendations(recsData);
        } catch (error) {
            toast.error('Failed to load capacity data');
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

    if (!metrics) return null;

    return (
        <div className="space-y-6">
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Classes</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{metrics.totalClasses}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Underbooked</p>
                            <p className="text-3xl font-bold text-orange-600 mt-1">{metrics.underbookedClasses}</p>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Full Classes</p>
                            <p className="text-3xl font-bold text-green-600 mt-1">{metrics.fullClasses}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Avg Capacity</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{metrics.averageCapacity}%</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Revenue Impact */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-sm p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">Potential Revenue Impact</h3>
                <p className="text-3xl font-bold">${metrics.revenueImpact.toLocaleString()}</p>
                <p className="text-sm text-blue-100 mt-1">
                    Additional revenue possible by optimizing underbooked classes
                </p>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Optimization Recommendations</h3>
                <div className="space-y-3">
                    {recommendations.map((rec, index) => {
                        const colors = {
                            merge: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-900', subtext: 'text-yellow-800', icon: 'text-yellow-600' },
                            adjust: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900', subtext: 'text-blue-800', icon: 'text-blue-600' },
                            waitlist: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-900', subtext: 'text-green-800', icon: 'text-green-600' },
                        };
                        const color = colors[rec.type];

                        return (
                            <div key={index} className={`flex items-start gap-3 p-3 ${color.bg} border ${color.border} rounded-lg`}>
                                <svg className={`w-5 h-5 ${color.icon} mt-0.5`} fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                <div>
                                    <p className={`font-medium ${color.text}`}>{rec.title}</p>
                                    <p className={`text-sm ${color.subtext}`}>{rec.description}</p>
                                </div>
                            </div>
                        );
                    })}

                    {recommendations.length === 0 && (
                        <p className="text-center text-gray-500 py-4">No recommendations at this time</p>
                    )}
                </div>
            </div>
        </div>
    );
}
