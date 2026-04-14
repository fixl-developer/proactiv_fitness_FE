// Re-export unified API client
// All API calls should use @/services/api/client
import { apiClient } from '@/services/api/client'

// Re-export ApiResponse type for backward compatibility
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data: T;
    timestamp?: string;
    error?: any;
}

export { apiClient }
export default apiClient
