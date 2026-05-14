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
                router.push('/login');
                return;
            }

            // Redirect based on user role. Mirrors the 9 active roles.
            switch (user.role) {
                case 'ADMIN':
                    router.push('/admin/dashboard');
                    break;
                case 'REGIONAL_ADMIN':
                    router.push('/admin/regional/dashboard');
                    break;
                case 'FRANCHISE_OWNER':
                    router.push('/admin/franchise/dashboard');
                    break;
                case 'LOCATION_MANAGER':
                    router.push('/admin/location/dashboard');
                    break;
                case 'COACH':
                    router.push('/coach/dashboard');
                    break;
                case 'SUPPORT_STAFF':
                    router.push('/staff/dashboard');
                    break;
                case 'PARTNER_ADMIN':
                    router.push('/partner/dashboard');
                    break;
                case 'PARENT':
                    router.push('/parent/dashboard');
                    break;
                case 'USER':
                case 'STUDENT': // legacy alias
                    router.push('/user/dashboard');
                    break;
                default:
                    router.push('/unauthorized');
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
