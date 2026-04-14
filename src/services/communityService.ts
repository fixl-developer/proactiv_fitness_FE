import { apiClient } from '@/services/api/client';

export interface CommunityPost {
    postId?: string;
    tenantId: string;
    locationId?: string;
    authorId: string;
    authorType: 'parent' | 'staff' | 'admin';
    feedType: 'announcement' | 'achievement' | 'event' | 'discussion';
    title: string;
    content: string;
    mediaUrls?: string[];
    visibility?: 'public' | 'members-only' | 'private';
    status?: 'active' | 'moderated' | 'removed';
}

class CommunityService {
    async createPost(data: CommunityPost) {
        const response = await apiClient.post(`/community/posts`, data);
        return response;
    }

    async getPost(postId: string) {
        const response = await apiClient.get(`/community/posts/${postId}`);
        return response;
    }

    async listPosts(filters: {
        tenantId: string;
        locationId?: string;
        feedType?: string;
        page?: number;
        limit?: number;
    }) {
        const response = await apiClient.get(`/community/posts`, {
            params: filters,
        });
        return response;
    }

    async addReaction(postId: string, userId: string, type: 'like' | 'love' | 'celebrate' | 'support') {
        const response = await apiClient.post(`/community/posts/${postId}/reactions`, {
            userId,
            type,
        });
        return response;
    }

    async addComment(postId: string, userId: string, content: string) {
        const response = await apiClient.post(`/community/posts/${postId}/comments`, {
            userId,
            content,
        });
        return response;
    }

    async createEvent(data: any) {
        const response = await apiClient.post(`/community/events`, data);
        return response;
    }

    async listEvents(tenantId: string, locationId?: string) {
        const response = await apiClient.get(`/community/events`, {
            params: { tenantId, locationId },
        });
        return response;
    }

    async rsvpEvent(eventId: string, userId: string, status: 'attending' | 'not-attending' | 'maybe') {
        const response = await apiClient.post(`/community/events/${eventId}/rsvp`, {
            userId,
            status,
        });
        return response;
    }
}

export default new CommunityService();
