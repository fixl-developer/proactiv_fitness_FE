'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, TrendingDown } from 'lucide-react';
import { calculatePrice } from '@/lib/api/advanced';
import type { PriceCalculation } from '@/types/advanced';
import { useToast } from '@/hooks/use-toast';

export default function PriceCalculator() {
    const { toast } = useToast();
    const [classId, setClassId] = useState('');
    const [date, setDate] = useState('');
    const [calculation, setCalculation] = useState<PriceCalculation | null>(null);
    const [loading, setLoading] = useState(false);

    const handleCalculate = async () => {
        if (!classId || !date) {
            toast({
                title: 'Error',
                description: 'Please select class and date',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);
        try {
            const result = await calculatePrice(classId, date);
            setCalculation(result);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to calculate price',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Price Calculator
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="classId">Select Class</Label>
                    <Select value={classId} onValueChange={setClassId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Choose a class" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="class-1">Swimming - Beginner</SelectItem>
                            <SelectItem value="class-2">Football - Advanced</SelectItem>
                            <SelectItem value="class-3">Tennis - Intermediate</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="date">Select Date</Label>
                    <Input
                        id="date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>

                <Button className="w-full" onClick={handleCalculate} disabled={loading}>
                    {loading ? 'Calculating...' : 'Calculate Price'}
                </Button>

                {calculation && (
                    <div className="mt-6 p-4 border rounded-lg bg-muted/50">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Base Price</span>
                                <span className="font-medium">
                                    AED {calculation.basePrice.toFixed(2)}
                                </span>
                            </div>

                            {calculation.appliedRules.map((rule) => (
                                <div
                                    key={rule.ruleId}
                                    className="flex items-center justify-between text-sm"
                                >
                                    <span className="text-muted-foreground">{rule.ruleName}</span>
                                    <span
                                        className={
                                            rule.adjustment < 0
                                                ? 'text-green-600'
                                                : 'text-red-600'
                                        }
                                    >
                                        {rule.adjustment > 0 ? '+' : ''}
                                        AED {rule.adjustment.toFixed(2)}
                                    </span>
                                </div>
                            ))}

                            <div className="pt-3 border-t">
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold">Final Price</span>
                                    <span className="text-2xl font-bold">
                                        AED {calculation.finalPrice.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {calculation.savings > 0 && (
                                <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded">
                                    <TrendingDown className="h-4 w-4 text-green-600" />
                                    <span className="text-sm text-green-600">
                                        You save AED {calculation.savings.toFixed(2)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
