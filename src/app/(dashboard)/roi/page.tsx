'use client';

import React, { useEffect, useState } from 'react';
import ParentROIDashboard from '@/components/roi/ParentROIDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getFamilyROI } from '@/lib/api/advanced';
import type { ParentROI } from '@/types/advanced';
import { useToast } from '@/hooks/use-toast';

export default function ParentROIPage() {
    const { toast } = useToast();
    const [roiData, setRoiData] = useState<ParentROI[]>([]);
    const [loading, setLoading] = useState(true);

    const parentId = 'current-parent-id'; // Get from auth context

    useEffect(() => {
        fetchROI();
    }, []);

    const fetchROI = async () => {
        try {
            const data = await getFamilyROI(parentId);
            setRoiData(data);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load ROI data',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Parent ROI Dashboard</h1>
                <p className="text-muted-foreground">
                    Track the value and impact of your investment
                </p>
            </div>

            {roiData.length > 0 ? (
                <Tabs defaultValue={roiData[0].childId} className="space-y-4">
                    <TabsList>
                        {roiData.map((roi) => (
                            <TabsTrigger key={roi.childId} value={roi.childId}>
                                {roi.childName}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {roiData.map((roi) => (
                        <TabsContent key={roi.childId} value={roi.childId} className="space-y-4">
                            <ParentROIDashboard roi={roi} />
                        </TabsContent>
                    ))}
                </Tabs>
            ) : (
                <div className="p-8 text-center text-muted-foreground">
                    No ROI data available
                </div>
            )}
        </div>
    );
}
