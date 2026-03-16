// Comprehensive page styling utilities for attractive and responsive design

export const pageStyles = {
    // Hero sections
    heroSection: {
        container: 'relative min-h-[500px] md:min-h-[600px] lg:min-h-[700px] overflow-hidden',
        gradient: 'bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900',
        overlay: 'absolute inset-0 bg-gradient-to-r from-blue-900/80 via-purple-900/60 to-indigo-900/80',
        content: 'relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20',
        title: 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6',
        subtitle: 'text-lg sm:text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto mb-8 md:mb-12'
    },

    // Cards
    card: {
        base: 'bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden',
        hover: 'hover:scale-105 hover:-translate-y-2',
        padding: 'p-4 sm:p-6 md:p-8',
        border: 'border border-gray-200/50'
    },

    // Buttons
    button: {
        primary: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300',
        secondary: 'bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 px-6 rounded-lg transition-all duration-300',
        outline: 'border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 font-semibold py-3 px-6 rounded-lg transition-all duration-300'
    },

    // Sections
    section: {
        container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
        padding: 'py-12 md:py-16 lg:py-20',
        title: 'text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 md:mb-6',
        subtitle: 'text-lg text-gray-600 max-w-2xl mb-8 md:mb-12'
    },

    // Grid layouts
    grid: {
        cols1: 'grid-cols-1',
        cols2: 'md:grid-cols-2',
        cols3: 'lg:grid-cols-3',
        cols4: 'lg:grid-cols-4',
        gap: 'gap-4 md:gap-6 lg:gap-8'
    },

    // Text
    text: {
        h1: 'text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900',
        h2: 'text-3xl md:text-4xl font-bold text-gray-900',
        h3: 'text-2xl md:text-3xl font-bold text-gray-900',
        h4: 'text-xl md:text-2xl font-bold text-gray-900',
        body: 'text-base md:text-lg text-gray-700 leading-relaxed',
        small: 'text-sm md:text-base text-gray-600'
    },

    // Responsive spacing
    spacing: {
        xs: 'p-2 md:p-3 lg:p-4',
        sm: 'p-3 md:p-4 lg:p-6',
        md: 'p-4 md:p-6 lg:p-8',
        lg: 'p-6 md:p-8 lg:p-12',
        xl: 'p-8 md:p-12 lg:p-16'
    },

    // Animations
    animation: {
        fadeIn: 'animate-fade-in',
        slideUp: 'animate-slide-up',
        slideDown: 'animate-slide-down',
        slideLeft: 'animate-slide-left',
        slideRight: 'animate-slide-right',
        bounce: 'animate-bounce',
        pulse: 'animate-pulse'
    },

    // Responsive text sizes
    responsiveText: {
        title: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold',
        heading: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold',
        subheading: 'text-lg sm:text-xl md:text-2xl font-semibold',
        body: 'text-base sm:text-lg md:text-lg lg:text-lg',
        small: 'text-sm sm:text-base md:text-base'
    },

    // Responsive padding
    responsivePadding: {
        container: 'px-4 sm:px-6 md:px-8 lg:px-12',
        section: 'py-8 sm:py-12 md:py-16 lg:py-20',
        card: 'p-4 sm:p-6 md:p-8'
    },

    // Responsive gaps
    responsiveGap: {
        xs: 'gap-2 md:gap-3 lg:gap-4',
        sm: 'gap-3 md:gap-4 lg:gap-6',
        md: 'gap-4 md:gap-6 lg:gap-8',
        lg: 'gap-6 md:gap-8 lg:gap-12'
    }
}

// Responsive breakpoints
export const breakpoints = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
}

// Color schemes
export const colorSchemes = {
    primary: {
        light: 'from-blue-50 to-cyan-50',
        main: 'from-blue-600 to-cyan-600',
        dark: 'from-blue-900 to-cyan-900'
    },
    success: {
        light: 'from-green-50 to-emerald-50',
        main: 'from-green-600 to-emerald-600',
        dark: 'from-green-900 to-emerald-900'
    },
    warning: {
        light: 'from-yellow-50 to-orange-50',
        main: 'from-yellow-600 to-orange-600',
        dark: 'from-yellow-900 to-orange-900'
    },
    danger: {
        light: 'from-red-50 to-pink-50',
        main: 'from-red-600 to-pink-600',
        dark: 'from-red-900 to-pink-900'
    }
}
