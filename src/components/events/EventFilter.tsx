'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface EventFilterProps {
    onFilterChange: (filters: any) => void;
}

const EVENT_TYPES = [
    'student.created',
    'student.updated',
    'booking.created',
    'booking.cancelled',
    'payment.completed',
    'payment.failed',
];

export default function EventFilter({ onFilterChange }: EventFilterProps) {
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [status, setStatus] = useState<string>('all');

    const handleTypeToggle = (type: string) => {
        const newTypes = selectedTypes.includes(type)
            ? selectedTypes.filter((t) => t !== type)
            : [...selectedTypes, type];

        setSelectedTypes(newTypes);
        onFilterChange({ types: newTypes, status });
    };

    const handleStatusChange = (newStatus: string) => {
        setStatus(newStatus);
        onFilterChange({ types: selectedTypes, status: newStatus });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={status} onValueChange={handleStatusChange}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="processed">Processed</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Event Types</Label>
                    <div className="space-y-2">
                        {EVENT_TYPES.map((type) => (
                            <div key={type} className="flex items-center space-x-2">
                                <Checkbox
                                    id={type}
                                    checked={selectedTypes.includes(type)}
                                    onCheckedChange={() => handleTypeToggle(type)}
                                />
                                <Label htmlFor={type} className="cursor-pointer text-sm">
                                    {type}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
