'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import ChildProgressCard from '@/components/parent/ChildProgressCard';
import RecentActivity from '@/components/parent/RecentActivity';
import { getChildProgress } from '@/lib/api/parent';
import type { ChildProgress } from '@/types/parent';
import { useToast } from '@/hooks/use-toast';

export default function ChildDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const [progress, setProgress] = useState<ChildProgress | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProgress();
    }, [params.id]);

    const fetchProgress = async () => {
        try {
            const data = await getChildProgress(params.id as string);
            setProgress(data);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load child progress',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading || !progress) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Button variant="ghost" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Button>
                    <h1 className="text-3xl font-bold mt-2">{progress.childName}'s Progress</h1>
                    <p className="text-muted-foreground">
                        Track skills, attendance, and achievements
                    </p>
                </div>
            </div>

            <ChildProgressCard progress={progress} />

            <RecentActivity activities={progress.recentActivities} />
        </div>
    );
}
