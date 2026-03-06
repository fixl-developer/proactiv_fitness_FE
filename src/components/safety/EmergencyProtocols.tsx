'use client';

import { useState, useEffect } from 'react';
import { safetyApi } from '@/lib/api/safety';
import type { EmergencyProtocol } from '@/types/safety';
import { toast } from 'sonner';

export default function EmergencyProtocols() {
    const [protocols, setProtocols] = useState<EmergencyProtocol[]>([]);
    const [loading, setLoading] = useState(true);
    const [crisisMode, setCrisisMode] = useState(false);

    useEffect(() => {
        loadProtocols();
    }, []);

    const loadProtocols = async () => {
        try {
            setLoading(true);
            const data = await safetyApi.getProtocols();
            setProtocols(data);
        } catch (error) {
            toast.error('Failed to load protocols');
        } finally {
            setLoading(false);
        }
    };

    const handleActivateCrisis = async (protocolId: string) => {
        if (!confirm('Are you sure you want to activate crisis mode?')) return;

        try {
            await safetyApi.activateCrisisMode(protocolId);
            toast.success('Crisis mode activated');
            setCrisisMode(true);
        } catch (error) {
            toast.error('Failed to activate crisis mode');
        }
    };

    const getProtocolIcon = (type: string) => {
        switch (type) {
            case 'fire':
                return '🔥';
            case 'medical':
                return '🏥';
            case 'weather':
                return '⛈️';
            case 'security':
                return '🔒';
            case 'evacuation':
                return '🚨';
            default:
                return '⚠️';
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
            {crisisMode && (
                <div className="bg-red-600 text-white rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <svg className="w-6 h-6 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <div>
                                <p className="font-bold">CRISIS MODE ACTIVE</p>
                                <p className="text-sm">Emergency protocol in effect</p>
                            </div>
                        </div>
                        <button
                            onClick={async () => {
                                await safetyApi.deactivateCrisisMode();
                                setCrisisMode(false);
                                toast.success('Crisis mode deactivated');
                            }}
                            className="px-4 py-2 bg-white text-red-600 rounded-lg hover:bg-gray-100"
                        >
                            Deactivate
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {protocols.map((protocol) => (
                    <div key={protocol.id} className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <div className="text-3xl mb-2">{getProtocolIcon(protocol.type)}</div>
                                <h3 className="font-semibold text-gray-900">{protocol.name}</h3>
                                <p className="text-sm text-gray-600 capitalize">{protocol.type}</p>
                            </div>
                            <button
                                onClick={() => handleActivateCrisis(protocol.id)}
                                className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                            >
                                Activate
                            </button>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-700">Steps:</p>
                            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                                {protocol.steps.map((step, index) => (
                                    <li key={index}>{step}</li>
                                ))}
                            </ol>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-sm font-medium text-gray-700 mb-2">Emergency Contacts:</p>
                            <div className="space-y-1">
                                {protocol.contacts.map((contact, index) => (
                                    <div key={index} className="text-sm text-gray-600">
                                        <span className="font-medium">{contact.name}</span> ({contact.role}): {contact.phone}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
