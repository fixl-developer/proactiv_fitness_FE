'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Settings, Trash2 } from 'lucide-react';
import RevenueAnalytics from './RevenueAnalytics';
import StudentAnalytics from './StudentAnalytics';
import ProgramAnalytics from './ProgramAnalytics';
import StaffAnalytics from './StaffAnalytics';
import LocationAnalytics from './LocationAnalytics';

interface Widget {
    id: string;
    type: 'revenue' | 'student' | 'program' | 'staff' | 'location';
    title: string;
}

export default function CustomDashboard() {
    const [widgets, setWidgets] = useState<Widget[]>([
        { id: '1', type: 'revenue', title: 'Revenue Analytics' },
        { id: '2', type: 'student', title: 'Student Analytics' },
    ]);

    const renderWidget = (widget: Widget) => {
        switch (widget.type) {
            case 'revenue':
                return <RevenueAnalytics />;
            case 'student':
                return <StudentAnalytics />;
            case 'program':
                return <ProgramAnalytics />;
            case 'staff':
                return <StaffAnalytics />;
            case 'location':
                return <LocationAnalytics />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Custom Dashboard</h2>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Widget
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {widgets.map((widget) => (
                    <Card key={widget.id}>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>{widget.title}</CardTitle>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon">
                                    <Settings className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>{renderWidget(widget)}</CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
