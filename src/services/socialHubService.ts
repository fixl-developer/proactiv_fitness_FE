import { apiClient } from '@/services/api/client';

// Social Hub Types
export interface Post {
    _id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    type: 'achievement' | 'milestone' | 'photo' | 'video' | 'status';
    content: string;
    media?: {
        type: 'image' | 'video';
        url: string;
        thumbnail?: string;
    }[];
    likes: number;
    comments: number;
    shares: number;
    visibility: 'public' | 'friends' | 'private';
    tags?: string[];
    location?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Comment {
    _id: string;
    postId: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    content: string;
    likes: number;
    parentCommentId?: string;
    createdAt: Date;
}

export interface Challenge {
    _id: string;
    title: string;
    description: string;
    type: 'individual' | 'team' | 'location';
    category: 'attendance' | 'skills' | 'fitness' | 'social' | 'custom';
    startDate: Date;
    endDate: Date;
    goal: {
        metric: string;
        target: number;
        unit: string;
    };
    rewards?: {
        type: 'points' | 'badge' | 'prize';
        value: any;
    }[];
    participants: number;
    status: 'upcoming' | 'active' | 'completed';
    createdBy: string;
    createdAt: Date;
}

export interface ChallengeParticipant {
    _id: string;
    challengeId: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    progress: number;
    rank?: number;
    status: 'active' | 'completed' | 'abandoned';
    joinedAt: Date;
    completedAt?: Date;
}

export interface Leaderboard {
    _id: string;
    type: 'global' | 'location' | 'program' | 'age_group';
    category: 'points' | 'attendance' | 'skills' | 'challenges';
    period: 'daily' | 'weekly' | 'monthly' | 'all_time';
    entries: LeaderboardEntry[];
    updatedAt: Date;
}

export interface LeaderboardEntry {
    rank: number;
    userId: string;
    userName: string;
    userAvatar?: string;
    score: number;
    change?: number;
}

export interface Message {
    _id: string;
    conversationId: string;
    senderId: string;
    senderName: string;
    senderAvatar?: string;
    content: string;
    type: 'text' | 'image' | 'video' | 'file';
    media?: {
        url: string;
        type: string;
        name?: string;
    };
    readBy: string[];
    createdAt: Date;
}

export interface Conversation {
    _id: string;
    type: 'direct' | 'group';
    participants: {
        userId: string;
        userName: string;
        userAvatar?: string;
        role?: string;
    }[];
    lastMessage?: Message;
    unreadCount: number;
    createdAt: Date;
    updatedAt: Date;
}

// Social Hub Service
class SocialHubService {
    // Posts
    async createPost(data: Partial<Post>): Promise<Post> {
        const response = await apiClient.post(`/social/posts`, data);
        return response;
    }

    async getPosts(filters?: {
        userId?: string;
        type?: string;
        visibility?: string;
        limit?: number;
        offset?: number;
    }): Promise<Post[]> {
        const response = await apiClient.get(`/social/posts`, { params: filters });
        return response;
    }

    async getPostById(id: string): Promise<Post> {
        const response = await apiClient.get(`/social/posts/${id}`);
        return response;
    }

    async updatePost(id: string, data: Partial<Post>): Promise<Post> {
        const response = await apiClient.put(`/social/posts/${id}`, data);
        return response;
    }

    async deletePost(id: string): Promise<void> {
        await apiClient.delete(`/social/posts/${id}`);
    }

    async likePost(id: string): Promise<Post> {
        const response = await apiClient.post(`/social/posts/${id}/like`);
        return response;
    }

    async unlikePost(id: string): Promise<Post> {
        const response = await apiClient.post(`/social/posts/${id}/unlike`);
        return response;
    }

    async sharePost(id: string, content?: string): Promise<Post> {
        const response = await apiClient.post(`/social/posts/${id}/share`, { content });
        return response;
    }

    // Comments
    async createComment(postId: string, data: Partial<Comment>): Promise<Comment> {
        const response = await apiClient.post(`/social/posts/${postId}/comments`, data);
        return response;
    }

    async getComments(postId: string): Promise<Comment[]> {
        const response = await apiClient.get(`/social/posts/${postId}/comments`);
        return response;
    }

    async deleteComment(postId: string, commentId: string): Promise<void> {
        await apiClient.delete(`/social/posts/${postId}/comments/${commentId}`);
    }

    async likeComment(postId: string, commentId: string): Promise<Comment> {
        const response = await apiClient.post(
            `/social/posts/${postId}/comments/${commentId}/like`
        );
        return response;
    }

    // Challenges
    async createChallenge(data: Partial<Challenge>): Promise<Challenge> {
        const response = await apiClient.post(`/social/challenges`, data);
        return response;
    }

    async getChallenges(filters?: {
        type?: string;
        category?: string;
        status?: string;
    }): Promise<Challenge[]> {
        const response = await apiClient.get(`/social/challenges`, { params: filters });
        return response;
    }

    async getChallengeById(id: string): Promise<Challenge> {
        const response = await apiClient.get(`/social/challenges/${id}`);
        return response;
    }

    async joinChallenge(id: string): Promise<ChallengeParticipant> {
        const response = await apiClient.post(`/social/challenges/${id}/join`);
        return response;
    }

    async leaveChallenge(id: string): Promise<void> {
        await apiClient.post(`/social/challenges/${id}/leave`);
    }

    async getChallengeParticipants(id: string): Promise<ChallengeParticipant[]> {
        const response = await apiClient.get(`/social/challenges/${id}/participants`);
        return response;
    }

    async updateChallengeProgress(id: string, progress: number): Promise<ChallengeParticipant> {
        const response = await apiClient.post(`/social/challenges/${id}/progress`, {
            progress
        });
        return response;
    }

    // Leaderboards
    async getLeaderboard(filters: {
        type: string;
        category: string;
        period: string;
        locationId?: string;
        programId?: string;
    }): Promise<Leaderboard> {
        const response = await apiClient.get(`/social/leaderboards`, { params: filters });
        return response;
    }

    async getUserRank(userId: string, filters: {
        type: string;
        category: string;
        period: string;
    }): Promise<LeaderboardEntry> {
        const response = await apiClient.get(`/social/leaderboards/rank/${userId}`, {
            params: filters
        });
        return response;
    }

    // Messaging
    async getConversations(): Promise<Conversation[]> {
        const response = await apiClient.get(`/social/conversations`);
        return response;
    }

    async getConversationById(id: string): Promise<Conversation> {
        const response = await apiClient.get(`/social/conversations/${id}`);
        return response;
    }

    async createConversation(data: {
        type: 'direct' | 'group';
        participants: string[];
    }): Promise<Conversation> {
        const response = await apiClient.post(`/social/conversations`, data);
        return response;
    }

    async getMessages(conversationId: string, limit?: number): Promise<Message[]> {
        const response = await apiClient.get(`/social/conversations/${conversationId}/messages`, {
            params: { limit }
        });
        return response;
    }

    async sendMessage(conversationId: string, data: Partial<Message>): Promise<Message> {
        const response = await apiClient.post(
            `/social/conversations/${conversationId}/messages`,
            data
        );
        return response;
    }

    async markAsRead(conversationId: string, messageId: string): Promise<void> {
        await apiClient.post(
            `/social/conversations/${conversationId}/messages/${messageId}/read`
        );
    }
}

export default new SocialHubService();
