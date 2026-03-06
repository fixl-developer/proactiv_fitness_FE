// Integration & Automation types

export interface Integration {
    id: string;
    name: string;
    type: 'stripe' | 'mailchimp' | 'zapier' | 'slack' | 'custom';
    status: 'active' | 'inactive' | 'error';
    config: Record<string, any>;
    createdAt: string;
    lastSyncAt?: string;
}

export interface IntegrationHealth {
    status: 'healthy' | 'degraded' | 'down';
    lastCheck: string;
    responseTime: number;
    errorRate: number;
    uptime: number;
}

export interface IntegrationLog {
    id: string;
    integrationId: string;
    level: 'info' | 'warning' | 'error';
    message: string;
    timestamp: string;
    metadata?: Record<string, any>;
}

export interface Webhook {
    id: string;
    url: string;
    events: string[];
    secret: string;
    enabled: boolean;
    createdAt: string;
    lastTriggeredAt?: string;
}

export interface ApiKey {
    id: string;
    name: string;
    key: string;
    permissions: string[];
    expiresAt?: string;
    createdAt: string;
    lastUsedAt?: string;
}

export interface AutomationWorkflow {
    id: string;
    name: string;
    description: string;
    trigger: WorkflowTrigger;
    actions: WorkflowAction[];
    enabled: boolean;
    createdAt: string;
    lastRunAt?: string;
}

export interface WorkflowTrigger {
    type: 'event' | 'schedule' | 'webhook';
    config: Record<string, any>;
}

export interface WorkflowAction {
    id: string;
    type: 'email' | 'webhook' | 'api_call' | 'database' | 'notification';
    config: Record<string, any>;
    order: number;
}

export interface WorkflowExecution {
    id: string;
    workflowId: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    startedAt: string;
    completedAt?: string;
    error?: string;
    logs: string[];
}

export interface EventLog {
    id: string;
    event: string;
    payload: Record<string, any>;
    timestamp: string;
    processed: boolean;
    webhookDeliveries: WebhookDelivery[];
}

export interface WebhookDelivery {
    webhookId: string;
    status: 'pending' | 'delivered' | 'failed';
    attempts: number;
    lastAttemptAt: string;
    error?: string;
}
