import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
        const response = await axios.post(`${API_URL}/forecast`, data);
        return response.data;
    }

    async getForecast(forecastId: string) {
        const response = await axios.get(`${API_URL}/forecast/${forecastId}`);
        return response.data;
    }

    async runScenarioAnalysis(tenantId: string, period: any, scenarios: any[]) {
        const response = await axios.post(`${API_URL}/forecast/analyze`, {
            tenantId,
            period,
            scenarios,
        });
        return response.data;
    }

    async getRevenueForecast(tenantId: string, locationId: string, months: number) {
        const response = await axios.get(`${API_URL}/forecast/revenue`, {
            params: { tenantId, locationId, months },
        });
        return response.data;
    }

    async getCapacityForecast(locationId: string, weeks: number) {
        const response = await axios.get(`${API_URL}/forecast/capacity`, {
            params: { locationId, weeks },
        });
        return response.data;
    }

    async getDemandPrediction(tenantId: string, programId: string) {
        const response = await axios.get(`${API_URL}/forecast/demand`, {
            params: { tenantId, programId },
        });
        return response.data;
    }
}

export default new ForecastService();
