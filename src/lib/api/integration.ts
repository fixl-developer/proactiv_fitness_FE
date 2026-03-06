import axios from 'axios';
import type {
    Integration,
    IntegrationHealth,
    IntegrationLog,
    Webhook,
    ApiKey,
    AutomationWorkflow,
    WorkflowExecution,
    EventLog,
} from '@/types/integration';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Integrations
export const getIntegrations = async (): Promise<Integration[]> => {
    const response = await axios.get(`${API_URL}/integrations`);
    return response.data;
};

export const getIntegration = async (integrationId: string): Promise<Integration> => {
    const response = await axios.get(`${API_URL}/integrations/${integrationId}`);
    return response.data;
};

export const createIntegration = async (
    data: Omit<Integration, 'id' | 'createdAt'>
): Promise<Integration> => {
    const response = await axios.post(`${API_URL}/integrations`, data);
    return response.data;
};

export const updateIntegration = async (
    integrationId: string,
    data: Partial<Integration>
): Promise<Integration> => {
    const response = await axios.put(`${API_URL}/integrations/${integrationId}`, data);
    return response.data;
};

export const deleteIntegration = async (integrationId: string): Promise<void> => {
    await axios.delete(`${API_URL}/integrations/${integrationId}`);
};

export const getIntegrationHealth = async (
    integrationId: string
): Promise<IntegrationHealth> => {
    const response = await axios.get(`${API_URL}/integrations/${integrationId}/health`);
    return response.data;
};

export const getIntegrationLogs = async (integrationId: string): Promise<IntegrationLog[]> => {
    const response = await axios.get(`${API_URL}/integrations/${integrationId}/logs`);
    return response.data;
};

// Webhooks
export const getWebhooks = async (): Promise<Webhook[]> => {
    const response = await axios.get(`${API_URL}/webhooks`);
    return response.data;
};

export const createWebhook = async (data: Omit<Webhook, 'id' | 'createdAt'>): Promise<Webhook> => {
    const response = await axios.post(`${API_URL}/webhooks`, data);
    return response.data;
};

export const updateWebhook = async (
    webhookId: string,
    data: Partial<Webhook>
): Promise<Webhook> => {
    const response = await axios.put(`${API_URL}/webhooks/${webhookId}`, data);
    return response.data;
};

export const deleteWebhook = async (webhookId: string): Promise<void> => {
    await axios.delete(`${API_URL}/webhooks/${webhookId}`);
};

// API Keys
export const getApiKeys = async (): Promise<ApiKey[]> => {
    const response = await axios.get(`${API_URL}/api-keys`);
    return response.data;
};

export const createApiKey = async (data: Omit<ApiKey, 'id' | 'key' | 'createdAt'>): Promise<ApiKey> => {
    const response = await axios.post(`${API_URL}/api-keys`, data);
    return response.data;
};

export const revokeApiKey = async (keyId: string): Promise<void> => {
    await axios.delete(`${API_URL}/api-keys/${keyId}`);
};

// Automation Workflows
export const getWorkflows = async (): Promise<AutomationWorkflow[]> => {
    const response = await axios.get(`${API_URL}/automation/workflows`);
    return response.data;
};

export const getWorkflow = async (workflowId: string): Promise<AutomationWorkflow> => {
    const response = await axios.get(`${API_URL}/automation/workflows/${workflowId}`);
    return response.data;
};

export const createWorkflow = async (
    data: Omit<AutomationWorkflow, 'id' | 'createdAt'>
): Promise<AutomationWorkflow> => {
    const response = await axios.post(`${API_URL}/automation/workflows`, data);
    return response.data;
};

export const updateWorkflow = async (
    workflowId: string,
    data: Partial<AutomationWorkflow>
): Promise<AutomationWorkflow> => {
    const response = await axios.put(`${API_URL}/automation/workflows/${workflowId}`, data);
    return response.data;
};

export const deleteWorkflow = async (workflowId: string): Promise<void> => {
    await axios.delete(`${API_URL}/automation/workflows/${workflowId}`);
};

export const executeWorkflow = async (workflowId: string): Promise<WorkflowExecution> => {
    const response = await axios.post(`${API_URL}/automation/workflows/${workflowId}/execute`);
    return response.data;
};

export const getWorkflowExecutions = async (
    workflowId: string
): Promise<WorkflowExecution[]> => {
    const response = await axios.get(`${API_URL}/automation/workflows/${workflowId}/executions`);
    return response.data;
};

// Event Logs
export const getEventLogs = async (): Promise<EventLog[]> => {
    const response = await axios.get(`${API_URL}/events/logs`);
    return response.data;
};

export const replayEvent = async (eventId: string): Promise<void> => {
    await axios.post(`${API_URL}/events/${eventId}/replay`);
};
