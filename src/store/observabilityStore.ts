import { create } from 'zustand';
import type {
    SystemLog,
    PerformanceMetric,
    Alert,
    SecurityEvent,
    TraceData,
} from '@/types/observability';

interface ObservabilityState {
    logs: SystemLog[];
    metrics: PerformanceMetric[];
    alerts: Alert[];
    securityEvents: SecurityEvent[];
    traces: TraceData[];

    // Actions
    setLogs: (logs: SystemLog[]) => void;
    setMetrics: (metrics: PerformanceMetric[]) => void;
    setAlerts: (alerts: Alert[]) => void;
    setSecurityEvents: (events: SecurityEvent[]) => void;
    setTraces: (traces: TraceData[]) => void;

    addLog: (log: SystemLog) => void;
    addMetric: (metric: PerformanceMetric) => void;
    addAlert: (alert: Alert) => void;
    updateAlert: (id: string, updates: Partial<Alert>) => void;
}

export const useObservabilityStore = create<ObservabilityState>((set) => ({
    logs: [],
    metrics: [],
    alerts: [],
    securityEvents: [],
    traces: [],

    setLogs: (logs) => set({ logs }),
    setMetrics: (metrics) => set({ metrics }),
    setAlerts: (alerts) => set({ alerts }),
    setSecurityEvents: (securityEvents) => set({ securityEvents }),
    setTraces: (traces) => set({ traces }),

    addLog: (log) =>
        set((state) => ({
            logs: [log, ...state.logs].slice(0, 1000), // Keep last 1000 logs
        })),

    addMetric: (metric) =>
        set((state) => ({
            metrics: [...state.metrics, metric],
        })),

    addAlert: (alert) =>
        set((state) => ({
            alerts: [alert, ...state.alerts],
        })),

    updateAlert: (id, updates) =>
        set((state) => ({
            alerts: state.alerts.map((a) => (a.id === id ? { ...a, ...updates } : a)),
        })),
}));
