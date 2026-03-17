import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface SearchFilters {
    tenantId: string;
    query: string;
    type?: 'program' | 'coach' | 'student' | 'sop' | 'document' | 'all';
    category?: string;
    location?: string;
    dateRange?: {
        start: string;
        end: string;
    };
    limit?: number;
    offset?: number;
}

export interface SearchResult {
    id: string;
    type: string;
    title: string;
    description: string;
    relevanceScore: number;
    metadata?: Record<string, any>;
    highlightedText?: string;
}

class SearchService {
    async search(filters: SearchFilters) {
        const response = await axios.get(`${API_URL}/search`, {
            params: filters,
        });
        return response.data;
    }

    async searchPrograms(tenantId: string, query: string, filters?: any) {
        const response = await axios.get(`${API_URL}/search/programs`, {
            params: { tenantId, query, ...filters },
        });
        return response.data;
    }

    async searchCoaches(tenantId: string, query: string, filters?: any) {
        const response = await axios.get(`${API_URL}/search/coaches`, {
            params: { tenantId, query, ...filters },
        });
        return response.data;
    }

    async searchStudents(tenantId: string, query: string, filters?: any) {
        const response = await axios.get(`${API_URL}/search/students`, {
            params: { tenantId, query, ...filters },
        });
        return response.data;
    }

    async searchDocuments(tenantId: string, query: string, filters?: any) {
        const response = await axios.get(`${API_URL}/search/documents`, {
            params: { tenantId, query, ...filters },
        });
        return response.data;
    }

    async getSearchSuggestions(tenantId: string, query: string) {
        const response = await axios.get(`${API_URL}/search/suggestions`, {
            params: { tenantId, query },
        });
        return response.data;
    }

    async getPopularSearches(tenantId: string, limit: number = 10) {
        const response = await axios.get(`${API_URL}/search/popular`, {
            params: { tenantId, limit },
        });
        return response.data;
    }

    async saveSearchHistory(tenantId: string, userId: string, query: string) {
        const response = await axios.post(`${API_URL}/search/history`, {
            tenantId,
            userId,
            query,
        });
        return response.data;
    }
}

export default new SearchService();
