'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WorkflowList from '@/components/automation/WorkflowList';
import WorkflowTemplates from '@/components/automation/WorkflowTemplates';

export default function AutomationPage() {
    return (
        <div className="container mx-auto py-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Automation</h1>
                <p className="text-muted-foreground">
                    Automate repetitive tasks with workflows
                </p>
            </div>

            <Tabs defaultValue="workflows">
                <TabsList>
                    <TabsTrigger value="workflows">My Workflows</TabsTrigger>
                    <TabsTrigger value="templates">Templates</TabsTrigger>
                </TabsList>

                <TabsContent value="workflows" className="mt-6">
                    <WorkflowList />
                </TabsContent>

                <TabsContent value="templates" className="mt-6">
                    <WorkflowTemplates />
                </TabsContent>
            </Tabs>
        </div>
    );
}
