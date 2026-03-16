'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function DashboardRedirect() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push('/auth/login');
                return;
            }

            // Redirect based on user role
            switch (user.role) {
                case 'ADMIN':
                    router.push('/admin/dashboard');
                    break;
                case 'MANAGER':
                    router.push('/manager/dashboard');
                    break;
                case 'COACH':
                    router.push('/coach/dashboard');
                    break;
                case 'PARENT':
                    router.push('/parent/dashboard');
                    break;
                default:
                    router.push('/auth/login');
            }
        }
    }, [user, isLoading, router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Redirecting to your dashboard...</p>
            </div>
        </div>
    );
}