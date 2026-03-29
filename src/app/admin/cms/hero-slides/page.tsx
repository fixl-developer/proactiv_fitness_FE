'use client'
import CMSCrudTable from '@/components/admin/cms/CMSCrudTable'
import { CMSAdminService } from '@/services/cmsService'

export default function HeroSlidesPage() {
    return (
        <CMSCrudTable
            title="Hero Slides"
            description="Manage the hero carousel on the landing page. Add images, titles, and call-to-action buttons."
            fields={[
                { name: 'title', label: 'Title', type: 'text', required: true, showInTable: true },
                { name: 'subtitle', label: 'Subtitle', type: 'text' },
                { name: 'image', label: 'Image URL', type: 'image', required: true, showInTable: true },
                { name: 'fallbackGradient', label: 'Fallback Gradient CSS', type: 'text', placeholder: 'bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800' },
                { name: 'ctaText', label: 'CTA Button Text', type: 'text' },
                { name: 'ctaLink', label: 'CTA Button Link', type: 'text' },
                { name: 'order', label: 'Display Order', type: 'number' },
                { name: 'isActive', label: 'Active', type: 'boolean' },
            ]}
            service={CMSAdminService.heroSlides}
            tableColumns={['title', 'image', 'order']}
        />
    )
}
