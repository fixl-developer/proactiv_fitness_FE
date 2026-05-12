'use client';

import { useState } from 'react';
import { MapPin, Clock, Phone, ExternalLink, X } from 'lucide-react';

interface SelectLocationProps {
    selectedLocation: string;
    onSelect: (location: string) => void;
}

interface LocationInfo {
    id: string;
    name: string;
    address: string;
    phone: string;
    hours: string;
    features: string[];
    // Lat/Lng used to build a Google Maps embed URL when "View on Map" opens.
    coords: { lat: number; lng: number };
}

export default function SelectLocation({ selectedLocation, onSelect }: SelectLocationProps) {
    const [mapLocation, setMapLocation] = useState<LocationInfo | null>(null);

    const locations: LocationInfo[] = [
        {
            id: 'central',
            name: 'Central Sports Center',
            address: '123 Main Street, Central District, Hong Kong',
            phone: '+852 1234 5678',
            hours: 'Mon-Fri: 9AM-8PM, Sat-Sun: 8AM-6PM',
            features: ['Indoor Gym', 'Parking Available', 'Air Conditioned'],
            coords: { lat: 22.2819, lng: 114.1577 },
        },
        {
            id: 'east',
            name: 'East Side Academy',
            address: '456 East Avenue, Tai Koo, Hong Kong',
            phone: '+852 2345 6789',
            hours: 'Mon-Fri: 10AM-9PM, Sat-Sun: 9AM-7PM',
            features: ['Outdoor Courts', 'Easy MTR Access', 'Café On-site'],
            coords: { lat: 22.2843, lng: 114.2169 },
        },
        {
            id: 'west',
            name: 'West Point Facility',
            address: '789 West Road, Sheung Wan, Hong Kong',
            phone: '+852 3456 7890',
            hours: 'Mon-Fri: 8AM-9PM, Sat-Sun: 8AM-8PM',
            features: ['Multi-purpose Hall', 'Parent Lounge', 'Equipment Rental'],
            coords: { lat: 22.2867, lng: 114.1483 },
        },
    ];

    const buildEmbedUrl = (loc: LocationInfo) =>
        `https://www.google.com/maps?q=${loc.coords.lat},${loc.coords.lng}&z=15&output=embed`;
    const buildOpenUrl = (loc: LocationInfo) =>
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.address)}`;

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Choose Your Location
            </h2>
            <p className="text-gray-600 mb-8">
                Select the center that's most convenient for you
            </p>

            <div className="space-y-4">
                {locations.map((location) => {
                    const isSelected = selectedLocation === location.id;

                    return (
                        <div
                            key={location.id}
                            className={`p-6 rounded-2xl border-2 transition-all duration-300 ${isSelected
                                ? 'border-blue-600 bg-blue-50 shadow-lg'
                                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                                }`}
                        >
                            <button
                                id={`select-location-${location.id}-btn`}
                                type="button"
                                onClick={() => onSelect(location.id)}
                                className="w-full text-left"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSelected ? 'bg-blue-600' : 'bg-gray-400'}`}>
                                                <MapPin className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900">
                                                    {location.name}
                                                </h3>
                                                <p className="text-gray-600 text-sm">
                                                    {location.address}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                                            {location.phone && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Phone className="w-4 h-4" />
                                                    {location.phone}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Clock className="w-4 h-4" />
                                                {location.hours}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {location.features.map((feature, index) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                                                >
                                                    {feature}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {isSelected && (
                                        <div className="ml-4 flex items-center justify-center w-6 h-6 bg-blue-600 rounded-full">
                                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            </button>

                            {/* View on Map button — sits inside the card but outside the main button so click doesn't toggle selection */}
                            <div className="mt-4 flex justify-end">
                                <button
                                    id={`select-location-${location.id}-view-map-btn`}
                                    type="button"
                                    onClick={() => setMapLocation(location)}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    <MapPin className="w-4 h-4" />
                                    View on Map
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* All locations link */}
            <div className="mt-6 text-center">
                <a
                    id="select-location-view-all-map-btn"
                    href="https://www.google.com/maps/search/Proactiv+Fitness+Hong+Kong"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                    <MapPin className="w-4 h-4" />
                    View all locations on map
                    <ExternalLink className="w-3 h-3" />
                </a>
            </div>

            {/* Map Modal */}
            {mapLocation && (
                <div
                    className="fixed inset-0 z-[80] bg-black/60 flex items-center justify-center p-4"
                    onClick={() => setMapLocation(null)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-4 border-b">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{mapLocation.name}</h3>
                                <p className="text-sm text-gray-500">{mapLocation.address}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setMapLocation(null)}
                                className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="relative w-full" style={{ height: '480px' }}>
                            <iframe
                                title={`Map of ${mapLocation.name}`}
                                src={buildEmbedUrl(mapLocation)}
                                className="absolute inset-0 w-full h-full"
                                allowFullScreen
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                        </div>
                        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
                            <p className="text-sm text-gray-600">
                                <Phone className="w-4 h-4 inline mr-1" />
                                {mapLocation.phone}
                            </p>
                            <a
                                href={buildOpenUrl(mapLocation)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                Open in Google Maps
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
