'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { getReportTemplates, createReportFromTemplate } from '@/lib/api/reporting';
import type { ReportTemplate } from '@/types/reporting';
import { FileText, Search, Filter, Download, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function ReportTemplates() {
    const router = useRouter();
    const [templates, setTemplates] = useState<ReportTemplate[]>([]);
    const [filteredTemplates, setFilteredTemplates] = useState<ReportTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    useEffect(() => {
        loadTemplates();
    }, []);

    useEffect(() => {
        filterTemplates();
    }, [searchQuery, selectedCategory, templates]);

    const loadTemplates = async () => {
        try {
            setLoading(true);
            const data = await getReportTemplates();
            setTemplates(data);
            setFilteredTemplates(data);
        } catch (error) {
            toast.error('Failed to load report templates');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filterTemplates = () => {
        let filtered = templates;

        if (searchQuery) {
            filtered = filtered.filter(
                (t) =>
                    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    t.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (selectedCategory !== 'all') {
            filtered = filtered.filter((t) => t.category === selectedCategory);
        }

        setFilteredTemplates(filtered);
    };

    const handleUseTemplate = async (templateId: string) => {
        try {
            const report = await createReportFromTemplate(templateId, {
                name: `New Report from Template`,
                status: 'draft',
            });
            toast.success('Report created from template');
            router.push(`/dashboard/reports/${report.id}`);
        } catch (error) {
            toast.error('Failed to create report from template');
            console.error(error);
        }
    };

    const categories = ['all', ...Array.from(new Set(templates.map((t) => t.category)))];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold">Report Templates</h2>
                <p className="text-muted-foreground">
                    Choose from pre-built templates to quickly create reports
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search templates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {categories.map((category) => (
                        <Button
                            key={category}
                            variant={selectedCategory === category ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedCategory(category)}
                        >
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => (
                    <Card key={template.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <FileText className="h-8 w-8 text-primary" />
                                <Badge variant="secondary">{template.category}</Badge>
                            </div>
                            <CardTitle className="mt-4">{template.name}</CardTitle>
                            <CardDescription>{template.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="text-sm text-muted-foreground">
                                    <span className="font-medium">
                                        {template.defaultColumns.length}
                                    </span>{' '}
                                    columns
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    <span className="font-medium">
                                        {template.defaultFilters.length}
                                    </span>{' '}
                                    default filters
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <Button
                                        className="flex-1"
                                        onClick={() => handleUseTemplate(template.id)}
                                    >
                                        Use Template
                                    </Button>
                                    <Button variant="outline" size="icon">
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredTemplates.length === 0 && (
                <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No templates found</h3>
                    <p className="text-muted-foreground">
                        Try adjusting your search or filter criteria
                    </p>
                </div>
            )}
        </div>
    );
}
