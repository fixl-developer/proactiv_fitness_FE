import { useState, useEffect } from 'react'
import { AuthService, LoginRequest, RegisterRequest, User } from '@/services/authService'

interface UseAuthReturn {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (credentials: LoginRequest) => Promise<boolean>
    register: (userData: RegisterRequest) => Promise<boolean>
    logout: () => Promise<void>
    refreshUser: () => Promise<void>
}

export const useAuth = (): UseAuthReturn => {
    const [user, setUser] = useState<User | null>(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    // Check authentication status on mount
    useEffect(() => {
        checkAuthStatus()
    }, [])

    const checkAuthStatus = async () => {
        try {
            if (AuthService.isAuthenticated()) {
                const currentUser = await AuthService.getCurrentUser()
                setUser(currentUser)
                setIsAuthenticated(true)
            }
        } catch (error) {
            console.error('Auth check failed:', error)
            // Clear invalid auth data
            await AuthService.logout()
            setUser(null)
            setIsAuthenticated(false)
        } finally {
            setIsLoading(false)
        }
    }

    const login = async (credentials: LoginRequest): Promise<boolean> => {
        try {
            setIsLoading(true)
            const response = await AuthService.login(credentials)

            if (response.success) {
                // Transform the response data to match User interface
                const userData: User = {
                    id: response.data.id,
                    name: response.data.name,
                    email: response.data.email,
                    role: response.data.role.name as 'PARENT' | 'COACH' | 'ADMIN' | 'MANAGER',
                    phone: response.data.phone,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
                setUser(userData)
                setIsAuthenticated(true)
                return true
            }

            return false
        } catch (error) {
            console.error('Login failed:', error)
            return false
        } finally {
            setIsLoading(false)
        }
    }

    const register = async (userData: RegisterRequest): Promise<boolean> => {
        try {
            setIsLoading(true)
            const response = await AuthService.register(userData)

            if (response.success) {
                // Transform the response data to match User interface
                const userInfo: User = {
                    id: response.data.id,
                    name: response.data.name,
                    email: response.data.email,
                    role: response.data.role.name as 'PARENT' | 'COACH' | 'ADMIN' | 'MANAGER',
                    phone: response.data.phone,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
                setUser(userInfo)
                setIsAuthenticated(true)
                return true
            }

            return false
        } catch (error) {
            console.error('Registration failed:', error)
            return false
        } finally {
            setIsLoading(false)
        }
    }

    const logout = async (): Promise<void> => {
        try {
            setIsLoading(true)
            await AuthService.logout()
        } catch (error) {
            console.error('Logout failed:', error)
        } finally {
            setUser(null)
            setIsAuthenticated(false)
            setIsLoading(false)
        }
    }

    const refreshUser = async (): Promise<void> => {
        try {
            if (AuthService.isAuthenticated()) {
                const currentUser = await AuthService.getCurrentUser()
                setUser(currentUser)
            }
        } catch (error) {
            console.error('Refresh user failed:', error)
            await logout()
        }
    }

    return {
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        refreshUser
    }
}