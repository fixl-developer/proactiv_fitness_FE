import { ReactNode } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FloatingBookNow } from '@/components/marketing/FloatingBookNow';
import { WhatsAppWidget } from '@/components/marketing/WhatsAppWidget';

export default function MarketingLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen">
            <Header />
            <main className="mt-16">{children}</main>
            <Footer />
            <FloatingBookNow />
            <WhatsAppWidget />
        </div>
    );
}
