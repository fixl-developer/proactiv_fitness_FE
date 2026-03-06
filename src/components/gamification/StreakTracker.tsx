'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, Calendar } from 'lucide-react';

interface StreakTrackerProps {
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: string;
}

export default function StreakTracker({
    currentStreak,
    longestStreak,
    lastActivityDate,
}: StreakTrackerProps) {
    const getStreakDays = () => {
        const days = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const isActive = i <= currentStreak - 1;
            days.push({
                date: date.toLocaleDateString('en-US', { weekday: 'short' }),
                isActive,
            });
        }
        return days;
    };

    const streakDays = getStreakDays();

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-orange-500" />
                    Attendance Streak
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-3xl font-bold">{currentStreak}</p>
                        <p className="text-sm text-muted-foreground">Current Streak</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-muted-foreground">{longestStreak}</p>
                        <p className="text-sm text-muted-foreground">Longest Streak</p>
                    </div>
                </div>

                <div className="flex justify-between gap-2">
                    {streakDays.map((day, index) => (
                        <div key={index} className="flex flex-col items-center gap-1">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${day.isActive
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-muted text-muted-foreground'
                                    }`}
                            >
                                {day.isActive ? (
                                    <Flame className="h-5 w-5" />
                                ) : (
                                    <Calendar className="h-4 w-4" />
                                )}
                            </div>
                            <span className="text-xs">{day.date}</span>
                        </div>
                    ))}
                </div>

                <p className="text-xs text-center text-muted-foreground">
                    Last activity: {new Date(lastActivityDate).toLocaleDateString()}
                </p>
            </CardContent>
        </Card>
    );
}
