import { apiClient } from '@/services/api/client';

export interface Forecast {
    forecastId?: string;
    tenantId: string;
    locationId?: string;
    period: { startDate: Date; endDate: Date };
    scenarios: Array<{
        scenarioId: string;
        name: string;
        assumptions: Record<string, any>;
        projectedRevenue: number;
        projectedCapacity: number;
        projectedDemand: number;
        confidence: number;
    }>;
    bestScenario?: string;
    recommendations?: string[];
}

class ForecastService {
    async createForecast(data: Forecast) {
        const response = await apiClient.post(`/forecast`, data);
        return response;
    }

    async getForecast(forecastId: string) {
        const response = await apiClient.get(`/forecast/${forecastId}`);
        return response;
    }

    async runScenarioAnalysis(tenantId: string, period: any, scenarios: any[]) {
        const response = await apiClient.post(`/forecast/analyze`, {
            tenantId,
            period,
            scenarios,
        });
        return response;
    }

    async getRevenueForecast(tenantId: string, locationId: string, months: number) {
        const response = await apiClient.get(`/forecast/revenue`, {
            params: { tenantId, locationId, months },
        });
        return response;
    }

    async getCapacityForecast(locationId: string, weeks: number) {
        const response = await apiClient.get(`/forecast/capacity`, {
            params: { locationId, weeks },
        });
        return response;
    }

    async getDemandPrediction(tenantId: string, programId: string) {
        const response = await apiClient.get(`/forecast/demand`, {
            params: { tenantId, programId },
        });
        return response;
    }
}

export default new ForecastService();
