'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { AuthService, User as AuthUser, RegisterRequest } from '@/services/authService'

interface User extends AuthUser {
    children?: Array<{
        id: string
        name: string
        age: number
    }>
}

interface AuthContextType {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (email: string, password: string) => Promise<boolean>
    signup: (userData: any) => Promise<boolean>
    logout: () => void
    checkAuth: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

interface AuthProviderProps {
    children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    // Check authentication status on app load
    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        try {
            // Check if tokens exist
            const isAuth = AuthService.isAuthenticated()

            if (isAuth) {
                // Try to get current user from backend
                try {
                    const userData = await AuthService.getCurrentUser()
                    setUser({
                        ...userData,
                        // Add children for PARENT role (will be fetched from CRM module later)
                        children: userData.role === 'PARENT' ? [] : undefined
                    })
                    setIsAuthenticated(true)
                } catch (error) {
                    // Token might be expired, try to get from localStorage
                    const storedUser = AuthService.getStoredUser()
                    if (storedUser) {
                        setUser({
                            ...storedUser,
                            children: storedUser.role === 'PARENT' ? [] : undefined
                        })
                        setIsAuthenticated(true)
                    } else {
                        // Clear auth data if user fetch fails
                        await AuthService.logout()
                        setUser(null)
                        setIsAuthenticated(false)
                    }
                }
            } else {
                setUser(null)
                setIsAuthenticated(false)
            }
        } catch (error) {
            console.error('Auth check failed:', error)
            setUser(null)
            setIsAuthenticated(false)
        } finally {
            setIsLoading(false)
        }
    }

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            setIsLoading(true)

            // Use backend API
            const authData = await AuthService.login({ email, password })

            if (authData && authData.user) {
                const userData: User = {
                    ...authData.user,
                    // Add children for PARENT role (will be fetched from CRM module later)
                    children: authData.user.role === 'PARENT' ? [] : undefined
                }

                setUser(userData)
                setIsAuthenticated(true)

                // Redirect based on role
                const dashboardRoutes: Record<string, string> = {
                    PARENT: '/parent/dashboard',
                    COACH: '/coach/dashboard',
                    ADMIN: '/admin/dashboard',
                    MANAGER: '/manager/dashboard',
                    SUPER_ADMIN: '/admin/dashboard',
                    HQ_ADMIN: '/admin/dashboard',
                    REGIONAL_ADMIN: '/admin/dashboard',
                    FRANCHISE_OWNER: '/admin/dashboard',
                    LOCATION_MANAGER: '/manager/dashboard',
                    PARTNER_ADMIN: '/admin/dashboard',
                    SUPPORT_STAFF: '/admin/dashboard'
                }

                const redirectPath = dashboardRoutes[userData.role] || '/dashboard'
                router.push(redirectPath)
                return true
            }

            return false

        } catch (error: any) {
            console.error('Login failed:', error)

            // Show error to user
            alert(error.message || 'Login failed. Please check your credentials.')

            return false

        } finally {
            setIsLoading(false)
        }
    }

    const signup = async (userData: any): Promise<boolean> => {
        try {
            setIsLoading(true)

            // Prepare registration data
            const registerData: RegisterRequest = {
                email: userData.email,
                password: userData.password,
                confirmPassword: userData.password,
                firstName: userData.parentName?.split(' ')[0] || userData.firstName || 'User',
                lastName: userData.parentName?.split(' ').slice(1).join(' ') || userData.lastName || '',
                phone: userData.phone || '',
                role: 'PARENT',
                language: 'EN'
            }

            // Use backend API
            const authData = await AuthService.register(registerData)

            if (authData && authData.user) {
                const newUser: User = {
                    ...authData.user,
                    // Add child info if provided (will be saved to CRM module later)
                    children: userData.childName ? [{
                        id: Date.now().toString(),
                        name: userData.childName,
                        age: parseInt(userData.childAge) || 0
                    }] : []
                }

                setUser(newUser)
                setIsAuthenticated(true)

                router.push('/parent/dashboard')
                return true
            }

            return false

        } catch (error: any) {
            console.error('Signup failed:', error)

            // Show error to user
            alert(error.message || 'Registration failed. Please try again.')

            return false

        } finally {
            setIsLoading(false)
        }
    }

    const logout = async () => {
        try {
            // Call backend logout API
            await AuthService.logout()
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            // Clear state
            setUser(null)
            setIsAuthenticated(false)

            // Redirect to home page
            router.push('/')
        }
    }

    const value: AuthContextType = {
        user,
        isAuthenticated,
        isLoading,
        login,
        signup,
        logout,
        checkAuth
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}