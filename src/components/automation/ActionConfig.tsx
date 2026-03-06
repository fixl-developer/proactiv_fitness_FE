'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { WorkflowAction } from '@/types/integration';

interface ActionConfigProps {
    action: WorkflowAction;
    onChange: (action: WorkflowAction) => void;
}

export default function ActionConfig({ action, onChange }: ActionConfigProps) {
    const [type, setType] = useState<WorkflowAction['type']>(action.type);
    const [config, setConfig] = useState<Record<string, any>>(action.config);

    const handleTypeChange = (newType: WorkflowAction['type']) => {
        setType(newType);
        onChange({ ...action, type: newType, config: {} });
    };

    const handleConfigChange = (key: string, value: any) => {
        const newConfig = { ...config, [key]: value };
        setConfig(newConfig);
        onChange({ ...action, config: newConfig });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Action Configuration</CardTitle>
                <CardDescription>Configure what this action should do</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Action Type</Label>
                    <Select value={type} onValueChange={handleTypeChange}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="email">Send Email</SelectItem>
                            <SelectItem value="webhook">Call Webhook</SelectItem>
                            <SelectItem value="api_call">API Call</SelectItem>
                            <SelectItem value="database">Database Operation</SelectItem>
                            <SelectItem value="notification">Send Notification</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {type === 'email' && (
                    <>
                        <div className="space-y-2">
                            <Label>To Email</Label>
                            <Input
                                value={config.to || ''}
                                onChange={(e) => handleConfigChange('to', e.target.value)}
                                placeholder="user@example.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Subject</Label>
                            <Input
                                value={config.subject || ''}
                                onChange={(e) => handleConfigChange('subject', e.target.value)}
                                placeholder="Email subject"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Body</Label>
                            <Textarea
                                value={config.body || ''}
                                onChange={(e) => handleConfigChange('body', e.target.value)}
                                placeholder="Email body"
                                rows={4}
                            />
                        </div>
                    </>
                )}

                {type === 'webhook' && (
                    <div className="space-y-2">
                        <Label>Webhook URL</Label>
                        <Input
                            value={config.url || ''}
                            onChange={(e) => handleConfigChange('url', e.target.value)}
                            placeholder="https://example.com/webhook"
                        />
                    </div>
                )}

                {type === 'notification' && (
                    <>
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                                value={config.title || ''}
                                onChange={(e) => handleConfigChange('title', e.target.value)}
                                placeholder="Notification title"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Message</Label>
                            <Textarea
                                value={config.message || ''}
                                onChange={(e) => handleConfigChange('message', e.target.value)}
                                placeholder="Notification message"
                                rows={3}
                            />
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
