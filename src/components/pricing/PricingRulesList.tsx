'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { DollarSign, Edit, Trash2 } from 'lucide-react';
import type { PricingRule } from '@/types/advanced';

interface PricingRulesListProps {
    rules: PricingRule[];
    onEdit: (rule: PricingRule) => void;
    onDelete: (ruleId: string) => void;
    onToggleActive: (ruleId: string, isActive: boolean) => void;
}

export default function PricingRulesList({
    rules,
    onEdit,
    onDelete,
    onToggleActive,
}: PricingRulesListProps) {
    const getTypeColor = (type: string) => {
        switch (type) {
            case 'demand':
                return 'bg-blue-100 text-blue-800';
            case 'seasonal':
                return 'bg-green-100 text-green-800';
            case 'early_bird':
                return 'bg-purple-100 text-purple-800';
            case 'time_based':
                return 'bg-orange-100 text-orange-800';
            case 'capacity':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const sortedRules = [...rules].sort((a, b) => b.priority - a.priority);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Pricing Rules
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {sortedRules.map((rule) => (
                        <div
                            key={rule.id}
                            className="flex items-center justify-between p-4 border rounded-lg"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-semibold">{rule.name}</h3>
                                    <Badge className={getTypeColor(rule.type)}>
                                        {rule.type.replace('_', ' ')}
                                    </Badge>
                                    <Badge variant="outline">Priority: {rule.priority}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                    {rule.description}
                                </p>
                                <div className="flex items-center gap-4 text-sm">
                                    <span>Base: AED {rule.basePrice}</span>
                                    <span>
                                        Adjustment:{' '}
                                        {rule.adjustmentType === 'percentage'
                                            ? `${rule.adjustmentValue}%`
                                            : `AED ${rule.adjustmentValue}`}
                                    </span>
                                    <span className="text-muted-foreground">
                                        {rule.conditions.length} conditions
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={rule.isActive}
                                    onCheckedChange={(checked) =>
                                        onToggleActive(rule.id, checked)
                                    }
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onEdit(rule)}
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onDelete(rule.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
