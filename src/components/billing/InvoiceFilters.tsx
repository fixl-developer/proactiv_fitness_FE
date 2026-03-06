'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

interface InvoiceFiltersProps {
    filters: {
        search: string;
        status: string;
        startDate: string;
        endDate: string;
    };
    onFilterChange: (filters: any) => void;
    onReset: () => void;
}

export default function InvoiceFilters({
    filters,
    onFilterChange,
    onReset,
}: InvoiceFiltersProps) {
    const handleChange = (key: string, value: string) => {
        onFilterChange({ ...filters, [key]: value });
    };

    return (
        <div className="space-y-4 p-4 border rounded-lg bg-card">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold">Filters</h3>
                <Button variant="ghost" size="sm" onClick={onReset}>
                    <X className="h-4 w-4 mr-1" />
                    Reset
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                    <Label htmlFor="search">Search</Label>
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="search"
                            placeholder="Invoice number or student..."
                            value={filters.search}
                            onChange={(e) => handleChange('search', e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                        value={filters.status}
                        onValueChange={(value) => handleChange('status', value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="sent">Sent</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="overdue">Overdue</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                        id="startDate"
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => handleChange('startDate', e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                        id="endDate"
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => handleChange('endDate', e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
}
