'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RevenueAnalytics from '@/components/analytics/RevenueAnalytics';
import StudentAnalytics from '@/components/analytics/StudentAnalytics';
import ProgramAnalytics from '@/components/analytics/ProgramAnalytics';
import StaffAnalytics from '@/components/analytics/StaffAnalytics';
import LocationAnalytics from '@/components/analytics/LocationAnalytics';
import CustomDashboard from '@/components/analytics/CustomDashboard';

export default function AnalyticsPage() {
    const [activeTab, setActiveTab] = useState('revenue');

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Analytics</h1>
                <p className="text-muted-foreground">
                    Comprehensive analytics and insights for your business
                </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="revenue">Revenue</TabsTrigger>
                    <TabsTrigger value="students">Students</TabsTrigger>
                    <TabsTrigger value="programs">Programs</TabsTrigger>
                    <TabsTrigger value="staff">Staff</TabsTrigger>
                    <TabsTrigger value="locations">Locations</TabsTrigger>
                    <TabsTrigger value="custom">Custom</TabsTrigger>
                </TabsList>

                <TabsContent value="revenue" className="mt-6">
                    <RevenueAnalytics />
                </TabsContent>

                <TabsContent value="students" className="mt-6">
                    <StudentAnalytics />
                </TabsContent>

                <TabsContent value="programs" className="mt-6">
                    <ProgramAnalytics />
                </TabsContent>

                <TabsContent value="staff" className="mt-6">
                    <StaffAnalytics />
                </TabsContent>

                <TabsContent value="locations" className="mt-6">
                    <LocationAnalytics />
                </TabsContent>

                <TabsContent value="custom" className="mt-6">
                    <CustomDashboard />
                </TabsContent>
            </Tabs>
        </div>
    );
}
