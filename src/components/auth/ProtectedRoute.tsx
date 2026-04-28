'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRoles?: string[];
    requiredPermissions?: string[];
}

export function ProtectedRoute({
    children,
    requiredRoles,
    requiredPermissions,
}: ProtectedRouteProps) {
    const router = useRouter();
    const { isAuthenticated, user, isLoading } = useAuthStore() as any;

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
            return;
        }

        if (user && requiredRoles && requiredRoles.length > 0) {
            if (!requiredRoles.includes(user.role)) {
                router.push('/unauthorized');
                return;
            }
        }

        if (user && requiredPermissions && requiredPermissions.length > 0) {
            const hasPermission = requiredPermissions.every((permission) =>
                user.permissions.includes(permission)
            );

            if (!hasPermission) {
                router.push('/unauthorized');
                return;
            }
        }
    }, [isAuthenticated, user, isLoading, requiredRoles, requiredPermissions, router]);

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (!isAuthenticated) {
        return null;
    }

    if (requiredRoles && requiredRoles.length > 0 && user) {
        if (!requiredRoles.includes(user.role)) {
            return null;
        }
    }

    if (requiredPermissions && requiredPermissions.length > 0 && user) {
        const hasPermission = requiredPermissions.every((permission) =>
            user.permissions.includes(permission)
        );

        if (!hasPermission) {
            return null;
        }
    }

    return <>{children}</>;
}
