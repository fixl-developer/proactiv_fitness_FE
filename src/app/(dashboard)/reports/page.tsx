'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReportList from '@/components/reports/ReportList';
import ReportTemplates from '@/components/reports/ReportTemplates';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { reportingApi } from '@/lib/api/reporting';
import type { Report } from '@/types/reporting';
import { toast } from 'sonner';

export default function ReportsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('my-reports');
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReports();
    }, []);

    const loadReports = async () => {
        try {
            setLoading(true);
            const data = await reportingApi.getAll();
            setReports(data);
        } catch (error) {
            toast.error('Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    const handleRunReport = async (reportId: string) => {
        try {
            await reportingApi.execute(reportId);
            toast.success('Report execution started');
            loadReports();
        } catch (error: any) {
            toast.error('Failed to execute report');
        }
    };

    const handleEditReport = (report: Report) => {
        router.push(`/dashboard/reports/${report.id}/edit`);
    };

    const handleDeleteReport = async (reportId: string) => {
        if (!confirm('Are you sure you want to delete this report?')) return;

        try {
            await reportingApi.delete(reportId);
            toast.success('Report deleted successfully');
            loadReports();
        } catch (error) {
            toast.error('Failed to delete report');
        }
    };

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Reports</h1>
                    <p className="text-muted-foreground">
                        Create, manage, and schedule custom reports
                    </p>
                </div>
                <Button onClick={() => router.push('/dashboard/reports/new')}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Report
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="my-reports">My Reports</TabsTrigger>
                    <TabsTrigger value="templates">Templates</TabsTrigger>
                </TabsList>

                <TabsContent value="my-reports" className="mt-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <ReportList
                            reports={reports}
                            onRun={handleRunReport}
                            onEdit={handleEditReport}
                            onDelete={handleDeleteReport}
                        />
                    )}
                </TabsContent>

                <TabsContent value="templates" className="mt-6">
                    <ReportTemplates />
                </TabsContent>
            </Tabs>
        </div>
    );
}
