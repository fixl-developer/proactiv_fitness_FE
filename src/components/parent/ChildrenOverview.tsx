'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp, Calendar } from 'lucide-react';
import type { ChildSummary } from '@/types/parent';
import { useRouter } from 'next/navigation';

interface ChildrenOverviewProps {
    children: ChildSummary[];
}

export default function ChildrenOverview({ children }: ChildrenOverviewProps) {
    const router = useRouter();

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {children.map((child) => (
                <Card key={child.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={child.avatar} />
                                <AvatarFallback>
                                    {child.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="font-semibold text-lg">{child.name}</h3>
                                <p className="text-sm text-muted-foreground">{child.age} years old</p>
                            </div>
                        </div>

                        <div className="space-y-3 mb-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Current Program</p>
                                <p className="font-medium">{child.currentProgram}</p>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Skill Level</p>
                                    <Badge variant="secondary">{child.skillLevel}</Badge>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground">Attendance</p>
                                    <div className="flex items-center gap-1">
                                        <TrendingUp className="h-4 w-4 text-green-500" />
                                        <span className="font-bold">{child.attendanceRate}%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                                <Calendar className="h-4 w-4 text-blue-600" />
                                <span className="text-sm text-blue-600">
                                    {child.upcomingClasses} upcoming classes
                                </span>
                            </div>
                        </div>

                        <Button
                            className="w-full"
                            variant="outline"
                            onClick={() => router.push(`/parent/child/${child.id}`)}
                        >
                            View Progress
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
