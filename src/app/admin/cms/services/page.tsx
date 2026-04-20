'use client'
import CMSCrudTable from '@/components/admin/cms/CMSCrudTable'
import { CMSAdminService } from '@/services/cmsService'

export default function ServicesPage() {
    return (
        <CMSCrudTable
            title="Service Cards"
            description="Manage the service cards displayed on the landing page. Configure titles, descriptions, images, and links."
            fields={[
                { name: 'title', label: 'Title', type: 'text', required: true, minLength: 2, maxLength: 120, showInTable: true },
                { name: 'description', label: 'Description', type: 'textarea', required: true, minLength: 10, maxLength: 500 },
                { name: 'image', label: 'Image', type: 'image', required: true, showInTable: true },
                { name: 'emoji', label: 'Emoji', type: 'text', maxLength: 4 },
                { name: 'features', label: 'Features', type: 'array', helpText: 'Add one feature per row' },
                { name: 'href', label: 'Link URL', type: 'text', required: true, showInTable: true, placeholder: '/programs or https://...', helpText: 'Internal path (starts with /) or full URL' },
                { name: 'color', label: 'Color', type: 'text' },
                { name: 'gradient', label: 'Gradient', type: 'text' },
                { name: 'order', label: 'Display Order', type: 'number', min: 0, max: 999, showInTable: true },
                { name: 'isActive', label: 'Active', type: 'boolean' },
            ]}
            service={CMSAdminService.serviceCards}
            tableColumns={['title', 'image', 'href', 'order']}
        />
    )
}
