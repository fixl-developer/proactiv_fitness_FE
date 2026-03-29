'use client'
import CMSCrudTable from '@/components/admin/cms/CMSCrudTable'
import { CMSAdminService } from '@/services/cmsService'

export default function TestimonialsPage() {
    return (
        <CMSCrudTable
            title="Testimonials"
            description="Manage customer testimonials displayed on the landing page. Add reviews, ratings, and customer details."
            fields={[
                { name: 'name', label: 'Name', type: 'text', required: true, showInTable: true },
                { name: 'role', label: 'Role', type: 'text', required: true, showInTable: true },
                { name: 'rating', label: 'Rating', type: 'number', required: true, showInTable: true },
                { name: 'text', label: 'Testimonial Text', type: 'textarea', required: true },
                { name: 'image', label: 'Image URL', type: 'image' },
                { name: 'fallbackGradient', label: 'Fallback Gradient CSS', type: 'text' },
                { name: 'program', label: 'Program', type: 'text', showInTable: true },
                { name: 'order', label: 'Display Order', type: 'number' },
                { name: 'isActive', label: 'Active', type: 'boolean' },
            ]}
            service={CMSAdminService.testimonials}
            tableColumns={['name', 'role', 'rating', 'program']}
        />
    )
}
