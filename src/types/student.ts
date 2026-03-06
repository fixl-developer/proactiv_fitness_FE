// Student types and interfaces

export interface Student {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: 'male' | 'female' | 'other';
    age: number;
    skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'elite';
    profileImage?: string;
    status: 'active' | 'inactive' | 'suspended';

    // Parent/Guardian Info
    parentId: string;
    parentFirstName: string;
    parentLastName: string;
    parentEmail: string;
    parentPhone: string;

    // Address
    address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };

    // Medical Information (encrypted)
    medicalInfo: {
        allergies: string[];
        medications: string[];
        conditions: string[];
        bloodType?: string;
        doctorName?: string;
        doctorPhone?: string;
        insuranceProvider?: string;
        insuranceNumber?: string;
        specialNeeds?: string;
    };

    // Emergency Contacts
    emergencyContacts: EmergencyContact[];

    // Enrollment Info
    enrollmentDate: string;
    programs: EnrolledProgram[];

    // Attendance
    attendanceRate: number;
    totalClasses: number;
    attendedClasses: number;

    // Progress
    currentLevel: string;
    skillsAchieved: string[];
    certificationsEarned: string[];

    // Financial
    outstandingBalance: number;
    totalPaid: number;

    // Metadata
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    notes?: string;
}

export interface EmergencyContact {
    id: string;
    name: string;
    relationship: string;
    phone: string;
    email?: string;
    isPrimary: boolean;
    canPickup: boolean;
}

export interface EnrolledProgram {
    id: string;
    programId: string;
    programName: string;
    startDate: string;
    endDate?: string;
    status: 'active' | 'completed' | 'dropped';
    sessionsCompleted: number;
    totalSessions: number;
}

export interface StudentFilters {
    search?: string;
    status?: string;
    skillLevel?: string;
    programId?: string;
    ageMin?: number;
    ageMax?: number;
    locationId?: string;
    sortBy?: 'name' | 'age' | 'enrollmentDate' | 'attendanceRate';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}

export interface StudentFormData {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: 'male' | 'female' | 'other';
    skillLevel: string;
    parentFirstName: string;
    parentLastName: string;
    parentEmail: string;
    parentPhone: string;
    address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    medicalInfo: {
        allergies: string[];
        medications: string[];
        conditions: string[];
        bloodType?: string;
        specialNeeds?: string;
    };
    emergencyContacts: Omit<EmergencyContact, 'id'>[];
    notes?: string;
}

export interface StudentStats {
    totalStudents: number;
    activeStudents: number;
    newThisMonth: number;
    averageAttendance: number;
    bySkillLevel: {
        beginner: number;
        intermediate: number;
        advanced: number;
        elite: number;
    };
    byAgeGroup: {
        '3-5': number;
        '6-8': number;
        '9-12': number;
        '13-15': number;
        '16+': number;
    };
}
