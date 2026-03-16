import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
        const response = await axios.post(`${API_URL}/community/posts`, data);
        return response.data;
    }

    async getPost(postId: string) {
        const response = await axios.get(`${API_URL}/community/posts/${postId}`);
        return response.data;
    }

    async listPosts(filters: {
        tenantId: string;
        locationId?: string;
        feedType?: string;
        page?: number;
        limit?: number;
    }) {
        const response = await axios.get(`${API_URL}/community/posts`, {
            params: filters,
        });
        return response.data;
    }

    async addReaction(postId: string, userId: string, type: 'like' | 'love' | 'celebrate' | 'support') {
        const response = await axios.post(`${API_URL}/community/posts/${postId}/reactions`, {
            userId,
            type,
        });
        return response.data;
    }

    async addComment(postId: string, userId: string, content: string) {
        const response = await axios.post(`${API_URL}/community/posts/${postId}/comments`, {
            userId,
            content,
        });
        return response.data;
    }

    async createEvent(data: any) {
        const response = await axios.post(`${API_URL}/community/events`, data);
        return response.data;
    }

    async listEvents(tenantId: string, locationId?: string) {
        const response = await axios.get(`${API_URL}/community/events`, {
            params: { tenantId, locationId },
        });
        return response.data;
    }

    async rsvpEvent(eventId: string, userId: string, status: 'attending' | 'not-attending' | 'maybe') {
        const response = await axios.post(`${API_URL}/community/events/${eventId}/rsvp`, {
            userId,
            status,
        });
        return response.data;
    }
}

export default new CommunityService();
