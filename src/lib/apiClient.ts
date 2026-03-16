import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API Response Interface
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data: T;
    timestamp: string;
    error?: any;
}

class ApiClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
            timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000'),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Request interceptor
        this.client.interceptors.request.use(
            (config) => {
                const token = this.getToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor
        this.client.interceptors.response.use(
            (response) => response,
            async (error) => {
                if (error.response?.status === 401) {
                    // Token expired, try refresh
                    const refreshed = await this.refreshToken();
                    if (refreshed) {
                        // Retry original request
                        return this.client(error.config);
                    } else {
                        // Redirect to login
                        this.clearTokens();
                        if (typeof window !== 'undefined') {
                            window.location.href = '/auth/login';
                        }
                    }
                }
                return Promise.reject(error);
            }
        );
    }

    private getToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('accessToken');
        }
        return null;
    }

    private getRefreshToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('refreshToken');
        }
        return null;
    }

    private setTokens(accessToken: string, refreshToken: string): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
        }
    }

    private clearTokens(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
        }
    }

    private async refreshToken(): Promise<boolean> {
        try {
            const refreshToken = this.getRefreshToken();
            if (!refreshToken) return false;

            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh-token`,
                { refreshToken }
            );

            if (response.data.success) {
                this.setTokens(
                    response.data.data.accessToken,
                    response.data.data.refreshToken
                );
                return true;
            }
            return false;
        } catch (error) {
            return false;
        }
    }

    // HTTP Methods
    async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        const response: AxiosResponse<ApiResponse<T>> = await this.client.get(url, config);
        return response.data;
    }

    async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        const response: AxiosResponse<ApiResponse<T>> = await this.client.post(url, data, config);
        return response.data;
    }

    async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        const response: AxiosResponse<ApiResponse<T>> = await this.client.put(url, data, config);
        return response.data;
    }

    async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        const response: AxiosResponse<ApiResponse<T>> = await this.client.patch(url, data, config);
        return response.data;
    }

    async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        const response: AxiosResponse<ApiResponse<T>> = await this.client.delete(url, config);
        return response.data;
    }
}

export const apiClient = new ApiClient();
export default apiClient;
