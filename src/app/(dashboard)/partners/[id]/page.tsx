'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Upload } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PartnerDashboard from '@/components/partner/PartnerDashboard';
import BulkImportStatus from '@/components/partner/BulkImportStatus';
import { getPartner, getPartnerReport } from '@/lib/api/enterprise';
import type { Partner, PartnerReport, BulkImport } from '@/types/enterprise';
import { useToast } from '@/hooks/use-toast';

export default function PartnerDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const [partner, setPartner] = useState<Partner | null>(null);
    const [report, setReport] = useState<PartnerReport | null>(null);
    const [imports, setImports] = useState<BulkImport[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [params.id]);

    const fetchData = async () => {
        try {
            const [partnerData, reportData] = await Promise.all([
                getPartner(params.id as string),
                getPartnerReport(params.id as string, 'current-month'),
            ]);

            setPartner(partnerData);
            setReport(reportData);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load partner data',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading || !partner || !report) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div>
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <h1 className="text-3xl font-bold mt-2">{partner.name}</h1>
                <p className="text-muted-foreground">{partner.type}</p>
            </div>

            <Tabs defaultValue="dashboard" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                    <TabsTrigger value="import">Bulk Import</TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard" className="space-y-4">
                    <PartnerDashboard report={report} />
                </TabsContent>

                <TabsContent value="import" className="space-y-4">
                    <div className="flex justify-end">
                        <Button>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Students
                        </Button>
                    </div>
                    <BulkImportStatus imports={imports} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
