'use client';

import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PriceCalculator from '@/components/pricing/PriceCalculator';
import PricingRulesList from '@/components/pricing/PricingRulesList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { getPricingRules, updatePricingRule } from '@/lib/api/advanced';
import type { PricingRule } from '@/types/advanced';
import { useToast } from '@/hooks/use-toast';

export default function DynamicPricingPage() {
    const { toast } = useToast();
    const [rules, setRules] = useState<PricingRule[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRules();
    }, []);

    const fetchRules = async () => {
        try {
            const data = await getPricingRules();
            setRules(data);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load pricing rules',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (ruleId: string, isActive: boolean) => {
        try {
            await updatePricingRule(ruleId, { isActive });
            setRules((prev) =>
                prev.map((rule) => (rule.id === ruleId ? { ...rule, isActive } : rule))
            );
            toast({
                title: 'Success',
                description: `Rule ${isActive ? 'activated' : 'deactivated'}`,
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update rule',
                variant: 'destructive',
            });
        }
    };

    const handleEdit = (rule: PricingRule) => {
        // Open edit modal
        console.log('Edit rule:', rule);
    };

    const handleDelete = (ruleId: string) => {
        // Confirm and delete
        console.log('Delete rule:', ruleId);
    };

    if (loading) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Dynamic Pricing</h1>
                    <p className="text-muted-foreground">
                        Manage pricing rules and calculate dynamic prices
                    </p>
                </div>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Rule
                </Button>
            </div>

            <Tabs defaultValue="calculator" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="calculator">Price Calculator</TabsTrigger>
                    <TabsTrigger value="rules">Pricing Rules</TabsTrigger>
                </TabsList>

                <TabsContent value="calculator" className="space-y-4">
                    <div className="max-w-2xl">
                        <PriceCalculator />
                    </div>
                </TabsContent>

                <TabsContent value="rules" className="space-y-4">
                    <PricingRulesList
                        rules={rules}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onToggleActive={handleToggleActive}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
