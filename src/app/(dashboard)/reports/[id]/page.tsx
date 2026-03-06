'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReportBuilder from '@/components/reports/ReportBuilder';
import ReportExecutionHistory from '@/components/reports/ReportExecutionHistory';
import ReportScheduler from '@/components/reports/ReportScheduler';
import { getReport, updateReport, executeReport, deleteReport } from '@/lib/api/reporting';
import type { Report, ReportSchedule } from '@/types/reporting';
import { ArrowLeft, Play, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function ReportDetailPage() {
    const params = useParams();
    const router = useRouter();
    const reportId = params.id as string;

    const [report, setReport] = useState<Report | null>(null);
    const [loading, setLoading] = useState(true);
    const [executing, setExecuting] = useState(false);
    const [activeTab, setActiveTab] = useState('builder');

    useEffect(() => {
        if (reportId && reportId !== 'new') {
            loadReport();
        } else {
            setLoading(false);
        }
    }, [reportId]);

    const loadReport = async () => {
        try {
            setLoading(true);
            const data = await getReport(reportId);
            setReport(data);
        } catch (error) {
            toast.error('Failed to load report');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (updatedReport: Partial<Report>) => {
        try {
            const saved = await updateReport(reportId, updatedReport);
            setReport(saved);
            toast.success('Report saved successfully');
        } catch (error) {
            toast.error('Failed to save report');
            console.error(error);
        }
    };

    const handleExecute = async () => {
        try {
            setExecuting(true);
            await executeReport(reportId);
            toast.success('Report execution started');
            setActiveTab('history');
        } catch (error) {
            toast.error('Failed to execute report');
            console.error(error);
        } finally {
            setExecuting(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this report?')) return;

        try {
            await deleteReport(reportId);
            toast.success('Report deleted successfully');
            router.push('/dashboard/reports');
        } catch (error) {
            toast.error('Failed to delete report');
            console.error(error);
        }
    };

    const handleScheduleSave = async (schedule: ReportSchedule) => {
        await handleSave({ schedule });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">{report?.name || 'New Report'}</h1>
                        <p className="text-muted-foreground">{report?.description}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleDelete}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                    </Button>
                    <Button onClick={handleExecute} disabled={executing}>
                        <Play className="h-4 w-4 mr-2" />
                        {executing ? 'Executing...' : 'Run Report'}
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="builder">Builder</TabsTrigger>
                    <TabsTrigger value="schedule">Schedule</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                <TabsContent value="builder" className="mt-6">
                    {report && <ReportBuilder report={report} onSave={handleSave} />}
                </TabsContent>

                <TabsContent value="schedule" className="mt-6">
                    <ReportScheduler schedule={report?.schedule} onSave={handleScheduleSave} />
                </TabsContent>

                <TabsContent value="history" className="mt-6">
                    <ReportExecutionHistory reportId={reportId} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
