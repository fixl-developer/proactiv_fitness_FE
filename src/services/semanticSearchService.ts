import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
        const response = await axios.post(`${API_URL}/semantic-search/search`, data);
        return response.data;
    }

    async similarDocuments(documentId: string, limit?: number): Promise<SemanticSearchResult[]> {
        const response = await axios.get(`${API_URL}/semantic-search/similar/${documentId}`, {
            params: { limit }
        });
        return response.data;
    }

    async askQuestion(question: string, context?: string): Promise<{
        answer: string;
        sources: SemanticSearchResult[];
        confidence: number;
    }> {
        const response = await axios.post(`${API_URL}/semantic-search/ask`, {
            question,
            context
        });
        return response.data;
    }

    async indexDocument(data: {
        id: string;
        type: string;
        content: string;
        metadata?: Record<string, any>;
    }): Promise<{ success: boolean }> {
        const response = await axios.post(`${API_URL}/semantic-search/index`, data);
        return response.data;
    }
}

export default new SemanticSearchService();
