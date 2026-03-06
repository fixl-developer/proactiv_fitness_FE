import { create } from 'zustand';
import type {
    PricingRule,
    ForecastScenario,
    FamilySchedule,
    ParentROI,
} from '@/types/advanced';

interface AdvancedStore {
    // Pricing
    pricingRules: PricingRule[];
    setPricingRules: (rules: PricingRule[]) => void;
    addPricingRule: (rule: PricingRule) => void;
    updatePricingRule: (ruleId: string, rule: Partial<PricingRule>) => void;
    deletePricingRule: (ruleId: string) => void;

    // Forecast
    forecastScenarios: ForecastScenario[];
    setForecastScenarios: (scenarios: ForecastScenario[]) => void;
    addForecastScenario: (scenario: ForecastScenario) => void;

    // Family Schedule
    familySchedule: FamilySchedule | null;
    setFamilySchedule: (schedule: FamilySchedule) => void;

    // ROI
    roiData: ParentROI[];
    setROIData: (data: ParentROI[]) => void;

    loading: boolean;
    setLoading: (loading: boolean) => void;
}

export const useAdvancedStore = create<AdvancedStore>((set) => ({
    // Pricing
    pricingRules: [],
    setPricingRules: (pricingRules) => set({ pricingRules }),
    addPricingRule: (rule) =>
        set((state) => ({
            pricingRules: [...state.pricingRules, rule],
        })),
    updatePricingRule: (ruleId, updatedRule) =>
        set((state) => ({
            pricingRules: state.pricingRules.map((rule) =>
                rule.id === ruleId ? { ...rule, ...updatedRule } : rule
            ),
        })),
    deletePricingRule: (ruleId) =>
        set((state) => ({
            pricingRules: state.pricingRules.filter((rule) => rule.id !== ruleId),
        })),

    // Forecast
    forecastScenarios: [],
    setForecastScenarios: (forecastScenarios) => set({ forecastScenarios }),
    addForecastScenario: (scenario) =>
        set((state) => ({
            forecastScenarios: [...state.forecastScenarios, scenario],
        })),

    // Family Schedule
    familySchedule: null,
    setFamilySchedule: (familySchedule) => set({ familySchedule }),

    // ROI
    roiData: [],
    setROIData: (roiData) => set({ roiData }),

    loading: false,
    setLoading: (loading) => set({ loading }),
}));
