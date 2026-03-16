'use client'

import Hero from '@/components/sections/Hero'
import About from '@/components/sections/About'
import Services from '@/components/sections/Services'
import ClientLogos from '@/components/sections/ClientLogos'
import TeamPreview from '@/components/sections/TeamPreview'
import Testimonials from '@/components/sections/Testimonials'
import AIChatbot from '@/components/ai/AIChatbot'

export default function HomePage() {
    return (
        <div className="w-full">
            <Hero />
            <About />
            <Services />
            <ClientLogos />
            <TeamPreview />
            <Testimonials />

            {/* AI Chatbot - Available on all pages */}
            <AIChatbot
                position="bottom-right"
                theme="light"
                initialMessage="Hi! I'm your AI assistant for Proactiv Fitness. I can help you find the perfect gymnastics program for your child, book trial classes, and answer any questions you have. How can I help you today?"
            />
        </div>
    )
}