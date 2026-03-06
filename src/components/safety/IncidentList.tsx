'use client';

import { useState, useEffect } from 'react';
import { safetyApi } from '@/lib/api/safety';
import type { Incident, IncidentFilters } from '@/types/safety';
import { toast } from 'sonner';
import Link from 'next/link';

export default function IncidentList() {
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<IncidentFilters>({});

    useEffect(() => {
        loadIncidents();
    }, [filters]);

    const loadIncidents = async () => {
        try {
            setLoading(true);
            const result = await safetyApi.getAllIncidents(filters);
            setIncidents(result.incidents);
        } catch (error) {
            toast.error('Failed to load incidents');
        } finally {
            setLoading(false);
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'minor':
                return 'bg-yellow-100 text-yellow-800';
            case 'moderate':
                return 'bg-orange-100 text-orange-800';
            case 'severe':
                return 'bg-red-100 text-red-800';
            case 'critical':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
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
            {incidents.map((incident) => (
                <div key={incident.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                                    {incident.severity}
                                </span>
                                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                                    {incident.type}
                                </span>
                            </div>
                            <h3 className="font-semibold text-gray-900">{incident.studentName}</h3>
                            <p className="text-sm text-gray-600">{incident.locationName}</p>
                            <p className="text-sm text-gray-600">
                                {new Date(incident.date).toLocaleDateString()} at {incident.time}
                            </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${incident.status === 'open' ? 'bg-blue-100 text-blue-800' :
                                incident.status === 'investigating' ? 'bg-yellow-100 text-yellow-800' :
                                    incident.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                        'bg-gray-100 text-gray-800'
                            }`}>
                            {incident.status}
                        </span>
                    </div>

                    <p className="text-sm text-gray-700 mb-3">{incident.description}</p>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        {incident.parentNotified && (
                            <div className="flex items-center gap-1">
                                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>Parent Notified</span>
                            </div>
                        )}
                        {incident.medicalAttentionRequired && (
                            <div className="flex items-center gap-1">
                                <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                <span>Medical Attention</span>
                            </div>
                        )}
                    </div>

                    <Link href={`/safety/incidents/${incident.id}`}>
                        <button className="text-sm text-blue-600 hover:text-blue-700">
                            View Details →
                        </button>
                    </Link>
                </div>
            ))}
        </div>
    );
}
