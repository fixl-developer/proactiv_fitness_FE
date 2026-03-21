'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { FiCalendar, FiUser, FiArrowLeft, FiTag, FiClock } from 'react-icons/fi'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { formatDateShort } from '@/utils/dateUtils'
import { getRandomImage } from '@/utils/imageUtils'
import { useParams } from 'next/navigation'

const BlogDetailPage = () => {
    const params = useParams()
    const blogId = params.id

    // Sample blog posts data - same as blog page
    const blogPosts = [
        {
            id: 1,
            title: 'The Benefits of Gymnastics for Child Development',
            excerpt: 'Discover how gymnastics training contributes to physical, mental, and social development in children of all ages.',
            content: `
                <h2>Introduction</h2>
                <p>Gymnastics is more than just physical exercise—it's a comprehensive developmental tool that shapes children's bodies, minds, and character. At ProActive Sports, we've witnessed countless transformations as children progress through our programs.</p>

                <h2>Physical Development</h2>
                <p>Gymnastics training provides unparalleled physical benefits for growing children:</p>
                <ul>
                    <li><strong>Strength Building:</strong> Every movement in gymnastics engages multiple muscle groups, building functional strength that supports overall physical development.</li>
                    <li><strong>Flexibility:</strong> Regular stretching and conditioning improve range of motion and reduce injury risk in all physical activities.</li>
                    <li><strong>Coordination:</strong> Complex movements require precise body control, developing neural pathways that enhance coordination.</li>
                    <li><strong>Balance:</strong> From beam work to floor exercises, gymnastics constantly challenges and improves balance.</li>
                </ul>

                <h2>Mental Development</h2>
                <p>The cognitive benefits of gymnastics are equally impressive:</p>
                <ul>
                    <li><strong>Focus and Concentration:</strong> Learning new skills requires intense concentration, training the mind to focus on tasks.</li>
                    <li><strong>Problem-Solving:</strong> Figuring out how to execute movements develops critical thinking skills.</li>
                    <li><strong>Memory:</strong> Remembering routines and sequences enhances memory capacity.</li>
                    <li><strong>Spatial Awareness:</strong> Understanding body position in space translates to better spatial reasoning.</li>
                </ul>

                <h2>Social and Emotional Growth</h2>
                <p>Beyond physical and mental benefits, gymnastics nurtures important life skills:</p>
                <ul>
                    <li><strong>Confidence:</strong> Mastering new skills builds self-esteem and confidence.</li>
                    <li><strong>Discipline:</strong> Regular practice and following instructions develop self-discipline.</li>
                    <li><strong>Teamwork:</strong> Group activities and supporting classmates foster cooperation.</li>
                    <li><strong>Resilience:</strong> Learning to handle setbacks and keep trying builds mental toughness.</li>
                </ul>

                <h2>Long-Term Benefits</h2>
                <p>The skills learned in gymnastics extend far beyond the gym. Children develop:</p>
                <ul>
                    <li>A foundation for lifelong fitness and healthy habits</li>
                    <li>Transferable skills for other sports and activities</li>
                    <li>Confidence to tackle new challenges</li>
                    <li>Social skills that benefit all relationships</li>
                </ul>

                <h2>Conclusion</h2>
                <p>Gymnastics offers a unique combination of physical, mental, and social benefits that support holistic child development. At ProActive Sports, we're committed to providing a safe, supportive environment where every child can thrive and reach their full potential.</p>
            `,
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
            content: `
                <h2>Getting Ready for Competition Day</h2>
                <p>Your first gymnastics competition is an exciting milestone! Here's everything you need to know to prepare and perform your best.</p>

                <h2>Physical Preparation</h2>
                <ul>
                    <li><strong>Practice Your Routine:</strong> Run through your complete routine multiple times daily in the weeks leading up to competition.</li>
                    <li><strong>Build Stamina:</strong> Ensure you can perform your routine multiple times without fatigue.</li>
                    <li><strong>Perfect Your Skills:</strong> Focus on consistency and clean execution of each element.</li>
                    <li><strong>Rest Well:</strong> Get adequate sleep in the week before competition.</li>
                </ul>

                <h2>Mental Preparation</h2>
                <p>Mental readiness is just as important as physical preparation:</p>
                <ul>
                    <li><strong>Visualization:</strong> Mentally rehearse your routine, imagining perfect execution.</li>
                    <li><strong>Positive Self-Talk:</strong> Replace negative thoughts with encouraging affirmations.</li>
                    <li><strong>Breathing Exercises:</strong> Learn calming techniques to manage competition nerves.</li>
                    <li><strong>Focus on Process:</strong> Concentrate on performing well rather than winning.</li>
                </ul>

                <h2>What to Bring</h2>
                <ul>
                    <li>Competition leotard and warm-up suit</li>
                    <li>Grips and wrist supports (if used)</li>
                    <li>Water bottle and healthy snacks</li>
                    <li>Hair supplies and emergency kit</li>
                    <li>Music (if required for floor routine)</li>
                </ul>

                <h2>Competition Day Tips</h2>
                <ul>
                    <li>Arrive early to familiarize yourself with the venue</li>
                    <li>Warm up thoroughly but don't overdo it</li>
                    <li>Stay hydrated and eat light, nutritious meals</li>
                    <li>Support your teammates and stay positive</li>
                    <li>Remember to smile and enjoy the experience!</li>
                </ul>

                <h2>After the Competition</h2>
                <p>Regardless of results, every competition is a learning experience. Celebrate your achievements, identify areas for improvement, and use the experience to grow as a gymnast.</p>
            `,
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
            content: `
                <h2>Safety is Our Priority</h2>
                <p>At ProActive Sports, safety comes first. Here's how we maintain a safe training environment and what you can do to prevent injuries.</p>

                <h2>Proper Warm-Up</h2>
                <p>A thorough warm-up is essential:</p>
                <ul>
                    <li>5-10 minutes of cardiovascular activity</li>
                    <li>Dynamic stretching for all major muscle groups</li>
                    <li>Sport-specific movements to prepare for training</li>
                    <li>Gradual progression from simple to complex movements</li>
                </ul>

                <h2>Equipment Safety</h2>
                <ul>
                    <li>Regular inspection and maintenance of all equipment</li>
                    <li>Proper use of safety mats and spotting equipment</li>
                    <li>Age-appropriate equipment selection</li>
                    <li>Clean, well-maintained training environment</li>
                </ul>

                <h2>Proper Technique</h2>
                <p>Correct form prevents injuries:</p>
                <ul>
                    <li>Learn proper landing techniques</li>
                    <li>Master basics before advancing to complex skills</li>
                    <li>Listen to your coach's instructions</li>
                    <li>Never attempt skills without proper supervision</li>
                </ul>

                <h2>Listen to Your Body</h2>
                <ul>
                    <li>Report pain or discomfort immediately</li>
                    <li>Take rest days when needed</li>
                    <li>Stay hydrated during training</li>
                    <li>Maintain proper nutrition for recovery</li>
                </ul>

                <h2>Conclusion</h2>
                <p>By following these safety guidelines and working with qualified coaches, gymnasts can enjoy the sport while minimizing injury risk.</p>
            `,
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
            content: `
                <h2>The Confidence Connection</h2>
                <p>Gymnastics is one of the most effective activities for building self-confidence in children. Here's how it works.</p>

                <h2>Achievement and Mastery</h2>
                <p>Every new skill mastered builds confidence:</p>
                <ul>
                    <li>Setting and achieving goals</li>
                    <li>Overcoming fear of new challenges</li>
                    <li>Experiencing the reward of hard work</li>
                    <li>Building a track record of success</li>
                </ul>

                <h2>Body Awareness and Control</h2>
                <ul>
                    <li>Understanding physical capabilities</li>
                    <li>Developing strength and coordination</li>
                    <li>Improving posture and presence</li>
                    <li>Feeling capable and strong</li>
                </ul>

                <h2>Social Confidence</h2>
                <p>Group training builds social skills:</p>
                <ul>
                    <li>Making friends with similar interests</li>
                    <li>Learning to work in a team</li>
                    <li>Receiving positive feedback from coaches and peers</li>
                    <li>Developing communication skills</li>
                </ul>

                <h2>Resilience and Growth Mindset</h2>
                <ul>
                    <li>Learning that failure is part of learning</li>
                    <li>Developing persistence and determination</li>
                    <li>Building mental toughness</li>
                    <li>Embracing challenges as opportunities</li>
                </ul>

                <h2>Transferable Confidence</h2>
                <p>Confidence gained in gymnastics extends to other areas:</p>
                <ul>
                    <li>Academic performance</li>
                    <li>Social situations</li>
                    <li>Other sports and activities</li>
                    <li>Future career and life challenges</li>
                </ul>
            `,
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
            content: `
                <h2>Fueling Young Athletes</h2>
                <p>Proper nutrition is crucial for young gymnasts. Here's what you need to know about feeding your athlete.</p>

                <h2>Balanced Diet Basics</h2>
                <ul>
                    <li><strong>Carbohydrates:</strong> Primary energy source for training (whole grains, fruits, vegetables)</li>
                    <li><strong>Proteins:</strong> Essential for muscle repair and growth (lean meats, fish, eggs, legumes)</li>
                    <li><strong>Healthy Fats:</strong> Support hormone production and brain function (nuts, avocados, olive oil)</li>
                    <li><strong>Vitamins and Minerals:</strong> Support overall health and performance</li>
                </ul>

                <h2>Timing Matters</h2>
                <p>When you eat is as important as what you eat:</p>
                <ul>
                    <li><strong>Pre-Training:</strong> Light meal 2-3 hours before, or small snack 30-60 minutes before</li>
                    <li><strong>During Training:</strong> Water and possibly light snacks for long sessions</li>
                    <li><strong>Post-Training:</strong> Protein and carbs within 30-60 minutes for recovery</li>
                </ul>

                <h2>Hydration</h2>
                <ul>
                    <li>Drink water throughout the day, not just during training</li>
                    <li>Monitor urine color (should be light yellow)</li>
                    <li>Increase intake during hot weather or intense training</li>
                    <li>Avoid sugary drinks and excessive caffeine</li>
                </ul>

                <h2>Healthy Snack Ideas</h2>
                <ul>
                    <li>Fresh fruit with nut butter</li>
                    <li>Greek yogurt with berries</li>
                    <li>Whole grain crackers with cheese</li>
                    <li>Smoothies with protein powder</li>
                    <li>Trail mix with nuts and dried fruit</li>
                </ul>

                <h2>What to Avoid</h2>
                <ul>
                    <li>Processed foods high in sugar and unhealthy fats</li>
                    <li>Energy drinks and excessive caffeine</li>
                    <li>Skipping meals or severe calorie restriction</li>
                    <li>Eating too close to training time</li>
                </ul>
            `,
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
            content: `
                <h2>Goals Drive Success</h2>
                <p>Goal setting is a fundamental skill that gymnastics teaches effectively. Here's how to set and achieve meaningful goals.</p>

                <h2>Types of Goals</h2>
                <ul>
                    <li><strong>Outcome Goals:</strong> Final results (winning competition, achieving level)</li>
                    <li><strong>Performance Goals:</strong> Personal bests (score improvements, skill mastery)</li>
                    <li><strong>Process Goals:</strong> Daily actions (practice attendance, technique focus)</li>
                </ul>

                <h2>SMART Goal Framework</h2>
                <p>Effective goals are:</p>
                <ul>
                    <li><strong>Specific:</strong> Clearly defined and detailed</li>
                    <li><strong>Measurable:</strong> Progress can be tracked</li>
                    <li><strong>Achievable:</strong> Challenging but realistic</li>
                    <li><strong>Relevant:</strong> Aligned with overall objectives</li>
                    <li><strong>Time-bound:</strong> Has a deadline</li>
                </ul>

                <h2>Short-term vs Long-term Goals</h2>
                <ul>
                    <li><strong>Short-term:</strong> Weekly or monthly objectives that build toward larger goals</li>
                    <li><strong>Long-term:</strong> Season or year-long aspirations that provide direction</li>
                </ul>

                <h2>Tracking Progress</h2>
                <ul>
                    <li>Keep a training journal</li>
                    <li>Regular check-ins with coaches</li>
                    <li>Celebrate small victories</li>
                    <li>Adjust goals as needed</li>
                </ul>

                <h2>Life Skills</h2>
                <p>Goal-setting skills learned in gymnastics transfer to:</p>
                <ul>
                    <li>Academic achievement</li>
                    <li>Career development</li>
                    <li>Personal relationships</li>
                    <li>Financial planning</li>
                    <li>Health and fitness</li>
                </ul>
            `,
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

    // Find the current blog post
    const currentPost = blogPosts.find(post => post.id === parseInt(blogId as string))

    // Get related posts (same category, excluding current post)
    const relatedPosts = blogPosts
        .filter(post => post.category === currentPost?.category && post.id !== currentPost?.id)
        .slice(0, 3)

    if (!currentPost) {
        return (
            <>
                <Header />
                <main className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog Post Not Found</h1>
                        <Link data-testid="link-blog" href="/blog" className="btn-primary">
                            Back to Blog
                        </Link>
                    </div>
                </main>
                <Footer />
            </>
        )
    }

    return (
        <>
            <Header />
            <main className="pt-0">
                {/* Hero Section */}
                <section className="relative bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20 overflow-hidden">
                    <div className="absolute inset-0">
                        <Image
                            src={currentPost.image}
                            alt={currentPost.title}
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
                        >
                            <Link
                                href="/blog"
                                className="inline-flex items-center space-x-2 text-primary-100 hover:text-white mb-6 transition-colors"
                            >
                                <FiArrowLeft className="w-5 h-5" />
                                <span>Back to Blog</span>
                            </Link>

                            <div className="max-w-4xl">
                                <div className="flex items-center space-x-4 mb-4">
                                    <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
                                        {currentPost.category}
                                    </span>
                                    <div className="flex items-center space-x-2 text-primary-100">
                                        <FiClock className="w-4 h-4" />
                                        <span className="text-sm">{currentPost.readTime}</span>
                                    </div>
                                </div>

                                <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">
                                    {currentPost.title}
                                </h1>

                                <p className="text-xl text-primary-100 mb-6">
                                    {currentPost.excerpt}
                                </p>

                                <div className="flex items-center space-x-6 text-sm text-primary-100">
                                    <div className="flex items-center space-x-2">
                                        <FiUser className="w-4 h-4" />
                                        <span>{currentPost.author}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <FiCalendar className="w-4 h-4" />
                                        <span>{formatDateShort(currentPost.date)}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Article Content */}
                <section className="section-padding bg-white">
                    <div className="container-max">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                            {/* Main Content */}
                            <motion.article
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                className="lg:col-span-3"
                            >
                                <div
                                    className="prose prose-lg max-w-none
                                        prose-headings:font-heading prose-headings:font-bold prose-headings:text-gray-900
                                        prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
                                        prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-4
                                        prose-ul:my-4 prose-li:text-gray-600
                                        prose-strong:text-gray-900 prose-strong:font-semibold"
                                    dangerouslySetInnerHTML={{ __html: currentPost.content }}
                                />

                                {/* Tags */}
                                <div className="mt-12 pt-8 border-t border-gray-200">
                                    <div className="flex items-center space-x-2">
                                        <FiTag className="w-5 h-5 text-gray-400" />
                                        <div className="flex flex-wrap gap-2">
                                            {currentPost.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm"
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Author Info */}
                                <div className="mt-8 p-6 bg-gray-50 rounded-xl">
                                    <h3 className="font-heading font-semibold text-lg text-gray-900 mb-2">
                                        About the Author
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        <strong>{currentPost.author}</strong> is a professional gymnastics coach and writer at ProActive Sports.
                                        With years of experience in youth development and athletic training, they share insights to help
                                        young athletes reach their full potential.
                                    </p>
                                </div>
                            </motion.article>

                            {/* Sidebar */}
                            <motion.aside
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                                className="lg:col-span-1"
                            >
                                {/* Related Posts */}
                                {relatedPosts.length > 0 && (
                                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                                        <h3 className="font-heading font-semibold text-lg text-gray-900 mb-4">
                                            Related Articles
                                        </h3>
                                        <div className="space-y-4">
                                            {relatedPosts.map((post) => (
                                                <Link
                                                    key={post.id}
                                                    href={`/blog/${post.id}`}
                                                    className="block group"
                                                >
                                                    <div className="flex space-x-3">
                                                        <div className="relative w-16 h-16 flex-shrink-0 bg-primary-100 rounded-lg overflow-hidden">
                                                            <div className="w-full h-full flex items-center justify-center text-2xl">
                                                                {post.fallback}
                                                            </div>
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-1">
                                                                {post.title}
                                                            </h4>
                                                            <p className="text-xs text-gray-500">{post.readTime}</p>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* CTA Box */}
                                <div className="bg-primary-600 text-white rounded-xl p-6">
                                    <h3 className="font-heading font-semibold text-lg mb-3">
                                        Ready to Get Started?
                                    </h3>
                                    <p className="text-primary-100 text-sm mb-4">
                                        Book a free trial class and experience our expert coaching firsthand.
                                    </p>
                                    <Link
                                        href="/book-trial"
                                        className="block w-full bg-white text-primary-600 hover:bg-gray-100 text-center py-2 rounded-lg font-semibold transition-colors duration-300"
                                    >
                                        Book Free Trial
                                    </Link>
                                </div>
                            </motion.aside>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    )
}

export default BlogDetailPage
