'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FranchiseDashboard from '@/components/franchise/FranchiseDashboard';
import RoyaltyTracking from '@/components/franchise/RoyaltyTracking';
import RevenueShare from '@/components/franchise/RevenueShare';
import {
    getFranchise,
    getFranchiseMetrics,
    getRoyaltyPayments,
} from '@/lib/api/enterprise';
import type { Franchise, FranchiseMetrics, RoyaltyPayment } from '@/types/enterprise';
import { useToast } from '@/hooks/use-toast';

export default function FranchiseDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const [franchise, setFranchise] = useState<Franchise | null>(null);
    const [metrics, setMetrics] = useState<FranchiseMetrics | null>(null);
    const [royaltyPayments, setRoyaltyPayments] = useState<RoyaltyPayment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [params.id]);

    const fetchData = async () => {
        try {
            const [franchiseData, metricsData, paymentsData] = await Promise.all([
                getFranchise(params.id as string),
                getFranchiseMetrics(params.id as string),
                getRoyaltyPayments(params.id as string),
            ]);

            setFranchise(franchiseData);
            setMetrics(metricsData);
            setRoyaltyPayments(paymentsData);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load franchise data',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadInvoice = (paymentId: string) => {
        window.open(`/api/franchise/royalty/${paymentId}/invoice`, '_blank');
    };

    if (loading || !franchise || !metrics) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div>
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <h1 className="text-3xl font-bold mt-2">{franchise.name}</h1>
                <p className="text-muted-foreground">{franchise.code}</p>
            </div>

            <Tabs defaultValue="dashboard" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                    <TabsTrigger value="royalty">Royalty</TabsTrigger>
                    <TabsTrigger value="revenue">Revenue Share</TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard" className="space-y-4">
                    <FranchiseDashboard metrics={metrics} />
                </TabsContent>

                <TabsContent value="royalty" className="space-y-4">
                    <RoyaltyTracking
                        payments={royaltyPayments}
                        onDownloadInvoice={handleDownloadInvoice}
                    />
                </TabsContent>

                <TabsContent value="revenue" className="space-y-4">
                    <RevenueShare data={[]} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
