// Safety types and interfaces

export interface Incident {
    id: string;
    type: 'injury' | 'illness' | 'behavioral' | 'equipment' | 'other';
    severity: 'minor' | 'moderate' | 'severe' | 'critical';
    studentId: string;
    studentName: string;
    locationId: string;
    locationName: string;
    date: string;
    time: string;
    description: string;
    actionTaken: string;
    reportedBy: string;
    witnessNames: string[];
    parentNotified: boolean;
    parentNotifiedAt?: string;
    medicalAttentionRequired: boolean;
    followUpRequired: boolean;
    followUpNotes?: string;
    status: 'open' | 'investigating' | 'resolved' | 'closed';
    attachments: string[];
    createdAt: string;
    updatedAt: string;
}

export interface IncidentFilters {
    type?: string;
    severity?: string;
    studentId?: string;
    locationId?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    page?: number;
    limit?: number;
}

export interface SafetyAlert {
    id: string;
    type: 'emergency' | 'warning' | 'info';
    title: string;
    message: string;
    locationId?: string;
    isActive: boolean;
    createdAt: string;
    expiresAt?: string;
}

export interface EmergencyProtocol {
    id: string;
    name: string;
    type: 'fire' | 'medical' | 'weather' | 'security' | 'evacuation';
    steps: string[];
    contacts: EmergencyContact[];
    isActive: boolean;
}

export interface EmergencyContact {
    name: string;
    role: string;
    phone: string;
    email?: string;
}
