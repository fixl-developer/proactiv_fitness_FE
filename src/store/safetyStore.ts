import { create } from 'zustand';
import type { Incident, SafetyAlert, EmergencyProtocol } from '@/types/safety';

interface SafetyStore {
    incidents: Incident[];
    alerts: SafetyAlert[];
    protocols: EmergencyProtocol[];
    crisisMode: boolean;
    loading: boolean;

    setIncidents: (incidents: Incident[]) => void;
    setAlerts: (alerts: SafetyAlert[]) => void;
    setProtocols: (protocols: EmergencyProtocol[]) => void;
    setCrisisMode: (active: boolean) => void;
    setLoading: (loading: boolean) => void;

    addIncident: (incident: Incident) => void;
    updateIncident: (id: string, incident: Partial<Incident>) => void;

    addAlert: (alert: SafetyAlert) => void;
    removeAlert: (id: string) => void;
}

export const useSafetyStore = create<SafetyStore>((set) => ({
    incidents: [],
    alerts: [],
    protocols: [],
    crisisMode: false,
    loading: false,

    setIncidents: (incidents) => set({ incidents }),
    setAlerts: (alerts) => set({ alerts }),
    setProtocols: (protocols) => set({ protocols }),
    setCrisisMode: (active) => set({ crisisMode: active }),
    setLoading: (loading) => set({ loading }),

    addIncident: (incident) => set((state) => ({
        incidents: [...state.incidents, incident],
    })),

    updateIncident: (id, updatedIncident) => set((state) => ({
        incidents: state.incidents.map((i) =>
            i.id === id ? { ...i, ...updatedIncident } : i
        ),
    })),

    addAlert: (alert) => set((state) => ({
        alerts: [...state.alerts, alert],
    })),

    removeAlert: (id) => set((state) => ({
        alerts: state.alerts.filter((a) => a.id !== id),
    })),
}));
