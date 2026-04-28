'use client'

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react'
import { authService } from '@/services/modules/auth.service'
import { tokenManager } from '@/services/auth/tokenManager'
import { rbacManager, UserRole } from '@/services/auth/rbac'
import { auditLogger } from '@/services/audit/auditLogger'
import { eventBus } from '@/services/eventBus/eventBus'
import { useAuthStore } from '@/store/authStore'

export interface User {
    id: string
    email: string
    name: string
    role: string | { id: string; name: string }
}

export interface AuthContextType {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null
    role: UserRole | null
    login: (email: string, password: string) => Promise<void>
    logout: () => Promise<void>
    softLogout: () => void
    register: (email: string, password: string, name: string) => Promise<void>
    clearError: () => void
    refreshToken: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [role, setRole] = useState<UserRole | null>(null)

    // Initialize auth state on mount
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const storedUser = authService.getStoredUser()
                const token = authService.getStoredToken()

                if (storedUser && token && tokenManager.isTokenValid(token)) {
                    // Check if session is stale (no activity for 24 hours)
                    const lastActivity = localStorage.getItem('lastActivity')
                    const SESSION_TIMEOUT = 24 * 60 * 60 * 1000 // 24 hours
                    if (lastActivity && (Date.now() - parseInt(lastActivity)) > SESSION_TIMEOUT) {
                        // Session expired due to inactivity
                        tokenManager.clearTokens()
                        localStorage.removeItem('user')
                        localStorage.removeItem('lastActivity')
                        localStorage.removeItem('auth-storage')
                        setIsLoading(false)
                        return
                    }

                    // Update last activity
                    localStorage.setItem('lastActivity', Date.now().toString())

                    // Normalize role to string in case old session has object
                    const rawRole = storedUser.role
                    const roleName = typeof rawRole === 'object' ? (rawRole as any)?.name : rawRole as string
                    const normalizedUser = { ...storedUser, role: roleName, name: (storedUser as any).name || (storedUser as any).fullName || '' }
                    setUser(normalizedUser)
                    rbacManager.setRole(roleName)
                    setRole(roleName as UserRole)
                } else {
                    // Clear invalid tokens
                    tokenManager.clearTokens()
                    localStorage.removeItem('user')
                    localStorage.removeItem('lastActivity')
                }
            } catch (err) {
                console.error('Auth initialization error:', err)
            } finally {
                setIsLoading(false)
            }
        }

        initializeAuth()
    }, [])

    const login = async (email: string, password: string) => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await authService.login({ email, password })

            if (response.success) {
                const userData = response.data.user
                const roleName = typeof userData.role === 'object' ? userData.role.name : userData.role as string
                setUser(userData)
                rbacManager.setRole(roleName)
                setRole(roleName as UserRole)

                // Sync with authStore so ProtectedRoute works
                useAuthStore.getState().setAuth(
                    {
                        userId: userData.id,
                        email: userData.email,
                        firstName: (userData as any).firstName || userData.name,
                        lastName: (userData as any).lastName || '',
                        role: roleName,
                        permissions: (userData as any).permissions || [],
                    },
                    response.data.tokens.accessToken,
                    response.data.tokens.refreshToken
                )

                // Log login event
                await auditLogger.logLogin(email, true)

                // Track session activity
                localStorage.setItem('lastActivity', Date.now().toString())

                // Publish login event
                eventBus.publishUserLogin(userData.id, userData.email)
            } else {
                const errorMsg = response.message || 'Login failed'
                setError(errorMsg)
                await auditLogger.logLogin(email, false, errorMsg)
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message || 'Login failed'
            setError(errorMsg)
            await auditLogger.logLogin(email, false, errorMsg)
        } finally {
            setIsLoading(false)
        }
    }

    const logout = async () => {
        setIsLoading(true)

        try {
            if (user) {
                await auditLogger.logLogout(user.id)
                eventBus.publishUserLogout(user.id)
            }

            await authService.logout()
            setUser(null)
            setRole(null)
            rbacManager.setRole('')
            tokenManager.clearTokens()
            useAuthStore.getState().clearAuth()
            localStorage.removeItem('savedSession')
            localStorage.removeItem('lastActivity')
            localStorage.removeItem('auth-storage')
        } catch (err) {
            console.error('Logout error:', err)
        } finally {
            setIsLoading(false)
        }
    }

    // Soft logout - keeps session saved for 15 minutes
    const softLogout = () => {
        const savedUser = localStorage.getItem('user')
        const savedToken = localStorage.getItem('token')
        const savedRefreshToken = localStorage.getItem('refreshToken')
        if (savedUser && savedToken) {
            localStorage.setItem('savedSession', JSON.stringify({
                user: savedUser,
                token: savedToken,
                refreshToken: savedRefreshToken,
                savedAt: Date.now()
            }))
        }
        // Clear active auth state but keep savedSession
        setUser(null)
        setRole(null)
        rbacManager.setRole('')
        tokenManager.clearTokens()
        useAuthStore.getState().clearAuth()
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
    }

    const register = async (email: string, password: string, name: string) => {
        setIsLoading(true)
        setError(null)

        try {
            // Split name into firstName/lastName for backend
            const parts = name.trim().split(' ')
            const firstName = parts[0] || name
            const lastName = parts.slice(1).join(' ') || parts[0]
            const response = await authService.register({ email, password, confirmPassword: password, firstName, lastName })

            if (response.success) {
                await auditLogger.logRegistration(email, true)
                // Don't auto-login after registration, let user login manually
            } else {
                const errorMsg = response.message || 'Registration failed'
                setError(errorMsg)
                await auditLogger.logRegistration(email, false, errorMsg)
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message || 'Registration failed'
            setError(errorMsg)
            await auditLogger.logRegistration(email, false, errorMsg)
        } finally {
            setIsLoading(false)
        }
    }

    const refreshToken = async () => {
        try {
            const refreshTokenValue = authService.getStoredRefreshToken()
            if (refreshTokenValue) {
                await authService.refreshToken(refreshTokenValue)
            }
        } catch (err) {
            console.error('Token refresh error:', err)
            await logout()
        }
    }

    const clearError = () => {
        setError(null)
    }

    // Memoize so consumers (e.g. admin layout) don't re-render on every parent
    // render. Without this, the value object is rebuilt every render and every
    // useAuth() consumer re-renders, cascading down through the dashboard tree
    // — which in dev mode can interact badly with HMR and trigger repeated
    // page re-fetches.
    const value: AuthContextType = useMemo(() => {
        const hasStoredSession = typeof window !== 'undefined' && !!localStorage.getItem('token') && !!localStorage.getItem('user')
        return {
            user,
            isAuthenticated: isLoading ? hasStoredSession : (!!user && tokenManager.isAuthenticated()),
            isLoading,
            error,
            role,
            login,
            logout,
            softLogout,
            register,
            clearError,
            refreshToken,
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, isLoading, error, role])

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export default AuthContext
