'use client';

import { useState } from 'react';

interface Room {
    id: string;
    name: string;
    capacity: number;
    equipment: string[];
    available: boolean;
}

interface RoomSelectorProps {
    selectedRoom: string;
    onChange: (roomId: string) => void;
}

export default function RoomSelector({ selectedRoom, onChange }: RoomSelectorProps) {
    const [rooms] = useState<Room[]>([
        // Mock data - will be loaded from API
        { id: '1', name: 'Main Gym', capacity: 20, equipment: ['Mats', 'Bars'], available: true },
        { id: '2', name: 'Studio A', capacity: 15, equipment: ['Mats'], available: true },
        { id: '3', name: 'Studio B', capacity: 12, equipment: ['Mats', 'Rings'], available: false },
    ]);

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Room Selection</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rooms.map((room) => (
                    <div
                        key={room.id}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${selectedRoom === room.id
                                ? 'border-blue-600 bg-blue-50'
                                : room.available
                                    ? 'border-gray-200 hover:border-gray-300'
                                    : 'border-gray-200 opacity-50 cursor-not-allowed'
                            }`}
                        onClick={() => room.available && onChange(room.id)}
                    >
                        <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-gray-900">{room.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${room.available
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                {room.available ? 'Available' : 'Booked'}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Capacity: {room.capacity}</p>
                        <div className="flex flex-wrap gap-1">
                            {room.equipment.map((item, index) => (
                                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
