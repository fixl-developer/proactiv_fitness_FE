'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plug } from 'lucide-react';
import { toast } from 'sonner';

const TEMPLATES = [
    {
        id: '1',
        name: 'Stripe Payments',
        type: 'stripe',
        description: 'Accept payments and manage subscriptions',
        features: ['Payment processing', 'Subscription management', 'Refunds'],
    },
    {
        id: '2',
        name: 'Mailchimp Marketing',
        type: 'mailchimp',
        description: 'Email marketing and automation',
        features: ['Email campaigns', 'Audience management', 'Analytics'],
    },
    {
        id: '3',
        name: 'Slack Notifications',
        type: 'slack',
        description: 'Send notifications to Slack channels',
        features: ['Channel notifications', 'Direct messages', 'Custom webhooks'],
    },
    {
        id: '4',
        name: 'Zapier Automation',
        type: 'zapier',
        description: 'Connect with 5000+ apps',
        features: ['Multi-step workflows', 'Conditional logic', 'Filters'],
    },
];

export default function IntegrationTemplates() {
    const handleUseTemplate = (template: typeof TEMPLATES[0]) => {
        toast.success(`Setting up ${template.name} integration`);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Integration Templates</h2>
                <p className="text-muted-foreground">
                    Quick setup for popular integrations
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {TEMPLATES.map((template) => (
                    <Card key={template.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <Plug className="h-8 w-8 text-primary" />
                                <Badge variant="secondary" className="capitalize">
                                    {template.type}
                                </Badge>
                            </div>
                            <CardTitle className="mt-4">{template.name}</CardTitle>
                            <CardDescription>{template.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium mb-2">Features:</p>
                                    <ul className="text-sm text-muted-foreground space-y-1">
                                        {template.features.map((feature) => (
                                            <li key={feature}>• {feature}</li>
                                        ))}
                                    </ul>
                                </div>
                                <Button
                                    className="w-full"
                                    onClick={() => handleUseTemplate(template)}
                                >
                                    Connect
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
