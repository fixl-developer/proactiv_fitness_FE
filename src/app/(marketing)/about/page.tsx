'use client'

import { Award, Target, Heart, CheckCircle, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useCMSData } from '@/hooks/useCMSData';
import { CMSService, AboutContentData } from '@/services/cmsService';

const staticAbout: AboutContentData = {
    mission: 'To provide a safe, supportive, and fun environment where children can develop their physical abilities, build confidence, and create lasting friendships through quality gymnastics and fitness programs.',
    vision: 'To be the leading provider of youth fitness programs, inspiring the next generation to lead active, healthy lifestyles while achieving their personal best in a positive and encouraging atmosphere.',
    values: [
        {
            title: 'Safety First',
            description: 'We maintain the highest safety standards with certified coaches and state-of-the-art equipment.',
            icon: 'CheckCircle',
        },
        {
            title: 'Excellence',
            description: 'We strive for excellence in coaching, facilities, and customer service to deliver the best experience.',
            icon: 'Award',
        },
        {
            title: 'Community',
            description: 'We foster a supportive community where everyone feels welcome, valued, and encouraged.',
            icon: 'Heart',
        },
    ],
    stats: [
        { label: 'Years Experience', value: '10+', icon: '📅' },
        { label: 'Active Students', value: '5000+', icon: '👥' },
        { label: 'Locations', value: '15+', icon: '📍' },
        { label: 'Expert Coaches', value: '50+', icon: '🏅' },
    ],
    images: [],
    history: 'ProActiv Fitness was founded in 2014 with a simple mission: to provide high-quality gymnastics and fitness programs that help children build confidence, develop skills, and have fun.\n\nWhat started as a single location with a handful of students has grown into a thriving network of 15+ centers serving over 5,000 active students across the region. Our success is built on our commitment to excellence, safety, and creating a positive environment where every child can thrive.\n\nToday, we\'re proud to be recognized as one of the leading youth fitness providers, with a team of 50+ certified coaches who are passionate about making a difference in children\'s lives. We continue to innovate and expand our programs to meet the evolving needs of our community.',
    features: [],
};

const valueStyleMap: Record<string, { color: string; bgColor: string; iconBg: string; borderColor: string }> = {
    'Safety First': { color: 'blue', bgColor: 'from-blue-50 to-blue-100', iconBg: 'from-blue-500 to-blue-600', borderColor: 'border-blue-200' },
    'Excellence': { color: 'green', bgColor: 'from-green-50 to-green-100', iconBg: 'from-green-500 to-green-600', borderColor: 'border-green-200' },
    'Community': { color: 'purple', bgColor: 'from-purple-50 to-purple-100', iconBg: 'from-purple-500 to-purple-600', borderColor: 'border-purple-200' },
};

const defaultValueStyle = { color: 'blue', bgColor: 'from-blue-50 to-blue-100', iconBg: 'from-blue-500 to-blue-600', borderColor: 'border-blue-200' };

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    CheckCircle,
    Award,
    Heart,
    Target,
    Lightbulb,
};

const colorCycle = [
    { color: 'blue', bgColor: 'from-blue-50 to-blue-100', iconBg: 'from-blue-500 to-blue-600', borderColor: 'border-blue-200' },
    { color: 'green', bgColor: 'from-green-50 to-green-100', iconBg: 'from-green-500 to-green-600', borderColor: 'border-green-200' },
    { color: 'purple', bgColor: 'from-purple-50 to-purple-100', iconBg: 'from-purple-500 to-purple-600', borderColor: 'border-purple-200' },
];

const historyGradients = [
    'from-blue-50 to-purple-50 border-blue-200',
    'from-purple-50 to-pink-50 border-purple-200',
    'from-pink-50 to-blue-50 border-pink-200',
];

export default function AboutPage() {
    const { data: about } = useCMSData<AboutContentData | null>(
        () => CMSService.getAbout(),
        staticAbout,
        []
    );

    const aboutData = about || staticAbout;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: "easeOut" },
        },
    };

    const historyParagraphs = aboutData.history.split('\n').filter(p => p.trim() !== '');

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-16 overflow-hidden">
                {/* Animated Background Elements */}
                <motion.div
                    className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 8, repeat: Infinity }}
                />
                <motion.div
                    className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 10, repeat: Infinity }}
                />

                <div className="container mx-auto px-4 text-center relative z-10 max-w-3xl">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-3xl md:text-4xl font-black mb-3 leading-tight"
                    >
                        About ProActiv Fitness
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="text-sm md:text-base leading-relaxed opacity-95"
                    >
                        Building confidence through movement since 2014. We're passionate
                        about helping children develop physically, mentally, and socially.
                    </motion.p>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-16 px-4">
                <div className="container mx-auto max-w-4xl">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        {/* Mission */}
                        <motion.div
                            variants={itemVariants}
                            whileHover={{ y: -4, transition: { duration: 0.3 } }}
                            className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-200"
                        >
                            <motion.div
                                className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4 shadow-lg"
                                whileHover={{ scale: 1.1, rotate: 10 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <Target className="w-8 h-8 text-white" />
                            </motion.div>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                Our Mission
                            </h2>
                            <p className="text-gray-700 leading-relaxed text-sm">
                                {aboutData.mission}
                            </p>
                        </motion.div>

                        {/* Vision */}
                        <motion.div
                            variants={itemVariants}
                            whileHover={{ y: -4, transition: { duration: 0.3 } }}
                            className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-200"
                        >
                            <motion.div
                                className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-lg"
                                whileHover={{ scale: 1.1, rotate: -10 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <Lightbulb className="w-8 h-8 text-white" />
                            </motion.div>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                Our Vision
                            </h2>
                            <p className="text-gray-700 leading-relaxed text-sm">
                                {aboutData.vision}
                            </p>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Values */}
            <section className="py-16 px-4 bg-white">
                <div className="container mx-auto max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                            Our Core Values
                        </h2>
                        <p className="text-sm md:text-base text-gray-600">
                            These principles guide everything we do
                        </p>
                    </motion.div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                        {aboutData.values.map((value, index) => {
                            const style = valueStyleMap[value.title] || colorCycle[index % colorCycle.length] || defaultValueStyle;
                            const Icon = iconMap[value.icon] || CheckCircle;
                            return (
                                <motion.div
                                    key={index}
                                    variants={itemVariants}
                                    whileHover={{ y: -4, scale: 1.02 }}
                                    className={`bg-gradient-to-br ${style.bgColor} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 ${style.borderColor} text-center group`}
                                >
                                    <motion.div
                                        className={`w-16 h-16 bg-gradient-to-br ${style.iconBg} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}
                                        whileHover={{ scale: 1.15, rotate: 360 }}
                                        transition={{ duration: 0.6 }}
                                    >
                                        <Icon className="w-8 h-8 text-white" />
                                    </motion.div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                                        {value.title}
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed text-sm">
                                        {value.description}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            </section>

            {/* Our Story */}
            <section className="py-16 px-4">
                <div className="container mx-auto max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-center mb-10"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                            Our Story
                        </h2>
                    </motion.div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="space-y-4"
                    >
                        {historyParagraphs.map((paragraph, index) => (
                            <motion.p
                                key={index}
                                variants={itemVariants}
                                className={`text-sm md:text-base text-gray-700 leading-relaxed bg-gradient-to-r ${historyGradients[index % historyGradients.length]} p-6 rounded-xl border`}
                            >
                                {paragraph}
                            </motion.p>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-16 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
                {/* Animated Background */}
                <motion.div
                    className="absolute inset-0 opacity-10"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                    <div className="absolute top-0 right-0 w-72 h-72 bg-white rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-72 h-72 bg-white rounded-full blur-3xl"></div>
                </motion.div>

                <div className="container mx-auto px-4 relative z-10 max-w-4xl">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
                    >
                        {aboutData.stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                whileHover={{ scale: 1.1, y: -4 }}
                                className="group"
                            >
                                <motion.div
                                    className="text-3xl md:text-4xl font-bold mb-2 group-hover:scale-110 transition-transform"
                                    animate={{ y: [0, -5, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                                >
                                    {stat.value}
                                </motion.div>
                                <div className="text-xs md:text-sm font-semibold opacity-90">
                                    {stat.label}
                                </div>
                                <div className="text-2xl mt-1">{stat.icon}</div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 px-4">
                <div className="container mx-auto text-center max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Join Our Community
                        </h2>
                        <p className="text-sm md:text-base text-gray-600 mb-8 leading-relaxed">
                            Experience the ProActiv difference. Book a free trial class today!
                        </p>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Link id="marketing-about-nav-book-trial"
                                href="/book-trial"
                                className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full text-sm md:text-base font-bold hover:shadow-xl transition-all shadow-lg"
                            >
                                Book A Free Trial
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
