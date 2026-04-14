import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios'

// Unified API Client for entire application
// All other client files re-export from here

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'

class ApiClient {
    private client: AxiosInstance

    constructor() {
        this.client = axios.create({
            baseURL: BASE_URL,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json'
            }
        })

        this.setupInterceptors()
    }

    private setupInterceptors() {
        // Request interceptor - add auth token
        this.client.interceptors.request.use(
            (config) => {
                if (typeof window !== 'undefined') {
                    const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
                    if (token && config.headers) {
                        config.headers.Authorization = `Bearer ${token}`
                    }
                }
                return config
            },
            (error) => Promise.reject(error)
        )

        // Response interceptor - handle 401 token refresh
        this.client.interceptors.response.use(
            (response) => response,
            async (error: AxiosError) => {
                const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true

                    try {
                        if (typeof window !== 'undefined') {
                            const refreshToken = localStorage.getItem('refreshToken')
                            if (refreshToken) {
                                const response = await axios.post(
                                    `${BASE_URL}/auth/refresh-token`,
                                    { refreshToken }
                                )

                                const newToken = response.data?.data?.accessToken || response.data?.accessToken
                                if (newToken) {
                                    localStorage.setItem('token', newToken)
                                    localStorage.setItem('accessToken', newToken)

                                    if (originalRequest.headers) {
                                        originalRequest.headers.Authorization = `Bearer ${newToken}`
                                    }
                                    return this.client(originalRequest)
                                }
                            }
                        }
                    } catch (refreshError) {
                        if (typeof window !== 'undefined') {
                            localStorage.removeItem('token')
                            localStorage.removeItem('accessToken')
                            localStorage.removeItem('refreshToken')
                            localStorage.removeItem('user')
                            window.location.href = '/login'
                        }
                    }
                }

                return Promise.reject(error)
            }
        )
    }

    // All methods return the response body: { success, data, message }
    async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.get<T>(url, config)
        return response.data
    }

    async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.post<T>(url, data, config)
        return response.data
    }

    async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.put<T>(url, data, config)
        return response.data
    }

    async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.patch<T>(url, data, config)
        return response.data
    }

    async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.delete<T>(url, config)
        return response.data
    }
}

export const apiClient = new ApiClient()
export default apiClient
