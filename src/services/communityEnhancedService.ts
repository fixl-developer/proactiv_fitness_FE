import { apiClient } from '@/services/api/client';

export interface DiscussionGroup {
    _id: string;
    name: string;
    description: string;
    type: 'public' | 'private' | 'moderated';
    category: string;
    members: number;
    moderators: string[];
    createdAt: Date;
}

export interface Discussion {
    _id: string;
    groupId: string;
    userId: string;
    userName: string;
    title: string;
    content: string;
    replies: number;
    views: number;
    likes: number;
    isPinned: boolean;
    isLocked: boolean;
    createdAt: Date;
}

export interface CommunityEvent {
    _id: string;
    title: string;
    description: string;
    type: 'meetup' | 'workshop' | 'competition' | 'social';
    date: Date;
    location: string;
    capacity: number;
    registered: number;
    status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

export interface Volunteer {
    _id: string;
    userId: string;
    userName: string;
    skills: string[];
    availability: string[];
    hoursContributed: number;
    status: 'active' | 'inactive';
}

export interface Testimonial {
    _id: string;
    parentId: string;
    parentName: string;
    childName: string;
    rating: number;
    content: string;
    approved: boolean;
    featured: boolean;
    createdAt: Date;
}

class CommunityEnhancedService {
    async getGroups(): Promise<DiscussionGroup[]> {
        const response = await apiClient.get(`/community/groups`);
        return response;
    }

    async createGroup(data: Partial<DiscussionGroup>): Promise<DiscussionGroup> {
        const response = await apiClient.post(`/community/groups`, data);
        return response;
    }

    async joinGroup(groupId: string): Promise<void> {
        await apiClient.post(`/community/groups/${groupId}/join`);
    }

    async getDiscussions(groupId: string): Promise<Discussion[]> {
        const response = await apiClient.get(`/community/groups/${groupId}/discussions`);
        return response;
    }

    async createDiscussion(groupId: string, data: Partial<Discussion>): Promise<Discussion> {
        const response = await apiClient.post(`/community/groups/${groupId}/discussions`, data);
        return response;
    }

    async getEvents(filters?: any): Promise<CommunityEvent[]> {
        const response = await apiClient.get(`/community/events`, { params: filters });
        return response;
    }

    async createEvent(data: Partial<CommunityEvent>): Promise<CommunityEvent> {
        const response = await apiClient.post(`/community/events`, data);
        return response;
    }

    async registerForEvent(eventId: string): Promise<void> {
        await apiClient.post(`/community/events/${eventId}/register`);
    }

    async getVolunteers(): Promise<Volunteer[]> {
        const response = await apiClient.get(`/community/volunteers`);
        return response;
    }

    async registerVolunteer(data: Partial<Volunteer>): Promise<Volunteer> {
        const response = await apiClient.post(`/community/volunteers`, data);
        return response;
    }

    async getTestimonials(filters?: any): Promise<Testimonial[]> {
        const response = await apiClient.get(`/community/testimonials`, { params: filters });
        return response;
    }

    async submitTestimonial(data: Partial<Testimonial>): Promise<Testimonial> {
        const response = await apiClient.post(`/community/testimonials`, data);
        return response;
    }
}

export default new CommunityEnhancedService();
