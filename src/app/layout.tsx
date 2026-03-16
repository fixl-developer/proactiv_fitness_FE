import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import LayoutWrapper from '@/components/layout/LayoutWrapper'
import ConditionalFixedButton from '@/components/ui/ConditionalFixedButton'
import AIChatbot from '@/components/ai/AIChatbot'

export const metadata: Metadata = {
    title: 'ProActive Sports - Gymnastics Training & Camps',
    description: 'Professional gymnastics training, holiday camps, and birthday parties in Hong Kong. Expert coaching for all levels.',
    keywords: 'gymnastics, sports training, holiday camps, birthday parties, Hong Kong, Cyberport, Wan Chai',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
            </head>
            <body>
                <AuthProvider>
                    <LayoutWrapper>
                        {children}
                    </LayoutWrapper>
                    <ConditionalFixedButton />
                    <AIChatbot />
                </AuthProvider>
            </body>
        </html>
    )
}