import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export function useAuth() {
    const router = useRouter();
    const { user, isAuthenticated, setAuth, clearAuth } = useAuthStore();

    const login = useCallback(
        (userData: any, accessToken: string, refreshToken: string) => {
            setAuth(userData, accessToken, refreshToken);
            router.push('/dashboard');
        },
        [setAuth, router]
    );

    const logout = useCallback(() => {
        clearAuth();
        router.push('/login');
    }, [clearAuth, router]);

    const hasRole = useCallback(
        (role: string) => {
            return user?.role === role;
        },
        [user]
    );

    const hasPermission = useCallback(
        (permission: string) => {
            return user?.permissions?.includes(permission) || false;
        },
        [user]
    );

    return {
        user,
        isAuthenticated,
        login,
        logout,
        hasRole,
        hasPermission,
    };
}
