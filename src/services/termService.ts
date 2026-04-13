// Term Service - Manage academic terms/semesters
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export interface Term {
    _id: string;
    name: string;
    code: string;
    startDate: string;
    endDate: string;
    weeks: number;
    isActive: boolean;
    allowEnrollment: boolean;
    enrollmentStartDate?: string;
    enrollmentEndDate?: string;
    businessUnitId: string;
    locationId?: string;
    description?: string;
    pricingMultiplier?: number;
    metadata?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTermRequest {
    name: string;
    code: string;
    startDate: string;
    endDate: string;
    businessUnitId: string;
    locationId?: string;
    description?: string;
    allowEnrollment?: boolean;
    enrollmentStartDate?: string;
    enrollmentEndDate?: string;
    pricingMultiplier?: number;
}

export interface UpdateTermRequest {
    name?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
    isActive?: boolean;
    allowEnrollment?: boolean;
    enrollmentStartDate?: string;
    enrollmentEndDate?: string;
    pricingMultiplier?: number;
}

export interface TermQuery {
    businessUnitId?: string;
    locationId?: string;
    isActive?: boolean;
    allowEnrollment?: boolean;
    page?: number;
    limit?: number;
}

class TermService {
    private getAuthHeaders() {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
        };
    }

    async createTerm(data: CreateTermRequest): Promise<Term> {
        const response = await fetch(`${API_URL}/terms`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create term');
        }

        const result = await response.json();
        return result.data;
    }

    async getTerms(query?: TermQuery): Promise<{ terms: Term[]; total: number; page: number; pages: number }> {
        const params = new URLSearchParams();
        if (query) {
            Object.entries(query).forEach(([key, value]) => {
                if (value !== undefined) params.append(key, String(value));
            });
        }

        const response = await fetch(`${API_URL}/terms?${params.toString()}`, {
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch terms');
        }

        const result = await response.json();
        return result.data;
    }

    async getTermById(id: string): Promise<Term> {
        const response = await fetch(`${API_URL}/terms/${id}`, {
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch term');
        }

        const result = await response.json();
        return result.data;
    }

    async updateTerm(id: string, data: UpdateTermRequest): Promise<Term> {
        const response = await fetch(`${API_URL}/terms/${id}`, {
            method: 'PATCH',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update term');
        }

        const result = await response.json();
        return result.data;
    }

    async deleteTerm(id: string): Promise<void> {
        const response = await fetch(`${API_URL}/terms/${id}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete term');
        }
    }

    async getActiveTerms(): Promise<Term[]> {
        const result = await this.getTerms({ isActive: true });
        return result.terms;
    }

    async getEnrollmentTerms(): Promise<Term[]> {
        const result = await this.getTerms({ isActive: true, allowEnrollment: true });
        return result.terms;
    }
}

export const termService = new TermService();
export default termService;
