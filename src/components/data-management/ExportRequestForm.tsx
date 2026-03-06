'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { createExportRequest } from '@/lib/api/dataManagement';
import { toast } from 'sonner';
import { Download } from 'lucide-react';

const AVAILABLE_ENTITIES = [
    { id: 'profile', label: 'Profile Information' },
    { id: 'bookings', label: 'Booking History' },
    { id: 'payments', label: 'Payment Records' },
    { id: 'attendance', label: 'Attendance Records' },
    { id: 'communications', label: 'Communications' },
    { id: 'documents', label: 'Documents' },
];

export default function ExportRequestForm() {
    const [type, setType] = useState<'full' | 'partial'>('full');
    const [format, setFormat] = useState<'json' | 'csv' | 'xml'>('json');
    const [selectedEntities, setSelectedEntities] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);

    const handleEntityToggle = (entityId: string) => {
        setSelectedEntities((prev) =>
            prev.includes(entityId) ? prev.filter((id) => id !== entityId) : [...prev, entityId]
        );
    };

    const handleSubmit = async () => {
        if (type === 'partial' && selectedEntities.length === 0) {
            toast.error('Please select at least one entity to export');
            return;
        }

        try {
            setSubmitting(true);
            await createExportRequest({
                userId: 'current-user', // Replace with actual user ID
                type,
                format,
                entities: type === 'full' ? AVAILABLE_ENTITIES.map((e) => e.id) : selectedEntities,
            });
            toast.success('Export request submitted successfully');
            setSelectedEntities([]);
        } catch (error) {
            toast.error('Failed to submit export request');
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Request Data Export</CardTitle>
                <CardDescription>
                    Export your personal data in compliance with GDPR regulations
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Export Type */}
                <div className="space-y-2">
                    <Label>Export Type</Label>
                    <RadioGroup value={type} onValueChange={(value: any) => setType(value)}>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="full" id="full" />
                            <Label htmlFor="full">Full Export (All Data)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="partial" id="partial" />
                            <Label htmlFor="partial">Partial Export (Select Entities)</Label>
                        </div>
                    </RadioGroup>
                </div>

                {/* Entities Selection */}
                {type === 'partial' && (
                    <div className="space-y-2">
                        <Label>Select Data to Export</Label>
                        <div className="space-y-2">
                            {AVAILABLE_ENTITIES.map((entity) => (
                                <div key={entity.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={entity.id}
                                        checked={selectedEntities.includes(entity.id)}
                                        onCheckedChange={() => handleEntityToggle(entity.id)}
                                    />
                                    <Label htmlFor={entity.id} className="cursor-pointer">
                                        {entity.label}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Format Selection */}
                <div className="space-y-2">
                    <Label>Export Format</Label>
                    <RadioGroup value={format} onValueChange={(value: any) => setFormat(value)}>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="json" id="json" />
                            <Label htmlFor="json">JSON</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="csv" id="csv" />
                            <Label htmlFor="csv">CSV</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="xml" id="xml" />
                            <Label htmlFor="xml">XML</Label>
                        </div>
                    </RadioGroup>
                </div>

                <Button onClick={handleSubmit} disabled={submitting} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    {submitting ? 'Submitting...' : 'Submit Export Request'}
                </Button>
            </CardContent>
        </Card>
    );
}
