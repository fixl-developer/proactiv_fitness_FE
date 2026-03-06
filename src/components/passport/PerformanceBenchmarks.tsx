'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, TrendingUp } from 'lucide-react';
import type { PerformanceBenchmark } from '@/types/passport';

interface PerformanceBenchmarksProps {
    benchmarks: PerformanceBenchmark[];
}

export default function PerformanceBenchmarks({ benchmarks }: PerformanceBenchmarksProps) {
    const groupedBenchmarks = benchmarks.reduce((acc, benchmark) => {
        if (!acc[benchmark.category]) {
            acc[benchmark.category] = [];
        }
        acc[benchmark.category].push(benchmark);
        return acc;
    }, {} as Record<string, PerformanceBenchmark[]>);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Performance Benchmarks
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {Object.entries(groupedBenchmarks).map(([category, categoryBenchmarks]) => (
                    <div key={category} className="space-y-3">
                        <h3 className="font-semibold text-lg capitalize">{category}</h3>
                        <div className="grid gap-3 md:grid-cols-2">
                            {categoryBenchmarks.map((benchmark) => (
                                <div
                                    key={benchmark.id}
                                    className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <h4 className="font-medium">{benchmark.benchmarkName}</h4>
                                        <TrendingUp className="h-4 w-4 text-green-500" />
                                    </div>
                                    <div className="flex items-baseline gap-2 mb-2">
                                        <span className="text-2xl font-bold">
                                            {benchmark.value}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            {benchmark.unit}
                                        </span>
                                    </div>
                                    {benchmark.notes && (
                                        <p className="text-xs text-muted-foreground mb-2">
                                            {benchmark.notes}
                                        </p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        Recorded on{' '}
                                        {new Date(benchmark.recordedDate).toLocaleDateString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
