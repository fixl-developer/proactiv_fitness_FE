'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Calendar, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function ExportScheduler() {
    const [enabled, setEnabled] = useState(false);
    const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
    const [time, setTime] = useState('09:00');
    const [format, setFormat] = useState<'json' | 'csv' | 'xml'>('json');

    const handleSave = () => {
        toast.success('Export schedule saved successfully');
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Schedule Automatic Exports</CardTitle>
                        <CardDescription>
                            Automatically export your data on a regular schedule
                        </CardDescription>
                    </div>
                    <Switch checked={enabled} onCheckedChange={setEnabled} />
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {enabled && (
                    <>
                        <div className="space-y-2">
                            <Label>Frequency</Label>
                            <Select
                                value={frequency}
                                onValueChange={(value: any) => setFrequency(value)}
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

                        <div className="space-y-2">
                            <Label>Export Format</Label>
                            <Select value={format} onValueChange={(value: any) => setFormat(value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="json">JSON</SelectItem>
                                    <SelectItem value="csv">CSV</SelectItem>
                                    <SelectItem value="xml">XML</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="bg-muted p-4 rounded-lg">
                            <h4 className="font-medium mb-2">Schedule Summary</h4>
                            <p className="text-sm text-muted-foreground">
                                Your data will be exported{' '}
                                <span className="font-medium text-foreground">{frequency}</span> at{' '}
                                <span className="font-medium text-foreground">{time}</span> in{' '}
                                <span className="font-medium text-foreground uppercase">
                                    {format}
                                </span>{' '}
                                format.
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
