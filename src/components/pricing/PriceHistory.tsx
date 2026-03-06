'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

interface PriceHistoryData {
    date: string;
    basePrice: number;
    finalPrice: number;
    discount: number;
}

interface PriceHistoryProps {
    data: PriceHistoryData[];
    className?: string;
}

export default function PriceHistory({ data, className }: PriceHistoryProps) {
    const averageDiscount =
        data.reduce((sum, item) => sum + item.discount, 0) / data.length;

    return (
        <Card className={className}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Price History</CardTitle>
                    <div className="flex items-center gap-2">
                        {averageDiscount > 0 ? (
                            <TrendingDown className="h-4 w-4 text-green-500" />
                        ) : (
                            <TrendingUp className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-sm text-muted-foreground">
                            Avg discount: {averageDiscount.toFixed(1)}%
                        </span>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="basePrice"
                            stroke="#8884d8"
                            name="Base Price"
                        />
                        <Line
                            type="monotone"
                            dataKey="finalPrice"
                            stroke="#82ca9d"
                            name="Final Price"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
