'use client';

import { useState } from 'react';

interface Recommendation {
    id: string;
    type: 'merge' | 'split' | 'move' | 'timeshift';
    title: string;
    description: string;
    impact: {
        studentsAffected: number;
        revenueImpact: number;
        capacityImprovement: number;
    };
    classes: string[];
}

export default function RebalanceRecommendations() {
    const [recommendations] = useState<Recommendation[]>([
        {
            id: '1',
            type: 'merge',
            title: 'Merge Two Underbooked Beginner Classes',
            description: 'Combine Monday 4PM and Wednesday 4PM beginner gymnastics classes',
            impact: {
                studentsAffected: 12,
                revenueImpact: 2400,
                capacityImprovement: 35,
            },
            classes: ['Beginner Gymnastics Mon 4PM', 'Beginner Gymnastics Wed 4PM'],
        },
        {
            id: '2',
            type: 'split',
            title: 'Split Overbooked Advanced Class',
            description: 'Create two sessions for Saturday 10AM advanced class',
            impact: {
                studentsAffected: 8,
                revenueImpact: 3200,
                capacityImprovement: 40,
            },
            classes: ['Advanced Gymnastics Sat 10AM'],
        },
        {
            id: '3',
            type: 'move',
            title: 'Move Students from Waitlist',
            description: 'Transfer 5 students from waitlist to available Tuesday slot',
            impact: {
                studentsAffected: 5,
                revenueImpact: 1500,
                capacityImprovement: 25,
            },
            classes: ['Intermediate Gymnastics Tue 5PM'],
        },
    ]);

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'merge':
                return 'bg-blue-100 text-blue-800';
            case 'split':
                return 'bg-purple-100 text-purple-800';
            case 'move':
                return 'bg-green-100 text-green-800';
            case 'timeshift':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handleExecute = (id: string) => {
        // Implementation for executing recommendation
        console.log('Executing recommendation:', id);
    };

    return (
        <div className="space-y-4">
            {recommendations.map((rec) => (
                <div key={rec.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(rec.type)}`}>
                                    {rec.type.toUpperCase()}
                                </span>
                                <h3 className="font-semibold text-gray-900">{rec.title}</h3>
                            </div>
                            <p className="text-sm text-gray-600">{rec.description}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-600">Students Affected</p>
                            <p className="text-lg font-semibold text-gray-900">{rec.impact.studentsAffected}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-600">Revenue Impact</p>
                            <p className="text-lg font-semibold text-green-600">${rec.impact.revenueImpact}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-600">Capacity Improvement</p>
                            <p className="text-lg font-semibold text-blue-600">+{rec.impact.capacityImprovement}%</p>
                        </div>
                    </div>

                    <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Affected Classes:</p>
                        <div className="flex flex-wrap gap-2">
                            {rec.classes.map((className, index) => (
                                <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                    {className}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => handleExecute(rec.id)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Execute Recommendation
                        </button>
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                            View Details
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
