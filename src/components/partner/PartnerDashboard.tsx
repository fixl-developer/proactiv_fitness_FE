'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, TrendingUp, BookOpen } from 'lucide-react';
import type { PartnerReport } from '@/types/enterprise';

interface PartnerDashboardProps {
    report: PartnerReport;
}

export default function PartnerDashboard({ report }: PartnerDashboardProps) {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{report.totalStudents}</div>
                        <p className="text-xs text-muted-foreground">
                            {report.activeStudents} active
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">New Enrollments</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{report.newEnrollments}</div>
                        <p className="text-xs text-muted-foreground">This period</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            AED {report.totalRevenue.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Share: AED {report.partnerShare.toLocaleString()}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Classes</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{report.totalClasses}</div>
                        <p className="text-xs text-muted-foreground">
                            {report.attendanceRate}% attendance
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Performance Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                            <span className="font-medium">Period</span>
                            <span>{report.period}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                            <span className="font-medium">Partner Name</span>
                            <span>{report.partnerName}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
