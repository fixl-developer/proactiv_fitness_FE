'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { FiCalendar, FiUser, FiArrowRight, FiSearch, FiTag } from 'react-icons/fi'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { formatDateShort } from '@/utils/dateUtils'
import { getRandomImage } from '@/utils/imageUtils'

const BlogPage = () => {
    const [selectedCategory, setSelectedCategory] = useState('All Posts')
    const [searchQuery, setSearchQuery] = useState('')
    // Sample blog posts - replace with actual data from API
    const blogPosts = [
        {
            id: 1,
            title: 'The Benefits of Gymnastics for Child Development',
            excerpt: 'Discover how gymnastics training contributes to physical, mental, and social development in children of all ages.',
            content: 'Gymnastics is more than just physical exercise...',
            author: 'Sarah Johnson',
            date: '2024-12-15',
            category: 'Child Development',
            tags: ['development', 'benefits', 'children'],
            image: getRandomImage('child development'),
            fallback: '🧠',
            readTime: '5 min read',
            featured: true
        },
        {
            id: 2,
            title: 'Preparing for Your First Gymnastics Competition',
            excerpt: 'Essential tips and strategies to help young gymnasts prepare mentally and physically for their first competition.',
            content: 'Competition can be both exciting and nerve-wracking...',
            author: 'Michael Chen',
            date: '2024-12-10',
            category: 'Competition',
            tags: ['competition', 'preparation', 'tips'],
            image: getRandomImage('gymnastics competition'),
            fallback: '🏆',
            readTime: '7 min read',
            featured: false
        },
        {
            id: 3,
            title: 'Safety First: Injury Prevention in Gymnastics',
            excerpt: 'Learn about the most effective ways to prevent injuries and maintain safety during gymnastics training.',
            content: 'Safety is our top priority at ProActive Sports...',
            author: 'Emma Wilson',
            date: '2024-12-05',
            category: 'Safety',
            tags: ['safety', 'injury prevention', 'training'],
            image: getRandomImage('safety training'),
            fallback: '🛡️',
            readTime: '6 min read',
            featured: false
        },
        {
            id: 4,
            title: 'Building Confidence Through Gymnastics',
            excerpt: 'How gymnastics training helps children build self-confidence and overcome challenges in all areas of life.',
            content: 'Confidence is one of the greatest gifts gymnastics can give...',
            author: 'Lisa Wong',
            date: '2024-11-28',
            category: 'Personal Development',
            tags: ['confidence', 'personal growth', 'mindset'],
            image: getRandomImage('confidence building'),
            fallback: '💪',
            readTime: '4 min read',
            featured: false
        },
        {
            id: 5,
            title: 'Nutrition Tips for Young Athletes',
            excerpt: 'Essential nutrition guidelines to fuel your young gymnast for optimal performance and healthy growth.',
            content: 'Proper nutrition is crucial for young athletes...',
            author: 'David Lee',
            date: '2024-11-20',
            category: 'Nutrition',
            tags: ['nutrition', 'health', 'performance'],
            image: getRandomImage('healthy nutrition'),
            fallback: '🥗',
            readTime: '8 min read',
            featured: false
        },
        {
            id: 6,
            title: 'The Importance of Goal Setting in Gymnastics',
            excerpt: 'Learn how setting and achieving goals in gymnastics translates to success in other areas of life.',
            content: 'Goal setting is a fundamental skill that gymnastics teaches...',
            author: 'James Chen',
            date: '2024-11-15',
            category: 'Goal Setting',
            tags: ['goals', 'achievement', 'success'],
            image: getRandomImage('goal achievement'),
            fallback: '🎯',
            readTime: '5 min read',
            featured: false
        }
    ]

    const categories = [
        'All Posts',
        'Child Development',
        'Competition',
        'Safety',
        'Personal Development',
        'Nutrition',
        'Goal Setting',
        'Training Tips'
    ]

    const featuredPost = blogPosts.find(post => post.featured)

    // Filter posts based on selected category and search query
    const filteredPosts = blogPosts.filter(post => {
        const matchesCategory = selectedCategory === 'All Posts' || post.category === selectedCategory
        const matchesSearch = searchQuery === '' ||
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        return matchesCategory && matchesSearch && !post.featured
    })

    return (
        <>
            <Header />
            <main className="pt-0">
                {/* Hero Section */}
                <section className="relative bg-gradient-to-br from-primary-600 to-primary-800 text-white section-padding overflow-hidden">
                    {/* Background Image */}
                    <div className="absolute inset-0">
                        <Image
                            src={getRandomImage('blog writing')}
                            alt="Blog Hero Background"
                            fill
                            className="object-cover opacity-20"
                            onError={(e) => e.currentTarget.style.display = 'none'}
                        />
                    </div>

                    <div className="container-max relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="max-w-4xl mx-auto text-center"
                        >
                            <h1 className="text-4xl sm:text-5xl font-heading font-bold mb-6">
                                ProActive Sports Blog
                            </h1>
                            <p className="text-xl text-primary-100 mb-8 leading-relaxed">
                                Expert insights, training tips, and valuable resources for gymnasts,
                                parents, and coaches. Stay informed with the latest in gymnastics education.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Featured Post */}
                {featuredPost && (
                    <section className="section-padding bg-white">
                        <div className="container-max">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                viewport={{ once: true }}
                                className="mb-12"
                            >
                                <h2 className="text-2xl font-heading font-bold text-gray-900 mb-8 text-center">
                                    Featured Article
                                </h2>

                                <div className="card p-8 lg:p-12">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                                        <div>
                                            <div className="flex items-center space-x-4 mb-4">
                                                <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
                                                    {featuredPost.category}
                                                </span>
                                                <span className="text-sm text-gray-500">{featuredPost.readTime}</span>
                                            </div>

                                            <h3 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900 mb-4">
                                                {featuredPost.title}
                                            </h3>

                                            <p className="text-gray-600 mb-6 leading-relaxed">
                                                {featuredPost.excerpt}
                                            </p>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                    <div className="flex items-center space-x-2">
                                                        <FiUser className="w-4 h-4" />
                                                        <span>{featuredPost.author}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <FiCalendar className="w-4 h-4" />
                                                        <span>{formatDateShort(featuredPost.date)}</span>
                                                    </div>
                                                </div>

                                                <Link
                                                    href={`/blog/${featuredPost.id}`}
                                                    className="group inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-semibold transition-colors duration-200"
                                                >
                                                    <span>Read More</span>
                                                    <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                                                </Link>
                                            </div>
                                        </div>

                                        <div className="text-center">
                                            <div className="relative w-48 h-48 mx-auto bg-primary-100 rounded-2xl overflow-hidden">
                                                <Image
                                                    src={featuredPost.image}
                                                    alt={featuredPost.title}
                                                    fill
                                                    className="object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                        const parent = e.currentTarget.parentElement;
                                                        if (parent) {
                                                            parent.innerHTML = `
                                                            <div class="w-full h-full flex items-center justify-center text-8xl">
                                                                ${featuredPost.fallback}
                                                            </div>
                                                        `;
                                                        }
                                                    }}
                                                />
                                                {/* Fallback */}
                                                <div className="w-full h-full flex items-center justify-center text-8xl">
                                                    {featuredPost.fallback}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </section>
                )}

                {/* Blog Posts Grid */}
                <section className="section-padding bg-gray-50">
                    <div className="container-max">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                            {/* Sidebar */}
                            <div className="lg:col-span-1">
                                <motion.div
                                    initial={{ opacity: 0, x: -30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8 }}
                                    viewport={{ once: true }}
                                    className="space-y-6"
                                >
                                    {/* Search */}
                                    <div className="bg-white rounded-xl shadow-lg p-6">
                                        <h3 className="font-heading font-semibold text-lg text-gray-900 mb-4">
                                            Search Articles
                                        </h3>
                                        <div className="relative">
                                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type="text"
                                                placeholder="Search blog posts..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                                            />
                                        </div>
                                    </div>

                                    {/* Categories */}
                                    <div className="bg-white rounded-xl shadow-lg p-6">
                                        <h3 className="font-heading font-semibold text-lg text-gray-900 mb-4">
                                            Categories
                                        </h3>
                                        <div className="space-y-2">
                                            {categories.map((category) => (
                                                <button
                                                    key={category}
                                                    onClick={() => setSelectedCategory(category)}
                                                    className={`block w-full text-left px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${selectedCategory === category
                                                        ? 'bg-primary-600 text-white'
                                                        : 'text-gray-600 hover:bg-primary-50 hover:text-primary-600'
                                                        }`}
                                                >
                                                    {category}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Newsletter Signup */}
                                    <div className="bg-primary-600 text-white rounded-xl p-6">
                                        <h3 className="font-heading font-semibold text-lg mb-4">
                                            Stay Updated
                                        </h3>
                                        <p className="text-primary-100 text-sm mb-4">
                                            Subscribe to our newsletter for the latest articles and gymnastics tips.
                                        </p>
                                        <div className="space-y-3">
                                            <input
                                                type="email"
                                                placeholder="Your email address"
                                                className="w-full px-4 py-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-300"
                                            />
                                            <button className="w-full bg-secondary-500 hover:bg-secondary-600 text-white py-2 rounded-lg font-medium transition-colors duration-300">
                                                Subscribe
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Posts Grid */}
                            <div className="lg:col-span-3">
                                <motion.div
                                    initial={{ opacity: 0, x: 30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8 }}
                                    viewport={{ once: true }}
                                >
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="text-2xl font-heading font-bold text-gray-900">
                                            {selectedCategory === 'All Posts' ? 'Latest Articles' : selectedCategory}
                                        </h2>
                                        <span className="text-sm text-gray-500">
                                            {filteredPosts.length} {filteredPosts.length === 1 ? 'article' : 'articles'}
                                        </span>
                                    </div>

                                    {filteredPosts.length === 0 ? (
                                        <div className="text-center py-12">
                                            <div className="text-6xl mb-4">📝</div>
                                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No articles found</h3>
                                            <p className="text-gray-600 mb-6">
                                                {searchQuery
                                                    ? `No articles match your search "${searchQuery}"`
                                                    : `No articles in ${selectedCategory} category yet`
                                                }
                                            </p>
                                            <button
                                                onClick={() => {
                                                    setSelectedCategory('All Posts')
                                                    setSearchQuery('')
                                                }}
                                                className="btn-primary"
                                            >
                                                View All Articles
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                {filteredPosts.map((post, index) => (
                                                    <motion.article
                                                        key={post.id}
                                                        initial={{ opacity: 0, y: 30 }}
                                                        whileInView={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: index * 0.1, duration: 0.6 }}
                                                        viewport={{ once: true }}
                                                        className="card p-6 hover:shadow-2xl transition-all duration-500"
                                                    >
                                                        <div className="text-center mb-4">
                                                            <div className="relative w-20 h-20 mx-auto bg-primary-100 rounded-xl overflow-hidden mb-4">
                                                                <Image
                                                                    src={post.image}
                                                                    alt={post.title}
                                                                    fill
                                                                    className="object-cover"
                                                                    onError={(e) => {
                                                                        e.currentTarget.style.display = 'none';
                                                                        const parent = e.currentTarget.parentElement;
                                                                        if (parent) {
                                                                            parent.innerHTML = `
                                                                            <div class="w-full h-full flex items-center justify-center text-4xl">
                                                                                ${post.fallback}
                                                                            </div>
                                                                        `;
                                                                        }
                                                                    }}
                                                                />
                                                                {/* Fallback */}
                                                                <div className="w-full h-full flex items-center justify-center text-4xl">
                                                                    {post.fallback}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center justify-center space-x-2 mb-2">
                                                                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                                                                    {post.category}
                                                                </span>
                                                                <span className="text-xs text-gray-500">{post.readTime}</span>
                                                            </div>
                                                        </div>

                                                        <h3 className="text-lg font-heading font-semibold text-gray-900 mb-3 line-clamp-2">
                                                            {post.title}
                                                        </h3>

                                                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                                            {post.excerpt}
                                                        </p>

                                                        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                                                            <div className="flex items-center space-x-2">
                                                                <FiUser className="w-3 h-3" />
                                                                <span>{post.author}</span>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <FiCalendar className="w-3 h-3" />
                                                                <span>{formatDateShort(post.date)}</span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center space-x-1">
                                                                <FiTag className="w-3 h-3 text-gray-400" />
                                                                <div className="flex space-x-1">
                                                                    {post.tags.slice(0, 2).map((tag) => (
                                                                        <span key={tag} className="text-xs text-gray-500">
                                                                            #{tag}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            <Link
                                                                href={`/blog/${post.id}`}
                                                                className="group inline-flex items-center space-x-1 text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors duration-200"
                                                            >
                                                                <span>Read</span>
                                                                <FiArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-200" />
                                                            </Link>
                                                        </div>
                                                    </motion.article>
                                                ))}
                                            </div>

                                            {/* Load More */}
                                            <motion.div
                                                initial={{ opacity: 0, y: 30 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.8 }}
                                                viewport={{ once: true }}
                                                className="text-center mt-12"
                                            >
                                                <button className="btn-outline">
                                                    Load More Articles
                                                </button>
                                            </motion.div>
                                        </>
                                    )}
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="section-padding bg-gradient-to-r from-primary-600 to-secondary-500 text-white">
                    <div className="container-max text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl font-heading font-bold mb-4">
                                Ready to Start Your Gymnastics Journey?
                            </h2>
                            <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
                                Put these insights into practice! Book a free trial class and experience
                                our expert coaching and supportive environment firsthand.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                                <Link href="/book-trial" className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors duration-300">
                                    Book Free Trial
                                </Link>
                                <Link href="/contact" className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 rounded-lg font-semibold transition-all duration-300">
                                    Contact Us
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    )
}

export default BlogPage;
