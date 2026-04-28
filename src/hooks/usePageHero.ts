'use client'

import { useEffect, useState } from 'react'
import { CMSService, PageContentHero } from '@/services/cmsService'

export interface PageHeroResolved extends PageContentHero {}

/**
 * Fetches the CMS-managed hero for a page slug.
 * Returns the resolved hero merged with the supplied fallback so callers
 * can always render a hero — even if the API is down or the doc was deleted.
 *
 * Pages call this with the slug an admin sees in the CMS dashboard
 * (e.g. 'school-gymnastics', 'parties', 'team').
 */
export function usePageHero(slug: string, fallback: PageHeroResolved): {
    hero: PageHeroResolved
    isLoading: boolean
} {
    const [hero, setHero] = useState<PageHeroResolved>(fallback)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        setIsLoading(true)
        CMSService.getPageContent(slug)
            .then(page => {
                if (cancelled) return
                if (page && page.hero && (page.hero.title || page.hero.subtitle || page.hero.backgroundImage)) {
                    setHero({
                        title: page.hero.title || fallback.title,
                        subtitle: page.hero.subtitle || fallback.subtitle,
                        backgroundImage: page.hero.backgroundImage || fallback.backgroundImage,
                        fallbackGradient: page.hero.fallbackGradient || fallback.fallbackGradient,
                        ctaText: page.hero.ctaText || fallback.ctaText,
                        ctaLink: page.hero.ctaLink || fallback.ctaLink,
                        height: page.hero.height || fallback.height,
                    })
                }
            })
            .catch(() => { /* keep fallback */ })
            .finally(() => { if (!cancelled) setIsLoading(false) })
        return () => { cancelled = true }
    }, [slug])

    return { hero, isLoading }
}
