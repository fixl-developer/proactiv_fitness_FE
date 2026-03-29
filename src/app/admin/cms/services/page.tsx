'use client'
import CMSCrudTable from '@/components/admin/cms/CMSCrudTable'
import { CMSAdminService } from '@/services/cmsService'

export default function ServicesPage() {
    return (
        <CMSCrudTable
            title="Service Cards"
            description="Manage the service cards displayed on the landing page. Configure titles, descriptions, images, and links."
            fields={[
                { name: 'title', label: 'Title', type: 'text', required: true, showInTable: true },
                { name: 'description', label: 'Description', type: 'textarea', required: true },
                { name: 'image', label: 'Image URL', type: 'image', required: true, showInTable: true },
                { name: 'emoji', label: 'Emoji', type: 'text' },
                { name: 'features', label: 'Features', type: 'array' },
                { name: 'href', label: 'Link URL', type: 'text', required: true, showInTable: true },
                { name: 'color', label: 'Color', type: 'text' },
                { name: 'gradient', label: 'Gradient', type: 'text' },
                { name: 'order', label: 'Display Order', type: 'number', showInTable: true },
                { name: 'isActive', label: 'Active', type: 'boolean' },
            ]}
            service={CMSAdminService.serviceCards}
            tableColumns={['title', 'image', 'href', 'order']}
        />
    )
}
