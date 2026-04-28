'use client'

import { useEffect, useState } from 'react'
import { MapPin, Phone, Clock, Mail, Navigation, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { LocationService } from '@/services/businessConfigService'

interface PublicLocation {
    id: string
    name: string
    slug: string
    address: string
    city: string
    state?: string
    country: string
    postalCode?: string
    phone?: string
    email?: string
    operatingHours?: any
}

const formatHours = (operatingHours: any): { weekday: string; weekend: string } => {
    // Backend stores operatingHours as a Map (or plain object) keyed by weekday
    // with either { open, close, closed } (newer admin form) or { isOpen, openTime, closeTime } (older schema).
    if (!operatingHours || typeof operatingHours !== 'object') {
        return { weekday: 'Mon-Fri: 9:00 AM - 6:00 PM', weekend: 'Sat-Sun: By appointment' }
    }

    const pickDay = (key: string) => {
        const entry = operatingHours[key]
        if (!entry) return null
        const open = entry.open ?? entry.openTime
        const close = entry.close ?? entry.closeTime
        const closed = entry.closed ?? entry.isOpen === false
        if (closed || !open || !close) return null
        return `${open} - ${close}`
    }

    const weekday = pickDay('monday') || pickDay('tuesday') || pickDay('wednesday') || pickDay('thursday') || pickDay('friday')
    const weekend = pickDay('saturday') || pickDay('sunday')

    return {
        weekday: weekday ? `Mon-Fri: ${weekday}` : 'Mon-Fri: 9:00 AM - 6:00 PM',
        weekend: weekend ? `Sat-Sun: ${weekend}` : 'Sat-Sun: By appointment',
    }
}

export default function LocationsPage() {
    const [locations, setLocations] = useState<PublicLocation[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false
        LocationService.getPublic()
            .then((items: any[]) => {
                if (cancelled) return
                setLocations(items as PublicLocation[])
            })
            .catch((err) => {
                if (cancelled) return
                console.error('Failed to load public locations', err)
                setError('Unable to load locations right now. Please try again shortly.')
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })
        return () => { cancelled = true }
    }, [])

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-primary to-secondary text-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6">Our Locations</h1>
                    <p className="text-xl max-w-3xl mx-auto">
                        Find a ProActiv Fitness center near you. Each branch is equipped with
                        state-of-the-art facilities to help you train, play and grow.
                    </p>
                </div>
            </section>

            {/* Locations Grid */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                            <p className="mt-4 text-gray-600">Loading locations...</p>
                        </div>
                    ) : error ? (
                        <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                            <p className="text-red-700">{error}</p>
                        </div>
                    ) : locations.length === 0 ? (
                        <div className="max-w-md mx-auto text-center py-12">
                            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600">No active locations published yet. Please check back soon.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {locations.map((location) => {
                                const hours = formatHours(location.operatingHours)
                                const fullAddress = [location.address, location.city, location.state, location.postalCode, location.country]
                                    .filter(Boolean)
                                    .join(', ')
                                const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress || location.name)}`
                                return (
                                    <div
                                        id={location.slug}
                                        key={location.id}
                                        className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all"
                                    >
                                        <div className="bg-primary text-white p-6">
                                            <h2 className="text-2xl font-bold mb-2">{location.name}</h2>
                                            <div className="flex items-start gap-2">
                                                <MapPin className="w-5 h-5 mt-1 flex-shrink-0" />
                                                <div>
                                                    <p>{location.address}</p>
                                                    <p>
                                                        {[location.city, location.state, location.postalCode].filter(Boolean).join(', ')}
                                                    </p>
                                                    <p>{location.country}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-6 space-y-4">
                                            {location.phone && (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <Phone className="w-5 h-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-600">Phone</p>
                                                        <a
                                                            href={`tel:${location.phone}`}
                                                            className="text-gray-900 font-semibold hover:text-primary"
                                                        >
                                                            {location.phone}
                                                        </a>
                                                    </div>
                                                </div>
                                            )}

                                            {location.email && (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <Mail className="w-5 h-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-600">Email</p>
                                                        <a
                                                            href={`mailto:${location.email}`}
                                                            className="text-gray-900 font-semibold hover:text-primary"
                                                        >
                                                            {location.email}
                                                        </a>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <Clock className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600 mb-1">Hours</p>
                                                    <p className="text-gray-900">{hours.weekday}</p>
                                                    <p className="text-gray-900">{hours.weekend}</p>
                                                </div>
                                            </div>

                                            <div className="flex gap-3 pt-4">
                                                <a
                                                    href={mapUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <Navigation className="w-5 h-5" />
                                                    Get Directions
                                                </a>
                                                <Link
                                                    href="/book-trial"
                                                    className="flex-1 bg-gray-100 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-center"
                                                >
                                                    Book Trial
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-primary text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold mb-6">Ready to Visit Us?</h2>
                    <p className="text-xl mb-8 max-w-2xl mx-auto">
                        Book a free trial class at your nearest location today!
                    </p>
                    <Link
                        href="/book-trial"
                        className="inline-block bg-white text-primary px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-100 transition-all transform hover:scale-105"
                    >
                        Book A Free Trial
                    </Link>
                </div>
            </section>
        </div>
    )
}
