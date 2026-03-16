import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface BlogPost {
    _id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    featuredImage?: string;
    author: string;
    authorName: string;
    category: string;
    tags: string[];
    status: 'draft' | 'published' | 'archived';
    publishedAt?: Date;
    views: number;
    likes: number;
    featured: boolean;
    createdAt: Date;
}

export interface BlogCategory {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    postCount: number;
}

export interface BlogComment {
    _id: string;
    postId: string;
    userName: string;
    userEmail: string;
    content: string;
    status: 'pending' | 'approved' | 'spam';
    createdAt: Date;
}

class CMSService {
    async createPost(data: Partial<BlogPost>): Promise<BlogPost> {
        const response = await axios.post(`${API_URL}/cms/posts`, data);
        return response.data;
    }

    async getPosts(filters?: any): Promise<BlogPost[]> {
        const response = await axios.get(`${API_URL}/cms/posts`, { params: filters });
        return response.data;
    }

    async getPostById(id: string): Promise<BlogPost> {
        const response = await axios.get(`${API_URL}/cms/posts/${id}`);
        return response.data;
    }

    async getPostBySlug(slug: string): Promise<BlogPost> {
        const response = await axios.get(`${API_URL}/cms/posts/slug/${slug}`);
        return response.data;
    }

    async updatePost(id: string, data: Partial<BlogPost>): Promise<BlogPost> {
        const response = await axios.put(`${API_URL}/cms/posts/${id}`, data);
        return response.data;
    }

    async deletePost(id: string): Promise<void> {
        await axios.delete(`${API_URL}/cms/posts/${id}`);
    }

    async publishPost(id: string): Promise<BlogPost> {
        const response = await axios.post(`${API_URL}/cms/posts/${id}/publish`);
        return response.data;
    }

    async incrementViews(id: string): Promise<void> {
        await axios.post(`${API_URL}/cms/posts/${id}/view`);
    }

    async likePost(id: string): Promise<BlogPost> {
        const response = await axios.post(`${API_URL}/cms/posts/${id}/like`);
        return response.data;
    }

    async getCategories(): Promise<BlogCategory[]> {
        const response = await axios.get(`${API_URL}/cms/categories`);
        return response.data;
    }

    async createCategory(data: Partial<BlogCategory>): Promise<BlogCategory> {
        const response = await axios.post(`${API_URL}/cms/categories`, data);
        return response.data;
    }

    async createComment(postId: string, data: Partial<BlogComment>): Promise<BlogComment> {
        const response = await axios.post(`${API_URL}/cms/comments`, { ...data, postId });
        return response.data;
    }

    async getComments(postId: string): Promise<BlogComment[]> {
        const response = await axios.get(`${API_URL}/cms/posts/${postId}/comments`);
        return response.data;
    }
}

export default new CMSService();
