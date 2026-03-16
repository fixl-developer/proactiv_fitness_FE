import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
        const response = await axios.get(`${API_URL}/community/groups`);
        return response.data;
    }

    async createGroup(data: Partial<DiscussionGroup>): Promise<DiscussionGroup> {
        const response = await axios.post(`${API_URL}/community/groups`, data);
        return response.data;
    }

    async joinGroup(groupId: string): Promise<void> {
        await axios.post(`${API_URL}/community/groups/${groupId}/join`);
    }

    async getDiscussions(groupId: string): Promise<Discussion[]> {
        const response = await axios.get(`${API_URL}/community/groups/${groupId}/discussions`);
        return response.data;
    }

    async createDiscussion(groupId: string, data: Partial<Discussion>): Promise<Discussion> {
        const response = await axios.post(`${API_URL}/community/groups/${groupId}/discussions`, data);
        return response.data;
    }

    async getEvents(filters?: any): Promise<CommunityEvent[]> {
        const response = await axios.get(`${API_URL}/community/events`, { params: filters });
        return response.data;
    }

    async createEvent(data: Partial<CommunityEvent>): Promise<CommunityEvent> {
        const response = await axios.post(`${API_URL}/community/events`, data);
        return response.data;
    }

    async registerForEvent(eventId: string): Promise<void> {
        await axios.post(`${API_URL}/community/events/${eventId}/register`);
    }

    async getVolunteers(): Promise<Volunteer[]> {
        const response = await axios.get(`${API_URL}/community/volunteers`);
        return response.data;
    }

    async registerVolunteer(data: Partial<Volunteer>): Promise<Volunteer> {
        const response = await axios.post(`${API_URL}/community/volunteers`, data);
        return response.data;
    }

    async getTestimonials(filters?: any): Promise<Testimonial[]> {
        const response = await axios.get(`${API_URL}/community/testimonials`, { params: filters });
        return response.data;
    }

    async submitTestimonial(data: Partial<Testimonial>): Promise<Testimonial> {
        const response = await axios.post(`${API_URL}/community/testimonials`, data);
        return response.data;
    }
}

export default new CommunityEnhancedService();
