'use client';

import { MapPin, Clock, Phone } from 'lucide-react';

interface SelectLocationProps {
    selectedLocation: string;
    onSelect: (location: string) => void;
}

export default function SelectLocation({ selectedLocation, onSelect }: SelectLocationProps) {
    const locations = [
        {
            id: 'central',
            name: 'Central Sports Center',
            address: '123 Main Street, Central District',
            phone: '+852 1234 5678',
            hours: 'Mon-Fri: 9AM-8PM, Sat-Sun: 8AM-6PM',
            features: ['Indoor Gym', 'Parking Available', 'Air Conditioned']
        },
        {
            id: 'east',
            name: 'East Side Academy',
            address: '456 East Avenue, Tai Koo',
            phone: '+852 2345 6789',
            hours: 'Mon-Fri: 10AM-9PM, Sat-Sun: 9AM-7PM',
            features: ['Outdoor Courts', 'Easy MTR Access', 'Café On-site']
        },
        {
            id: 'west',
            name: 'West Point Facility',
            address: '789 West Road, Sheung Wan',
            phone: '+852 3456 7890',
            hours: 'Mon-Fri: 8AM-9PM, Sat-Sun: 8AM-8PM',
            features: ['Multi-purpose Hall', 'Parent Lounge', 'Equipment Rental']
        }
    ];

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
                        <button id={`select-location-${location.id}-btn`}
                            key={location.id}
                            onClick={() => onSelect(location.id)}
                            className={`w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 ${isSelected
                                    ? 'border-blue-600 bg-blue-50 shadow-lg'
                                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    {/* Header */}
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSelected ? 'bg-blue-600' : 'bg-gray-400'
                                            }`}>
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

                                    {/* Details — phone hides if branch doesn't publish one */}
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

                                    {/* Features */}
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

                                {/* Selected Indicator */}
                                {isSelected && (
                                    <div className="ml-4 flex items-center justify-center w-6 h-6 bg-blue-600 rounded-full">
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Map Link */}
            <div className="mt-6 text-center">
                <button id="select-location-view-map-btn" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                    📍 View all locations on map
                </button>
            </div>
        </div>
    );
}
