'use client';

import { useState } from 'react';

interface UnderbookedClass {
    id: string;
    name: string;
    date: string;
    time: string;
    enrolled: number;
    capacity: number;
    utilizationRate: number;
    potentialRevenue: number;
}

export default function UnderbookedClasses() {
    const [classes] = useState<UnderbookedClass[]>([
        {
            id: '1',
            name: 'Beginner Gymnastics',
            date: '2026-03-10',
            time: '4:00 PM',
            enrolled: 5,
            capacity: 15,
            utilizationRate: 33,
            potentialRevenue: 800,
        },
        {
            id: '2',
            name: 'Intermediate Multi-Activity',
            date: '2026-03-11',
            time: '5:00 PM',
            enrolled: 7,
            capacity: 20,
            utilizationRate: 35,
            potentialRevenue: 1040,
        },
    ]);

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Class
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date & Time
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Enrollment
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Utilization
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Potential Revenue
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {classes.map((cls) => (
                            <tr key={cls.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{cls.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{new Date(cls.date).toLocaleDateString()}</div>
                                    <div className="text-sm text-gray-500">{cls.time}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {cls.enrolled}/{cls.capacity}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                            <div
                                                className="bg-orange-600 h-2 rounded-full"
                                                style={{ width: `${cls.utilizationRate}%` }}
                                            />
                                        </div>
                                        <span className="text-sm text-gray-900">{cls.utilizationRate}%</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-green-600">
                                        ${cls.potentialRevenue}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <button className="text-blue-600 hover:text-blue-700 mr-3">
                                        Optimize
                                    </button>
                                    <button className="text-gray-600 hover:text-gray-700">
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
