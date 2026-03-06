'use client';

import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ScenarioBuilder from '@/components/forecast/ScenarioBuilder';
import ForecastResultsDisplay from '@/components/forecast/ForecastResults';
import ScenarioComparison from '@/components/forecast/ScenarioComparison';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import {
    getForecastScenarios,
    createForecastScenario,
    runForecastSimulation,
} from '@/lib/api/advanced';
import type { ForecastScenario } from '@/types/advanced';
import { useToast } from '@/hooks/use-toast';

export default function ForecastSimulatorPage() {
    const { toast } = useToast();
    const [scenarios, setScenarios] = useState<ForecastScenario[]>([]);
    const [selectedScenario, setSelectedScenario] = useState<ForecastScenario | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchScenarios();
    }, []);

    const fetchScenarios = async () => {
        try {
            const data = await getForecastScenarios();
            setScenarios(data);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load scenarios',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateScenario = async (data: any) => {
        try {
            const newScenario = await createForecastScenario(data);
            const results = await runForecastSimulation(newScenario.id);
            const updatedScenario = { ...newScenario, results };
            setScenarios((prev) => [...prev, updatedScenario]);
            setSelectedScenario(updatedScenario);
            toast({
                title: 'Success',
                description: 'Scenario created and simulated',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to create scenario',
                variant: 'destructive',
            });
        }
    };

    if (loading) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Forecast Simulator</h1>
                <p className="text-muted-foreground">
                    Create and compare business forecast scenarios
                </p>
            </div>

            <Tabs defaultValue="builder" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="builder">Scenario Builder</TabsTrigger>
                    <TabsTrigger value="results">Results</TabsTrigger>
                    <TabsTrigger value="comparison">Comparison</TabsTrigger>
                </TabsList>

                <TabsContent value="builder" className="space-y-4">
                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            <ScenarioBuilder onCreateScenario={handleCreateScenario} />
                        </div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Saved Scenarios</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {scenarios.map((scenario) => (
                                        <Button
                                            key={scenario.id}
                                            variant="outline"
                                            className="w-full justify-start"
                                            onClick={() => setSelectedScenario(scenario)}
                                        >
                                            <Play className="h-4 w-4 mr-2" />
                                            {scenario.name}
                                        </Button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="results" className="space-y-4">
                    {selectedScenario ? (
                        <ForecastResultsDisplay results={selectedScenario.results} />
                    ) : (
                        <Card>
                            <CardContent className="p-8 text-center text-muted-foreground">
                                Select a scenario to view results
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="comparison" className="space-y-4">
                    {scenarios.length > 0 ? (
                        <ScenarioComparison scenarios={scenarios} />
                    ) : (
                        <Card>
                            <CardContent className="p-8 text-center text-muted-foreground">
                                Create scenarios to compare them
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
