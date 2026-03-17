import Header from '@/components/layout/Header';
import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Services from '@/components/sections/Services';
import ClientLogos from '@/components/sections/ClientLogos';
import TeamPreview from '@/components/sections/TeamPreview';
import Testimonials from '@/components/sections/Testimonials';
import Footer from '@/components/layout/Footer';
import SectionDivider from '@/components/ui/SectionDivider';

export default function Home() {
    return (
        <main className="min-h-screen w-full">
            <Header />
            <Hero />
            <SectionDivider title="Why Choose Us" icon="📚" color="from-blue-500 to-cyan-500" />
            <About />
            <SectionDivider title="What We Offer" icon="🎯" color="from-green-500 to-emerald-500" />
            <Services />
            <SectionDivider title="Trusted Partners" icon="🤝" color="from-orange-500 to-red-500" />
            <ClientLogos />
            <SectionDivider title="Expert Coaches" icon="👥" color="from-purple-500 to-pink-500" />
            <TeamPreview />
            <SectionDivider title="Success Stories" icon="💬" color="from-indigo-500 to-blue-500" />
            <Testimonials />
            <Footer />
        </main>
    );
}
