'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Car, Users, MapPin, Clock, DollarSign } from 'lucide-react';
import type { CarpoolOpportunity } from '@/types/advanced';

interface CarpoolSuggestionsProps {
    opportunities: CarpoolOpportunity[];
    onAccept: (index: number) => void;
}

export default function CarpoolSuggestions({
    opportunities,
    onAccept,
}: CarpoolSuggestionsProps) {
    if (opportunities.length === 0) {
        return (
            <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                    No carpool opportunities available
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    Carpool Suggestions
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {opportunities.map((opportunity, index) => (
                        <div
                            key={index}
                            className="p-4 border rounded-lg bg-green-50 border-green-200"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Car className="h-5 w-5 text-green-600" />
                                    <h3 className="font-semibold">Carpool Opportunity</h3>
                                </div>
                                <Badge className="bg-green-100 text-green-800">
                                    <DollarSign className="h-3 w-3 mr-1" />
                                    Save AED {opportunity.potentialSavings}
                                </Badge>
                            </div>

                            <div className="space-y-2 mb-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span>{opportunity.location}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span>{opportunity.time}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span>{opportunity.children.join(', ')}</span>
                                </div>
                            </div>

                            <Button
                                size="sm"
                                className="w-full"
                                onClick={() => onAccept(index)}
                            >
                                Accept Suggestion
                            </Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
