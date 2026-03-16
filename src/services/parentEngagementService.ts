import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Parent Engagement Types
export interface ProgressVideo {
    _id: string;
    childId: string;
    childName: string;
    period: 'weekly' | 'monthly' | 'quarterly';
    videoUrl: string;
    thumbnailUrl?: string;
    duration: number;
    highlights: string[];
    skills: string[];
    generatedAt: Date;
    sentToParents: boolean;
    views: number;
}

export interface PhotoShare {
    _id: string;
    childId: string;
    sessionId: string;
    photos: {
        url: string;
        thumbnail: string;
        caption?: string;
        timestamp: Date;
    }[];
    sharedWith: string[];
    consentVerified: boolean;
    sharedAt: Date;
}

export interface Milestone {
    _id: string;
    childId: string;
    type: 'skill' | 'attendance' | 'behavior' | 'achievement';
    title: string;
    description: string;
    date: Date;
    celebrated: boolean;
    celebrationSent?: Date;
    media?: string[];
}

export interface ParentEducation {
    _id: string;
    title: string;
    category: 'development' | 'nutrition' | 'safety' | 'parenting' | 'fitness';
    contentType: 'article' | 'video' | 'infographic' | 'webinar';
    content: string;
    url?: string;
    duration?: number;
    targetAgeGroup?: string;
    views: number;
    likes: number;
    publishedAt: Date;
}

export interface ParentWorkshop {
    _id: string;
    title: string;
    description: string;
    type: 'online' | 'in_person' | 'hybrid';
    date: Date;
    duration: number;
    capacity: number;
    registered: number;
    locationId?: string;
    instructor: string;
    topics: string[];
    status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
    registrationDeadline: Date;
}

export interface ParentFeedback {
    _id: string;
    parentId: string;
    childId?: string;
    type: 'satisfaction' | 'suggestion' | 'complaint' | 'praise';
    category: string;
    rating?: number;
    feedback: string;
    status: 'pending' | 'reviewed' | 'resolved';
    response?: string;
    respondedBy?: string;
    respondedAt?: Date;
    createdAt: Date;
}

export interface CommunicationPreference {
    _id: string;
    parentId: string;
    email: boolean;
    sms: boolean;
    push: boolean;
    inApp: boolean;
    frequency: 'realtime' | 'daily' | 'weekly';
    categories: {
        attendance: boolean;
        progress: boolean;
        billing: boolean;
        events: boolean;
        marketing: boolean;
    };
    updatedAt: Date;
}

// Parent Engagement Service
class ParentEngagementService {
    // Progress Videos
    async getProgressVideos(childId: string, period?: string): Promise<ProgressVideo[]> {
        const response = await axios.get(`${API_URL}/parent-engagement/videos`, {
            params: { childId, period }
        });
        return response.data;
    }

    async generateProgressVideo(childId: string, period: string): Promise<ProgressVideo> {
        const response = await axios.post(`${API_URL}/parent-engagement/videos/generate`, {
            childId,
            period
        });
        return response.data;
    }

    async sendVideoToParents(videoId: string): Promise<{ success: boolean; message: string }> {
        const response = await axios.post(`${API_URL}/parent-engagement/videos/${videoId}/send`);
        return response.data;
    }

    // Photo Sharing
    async sharePhotos(data: {
        childId: string;
        sessionId: string;
        photoUrls: string[];
        parentIds: string[];
    }): Promise<PhotoShare> {
        const response = await axios.post(`${API_URL}/parent-engagement/photos/share`, data);
        return response.data;
    }

    async getSharedPhotos(childId: string): Promise<PhotoShare[]> {
        const response = await axios.get(`${API_URL}/parent-engagement/photos`, {
            params: { childId }
        });
        return response.data;
    }

    // Milestones
    async getMilestones(childId: string): Promise<Milestone[]> {
        const response = await axios.get(`${API_URL}/parent-engagement/milestones`, {
            params: { childId }
        });
        return response.data;
    }

    async createMilestone(data: Partial<Milestone>): Promise<Milestone> {
        const response = await axios.post(`${API_URL}/parent-engagement/milestones`, data);
        return response.data;
    }

    async celebrateMilestone(id: string): Promise<{ success: boolean; message: string }> {
        const response = await axios.post(`${API_URL}/parent-engagement/milestones/${id}/celebrate`);
        return response.data;
    }

    // Parent Education
    async getEducationContent(filters?: {
        category?: string;
        contentType?: string;
        targetAgeGroup?: string;
    }): Promise<ParentEducation[]> {
        const response = await axios.get(`${API_URL}/parent-engagement/education`, {
            params: filters
        });
        return response.data;
    }

    async getEducationById(id: string): Promise<ParentEducation> {
        const response = await axios.get(`${API_URL}/parent-engagement/education/${id}`);
        return response.data;
    }

    async trackEducationView(id: string): Promise<void> {
        await axios.post(`${API_URL}/parent-engagement/education/${id}/view`);
    }

    async likeEducationContent(id: string): Promise<ParentEducation> {
        const response = await axios.post(`${API_URL}/parent-engagement/education/${id}/like`);
        return response.data;
    }

    // Parent Workshops
    async getWorkshops(filters?: {
        type?: string;
        status?: string;
        locationId?: string;
    }): Promise<ParentWorkshop[]> {
        const response = await axios.get(`${API_URL}/parent-engagement/workshops`, {
            params: filters
        });
        return response.data;
    }

    async registerForWorkshop(workshopId: string, parentId: string): Promise<{
        success: boolean;
        message: string;
    }> {
        const response = await axios.post(
            `${API_URL}/parent-engagement/workshops/${workshopId}/register`,
            { parentId }
        );
        return response.data;
    }

    async cancelWorkshopRegistration(workshopId: string, parentId: string): Promise<void> {
        await axios.post(`${API_URL}/parent-engagement/workshops/${workshopId}/cancel`, {
            parentId
        });
    }

    // Feedback
    async submitFeedback(data: Partial<ParentFeedback>): Promise<ParentFeedback> {
        const response = await axios.post(`${API_URL}/parent-engagement/feedback`, data);
        return response.data;
    }

    async getFeedback(parentId: string): Promise<ParentFeedback[]> {
        const response = await axios.get(`${API_URL}/parent-engagement/feedback`, {
            params: { parentId }
        });
        return response.data;
    }

    // Communication Preferences
    async getPreferences(parentId: string): Promise<CommunicationPreference> {
        const response = await axios.get(`${API_URL}/parent-engagement/preferences/${parentId}`);
        return response.data;
    }

    async updatePreferences(
        parentId: string,
        data: Partial<CommunicationPreference>
    ): Promise<CommunicationPreference> {
        const response = await axios.put(
            `${API_URL}/parent-engagement/preferences/${parentId}`,
            data
        );
        return response.data;
    }
}

export default new ParentEngagementService();
