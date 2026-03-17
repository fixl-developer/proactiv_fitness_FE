/**
 * Rules & Policy Engine Service
 * Handles all rule and policy management operations
 * Module 2.3 - Phase 2: Core Operations
 */

import apiClient from '@/lib/apiClient';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export enum RuleType {
    BOOKING = 'booking',
    CANCELLATION = 'cancellation',
    CAPACITY = 'capacity',
    SLA = 'sla',
    PRICING = 'pricing',
    PROMOTION = 'promotion',
    MAKEUP = 'makeup',
    WAITLIST = 'waitlist',
    ATTENDANCE = 'attendance',
    REFUND = 'refund'
}

export enum RuleStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    DRAFT = 'draft',
    EXPIRED = 'expired'
}

export enum ConditionOperator {
    EQUALS = 'equals',
    NOT_EQUALS = 'not_equals',
    GREATER_THAN = 'greater_than',
    LESS_THAN = 'less_than',
    GREATER_THAN_OR_EQUAL = 'greater_than_or_equal',
    LESS_THAN_OR_EQUAL = 'less_than_or_equal',
    CONTAINS = 'contains',
    NOT_CONTAINS = 'not_contains',
    IN = 'in',
    NOT_IN = 'not_in',
    BETWEEN = 'between',
    IS_NULL = 'is_null',
    IS_NOT_NULL = 'is_not_null'
}

export enum ActionType {
    ALLOW = 'allow',
    DENY = 'deny',
    REQUIRE_APPROVAL = 'require_approval',
    APPLY_FEE = 'apply_fee',
    APPLY_DISCOUNT = 'apply_discount',
    SEND_NOTIFICATION = 'send_notification',
    CREATE_TASK = 'create_task',
    UPDATE_STATUS = 'update_status',
    TRANSFER_TO_WAITLIST = 'transfer_to_waitlist',
    AUTO_APPROVE = 'auto_approve'
}

export interface RuleCondition {
    field: string;
    operator: ConditionOperator;
    value: any;
    dataType: 'string' | 'number' | 'boolean' | 'date' | 'array';
}

export interface RuleAction {
    type: ActionType;
    parameters: Record<string, any>;
    message?: string;
    priority: number;
}

export interface RuleContext {
    userId?: string;
    programId?: string;
    sessionId?: string;
    bookingId?: string;
    locationId?: string;
    businessUnitId?: string;
    timestamp: Date;
    metadata?: Record<string, any>;
}

export interface RuleEvaluationResult {
    ruleId: string;
    ruleName: string;
    matched: boolean;
    actions: RuleAction[];
    message?: string;
    executedAt: Date;
}

export interface PolicyEvaluationResult {
    allowed: boolean;
    actions: RuleAction[];
    matchedRules: RuleEvaluationResult[];
    messages: string[];
    fees: number;
    discounts: number;
    requiresApproval: boolean;
    approvalReason?: string;
}

export interface Rule {
    _id: string;
    name: string;
    description: string;
    ruleType: RuleType;
    category: string;
    businessUnitId?: string;
    locationIds: string[];
    programIds: string[];
    conditions: RuleCondition[];
    conditionLogic: 'AND' | 'OR';
    actions: RuleAction[];
    priority: number;
    stopOnMatch: boolean;
    effectiveFrom: Date;
    effectiveTo?: Date;
    applicableDays: string[];
    applicableTimeSlots: {
        startTime: string;
        endTime: string;
    }[];
    status: RuleStatus;
    version: number;
    parentRuleId?: string;
    statistics: {
        timesEvaluated: number;
        timesMatched: number;
        lastEvaluated?: Date;
        lastMatched?: Date;
    };
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Policy {
    _id: string;
    name: string;
    description: string;
    policyType: RuleType;
    businessUnitId?: string;
    locationIds: string[];
    programIds: string[];
    ruleIds: string[];
    ruleEvaluationOrder: 'priority' | 'creation_date' | 'custom';
    defaultAction: ActionType;
    defaultMessage?: string;
    status: RuleStatus;
    effectiveFrom: Date;
    effectiveTo?: Date;
    statistics: {
        timesEvaluated: number;
        averageEvaluationTime: number;
        lastEvaluated?: Date;
    };
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
    version: number;
}

export interface RuleTemplate {
    _id: string;
    name: string;
    description: string;
    ruleType: RuleType;
    category: string;
    conditionTemplate: {
        fields: string[];
        operators: ConditionOperator[];
        defaultValues: Record<string, any>;
    };
    actionTemplate: {
        availableActions: ActionType[];
        defaultParameters: Record<string, any>;
    };
    isPublic: boolean;
    usageCount: number;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface RuleFilter {
    ruleType?: RuleType;
    category?: string;
    status?: RuleStatus;
    businessUnitId?: string;
    locationId?: string;
    programId?: string;
    effectiveDate?: Date;
    searchText?: string;
    page?: number;
    limit?: number;
}

export interface PolicyFilter {
    policyType?: RuleType;
    status?: RuleStatus;
    businessUnitId?: string;
    locationId?: string;
    programId?: string;
    effectiveDate?: Date;
    searchText?: string;
    page?: number;
    limit?: number;
}

export interface CreateRuleDto {
    name: string;
    description: string;
    ruleType: RuleType;
    category: string;
    businessUnitId?: string;
    locationIds: string[];
    programIds: string[];
    conditions: RuleCondition[];
    conditionLogic: 'AND' | 'OR';
    actions: RuleAction[];
    priority: number;
    stopOnMatch: boolean;
    effectiveFrom: Date;
    effectiveTo?: Date;
    applicableDays: string[];
    applicableTimeSlots: {
        startTime: string;
        endTime: string;
    }[];
    status: RuleStatus;
}

export interface UpdateRuleDto extends Partial<CreateRuleDto> { }

export interface CreatePolicyDto {
    name: string;
    description: string;
    policyType: RuleType;
    businessUnitId?: string;
    locationIds: string[];
    programIds: string[];
    ruleIds: string[];
    ruleEvaluationOrder: 'priority' | 'creation_date' | 'custom';
    defaultAction: ActionType;
    defaultMessage?: string;
    status: RuleStatus;
    effectiveFrom: Date;
    effectiveTo?: Date;
}

export interface UpdatePolicyDto extends Partial<CreatePolicyDto> { }

// Specific rule types
export interface BookingRule {
    advanceBookingHours: {
        min: number;
        max: number;
    };
    maxBookingsPerUser: number;
    maxBookingsPerSession: number;
    allowWaitlist: boolean;
    requiresApproval: boolean;
    blackoutDates: Date[];
}

export interface CancellationRule {
    cancellationDeadlineHours: number;
    cancellationFeePercentage: number;
    freeCancellationsPerMonth: number;
    noShowFeeAmount: number;
    allowRescheduling: boolean;
    rescheduleDeadlineHours: number;
}

export interface CapacityRule {
    minParticipants: number;
    maxParticipants: number;
    overbookingPercentage: number;
    waitlistCapacity: number;
    autoConfirmFromWaitlist: boolean;
}

export interface PricingRule {
    basePrice: number;
    discountRules: {
        membershipType: string;
        discountPercentage: number;
    }[];
    surchargeRules: {
        condition: string;
        surchargeAmount: number;
    }[];
    dynamicPricing: {
        enabled: boolean;
        demandMultiplier: number;
        timeBasedPricing: boolean;
    };
}

export interface PromotionRule {
    promotionCode: string;
    discountType: 'percentage' | 'fixed_amount';
    discountValue: number;
    minPurchaseAmount?: number;
    maxDiscountAmount?: number;
    usageLimit?: number;
    usagePerUser?: number;
    stackable: boolean;
    eligiblePrograms: string[];
    eligibleMembershipTypes: string[];
}

export interface MakeupRule {
    allowMakeupClasses: boolean;
    makeupDeadlineDays: number;
    maxMakeupsPerMonth: number;
    makeupFeeAmount: number;
    eligibleReasons: string[];
    requiresApproval: boolean;
    makeupClassRestrictions: {
        sameProgram: boolean;
        sameLevel: boolean;
        sameLocation: boolean;
    };
}

export interface WaitlistRule {
    maxWaitlistSize: number;
    waitlistPriority: 'first_come_first_serve' | 'membership_level' | 'custom';
    autoConfirmationEnabled: boolean;
    confirmationTimeoutHours: number;
    waitlistFeeAmount: number;
    transferToAlternativePrograms: boolean;
}

// ============================================================================
// RULE SERVICE
// ============================================================================

class RuleService {
    private readonly baseUrl = '/rules';

    /**
     * Get all rules with filtering and pagination
     */
    async getRules(filters?: RuleFilter): Promise<{ data: Rule[]; total: number; meta: any }> {
        const params = new URLSearchParams();

        if (filters) {
            if (filters.ruleType) params.append('ruleType', filters.ruleType);
            if (filters.category) params.append('category', filters.category);
            if (filters.status) params.append('status', filters.status);
            if (filters.businessUnitId) params.append('businessUnitId', filters.businessUnitId);
            if (filters.locationId) params.append('locationId', filters.locationId);
            if (filters.programId) params.append('programId', filters.programId);
            if (filters.effectiveDate) params.append('effectiveDate', filters.effectiveDate.toISOString());
            if (filters.searchText) params.append('searchText', filters.searchText);
            if (filters.page) params.append('page', filters.page.toString());
            if (filters.limit) params.append('limit', filters.limit.toString());
        }

        const response = await apiClient.get(`${this.baseUrl}?${params.toString()}`);
        return response.data;
    }

    /**
     * Get rule by ID
     */
    async getRuleById(ruleId: string): Promise<Rule> {
        const response = await apiClient.get(`${this.baseUrl}/${ruleId}`);
        return response.data.data;
    }

    /**
     * Create new rule
     */
    async createRule(data: CreateRuleDto): Promise<Rule> {
        const response = await apiClient.post(this.baseUrl, data);
        return response.data.data;
    }

    /**
     * Update rule
     */
    async updateRule(ruleId: string, data: UpdateRuleDto): Promise<Rule> {
        const response = await apiClient.put(`${this.baseUrl}/${ruleId}`, data);
        return response.data.data;
    }

    /**
     * Delete rule
     */
    async deleteRule(ruleId: string): Promise<void> {
        await apiClient.delete(`${this.baseUrl}/${ruleId}`);
    }

    /**
     * Toggle rule status
     */
    async toggleRuleStatus(ruleId: string, status: RuleStatus): Promise<Rule> {
        const response = await apiClient.patch(`${this.baseUrl}/${ruleId}/status`, { status });
        return response.data.data;
    }

    /**
     * Evaluate rules for given context
     */
    async evaluateRules(ruleType: RuleType, context: RuleContext): Promise<RuleEvaluationResult[]> {
        const response = await apiClient.post(`${this.baseUrl}/evaluate`, {
            ruleType,
            context
        });
        return response.data.data;
    }

    /**
     * Get rule statistics
     */
    async getRuleStatistics(ruleId: string): Promise<Rule['statistics']> {
        const response = await apiClient.get(`${this.baseUrl}/${ruleId}/statistics`);
        return response.data.data;
    }

    /**
     * Get rules by type
     */
    async getRulesByType(ruleType: RuleType): Promise<Rule[]> {
        const response = await this.getRules({ ruleType, status: RuleStatus.ACTIVE });
        return response.data;
    }

    /**
     * Get rules by location
     */
    async getRulesByLocation(locationId: string): Promise<Rule[]> {
        const response = await this.getRules({ locationId, status: RuleStatus.ACTIVE });
        return response.data;
    }

    /**
     * Get rules by program
     */
    async getRulesByProgram(programId: string): Promise<Rule[]> {
        const response = await this.getRules({ programId, status: RuleStatus.ACTIVE });
        return response.data;
    }
}

// ============================================================================
// POLICY SERVICE
// ============================================================================

class PolicyService {
    private readonly baseUrl = '/rules/policies';

    /**
     * Get all policies with filtering and pagination
     */
    async getPolicies(filters?: PolicyFilter): Promise<{ data: Policy[]; total: number; meta: any }> {
        const params = new URLSearchParams();

        if (filters) {
            if (filters.policyType) params.append('policyType', filters.policyType);
            if (filters.status) params.append('status', filters.status);
            if (filters.businessUnitId) params.append('businessUnitId', filters.businessUnitId);
            if (filters.locationId) params.append('locationId', filters.locationId);
            if (filters.programId) params.append('programId', filters.programId);
            if (filters.effectiveDate) params.append('effectiveDate', filters.effectiveDate.toISOString());
            if (filters.searchText) params.append('searchText', filters.searchText);
            if (filters.page) params.append('page', filters.page.toString());
            if (filters.limit) params.append('limit', filters.limit.toString());
        }

        const response = await apiClient.get(`${this.baseUrl}?${params.toString()}`);
        return response.data;
    }

    /**
     * Get policy by ID
     */
    async getPolicyById(policyId: string): Promise<Policy> {
        const response = await apiClient.get(`${this.baseUrl}/${policyId}`);
        return response.data.data;
    }

    /**
     * Create new policy
     */
    async createPolicy(data: CreatePolicyDto): Promise<Policy> {
        const response = await apiClient.post(this.baseUrl, data);
        return response.data.data;
    }

    /**
     * Update policy
     */
    async updatePolicy(policyId: string, data: UpdatePolicyDto): Promise<Policy> {
        const response = await apiClient.put(`${this.baseUrl}/${policyId}`, data);
        return response.data.data;
    }

    /**
     * Delete policy
     */
    async deletePolicy(policyId: string): Promise<void> {
        await apiClient.delete(`${this.baseUrl}/${policyId}`);
    }

    /**
     * Evaluate policy for given context
     */
    async evaluatePolicy(policyId: string, context: RuleContext): Promise<PolicyEvaluationResult> {
        const response = await apiClient.post(`${this.baseUrl}/${policyId}/evaluate`, context);
        return response.data.data;
    }

    /**
     * Get policy statistics
     */
    async getPolicyStatistics(policyId: string): Promise<Policy['statistics']> {
        const response = await apiClient.get(`${this.baseUrl}/${policyId}/statistics`);
        return response.data.data;
    }
}

// ============================================================================
// RULE TEMPLATE SERVICE
// ============================================================================

class RuleTemplateService {
    private readonly baseUrl = '/rules/templates';

    /**
     * Get all rule templates
     */
    async getRuleTemplates(filters?: {
        ruleType?: RuleType;
        category?: string;
        isPublic?: boolean;
        searchText?: string;
        page?: number;
        limit?: number;
    }): Promise<{ data: RuleTemplate[]; total: number; meta: any }> {
        const params = new URLSearchParams();

        if (filters) {
            if (filters.ruleType) params.append('ruleType', filters.ruleType);
            if (filters.category) params.append('category', filters.category);
            if (filters.isPublic !== undefined) params.append('isPublic', filters.isPublic.toString());
            if (filters.searchText) params.append('searchText', filters.searchText);
            if (filters.page) params.append('page', filters.page.toString());
            if (filters.limit) params.append('limit', filters.limit.toString());
        }

        const response = await apiClient.get(`${this.baseUrl}?${params.toString()}`);
        return response.data;
    }

    /**
     * Get rule template by ID
     */
    async getRuleTemplateById(templateId: string): Promise<RuleTemplate> {
        const response = await apiClient.get(`${this.baseUrl}/${templateId}`);
        return response.data.data;
    }

    /**
     * Create new rule template
     */
    async createRuleTemplate(data: Partial<RuleTemplate>): Promise<RuleTemplate> {
        const response = await apiClient.post(this.baseUrl, data);
        return response.data.data;
    }

    /**
     * Create rule from template
     */
    async createRuleFromTemplate(
        templateId: string,
        data: { name: string;[key: string]: any }
    ): Promise<Rule> {
        const response = await apiClient.post(`${this.baseUrl}/${templateId}/create-rule`, data);
        return response.data.data;
    }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const ruleService = new RuleService();
export const policyService = new PolicyService();
export const ruleTemplateService = new RuleTemplateService();

export default {
    rule: ruleService,
    policy: policyService,
    template: ruleTemplateService
};
