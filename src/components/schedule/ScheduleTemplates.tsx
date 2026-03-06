'use client';

import { useState, useEffect } from 'react';
import { schedulesApi } from '@/lib/api/schedules';
import type { ScheduleTemplate } from '@/types/schedule';
import { toast } from 'sonner';

export default function ScheduleTemplates() {
    const [templates, setTemplates] = useState<ScheduleTemplate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        try {
            setLoading(true);
            const data = await schedulesApi.getTemplates();
            setTemplates(data);
        } catch (error) {
            toast.error('Failed to load templates');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this template?')) return;

        try {
            await schedulesApi.deleteTemplate(id);
            toast.success('Template deleted successfully');
            loadTemplates();
        } catch (error) {
            toast.error('Failed to delete template');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {templates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.map((template) => (
                        <div key={template.id} className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                                    <p className="text-sm text-gray-600">{template.description}</p>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${template.isActive
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {template.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            <div className="space-y-2 text-sm text-gray-600">
                                <p>Time: {template.startTime} - {template.endTime}</p>
                                <p>Days: {template.daysOfWeek.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ')}</p>
                                <p>Capacity: {template.maxCapacity}</p>
                            </div>

                            <div className="mt-4 flex gap-2">
                                <button
                                    onClick={() => handleDelete(template.id)}
                                    className="flex-1 px-3 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-600">No templates created yet</p>
                </div>
            )}
        </div>
    );
}
