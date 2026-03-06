'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, CheckCircle } from 'lucide-react';
import type { SkillProgress } from '@/types/passport';

interface SkillTimelineProps {
    skills: SkillProgress[];
}

export default function SkillTimeline({ skills }: SkillTimelineProps) {
    const groupedSkills = skills.reduce((acc, skill) => {
        if (!acc[skill.category]) {
            acc[skill.category] = [];
        }
        acc[skill.category].push(skill);
        return acc;
    }, {} as Record<string, SkillProgress[]>);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Skill Development Timeline
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {Object.entries(groupedSkills).map(([category, categorySkills]) => (
                    <div key={category} className="space-y-3">
                        <h3 className="font-semibold text-lg capitalize">{category}</h3>
                        <div className="space-y-3">
                            {categorySkills.map((skill) => {
                                const progressPercentage = (skill.currentLevel / skill.maxLevel) * 100;
                                const isMaxLevel = skill.currentLevel === skill.maxLevel;

                                return (
                                    <div key={skill.id} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{skill.skillName}</span>
                                                {isMaxLevel && (
                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                )}
                                            </div>
                                            <Badge variant="secondary">
                                                Level {skill.currentLevel}/{skill.maxLevel}
                                            </Badge>
                                        </div>
                                        <Progress value={progressPercentage} className="h-2" />
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span>
                                                Last assessed:{' '}
                                                {new Date(skill.lastAssessedDate).toLocaleDateString()}
                                            </span>
                                            <span>By: {skill.assessedBy}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
