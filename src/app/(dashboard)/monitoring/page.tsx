'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SystemLogsViewer from '@/components/observability/SystemLogsViewer';
import PerformanceMetrics from '@/components/observability/PerformanceMetrics';
import AlertManager from '@/components/observability/AlertManager';
import SecurityEvents from '@/components/observability/SecurityEvents';
import TraceViewer from '@/components/observability/TraceViewer';
import UptimeMonitor from '@/components/observability/UptimeMonitor';

export default function MonitoringPage() {
    return (
        <div className="container mx-auto py-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">System Monitoring</h1>
                <p className="text-muted-foreground">
                    Monitor system health, performance, and security
                </p>
            </div>

            <Tabs defaultValue="overview">
                <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="logs">Logs</TabsTrigger>
                    <TabsTrigger value="metrics">Metrics</TabsTrigger>
                    <TabsTrigger value="alerts">Alerts</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                    <TabsTrigger value="traces">Traces</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6">
                    <div className="space-y-6">
                        <UptimeMonitor />
                        <AlertManager />
                    </div>
                </TabsContent>

                <TabsContent value="logs" className="mt-6">
                    <SystemLogsViewer />
                </TabsContent>

                <TabsContent value="metrics" className="mt-6">
                    <PerformanceMetrics />
                </TabsContent>

                <TabsContent value="alerts" className="mt-6">
                    <AlertManager />
                </TabsContent>

                <TabsContent value="security" className="mt-6">
                    <SecurityEvents />
                </TabsContent>

                <TabsContent value="traces" className="mt-6">
                    <TraceViewer />
                </TabsContent>
            </Tabs>
        </div>
    );
}
