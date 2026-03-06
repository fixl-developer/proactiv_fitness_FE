// Staff types and interfaces

export interface Staff {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: 'instructor' | 'coach' | 'manager' | 'admin' | 'support';
    status: 'active' | 'inactive' | 'on-leave';
    profileImage?: string;

    // Employment
    employmentType: 'full-time' | 'part-time' | 'contractor';
    hireDate: string;
    department: string;

    // Certifications
    certifications: Certification[];
    backgroundCheckStatus: 'pending' | 'approved' | 'expired' | 'failed';
    backgroundCheckDate?: string;

    // Availability
    availability: StaffAvailability[];

    // Performance
    performanceMetrics: {
        classesT aught: number;
averageRating: number;
studentSatisfaction: number;
attendanceRate: number;
    };

// Financial
hourlyRate ?: number;
salary ?: number;

createdAt: string;
updatedAt: string;
}

export interface Certification {
    id: string;
    name: string;
    issuedBy: string;
    issueDate: string;
    expiryDate?: string;
    status: 'active' | 'expired' | 'pending';
    documentUrl?: string;
}

export interface StaffAvailability {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
}

export interface StaffFilters {
    search?: string;
    role?: string;
    status?: string;
    department?: string;
    certificationStatus?: string;
    sortBy?: 'name' | 'hireDate' | 'rating';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}

export interface StaffStats {
    totalStaff: number;
    activeStaff: number;
    onLeave: number;
    averageRating: number;
    byRole: {
        instructor: number;
        coach: number;
        manager: number;
        admin: number;
        support: number;
    };
    certificationExpiring: number;
    backgroundChecksPending: number;
}
