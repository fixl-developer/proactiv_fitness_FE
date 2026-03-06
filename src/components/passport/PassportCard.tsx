'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { QrCode, Award, Calendar, TrendingUp } from 'lucide-react';
import type { AthletePassport } from '@/types/passport';
import Image from 'next/image';

interface PassportCardProps {
    passport: AthletePassport;
}

export default function PassportCard({ passport }: PassportCardProps) {
    return (
        <Card className="overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20 border-4 border-white">
                            <AvatarImage src={passport.avatar} />
                            <AvatarFallback className="bg-white text-blue-600 text-2xl">
                                {passport.studentName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="text-2xl font-bold">{passport.studentName}</h2>
                            <p className="text-blue-100">Digital Athlete Passport</p>
                            <Badge variant="secondary" className="mt-2 bg-white text-blue-600">
                                {passport.skillLevel}
                            </Badge>
                        </div>
                    </div>
                    <div className="bg-white p-2 rounded-lg">
                        <Image
                            src={passport.qrCode}
                            alt="QR Code"
                            width={80}
                            height={80}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm">Program</span>
                        </div>
                        <p className="font-semibold">{passport.currentProgram}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="h-4 w-4" />
                            <span className="text-sm">Attendance</span>
                        </div>
                        <p className="font-semibold">{passport.attendanceRate}%</p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <div className="text-center bg-white/20 backdrop-blur-sm rounded-lg p-3">
                        <p className="text-2xl font-bold">{passport.totalClassesAttended}</p>
                        <p className="text-xs text-blue-100">Classes</p>
                    </div>
                    <div className="text-center bg-white/20 backdrop-blur-sm rounded-lg p-3">
                        <p className="text-2xl font-bold">{passport.milestonesAchieved}</p>
                        <p className="text-xs text-blue-100">Milestones</p>
                    </div>
                    <div className="text-center bg-white/20 backdrop-blur-sm rounded-lg p-3">
                        <p className="text-2xl font-bold">{passport.certificationsEarned}</p>
                        <p className="text-xs text-blue-100">Certificates</p>
                    </div>
                </div>

                <div className="mt-4 text-xs text-blue-100 text-center">
                    Member since {new Date(passport.enrollmentDate).toLocaleDateString()}
                </div>
            </CardContent>
        </Card>
    );
}
