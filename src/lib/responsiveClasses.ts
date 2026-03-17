// Responsive Tailwind Classes for Dashboards
export const responsiveClasses = {
    // Container & Spacing
    container: 'w-full px-4 sm:px-6 lg:px-8 mx-auto',
    pageContainer: 'space-y-4 sm:space-y-6 lg:space-y-8',

    // Header
    headerContainer: 'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6',
    headerTitle: 'text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900',
    headerSubtitle: 'text-sm sm:text-base text-gray-600 mt-1 sm:mt-2',

    // Grid Layouts
    metricsGrid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6',
    cardsGrid: 'grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6',
    fullWidthGrid: 'grid grid-cols-1 gap-4 sm:gap-6',

    // Cards
    card: 'rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow',
    cardHeader: 'p-4 sm:p-6 border-b border-gray-200',
    cardContent: 'p-4 sm:p-6',

    // Buttons
    buttonGroup: 'flex flex-col sm:flex-row gap-2 sm:gap-3',
    buttonSmall: 'px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm',
    buttonMedium: 'px-4 py-2 sm:px-6 sm:py-2.5 text-sm sm:text-base',
    buttonLarge: 'px-6 py-3 sm:px-8 sm:py-3.5 text-base sm:text-lg',

    // Text
    textXs: 'text-xs sm:text-xs',
    textSm: 'text-sm sm:text-sm',
    textBase: 'text-base sm:text-base',
    textLg: 'text-lg sm:text-lg',
    textXl: 'text-xl sm:text-2xl',
    text2xl: 'text-2xl sm:text-3xl',
    text3xl: 'text-3xl sm:text-4xl',

    // Lists & Items
    listItem: 'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 sm:p-4',
    listItemContent: 'flex-1 min-w-0',
    listItemActions: 'flex gap-2 sm:gap-3 flex-shrink-0',

    // Badges & Status
    badge: 'inline-flex items-center px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-full',

    // Forms & Inputs
    input: 'w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border border-gray-300',
    select: 'w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border border-gray-300',

    // Modals & Overlays
    modal: 'fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6',
    modalContent: 'w-full max-w-sm sm:max-w-md lg:max-w-lg rounded-lg bg-white shadow-xl',

    // Navigation
    navContainer: 'flex flex-col sm:flex-row gap-2 sm:gap-1 bg-gray-100 rounded-lg p-1',
    navButton: 'px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-md transition-colors',

    // Responsive Visibility
    hideOnMobile: 'hidden sm:block',
    showOnMobile: 'block sm:hidden',
    hideOnTablet: 'hidden lg:block',
    showOnTablet: 'block lg:hidden',

    // Flex Utilities
    flexBetween: 'flex items-center justify-between',
    flexCenter: 'flex items-center justify-center',
    flexStart: 'flex items-center justify-start',
    flexEnd: 'flex items-center justify-end',

    // Overflow & Truncate
    truncate: 'truncate',
    lineClamp2: 'line-clamp-2',
    lineClamp3: 'line-clamp-3',

    // Responsive Padding
    paddingResponsive: 'p-3 sm:p-4 lg:p-6',
    paddingResponsiveX: 'px-3 sm:px-4 lg:px-6',
    paddingResponsiveY: 'py-3 sm:py-4 lg:py-6',

    // Responsive Gap
    gapResponsive: 'gap-3 sm:gap-4 lg:gap-6',
    gapResponsiveX: 'gap-x-3 sm:gap-x-4 lg:gap-x-6',
    gapResponsiveY: 'gap-y-3 sm:gap-y-4 lg:gap-y-6',
}

// Breakpoint utilities
export const breakpoints = {
    mobile: '(max-width: 640px)',
    tablet: '(min-width: 641px) and (max-width: 1024px)',
    desktop: '(min-width: 1025px)',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
}

// Responsive grid configurations
export const gridConfigs = {
    metrics: {
        mobile: 'grid-cols-1',
        tablet: 'grid-cols-2',
        desktop: 'grid-cols-4'
    },
    cards: {
        mobile: 'grid-cols-1',
        tablet: 'grid-cols-1',
        desktop: 'grid-cols-2'
    },
    items: {
        mobile: 'grid-cols-1',
        tablet: 'grid-cols-2',
        desktop: 'grid-cols-3'
    }
}
