// Utility functions for handling images and placeholders

// Random placeholder images from Unsplash
export const getRandomImage = (category: string, width: number = 800, height: number = 600): string => {
    const categories = {
        // People & Sports
        'person': `https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=${width}&h=${height}&fit=crop&crop=face`,
        'coach': `https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=${width}&h=${height}&fit=crop&crop=face`,
        'athlete': `https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=${width}&h=${height}&fit=crop`,
        'team': `https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=${width}&h=${height}&fit=crop`,

        // Gymnastics & Sports
        'gymnastics': `https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=${width}&h=${height}&fit=crop`,
        'gymnastics camps': `https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=${width}&h=${height}&fit=crop`,
        'sports': `https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=${width}&h=${height}&fit=crop`,
        'fitness': `https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=${width}&h=${height}&fit=crop`,
        'training': `https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=${width}&h=${height}&fit=crop`,

        // Camps & Activities
        'holiday camps': `https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=${width}&h=${height}&fit=crop`,
        'multi activity camps': `https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=${width}&h=${height}&fit=crop`,
        'camp': `https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=${width}&h=${height}&fit=crop`,
        'party': `https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=${width}&h=${height}&fit=crop`,
        'birthday party': `https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=${width}&h=${height}&fit=crop`,

        // Facilities & Equipment
        'facility': `https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=${width}&h=${height}&fit=crop`,
        'gym': `https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=${width}&h=${height}&fit=crop`,
        'equipment': `https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=${width}&h=${height}&fit=crop`,

        // Kids & Children
        'kids': `https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=${width}&h=${height}&fit=crop`,
        'children': `https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=${width}&h=${height}&fit=crop`,
        'toddler': `https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=${width}&h=${height}&fit=crop`,

        // Locations & Buildings
        'cyberport location': `https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=${width}&h=${height}&fit=crop`,
        'location': `https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=${width}&h=${height}&fit=crop`,
        'building': `https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=${width}&h=${height}&fit=crop`,
        'interior': `https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=${width}&h=${height}&fit=crop`,

        // Business & Communication
        'blog writing': `https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=${width}&h=${height}&fit=crop`,
        'contact us': `https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=${width}&h=${height}&fit=crop`,
        'book trial class': `https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=${width}&h=${height}&fit=crop`,

        // Development & Learning
        'child development': `https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=${width}&h=${height}&fit=crop`,
        'gymnastics competition': `https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=${width}&h=${height}&fit=crop`,
        'safety training': `https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=${width}&h=${height}&fit=crop`,
        'confidence building': `https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=${width}&h=${height}&fit=crop`,
        'healthy nutrition': `https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=${width}&h=${height}&fit=crop`,
        'goal achievement': `https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=${width}&h=${height}&fit=crop`,

        // Programs & Classes
        'class': `https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=${width}&h=${height}&fit=crop`,
        'program': `https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=${width}&h=${height}&fit=crop`,

        // General/Default
        'hero': `https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=${width}&h=${height}&fit=crop`,
        'default': `https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=${width}&h=${height}&fit=crop`,
    };

    return categories[category as keyof typeof categories] || categories.default;
};

// Get random team member image
export const getRandomPersonImage = (gender?: 'male' | 'female'): string => {
    const maleImages = [
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=400&h=400&fit=crop&crop=face',
    ];

    const femaleImages = [
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=face',
    ];

    if (gender === 'male') {
        return maleImages[Math.floor(Math.random() * maleImages.length)];
    } else if (gender === 'female') {
        return femaleImages[Math.floor(Math.random() * femaleImages.length)];
    } else {
        const allImages = [...maleImages, ...femaleImages];
        return allImages[Math.floor(Math.random() * allImages.length)];
    }
};

// Get random sports/activity image
export const getRandomSportsImage = (sport?: string): string => {
    const sportsImages = {
        gymnastics: [
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop',
        ],
        fitness: [
            'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
        ],
        kids: [
            'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop',
        ]
    };

    const images = sportsImages[sport as keyof typeof sportsImages] || sportsImages.gymnastics;
    return images[Math.floor(Math.random() * images.length)];
};

// Fallback image with emoji
export const getFallbackImage = (emoji: string, width: number = 400, height: number = 300): string => {
    return `data:image/svg+xml,${encodeURIComponent(`
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#f3f4f6"/>
            <text x="50%" y="50%" font-size="64" text-anchor="middle" dy="0.3em">${emoji}</text>
        </svg>
    `)}`;
};

export default {
    getRandomImage,
    getRandomPersonImage,
    getRandomSportsImage,
    getFallbackImage
};