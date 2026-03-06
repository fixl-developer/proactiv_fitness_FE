'use client';

import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PassportCard from '@/components/passport/PassportCard';
import SkillTimeline from '@/components/passport/SkillTimeline';
import MilestoneAchievements from '@/components/passport/MilestoneAchievements';
import PerformanceBenchmarks from '@/components/passport/PerformanceBenchmarks';
import BehavioralReport from '@/components/passport/BehavioralReport';
import CertificationList from '@/components/passport/CertificationList';
import PassportExport from '@/components/passport/PassportExport';
import {
    getAthletePassport,
    getSkillProgress,
    getMilestones,
    getPerformanceBenchmarks,
    getBehavioralTracking,
    getCertifications,
} from '@/lib/api/passport';
import type {
    AthletePassport,
    SkillProgress,
    Milestone,
    PerformanceBenchmark,
    BehavioralTracking,
    Certification,
} from '@/types/passport';
import { useToast } from '@/hooks/use-toast';

export default function PassportPage() {
    const { toast } = useToast();
    const [passport, setPassport] = useState<AthletePassport | null>(null);
    const [skills, setSkills] = useState<SkillProgress[]>([]);
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [benchmarks, setBenchmarks] = useState<PerformanceBenchmark[]>([]);
    const [behaviors, setBehaviors] = useState<BehavioralTracking[]>([]);
    const [certifications, setCertifications] = useState<Certification[]>([]);
    const [loading, setLoading] = useState(true);

    const studentId = 'current-student-id'; // Get from auth context

    useEffect(() => {
        fetchData();
    }, []);


    const fetchData = async () => {
        try {
            const [
                passportData,
                skillsData,
                milestonesData,
                benchmarksData,
                behaviorsData,
                certificationsData,
            ] = await Promise.all([
                getAthletePassport(studentId),
                getSkillProgress(studentId),
                getMilestones(studentId),
                getPerformanceBenchmarks(studentId),
                getBehavioralTracking(studentId),
                getCertifications(studentId),
            ]);

            setPassport(passportData);
            setSkills(skillsData);
            setMilestones(milestonesData);
            setBenchmarks(benchmarksData);
            setBehaviors(behaviorsData);
            setCertifications(certificationsData);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load passport data',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadCertificate = (certificationId: string) => {
        const cert = certifications.find((c) => c.id === certificationId);
        if (cert) {
            window.open(cert.certificateUrl, '_blank');
        }
    };

    if (loading || !passport) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Digital Athlete Passport</h1>
                <p className="text-muted-foreground">
                    Track your athletic journey and achievements
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <PassportCard passport={passport} />
                </div>
                <PassportExport studentId={studentId} studentName={passport.studentName} />
            </div>

            <Tabs defaultValue="skills" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="skills">Skills</TabsTrigger>
                    <TabsTrigger value="milestones">Milestones</TabsTrigger>
                    <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
                    <TabsTrigger value="behavior">Behavior</TabsTrigger>
                    <TabsTrigger value="certifications">Certifications</TabsTrigger>
                </TabsList>

                <TabsContent value="skills" className="space-y-4">
                    <SkillTimeline skills={skills} />
                </TabsContent>

                <TabsContent value="milestones" className="space-y-4">
                    <MilestoneAchievements milestones={milestones} />
                </TabsContent>

                <TabsContent value="benchmarks" className="space-y-4">
                    <PerformanceBenchmarks benchmarks={benchmarks} />
                </TabsContent>

                <TabsContent value="behavior" className="space-y-4">
                    <BehavioralReport behaviors={behaviors} />
                </TabsContent>

                <TabsContent value="certifications" className="space-y-4">
                    <CertificationList
                        certifications={certifications}
                        onDownload={handleDownloadCertificate}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
