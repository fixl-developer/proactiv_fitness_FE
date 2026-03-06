'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { AutomationWorkflow, WorkflowTrigger, WorkflowAction } from '@/types/integration';
import { Plus, Trash2, MoveUp, MoveDown } from 'lucide-react';
import { toast } from 'sonner';

interface WorkflowBuilderProps {
    workflow?: AutomationWorkflow;
    onSave: (workflow: Partial<AutomationWorkflow>) => void;
}

export default function WorkflowBuilder({ workflow, onSave }: WorkflowBuilderProps) {
    const [name, setName] = useState(workflow?.name || '');
    const [description, setDescription] = useState(workflow?.description || '');
    const [actions, setActions] = useState<WorkflowAction[]>(workflow?.actions || []);

    const addAction = () => {
        const newAction: WorkflowAction = {
            id: Date.now().toString(),
            type: 'email',
            config: {},
            order: actions.length,
        };
        setActions([...actions, newAction]);
    };

    const removeAction = (id: string) => {
        setActions(actions.filter((a) => a.id !== id));
    };

    const moveAction = (index: number, direction: 'up' | 'down') => {
        const newActions = [...actions];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newActions.length) return;

        [newActions[index], newActions[targetIndex]] = [newActions[targetIndex], newActions[index]];
        newActions.forEach((action, i) => (action.order = i));
        setActions(newActions);
    };

    const handleSave = () => {
        if (!name.trim()) {
            toast.error('Please enter workflow name');
            return;
        }

        onSave({
            name,
            description,
            actions,
            enabled: true,
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Workflow Builder</CardTitle>
                <CardDescription>Create automated workflows for your business</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="name">Workflow Name</Label>
                    <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="My Workflow"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe what this workflow does..."
                        rows={3}
                    />
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <Label>Actions</Label>
                        <Button size="sm" onClick={addAction}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Action
                        </Button>
                    </div>

                    {actions.map((action, index) => (
                        <Card key={action.id}>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="font-medium capitalize">{action.type}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Action {index + 1}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => moveAction(index, 'up')}
                                            disabled={index === 0}
                                        >
                                            <MoveUp className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => moveAction(index, 'down')}
                                            disabled={index === actions.length - 1}
                                        >
                                            <MoveDown className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeAction(action.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {actions.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                            No actions added yet
                        </div>
                    )}
                </div>

                <Button onClick={handleSave} className="w-full">
                    Save Workflow
                </Button>
            </CardContent>
        </Card>
    );
}
