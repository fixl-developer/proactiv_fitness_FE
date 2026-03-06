'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { WorkflowTrigger } from '@/types/integration';

interface TriggerConfigProps {
    trigger?: WorkflowTrigger;
    onChange: (trigger: WorkflowTrigger) => void;
}

export default function TriggerConfig({ trigger, onChange }: TriggerConfigProps) {
    const [type, setType] = useState<WorkflowTrigger['type']>(trigger?.type || 'event');
    const [config, setConfig] = useState<Record<string, any>>(trigger?.config || {});

    const handleTypeChange = (newType: WorkflowTrigger['type']) => {
        setType(newType);
        onChange({ type: newType, config: {} });
    };

    const handleConfigChange = (key: string, value: any) => {
        const newConfig = { ...config, [key]: value };
        setConfig(newConfig);
        onChange({ type, config: newConfig });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Trigger Configuration</CardTitle>
                <CardDescription>Define when this workflow should run</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Trigger Type</Label>
                    <Select value={type} onValueChange={handleTypeChange}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="event">Event</SelectItem>
                            <SelectItem value="schedule">Schedule</SelectItem>
                            <SelectItem value="webhook">Webhook</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {type === 'event' && (
                    <div className="space-y-2">
                        <Label>Event Name</Label>
                        <Input
                            value={config.eventName || ''}
                            onChange={(e) => handleConfigChange('eventName', e.target.value)}
                            placeholder="student.created"
                        />
                    </div>
                )}

                {type === 'schedule' && (
                    <div className="space-y-2">
                        <Label>Cron Expression</Label>
                        <Input
                            value={config.cron || ''}
                            onChange={(e) => handleConfigChange('cron', e.target.value)}
                            placeholder="0 9 * * *"
                        />
                    </div>
                )}

                {type === 'webhook' && (
                    <div className="space-y-2">
                        <Label>Webhook Path</Label>
                        <Input
                            value={config.path || ''}
                            onChange={(e) => handleConfigChange('path', e.target.value)}
                            placeholder="/webhook/my-workflow"
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
