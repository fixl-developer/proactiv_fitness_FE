'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Send, Eye } from 'lucide-react';
import type { Invoice } from '@/types/payment';
import { useRouter } from 'next/navigation';

interface OverdueInvoicesProps {
    invoices: Invoice[];
    onSendReminder: (invoiceId: string) => void;
}

export default function OverdueInvoices({ invoices, onSendReminder }: OverdueInvoicesProps) {
    const router = useRouter();

    const getDaysOverdue = (dueDate: string) => {
        const due = new Date(dueDate);
        const today = new Date();
        const diffTime = today.getTime() - due.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    if (invoices.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        Overdue Invoices
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        No overdue invoices. Great job!
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    Overdue Invoices ({invoices.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {invoices.map((invoice) => {
                        const daysOverdue = getDaysOverdue(invoice.dueDate);
                        return (
                            <div
                                key={invoice.id}
                                className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium">{invoice.invoiceNumber}</p>
                                        <Badge variant="destructive">
                                            {daysOverdue} days overdue
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {invoice.studentName}
                                    </p>
                                    <p className="text-sm font-medium">
                                        AED {invoice.amountDue.toLocaleString()}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => router.push(`/billing/invoices/${invoice.id}`)}
                                    >
                                        <Eye className="h-4 w-4 mr-1" />
                                        View
                                    </Button>
                                    <Button
                                        variant="default"
                                        size="sm"
                                        onClick={() => onSendReminder(invoice.id)}
                                    >
                                        <Send className="h-4 w-4 mr-1" />
                                        Remind
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
