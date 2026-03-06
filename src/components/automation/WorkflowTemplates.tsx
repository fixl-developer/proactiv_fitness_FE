'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap } from 'lucide-react';
import { toast } from 'sonner';

const TEMPLATES = [
    {
        id: '1',
        name: 'Welcome Email',
        description: 'Send welcome email to new students',
        trigger: 'student.created',
        actions: ['send_email'],
    },
    {
        id: '2',
        name: 'Payment Reminder',
        description: 'Send reminder for overdue payments',
        trigger: 'payment.overdue',
        actions: ['send_email', 'send_notification'],
    },
    {
        id: '3',
        name: 'Class Reminder',
        description: 'Remind students about upcoming classes',
        trigger: 'class.upcoming',
        actions: ['send_sms', 'send_notification'],
    },
    {
        id: '4',
        name: 'Attendance Alert',
        description: 'Alert parents when student misses class',
        trigger: 'attendance.missed',
        actions: ['send_email', 'send_sms'],
    },
];

export default function WorkflowTemplates() {
    const handleUseTemplate = (template: typeof TEMPLATES[0]) => {
        toast.success(`Using template: ${template.name}`);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Workflow Templates</h2>
                <p className="text-muted-foreground">
                    Quick start with pre-built automation templates
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {TEMPLATES.map((template) => (
                    <Card key={template.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <Zap className="h-8 w-8 text-primary" />
                                <Badge variant="secondary">{template.actions.length} actions</Badge>
                            </div>
                            <CardTitle className="mt-4">{template.name}</CardTitle>
                            <CardDescription>{template.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium mb-2">Trigger:</p>
                                    <Badge variant="outline">{template.trigger}</Badge>
                                </div>
                                <Button
                                    className="w-full"
                                    onClick={() => handleUseTemplate(template)}
                                >
                                    Use Template
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
