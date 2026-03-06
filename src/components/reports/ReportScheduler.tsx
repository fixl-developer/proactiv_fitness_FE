'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { ReportSchedule } from '@/types/reporting';
import { Calendar, Clock, Mail, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

interface ReportSchedulerProps {
    schedule?: ReportSchedule;
    onSave: (schedule: ReportSchedule) => void;
}

export default function ReportScheduler({ schedule, onSave }: ReportSchedulerProps) {
    const [enabled, setEnabled] = useState(schedule?.enabled || false);
    const [frequency, setFrequency] = useState<ReportSchedule['frequency']>(
        schedule?.frequency || 'daily'
    );
    const [time, setTime] = useState(schedule?.time || '09:00');
    const [recipients, setRecipients] = useState<string[]>(schedule?.recipients || []);
    const [newRecipient, setNewRecipient] = useState('');

    const handleAddRecipient = () => {
        if (!newRecipient) return;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newRecipient)) {
            toast.error('Please enter a valid email address');
            return;
        }

        if (recipients.includes(newRecipient)) {
            toast.error('This email is already added');
            return;
        }

        setRecipients([...recipients, newRecipient]);
        setNewRecipient('');
    };

    const handleRemoveRecipient = (email: string) => {
        setRecipients(recipients.filter((r) => r !== email));
    };

    const handleSave = () => {
        if (enabled && recipients.length === 0) {
            toast.error('Please add at least one recipient');
            return;
        }

        const scheduleData: ReportSchedule = {
            enabled,
            frequency,
            time,
            recipients,
        };

        onSave(scheduleData);
        toast.success('Schedule saved successfully');
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Schedule Report</CardTitle>
                        <CardDescription>
                            Automatically run and email this report on a schedule
                        </CardDescription>
                    </div>
                    <Switch checked={enabled} onCheckedChange={setEnabled} />
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {enabled && (
                    <>
                        {/* Frequency */}
                        <div className="space-y-2">
                            <Label>Frequency</Label>
                            <Select
                                value={frequency}
                                onValueChange={(value) =>
                                    setFrequency(value as ReportSchedule['frequency'])
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="daily">Daily</SelectItem>
                                    <SelectItem value="weekly">Weekly</SelectItem>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Time */}
                        <div className="space-y-2">
                            <Label>Time</Label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="time"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Recipients */}
                        <div className="space-y-2">
                            <Label>Recipients</Label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="email"
                                        placeholder="Enter email address"
                                        value={newRecipient}
                                        onChange={(e) => setNewRecipient(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddRecipient();
                                            }
                                        }}
                                        className="pl-10"
                                    />
                                </div>
                                <Button type="button" onClick={handleAddRecipient}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>

                            {recipients.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {recipients.map((email) => (
                                        <Badge key={email} variant="secondary" className="gap-1">
                                            {email}
                                            <button
                                                onClick={() => handleRemoveRecipient(email)}
                                                className="ml-1 hover:text-destructive"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Schedule Summary */}
                        <div className="bg-muted p-4 rounded-lg">
                            <h4 className="font-medium mb-2">Schedule Summary</h4>
                            <p className="text-sm text-muted-foreground">
                                This report will run{' '}
                                <span className="font-medium text-foreground">{frequency}</span> at{' '}
                                <span className="font-medium text-foreground">{time}</span> and be
                                sent to{' '}
                                <span className="font-medium text-foreground">
                                    {recipients.length}
                                </span>{' '}
                                recipient{recipients.length !== 1 ? 's' : ''}.
                            </p>
                        </div>
                    </>
                )}

                <Button onClick={handleSave} className="w-full">
                    Save Schedule
                </Button>
            </CardContent>
        </Card>
    );
}
