import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
        const response = await axios.post(`${API_URL}/careers/jobs`, data);
        return response.data;
    }

    async getJobs(filters?: any): Promise<JobPosting[]> {
        const response = await axios.get(`${API_URL}/careers/jobs`, { params: filters });
        return response.data;
    }

    async getJobById(id: string): Promise<JobPosting> {
        const response = await axios.get(`${API_URL}/careers/jobs/${id}`);
        return response.data;
    }

    async updateJob(id: string, data: Partial<JobPosting>): Promise<JobPosting> {
        const response = await axios.put(`${API_URL}/careers/jobs/${id}`, data);
        return response.data;
    }

    async deleteJob(id: string): Promise<void> {
        await axios.delete(`${API_URL}/careers/jobs/${id}`);
    }

    async publishJob(id: string): Promise<JobPosting> {
        const response = await axios.post(`${API_URL}/careers/jobs/${id}/publish`);
        return response.data;
    }

    async submitApplication(data: Partial<JobApplication>): Promise<JobApplication> {
        const response = await axios.post(`${API_URL}/careers/applications`, data);
        return response.data;
    }

    async getApplications(jobId?: string): Promise<JobApplication[]> {
        const response = await axios.get(`${API_URL}/careers/applications`, {
            params: { jobId }
        });
        return response.data;
    }

    async updateApplicationStatus(id: string, status: string, notes?: string): Promise<JobApplication> {
        const response = await axios.put(`${API_URL}/careers/applications/${id}/status`, {
            status,
            notes
        });
        return response.data;
    }

    async scheduleInterview(id: string, date: Date): Promise<JobApplication> {
        const response = await axios.post(`${API_URL}/careers/applications/${id}/interview`, {
            date
        });
        return response.data;
    }
}

export default new CareersService();
