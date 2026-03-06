import axios from 'axios';
import type {
    PricingRule,
    PriceCalculation,
    ForecastScenario,
    ForecastResults,
    FamilySchedule,
    ParentROI,
} from '@/types/advanced';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Dynamic Pricing
export const getPricingRules = async (): Promise<PricingRule[]> => {
    const response = await axios.get(`${API_URL}/pricing/rules`);
    return response.data;
};

export const createPricingRule = async (
    data: Omit<PricingRule, 'id'>
): Promise<PricingRule> => {
    const response = await axios.post(`${API_URL}/pricing/rules`, data);
    return response.data;
};

export const updatePricingRule = async (
    ruleId: string,
    data: Partial<PricingRule>
): Promise<PricingRule> => {
    const response = await axios.put(`${API_URL}/pricing/rules/${ruleId}`, data);
    return response.data;
};

export const calculatePrice = async (
    classId: string,
    date: string
): Promise<PriceCalculation> => {
    const response = await axios.post(`${API_URL}/pricing/calculate`, {
        classId,
        date,
    });
    return response.data;
};

// Forecast Simulator
export const getForecastScenarios = async (): Promise<ForecastScenario[]> => {
    const response = await axios.get(`${API_URL}/forecast/scenarios`);
    return response.data;
};

export const createForecastScenario = async (
    data: Omit<ForecastScenario, 'id' | 'results' | 'createdAt'>
): Promise<ForecastScenario> => {
    const response = await axios.post(`${API_URL}/forecast/scenarios`, data);
    return response.data;
};

export const runForecastSimulation = async (
    scenarioId: string
): Promise<ForecastResults> => {
    const response = await axios.post(`${API_URL}/forecast/simulate/${scenarioId}`);
    return response.data;
};

export const compareForecastScenarios = async (
    scenarioIds: string[]
): Promise<ForecastScenario[]> => {
    const response = await axios.post(`${API_URL}/forecast/compare`, { scenarioIds });
    return response.data;
};

// Family Scheduling
export const getFamilySchedule = async (familyId: string): Promise<FamilySchedule> => {
    const response = await axios.get(`${API_URL}/family-schedule/${familyId}`);
    return response.data;
};

export const optimizeFamilySchedule = async (
    familyId: string
): Promise<FamilySchedule> => {
    const response = await axios.post(`${API_URL}/family-schedule/${familyId}/optimize`);
    return response.data;
};

// Parent ROI
export const getParentROI = async (childId: string): Promise<ParentROI> => {
    const response = await axios.get(`${API_URL}/parent-roi/${childId}`);
    return response.data;
};

export const getFamilyROI = async (parentId: string): Promise<ParentROI[]> => {
    const response = await axios.get(`${API_URL}/parent-roi/family/${parentId}`);
    return response.data;
};
