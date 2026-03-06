import Link from 'next/link';
import ProgramList from '@/components/programs/ProgramList';

export default function ProgramsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Programs</h1>
                    <p className="text-gray-600 mt-1">Manage programs and classes</p>
                </div>
                <Link href="/programs/add">
                    <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Program
                    </button>
                </Link>
            </div>

            <ProgramList />
        </div>
    );
}
