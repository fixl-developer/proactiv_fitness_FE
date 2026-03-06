'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, MapPin } from 'lucide-react';

interface AttendanceRecord {
    id: string;
    date: string;
    className: string;
    location: string;
    duration: number;
    status: 'present' | 'late' | 'absent';
}

interface AttendanceHistoryProps {
    records: AttendanceRecord[];
}

export default function AttendanceHistory({ records }: AttendanceHistoryProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'present':
                return 'text-green-600';
            case 'late':
                return 'text-orange-600';
            case 'absent':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    const sortedRecords = [...records].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Attendance History
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {sortedRecords.slice(0, 10).map((record) => (
                        <div
                            key={record.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                        >
                            <div className="space-y-1">
                                <p className="font-medium">{record.className}</p>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        <span>{new Date(record.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        <span>{record.duration} min</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        <span>{record.location}</span>
                                    </div>
                                </div>
                            </div>
                            <span
                                className={`font-semibold capitalize ${getStatusColor(
                                    record.status
                                )}`}
                            >
                                {record.status}
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
