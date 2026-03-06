'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Trash2, Copy } from 'lucide-react';
import type { ForecastScenario } from '@/types/advanced';

interface ScenarioListProps {
    scenarios: ForecastScenario[];
    onRun: (scenarioId: string) => void;
    onDelete: (scenarioId: string) => void;
    onDuplicate: (scenarioId: string) => void;
    onSelect: (scenario: ForecastScenario) => void;
}

export default function ScenarioList({
    scenarios,
    onRun,
    onDelete,
    onDuplicate,
    onSelect,
}: ScenarioListProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Saved Scenarios</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {scenarios.map((scenario) => (
                        <div
                            key={scenario.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                            onClick={() => onSelect(scenario)}
                        >
                            <div className="flex-1">
                                <h3 className="font-semibold">{scenario.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {scenario.description}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="outline">
                                        Growth: {scenario.parameters.enrollmentGrowth}%
                                    </Badge>
                                    <Badge variant="outline">
                                        Attendance: {scenario.parameters.attendanceRate}%
                                    </Badge>
                                    <Badge variant="outline">
                                        {scenario.parameters.pricingStrategy}
                                    </Badge>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRun(scenario.id);
                                    }}
                                >
                                    <Play className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDuplicate(scenario.id);
                                    }}
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(scenario.id);
                                    }}
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
