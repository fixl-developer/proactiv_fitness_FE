import Link from 'next/link';
import SafetyAlerts from '@/components/safety/SafetyAlerts';
import IncidentList from '@/components/safety/IncidentList';

export default function SafetyPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Safety Management</h1>
                    <p className="text-gray-600 mt-1">Manage incidents and safety protocols</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/safety/protocols">
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                            Emergency Protocols
                        </button>
                    </Link>
                    <Link href="/safety/incidents/report">
                        <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Report Incident
                        </button>
                    </Link>
                </div>
            </div>

            <SafetyAlerts />

            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Incidents</h2>
                <IncidentList />
            </div>
        </div>
    );
}
