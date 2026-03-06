'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Download, Send, Printer } from 'lucide-react';
import type { Invoice } from '@/types/payment';
import { useToast } from '@/hooks/use-toast';

export default function InvoiceDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInvoice();
    }, [params.id]);

    const fetchInvoice = async () => {
        try {
            const response = await fetch(`/api/invoices/${params.id}`);
            if (!response.ok) throw new Error('Failed to fetch invoice');
            const data = await response.json();
            setInvoice(data);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load invoice',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSendEmail = async () => {
        try {
            const response = await fetch(`/api/invoices/${params.id}/send`, {
                method: 'POST',
            });
            if (!response.ok) throw new Error('Failed to send invoice');

            toast({
                title: 'Success',
                description: 'Invoice sent successfully',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to send invoice',
                variant: 'destructive',
            });
        }
    };

    const handleDownload = () => {
        window.open(`/api/invoices/${params.id}/download`, '_blank');
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return <div className="p-8">Loading...</div>;
    }

    if (!invoice) {
        return <div className="p-8">Invoice not found</div>;
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'overdue':
                return 'bg-red-100 text-red-800';
            case 'sent':
                return 'bg-blue-100 text-blue-800';
            case 'draft':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handlePrint}>
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                    </Button>
                    <Button variant="outline" onClick={handleDownload}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                    </Button>
                    <Button onClick={handleSendEmail}>
                        <Send className="h-4 w-4 mr-2" />
                        Send Email
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Invoice {invoice.invoiceNumber}</CardTitle>
                        <Badge className={getStatusColor(invoice.status)}>
                            {invoice.status.toUpperCase()}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold mb-2">Bill To:</h3>
                            <p className="text-sm">{invoice.studentName}</p>
                            <p className="text-sm text-muted-foreground">{invoice.parentEmail}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm">
                                <span className="font-semibold">Issue Date:</span>{' '}
                                {new Date(invoice.issueDate).toLocaleDateString()}
                            </p>
                            <p className="text-sm">
                                <span className="font-semibold">Due Date:</span>{' '}
                                {new Date(invoice.dueDate).toLocaleDateString()}
                            </p>
                            {invoice.paidDate && (
                                <p className="text-sm">
                                    <span className="font-semibold">Paid Date:</span>{' '}
                                    {new Date(invoice.paidDate).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <h3 className="font-semibold mb-4">Items</h3>
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-2">Description</th>
                                    <th className="text-right py-2">Quantity</th>
                                    <th className="text-right py-2">Unit Price</th>
                                    <th className="text-right py-2">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.items.map((item) => (
                                    <tr key={item.id} className="border-b">
                                        <td className="py-2">{item.description}</td>
                                        <td className="text-right py-2">{item.quantity}</td>
                                        <td className="text-right py-2">
                                            AED {item.unitPrice.toLocaleString()}
                                        </td>
                                        <td className="text-right py-2">
                                            AED {item.total.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-end">
                        <div className="w-64 space-y-2">
                            <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span>AED {invoice.subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tax:</span>
                                <span>AED {invoice.tax.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Discount:</span>
                                <span>-AED {invoice.discount.toLocaleString()}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total:</span>
                                <span>AED {invoice.total.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-green-600">
                                <span>Amount Paid:</span>
                                <span>AED {invoice.amountPaid.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between font-bold text-red-600">
                                <span>Amount Due:</span>
                                <span>AED {invoice.amountDue.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
