'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WorkflowBuilder from '@/components/automation/WorkflowBuilder';
import WorkflowExecutionHistory from '@/components/automation/WorkflowExecutionHistory';
import { getWorkflow, updateWorkflow, createWorkflow } from '@/lib/api/integration';
import type { AutomationWorkflow } from '@/types/integration';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function WorkflowDetailPage() {
    const params = useParams();
    const router = useRouter();
    const workflowId = params.id as string;

    const [workflow, setWorkflow] = useState<AutomationWorkflow | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (workflowId && workflowId !== 'new') {
            loadWorkflow();
        } else {
            setLoading(false);
        }
    }, [workflowId]);

    const loadWorkflow = async () => {
        try {
            const data = await getWorkflow(workflowId);
            setWorkflow(data);
        } catch (error) {
            toast.error('Failed to load workflow');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (data: Partial<AutomationWorkflow>) => {
        try {
            const saved = workflow
                ? await updateWorkflow(workflow.id, data)
                : await createWorkflow({
                    ...data,
                    trigger: { type: 'event', config: {} },
                } as any);

            setWorkflow(saved);
            toast.success('Workflow saved successfully');

            if (!workflow) {
                router.push(`/dashboard/automation/${saved.id}`);
            }
        } catch (error) {
            toast.error('Failed to save workflow');
            console.error(error);
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
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">{workflow?.name || 'New Workflow'}</h1>
                    <p className="text-muted-foreground">{workflow?.description}</p>
                </div>
            </div>

            {workflow ? (
                <Tabs defaultValue="builder">
                    <TabsList>
                        <TabsTrigger value="builder">Builder</TabsTrigger>
                        <TabsTrigger value="history">History</TabsTrigger>
                    </TabsList>

                    <TabsContent value="builder" className="mt-6">
                        <WorkflowBuilder workflow={workflow} onSave={handleSave} />
                    </TabsContent>

                    <TabsContent value="history" className="mt-6">
                        <WorkflowExecutionHistory workflowId={workflow.id} />
                    </TabsContent>
                </Tabs>
            ) : (
                <WorkflowBuilder onSave={handleSave} />
            )}
        </div>
    );
}
