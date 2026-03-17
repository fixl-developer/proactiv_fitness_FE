import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
        const response = await axios.post(`${API_URL}/social/posts`, data);
        return response.data;
    }

    async getPosts(filters?: {
        userId?: string;
        type?: string;
        visibility?: string;
        limit?: number;
        offset?: number;
    }): Promise<Post[]> {
        const response = await axios.get(`${API_URL}/social/posts`, { params: filters });
        return response.data;
    }

    async getPostById(id: string): Promise<Post> {
        const response = await axios.get(`${API_URL}/social/posts/${id}`);
        return response.data;
    }

    async updatePost(id: string, data: Partial<Post>): Promise<Post> {
        const response = await axios.put(`${API_URL}/social/posts/${id}`, data);
        return response.data;
    }

    async deletePost(id: string): Promise<void> {
        await axios.delete(`${API_URL}/social/posts/${id}`);
    }

    async likePost(id: string): Promise<Post> {
        const response = await axios.post(`${API_URL}/social/posts/${id}/like`);
        return response.data;
    }

    async unlikePost(id: string): Promise<Post> {
        const response = await axios.post(`${API_URL}/social/posts/${id}/unlike`);
        return response.data;
    }

    async sharePost(id: string, content?: string): Promise<Post> {
        const response = await axios.post(`${API_URL}/social/posts/${id}/share`, { content });
        return response.data;
    }

    // Comments
    async createComment(postId: string, data: Partial<Comment>): Promise<Comment> {
        const response = await axios.post(`${API_URL}/social/posts/${postId}/comments`, data);
        return response.data;
    }

    async getComments(postId: string): Promise<Comment[]> {
        const response = await axios.get(`${API_URL}/social/posts/${postId}/comments`);
        return response.data;
    }

    async deleteComment(postId: string, commentId: string): Promise<void> {
        await axios.delete(`${API_URL}/social/posts/${postId}/comments/${commentId}`);
    }

    async likeComment(postId: string, commentId: string): Promise<Comment> {
        const response = await axios.post(
            `${API_URL}/social/posts/${postId}/comments/${commentId}/like`
        );
        return response.data;
    }

    // Challenges
    async createChallenge(data: Partial<Challenge>): Promise<Challenge> {
        const response = await axios.post(`${API_URL}/social/challenges`, data);
        return response.data;
    }

    async getChallenges(filters?: {
        type?: string;
        category?: string;
        status?: string;
    }): Promise<Challenge[]> {
        const response = await axios.get(`${API_URL}/social/challenges`, { params: filters });
        return response.data;
    }

    async getChallengeById(id: string): Promise<Challenge> {
        const response = await axios.get(`${API_URL}/social/challenges/${id}`);
        return response.data;
    }

    async joinChallenge(id: string): Promise<ChallengeParticipant> {
        const response = await axios.post(`${API_URL}/social/challenges/${id}/join`);
        return response.data;
    }

    async leaveChallenge(id: string): Promise<void> {
        await axios.post(`${API_URL}/social/challenges/${id}/leave`);
    }

    async getChallengeParticipants(id: string): Promise<ChallengeParticipant[]> {
        const response = await axios.get(`${API_URL}/social/challenges/${id}/participants`);
        return response.data;
    }

    async updateChallengeProgress(id: string, progress: number): Promise<ChallengeParticipant> {
        const response = await axios.post(`${API_URL}/social/challenges/${id}/progress`, {
            progress
        });
        return response.data;
    }

    // Leaderboards
    async getLeaderboard(filters: {
        type: string;
        category: string;
        period: string;
        locationId?: string;
        programId?: string;
    }): Promise<Leaderboard> {
        const response = await axios.get(`${API_URL}/social/leaderboards`, { params: filters });
        return response.data;
    }

    async getUserRank(userId: string, filters: {
        type: string;
        category: string;
        period: string;
    }): Promise<LeaderboardEntry> {
        const response = await axios.get(`${API_URL}/social/leaderboards/rank/${userId}`, {
            params: filters
        });
        return response.data;
    }

    // Messaging
    async getConversations(): Promise<Conversation[]> {
        const response = await axios.get(`${API_URL}/social/conversations`);
        return response.data;
    }

    async getConversationById(id: string): Promise<Conversation> {
        const response = await axios.get(`${API_URL}/social/conversations/${id}`);
        return response.data;
    }

    async createConversation(data: {
        type: 'direct' | 'group';
        participants: string[];
    }): Promise<Conversation> {
        const response = await axios.post(`${API_URL}/social/conversations`, data);
        return response.data;
    }

    async getMessages(conversationId: string, limit?: number): Promise<Message[]> {
        const response = await axios.get(`${API_URL}/social/conversations/${conversationId}/messages`, {
            params: { limit }
        });
        return response.data;
    }

    async sendMessage(conversationId: string, data: Partial<Message>): Promise<Message> {
        const response = await axios.post(
            `${API_URL}/social/conversations/${conversationId}/messages`,
            data
        );
        return response.data;
    }

    async markAsRead(conversationId: string, messageId: string): Promise<void> {
        await axios.post(
            `${API_URL}/social/conversations/${conversationId}/messages/${messageId}/read`
        );
    }
}

export default new SocialHubService();
