import { Award, Target, Heart, Users, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
    title: 'About Us - ProActiv Fitness',
    description:
        'Learn about ProActiv Fitness, our mission, values, and commitment to building confidence through movement.',
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-primary to-secondary text-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6">About Us</h1>
                    <p className="text-xl max-w-3xl mx-auto">
                        Building confidence through movement since 2014. We're passionate
                        about helping children develop physically, mentally, and socially.
                    </p>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Mission */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                                <Target className="w-8 h-8 text-primary" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                Our Mission
                            </h2>
                            <p className="text-gray-700 leading-relaxed">
                                To provide a safe, supportive, and fun environment where children
                                can develop their physical abilities, build confidence, and create
                                lasting friendships through quality gymnastics and fitness
                                programs.
                            </p>
                        </div>

                        {/* Vision */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                                <Award className="w-8 h-8 text-primary" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                Our Vision
                            </h2>
                            <p className="text-gray-700 leading-relaxed">
                                To be the leading provider of youth fitness programs, inspiring
                                the next generation to lead active, healthy lifestyles while
                                achieving their personal best in a positive and encouraging
                                atmosphere.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Our Core Values
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            These principles guide everything we do
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Safety */}
                        <div className="text-center">
                            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-10 h-10 text-blue-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Safety First</h3>
                            <p className="text-gray-600">
                                We maintain the highest safety standards with certified coaches
                                and state-of-the-art equipment.
                            </p>
                        </div>

                        {/* Excellence */}
                        <div className="text-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Award className="w-10 h-10 text-green-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                Excellence
                            </h3>
                            <p className="text-gray-600">
                                We strive for excellence in coaching, facilities, and customer
                                service to deliver the best experience.
                            </p>
                        </div>

                        {/* Community */}
                        <div className="text-center">
                            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Heart className="w-10 h-10 text-purple-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                Community
                            </h3>
                            <p className="text-gray-600">
                                We foster a supportive community where everyone feels welcome,
                                valued, and encouraged.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Story */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">
                            Our Story
                        </h2>
                        <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
                            <p>
                                ProActiv Fitness was founded in 2014 with a simple mission: to
                                provide high-quality gymnastics and fitness programs that help
                                children build confidence, develop skills, and have fun.
                            </p>
                            <p>
                                What started as a single location with a handful of students has
                                grown into a thriving network of 15+ centers serving over 5,000
                                active students across the region. Our success is built on our
                                commitment to excellence, safety, and creating a positive
                                environment where every child can thrive.
                            </p>
                            <p>
                                Today, we're proud to be recognized as one of the leading youth
                                fitness providers, with a team of 50+ certified coaches who are
                                passionate about making a difference in children's lives. We
                                continue to innovate and expand our programs to meet the evolving
                                needs of our community.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-16 bg-primary text-white">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <div className="text-5xl font-bold mb-2">10+</div>
                            <div className="text-lg">Years Experience</div>
                        </div>
                        <div>
                            <div className="text-5xl font-bold mb-2">5000+</div>
                            <div className="text-lg">Active Students</div>
                        </div>
                        <div>
                            <div className="text-5xl font-bold mb-2">15+</div>
                            <div className="text-lg">Locations</div>
                        </div>
                        <div>
                            <div className="text-5xl font-bold mb-2">50+</div>
                            <div className="text-lg">Expert Coaches</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold text-gray-900 mb-6">
                        Join Our Community
                    </h2>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Experience the ProActiv difference. Book a free trial class today!
                    </p>
                    <Link
                        href="/book-trial"
                        className="inline-block bg-primary text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-primary/90 transition-all transform hover:scale-105"
                    >
                        Book A Free Trial
                    </Link>
                </div>
            </section>
        </div>
    );
}
