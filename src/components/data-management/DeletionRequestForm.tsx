'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createDeletionRequest } from '@/lib/api/dataManagement';
import { toast } from 'sonner';
import { Trash2, AlertTriangle } from 'lucide-react';

const AVAILABLE_ENTITIES = [
    { id: 'profile', label: 'Profile Information' },
    { id: 'bookings', label: 'Booking History' },
    { id: 'payments', label: 'Payment Records' },
    { id: 'attendance', label: 'Attendance Records' },
    { id: 'communications', label: 'Communications' },
    { id: 'documents', label: 'Documents' },
];

export default function DeletionRequestForm() {
    const [type, setType] = useState<'soft' | 'hard'>('soft');
    const [reason, setReason] = useState('');
    const [selectedEntities, setSelectedEntities] = useState<string[]>([]);
    const [confirmed, setConfirmed] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleEntityToggle = (entityId: string) => {
        setSelectedEntities((prev) =>
            prev.includes(entityId) ? prev.filter((id) => id !== entityId) : [...prev, entityId]
        );
    };

    const handleSubmit = async () => {
        if (selectedEntities.length === 0) {
            toast.error('Please select at least one entity to delete');
            return;
        }

        if (!reason.trim()) {
            toast.error('Please provide a reason for deletion');
            return;
        }

        if (!confirmed) {
            toast.error('Please confirm that you understand the consequences');
            return;
        }

        try {
            setSubmitting(true);
            await createDeletionRequest({
                userId: 'current-user',
                type,
                reason,
                entities: selectedEntities,
            });
            toast.success('Deletion request submitted successfully');
            setReason('');
            setSelectedEntities([]);
            setConfirmed(false);
        } catch (error) {
            toast.error('Failed to submit deletion request');
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Request Data Deletion</CardTitle>
                <CardDescription>
                    Request deletion of your personal data (Right to be Forgotten)
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        This action cannot be undone. Please carefully review your selection before
                        submitting.
                    </AlertDescription>
                </Alert>

                {/* Deletion Type */}
                <div className="space-y-2">
                    <Label>Deletion Type</Label>
                    <RadioGroup value={type} onValueChange={(value: any) => setType(value)}>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="soft" id="soft" />
                            <Label htmlFor="soft">Soft Delete (Anonymize)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="hard" id="hard" />
                            <Label htmlFor="hard">Hard Delete (Permanent Removal)</Label>
                        </div>
                    </RadioGroup>
                </div>

                {/* Entities Selection */}
                <div className="space-y-2">
                    <Label>Select Data to Delete</Label>
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

                {/* Reason */}
                <div className="space-y-2">
                    <Label htmlFor="reason">Reason for Deletion</Label>
                    <Textarea
                        id="reason"
                        placeholder="Please provide a reason for this deletion request..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={4}
                    />
                </div>

                {/* Confirmation */}
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="confirm"
                        checked={confirmed}
                        onCheckedChange={(checked) => setConfirmed(checked as boolean)}
                    />
                    <Label htmlFor="confirm" className="cursor-pointer">
                        I understand that this action cannot be undone
                    </Label>
                </div>

                <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    variant="destructive"
                    className="w-full"
                >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {submitting ? 'Submitting...' : 'Submit Deletion Request'}
                </Button>
            </CardContent>
        </Card>
    );
}
