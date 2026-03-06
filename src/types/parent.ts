// Parent Portal types

export interface ParentProfile {
    id: string;
    userId: string;
    name: string;
    email: string;
    phone: string;
    avatar?: string;
    children: ChildSummary[];
    createdAt: string;
    updatedAt: string;
}

export interface ChildSummary {
    id: string;
    name: string;
    age: number;
    avatar?: string;
    currentProgram: string;
    skillLevel: string;
    attendanceRate: number;
    upcomingClasses: number;
}

export interface ChildProgress {
    childId: string;
    childName: string;

    // Skills
    skillsProgress: {
        category: string;
        skills: {
            name: string;
            level: number;
            maxLevel: number;
        }[];
    }[];

    // Attendance
    totalClasses: number;
    attendedClasses: number;
    attendanceRate: number;
    currentStreak: number;

    // Achievements
    milestonesAchieved: number;
    badgesEarned: number;
    certificationsEarned: number;

    // Recent Activity
    recentActivities: Activity[];
}

export interface Activity {
    id: string;
    type: 'class' | 'milestone' | 'badge' | 'certificate' | 'payment';
    title: string;
    description: string;
    date: string;
    icon: string;
}

export interface UpcomingClass {
    id: string;
    childId: string;
    childName: string;
    className: string;
    programName: string;
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    instructor: string;
    status: 'confirmed' | 'pending' | 'cancelled';
}

export interface ParentNotification {
    id: string;
    type: 'class_reminder' | 'payment_due' | 'achievement' | 'announcement' | 'alert';
    title: string;
    message: string;
    childId?: string;
    childName?: string;
    isRead: boolean;
    createdAt: string;
}

export interface FamilyCalendarEvent {
    id: string;
    childId: string;
    childName: string;
    title: string;
    type: 'class' | 'event' | 'holiday';
    startDate: string;
    endDate: string;
    location: string;
    color: string;
}

export interface ParentCommunication {
    id: string;
    subject: string;
    message: string;
    from: string;
    to: string;
    childId?: string;
    attachments: string[];
    isRead: boolean;
    createdAt: string;
}
