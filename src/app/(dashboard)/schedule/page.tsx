import Link from 'next/link';
import ScheduleCalendar from '@/components/schedule/ScheduleCalendar';

export default function SchedulePage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Schedule Management</h1>
                    <p className="text-gray-600 mt-1">Manage class schedules and rostering</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/schedule/templates">
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                            Templates
                        </button>
                    </Link>
                    <Link href="/schedule/bulk">
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                            Bulk Create
                        </button>
                    </Link>
                    <Link href="/schedule/add">
                        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Schedule
                        </button>
                    </Link>
                </div>
            </div>

            <ScheduleCalendar />
        </div>
    );
}
