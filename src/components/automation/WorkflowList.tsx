'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { getWorkflows, updateWorkflow, deleteWorkflow, executeWorkflow } from '@/lib/api/integration';
import type { AutomationWorkflow } from '@/types/integration';
import { Plus, Play, Settings, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function WorkflowList() {
    const router = useRouter();
    const [workflows, setWorkflows] = useState<AutomationWorkflow[]>([]);
    const [loading, setLoading] = useState(true);
    const [executing, setExecuting] = useState<string | null>(null);

    useEffect(() => {
        loadWorkflows();
    }, []);

    const loadWorkflows = async () => {
        try {
            const data = await getWorkflows();
            setWorkflows(data);
        } catch (error) {
            toast.error('Failed to load workflows');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (id: string, enabled: boolean) => {
        try {
            const updated = await updateWorkflow(id, { enabled });
            setWorkflows(workflows.map((w) => (w.id === id ? updated : w)));
            toast.success(`Workflow ${enabled ? 'enabled' : 'disabled'}`);
        } catch (error) {
            toast.error('Failed to update workflow');
            console.error(error);
        }
    };

    const handleExecute = async (id: string) => {
        try {
            setExecuting(id);
            await executeWorkflow(id);
            toast.success('Workflow execution started');
        } catch (error) {
            toast.error('Failed to execute workflow');
            console.error(error);
        } finally {
            setExecuting(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this workflow?')) return;

        try {
            await deleteWorkflow(id);
            setWorkflows(workflows.filter((w) => w.id !== id));
            toast.success('Workflow deleted');
        } catch (error) {
            toast.error('Failed to delete workflow');
            console.error(error);
        }
    };

    if (loading) {
        return <div className="animate-pulse h-64 bg-muted rounded-lg"></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Automation Workflows</h2>
                    <p className="text-muted-foreground">Automate repetitive tasks</p>
                </div>
                <Button onClick={() => router.push('/dashboard/automation/new')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Workflow
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {workflows.map((workflow) => (
                    <Card key={workflow.id}>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <CardTitle>{workflow.name}</CardTitle>
                                    <CardDescription>{workflow.description}</CardDescription>
                                </div>
                                <Switch
                                    checked={workflow.enabled}
                                    onCheckedChange={(checked) => handleToggle(workflow.id, checked)}
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="flex gap-2">
                                    <Badge variant="secondary">
                                        {workflow.actions.length} actions
                                    </Badge>
                                    {workflow.lastRunAt && (
                                        <Badge variant="outline">
                                            Last run: {new Date(workflow.lastRunAt).toLocaleDateString()}
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleExecute(workflow.id)}
                                        disabled={executing === workflow.id}
                                    >
                                        <Play className="h-4 w-4 mr-2" />
                                        {executing === workflow.id ? 'Running...' : 'Run'}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            router.push(`/dashboard/automation/${workflow.id}`)
                                        }
                                    >
                                        <Settings className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDelete(workflow.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {workflows.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">No workflows created yet</p>
                </div>
            )}
        </div>
    );
}
