'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const sampleData = [
    { time: '00:00', requests: 120, errors: 5, latency: 45 },
    { time: '04:00', requests: 80, errors: 2, latency: 38 },
    { time: '08:00', requests: 250, errors: 12, latency: 62 },
    { time: '12:00', requests: 380, errors: 18, latency: 78 },
    { time: '16:00', requests: 420, errors: 15, latency: 85 },
    { time: '20:00', requests: 290, errors: 8, latency: 58 },
];

export default function MetricsDashboard() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Request Volume</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={sampleData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="requests" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Response Latency</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={sampleData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="latency" stroke="#82ca9d" />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Error Rate</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={sampleData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="errors" stroke="#ff7300" />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>System Health</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">API Health</span>
                            <span className="text-sm text-green-500">Healthy</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Database</span>
                            <span className="text-sm text-green-500">Healthy</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Cache</span>
                            <span className="text-sm text-green-500">Healthy</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Queue</span>
                            <span className="text-sm text-yellow-500">Degraded</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
