import { apiClient } from '@/services/api/client';

export interface JobPosting {
    _id: string;
    title: string;
    department: string;
    location: string;
    type: 'full-time' | 'part-time' | 'contract' | 'internship';
    level: 'entry' | 'mid' | 'senior' | 'lead';
    description: string;
    requirements: string[];
    responsibilities: string[];
    benefits: string[];
    salary?: { min: number; max: number; currency: string };
    status: 'draft' | 'active' | 'closed' | 'filled';
    applicationCount: number;
    closingDate?: Date;
    createdAt: Date;
}

export interface JobApplication {
    _id: string;
    jobId: string;
    applicantName: string;
    email: string;
    phone: string;
    resumeUrl: string;
    coverLetter?: string;
    experience: number;
    expectedSalary?: number;
    status: 'submitted' | 'screening' | 'interview' | 'offer' | 'rejected' | 'hired';
    interviewDate?: Date;
    createdAt: Date;
}

class CareersService {
    async createJob(data: Partial<JobPosting>): Promise<JobPosting> {
        const response = await apiClient.post(`/careers/jobs`, data);
        return response;
    }

    async getJobs(filters?: any): Promise<JobPosting[]> {
        const response = await apiClient.get(`/careers/jobs`, { params: filters });
        return response;
    }

    async getJobById(id: string): Promise<JobPosting> {
        const response = await apiClient.get(`/careers/jobs/${id}`);
        return response;
    }

    async updateJob(id: string, data: Partial<JobPosting>): Promise<JobPosting> {
        const response = await apiClient.put(`/careers/jobs/${id}`, data);
        return response;
    }

    async deleteJob(id: string): Promise<void> {
        await apiClient.delete(`/careers/jobs/${id}`);
    }

    async publishJob(id: string): Promise<JobPosting> {
        const response = await apiClient.post(`/careers/jobs/${id}/publish`);
        return response;
    }

    async submitApplication(data: Partial<JobApplication>): Promise<JobApplication> {
        const response = await apiClient.post(`/careers/applications`, data);
        return response;
    }

    async getApplications(jobId?: string): Promise<JobApplication[]> {
        const response = await apiClient.get(`/careers/applications`, {
            params: { jobId }
        });
        return response;
    }

    async updateApplicationStatus(id: string, status: string, notes?: string): Promise<JobApplication> {
        const response = await apiClient.put(`/careers/applications/${id}/status`, {
            status,
            notes
        });
        return response;
    }

    async scheduleInterview(id: string, date: Date): Promise<JobApplication> {
        const response = await apiClient.post(`/careers/applications/${id}/interview`, {
            date
        });
        return response;
    }
}

export default new CareersService();
