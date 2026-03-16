// Booking related types
export interface Class {
    id: string;
    name: string;
    description: string;
    program: {
        id: string;
        name: string;
        color: string;
    };
    instructor: {
        id: string;
        name: string;
        avatar?: string;
        bio?: string;
    };
    location: {
        id: string;
        name: string;
        address: string;
    };
    schedule: {
        dayOfWeek: string;
        startTime: string;
        endTime: string;
        date?: string;
    };
    capacity: {
        total: number;
        booked: number;
        available: number;
        waitlist: number;
    };
    pricing: {
        singleClass: number;
        package: {
            sessions: number;
            price: number;
        }[];
    };
    ageRange: {
        min: number;
        max: number;
    };
    skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'all';
    duration: number; // in minutes
    image?: string;
    tags: string[];
    isActive: boolean;
    isTrial: boolean;
}

export interface Booking {
    id: string;
    classId: string;
    class: Class;
    studentId: string;
    student: {
        id: string;
        name: string;
        age: number;
    };
    bookingType: 'single' | 'package' | 'trial';
    status: 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'waitlist';
    bookingDate: string;
    paymentStatus: 'paid' | 'pending' | 'refunded';
    amount: number;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface BookingFilters {
    location?: string;
    day?: string;
    time?: string;
    staff?: string;
    date?: string;
    program?: string;
    skillLevel?: string;
    ageRange?: {
        min: number;
        max: number;
    };
}

export type ViewMode = 'grid' | 'week' | 'schedule';

export interface TimeSlot {
    time: string;
    classes: Class[];
}

export interface WeekDay {
    date: string;
    day: string;
    classes: Class[];
}
