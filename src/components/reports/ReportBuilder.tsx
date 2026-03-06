'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X } from 'lucide-react';
import type { Report, ReportFilter, ReportColumn } from '@/types/reporting';

interface ReportBuilderProps {
    report?: Report;
    onSave: (data: Omit<Report, 'id' | 'createdAt'>) => void;
    onCancel: () => void;
}

export default function ReportBuilder({ report, onSave, onCancel }: ReportBuilderProps) {
    const [formData, setFormData] = useState({
        name: report?.name || '',
        description: report?.description || '',
        type: report?.type || 'custom',
        format: report?.format || 'pdf',
        status: report?.status || 'draft',
    });

    const [filters, setFilters] = useState<ReportFilter[]>(report?.filters || []);
    const [columns, setColumns] = useState<ReportColumn[]>(report?.columns || []);

    const handleAddFilter = () => {
        setFilters([...filters, { field: '', operator: 'equals', value: '' }]);
    };

    const handleRemoveFilter = (index: number) => {
        setFilters(filters.filter((_, i) => i !== index));
    };

    const handleAddColumn = () => {
        setColumns([...columns, { field: '', label: '', type: 'string' }]);
    };

    const handleRemoveColumn = (index: number) => {
        setColumns(columns.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            filters,
            columns,
            groupBy: [],
            sortBy: [],
            createdBy: 'current-user',
        } as any);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{report ? 'Edit' : 'Create'} Report</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Report Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="type">Report Type</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value: any) =>
                                    setFormData({ ...formData, type: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="revenue">Revenue</SelectItem>
                                    <SelectItem value="student">Student</SelectItem>
                                    <SelectItem value="attendance">Attendance</SelectItem>
                                    <SelectItem value="staff">Staff</SelectItem>
                                    <SelectItem value="custom">Custom</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Filters</Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleAddFilter}
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Filter
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {filters.map((filter, index) => (
                                <div key={index} className="flex gap-2">
                                    <Input placeholder="Field" className="flex-1" />
                                    <Select defaultValue="equals">
                                        <SelectTrigger className="w-[150px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="equals">Equals</SelectItem>
                                            <SelectItem value="contains">Contains</SelectItem>
                                            <SelectItem value="greater_than">Greater Than</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Input placeholder="Value" className="flex-1" />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleRemoveFilter(index)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Columns</Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleAddColumn}
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Column
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {columns.map((column, index) => (
                                <div key={index} className="flex gap-2">
                                    <Input placeholder="Field" className="flex-1" />
                                    <Input placeholder="Label" className="flex-1" />
                                    <Select defaultValue="string">
                                        <SelectTrigger className="w-[120px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="string">String</SelectItem>
                                            <SelectItem value="number">Number</SelectItem>
                                            <SelectItem value="date">Date</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleRemoveColumn(index)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="format">Output Format</Label>
                            <Select
                                value={formData.format}
                                onValueChange={(value: any) =>
                                    setFormData({ ...formData, format: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pdf">PDF</SelectItem>
                                    <SelectItem value="excel">Excel</SelectItem>
                                    <SelectItem value="csv">CSV</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value: any) =>
                                    setFormData({ ...formData, status: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                        <Button type="submit">Save Report</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
