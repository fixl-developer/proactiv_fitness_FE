'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Plus } from 'lucide-react';

interface ScenarioBuilderProps {
    onCreateScenario: (data: any) => void;
}

export default function ScenarioBuilder({ onCreateScenario }: ScenarioBuilderProps) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        enrollmentGrowth: 10,
        attendanceRate: 85,
        pricingStrategy: 'standard',
        marketingBudget: 5000,
        seasonalFactors: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onCreateScenario({
            name: formData.name,
            description: formData.description,
            parameters: {
                enrollmentGrowth: formData.enrollmentGrowth,
                attendanceRate: formData.attendanceRate,
                pricingStrategy: formData.pricingStrategy,
                marketingBudget: formData.marketingBudget,
                seasonalFactors: formData.seasonalFactors,
            },
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Create Forecast Scenario
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Scenario Name</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Aggressive Growth"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            placeholder="Describe this scenario..."
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Enrollment Growth (%): {formData.enrollmentGrowth}%</Label>
                        <Slider
                            value={[formData.enrollmentGrowth]}
                            onValueChange={([value]) =>
                                setFormData({ ...formData, enrollmentGrowth: value })
                            }
                            min={-20}
                            max={50}
                            step={1}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Attendance Rate (%): {formData.attendanceRate}%</Label>
                        <Slider
                            value={[formData.attendanceRate]}
                            onValueChange={([value]) =>
                                setFormData({ ...formData, attendanceRate: value })
                            }
                            min={50}
                            max={100}
                            step={1}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="pricingStrategy">Pricing Strategy</Label>
                        <Select
                            value={formData.pricingStrategy}
                            onValueChange={(value) =>
                                setFormData({ ...formData, pricingStrategy: value })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="standard">Standard</SelectItem>
                                <SelectItem value="premium">Premium</SelectItem>
                                <SelectItem value="discount">Discount</SelectItem>
                                <SelectItem value="dynamic">Dynamic</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="marketingBudget">Marketing Budget (AED)</Label>
                        <Input
                            id="marketingBudget"
                            type="number"
                            value={formData.marketingBudget}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    marketingBudget: parseInt(e.target.value),
                                })
                            }
                            min={0}
                            step={1000}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <Label htmlFor="seasonalFactors">Include Seasonal Factors</Label>
                        <Switch
                            id="seasonalFactors"
                            checked={formData.seasonalFactors}
                            onCheckedChange={(checked) =>
                                setFormData({ ...formData, seasonalFactors: checked })
                            }
                        />
                    </div>

                    <Button type="submit" className="w-full">
                        Create & Run Simulation
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
