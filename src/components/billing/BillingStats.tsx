'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, FileText, AlertCircle, TrendingUp } from 'lucide-react';

interface BillingStatsProps {
    totalRevenue: number;
    totalInvoices: number;
    overdueInvoices: number;
    paidInvoices: number;
    pendingAmount: number;
    currency?: string;
}

export default function BillingStats({
    totalRevenue,
    totalInvoices,
    overdueInvoices,
    paidInvoices,
    pendingAmount,
    currency = 'AED',
}: BillingStatsProps) {
    const paidPercentage = totalInvoices > 0 ? ((paidInvoices / totalInvoices) * 100).toFixed(1) : '0';

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {currency} {totalRevenue.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        From {totalInvoices} invoices
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Paid Invoices</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{paidInvoices}</div>
                    <p className="text-xs text-muted-foreground">
                        {paidPercentage}% of total invoices
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Overdue Invoices</CardTitle>
                    <AlertCircle className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-destructive">{overdueInvoices}</div>
                    <p className="text-xs text-muted-foreground">
                        Require immediate attention
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {currency} {pendingAmount.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Outstanding payments
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
