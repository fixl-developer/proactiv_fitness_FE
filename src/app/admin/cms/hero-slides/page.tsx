'use client'
import CMSCrudTable from '@/components/admin/cms/CMSCrudTable'
import { CMSAdminService } from '@/services/cmsService'

export default function HeroSlidesPage() {
    return (
        <CMSCrudTable
            title="Hero Slides"
            description="Manage the hero carousel on the landing page. Add images, titles, and call-to-action buttons."
            fields={[
                { name: 'title', label: 'Title', type: 'text', required: true, minLength: 2, maxLength: 120, showInTable: true },
                { name: 'subtitle', label: 'Subtitle', type: 'text', maxLength: 200 },
                { name: 'image', label: 'Image', type: 'image', required: true, showInTable: true, helpText: 'Upload an image or paste a valid URL' },
                { name: 'fallbackGradient', label: 'Fallback Gradient CSS', type: 'text', placeholder: 'bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800' },
                { name: 'ctaText', label: 'CTA Button Text', type: 'text', maxLength: 40 },
                { name: 'ctaLink', label: 'CTA Button Link', type: 'url', helpText: 'Must start with http:// or https://' },
                { name: 'order', label: 'Display Order', type: 'number', min: 0, max: 999 },
                { name: 'isActive', label: 'Active', type: 'boolean' },
            ]}
            service={CMSAdminService.heroSlides}
            tableColumns={['title', 'image', 'order']}
        />
    )
}
