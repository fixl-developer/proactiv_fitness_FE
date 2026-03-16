import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface AuthorizedGuardian {
    studentId: string;
    guardianId: string;
    guardianName: string;
    relationship: string;
    photoUrl?: string;
    verificationMethod: 'photo-id' | 'pin' | 'biometric' | 'qr-code';
    pin?: string;
    isActive: boolean;
    restrictions?: string;
    courtOrderAttached?: boolean;
}

export interface PickupLog {
    studentId: string;
    sessionId: string;
    guardianId: string;
    pickupTime: Date;
    verificationMethod: string;
    verifiedBy: string;
    latePickup: boolean;
    lateFeeApplied?: number;
    notes?: string;
}

export interface Incident {
    tenantId: string;
    locationId: string;
    incidentType: 'injury' | 'behavioral' | 'safety' | 'medical' | 'emergency' | 'other';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    involvedStudents: string[];
    involvedStaff: string[];
    witnesses?: string[];
    sessionId?: string;
    occurredAt: Date;
    reportedBy: string;
    status?: 'reported' | 'under-review' | 'resolved' | 'escalated';
    actionsTaken?: string;
    followUpRequired?: boolean;
    parentNotified?: boolean;
    attachments?: string[];
}

export interface CrisisMode {
    tenantId: string;
    locationId: string;
    crisisType: 'lockdown' | 'evacuation' | 'medical-emergency' | 'natural-disaster' | 'other';
    severity: 'warning' | 'critical' | 'emergency';
    description: string;
    instructions: string;
    affectedAreas?: string[];
    evacuationRoute?: string;
    assemblyPoint?: string;
    emergencyContacts: Array<{ name: string; phone: string; role: string }>;
    responseTeam?: string[];
}

class SafetyService {
    // Guardian Management
    async addAuthorizedGuardian(data: AuthorizedGuardian) {
        const response = await axios.post(`${API_URL}/safety/guardians`, data);
        return response.data;
    }

    async getAuthorizedGuardians(studentId: string) {
        const response = await axios.get(`${API_URL}/safety/guardians/${studentId}`);
        return response.data;
    }

    async verifyGuardian(studentId: string, guardianId: string, verificationData: any) {
        const response = await axios.post(`${API_URL}/safety/guardians/verify`, {
            studentId,
            guardianId,
            ...verificationData,
        });
        return response.data;
    }

    // Pickup Management
    async logPickup(data: PickupLog) {
        const response = await axios.post(`${API_URL}/safety/pickups`, data);
        return response.data;
    }

    async getPickupHistory(studentId: string, limit: number = 50) {
        const response = await axios.get(`${API_URL}/safety/pickups/${studentId}`, {
            params: { limit },
        });
        return response.data;
    }

    // Incident Management
    async reportIncident(data: Incident) {
        const response = await axios.post(`${API_URL}/safety/incidents`, data);
        return response.data;
    }

    async getIncident(incidentId: string) {
        const response = await axios.get(`${API_URL}/safety/incidents/${incidentId}`);
        return response.data;
    }

    async listIncidents(filters: {
        tenantId: string;
        locationId?: string;
        incidentType?: string;
        severity?: string;
        status?: string;
        startDate?: string;
        endDate?: string;
        page?: number;
        limit?: number;
    }) {
        const response = await axios.get(`${API_URL}/safety/incidents`, { params: filters });
        return response.data;
    }

    async updateIncident(incidentId: string, updates: Partial<Incident>) {
        const response = await axios.put(`${API_URL}/safety/incidents/${incidentId}`, updates);
        return response.data;
    }

    // Crisis Management
    async activateCrisisMode(data: CrisisMode) {
        const response = await axios.post(`${API_URL}/safety/crisis`, data);
        return response.data;
    }

    async deactivateCrisisMode(crisisId: string) {
        const response = await axios.put(`${API_URL}/safety/crisis/${crisisId}/deactivate`);
        return response.data;
    }

    async getActiveCrisis(locationId: string) {
        const response = await axios.get(`${API_URL}/safety/crisis/active/${locationId}`);
        return response.data;
    }

    async addCrisisUpdate(crisisId: string, update: string) {
        const response = await axios.post(`${API_URL}/safety/crisis/${crisisId}/update`, { update });
        return response.data;
    }
}

export default new SafetyService();
