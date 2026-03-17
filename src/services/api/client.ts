import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios'

interface RetryConfig {
    maxRetries: number
    backoffMultiplier: number
    initialDelayMs: number
}

interface CircuitBreakerState {
    failures: number
    lastFailureTime: number
    state: 'CLOSED' | 'OPEN' | 'HALF_OPEN'
}

class ApiClient {
    private client: AxiosInstance
    private retryConfig: RetryConfig = {
        maxRetries: 3,
        backoffMultiplier: 2,
        initialDelayMs: 1000
    }
    private circuitBreakers: Map<string, CircuitBreakerState> = new Map()
    private requestTimeout = 30000 // 30 seconds

    constructor(baseURL: string = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api') {
        this.client = axios.create({
            baseURL,
            timeout: this.requestTimeout,
            headers: {
                'Content-Type': 'application/json'
            }
        })

        this.setupInterceptors()
    }

    private setupInterceptors() {
        // Request interceptor - add token
        this.client.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('token')
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`
                }

                // Log request
                console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`)

                return config
            },
            (error) => {
                console.error('[API] Request error:', error)
                return Promise.reject(error)
            }
        )

        // Response interceptor - handle token refresh
        this.client.interceptors.response.use(
            (response) => {
                console.log(`[API] Response ${response.status} from ${response.config.url}`)
                return response
            },
            async (error: AxiosError) => {
                const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

                // Handle 401 - token expired
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true

                    try {
                        const refreshToken = localStorage.getItem('refreshToken')
                        if (refreshToken) {
                            const response = await axios.post(
                                `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh-token`,
                                { refreshToken }
                            )

                            const { accessToken } = response.data
                            localStorage.setItem('token', accessToken)

                            // Retry original request
                            if (originalRequest.headers) {
                                originalRequest.headers.Authorization = `Bearer ${accessToken}`
                            }
                            return this.client(originalRequest)
                        }
                    } catch (refreshError) {
                        console.error('[API] Token refresh failed:', refreshError)
                        localStorage.removeItem('token')
                        localStorage.removeItem('refreshToken')
                        window.location.href = '/login'
                    }
                }

                // Suppress non-critical errors
                const status = error.response?.status
                const url = error.config?.url || ''

                // Suppress 404 errors (endpoint not available)
                if (status === 404) {
                    console.debug(`[API] Endpoint not found: ${url}`)
                }
                // Suppress 401 errors (handled by token refresh above)
                else if (status === 401) {
                    console.debug(`[API] Unauthorized - redirecting to login`)
                }
                // Suppress network errors during logout
                else if (!error.response && url.includes('/auth/logout')) {
                    console.debug(`[API] Logout completed (network error suppressed)`)
                }
                // Log other errors
                else if (status) {
                    console.error(`[API] Error ${status}:`, error.message)
                } else {
                    console.debug(`[API] Network error:`, error.message)
                }
                return Promise.reject(error)
            }
        )
    }

    private getCircuitBreakerKey(url: string): string {
        return url.split('?')[0] // Remove query params
    }

    private checkCircuitBreaker(url: string): boolean {
        const key = this.getCircuitBreakerKey(url)
        const breaker = this.circuitBreakers.get(key)

        if (!breaker) {
            this.circuitBreakers.set(key, {
                failures: 0,
                lastFailureTime: 0,
                state: 'CLOSED'
            })
            return true
        }

        // If open, check if we should try half-open
        if (breaker.state === 'OPEN') {
            const timeSinceLastFailure = Date.now() - breaker.lastFailureTime
            if (timeSinceLastFailure > 60000) { // 1 minute
                breaker.state = 'HALF_OPEN'
                return true
            }
            return false
        }

        return true
    }

    private recordSuccess(url: string) {
        const key = this.getCircuitBreakerKey(url)
        const breaker = this.circuitBreakers.get(key)
        if (breaker) {
            breaker.failures = 0
            breaker.state = 'CLOSED'
        }
    }

    private recordFailure(url: string) {
        const key = this.getCircuitBreakerKey(url)
        const breaker = this.circuitBreakers.get(key)
        if (breaker) {
            breaker.failures++
            breaker.lastFailureTime = Date.now()

            if (breaker.failures >= 5) {
                breaker.state = 'OPEN'
            }
        }
    }

    private async delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        if (!this.checkCircuitBreaker(url)) {
            throw new Error(`Circuit breaker OPEN for ${url}`)
        }

        let lastError: any

        for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
            try {
                const response = await this.client.get<T>(url, config)
                this.recordSuccess(url)
                return response.data
            } catch (error) {
                lastError = error
                this.recordFailure(url)

                if (attempt < this.retryConfig.maxRetries) {
                    const delayMs = this.retryConfig.initialDelayMs *
                        Math.pow(this.retryConfig.backoffMultiplier, attempt)
                    console.log(`[API] Retry attempt ${attempt + 1} after ${delayMs}ms`)
                    await this.delay(delayMs)
                }
            }
        }

        throw lastError
    }

    async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        if (!this.checkCircuitBreaker(url)) {
            throw new Error(`Circuit breaker OPEN for ${url}`)
        }

        let lastError: any

        for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
            try {
                const response = await this.client.post<T>(url, data, config)
                this.recordSuccess(url)
                return response.data
            } catch (error) {
                lastError = error
                this.recordFailure(url)

                if (attempt < this.retryConfig.maxRetries) {
                    const delayMs = this.retryConfig.initialDelayMs *
                        Math.pow(this.retryConfig.backoffMultiplier, attempt)
                    await this.delay(delayMs)
                }
            }
        }

        throw lastError
    }

    async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        if (!this.checkCircuitBreaker(url)) {
            throw new Error(`Circuit breaker OPEN for ${url}`)
        }

        const response = await this.client.put<T>(url, data, config)
        this.recordSuccess(url)
        return response.data
    }

    async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        if (!this.checkCircuitBreaker(url)) {
            throw new Error(`Circuit breaker OPEN for ${url}`)
        }

        const response = await this.client.delete<T>(url, config)
        this.recordSuccess(url)
        return response.data
    }

    async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        if (!this.checkCircuitBreaker(url)) {
            throw new Error(`Circuit breaker OPEN for ${url}`)
        }

        const response = await this.client.patch<T>(url, data, config)
        this.recordSuccess(url)
        return response.data
    }
}

export const apiClient = new ApiClient()
export default ApiClient
