'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download } from 'lucide-react';
import { toast } from 'sonner';

interface ExportTemplate {
    id: string;
    name: string;
    description: string;
    entities: string[];
    format: 'json' | 'csv' | 'xml';
}

const TEMPLATES: ExportTemplate[] = [
    {
        id: '1',
        name: 'Full Profile Export',
        description: 'Complete export of all your personal data',
        entities: ['profile', 'bookings', 'payments', 'attendance', 'communications', 'documents'],
        format: 'json',
    },
    {
        id: '2',
        name: 'Financial Records',
        description: 'Export all payment and billing information',
        entities: ['payments', 'invoices', 'wallet'],
        format: 'csv',
    },
    {
        id: '3',
        name: 'Activity History',
        description: 'Export booking and attendance records',
        entities: ['bookings', 'attendance'],
        format: 'json',
    },
    {
        id: '4',
        name: 'Communication Log',
        description: 'Export all communications and notifications',
        entities: ['communications', 'notifications'],
        format: 'json',
    },
];

export default function ExportTemplates() {
    const handleUseTemplate = (template: ExportTemplate) => {
        toast.success(`Using template: ${template.name}`);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Export Templates</h2>
                <p className="text-muted-foreground">
                    Quick export templates for common data requests
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {TEMPLATES.map((template) => (
                    <Card key={template.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <FileText className="h-8 w-8 text-primary" />
                                <Badge variant="secondary" className="uppercase">
                                    {template.format}
                                </Badge>
                            </div>
                            <CardTitle className="mt-4">{template.name}</CardTitle>
                            <CardDescription>{template.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium mb-2">Includes:</p>
                                    <div className="flex flex-wrap gap-1">
                                        {template.entities.map((entity) => (
                                            <Badge key={entity} variant="outline">
                                                {entity}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                                <Button
                                    className="w-full"
                                    onClick={() => handleUseTemplate(template)}
                                >
                                    <Download className="h-4 w-4 mr-2" />
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
