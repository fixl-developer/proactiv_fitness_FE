export const programs = [
    {
        id: 'gymnastics',
        name: 'Gymnastics',
        description: 'Build strength, flexibility, and coordination through fun gymnastics activities',
        ageRange: '3-12 years',
        duration: '30 minutes',
        features: ['Strength Building', 'Flexibility Training', 'Coordination Skills', 'Balance Development']
    },
    {
        id: 'multi-sports',
        name: 'Multi-Sports',
        description: 'Explore various sports and develop fundamental movement skills',
        ageRange: '4-10 years',
        duration: '30 minutes',
        features: ['Ball Skills', 'Running & Jumping', 'Team Sports', 'Motor Skills']
    },
    {
        id: 'camps',
        name: 'Holiday Camps',
        description: 'Action-packed camps during school breaks with diverse activities',
        ageRange: '5-12 years',
        duration: '30 minutes',
        features: ['Mixed Activities', 'Social Skills', 'Fun Games', 'New Friends']
    }
];

export const locations = [
    {
        id: 'central',
        name: 'Central Sports Center',
        address: '123 Main Street, Central District, Hong Kong',
        phone: '+852 1234 5678',
        email: 'central@proactivesports.com',
        hours: {
            weekdays: '9:00 AM - 8:00 PM',
            weekends: '8:00 AM - 6:00 PM'
        },
        features: ['Indoor Gym', 'Parking Available', 'Air Conditioned', 'Parent Lounge'],
        coordinates: { lat: 22.2783, lng: 114.1747 }
    },
    {
        id: 'east',
        name: 'East Side Academy',
        address: '456 East Avenue, Tai Koo, Hong Kong',
        phone: '+852 2345 6789',
        email: 'east@proactivesports.com',
        hours: {
            weekdays: '10:00 AM - 9:00 PM',
            weekends: '9:00 AM - 7:00 PM'
        },
        features: ['Outdoor Courts', 'Easy MTR Access', 'Café On-site', 'Equipment Rental'],
        coordinates: { lat: 22.2855, lng: 114.2155 }
    },
    {
        id: 'west',
        name: 'West Point Facility',
        address: '789 West Road, Sheung Wan, Hong Kong',
        phone: '+852 3456 7890',
        email: 'west@proactivesports.com',
        hours: {
            weekdays: '8:00 AM - 9:00 PM',
            weekends: '8:00 AM - 8:00 PM'
        },
        features: ['Multi-purpose Hall', 'Parent Lounge', 'Equipment Rental', 'Snack Bar'],
        coordinates: { lat: 22.2855, lng: 114.1420 }
    }
];

export const timeSlots = [
    { id: '09:00', time: '9:00 AM', available: true },
    { id: '10:00', time: '10:00 AM', available: true },
    { id: '11:00', time: '11:00 AM', available: false },
    { id: '12:00', time: '12:00 PM', available: false }, // Lunch break
    { id: '14:00', time: '2:00 PM', available: true },
    { id: '15:00', time: '3:00 PM', available: true },
    { id: '16:00', time: '4:00 PM', available: true },
    { id: '17:00', time: '5:00 PM', available: false },
    { id: '18:00', time: '6:00 PM', available: true }
];

export const assessmentInfo = {
    duration: 30, // minutes
    price: 0, // Free assessment
    whatToExpect: [
        'Skill evaluation by certified coaches',
        'One-on-one interaction with your child',
        'Program recommendation based on assessment',
        'Opportunity to ask questions about our programs'
    ],
    whatToBring: [
        'Comfortable sports clothes',
        'Water bottle',
        'Positive attitude and excitement!'
    ],
    policies: {
        cancellation: '24 hours notice required for cancellations',
        rescheduling: 'Free rescheduling up to 2 hours before appointment',
        lateness: 'Please arrive 10 minutes early. Late arrivals may need to reschedule'
    }
};