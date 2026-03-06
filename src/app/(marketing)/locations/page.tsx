import { MapPin, Phone, Clock, Mail, Navigation } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
    title: 'Our Locations - ProActiv Fitness',
    description: 'Find a ProActiv Fitness location near you. We have 15+ centers across the region.',
};

interface Location {
    id: number;
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
    email: string;
    hours: {
        weekday: string;
        weekend: string;
    };
    mapUrl: string;
}

const locations: Location[] = [
    {
        id: 1,
        name: 'Downtown Center',
        address: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        phone: '+1 (234) 567-8901',
        email: 'downtown@proactivfitness.com',
        hours: {
            weekday: 'Mon-Fri: 9:00 AM - 8:00 PM',
            weekend: 'Sat-Sun: 9:00 AM - 6:00 PM',
        },
        mapUrl: 'https://maps.google.com',
    },
    {
        id: 2,
        name: 'Westside Center',
        address: '456 West Avenue',
        city: 'New York',
        state: 'NY',
        zipCode: '10002',
        phone: '+1 (234) 567-8902',
        email: 'westside@proactivfitness.com',
        hours: {
            weekday: 'Mon-Fri: 9:00 AM - 8:00 PM',
            weekend: 'Sat-Sun: 9:00 AM - 6:00 PM',
        },
        mapUrl: 'https://maps.google.com',
    },
    {
        id: 3,
        name: 'Eastside Center',
        address: '789 East Boulevard',
        city: 'New York',
        state: 'NY',
        zipCode: '10003',
        phone: '+1 (234) 567-8903',
        email: 'eastside@proactivfitness.com',
        hours: {
            weekday: 'Mon-Fri: 9:00 AM - 8:00 PM',
            weekend: 'Sat-Sun: 9:00 AM - 6:00 PM',
        },
        mapUrl: 'https://maps.google.com',
    },
    {
        id: 4,
        name: 'Northside Center',
        address: '321 North Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10004',
        phone: '+1 (234) 567-8904',
        email: 'northside@proactivfitness.com',
        hours: {
            weekday: 'Mon-Fri: 9:00 AM - 8:00 PM',
            weekend: 'Sat-Sun: 9:00 AM - 6:00 PM',
        },
        mapUrl: 'https://maps.google.com',
    },
];

export default function LocationsPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-primary to-secondary text-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6">Our Locations</h1>
                    <p className="text-xl max-w-3xl mx-auto">
                        Find a ProActiv Fitness center near you. We have 15+ locations across
                        the region, each equipped with state-of-the-art facilities.
                    </p>
                </div>
            </section>

            {/* Locations Grid */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {locations.map((location) => (
                            <div
                                key={location.id}
                                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all"
                            >
                                {/* Header */}
                                <div className="bg-primary text-white p-6">
                                    <h2 className="text-2xl font-bold mb-2">{location.name}</h2>
                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-5 h-5 mt-1 flex-shrink-0" />
                                        <div>
                                            <p>{location.address}</p>
                                            <p>
                                                {location.city}, {location.state} {location.zipCode}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 space-y-4">
                                    {/* Phone */}
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

                                    {/* Email */}
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

                                    {/* Hours */}
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Clock className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Hours</p>
                                            <p className="text-gray-900">{location.hours.weekday}</p>
                                            <p className="text-gray-900">{location.hours.weekend}</p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3 pt-4">
                                        <a
                                            href={location.mapUrl}
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
                        ))}
                    </div>
                </div>
            </section>

            {/* Map Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Find Us on the Map
                        </h2>
                        <p className="text-xl text-gray-600">
                            Choose the location most convenient for you
                        </p>
                    </div>

                    {/* Map Placeholder */}
                    <div className="bg-gray-200 rounded-2xl h-96 flex items-center justify-center">
                        <div className="text-center">
                            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">
                                Interactive map will be integrated here
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-primary text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold mb-6">
                        Ready to Visit Us?
                    </h2>
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
    );
}
