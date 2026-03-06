'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { ForecastScenario } from '@/types/advanced';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

interface ScenarioComparisonProps {
    scenarios: ForecastScenario[];
}

export default function ScenarioComparison({ scenarios }: ScenarioComparisonProps) {
    const comparisonData = scenarios.map((scenario) => ({
        name: scenario.name,
        revenue: scenario.results.projectedRevenue,
        enrollments: scenario.results.projectedEnrollments,
        capacity: scenario.results.projectedCapacity,
        profit: scenario.results.profitMargin,
    }));

    const bestScenario = scenarios.reduce((best, current) =>
        current.results.projectedRevenue > best.results.projectedRevenue ? current : best
    );

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Scenario Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={comparisonData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="revenue" fill="#8884d8" name="Revenue (AED)" />
                            <Bar dataKey="enrollments" fill="#82ca9d" name="Enrollments" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {scenarios.map((scenario) => {
                    const isBest = scenario.id === bestScenario.id;
                    return (
                        <Card key={scenario.id} className={isBest ? 'border-green-500' : ''}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">{scenario.name}</CardTitle>
                                    {isBest && (
                                        <Badge className="bg-green-100 text-green-800">
                                            Best
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Revenue</span>
                                    <span className="font-bold">
                                        AED {scenario.results.projectedRevenue.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Enrollments
                                    </span>
                                    <span className="font-bold">
                                        {scenario.results.projectedEnrollments}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Profit Margin
                                    </span>
                                    <div className="flex items-center gap-1">
                                        {scenario.results.profitMargin > 20 ? (
                                            <TrendingUp className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <TrendingDown className="h-4 w-4 text-red-500" />
                                        )}
                                        <span className="font-bold">
                                            {scenario.results.profitMargin}%
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
