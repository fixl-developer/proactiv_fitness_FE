/**
 * CRM & Family Profiles Service
 * Handles all customer relationship management operations
 * Module 3.1 - Phase 3: Customer & Money
 */

import apiClient from '@/lib/apiClient';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export enum FamilyStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    SUSPENDED = 'suspended',
    ARCHIVED = 'archived'
}

export enum InquiryStatus {
    NEW = 'new',
    CONTACTED = 'contacted',
    SCHEDULED = 'scheduled',
    VISITED = 'visited',
    ENROLLED = 'enrolled',
    DECLINED = 'declined',
    LOST = 'lost'
}

export enum LeadSource {
    WEBSITE = 'website',
    REFERRAL = 'referral',
    SOCIAL_MEDIA = 'social_media',
    WALK_IN = 'walk_in',
    PHONE = 'phone',
    EMAIL = 'email',
    EVENT = 'event',
    PARTNER = 'partner',
    ADVERTISEMENT = 'advertisement'
}

export enum CommunicationChannel {
    EMAIL = 'email',
    SMS = 'sms',
    PHONE = 'phone',
    IN_PERSON = 'in_person',
    WHATSAPP = 'whatsapp',
    APP_NOTIFICATION = 'app_notification'
}

export enum RelationshipType {
    PARENT = 'parent',
    GUARDIAN = 'guardian',
    GRANDPARENT = 'grandparent',
    SIBLING = 'sibling',
    OTHER = 'other'
}

export enum MedicalFlagType {
    ALLERGY = 'allergy',
    MEDICATION = 'medication',
    CONDITION = 'condition',
    DIETARY = 'dietary',
    BEHAVIORAL = 'behavioral',
    PHYSICAL = 'physical'
}

export enum ContactPreference {
    EMAIL = 'email',
    SMS = 'sms',
    PHONE = 'phone',
    WHATSAPP = 'whatsapp',
    NO_CONTACT = 'no_contact'
}

export interface Address {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
    type: 'home' | 'work' | 'billing' | 'other';
}

export interface EmergencyContact {
    name: string;
    relationship: RelationshipType;
    phoneNumber: string;
    alternatePhone?: string;
    email?: string;
    address?: Address;
    isPrimary: boolean;
    canPickup: boolean;
    notes?: string;
}

export interface MedicalFlag {
    type: MedicalFlagType;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    medications?: string[];
    instructions?: string;
    doctorContact?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CommunicationLog {
    channel: CommunicationChannel;
    direction: 'inbound' | 'outbound';
    subject?: string;
    content: string;
    sentBy: string;
    sentTo: string[];
    timestamp: Date;
    status: 'sent' | 'delivered' | 'read' | 'failed';
    metadata?: Record<string, any>;
}

export interface FamilyMember {
    userId: string;
    relationship: RelationshipType;
    isPrimary: boolean;
    canMakeBookings: boolean;
    canViewBilling: boolean;
    canPickupChildren: boolean;
    contactPreferences: ContactPreference[];
    notes?: string;
    addedAt: Date;
}

export interface ChildProfile {
    _id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    familyId: string;
    parentIds: string[];
    height?: number;
    weight?: number;
    medicalFlags: MedicalFlag[];
    allergies: string[];
    medications: string[];
    medicalConditions: string[];
    dietaryRestrictions: string[];
    emergencyContacts: EmergencyContact[];
    currentPrograms: string[];
    programHistory: {
        programId: string;
        enrollmentDate: Date;
        completionDate?: Date;
        status: 'active' | 'completed' | 'withdrawn';
        achievements: string[];
    }[];
    skillLevels: Record<string, string>;
    achievements: {
        type: string;
        title: string;
        description: string;
        dateAchieved: Date;
        programId?: string;
    }[];
    behavioralNotes: {
        note: string;
        category: 'positive' | 'concern' | 'neutral';
        createdBy: string;
        createdAt: Date;
        isPrivate: boolean;
    }[];
    preferences: {
        favoriteActivities: string[];
        dislikedActivities: string[];
        learningStyle: string;
        motivationFactors: string[];
    };
    profilePhotoUrl?: string;
    mediaConsent: {
        photography: boolean;
        videography: boolean;
        socialMedia: boolean;
        marketing: boolean;
        consentDate: Date;
        consentBy: string;
    };
    isActive: boolean;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface FamilyProfile {
    _id: string;
    familyName: string;
    familyCode: string;
    members: FamilyMember[];
    children: string[];
    primaryEmail: string;
    secondaryEmail?: string;
    primaryPhone: string;
    secondaryPhone?: string;
    addresses: Address[];
    preferredContactMethod: ContactPreference;
    communicationLanguage: string;
    timeZone: string;
    businessUnitId: string;
    locationIds: string[];
    status: FamilyStatus;
    accountBalance: number;
    creditLimit: number;
    billingAddress?: Address;
    paymentMethods: string[];
    billingPreferences: {
        consolidatedBilling: boolean;
        billingCycle: 'monthly' | 'quarterly' | 'annually';
        autoPayEnabled: boolean;
        invoiceDelivery: 'email' | 'postal' | 'both';
    };
    marketingConsent: {
        email: boolean;
        sms: boolean;
        phone: boolean;
        postal: boolean;
        consentDate: Date;
    };
    notes: {
        note: string;
        category: 'general' | 'billing' | 'medical' | 'behavioral' | 'administrative';
        isPrivate: boolean;
        createdBy: string;
        createdAt: Date;
    }[];
    communicationLog: CommunicationLog[];
    referredBy?: string;
    referralCode?: string;
    referrals: {
        referredFamilyId: string;
        referralDate: Date;
        status: 'pending' | 'enrolled' | 'expired';
        rewardEarned?: number;
    }[];
    firstEnrollmentDate?: Date;
    lastActivityDate?: Date;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Inquiry {
    _id: string;
    inquiryId: string;
    source: LeadSource;
    status: InquiryStatus;
    parentName: string;
    email: string;
    phone: string;
    childName?: string;
    childAge?: number;
    childAgeType: 'months' | 'years';
    interestedPrograms: string[];
    preferredLocations: string[];
    preferredDays: string[];
    preferredTimes: string[];
    businessUnitId: string;
    assignedTo?: string;
    followUpDate?: Date;
    followUpNotes: string[];
    convertedToFamilyId?: string;
    conversionDate?: Date;
    communications: CommunicationLog[];
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    referrerUrl?: string;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Lead {
    _id: string;
    leadId: string;
    source: LeadSource;
    status: 'new' | 'qualified' | 'nurturing' | 'converted' | 'lost';
    contactName: string;
    email: string;
    phone: string;
    score: number;
    scoringFactors: {
        factor: string;
        points: number;
        reason: string;
    }[];
    assignedTo?: string;
    assignedDate?: Date;
    nextFollowUp?: Date;
    followUpHistory: {
        date: Date;
        method: CommunicationChannel;
        outcome: string;
        nextAction: string;
        staffMember: string;
    }[];
    convertedToInquiryId?: string;
    conversionDate?: Date;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

// Filter interfaces
export interface FamilyFilter {
    businessUnitId?: string;
    locationId?: string;
    status?: FamilyStatus;
    hasActiveChildren?: boolean;
    minBalance?: number;
    maxBalance?: number;
    lastActivityFrom?: Date;
    lastActivityTo?: Date;
    searchText?: string;
    page?: number;
    limit?: number;
}

export interface ChildFilter {
    familyId?: string;
    minAge?: number;
    maxAge?: number;
    currentPrograms?: string[];
    hasMedicalFlags?: boolean;
    isActive?: boolean;
    searchText?: string;
    page?: number;
    limit?: number;
}

export interface InquiryFilter {
    businessUnitId?: string;
    status?: InquiryStatus;
    source?: LeadSource;
    assignedTo?: string;
    dateFrom?: Date;
    dateTo?: Date;
    interestedPrograms?: string[];
    searchText?: string;
    page?: number;
    limit?: number;
}

export interface LeadFilter {
    source?: LeadSource;
    status?: string;
    assignedTo?: string;
    minScore?: number;
    maxScore?: number;
    dateFrom?: Date;
    dateTo?: Date;
    page?: number;
    limit?: number;
}

// Request DTOs
export interface CreateFamilyDto {
    familyName: string;
    primaryEmail: string;
    primaryPhone: string;
    businessUnitId: string;
    locationIds: string[];
    primaryParent: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
    };
    address?: Address;
}

export interface CreateChildDto {
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    familyId: string;
    parentIds: string[];
    emergencyContacts: EmergencyContact[];
    medicalFlags?: MedicalFlag[];
    mediaConsent: {
        photography: boolean;
        videography: boolean;
        socialMedia: boolean;
        marketing: boolean;
    };
}

export interface CreateInquiryDto {
    parentName: string;
    email: string;
    phone: string;
    childName?: string;
    childAge?: number;
    childAgeType: 'months' | 'years';
    interestedPrograms: string[];
    preferredLocations: string[];
    source: LeadSource;
    businessUnitId: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
}

export interface CreateLeadDto {
    contactName: string;
    email: string;
    phone: string;
    source: LeadSource;
}

export interface FamilyStatistics {
    totalFamilies: number;
    activeFamilies: number;
    newFamiliesThisMonth: number;
    averageChildrenPerFamily: number;
    totalChildren: number;
    activeChildren: number;
    familiesByStatus: Record<FamilyStatus, number>;
    averageAccountBalance: number;
    totalAccountBalance: number;
}

export interface InquiryStatistics {
    totalInquiries: number;
    newInquiriesThisMonth: number;
    conversionRate: number;
    inquiriesByStatus: Record<InquiryStatus, number>;
    inquiriesBySource: Record<LeadSource, number>;
    averageResponseTime: number;
    topInterestedPrograms: {
        programId: string;
        programName: string;
        inquiryCount: number;
    }[];
}

// ============================================================================
// FAMILY SERVICE
// ============================================================================

class FamilyService {
    private readonly baseUrl = '/families';

    async getFamilies(filters?: FamilyFilter): Promise<{ data: FamilyProfile[]; total: number; meta: any }> {
        const params = new URLSearchParams();

        if (filters) {
            if (filters.businessUnitId) params.append('businessUnitId', filters.businessUnitId);
            if (filters.locationId) params.append('locationId', filters.locationId);
            if (filters.status) params.append('status', filters.status);
            if (filters.hasActiveChildren !== undefined) params.append('hasActiveChildren', filters.hasActiveChildren.toString());
            if (filters.minBalance) params.append('minBalance', filters.minBalance.toString());
            if (filters.maxBalance) params.append('maxBalance', filters.maxBalance.toString());
            if (filters.lastActivityFrom) params.append('lastActivityFrom', filters.lastActivityFrom.toISOString());
            if (filters.lastActivityTo) params.append('lastActivityTo', filters.lastActivityTo.toISOString());
            if (filters.searchText) params.append('searchText', filters.searchText);
            if (filters.page) params.append('page', filters.page.toString());
            if (filters.limit) params.append('limit', filters.limit.toString());
        }

        const response = await apiClient.get(`${this.baseUrl}?${params.toString()}`);
        return response.data;
    }

    async getFamilyById(familyId: string): Promise<FamilyProfile> {
        const response = await apiClient.get(`${this.baseUrl}/${familyId}`);
        return response.data.data;
    }

    async createFamily(data: CreateFamilyDto): Promise<FamilyProfile> {
        const response = await apiClient.post(this.baseUrl, data);
        return response.data.data;
    }

    async updateFamily(familyId: string, data: Partial<FamilyProfile>): Promise<FamilyProfile> {
        const response = await apiClient.put(`${this.baseUrl}/${familyId}`, data);
        return response.data.data;
    }

    async deleteFamily(familyId: string): Promise<void> {
        await apiClient.delete(`${this.baseUrl}/${familyId}`);
    }

    async addFamilyMember(familyId: string, member: Partial<FamilyMember>): Promise<FamilyProfile> {
        const response = await apiClient.post(`${this.baseUrl}/${familyId}/members`, member);
        return response.data.data;
    }

    async updateFamilyStatus(familyId: string, status: FamilyStatus): Promise<FamilyProfile> {
        const response = await apiClient.patch(`${this.baseUrl}/${familyId}/status`, { status });
        return response.data.data;
    }

    async addCommunicationLog(familyId: string, log: Partial<CommunicationLog>): Promise<FamilyProfile> {
        const response = await apiClient.post(`${this.baseUrl}/${familyId}/communications`, log);
        return response.data.data;
    }

    async getFamilyStatistics(businessUnitId?: string): Promise<FamilyStatistics> {
        const params = businessUnitId ? `?businessUnitId=${businessUnitId}` : '';
        const response = await apiClient.get(`${this.baseUrl}/statistics${params}`);
        return response.data.data;
    }
}

// ============================================================================
// CHILD SERVICE
// ============================================================================

class ChildService {
    private readonly baseUrl = '/children';

    async getChildren(filters?: ChildFilter): Promise<{ data: ChildProfile[]; total: number; meta: any }> {
        const params = new URLSearchParams();

        if (filters) {
            if (filters.familyId) params.append('familyId', filters.familyId);
            if (filters.minAge) params.append('minAge', filters.minAge.toString());
            if (filters.maxAge) params.append('maxAge', filters.maxAge.toString());
            if (filters.currentPrograms) {
                filters.currentPrograms.forEach(p => params.append('currentPrograms', p));
            }
            if (filters.hasMedicalFlags !== undefined) params.append('hasMedicalFlags', filters.hasMedicalFlags.toString());
            if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
            if (filters.searchText) params.append('searchText', filters.searchText);
            if (filters.page) params.append('page', filters.page.toString());
            if (filters.limit) params.append('limit', filters.limit.toString());
        }

        const response = await apiClient.get(`${this.baseUrl}?${params.toString()}`);
        return response.data;
    }

    async getChildById(childId: string): Promise<ChildProfile> {
        const response = await apiClient.get(`${this.baseUrl}/${childId}`);
        return response.data.data;
    }

    async createChild(data: CreateChildDto): Promise<ChildProfile> {
        const response = await apiClient.post(this.baseUrl, data);
        return response.data.data;
    }

    async updateChild(childId: string, data: Partial<ChildProfile>): Promise<ChildProfile> {
        const response = await apiClient.put(`${this.baseUrl}/${childId}`, data);
        return response.data.data;
    }

    async deleteChild(childId: string): Promise<void> {
        await apiClient.delete(`${this.baseUrl}/${childId}`);
    }

    async addMedicalFlag(childId: string, flag: Partial<MedicalFlag>): Promise<ChildProfile> {
        const response = await apiClient.post(`${this.baseUrl}/${childId}/medical-flags`, flag);
        return response.data.data;
    }

    async addBehavioralNote(
        childId: string,
        note: { note: string; category: 'positive' | 'concern' | 'neutral'; isPrivate?: boolean }
    ): Promise<ChildProfile> {
        const response = await apiClient.post(`${this.baseUrl}/${childId}/behavioral-notes`, note);
        return response.data.data;
    }

    async updateSkillLevel(childId: string, skill: string, level: string): Promise<ChildProfile> {
        const response = await apiClient.patch(`${this.baseUrl}/${childId}/skill-level`, { skill, level });
        return response.data.data;
    }

    async addAchievement(
        childId: string,
        achievement: {
            type: string;
            title: string;
            description: string;
            dateAchieved: Date;
            programId?: string;
        }
    ): Promise<ChildProfile> {
        const response = await apiClient.post(`${this.baseUrl}/${childId}/achievements`, achievement);
        return response.data.data;
    }
}

// ============================================================================
// INQUIRY SERVICE
// ============================================================================

class InquiryService {
    private readonly baseUrl = '/inquiries';

    async getInquiries(filters?: InquiryFilter): Promise<{ data: Inquiry[]; total: number; meta: any }> {
        const params = new URLSearchParams();

        if (filters) {
            if (filters.businessUnitId) params.append('businessUnitId', filters.businessUnitId);
            if (filters.status) params.append('status', filters.status);
            if (filters.source) params.append('source', filters.source);
            if (filters.assignedTo) params.append('assignedTo', filters.assignedTo);
            if (filters.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString());
            if (filters.dateTo) params.append('dateTo', filters.dateTo.toISOString());
            if (filters.interestedPrograms) {
                filters.interestedPrograms.forEach(p => params.append('interestedPrograms', p));
            }
            if (filters.searchText) params.append('searchText', filters.searchText);
            if (filters.page) params.append('page', filters.page.toString());
            if (filters.limit) params.append('limit', filters.limit.toString());
        }

        const response = await apiClient.get(`${this.baseUrl}?${params.toString()}`);
        return response.data;
    }

    async getInquiryById(inquiryId: string): Promise<Inquiry> {
        const response = await apiClient.get(`${this.baseUrl}/${inquiryId}`);
        return response.data.data;
    }

    async createInquiry(data: CreateInquiryDto): Promise<Inquiry> {
        const response = await apiClient.post(this.baseUrl, data);
        return response.data.data;
    }

    async updateInquiry(inquiryId: string, data: Partial<Inquiry>): Promise<Inquiry> {
        const response = await apiClient.put(`${this.baseUrl}/${inquiryId}`, data);
        return response.data.data;
    }

    async deleteInquiry(inquiryId: string): Promise<void> {
        await apiClient.delete(`${this.baseUrl}/${inquiryId}`);
    }

    async updateInquiryStatus(inquiryId: string, status: InquiryStatus): Promise<Inquiry> {
        const response = await apiClient.patch(`${this.baseUrl}/${inquiryId}/status`, { status });
        return response.data.data;
    }

    async assignInquiry(inquiryId: string, assignedTo: string): Promise<Inquiry> {
        const response = await apiClient.patch(`${this.baseUrl}/${inquiryId}/assign`, { assignedTo });
        return response.data.data;
    }

    async convertInquiry(inquiryId: string, familyId: string): Promise<Inquiry> {
        const response = await apiClient.post(`${this.baseUrl}/${inquiryId}/convert`, { familyId });
        return response.data.data;
    }

    async addFollowUpNote(inquiryId: string, note: string, nextFollowUp: Date): Promise<Inquiry> {
        const response = await apiClient.post(`${this.baseUrl}/${inquiryId}/follow-up`, { note, nextFollowUp });
        return response.data.data;
    }

    async getInquiryStatistics(businessUnitId?: string): Promise<InquiryStatistics> {
        const params = businessUnitId ? `?businessUnitId=${businessUnitId}` : '';
        const response = await apiClient.get(`${this.baseUrl}/statistics${params}`);
        return response.data.data;
    }
}

// ============================================================================
// LEAD SERVICE
// ============================================================================

class LeadService {
    private readonly baseUrl = '/leads';

    async getLeads(filters?: LeadFilter): Promise<{ data: Lead[]; total: number; meta: any }> {
        const params = new URLSearchParams();

        if (filters) {
            if (filters.source) params.append('source', filters.source);
            if (filters.status) params.append('status', filters.status);
            if (filters.assignedTo) params.append('assignedTo', filters.assignedTo);
            if (filters.minScore) params.append('minScore', filters.minScore.toString());
            if (filters.maxScore) params.append('maxScore', filters.maxScore.toString());
            if (filters.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString());
            if (filters.dateTo) params.append('dateTo', filters.dateTo.toISOString());
            if (filters.page) params.append('page', filters.page.toString());
            if (filters.limit) params.append('limit', filters.limit.toString());
        }

        const response = await apiClient.get(`${this.baseUrl}?${params.toString()}`);
        return response.data;
    }

    async getLeadById(leadId: string): Promise<Lead> {
        const response = await apiClient.get(`${this.baseUrl}/${leadId}`);
        return response.data.data;
    }

    async createLead(data: CreateLeadDto): Promise<Lead> {
        const response = await apiClient.post(this.baseUrl, data);
        return response.data.data;
    }

    async updateLead(leadId: string, data: Partial<Lead>): Promise<Lead> {
        const response = await apiClient.put(`${this.baseUrl}/${leadId}`, data);
        return response.data.data;
    }

    async deleteLead(leadId: string): Promise<void> {
        await apiClient.delete(`${this.baseUrl}/${leadId}`);
    }

    async updateLeadScore(
        leadId: string,
        scoringFactor: { factor: string; points: number; reason: string }
    ): Promise<Lead> {
        const response = await apiClient.patch(`${this.baseUrl}/${leadId}/score`, scoringFactor);
        return response.data.data;
    }

    async assignLead(leadId: string, assignedTo: string): Promise<Lead> {
        const response = await apiClient.patch(`${this.baseUrl}/${leadId}/assign`, { assignedTo });
        return response.data.data;
    }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const familyService = new FamilyService();
export const childService = new ChildService();
export const inquiryService = new InquiryService();
export const leadService = new LeadService();

export default {
    family: familyService,
    child: childService,
    inquiry: inquiryService,
    lead: leadService
};
