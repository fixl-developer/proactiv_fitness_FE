'use client';

import { useState, useEffect } from 'react';
import { safetyApi } from '@/lib/api/safety';
import type { SafetyAlert } from '@/types/safety';
import { toast } from 'sonner';

export default function SafetyAlerts() {
    const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAlerts();
    }, []);

    const loadAlerts = async () => {
        try {
            setLoading(true);
            const data = await safetyApi.getAlerts();
            setAlerts(data.filter(a => a.isActive));
        } catch (error) {
            toast.error('Failed to load alerts');
        } finally {
            setLoading(false);
        }
    };

    const handleDeactivate = async (id: string) => {
        try {
            await safetyApi.deactivateAlert(id);
            toast.success('Alert deactivated');
            loadAlerts();
        } catch (error) {
            toast.error('Failed to deactivate alert');
        }
    };

    const getAlertColor = (type: string) => {
        switch (type) {
            case 'emergency':
                return 'bg-red-50 border-red-200 text-red-800';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200 text-yellow-800';
            case 'info':
                return 'bg-blue-50 border-blue-200 text-blue-800';
            default:
                return 'bg-gray-50 border-gray-200 text-gray-800';
        }
    };

    if (loading) {
        return null;
    }

    if (alerts.length === 0) {
        return null;
    }

    return (
        <div className="space-y-3">
            {alerts.map((alert) => (
                <div key={alert.id} className={`border rounded-lg p-4 ${getAlertColor(alert.type)}`}>
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <h3 className="font-semibold">{alert.title}</h3>
                            </div>
                            <p className="text-sm">{alert.message}</p>
                        </div>
                        <button
                            onClick={() => handleDeactivate(alert.id)}
                            className="ml-4 text-sm hover:underline"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
