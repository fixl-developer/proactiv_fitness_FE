// Digital Athlete Passport types

export interface AthletePassport {
    id: string;
    studentId: string;
    studentName: string;
    dateOfBirth: string;
    avatar?: string;
    qrCode: string;

    // Program Info
    currentProgram: string;
    enrollmentDate: string;
    skillLevel: string;

    // Stats
    totalClassesAttended: number;
    totalHoursCompleted: number;
    attendanceRate: number;

    // Achievements
    milestonesAchieved: number;
    certificationsEarned: number;
    badgesUnlocked: number;

    createdAt: string;
    updatedAt: string;
}

export interface SkillProgress {
    id: string;
    passportId: string;
    skillName: string;
    category: string;
    currentLevel: number;
    maxLevel: number;
    progress: number;
    lastAssessedDate: string;
    assessedBy: string;
}

export interface Milestone {
    id: string;
    passportId: string;
    name: string;
    description: string;
    category: 'skill' | 'attendance' | 'achievement' | 'behavior';
    achievedDate: string;
    icon: string;
}

export interface PerformanceBenchmark {
    id: string;
    passportId: string;
    benchmarkName: string;
    category: string;
    value: number;
    unit: string;
    recordedDate: string;
    notes?: string;
}

export interface BehavioralTracking {
    id: string;
    passportId: string;
    date: string;
    behavior: 'excellent' | 'good' | 'needs_improvement';
    category: 'discipline' | 'teamwork' | 'respect' | 'effort' | 'attitude';
    notes: string;
    recordedBy: string;
}

export interface Certification {
    id: string;
    passportId: string;
    name: string;
    description: string;
    issuer: string;
    issueDate: string;
    expiryDate?: string;
    certificateUrl: string;
    verificationCode: string;
    isVerified: boolean;
}

export interface PassportTranscript {
    passport: AthletePassport;
    skills: SkillProgress[];
    milestones: Milestone[];
    benchmarks: PerformanceBenchmark[];
    behaviors: BehavioralTracking[];
    certifications: Certification[];
}
