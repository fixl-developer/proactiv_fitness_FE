'use client'
import CMSCrudTable from '@/components/admin/cms/CMSCrudTable'
import { CMSAdminService } from '@/services/cmsService'

export default function TestimonialsPage() {
    return (
        <CMSCrudTable
            title="Testimonials"
            description="Manage customer testimonials displayed on the landing page. Add reviews, ratings, and customer details."
            fields={[
                { name: 'name', label: 'Name', type: 'name', required: true, minLength: 2, maxLength: 80, showInTable: true },
                { name: 'role', label: 'Role', type: 'text', required: true, minLength: 2, maxLength: 80, showInTable: true },
                { name: 'rating', label: 'Rating (1-5)', type: 'number', required: true, min: 1, max: 5, showInTable: true, helpText: 'Between 1 and 5' },
                { name: 'text', label: 'Testimonial Text', type: 'textarea', required: true, minLength: 10, maxLength: 1000 },
                { name: 'image', label: 'Image', type: 'image' },
                { name: 'fallbackGradient', label: 'Fallback Gradient', type: 'gradient', gradientFormat: 'full', helpText: 'Shown behind the avatar when no photo is uploaded.' },
                { name: 'program', label: 'Program', type: 'text', maxLength: 80, showInTable: true },
                { name: 'order', label: 'Display Order', type: 'number', min: 0, max: 999 },
                { name: 'isActive', label: 'Active', type: 'boolean' },
            ]}
            service={CMSAdminService.testimonials}
            tableColumns={['name', 'role', 'rating', 'program']}
        />
    )
}
