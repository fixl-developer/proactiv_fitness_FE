import { apiClient } from '@/services/api/client';

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
        const response = await apiClient.get(`/search`, {
            params: filters,
        });
        return response;
    }

    async searchPrograms(tenantId: string, query: string, filters?: any) {
        const response = await apiClient.get(`/search/programs`, {
            params: { tenantId, query, ...filters },
        });
        return response;
    }

    async searchCoaches(tenantId: string, query: string, filters?: any) {
        const response = await apiClient.get(`/search/coaches`, {
            params: { tenantId, query, ...filters },
        });
        return response;
    }

    async searchStudents(tenantId: string, query: string, filters?: any) {
        const response = await apiClient.get(`/search/students`, {
            params: { tenantId, query, ...filters },
        });
        return response;
    }

    async searchDocuments(tenantId: string, query: string, filters?: any) {
        const response = await apiClient.get(`/search/documents`, {
            params: { tenantId, query, ...filters },
        });
        return response;
    }

    async getSearchSuggestions(tenantId: string, query: string) {
        const response = await apiClient.get(`/search/suggestions`, {
            params: { tenantId, query },
        });
        return response;
    }

    async getPopularSearches(tenantId: string, limit: number = 10) {
        const response = await apiClient.get(`/search/popular`, {
            params: { tenantId, limit },
        });
        return response;
    }

    async saveSearchHistory(tenantId: string, userId: string, query: string) {
        const response = await apiClient.post(`/search/history`, {
            tenantId,
            userId,
            query,
        });
        return response;
    }
}

export default new SearchService();
