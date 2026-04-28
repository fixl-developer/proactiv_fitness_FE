import { apiClient } from '@/lib/apiClient';

export interface KnowledgeBaseArticle {
    _id?: string;
    articleId: string;
    title: string;
    content: string;
    category: string;
    tags: string[];
    status: 'draft' | 'published' | 'archived';
    author: string;
    featured: boolean;
    views: number;
    helpful: number;
    notHelpful: number;
    votes?: any[];
    relatedArticles?: string[];
    attachments?: any[];
    createdAt: Date;
    updatedAt: Date;
}

class KnowledgeBaseService {
    async getArticles(page = 1, limit = 20, filters?: any) {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...filters,
        });
        return apiClient.get(`/support/knowledge?${params}`);
    }

    async getArticleById(id: string) {
        return apiClient.get(`/support/knowledge/${id}`);
    }

    async createArticle(data: Partial<KnowledgeBaseArticle>) {
        return apiClient.post('/support/knowledge', data);
    }

    async updateArticle(id: string, data: Partial<KnowledgeBaseArticle>) {
        return apiClient.put(`/support/knowledge/${id}`, data);
    }

    async deleteArticle(id: string) {
        return apiClient.delete(`/support/knowledge/${id}`);
    }

    async voteArticle(id: string, voteType: 'helpful' | 'not-helpful') {
        return apiClient.post(`/support/knowledge/${id}/vote`, { voteType });
    }

    async getRelatedArticles(id: string, limit = 5) {
        return apiClient.get(`/support/knowledge/${id}/related?limit=${limit}`);
    }

    async searchArticles(query: string, page = 1, limit = 20) {
        return apiClient.get(`/support/knowledge?search=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
    }

    async getArticlesByCategory(category: string, page = 1, limit = 20) {
        return apiClient.get(`/support/knowledge?category=${category}&page=${page}&limit=${limit}`);
    }

    async getFeaturedArticles(limit = 5) {
        return apiClient.get(`/support/knowledge?featured=true&limit=${limit}`);
    }
}

export const knowledgeBaseService = new KnowledgeBaseService();
