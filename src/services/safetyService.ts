import { apiClient } from '@/services/api/client';

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
        const response = await apiClient.post(`/safety/guardians`, data);
        return response;
    }

    async getAuthorizedGuardians(studentId: string) {
        const response = await apiClient.get(`/safety/guardians/${studentId}`);
        return response;
    }

    async verifyGuardian(studentId: string, guardianId: string, verificationData: any) {
        const response = await apiClient.post(`/safety/guardians/verify`, {
            studentId,
            guardianId,
            ...verificationData,
        });
        return response;
    }

    // Pickup Management
    async logPickup(data: PickupLog) {
        const response = await apiClient.post(`/safety/pickups`, data);
        return response;
    }

    async getPickupHistory(studentId: string, limit: number = 50) {
        const response = await apiClient.get(`/safety/pickups/${studentId}`, {
            params: { limit },
        });
        return response;
    }

    // Incident Management
    async reportIncident(data: Incident) {
        const response = await apiClient.post(`/safety/incidents`, data);
        return response;
    }

    async getIncident(incidentId: string) {
        const response = await apiClient.get(`/safety/incidents/${incidentId}`);
        return response;
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
        const response = await apiClient.get(`/safety/incidents`, { params: filters });
        return response;
    }

    async updateIncident(incidentId: string, updates: Partial<Incident>) {
        const response = await apiClient.put(`/safety/incidents/${incidentId}`, updates);
        return response;
    }

    // Crisis Management
    async activateCrisisMode(data: CrisisMode) {
        const response = await apiClient.post(`/safety/crisis`, data);
        return response;
    }

    async deactivateCrisisMode(crisisId: string) {
        const response = await apiClient.put(`/safety/crisis/${crisisId}/deactivate`);
        return response;
    }

    async getActiveCrisis(locationId: string) {
        const response = await apiClient.get(`/safety/crisis/active/${locationId}`);
        return response;
    }

    async addCrisisUpdate(crisisId: string, update: string) {
        const response = await apiClient.post(`/safety/crisis/${crisisId}/update`, { update });
        return response;
    }
}

export default new SafetyService();
