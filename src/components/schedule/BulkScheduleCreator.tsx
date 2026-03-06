'use client';

import { useState } from 'react';
import { schedulesApi } from '@/lib/api/schedules';
import type { BulkScheduleData } from '@/types/schedule';
import { toast } from 'sonner';

export default function BulkScheduleCreator() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<BulkScheduleData>({
        templateId: '',
        startDate: '',
        endDate: '',
        excludeDates: [],
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const schedules = await schedulesApi.bulkCreate(formData);
            toast.success(`${schedules.length} schedules created successfully`);
            setFormData({
                templateId: '',
                startDate: '',
                endDate: '',
                excludeDates: [],
            });
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create schedules');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Bulk Schedule Creation</h2>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Template *</label>
                    <select
                        required
                        value={formData.templateId}
                        onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Select Template</option>
                        {/* Templates will be loaded dynamically */}
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                        <input
                            type="date"
                            required
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                        <input
                            type="date"
                            required
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-sm text-blue-800">
                            <p className="font-medium">Bulk Creation</p>
                            <p className="mt-1">This will create multiple schedules based on the selected template and date range.</p>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Creating Schedules...' : 'Create Schedules'}
                </button>
            </div>
        </form>
    );
}
