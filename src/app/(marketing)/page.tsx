import { HeroCarousel } from '@/components/marketing/HeroCarousel';
import { ServicesSection } from '@/components/marketing/ServicesSection';
import { StatsSection } from '@/components/marketing/StatsSection';
import { TestimonialsSection } from '@/components/marketing/TestimonialsSection';
import { CTASection } from '@/components/marketing/CTASection';

export const metadata = {
    title: 'ProActiv Fitness - Building Confidence Through Movement',
    description:
        'Professional gymnastics and fitness programs for all ages. Expert coaching, state-of-the-art facilities, and a supportive community.',
    keywords:
        'gymnastics, fitness, kids programs, sports training, gymnastics classes, birthday parties, holiday camps',
};

export default function HomePage() {
    return (
        <>
            {/* Hero Carousel */}
            <HeroCarousel />

            {/* Services Section */}
            <ServicesSection />

            {/* Stats Section */}
            <StatsSection />

            {/* Testimonials */}
            <TestimonialsSection />

            {/* CTA Section */}
            <CTASection />
        </>
    );
}
