import { create } from 'zustand';
import type {
    Integration,
    Webhook,
    ApiKey,
    AutomationWorkflow,
    EventLog,
} from '@/types/integration';

interface IntegrationState {
    integrations: Integration[];
    webhooks: Webhook[];
    apiKeys: ApiKey[];
    workflows: AutomationWorkflow[];
    events: EventLog[];

    // Actions
    setIntegrations: (integrations: Integration[]) => void;
    setWebhooks: (webhooks: Webhook[]) => void;
    setApiKeys: (apiKeys: ApiKey[]) => void;
    setWorkflows: (workflows: AutomationWorkflow[]) => void;
    setEvents: (events: EventLog[]) => void;

    addIntegration: (integration: Integration) => void;
    updateIntegration: (id: string, updates: Partial<Integration>) => void;
    removeIntegration: (id: string) => void;

    addWebhook: (webhook: Webhook) => void;
    updateWebhook: (id: string, updates: Partial<Webhook>) => void;
    removeWebhook: (id: string) => void;

    addApiKey: (apiKey: ApiKey) => void;
    removeApiKey: (id: string) => void;

    addWorkflow: (workflow: AutomationWorkflow) => void;
    updateWorkflow: (id: string, updates: Partial<AutomationWorkflow>) => void;
    removeWorkflow: (id: string) => void;
}

export const useIntegrationStore = create<IntegrationState>((set) => ({
    integrations: [],
    webhooks: [],
    apiKeys: [],
    workflows: [],
    events: [],

    setIntegrations: (integrations) => set({ integrations }),
    setWebhooks: (webhooks) => set({ webhooks }),
    setApiKeys: (apiKeys) => set({ apiKeys }),
    setWorkflows: (workflows) => set({ workflows }),
    setEvents: (events) => set({ events }),

    addIntegration: (integration) =>
        set((state) => ({
            integrations: [...state.integrations, integration],
        })),

    updateIntegration: (id, updates) =>
        set((state) => ({
            integrations: state.integrations.map((i) => (i.id === id ? { ...i, ...updates } : i)),
        })),

    removeIntegration: (id) =>
        set((state) => ({
            integrations: state.integrations.filter((i) => i.id !== id),
        })),

    addWebhook: (webhook) =>
        set((state) => ({
            webhooks: [...state.webhooks, webhook],
        })),

    updateWebhook: (id, updates) =>
        set((state) => ({
            webhooks: state.webhooks.map((w) => (w.id === id ? { ...w, ...updates } : w)),
        })),

    removeWebhook: (id) =>
        set((state) => ({
            webhooks: state.webhooks.filter((w) => w.id !== id),
        })),

    addApiKey: (apiKey) =>
        set((state) => ({
            apiKeys: [...state.apiKeys, apiKey],
        })),

    removeApiKey: (id) =>
        set((state) => ({
            apiKeys: state.apiKeys.filter((k) => k.id !== id),
        })),

    addWorkflow: (workflow) =>
        set((state) => ({
            workflows: [...state.workflows, workflow],
        })),

    updateWorkflow: (id, updates) =>
        set((state) => ({
            workflows: state.workflows.map((w) => (w.id === id ? { ...w, ...updates } : w)),
        })),

    removeWorkflow: (id) =>
        set((state) => ({
            workflows: state.workflows.filter((w) => w.id !== id),
        })),
}));
