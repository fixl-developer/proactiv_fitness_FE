'use client';

import Link from 'next/link';
import type { QuickAction } from '@/types/dashboard';

interface QuickActionsProps {
    actions: QuickAction[];
}

export default function QuickActions({ actions }: QuickActionsProps) {
    const getColorClasses = (color: string) => {
        switch (color) {
            case 'blue':
                return 'bg-blue-100 text-blue-600 hover:bg-blue-200';
            case 'green':
                return 'bg-green-100 text-green-600 hover:bg-green-200';
            case 'purple':
                return 'bg-purple-100 text-purple-600 hover:bg-purple-200';
            case 'orange':
                return 'bg-orange-100 text-orange-600 hover:bg-orange-200';
            case 'red':
                return 'bg-red-100 text-red-600 hover:bg-red-200';
            default:
                return 'bg-gray-100 text-gray-600 hover:bg-gray-200';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {actions.map((action) => (
                    <Link
                        key={action.id}
                        href={action.url}
                        className="block p-4 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-all"
                    >
                        <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg ${getColorClasses(action.color)}`}>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {action.icon === 'add-student' && (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    )}
                                    {action.icon === 'create-class' && (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    )}
                                    {action.icon === 'view-reports' && (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    )}
                                    {action.icon === 'manage-staff' && (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    )}
                                    {action.icon === 'process-payment' && (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    )}
                                    {action.icon === 'send-message' && (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    )}
                                    {!['add-student', 'create-class', 'view-reports', 'manage-staff', 'process-payment', 'send-message'].includes(action.icon) && (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    )}
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-semibold text-gray-900">
                                    {action.title}
                                </h4>
                                <p className="text-xs text-gray-600 mt-1">
                                    {action.description}
                                </p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
