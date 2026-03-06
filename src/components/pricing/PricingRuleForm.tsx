'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X } from 'lucide-react';
import type { PricingRule, PricingCondition } from '@/types/advanced';

interface PricingRuleFormProps {
    rule?: PricingRule;
    onSubmit: (data: Omit<PricingRule, 'id'>) => void;
    onCancel: () => void;
}

export default function PricingRuleForm({ rule, onSubmit, onCancel }: PricingRuleFormProps) {
    const [formData, setFormData] = useState({
        name: rule?.name || '',
        description: rule?.description || '',
        type: rule?.type || 'demand',
        basePrice: rule?.basePrice || 0,
        adjustmentType: rule?.adjustmentType || 'percentage',
        adjustmentValue: rule?.adjustmentValue || 0,
        priority: rule?.priority || 1,
        isActive: rule?.isActive ?? true,
    });

    const [conditions, setConditions] = useState<PricingCondition[]>(rule?.conditions || []);

    const handleAddCondition = () => {
        setConditions([
            ...conditions,
            { field: '', operator: 'equals', value: '' },
        ]);
    };

    const handleRemoveCondition = (index: number) => {
        setConditions(conditions.filter((_, i) => i !== index));
    };

    const handleConditionChange = (
        index: number,
        field: keyof PricingCondition,
        value: any
    ) => {
        const updated = [...conditions];
        updated[index] = { ...updated[index], [field]: value };
        setConditions(updated);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            conditions,
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{rule ? 'Edit' : 'Create'} Pricing Rule</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Rule Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="type">Rule Type</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value: any) =>
                                    setFormData({ ...formData, type: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="demand">Demand-Based</SelectItem>
                                    <SelectItem value="seasonal">Seasonal</SelectItem>
                                    <SelectItem value="early_bird">Early Bird</SelectItem>
                                    <SelectItem value="time_based">Time-Based</SelectItem>
                                    <SelectItem value="capacity">Capacity-Based</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            rows={3}
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="basePrice">Base Price (AED)</Label>
                            <Input
                                id="basePrice"
                                type="number"
                                value={formData.basePrice}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        basePrice: parseFloat(e.target.value),
                                    })
                                }
                                min={0}
                                step={0.01}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="adjustmentType">Adjustment Type</Label>
                            <Select
                                value={formData.adjustmentType}
                                onValueChange={(value: any) =>
                                    setFormData({ ...formData, adjustmentType: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="percentage">Percentage</SelectItem>
                                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="adjustmentValue">
                                Adjustment Value{' '}
                                {formData.adjustmentType === 'percentage' ? '(%)' : '(AED)'}
                            </Label>
                            <Input
                                id="adjustmentValue"
                                type="number"
                                value={formData.adjustmentValue}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        adjustmentValue: parseFloat(e.target.value),
                                    })
                                }
                                step={0.01}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Conditions</Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleAddCondition}
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Condition
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {conditions.map((condition, index) => (
                                <div key={index} className="flex gap-2">
                                    <Input
                                        placeholder="Field"
                                        value={condition.field}
                                        onChange={(e) =>
                                            handleConditionChange(index, 'field', e.target.value)
                                        }
                                    />
                                    <Select
                                        value={condition.operator}
                                        onValueChange={(value) =>
                                            handleConditionChange(index, 'operator', value)
                                        }
                                    >
                                        <SelectTrigger className="w-[150px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="equals">Equals</SelectItem>
                                            <SelectItem value="greater_than">
                                                Greater Than
                                            </SelectItem>
                                            <SelectItem value="less_than">Less Than</SelectItem>
                                            <SelectItem value="between">Between</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Input
                                        placeholder="Value"
                                        value={condition.value}
                                        onChange={(e) =>
                                            handleConditionChange(index, 'value', e.target.value)
                                        }
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleRemoveCondition(index)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                        <Button type="submit">{rule ? 'Update' : 'Create'} Rule</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
