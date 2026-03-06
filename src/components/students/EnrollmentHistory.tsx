'use client';

import type { EnrolledProgram } from '@/types/student';

interface EnrollmentHistoryProps {
    programs: EnrolledProgram[];
}

export default function EnrollmentHistory({ programs }: EnrollmentHistoryProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'completed':
                return 'bg-blue-100 text-blue-800';
            case 'dropped':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const calculateProgress = (completed: number, total: number) => {
        return total > 0 ? Math.round((completed / total) * 100) : 0;
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Enrollment History</h2>

            {programs.length > 0 ? (
                <div className="space-y-4">
                    {programs.map((program) => {
                        const progress = calculateProgress(program.sessionsCompleted, program.totalSessions);

                        return (
                            <div
                                key={program.id}
                                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">{program.programName}</h3>
                                        <p className="text-sm text-gray-600">
                                            {new Date(program.startDate).toLocaleDateString()}
                                            {program.endDate && ` - ${new Date(program.endDate).toLocaleDateString()}`}
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(program.status)}`}>
                                        {program.status}
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Progress</span>
                                        <span className="font-medium text-gray-900">
                                            {program.sessionsCompleted} / {program.totalSessions} sessions ({progress}%)
                                        </span>
                                    </div>

                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>

                                {program.status === 'active' && (
                                    <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span>Currently enrolled</span>
                                    </div>
                                )}

                                {program.status === 'completed' && (
                                    <div className="mt-3 flex items-center gap-2 text-sm text-blue-600">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span>Program completed</span>
                                    </div>
                                )}

                                {program.status === 'dropped' && (
                                    <div className="mt-3 flex items-center gap-2 text-sm text-red-600">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                        <span>Enrollment dropped</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-8">
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    <p className="text-gray-600">No enrollment history</p>
                    <p className="text-sm text-gray-500 mt-1">Student has not been enrolled in any programs yet</p>
                </div>
            )}
        </div>
    );
}
