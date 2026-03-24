'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { FiCalendar, FiClock, FiUsers, FiMapPin, FiStar, FiTarget, FiAward, FiTrendingUp } from 'react-icons/fi'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { getRandomImage } from '@/utils/imageUtils'

const ShenzhenCompetitivePage = () => {
  const programFeatures = [
    {
      icon: FiTarget,
      title: 'Elite Training',
      description: 'Advanced coaching techniques used by international competitive programs'
    },
    {
      icon: FiAward,
      title: 'Competition Prep',
      description: 'Comprehensive preparation for regional and national competitions'
    },
    {
      icon: FiTrendingUp,
      title: 'Skill Development',
      description: 'Progressive skill building from intermediate to elite level'
    },
    {
      icon: FiUsers,
      title: 'Expert Coaches',
      description: 'Former competitive gymnasts and certified international coaches'
    }
  ]

  const trainingAreas = [
    {
      apparatus: 'Floor Exercise',
      skills: ['Advanced tumbling passes', 'Complex choreography', 'Artistic expression', 'Competition routines'],
      level: 'Intermediate to Elite'
    },
    {
      apparatus: 'Vault',
      skills: ['Yurchenko entries', 'Tsukahara vaults', 'Power development', 'Landing technique'],
      level: 'Intermediate to Elite'
    },
    {
      apparatus: 'Uneven Bars',
      skills: ['Release moves', 'Connection skills', 'Dismount variations', 'Routine construction'],
      level: 'Intermediate to Elite'
    },
    {
      apparatus: 'Balance Beam',
      skills: ['Acrobatic series', 'Dance elements', 'Mental preparation', 'Confidence building'],
      level: 'Intermediate to Elite'
    }
  ]

  const upcomingPrograms = [
    {
      id: 1,
      name: 'Winter Intensive Training',
      dates: 'Dec 26-30, 2024',
      duration: '5 days',
      time: '9:00 AM - 5:00 PM',
      location: 'Shenzhen Training Center',
      price: 'HK$4,500',
      level: 'Competitive Level 6+',
      spotsLeft: 4,
      highlights: ['Individual coaching', 'Video analysis', 'Competition simulation']
    },
    {
      id: 2,
      name: 'Spring Competition Prep',
      dates: 'Mar 24-28, 2025',
      duration: '5 days',
      time: '8:00 AM - 6:00 PM',
      location: 'Shenzhen Training Center',
      price: 'HK$5,200',
      level: 'Competitive Level 7+',
      spotsLeft: 3,
      highlights: ['Mock competitions', 'Mental training', 'Routine perfection']
    },
    {
      id: 3,
      name: 'Summer Elite Camp',
      dates: 'Jul 14-25, 2025',
      duration: '12 days',
      time: '8:00 AM - 6:00 PM',
      location: 'Shenzhen Training Center',
      price: 'HK$12,000',
      level: 'Elite Level 8+',
      spotsLeft: 2,
      highlights: ['Elite coaching', 'International standards', 'Scholarship opportunities']
    }
  ]

  const requirements = [
    'Minimum Level 6 competitive experience',
    'Current training minimum 12 hours per week',
    'Coach recommendation required',
    'Medical clearance certificate',
    'Valid passport for Shenzhen travel',
    'Commitment to full program duration'
  ]

  const dailySchedule = [
    { time: '8:00 AM', activity: 'Arrival & Dynamic Warm-up' },
    { time: '8:30 AM', activity: 'Conditioning & Strength Training' },
    { time: '9:30 AM', activity: 'Apparatus Training - Session 1' },
    { time: '11:00 AM', activity: 'Break & Hydration' },
    { time: '11:30 AM', activity: 'Apparatus Training - Session 2' },
    { time: '1:00 PM', activity: 'Lunch Break' },
    { time: '2:00 PM', activity: 'Mental Training & Video Analysis' },
    { time: '3:00 PM', activity: 'Apparatus Training - Session 3' },
    { time: '4:30 PM', activity: 'Flexibility & Recovery' },
    { time: '5:30 PM', activity: 'Cool Down & Reflection' },
    { time: '6:00 PM', activity: 'Departure' }
  ]

  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-red-600 to-red-800 text-white section-padding overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src={getRandomImage('gymnastics competition')}
              alt="Shenzhen Competitive Training Background"
              fill
              className="object-cover opacity-30"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                // Show fallback gradient if image fails
                const parent = e.currentTarget.parentElement
                if (parent) {
                  parent.style.background = 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)'
                }
              }}
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
                Shenzhen Competitive Training
              </h1>
              <p className="text-xl text-red-100 mb-8 leading-relaxed">
                Elite gymnastics training program in Shenzhen for serious competitive gymnasts.
                Experience world-class facilities, international coaching standards, and intensive skill development.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Link id="programs" href="#programs" className="btn-secondary">
                  View Programs
                </Link>
                <Link id="contact" href="/contact" className="btn-outline border-white text-white hover:bg-white hover:text-red-600">
                  Apply Now
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Program Features */}
        <section className="section-padding bg-white">
          <div className="container-max">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 mb-4">
                Elite Training Experience
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our Shenzhen competitive program offers unparalleled training opportunities
                with world-class facilities and internationally recognized coaching methods.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {programFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                  className="text-center group"
                >
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-red-600 transition-colors duration-300">
                    <feature.icon className="w-8 h-8 text-red-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="font-heading font-semibold text-lg text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Training Areas */}
        <section className="section-padding bg-gray-50">
          <div className="container-max">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 mb-4">
                Apparatus Training Focus
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Comprehensive training across all four apparatus with emphasis on
                advanced skills, routine development, and competition preparation.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {trainingAreas.map((area, index) => (
                <motion.div
                  key={area.apparatus}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                  className="card p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-heading font-bold text-gray-900">
                      {area.apparatus}
                    </h3>
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                      {area.level}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {area.skills.map((skill) => (
                      <div key={skill} className="flex items-start space-x-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>{skill}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Requirements */}
        <section className="section-padding bg-white">
          <div className="container-max">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl font-heading font-bold text-gray-900 mb-6">
                  Program Requirements
                </h2>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Our competitive program is designed for serious gymnasts who are committed
                  to excellence. Please ensure you meet all requirements before applying.
                </p>

                <div className="space-y-4">
                  {requirements.map((requirement, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.4 }}
                      viewport={{ once: true }}
                      className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                      </div>
                      <span className="text-gray-700 text-sm">{requirement}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="bg-red-50 rounded-2xl p-8"
              >
                <h3 className="text-xl font-heading font-bold text-gray-900 mb-6">
                  Application Process
                </h3>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-red-600 font-bold text-sm">1</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Submit Application</div>
                      <div className="text-sm text-gray-600">Complete online application with gymnastics history</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-red-600 font-bold text-sm">2</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Skills Assessment</div>
                      <div className="text-sm text-gray-600">Video submission or in-person evaluation</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-red-600 font-bold text-sm">3</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Coach Interview</div>
                      <div className="text-sm text-gray-600">Discussion with program director</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-red-600 font-bold text-sm">4</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Acceptance</div>
                      <div className="text-sm text-gray-600">Notification and program placement</div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-red-200">
                  <Link id="contact" href="/contact" className="btn-primary w-full text-center block">
                    Start Application
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Upcoming Programs */}
        <section id="programs" className="section-padding bg-gray-50">
          <div className="container-max">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 mb-4">
                Upcoming Training Programs
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Intensive training programs designed for competitive gymnasts seeking
                to elevate their skills to the next level.
              </p>
            </motion.div>

            <div className="space-y-8">
              {upcomingPrograms.map((program, index) => (
                <motion.div
                  key={program.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                  className="card p-8 hover:shadow-2xl transition-all duration-500"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-heading font-bold text-gray-900">
                          {program.name}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${program.spotsLeft <= 3
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                          }`}>
                          {program.spotsLeft} spots left
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <FiCalendar className="w-4 h-4 text-red-600" />
                          <span>{program.dates}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FiClock className="w-4 h-4 text-red-600" />
                          <span>{program.time}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FiMapPin className="w-4 h-4 text-red-600" />
                          <span>{program.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FiUsers className="w-4 h-4 text-red-600" />
                          <span>{program.level}</span>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Program Highlights:</h4>
                        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {program.highlights.map((highlight) => (
                            <li key={highlight} className="flex items-center space-x-2 text-sm text-gray-600">
                              <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                              <span>{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between">
                      <div className="text-center mb-6">
                        <div className="text-3xl font-bold text-red-600 mb-2">
                          {program.price}
                        </div>
                        <div className="text-sm text-gray-500">
                          {program.duration}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Link id="camps-shenzhen-competitive-nav-apply-now"
                          href={`/camps/book?program=${program.id}`}
                          className="w-full btn-primary text-center block"
                        >
                          Apply Now
                        </Link>
                        <Link id="camps-shenzhen-competitive-nav-contact"
                          href="/contact"
                          className="w-full btn-outline text-center block"
                        >
                          Get Info
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Daily Schedule */}
        <section className="section-padding bg-white">
          <div className="container-max">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl font-heading font-bold text-gray-900 mb-6">
                  Intensive Training Schedule
                </h2>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Our daily schedule is designed to maximize training effectiveness while
                  ensuring proper rest and recovery. Each session is carefully planned
                  to build upon previous learning and prepare for competition success.
                </p>

                <div className="space-y-3">
                  {dailySchedule.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      viewport={{ once: true }}
                      className="flex items-center space-x-4 p-2 bg-gray-50 rounded-lg"
                    >
                      <div className="w-20 text-xs font-medium text-red-600">
                        {item.time}
                      </div>
                      <div className="text-sm text-gray-700">
                        {item.activity}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <div className="aspect-[4/5] bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="text-6xl mb-4">🏆</div>
                      <p className="text-lg font-medium">Elite Training</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section-padding bg-gradient-to-r from-red-600 to-red-700 text-white">
          <div className="container-max text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-heading font-bold mb-4">
                Take Your Gymnastics to the Elite Level
              </h2>
              <p className="text-red-100 mb-8 max-w-2xl mx-auto">
                Join our exclusive Shenzhen competitive program and train alongside
                the best gymnasts in the region. Limited spots available for serious athletes only.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Link id="contact" href="/contact" className="bg-white text-red-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors duration-300">
                  Apply Today
                </Link>
                <Link id="book-assessment" href="/book-assessment" className="border-2 border-white text-white hover:bg-white hover:text-red-600 px-8 py-3 rounded-lg font-semibold transition-all duration-300">
                  Schedule Assessment
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

export default ShenzhenCompetitivePage
