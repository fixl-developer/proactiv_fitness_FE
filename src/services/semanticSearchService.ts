import { apiClient } from '@/services/api/client';

export interface SemanticSearchResult {
    id: string;
    type: string;
    title: string;
    content: string;
    score: number;
    metadata: Record<string, any>;
}

export interface SearchQuery {
    query: string;
    filters?: Record<string, any>;
    limit?: number;
    offset?: number;
}

class SemanticSearchService {
    async search(data: SearchQuery): Promise<SemanticSearchResult[]> {
        const response = await apiClient.post(`/semantic-search/search`, data);
        return response;
    }

    async similarDocuments(documentId: string, limit?: number): Promise<SemanticSearchResult[]> {
        const response = await apiClient.get(`/semantic-search/similar/${documentId}`, {
            params: { limit }
        });
        return response;
    }

    async askQuestion(question: string, context?: string): Promise<{
        answer: string;
        sources: SemanticSearchResult[];
        confidence: number;
    }> {
        const response = await apiClient.post(`/semantic-search/ask`, {
            question,
            context
        });
        return response;
    }

    async indexDocument(data: {
        id: string;
        type: string;
        content: string;
        metadata?: Record<string, any>;
    }): Promise<{ success: boolean }> {
        const response = await apiClient.post(`/semantic-search/index`, data);
        return response;
    }
}

export default new SemanticSearchService();
