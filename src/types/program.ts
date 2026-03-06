// Program types and interfaces

export interface Program {
    id: string;
    name: string;
    description: string;
    type: 'regular' | 'camp' | 'event' | 'private' | 'assessment' | 'party';
    category: 'gymnastics' | 'multi-activity' | 'camps' | 'parties' | 'elite';

    // Age & Skill Requirements
    ageGroup: {
        min: number;
        max: number;
    };
    skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'elite' | 'all';
    prerequisites: string[];

    // Scheduling
    duration: number; // minutes
    sessionsPerWeek: number;
    totalSessions: number;
    termBased: boolean;

    // Capacity
    minCapacity: number;
    maxCapacity: number;
    currentEnrollment: number;
    waitlistCount: number;

    // Pricing
    pricing: ProgramPricing[];

    // Location & Resources
    locationIds: string[];
    roomRequirements: string[];
    equipmentRequired: string[];

    // Staff Requirements
    minInstructors: number;
    maxInstructors: number;
    certificationRequired: string[];

    // Progression
    nextLevelProgram?: string;
    previousLevelProgram?: string;
    skillsToLearn: string[];
    certificationsOffered: string[];

    // Media
    images: string[];
    videos: string[];

    // Status & Visibility
    status: 'active' | 'inactive' | 'archived';
    isPublic: boolean;
    isFeatured: boolean;

    // Metadata
    createdAt: string;
    updatedAt: string;
    createdBy: string;
}

export interface ProgramPricing {
    id: string;
    name: string;
    type: 'single' | 'package' | 'term' | 'membership';
    sessions: number;
    price: number;
    validityDays: number;
    discount?: number;
    isPopular?: boolean;
    description?: string;
}

export interface ProgramFilters {
    search?: string;
    type?: string;
    category?: string;
    skillLevel?: string;
    ageMin?: number;
    ageMax?: number;
    locationId?: string;
    status?: string;
    isPublic?: boolean;
    isFeatured?: boolean;
    sortBy?: 'name' | 'popularity' | 'price' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}

export interface ProgramFormData {
    name: string;
    description: string;
    type: string;
    category: string;
    ageGroup: {
        min: number;
        max: number;
    };
    skillLevel: string;
    prerequisites: string[];
    duration: number;
    sessionsPerWeek: number;
    totalSessions: number;
    termBased: boolean;
    minCapacity: number;
    maxCapacity: number;
    pricing: Omit<ProgramPricing, 'id'>[];
    locationIds: string[];
    roomRequirements: string[];
    equipmentRequired: string[];
    minInstructors: number;
    maxInstructors: number;
    certificationRequired: string[];
    skillsToLearn: string[];
    certificationsOffered: string[];
    images: string[];
    videos: string[];
    status: string;
    isPublic: boolean;
    isFeatured: boolean;
}

export interface ProgramStats {
    totalPrograms: number;
    activePrograms: number;
    totalEnrollments: number;
    averageCapacity: number;
    byType: {
        regular: number;
        camp: number;
        event: number;
        private: number;
        assessment: number;
        party: number;
    };
    byCategory: {
        gymnastics: number;
        'multi-activity': number;
        camps: number;
        parties: number;
        elite: number;
    };
    topPrograms: {
        id: string;
        name: string;
        enrollments: number;
        revenue: number;
    }[];
}
