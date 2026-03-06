'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import PartnerList from '@/components/partner/PartnerList';
import { getPartners } from '@/lib/api/enterprise';
import type { Partner } from '@/types/enterprise';
import { useToast } from '@/hooks/use-toast';

export default function PartnersPage() {
    const { toast } = useToast();
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPartners();
    }, []);

    const fetchPartners = async () => {
        try {
            const data = await getPartners();
            setPartners(data);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load partners',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (partner: Partner) => {
        console.log('Edit partner:', partner);
    };

    if (loading) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Partner Portal</h1>
                    <p className="text-muted-foreground">
                        Manage partner organizations and collaborations
                    </p>
                </div>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Partner
                </Button>
            </div>

            <PartnerList partners={partners} onEdit={handleEdit} />
        </div>
    );
}
