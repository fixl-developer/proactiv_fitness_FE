import { apiClient } from '@/lib/apiClient';

export interface SupportTicket {
    _id?: string;
    ticketId: string;
    subject: string;
    description: string;
    customer: {
        name: string;
        email: string;
        phone?: string;
        userId?: string;
    };
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'open' | 'in-progress' | 'pending' | 'resolved' | 'closed';
    category: string;
    tags: string[];
    assignedTo?: string;
    assignedToName?: string;
    assignedToEmail?: string;
    assignedAt?: Date;
    resolution?: string;
    comments?: any[];
    history?: any[];
    attachments?: any[];
    resolvedAt?: Date | string;
    closedAt?: Date | string;
    escalatedAt?: Date | string;
    createdAt: Date;
    updatedAt: Date;
}

export interface TicketComment {
    _id?: string;
    commentId: string;
    ticketId: string;
    userId: string;
    userName: string;
    userEmail: string;
    userType: 'staff' | 'customer' | 'system';
    message: string;
    isInternal: boolean;
    attachments?: any[];
    createdAt: Date;
}

export interface TicketHistory {
    _id?: string;
    historyId: string;
    ticketId: string;
    changeType: string;
    fieldName: string;
    oldValue: any;
    newValue: any;
    changedBy: string;
    changedByEmail: string;
    reason?: string;
    createdAt: Date;
}

class SupportTicketService {
    // Tickets
    async getTickets(page = 1, limit = 20, filters?: any) {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...filters,
        });
        return apiClient.get(`/support/tickets?${params}`);
    }

    async getTicketById(id: string) {
        return apiClient.get(`/support/tickets/${id}`);
    }

    async createTicket(data: Partial<SupportTicket>) {
        return apiClient.post('/support/tickets', data);
    }

    async updateTicket(id: string, data: Partial<SupportTicket>) {
        return apiClient.put(`/support/tickets/${id}`, data);
    }

    async deleteTicket(id: string) {
        return apiClient.delete(`/support/tickets/${id}`);
    }

    // Comments
    async addComment(ticketId: string, message: string, isInternal = false, attachments: any[] = []) {
        return apiClient.post(`/support/tickets/${ticketId}/comments`, {
            message,
            isInternal,
            attachments,
        });
    }

    async getComments(ticketId: string, page = 1, limit = 20) {
        return apiClient.get(`/support/tickets/${ticketId}/comments?page=${page}&limit=${limit}`);
    }

    async deleteComment(ticketId: string, commentId: string) {
        return apiClient.delete(`/support/tickets/${ticketId}/comments/${commentId}`);
    }

    // History
    async getTicketHistory(ticketId: string, limit = 50) {
        return apiClient.get(`/support/tickets/${ticketId}/history?limit=${limit}`);
    }

    // Assignment
    async assignTicket(ticketId: string, staffId: string, staffName: string, staffEmail: string) {
        return apiClient.post(`/support/tickets/${ticketId}/assign`, {
            staffId,
            staffName,
            staffEmail,
        });
    }

    async reassignTicket(ticketId: string, staffId: string, staffName: string, staffEmail: string, reason?: string) {
        return apiClient.post(`/support/tickets/${ticketId}/reassign`, {
            staffId,
            staffName,
            staffEmail,
            reason,
        });
    }

    async unassignTicket(ticketId: string) {
        return apiClient.post(`/support/tickets/${ticketId}/unassign`, {});
    }

    async getAssignedTickets(page = 1, limit = 20, status?: string) {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });
        if (status) params.append('status', status);
        return apiClient.get(`/support/assigned-to-me?${params}`);
    }

    async getUnassignedTickets(page = 1, limit = 20) {
        return apiClient.get(`/support/unassigned?page=${page}&limit=${limit}`);
    }

    async getStaffWorkload(staffId: string) {
        return apiClient.get(`/support/staff/${staffId}/workload`);
    }

    // Statistics
    async getStatistics() {
        return apiClient.get('/support/statistics');
    }
}

export const supportTicketService = new SupportTicketService();
