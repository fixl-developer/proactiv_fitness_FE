import { ReactNode } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { WhatsAppWidget } from '@/components/marketing/WhatsAppWidget';
import ConditionalFixedButton from '@/components/ui/ConditionalFixedButton';

export default function MarketingLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen">
            <Header />
            <main className="mt-16">{children}</main>
            <Footer />
            <WhatsAppWidget />
            <ConditionalFixedButton />
        </div>
    );
}
