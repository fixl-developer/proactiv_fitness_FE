/**
 * Workflow Automation Service
 * Handles all workflow automation and rule engine operations
 * Module 4.1 - Phase 4: Automation
 */

import apiClient from '@/lib/apiClient';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export enum TriggerType {
    EVENT = 'event',
    SCHEDULE = 'schedule',
    WEBHOOK = 'webhook',
    MANUAL = 'manual',
    API_CALL = 'api_call',
    DATABASE_CHANGE = 'database_change',
    FILE_UPLOAD = 'file_upload',
    EMAIL_RECEIVED = 'email_received'
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
    STARTS_WITH = 'starts_with',
    ENDS_WITH = 'ends_with',
    IN = 'in',
    NOT_IN = 'not_in',
    IS_NULL = 'is_null',
    IS_NOT_NULL = 'is_not_null',
    REGEX_MATCH = 'regex_match'
}

export enum ActionType {
    SEND_EMAIL = 'send_email',
    SEND_SMS = 'send_sms',
    SEND_PUSH_NOTIFICATION = 'send_push_notification',
    CREATE_TASK = 'create_task',
    UPDATE_RECORD = 'update_record',
    CREATE_RECORD = 'create_record',
    DELETE_RECORD = 'delete_record',
    CALL_WEBHOOK = 'call_webhook',
    CALL_API = 'call_api',
    EXECUTE_FUNCTION = 'execute_function',
    SEND_SLACK_MESSAGE = 'send_slack_message',
    CREATE_CALENDAR_EVENT = 'create_calendar_event',
    GENERATE_REPORT = 'generate_report',
    TRIGGER_WORKFLOW = 'trigger_workflow',
    DELAY = 'delay',
    CONDITION = 'condition',
    LOOP = 'loop',
    PARALLEL = 'parallel'
}

export enum WorkflowStatus {
    DRAFT = 'draft',
    ACTIVE = 'active',
    PAUSED = 'paused',
    DISABLED = 'disabled',
    ERROR = 'error'
}

export enum ExecutionStatus {
    PENDING = 'pending',
    RUNNING = 'running',
    COMPLETED = 'completed',
    FAILED = 'failed',
    CANCELLED = 'cancelled',
    TIMEOUT = 'timeout'
}

export enum ExecutionMode {
    SYNCHRONOUS = 'synchronous',
    ASYNCHRONOUS = 'asynchronous',
    BACKGROUND = 'background'
}

export interface TriggerConfig {
    type: TriggerType;
    config: {
        eventTypes?: string[];
        eventFilters?: Record<string, any>;
        cronExpression?: string;
        timezone?: string;
        startDate?: Date;
        endDate?: Date;
        webhookUrl?: string;
        httpMethod?: string;
        headers?: Record<string, string>;
        collection?: string;
        operation?: 'insert' | 'update' | 'delete';
        fields?: string[];
        uploadPath?: string;
        fileTypes?: string[];
        customConfig?: Record<string, any>;
    };
}

export interface Condition {
    field: string;
    operator: ConditionOperator;
    value: any;
    dataType: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
}

export interface ConditionGroup {
    logic: 'AND' | 'OR';
    conditions: Condition[];
    groups?: ConditionGroup[];
}

export interface ActionConfig {
    type: ActionType;
    config: {
        to?: string[];
        cc?: string[];
        bcc?: string[];
        subject?: string;
        template?: string;
        templateData?: Record<string, any>;
        phoneNumbers?: string[];
        message?: string;
        userIds?: string[];
        title?: string;
        body?: string;
        data?: Record<string, any>;
        description?: string;
        assignedTo?: string;
        dueDate?: Date;
        priority?: 'low' | 'medium' | 'high' | 'critical';
        collection?: string;
        recordId?: string;
        url?: string;
        method?: string;
        headers?: Record<string, string>;
        timeout?: number;
        functionName?: string;
        parameters?: Record<string, any>;
        duration?: number;
        unit?: 'seconds' | 'minutes' | 'hours' | 'days';
        conditionGroup?: ConditionGroup;
        trueActions?: ActionConfig[];
        falseActions?: ActionConfig[];
        iterations?: number;
        loopVariable?: string;
        loopData?: any[];
        loopActions?: ActionConfig[];
        parallelActions?: ActionConfig[];
        waitForAll?: boolean;
        customConfig?: Record<string, any>;
    };
    name?: string;
    description?: string;
    timeout?: number;
    retryPolicy?: {
        maxRetries: number;
        backoffStrategy: 'linear' | 'exponential';
        initialDelay: number;
        maxDelay: number;
    };
    runCondition?: ConditionGroup;
    onError?: 'stop' | 'continue' | 'retry' | 'fallback';
    fallbackActions?: ActionConfig[];
}

export interface Workflow {
    _id: string;
    workflowId: string;
    name: string;
    description?: string;
    version: string;
    trigger: TriggerConfig;
    conditions?: ConditionGroup;
    actions: ActionConfig[];
    executionMode: ExecutionMode;
    timeout: number;
    maxConcurrentExecutions: number;
    status: WorkflowStatus;
    isActive: boolean;
    rateLimitEnabled: boolean;
    rateLimitConfig?: {
        maxExecutions: number;
        timeWindow: number;
        resetStrategy: 'sliding' | 'fixed';
    };
    scheduleEnabled: boolean;
    scheduleConfig?: {
        cronExpression: string;
        timezone: string;
        startDate?: Date;
        endDate?: Date;
    };
    errorHandling: {
        onFailure: 'stop' | 'continue' | 'retry';
        maxRetries: number;
        retryDelay: number;
        notifyOnFailure: boolean;
        notificationRecipients: string[];
    };
    statistics: {
        totalExecutions: number;
        successfulExecutions: number;
        failedExecutions: number;
        averageExecutionTime: number;
        lastExecutedAt?: Date;
        lastSuccessAt?: Date;
        lastFailureAt?: Date;
    };
    businessUnitId?: string;
    locationIds: string[];
    tags: string[];
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface WorkflowExecution {
    _id: string;
    executionId: string;
    workflowId: string;
    workflowVersion: string;
    triggeredBy: string;
    triggerData: any;
    triggerSource: string;
    status: ExecutionStatus;
    executionMode: ExecutionMode;
    startedAt: Date;
    completedAt?: Date;
    executionTime?: number;
    context: Record<string, any>;
    variables: Record<string, any>;
    steps: ExecutionStep[];
    currentStepIndex: number;
    result?: any;
    error?: string;
    retryCount: number;
    maxRetries: number;
    nextRetryAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface ExecutionStep {
    stepId: string;
    stepName: string;
    stepType: ActionType;
    status: ExecutionStatus;
    startedAt: Date;
    completedAt?: Date;
    executionTime?: number;
    input: any;
    output?: any;
    error?: string;
    retryCount: number;
    maxRetries: number;
    metadata?: Record<string, any>;
}

export interface WorkflowFilter {
    status?: WorkflowStatus;
    businessUnitId?: string;
    locationId?: string;
    tags?: string[];
    createdBy?: string;
    isActive?: boolean;
    searchText?: string;
    page?: number;
    limit?: number;
}

export interface ExecutionFilter {
    workflowId?: string;
    status?: ExecutionStatus;
    triggeredBy?: string;
    startDate?: Date;
    endDate?: Date;
    executionMode?: ExecutionMode;
    page?: number;
    limit?: number;
}

export interface CreateWorkflowDto {
    name: string;
    description?: string;
    trigger: TriggerConfig;
    conditions?: ConditionGroup;
    actions: ActionConfig[];
    executionMode?: ExecutionMode;
    timeout?: number;
    maxConcurrentExecutions?: number;
    businessUnitId?: string;
    locationIds?: string[];
    tags?: string[];
}

export interface ExecuteWorkflowDto {
    workflowId: string;
    triggerData?: any;
    context?: Record<string, any>;
    variables?: Record<string, any>;
    executionMode?: ExecutionMode;
}

export interface WorkflowStatistics {
    totalWorkflows: number;
    activeWorkflows: number;
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    averageExecutionTime: number;
    workflowsByStatus: Record<WorkflowStatus, number>;
    executionsByStatus: Record<ExecutionStatus, number>;
    topWorkflows: {
        workflowId: string;
        workflowName: string;
        executionCount: number;
        successRate: number;
    }[];
    executionTrends: {
        date: Date;
        executions: number;
        successes: number;
        failures: number;
    }[];
}

// ============================================================================
// AUTOMATION SERVICE
// ============================================================================

class AutomationService {
    private readonly baseUrl = '/automation';

    /**
     * Get all workflows
     */
    async getWorkflows(filters?: WorkflowFilter): Promise<{ data: Workflow[]; total: number; meta: any }> {
        const params = new URLSearchParams();

        if (filters) {
            if (filters.status) params.append('status', filters.status);
            if (filters.businessUnitId) params.append('businessUnitId', filters.businessUnitId);
            if (filters.locationId) params.append('locationId', filters.locationId);
            if (filters.tags) filters.tags.forEach(tag => params.append('tags', tag));
            if (filters.createdBy) params.append('createdBy', filters.createdBy);
            if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
            if (filters.searchText) params.append('searchText', filters.searchText);
            if (filters.page) params.append('page', filters.page.toString());
            if (filters.limit) params.append('limit', filters.limit.toString());
        }

        const response = await apiClient.get(`${this.baseUrl}/workflows?${params.toString()}`);
        return response.data;
    }

    /**
     * Get workflow by ID
     */
    async getWorkflowById(workflowId: string): Promise<Workflow> {
        const response = await apiClient.get(`${this.baseUrl}/workflows/${workflowId}`);
        return response.data;
    }

    /**
     * Create workflow
     */
    async createWorkflow(data: CreateWorkflowDto): Promise<Workflow> {
        const response = await apiClient.post(`${this.baseUrl}/workflows`, data);
        return response.data;
    }

    /**
     * Update workflow
     */
    async updateWorkflow(workflowId: string, data: Partial<Workflow>): Promise<Workflow> {
        const response = await apiClient.put(`${this.baseUrl}/workflows/${workflowId}`, data);
        return response.data;
    }

    /**
     * Delete workflow
     */
    async deleteWorkflow(workflowId: string): Promise<void> {
        await apiClient.delete(`${this.baseUrl}/workflows/${workflowId}`);
    }

    /**
     * Activate workflow
     */
    async activateWorkflow(workflowId: string): Promise<Workflow> {
        const response = await apiClient.post(`${this.baseUrl}/workflows/${workflowId}/activate`);
        return response.data;
    }

    /**
     * Deactivate workflow
     */
    async deactivateWorkflow(workflowId: string): Promise<Workflow> {
        const response = await apiClient.post(`${this.baseUrl}/workflows/${workflowId}/deactivate`);
        return response.data;
    }

    /**
     * Pause workflow
     */
    async pauseWorkflow(workflowId: string): Promise<Workflow> {
        const response = await apiClient.post(`${this.baseUrl}/workflows/${workflowId}/pause`);
        return response.data;
    }

    /**
     * Resume workflow
     */
    async resumeWorkflow(workflowId: string): Promise<Workflow> {
        const response = await apiClient.post(`${this.baseUrl}/workflows/${workflowId}/resume`);
        return response.data;
    }

    /**
     * Execute workflow manually
     */
    async executeWorkflow(data: ExecuteWorkflowDto): Promise<WorkflowExecution> {
        const response = await apiClient.post(`${this.baseUrl}/workflows/execute`, data);
        return response.data;
    }

    /**
     * Get workflow executions
     */
    async getExecutions(filters?: ExecutionFilter): Promise<{ data: WorkflowExecution[]; total: number; meta: any }> {
        const params = new URLSearchParams();

        if (filters) {
            if (filters.workflowId) params.append('workflowId', filters.workflowId);
            if (filters.status) params.append('status', filters.status);
            if (filters.triggeredBy) params.append('triggeredBy', filters.triggeredBy);
            if (filters.startDate) params.append('startDate', filters.startDate.toISOString());
            if (filters.endDate) params.append('endDate', filters.endDate.toISOString());
            if (filters.executionMode) params.append('executionMode', filters.executionMode);
            if (filters.page) params.append('page', filters.page.toString());
            if (filters.limit) params.append('limit', filters.limit.toString());
        }

        const response = await apiClient.get(`${this.baseUrl}/executions?${params.toString()}`);
        return response.data;
    }

    /**
     * Get execution by ID
     */
    async getExecutionById(executionId: string): Promise<WorkflowExecution> {
        const response = await apiClient.get(`${this.baseUrl}/executions/${executionId}`);
        return response.data;
    }

    /**
     * Cancel execution
     */
    async cancelExecution(executionId: string): Promise<WorkflowExecution> {
        const response = await apiClient.post(`${this.baseUrl}/executions/${executionId}/cancel`);
        return response.data;
    }

    /**
     * Retry execution
     */
    async retryExecution(executionId: string): Promise<WorkflowExecution> {
        const response = await apiClient.post(`${this.baseUrl}/executions/${executionId}/retry`);
        return response.data;
    }

    /**
     * Get workflow statistics
     */
    async getWorkflowStatistics(businessUnitId?: string, dateRange?: { startDate: Date; endDate: Date }): Promise<WorkflowStatistics> {
        const params = new URLSearchParams();
        if (businessUnitId) params.append('businessUnitId', businessUnitId);
        if (dateRange) {
            params.append('startDate', dateRange.startDate.toISOString());
            params.append('endDate', dateRange.endDate.toISOString());
        }

        const response = await apiClient.get(`${this.baseUrl}/statistics?${params.toString()}`);
        return response.data;
    }

    /**
     * Test workflow
     */
    async testWorkflow(workflowId: string, testData: any): Promise<{ success: boolean; result: any; error?: string }> {
        const response = await apiClient.post(`${this.baseUrl}/workflows/${workflowId}/test`, { testData });
        return response.data;
    }

    /**
     * Validate workflow
     */
    async validateWorkflow(workflowData: CreateWorkflowDto): Promise<{ valid: boolean; errors: string[] }> {
        const response = await apiClient.post(`${this.baseUrl}/workflows/validate`, workflowData);
        return response.data;
    }

    /**
     * Clone workflow
     */
    async cloneWorkflow(workflowId: string, newName: string): Promise<Workflow> {
        const response = await apiClient.post(`${this.baseUrl}/workflows/${workflowId}/clone`, { newName });
        return response.data;
    }

    /**
     * Export workflow
     */
    async exportWorkflow(workflowId: string): Promise<Blob> {
        const response = await apiClient.get(`${this.baseUrl}/workflows/${workflowId}/export`, {
            responseType: 'blob'
        });
        return response.data;
    }

    /**
     * Import workflow
     */
    async importWorkflow(workflowFile: File): Promise<Workflow> {
        const formData = new FormData();
        formData.append('workflow', workflowFile);

        const response = await apiClient.post(`${this.baseUrl}/workflows/import`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }

    /**
     * Get workflow templates
     */
    async getWorkflowTemplates(category?: string): Promise<any[]> {
        const params = category ? `?category=${category}` : '';
        const response = await apiClient.get(`${this.baseUrl}/templates${params}`);
        return response.data;
    }

    /**
     * Create workflow from template
     */
    async createFromTemplate(templateId: string, customData: Record<string, any>): Promise<Workflow> {
        const response = await apiClient.post(`${this.baseUrl}/templates/${templateId}/create`, customData);
        return response.data;
    }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const automationService = new AutomationService();
export default automationService;
