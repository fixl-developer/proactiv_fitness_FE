'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Phone, Clock, Mail, Navigation, AlertCircle } from 'lucide-react'
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
    capacity?: number
    facilities?: string[]
    operatingHours?: any
}

const formatHourRow = (key: string, label: string, operatingHours: any): { day: string; time: string } | null => {
    if (!operatingHours) return null
    const entry = operatingHours[key]
    if (!entry) return null
    const open = entry.open ?? entry.openTime
    const close = entry.close ?? entry.closeTime
    const closed = entry.closed ?? entry.isOpen === false
    if (closed || !open || !close) return { day: label, time: 'Closed' }
    return { day: label, time: `${open} - ${close}` }
}

export default function LocationDetailPage() {
    const params = useParams<{ slug: string }>()
    const slug = String(params?.slug || '')
    const [location, setLocation] = useState<PublicLocation | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false
        LocationService.getPublic()
            .then((items: any[]) => {
                if (cancelled) return
                const match = (items || []).find((l: any) => String(l.slug || '').toLowerCase() === slug.toLowerCase())
                if (!match) {
                    setError('We could not find that location. It may have been removed or renamed.')
                } else {
                    setLocation(match as PublicLocation)
                }
            })
            .catch((err) => {
                if (cancelled) return
                console.error('Failed to load location detail', err)
                setError('Unable to load this location right now. Please try again shortly.')
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })
        return () => { cancelled = true }
    }, [slug])

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p className="mt-4 text-gray-600">Loading location...</p>
                </div>
            </div>
        )
    }

    if (error || !location) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="max-w-md text-center bg-white rounded-2xl shadow p-8">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Location Not Found</h1>
                    <p className="text-gray-600 mb-6">{error || 'We could not find that location.'}</p>
                    <Link href="/locations" className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                        View All Locations
                    </Link>
                </div>
            </div>
        )
    }

    const fullAddress = [location.address, location.city, location.state, location.postalCode, location.country]
        .filter(Boolean)
        .join(', ')
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress || location.name)}`

    const hourRows = [
        formatHourRow('monday', 'Monday', location.operatingHours),
        formatHourRow('tuesday', 'Tuesday', location.operatingHours),
        formatHourRow('wednesday', 'Wednesday', location.operatingHours),
        formatHourRow('thursday', 'Thursday', location.operatingHours),
        formatHourRow('friday', 'Friday', location.operatingHours),
        formatHourRow('saturday', 'Saturday', location.operatingHours),
        formatHourRow('sunday', 'Sunday', location.operatingHours),
    ].filter(Boolean) as Array<{ day: string; time: string }>

    return (
        <div className="min-h-screen bg-gray-50">
            <section className="bg-gradient-to-r from-primary to-secondary text-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-4">{location.name}</h1>
                    <p className="text-xl max-w-3xl mx-auto opacity-90">
                        {[location.city, location.country].filter(Boolean).join(', ')}
                    </p>
                </div>
            </section>

            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-2xl shadow p-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <MapPin className="w-6 h-6 text-primary" />
                                    Address
                                </h2>
                                <p className="text-gray-700">{fullAddress}</p>
                                <a
                                    href={mapUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-4 inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90"
                                >
                                    <Navigation className="w-4 h-4" />
                                    Get Directions
                                </a>
                            </div>

                            {hourRows.length > 0 && (
                                <div className="bg-white rounded-2xl shadow p-6">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Clock className="w-6 h-6 text-primary" />
                                        Opening Hours
                                    </h2>
                                    <div className="divide-y divide-gray-100">
                                        {hourRows.map(row => (
                                            <div key={row.day} className="flex justify-between py-2 text-gray-700">
                                                <span className="font-medium">{row.day}</span>
                                                <span>{row.time}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {Array.isArray(location.facilities) && location.facilities.length > 0 && (
                                <div className="bg-white rounded-2xl shadow p-6">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Facilities</h2>
                                    <div className="flex flex-wrap gap-2">
                                        {location.facilities.map((f, i) => (
                                            <span key={i} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                                                {f}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl shadow p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Contact</h2>
                                {location.phone && (
                                    <a href={`tel:${location.phone}`} className="flex items-center gap-3 mb-3 text-gray-700 hover:text-primary">
                                        <Phone className="w-5 h-5 text-primary" />
                                        {location.phone}
                                    </a>
                                )}
                                {location.email && (
                                    <a href={`mailto:${location.email}`} className="flex items-center gap-3 text-gray-700 hover:text-primary">
                                        <Mail className="w-5 h-5 text-primary" />
                                        {location.email}
                                    </a>
                                )}
                                {!location.phone && !location.email && (
                                    <p className="text-gray-500 text-sm">Contact details coming soon.</p>
                                )}
                            </div>

                            <Link href="/book-trial" className="block w-full text-center bg-primary text-white px-6 py-4 rounded-2xl font-bold shadow hover:bg-primary/90 transition">
                                Book a Free Trial
                            </Link>
                            <Link href="/locations" className="block w-full text-center bg-white text-gray-900 border border-gray-200 px-6 py-4 rounded-2xl font-medium hover:bg-gray-50 transition">
                                View All Locations
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
