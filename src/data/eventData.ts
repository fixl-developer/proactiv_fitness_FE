// Event data for all booking cards
export const eventData: Record<string, any> = {
    '1257064': {
        title: 'PROGYM Cyberport Assessment',
        type: 'Assessment',
        location: 'Progym Cyberport',
        address: '100/F Cyberport Rd, Telegraph Bay, Hong Kong',
        duration: '30 minutes',
        ageRange: '3 to 10 years',
        price: 'FREE',
        description: 'Set Your Child Up for Success from Day One',
        fullDescription: `Our 30-minute assessment sessions are designed to identify the perfect starting point for your child's gymnastics journey. Led by our experienced coaches in our state-of-the-art facilities, each child is guided through a series of fun and progressive skills across key apparatus. By the end of the session, you'll know exactly which level and class best suits your child's current ability – ensuring they build confidence, improve quickly, and enjoy every step of the journey.`,
        features: [
            'Why book an Assessment?',
            'Expert Coaching from certified gymnastics professionals',
            'Personalised Class Placement for faster progress and more fun',
            'Safe, Supportive Environment that builds confidence and skills',
            'No Commitment, No Cost - it\'s completely FREE to get started'
        ],
        coach: {
            name: 'Will Murray',
            avatar: '/images/team/will-murray.jpg'
        },
        sessions: [
            {
                id: 'session-1',
                date: 'Mon, Jan 05, 2026',
                time: '12:30 to 1:00 pm',
                availableSeats: 4,
                bookedSeats: 0,
                status: 'available'
            },
            {
                id: 'session-2',
                date: 'Wed, Jan 07, 2026',
                time: '12:30 to 1:00 pm',
                availableSeats: 4,
                bookedSeats: 0,
                status: 'available'
            },
            {
                id: 'session-3',
                date: 'Fri, Jan 09, 2026',
                time: '12:30 to 1:00 pm',
                availableSeats: 4,
                bookedSeats: 0,
                status: 'available'
            },
            {
                id: 'session-4',
                date: 'Mon, Jan 12, 2026',
                time: '12:30 to 1:00 pm',
                availableSeats: 4,
                bookedSeats: 0,
                status: 'available'
            }
        ]
    },
    '1257065': {
        title: 'PROGYM Wan Chai Assessment',
        type: 'Assessment',
        location: 'Progym Wan Chai',
        address: '100/F Wan Chai Rd, Wan Chai, Hong Kong',
        duration: '30 minutes',
        ageRange: '3 to 10 years',
        price: 'FREE',
        description: 'Set Your Child Up for Success from Day One',
        fullDescription: `Our 30-minute assessment sessions are designed to identify the perfect starting point for your child's gymnastics journey. Led by our experienced coaches in our state-of-the-art facilities, each child is guided through a series of fun and progressive skills across key apparatus.`,
        features: [
            'Why book an Assessment?',
            'Expert Coaching from certified gymnastics professionals',
            'Personalised Class Placement for faster progress and more fun',
            'Safe, Supportive Environment that builds confidence and skills',
            'No Commitment, No Cost - it\'s completely FREE to get started'
        ],
        coach: {
            name: 'Sarah Chen',
            avatar: '/images/team/sarah-chen.jpg'
        },
        sessions: [
            {
                id: 'session-1',
                date: 'Tue, Jan 06, 2026',
                time: '2:30 to 3:00 pm',
                availableSeats: 4,
                bookedSeats: 0,
                status: 'available'
            },
            {
                id: 'session-2',
                date: 'Thu, Jan 08, 2026',
                time: '2:30 to 3:00 pm',
                availableSeats: 4,
                bookedSeats: 0,
                status: 'available'
            }
        ]
    },
    '1257066': {
        title: 'Advanced Skills Assessment',
        type: 'Assessment',
        location: 'Progym Cyberport',
        address: '100/F Cyberport Rd, Telegraph Bay, Hong Kong',
        duration: '45 minutes',
        ageRange: '8 to 16 years',
        price: 'FREE',
        description: 'Advanced Skills Assessment for Experienced Gymnasts',
        fullDescription: `Our 45-minute advanced assessment sessions are designed for children with previous gymnastics experience. Our expert coaches will evaluate advanced skills and recommend the appropriate competitive or advanced recreational program.`,
        features: [
            'Advanced Skills Evaluation',
            'Expert Coaching Assessment',
            'Competitive Program Placement',
            'Skill Level Determination',
            'No Commitment, No Cost - it\'s completely FREE'
        ],
        coach: {
            name: 'Monica',
            avatar: '/images/team/monica.jpg'
        },
        sessions: [
            {
                id: 'session-1',
                date: 'Wed, Jan 07, 2026',
                time: '4:00 to 4:45 pm',
                availableSeats: 4,
                bookedSeats: 0,
                status: 'available'
            }
        ]
    },
    '1257067': {
        title: 'Shrewsbury - Combo Camp - Gym...',
        type: 'Holiday Camp',
        location: 'Shrewsbury International',
        address: 'Shrewsbury International School, Hong Kong',
        duration: '6 hours',
        ageRange: '5 to 12 years',
        price: 'HKD 1,100.00',
        packagePrice: 'HKD 4,999.00',
        description: 'Holiday Camp - Full Day Fun, Skill Building...',
        fullDescription: `Make your school holidays count! Join our exciting combo camp featuring gymnastics, sports, and fun activities. Full day program with lunch included.`,
        features: [
            'Full Day Program (6 hours)',
            'Gymnastics Training',
            'Sports Activities',
            'Arts & Crafts',
            'Lunch Included',
            'Professional Supervision'
        ],
        coach: {
            name: 'Camp Team',
            avatar: '/images/team/camp-team.jpg'
        },
        sessions: [
            {
                id: 'session-1',
                date: 'Mon, Dec 22, 2025',
                time: '6:30 am to 12:30 pm',
                availableSeats: 12,
                bookedSeats: 3,
                status: 'available'
            },
            {
                id: 'session-2',
                date: 'Tue, Dec 23, 2025',
                time: '6:30 am to 12:30 pm',
                availableSeats: 12,
                bookedSeats: 2,
                status: 'available'
            },
            {
                id: 'session-3',
                date: 'Wed, Dec 24, 2025',
                time: '6:30 am to 12:30 pm',
                availableSeats: 12,
                bookedSeats: 1,
                status: 'available'
            }
        ]
    },
    '1257068': {
        title: 'Shrewsbury - Gymnastics Camps',
        type: 'Holiday Camp',
        location: 'Shrewsbury International',
        address: 'Shrewsbury International School, Hong Kong',
        duration: '3 hours',
        ageRange: '5 to 12 years',
        price: 'HKD 700.00',
        packagePrice: 'HKD 2,999.00',
        description: 'Make your school holidays count!Join...',
        fullDescription: `Make your school holidays count! Join our gymnastics-focused camp with expert coaching and skill development.`,
        features: [
            'Half Day Program (3 hours)',
            'Gymnastics Training',
            'Skill Development',
            'Fun Activities',
            'Professional Coaching'
        ],
        coach: {
            name: 'Camp Team',
            avatar: '/images/team/camp-team.jpg'
        },
        sessions: [
            {
                id: 'session-1',
                date: 'Mon, Dec 22, 2025',
                time: '6:30 to 9:30 am',
                availableSeats: 15,
                bookedSeats: 5,
                status: 'available'
            }
        ]
    },
    '1257069': {
        title: 'Winter Holiday Combo Camp',
        type: 'Holiday Camp',
        location: 'Shrewsbury International',
        address: 'Shrewsbury International School, Hong Kong',
        duration: '6 hours',
        ageRange: '5 to 12 years',
        price: 'HKD 1,100.00',
        packagePrice: 'HKD 4,999.00',
        description: 'Holiday Camp - Full Day Fun, Skill Building...',
        fullDescription: `Make your school holidays count! Join our exciting combo camp featuring gymnastics, sports, and fun activities.`,
        features: [
            'Full Day Program (6 hours)',
            'Gymnastics Training',
            'Sports Activities',
            'Fun Games',
            'Lunch Included'
        ],
        coach: {
            name: 'Camp Team',
            avatar: '/images/team/camp-team.jpg'
        },
        sessions: [
            {
                id: 'session-1',
                date: 'Mon, Dec 29, 2025',
                time: '6:30 am to 12:30 pm',
                availableSeats: 12,
                bookedSeats: 2,
                status: 'available'
            }
        ]
    },
    '1257070': {
        title: 'Progym Cyberport Classes - GYMTOTS',
        type: 'Class',
        location: 'Progym Cyberport',
        address: '100/F Cyberport Rd, Telegraph Bay, Hong Kong',
        duration: '45 minutes',
        ageRange: '2 to 3 years',
        price: 'HKD 275.00',
        dropInPrice: 'HKD 325.00',
        description: 'Fun gymnastics for toddlers',
        fullDescription: `Our GYMTOTS program is specially designed for toddlers aged 2-3 years. This parent-child program focuses on developing basic motor skills, coordination, and confidence through fun gymnastics activities.`,
        features: [
            'Parent-Child Program',
            'Motor Skills Development',
            'Coordination Training',
            'Confidence Building',
            'Age-Appropriate Equipment',
            'Fun & Safe Environment'
        ],
        coach: {
            name: 'Will Murray',
            avatar: '/images/team/will-murray.jpg'
        },
        sessions: [
            {
                id: 'session-1',
                date: 'Mon, Jan 05, 2026',
                time: '6:30 to 7:15 am',
                availableSeats: 12,
                bookedSeats: 0,
                status: 'available'
            },
            {
                id: 'session-2',
                date: 'Mon, Jan 12, 2026',
                time: '6:30 to 7:15 am',
                availableSeats: 12,
                bookedSeats: 0,
                status: 'available'
            },
            {
                id: 'session-3',
                date: 'Mon, Jan 19, 2026',
                time: '6:30 to 7:15 am',
                availableSeats: 12,
                bookedSeats: 0,
                status: 'available'
            },
            {
                id: 'session-4',
                date: 'Mon, Jan 26, 2026',
                time: '6:30 to 7:15 am',
                availableSeats: 12,
                bookedSeats: 0,
                status: 'available'
            }
        ]
    },
    '1257071': {
        title: 'Progym Cyberport Classes - Beginner',
        type: 'Class',
        location: 'Progym Cyberport',
        address: '100/F Cyberport Rd, Telegraph Bay, Hong Kong',
        duration: '1 hour',
        ageRange: '3 to 5 years',
        price: 'HKD 350.00',
        packagePrice: 'HKD 3,900.00',
        description: 'Perfect for beginners',
        fullDescription: `Our beginner gymnastics program is designed for children aged 3-5 years who are new to gymnastics. The program focuses on fundamental movement skills, basic gymnastics positions, and building confidence.`,
        features: [
            'Fundamental Movement Skills',
            'Basic Gymnastics Positions',
            'Confidence Building',
            'Small Class Sizes',
            'Qualified Instructors',
            'Progressive Skill Development'
        ],
        coach: {
            name: 'Will Murray',
            avatar: '/images/team/will-murray.jpg'
        },
        sessions: [
            {
                id: 'session-1',
                date: 'Multiple Repeats',
                time: '1:00 to 2:00 pm',
                availableSeats: 8,
                bookedSeats: 2,
                status: 'available'
            }
        ]
    },
    '1257072': {
        title: 'Monday - Intermediate (6 years +)',
        type: 'Class',
        location: 'Progym Cyberport',
        address: '100/F Cyberport Rd, Telegraph Bay, Hong Kong',
        duration: '1 hour',
        ageRange: '6 to 12 years',
        price: 'HKD 350.00',
        packagePrice: 'HKD 3,900.00',
        description: 'The intermediate gymnastics program is...',
        fullDescription: `The intermediate gymnastics program is designed for children who have mastered basic skills and are ready to progress to more challenging movements. This program focuses on skill refinement and introduction of intermediate level skills.`,
        features: [
            'Intermediate Skill Development',
            'Apparatus Training',
            'Strength & Flexibility',
            'Skill Refinement',
            'Progressive Challenges',
            'Competition Preparation'
        ],
        coach: {
            name: 'Will Murray',
            avatar: '/images/team/will-murray.jpg'
        },
        sessions: [
            {
                id: 'session-1',
                date: 'Mon, Jan 05, 2026',
                time: '1:30 to 2:30 pm',
                availableSeats: 8,
                bookedSeats: 3,
                status: 'available'
            },
            {
                id: 'session-2',
                date: 'Mon, Jan 12, 2026',
                time: '1:30 to 2:30 pm',
                availableSeats: 8,
                bookedSeats: 3,
                status: 'available'
            }
        ]
    },
    '1257073': {
        title: 'Half Day Camp - Week 2',
        type: 'Camp',
        location: 'Progym Cyberport',
        address: '100/F Cyberport Rd, Telegraph Bay, Hong Kong',
        duration: '3 hours',
        ageRange: '4 to 10 years',
        price: 'HKD 700.00',
        packagePrice: 'HKD 3,000.00',
        description: 'Make your school holidays count!Join...',
        fullDescription: `Make your school holidays count! Join our exciting half-day camp featuring gymnastics training, games, and fun activities. Perfect for keeping kids active during school breaks.`,
        features: [
            'Half Day Program (3 hours)',
            'Gymnastics Training',
            'Fun Games & Activities',
            'Skill Development',
            'Social Interaction',
            'Professional Coaching'
        ],
        coach: {
            name: 'Camp Team',
            avatar: '/images/team/camp-team.jpg'
        },
        sessions: [
            {
                id: 'session-1',
                date: 'Mon, Dec 22, 2025',
                time: '6:30 to 9:30 am',
                availableSeats: 15,
                bookedSeats: 5,
                status: 'available'
            },
            {
                id: 'session-2',
                date: 'Tue, Dec 23, 2025',
                time: '6:30 to 9:30 am',
                availableSeats: 15,
                bookedSeats: 4,
                status: 'available'
            },
            {
                id: 'session-3',
                date: 'Wed, Dec 24, 2025',
                time: '6:30 to 9:30 am',
                availableSeats: 15,
                bookedSeats: 3,
                status: 'available'
            }
        ]
    },
    '1257074': {
        title: 'FULL DAY CAMP - Week 2',
        type: 'Camp',
        location: 'Progym Cyberport',
        address: '100/F Cyberport Rd, Telegraph Bay, Hong Kong',
        duration: '6 hours',
        ageRange: '4 to 10 years',
        price: 'HKD 1,100.00',
        packagePrice: 'HKD 5,000.00',
        description: 'Make your school holidays count!Join...',
        fullDescription: `Make your school holidays count! Join our exciting full-day camp featuring gymnastics training, games, and fun activities.`,
        features: [
            'Full Day Program (6 hours)',
            'Gymnastics Training',
            'Fun Games & Activities',
            'Lunch Included',
            'Social Interaction',
            'Professional Coaching'
        ],
        coach: {
            name: 'Camp Team',
            avatar: '/images/team/camp-team.jpg'
        },
        sessions: [
            {
                id: 'session-1',
                date: 'Mon, Dec 22, 2025',
                time: '6:30 am to 12:30 pm',
                availableSeats: 15,
                bookedSeats: 7,
                status: 'available'
            }
        ]
    },
    '1257075': {
        title: 'HALF DAY CAMP - Afternoon',
        type: 'Camp',
        location: 'Progym Cyberport',
        address: '100/F Cyberport Rd, Telegraph Bay, Hong Kong',
        duration: '3 hours',
        ageRange: '4 to 10 years',
        price: 'HKD 700.00',
        packagePrice: 'HKD 3,000.00',
        description: 'Make your school holidays count!Join...',
        fullDescription: `Make your school holidays count! Join our exciting afternoon half-day camp featuring gymnastics training, games, and fun activities.`,
        features: [
            'Half Day Program (3 hours)',
            'Gymnastics Training',
            'Fun Games & Activities',
            'Skill Development',
            'Social Interaction',
            'Professional Coaching'
        ],
        coach: {
            name: 'Camp Team',
            avatar: '/images/team/camp-team.jpg'
        },
        sessions: [
            {
                id: 'session-1',
                date: 'Mon, Dec 22, 2025',
                time: '11:00 am to 2:00 pm',
                availableSeats: 15,
                bookedSeats: 6,
                status: 'available'
            }
        ]
    },
    '1257076': {
        title: 'Thursday - IMS ECA - Beginner',
        type: 'Class',
        location: 'Progym Wanchai',
        address: '100/F Wan Chai Rd, Wan Chai, Hong Kong',
        duration: '1 hour',
        ageRange: '3 to 5 years',
        packagePrice: 'HKD 4,500.00',
        description: 'Our beginner gymnastics program is...',
        fullDescription: `Our beginner gymnastics program is designed for children aged 3-5 years who are new to gymnastics. The program focuses on fundamental movement skills, basic gymnastics positions, and building confidence.`,
        features: [
            'Fundamental Movement Skills',
            'Basic Gymnastics Positions',
            'Confidence Building',
            'Small Class Sizes',
            'Qualified Instructors',
            'Progressive Skill Development'
        ],
        coach: {
            name: 'Sarah Chen',
            avatar: '/images/team/sarah-chen.jpg'
        },
        sessions: [
            {
                id: 'session-1',
                date: 'Multiple Repeats',
                time: '1:00 to 2:00 pm',
                availableSeats: 8,
                bookedSeats: 4,
                status: 'available'
            }
        ]
    },
    '1257077': {
        title: 'Monday - Beginner 1 (3 - 5 years)',
        type: 'Class',
        location: 'Progym Wanchai',
        address: '100/F Wan Chai Rd, Wan Chai, Hong Kong',
        duration: '1 hour',
        ageRange: '3 to 5 years',
        price: 'HKD 350.00',
        packagePrice: 'HKD 3,900.00',
        description: 'Our beginner gymnastics program is...',
        fullDescription: `Our beginner gymnastics program is designed for children aged 3-5 years who are new to gymnastics. The program focuses on fundamental movement skills, basic gymnastics positions, and building confidence.`,
        features: [
            'Fundamental Movement Skills',
            'Basic Gymnastics Positions',
            'Confidence Building',
            'Small Class Sizes',
            'Qualified Instructors',
            'Progressive Skill Development'
        ],
        coach: {
            name: 'Juan',
            avatar: '/images/team/juan.jpg'
        },
        sessions: [
            {
                id: 'session-1',
                date: 'Mon, Jan 05, 2026',
                time: '1:00 to 2:00 pm',
                availableSeats: 8,
                bookedSeats: 2,
                status: 'available'
            }
        ]
    },
    '1257078': {
        title: 'Monday- Intermediate (6 years +)',
        type: 'Class',
        location: 'Progym Wanchai',
        address: '100/F Wan Chai Rd, Wan Chai, Hong Kong',
        duration: '1 hour',
        ageRange: '6 to 12 years',
        price: 'HKD 350.00',
        packagePrice: 'HKD 3,900.00',
        description: 'The intermediate gymnastics program is...',
        fullDescription: `The intermediate gymnastics program is designed for children who have mastered basic skills and are ready to progress to more challenging movements.`,
        features: [
            'Intermediate Skill Development',
            'Apparatus Training',
            'Strength & Flexibility',
            'Skill Refinement',
            'Progressive Challenges',
            'Competition Preparation'
        ],
        coach: {
            name: 'Juan',
            avatar: '/images/team/juan.jpg'
        },
        sessions: [
            {
                id: 'session-1',
                date: 'Mon, Jan 05, 2026',
                time: '1:30 to 2:30 pm',
                availableSeats: 8,
                bookedSeats: 4,
                status: 'available'
            }
        ]
    },
    '1257079': {
        title: 'HALF DAY CAMP - Week 2',
        type: 'Camp',
        location: 'Progym Wanchai',
        address: '100/F Wan Chai Rd, Wan Chai, Hong Kong',
        duration: '3 hours',
        ageRange: '4 to 10 years',
        price: 'HKD 700.00',
        packagePrice: 'HKD 3,000.00',
        description: 'Make your school holidays count!Join...',
        fullDescription: `Make your school holidays count! Join our exciting half-day camp featuring gymnastics training, games, and fun activities.`,
        features: [
            'Half Day Program (3 hours)',
            'Gymnastics Training',
            'Fun Games & Activities',
            'Skill Development',
            'Social Interaction',
            'Professional Coaching'
        ],
        coach: {
            name: 'Camp Team',
            avatar: '/images/team/camp-team.jpg'
        },
        sessions: [
            {
                id: 'session-1',
                date: 'Mon, Dec 22, 2025',
                time: '6:30 to 9:30 am',
                availableSeats: 15,
                bookedSeats: 5,
                status: 'available'
            }
        ]
    },
    '1257080': {
        title: 'FULL DAY CAMP - Week 2',
        type: 'Camp',
        location: 'Progym Wanchai',
        address: '100/F Wan Chai Rd, Wan Chai, Hong Kong',
        duration: '6 hours',
        ageRange: '4 to 10 years',
        price: 'HKD 1,100.00',
        packagePrice: 'HKD 5,000.00',
        description: 'Make your school holidays count!Join...',
        fullDescription: `Make your school holidays count! Join our exciting full-day camp featuring gymnastics training, games, and fun activities.`,
        features: [
            'Full Day Program (6 hours)',
            'Gymnastics Training',
            'Fun Games & Activities',
            'Lunch Included',
            'Social Interaction',
            'Professional Coaching'
        ],
        coach: {
            name: 'Camp Team',
            avatar: '/images/team/camp-team.jpg'
        },
        sessions: [
            {
                id: 'session-1',
                date: 'Mon, Dec 22, 2025',
                time: '6:30 am to 12:30 pm',
                availableSeats: 15,
                bookedSeats: 8,
                status: 'available'
            }
        ]
    }
}
