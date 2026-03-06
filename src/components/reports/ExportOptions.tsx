'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Download, FileText, FileSpreadsheet, FileJson } from 'lucide-react';
import { toast } from 'sonner';

interface ExportOptionsProps {
    reportId: string;
    onExport: (format: 'pdf' | 'excel' | 'csv' | 'json') => Promise<void>;
}

export default function ExportOptions({ reportId, onExport }: ExportOptionsProps) {
    const [open, setOpen] = useState(false);
    const [format, setFormat] = useState<'pdf' | 'excel' | 'csv' | 'json'>('pdf');
    const [exporting, setExporting] = useState(false);

    const handleExport = async () => {
        try {
            setExporting(true);
            await onExport(format);
            toast.success(`Report exported as ${format.toUpperCase()}`);
            setOpen(false);
        } catch (error) {
            toast.error('Failed to export report');
            console.error(error);
        } finally {
            setExporting(false);
        }
    };

    const formatOptions = [
        { value: 'pdf', label: 'PDF', icon: FileText, description: 'Portable Document Format' },
        { value: 'excel', label: 'Excel', icon: FileSpreadsheet, description: 'Microsoft Excel' },
        { value: 'csv', label: 'CSV', icon: FileSpreadsheet, description: 'Comma Separated Values' },
        { value: 'json', label: 'JSON', icon: FileJson, description: 'JavaScript Object Notation' },
    ];

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Export Report</DialogTitle>
                    <DialogDescription>Choose a format to export your report</DialogDescription>
                </DialogHeader>

                <RadioGroup value={format} onValueChange={(value: any) => setFormat(value)}>
                    <div className="space-y-3">
                        {formatOptions.map((option) => (
                            <div
                                key={option.value}
                                className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent"
                                onClick={() => setFormat(option.value as any)}
                            >
                                <RadioGroupItem value={option.value} id={option.value} />
                                <option.icon className="h-5 w-5 text-muted-foreground" />
                                <Label
                                    htmlFor={option.value}
                                    className="flex-1 cursor-pointer"
                                >
                                    <div className="font-medium">{option.label}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {option.description}
                                    </div>
                                </Label>
                            </div>
                        ))}
                    </div>
                </RadioGroup>

                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleExport} disabled={exporting}>
                        {exporting ? 'Exporting...' : 'Export'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
