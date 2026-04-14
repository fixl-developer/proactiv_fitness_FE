import { apiClient } from '@/services/api/client';

// White Label Types
export interface Tenant {
    _id: string;
    name: string;
    subdomain: string;
    customDomain?: string;
    status: 'active' | 'suspended' | 'trial' | 'cancelled';
    plan: 'starter' | 'professional' | 'enterprise';
    branding: TenantBranding;
    settings: TenantSettings;
    limits: TenantLimits;
    billing: TenantBilling;
    createdAt: Date;
    expiresAt?: Date;
}

export interface TenantBranding {
    logo?: string;
    favicon?: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily?: string;
    customCSS?: string;
    emailHeader?: string;
    emailFooter?: string;
}

export interface TenantSettings {
    timezone: string;
    language: string;
    currency: string;
    dateFormat: string;
    features: {
        [key: string]: boolean;
    };
    integrations: {
        [key: string]: any;
    };
}

export interface TenantLimits {
    maxLocations: number;
    maxUsers: number;
    maxStudents: number;
    maxStorage: number;
    apiCallsPerMonth: number;
    currentLocations: number;
    currentUsers: number;
    currentStudents: number;
    currentStorage: number;
    currentApiCalls: number;
}

export interface TenantBilling {
    plan: string;
    billingCycle: 'monthly' | 'annual';
    amount: number;
    currency: string;
    nextBillingDate: Date;
    paymentMethod?: string;
    invoices: string[];
}

export interface TenantUsage {
    tenantId: string;
    period: string;
    metrics: {
        activeUsers: number;
        totalStudents: number;
        totalBookings: number;
        totalRevenue: number;
        apiCalls: number;
        storageUsed: number;
    };
    breakdown: Record<string, any>;
}

// White Label Service
class WhiteLabelService {
    // Tenant Management
    async createTenant(data: Partial<Tenant>): Promise<Tenant> {
        const response = await apiClient.post(`/white-label/tenants`, data);
        return response;
    }

    async getTenants(filters?: {
        status?: string;
        plan?: string;
        search?: string;
    }): Promise<Tenant[]> {
        const response = await apiClient.get(`/white-label/tenants`, { params: filters });
        return response;
    }

    async getTenantById(id: string): Promise<Tenant> {
        const response = await apiClient.get(`/white-label/tenants/${id}`);
        return response;
    }

    async getTenantByDomain(domain: string): Promise<Tenant> {
        const response = await apiClient.get(`/white-label/tenants/domain/${domain}`);
        return response;
    }

    async updateTenant(id: string, data: Partial<Tenant>): Promise<Tenant> {
        const response = await apiClient.put(`/white-label/tenants/${id}`, data);
        return response;
    }

    async suspendTenant(id: string, reason?: string): Promise<Tenant> {
        const response = await apiClient.post(`/white-label/tenants/${id}/suspend`, {
            reason
        });
        return response;
    }

    async activateTenant(id: string): Promise<Tenant> {
        const response = await apiClient.post(`/white-label/tenants/${id}/activate`);
        return response;
    }

    async deleteTenant(id: string): Promise<void> {
        await apiClient.delete(`/white-label/tenants/${id}`);
    }

    // Branding
    async updateBranding(tenantId: string, branding: Partial<TenantBranding>): Promise<Tenant> {
        const response = await apiClient.put(`/white-label/tenants/${tenantId}/branding`, branding);
        return response;
    }

    async uploadLogo(tenantId: string, file: File): Promise<{ url: string }> {
        const formData = new FormData();
        formData.append('logo', file);
        const response = await apiClient.post(
            `/white-label/tenants/${tenantId}/branding/logo`,
            formData,
            {
                headers: { 'Content-Type': 'multipart/form-data' }
            }
        );
        return response;
    }

    async uploadFavicon(tenantId: string, file: File): Promise<{ url: string }> {
        const formData = new FormData();
        formData.append('favicon', file);
        const response = await apiClient.post(
            `/white-label/tenants/${tenantId}/branding/favicon`,
            formData,
            {
                headers: { 'Content-Type': 'multipart/form-data' }
            }
        );
        return response;
    }

    // Settings
    async updateSettings(tenantId: string, settings: Partial<TenantSettings>): Promise<Tenant> {
        const response = await apiClient.put(`/white-label/tenants/${tenantId}/settings`, settings);
        return response;
    }

    async toggleFeature(tenantId: string, feature: string, enabled: boolean): Promise<Tenant> {
        const response = await apiClient.patch(
            `/white-label/tenants/${tenantId}/features/${feature}`,
            { enabled }
        );
        return response;
    }

    // Limits & Usage
    async getTenantLimits(tenantId: string): Promise<TenantLimits> {
        const response = await apiClient.get(`/white-label/tenants/${tenantId}/limits`);
        return response;
    }

    async updateTenantLimits(tenantId: string, limits: Partial<TenantLimits>): Promise<TenantLimits> {
        const response = await apiClient.put(`/white-label/tenants/${tenantId}/limits`, limits);
        return response;
    }

    async getTenantUsage(tenantId: string, period?: string): Promise<TenantUsage> {
        const response = await apiClient.get(`/white-label/tenants/${tenantId}/usage`, {
            params: { period }
        });
        return response;
    }

    // Billing
    async updateBilling(tenantId: string, billing: Partial<TenantBilling>): Promise<Tenant> {
        const response = await apiClient.put(`/white-label/tenants/${tenantId}/billing`, billing);
        return response;
    }

    async changePlan(tenantId: string, plan: string, billingCycle: string): Promise<Tenant> {
        const response = await apiClient.post(`/white-label/tenants/${tenantId}/change-plan`, {
            plan,
            billingCycle
        });
        return response;
    }

    async getInvoices(tenantId: string): Promise<any[]> {
        const response = await apiClient.get(`/white-label/tenants/${tenantId}/invoices`);
        return response;
    }

    // Provisioning
    async provisionTenant(data: {
        name: string;
        subdomain: string;
        plan: string;
        adminEmail: string;
        adminName: string;
    }): Promise<{
        tenant: Tenant;
        adminUser: any;
        credentials: { email: string; temporaryPassword: string };
    }> {
        const response = await apiClient.post(`/white-label/provision`, data);
        return response;
    }

    // Analytics
    async getTenantAnalytics(tenantId: string, period: string = '30d'): Promise<{
        revenue: number;
        growth: number;
        activeUsers: number;
        churnRate: number;
        metrics: Record<string, any>;
    }> {
        const response = await apiClient.get(`/white-label/tenants/${tenantId}/analytics`, {
            params: { period }
        });
        return response;
    }
}

export default new WhiteLabelService();
