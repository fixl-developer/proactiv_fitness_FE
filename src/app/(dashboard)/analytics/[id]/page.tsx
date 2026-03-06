'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDashboard } from '@/lib/api/reporting';
import type { AnalyticsDashboard } from '@/types/reporting';
import { ArrowLeft, Settings } from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardDetailPage() {
    const params = useParams();
    const router = useRouter();
    const dashboardId = params.id as string;

    const [dashboard, setDashboard] = useState<AnalyticsDashboard | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboard();
    }, [dashboardId]);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            const data = await getDashboard(dashboardId);
            setDashboard(data);
        } catch (error) {
            toast.error('Failed to load dashboard');
            console.error(error);
        } finally {
            setLoading(false);
        }
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
                        <h1 className="text-3xl font-bold">{dashboard?.name}</h1>
                        <p className="text-muted-foreground">{dashboard?.description}</p>
                    </div>
                </div>
                <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {dashboard?.widgets.map((widget) => (
                    <Card key={widget.id}>
                        <CardHeader>
                            <CardTitle>{widget.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64 flex items-center justify-center text-muted-foreground">
                                Widget: {widget.type}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
