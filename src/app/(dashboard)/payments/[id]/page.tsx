'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Download, RefreshCw } from 'lucide-react';
import type { Payment } from '@/types/payment';
import { useToast } from '@/hooks/use-toast';
import RefundModal from '@/components/payments/RefundModal';

export default function PaymentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const [payment, setPayment] = useState<Payment | null>(null);
    const [loading, setLoading] = useState(true);
    const [showRefundModal, setShowRefundModal] = useState(false);

    useEffect(() => {
        fetchPayment();
    }, [params.id]);

    const fetchPayment = async () => {
        try {
            const response = await fetch(`/api/payments/${params.id}`);
            if (!response.ok) throw new Error('Failed to fetch payment');
            const data = await response.json();
            setPayment(data);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load payment',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadReceipt = () => {
        window.open(`/api/payments/${params.id}/receipt`, '_blank');
    };


    const handleRefundSuccess = () => {
        fetchPayment();
        setShowRefundModal(false);
    };

    if (loading) {
        return <div className="p-8">Loading...</div>;
    }

    if (!payment) {
        return <div className="p-8">Payment not found</div>;
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            case 'processing':
                return 'bg-yellow-100 text-yellow-800';
            case 'pending':
                return 'bg-blue-100 text-blue-800';
            case 'refunded':
                return 'bg-purple-100 text-purple-800';
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
                    <Button variant="outline" onClick={handleDownloadReceipt}>
                        <Download className="h-4 w-4 mr-2" />
                        Download Receipt
                    </Button>
                    {payment.status === 'completed' && !payment.refundAmount && (
                        <Button variant="destructive" onClick={() => setShowRefundModal(true)}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refund
                        </Button>
                    )}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Payment Details</CardTitle>
                        <Badge className={getStatusColor(payment.status)}>
                            {payment.status.toUpperCase()}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold mb-4">Payment Information</h3>
                            <div className="space-y-2">
                                <div>
                                    <p className="text-sm text-muted-foreground">Transaction ID</p>
                                    <p className="font-medium">{payment.transactionId || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Student</p>
                                    <p className="font-medium">{payment.studentName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Description</p>
                                    <p className="font-medium">{payment.description}</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-4">Payment Method</h3>
                            <div className="space-y-2">
                                <div>
                                    <p className="text-sm text-muted-foreground">Method</p>
                                    <p className="font-medium capitalize">
                                        {payment.paymentMethod.replace('_', ' ')}
                                    </p>
                                </div>
                                {payment.cardBrand && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Card</p>
                                        <p className="font-medium">
                                            {payment.cardBrand} •••• {payment.cardLast4}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold mb-4">Dates</h3>
                            <div className="space-y-2">
                                <div>
                                    <p className="text-sm text-muted-foreground">Payment Date</p>
                                    <p className="font-medium">
                                        {new Date(payment.paymentDate).toLocaleString()}
                                    </p>
                                </div>
                                {payment.processedAt && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Processed At</p>
                                        <p className="font-medium">
                                            {new Date(payment.processedAt).toLocaleString()}
                                        </p>
                                    </div>
                                )}
                                {payment.refundedAt && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Refunded At</p>
                                        <p className="font-medium">
                                            {new Date(payment.refundedAt).toLocaleString()}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-4">Amount</h3>
                            <div className="space-y-2">
                                <div>
                                    <p className="text-sm text-muted-foreground">Payment Amount</p>
                                    <p className="text-2xl font-bold">
                                        {payment.currency} {payment.amount.toLocaleString()}
                                    </p>
                                </div>
                                {payment.refundAmount && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Refund Amount</p>
                                        <p className="text-xl font-bold text-red-600">
                                            -{payment.currency} {payment.refundAmount.toLocaleString()}
                                        </p>
                                        {payment.refundReason && (
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Reason: {payment.refundReason}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {showRefundModal && (
                <RefundModal
                    open={showRefundModal}
                    onClose={() => setShowRefundModal(false)}
                    payment={payment}
                    onSuccess={handleRefundSuccess}
                />
            )}
        </div>
    );
}
