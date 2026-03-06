'use client';

import Image from 'next/image';
import type { RecentActivity } from '@/types/dashboard';
import { formatDistanceToNow } from 'date-fns';

interface RecentActivitiesProps {
    activities: RecentActivity[];
}

export default function RecentActivities({ activities }: RecentActivitiesProps) {
    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'booking':
                return (
                    <div className="bg-blue-100 rounded-full p-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                );
            case 'payment':
                return (
                    <div className="bg-green-100 rounded-full p-2">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
            case 'cancellation':
                return (
                    <div className="bg-red-100 rounded-full p-2">
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                );
            case 'inquiry':
                return (
                    <div className="bg-purple-100 rounded-full p-2">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
            case 'registration':
                return (
                    <div className="bg-orange-100 rounded-full p-2">
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    </div>
                );
            default:
                return (
                    <div className="bg-gray-100 rounded-full p-2">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
            <div className="space-y-4">
                {activities.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No recent activities
                    </div>
                ) : (
                    activities.map((activity) => (
                        <div key={activity.id} className="flex items-start space-x-3">
                            {getActivityIcon(activity.type)}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">
                                    {activity.title}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {activity.description}
                                </p>
                                <div className="flex items-center mt-1 space-x-2">
                                    {activity.user.image ? (
                                        <Image
                                            src={activity.user.image}
                                            alt={activity.user.name}
                                            width={20}
                                            height={20}
                                            className="rounded-full"
                                        />
                                    ) : (
                                        <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center">
                                            <span className="text-xs text-gray-600">
                                                {activity.user.name.charAt(0)}
                                            </span>
                                        </div>
                                    )}
                                    <span className="text-xs text-gray-500">
                                        {activity.user.name}
                                    </span>
                                    <span className="text-xs text-gray-400">•</span>
                                    <span className="text-xs text-gray-500">
                                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
