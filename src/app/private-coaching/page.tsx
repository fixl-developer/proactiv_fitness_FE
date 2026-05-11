'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { FiUser, FiTarget, FiAward, FiCalendar, FiCheck, FiStar } from 'react-icons/fi'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import PageHero from '@/components/sections/PageHero'

const features = [
    {
        icon: FiUser,
        title: '1-on-1 Coaching',
        description: 'Dedicated coach focused entirely on your child\'s progress and goals',
    },
    {
        icon: FiTarget,
        title: 'Personalised Plan',
        description: 'Training plan tailored to your child\'s age, ability, and aspirations',
    },
    {
        icon: FiCalendar,
        title: 'Flexible Schedule',
        description: 'Pick days and times that suit your family — sessions at our gyms or your venue',
    },
    {
        icon: FiAward,
        title: 'Faster Progress',
        description: 'Targeted feedback every session means measurable skill gains in weeks, not months',
    },
]

const programs = [
    {
        name: 'Foundation Coaching',
        ages: '4–8 years',
        sessions: '4 sessions / month',
        price: 'From HK$ 1,800',
        bullets: [
            'Build coordination, balance, and confidence',
            'Introduction to apparatus (beam, bars, floor)',
            'Progress report every 4 sessions',
            'Parent observation welcome',
        ],
    },
    {
        name: 'Skill Accelerator',
        ages: '9–14 years',
        sessions: '6 sessions / month',
        price: 'From HK$ 2,800',
        popular: true,
        bullets: [
            'Master intermediate-to-advanced gymnastics elements',
            'Video analysis & form correction',
            'Strength + flexibility conditioning',
            'Competition prep available on request',
        ],
    },
    {
        name: 'Competitive Performance',
        ages: '12+ years',
        sessions: '8 sessions / month',
        price: 'From HK$ 4,200',
        bullets: [
            'Elite training with national-team coaches',
            'Routine choreography for competitions',
            'Mental performance coaching',
            'Recovery & nutrition guidance',
        ],
    },
]

export default function PrivateCoachingPage() {
    return (
        <>
            <Header />
            <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
                <PageHero
                    title="Private Coaching Programs"
                    subtitle="One-on-one gymnastics coaching with our certified coaches. Tailored sessions for every age and ability — faster progress, more confidence, more fun."
                    backgroundImage=""
                    fallbackGradient="from-blue-600 to-indigo-700"
                    height="medium"
                />

                {/* Why private coaching */}
                <section className="py-16 px-4">
                    <div className="container-max">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 mb-3">Why Private Coaching?</h2>
                            <p className="text-gray-600 max-w-2xl mx-auto">
                                When your child is ready to level up — whether for a competition, a school tryout, or just for personal challenge —
                                private coaching gives them undivided attention from a qualified coach.
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {features.map((f, i) => (
                                <motion.div
                                    key={f.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1, duration: 0.5 }}
                                    viewport={{ once: true }}
                                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center"
                                >
                                    <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <f.icon className="w-7 h-7" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                                    <p className="text-sm text-gray-600">{f.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Programs */}
                <section className="py-16 bg-white">
                    <div className="container-max px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 mb-3">Choose Your Program</h2>
                            <p className="text-gray-600">Flexible packages — pay-per-session also available.</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            {programs.map((p, i) => (
                                <motion.div
                                    key={p.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1, duration: 0.5 }}
                                    viewport={{ once: true }}
                                    className={`relative rounded-2xl border-2 p-6 ${p.popular ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-xl' : 'border-gray-200 bg-white shadow-md'}`}
                                >
                                    {p.popular && (
                                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                            <FiStar className="w-3 h-3" /> Most Popular
                                        </span>
                                    )}
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">{p.name}</h3>
                                    <p className="text-sm text-gray-500 mb-3">{p.ages} • {p.sessions}</p>
                                    <p className="text-2xl font-bold text-blue-600 mb-5">{p.price}</p>
                                    <ul className="space-y-2 mb-6">
                                        {p.bullets.map((b) => (
                                            <li key={b} className="flex items-start gap-2 text-sm text-gray-700">
                                                <FiCheck className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                                <span>{b}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <Link
                                        id={`private-coaching-${p.name.toLowerCase().replace(/\s+/g, '-')}-book`}
                                        href={`/book-assessment?program=private-coaching&plan=${encodeURIComponent(p.name)}`}
                                        className={`block text-center px-4 py-3 rounded-lg font-semibold transition-colors ${p.popular ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
                                    >
                                        Book a Consultation
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How it works */}
                <section className="py-16 bg-gray-50">
                    <div className="container-max px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 mb-3">How It Works</h2>
                        </div>
                        <div className="grid md:grid-cols-4 gap-6">
                            {[
                                { step: 1, title: 'Free Consultation', desc: 'A 30-minute call to understand goals and assess current ability.' },
                                { step: 2, title: 'Custom Plan', desc: 'Your coach designs a session-by-session plan tailored to your child.' },
                                { step: 3, title: 'Coaching Sessions', desc: 'At our gym or your venue — your schedule, your pace.' },
                                { step: 4, title: 'Progress Reviews', desc: 'Quarterly reviews with measurable progress against the plan.' },
                            ].map((s) => (
                                <div key={s.step} className="text-center">
                                    <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                                        {s.step}
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-1">{s.title}</h3>
                                    <p className="text-sm text-gray-600">{s.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                    <div className="container-max px-4 text-center">
                        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
                        <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
                            Book a free 30-minute consultation with one of our head coaches — no obligation.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link
                                id="private-coaching-cta-book"
                                href="/book-assessment?program=private-coaching"
                                className="inline-block bg-white text-blue-700 hover:bg-gray-100 px-8 py-3 rounded-full font-bold shadow-lg"
                            >
                                Book Free Consultation
                            </Link>
                            <Link
                                id="private-coaching-cta-contact"
                                href="/contact"
                                className="inline-block border-2 border-white text-white hover:bg-white hover:text-blue-700 px-8 py-3 rounded-full font-bold transition-colors"
                            >
                                Ask a Question
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    )
}
