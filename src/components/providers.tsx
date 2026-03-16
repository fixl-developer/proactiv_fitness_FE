'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import ConditionalFixedButton from '@/components/ui/ConditionalFixedButton';
import FloatingChatbot from '@/components/ui/FloatingChatbot';

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000, // 1 minute
                        refetchOnWindowFocus: false,
                    },
                },
            })
    );

    return (
        <AuthProvider>
            <QueryClientProvider client={queryClient}>
                {children}
                <Toaster theme="light" position="top-right" richColors closeButton />
                <ConditionalFixedButton />
                <FloatingChatbot />
            </QueryClientProvider>
        </AuthProvider>
    );
}
