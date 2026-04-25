'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { FiChevronDown, FiHelpCircle, FiSearch, FiArrowRight } from 'react-icons/fi'
import { useCMSData } from '@/hooks/useCMSData'
import { CMSService, FAQItemData } from '@/services/cmsService'

const fallbackFaqs: FAQItemData[] = [
    { id: '1', question: 'What ages do you accept for gymnastics classes?', answer: 'We welcome students from age 2 (Tots) all the way to teenagers and adults. Each class is grouped by age and skill level so coaching stays age-appropriate.', category: 'General' },
    { id: '2', question: 'Do I need any prior experience to join?', answer: 'No prior experience is required. Beginner classes are designed to introduce fundamentals, and our coaches assess each new student to place them at the right level.', category: 'General' },
    { id: '3', question: 'How do I book a free trial class?', answer: 'You can book a free trial directly from the "Book Free Trial" button on the homepage. Pick your preferred location, time slot, and your child\'s age.', category: 'Bookings' },
    { id: '4', question: 'What is your cancellation policy?', answer: 'You can reschedule or cancel a class up to 24 hours before the session at no charge. Cancellations within 24 hours may forfeit the session credit.', category: 'Bookings' },
    { id: '5', question: 'Where are your locations?', answer: 'We currently operate at Cyberport and Wan Chai in Hong Kong. Each location has dedicated training equipment and certified coaches.', category: 'Locations' },
    { id: '6', question: 'What should my child wear?', answer: 'Comfortable athletic clothing — leotards, t-shirts and shorts, or leggings — and bare feet. No jewellery, please.', category: 'General' },
]

export default function FAQsPage() {
    const [openId, setOpenId] = useState<string | null>(null)
    const [search, setSearch] = useState('')
    const [activeCategory, setActiveCategory] = useState<string>('All')

    const { data: faqs, isLoading } = useCMSData<FAQItemData[]>(
        () => CMSService.getFAQs(),
        fallbackFaqs,
        []
    )

    const categories = useMemo(() => {
        const set = new Set<string>()
        faqs.forEach(f => { if (f.category) set.add(f.category) })
        return ['All', ...Array.from(set)]
    }, [faqs])

    const filteredFaqs = useMemo(() => {
        const q = search.trim().toLowerCase()
        return faqs.filter(f => {
            const matchesCategory = activeCategory === 'All' || f.category === activeCategory
            if (!matchesCategory) return false
            if (!q) return true
            return f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)
        })
    }, [faqs, search, activeCategory])

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 pt-24 pb-16">
            {/* Hero */}
            <section className="container-max px-4 mb-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-3xl mx-auto text-center"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
                        <FiHelpCircle className="w-4 h-4" />
                        Frequently Asked Questions
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                        How can we help?
                    </h1>
                    <p className="text-lg text-gray-600 leading-relaxed">
                        Find quick answers to the most common questions about classes, bookings, locations, and more.
                    </p>
                </motion.div>
            </section>

            <section className="container-max px-4">
                <div className="max-w-3xl mx-auto">
                    {/* Search */}
                    <div className="relative mb-6">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            id="faqs-search-input"
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search questions..."
                            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>

                    {/* Category pills */}
                    {categories.length > 1 && (
                        <div className="flex flex-wrap gap-2 mb-8">
                            {categories.map(cat => (
                                <button
                                    id={`faq-cat-${cat.toLowerCase().replace(/\s+/g, '-')}-btn`}
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* FAQ list */}
                    {isLoading ? (
                        <div className="text-center py-16 text-gray-500">Loading questions...</div>
                    ) : filteredFaqs.length === 0 ? (
                        <div className="text-center py-16 text-gray-500">
                            <FiHelpCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p className="font-medium">No questions match your search</p>
                            <p className="text-sm mt-1">Try a different keyword or category.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredFaqs.map((faq) => {
                                const isOpen = openId === faq.id
                                return (
                                    <motion.div
                                        key={faq.id}
                                        layout
                                        className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                                    >
                                        <button
                                            id={`faq-toggle-${faq.id}-btn`}
                                            type="button"
                                            onClick={() => setOpenId(isOpen ? null : faq.id)}
                                            className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                                        >
                                            <span className="font-semibold text-gray-900 text-base sm:text-lg">
                                                {faq.question}
                                            </span>
                                            <motion.span
                                                animate={{ rotate: isOpen ? 180 : 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"
                                            >
                                                <FiChevronDown className="w-4 h-4" />
                                            </motion.span>
                                        </button>
                                        <AnimatePresence initial={false}>
                                            {isOpen && (
                                                <motion.div
                                                    key="content"
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.25 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="px-5 pb-5 -mt-1 text-gray-600 leading-relaxed whitespace-pre-line">
                                                        {faq.answer}
                                                        {faq.category && (
                                                            <div className="mt-3 inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                                                {faq.category}
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                )
                            })}
                        </div>
                    )}

                    {/* Bottom CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white"
                    >
                        <h3 className="text-2xl font-bold mb-2">Still have questions?</h3>
                        <p className="text-white/90 mb-6">
                            Our team is happy to help. Reach out and we'll get back to you within one business day.
                        </p>
                        <Link
                            id="faqs-contact-link"
                            href="/contact"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                        >
                            Contact Us <FiArrowRight className="w-4 h-4" />
                        </Link>
                    </motion.div>
                </div>
            </section>
        </div>
    )
}
